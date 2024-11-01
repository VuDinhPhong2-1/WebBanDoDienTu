import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupUserDto } from './dto/signup-user.dto';
import { Users } from '../entities/Users';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { UserRolesService } from '../user-roles/user-roles.service';
import { Roles } from '../entities/Roles';
import { UserRoles } from '../entities/UserRoles';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { RolesService } from '../roles/roles.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(UserRoles)
    private readonly userRolesRepository: Repository<UserRoles>,

    private readonly userRolesService: UserRolesService,
    private readonly rolesService: RolesService,
  ) {}

  // Hash password function
  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  // Sign up new user and assign default role (roleId = 3 for Viewer)
  async signup(signupUserDto: SignupUserDto): Promise<Users> {
    const { username, password, email, phone } = signupUserDto;

    // Check if email already exists
    const isExistEmail = await this.usersRepository.findOne({
      where: { email },
    });
    if (isExistEmail) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống`);
    }

    // Check if phone already exists (if phone is provided)
    if (phone) {
      const isExistPhone = await this.usersRepository.findOne({
        where: { phone },
      });
      if (isExistPhone) {
        throw new BadRequestException(
          `Phone number: ${phone} đã tồn tại trên hệ thống`,
        );
      }
    }

    // Hash the password before saving
    const hashedPassword = this.hashPassword(password);

    // Create new user
    const newUser = this.usersRepository.create({
      username,
      passwordHash: hashedPassword,
      email,
      phone, // Add phone field here
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Assign default role (roleId = user) to the newly created user
    const defaultRole = Role.CUSTOMER; // Default to Viewer role
    const role = await this.rolesService.findByRoleName(defaultRole);
    await this.userRolesService.assignRoleToUser(savedUser.userId, role.roleId);

    return savedUser;
  }

  async findAll(
    filterDto: GetUsersFilterDto,
  ): Promise<{ data: Users[]; total: number }> {
    const { username, email, page = 1, limit = 10 } = filterDto;

    // Create a query builder to construct the query with pagination and filtering
    const query = this.usersRepository.createQueryBuilder('user');

    // Select only the specific fields you want to return
    query.select([
      'user.userId',
      'user.username',
      'user.email',
      'user.phone',
      'user.fullName',
      'user.isActive',
      'user.dateOfBirth',
      'user.createdBy',
      'user.updatedBy',
    ]);

    // If a username is provided, add a filtering condition
    if (username) {
      query.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    // If an email is provided, add a filtering condition
    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    // Get the total count of results that match the filters
    const total = await query.getCount();

    // Add pagination
    query.skip((page - 1) * limit).take(limit);

    // Execute the query
    const data = await query.getMany();

    return { data, total };
  }

  // Find user by ID
  async findOne(id: number): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ userId: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Validate password
  async isValidPassword(password: string, hash: string): Promise<boolean> {
    return compareSync(password, hash);
  }

  // Remove a user by ID and clean up user roles
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    // Remove roles assigned to the user
    const roles = await this.userRolesService.getUserRoles(user.userId);
    if (roles.length > 0) {
      for (const role of roles) {
        await this.userRolesService.removeRoleFromUser(
          user.userId,
          role.roleId,
        );
      }
    }
    // Remove the user
    await this.usersRepository.remove(user);
  }

  async findOneByUsername(username: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { username: username },
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { email: email },
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userId: id },
      });
      if (!user) new NotFoundException('Không tồn tại user');
      const roles = await this.getUserRoles(user.userId);
      return { user, roles };
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }
  // Update user's refresh token
  async updateUserRefreshToken(refreshToken: string, userId: number) {
    try {
      return await this.usersRepository.update(userId, {
        refreshToken: refreshToken,
      });
    } catch (error) {
      throw new Error(
        `Failed to update refresh_token for user: ${error.message}`,
      );
    }
  }

  // Find user by refresh token
  async findOneByRefreshToken(refreshToken: string) {
    return this.usersRepository.findOne({
      where: { refreshToken: refreshToken },
    });
  }
  async getUserRoles(userId: number): Promise<Partial<Roles>[]> {
    // Query UserRoles and Roles tables without using relationships
    const userRoles = await this.userRolesRepository
      .createQueryBuilder('userRoles')
      .innerJoin('Roles', 'role', 'userRoles.roleId = role.roleId')
      .where('userRoles.userId = :userId', { userId })
      .select(['role.roleId', 'role.roleName', 'role.description'])
      .getRawMany();

    if (!userRoles || userRoles.length === 0) {
      throw new NotFoundException('No roles found for this user');
    }

    // Returns a list of roles with Partial<Roles>
    return userRoles.map((userRole) => ({
      roleId: userRole.role_RoleID,
      roleName: userRole.role_RoleName,
      description: userRole.role_Description,
    }));
  }
  async createGoogleUser(userData: Partial<Users>): Promise<Users> {
    const user = this.usersRepository.create(userData);
    return user;
  }

  async saveGoogleUser(user: Users): Promise<Users> {
    return await this.usersRepository.save(user);
  }
}
