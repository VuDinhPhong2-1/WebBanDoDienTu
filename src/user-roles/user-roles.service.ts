import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoles } from '../entities/UserRoles';
import { Users } from '../entities/Users';
import { Roles } from '../entities/Roles';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRoles)
    private readonly userRolesRepository: Repository<UserRoles>,

    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {}

  // Assign a role to a user
  async assignRoleToUser(
    userId: number,
    roleId: number,
    createdBy?: number,
  ): Promise<UserRoles> {
    try {
      // Check if the user exists
      const user = await this.usersRepository.findOneBy({ userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if the role exists
      const role = await this.rolesRepository.findOneBy({ roleId });
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      // Create a new UserRoles entry and save it
      const userRole = this.userRolesRepository.create({
        userId,
        roleId,
        createdBy: createdBy, // You can replace this logic for createdBy
        updatedBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.userRolesRepository.save(userRole);
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        `Failed to assign role: ${error.message}`,
      );
    }
  }

  // Remove a role from a user
  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    try {
      // Find the role assigned to the user
      const userRole = await this.userRolesRepository.findOne({
        where: { userId, roleId },
      });

      // If no role is found, throw an error
      if (!userRole) {
        throw new NotFoundException(
          `Role with ID ${roleId} not assigned to user with ID ${userId}`,
        );
      }

      // Remove the role
      await this.userRolesRepository.remove(userRole);
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        `Failed to remove role: ${error.message}`,
      );
    }
  }

  // Get all roles assigned to a specific user
  async getUserRoles(userId: number): Promise<UserRoles[]> {
    try {
      // Find all roles associated with the user
      const userRoles = await this.userRolesRepository.find({
        where: { userId },
        relations: ['role'], // Ensure to load the related role information
      });

      // If no roles are found, throw an error
      if (!userRoles || userRoles.length === 0) {
        throw new NotFoundException(`User with ID ${userId} has no roles`);
      }

      return userRoles;
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        `Failed to get user roles: ${error.message}`,
      );
    }
  }
}
