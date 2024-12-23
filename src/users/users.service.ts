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
    const { fullName, password, email, phone } = signupUserDto;

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
      fullName,
      passwordHash: hashedPassword,
      email,
      phone,
    });

    const savedUser = await this.usersRepository.save(newUser);

    // Assign default role (roleId = user) to the newly created user
    const defaultRole = Role.CUSTOMER; // Default to Viewer role
    const role = await this.rolesService.findByRoleName(defaultRole);
    await this.userRolesService.assignRoleToUser(savedUser.userId, role.roleId);

    return savedUser;
  }

  async findAll(page: number, userName?: string) {
    const itemsPerPage = 10;
    const skip = (page - 1) * itemsPerPage;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (userName) {
      queryBuilder.where('user.fullName LIKE :userName', {
        userName: `%${userName}%`,
      });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(itemsPerPage)
      .getManyAndCount();

    // Map through each user to get their roles
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const roles = await this.getUserRoles(user.userId);
        return {
          ...user,
          roles,
        };
      }),
    );

    return {
      usersWithRoles,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / itemsPerPage),
      itemsPerPage,
    };
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
        select: [
          'userId',
          'username',
          'email',
          'phone',
          'fullName',
          'isActive',
          'dateOfBirth',
          'createdBy',
          'updatedBy',
          'createdAt',
          'updatedAt',
          'profilePicture',
        ],
      });

      if (!user) throw new NotFoundException('Không tồn tại user');

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

  async updateUserRoles(userId: number, roleIds: number[], adminId: number) {
    try {
      // Check if user exists
      const user = await this.findOne(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Validate all roleIds exist
      for (const roleId of roleIds) {
        const role = await this.rolesService.findOne(roleId);
        if (!role) {
          throw new BadRequestException(`Role with ID ${roleId} not found`);
        }
      }

      // Get the current roles of the user
      const currentRoles = await this.getUserRoles(userId);
      const currentRoleIds = currentRoles.map((role) => role.roleId);

      // Check if there are any role IDs to remove
      const rolesToRemove = currentRoleIds.filter(
        (roleId) => !roleIds.includes(roleId),
      );
      const rolesToAdd = roleIds.filter(
        (roleId) => !currentRoleIds.includes(roleId),
      );

      // Begin transaction
      await this.userRolesRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // If there are roles to remove, delete them
          if (rolesToRemove.length > 0) {
            await transactionalEntityManager
              .createQueryBuilder()
              .delete()
              .from(UserRoles)
              .where('userId = :userId AND roleId IN (:...roleIds)', {
                userId,
                roleIds: rolesToRemove,
              })
              .execute();
          }

          // If there are roles to add, add them
          for (const roleId of rolesToAdd) {
            const userRole = new UserRoles();
            userRole.userId = userId;
            userRole.roleId = roleId;
            userRole.createdBy = adminId;
            userRole.updatedBy = adminId;
            await transactionalEntityManager.save(UserRoles, userRole);
          }
        },
      );

      // Get updated roles
      const updatedRoles = await this.getUserRoles(userId);

      return {
        message: 'User roles updated successfully',
        userId,
        roles: updatedRoles,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error(`Failed to update user roles: ${error.message}`);
    }
  }

  async assignRolesToUser(userId: number, roleIds: number[], adminId: number) {
    try {
      const user = await this.findOne(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Validate all roleIds exist
      for (const roleId of roleIds) {
        const role = await this.rolesService.findOne(roleId);
        if (!role) {
          throw new BadRequestException(`Role with ID ${roleId} not found`);
        }
      }

      // Create new user roles
      const newUserRoles = await Promise.all(
        roleIds.map(async (roleId) => {
          const userRole = new UserRoles();
          userRole.userId = userId;
          userRole.roleId = roleId;
          userRole.createdBy = adminId;
          userRole.updatedBy = adminId;
          return await this.userRolesRepository.save(userRole);
        }),
      );

      // Get updated roles
      const updatedRoles = await this.getUserRoles(userId);

      return {
        message: 'Roles assigned to user successfully',
        userId,
        roles: updatedRoles,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error(`Failed to assign roles to user: ${error.message}`);
    }
  }
}
