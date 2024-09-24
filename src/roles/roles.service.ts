import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from '../entities/Roles';
import { Users } from '../entities/Users';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  async create(createRoleDto: CreateRoleDto, user: Users): Promise<Roles> {
    const role = this.rolesRepository.create({
      ...createRoleDto,
      createdBy: user.userId,
      updatedBy: user.userId,
    });

    try {
      return await this.rolesRepository.save(role);
    } catch (error) {
      throw new InternalServerErrorException('Error creating role');
    }
  }

  async findAll(): Promise<Roles[]> {
    return await this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Roles> {
    const role = await this.rolesRepository.findOne({ where: { roleId: id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Roles> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    try {
      return await this.rolesRepository.save(role);
    } catch (error) {
      throw new InternalServerErrorException('Error updating role');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }

  async findByRoleName(roleName: string): Promise<Roles> {
    try {
      const role = await this.rolesRepository.findOne({
        where: { roleName: roleName },
      });
      if (!role) {
        throw new NotFoundException(`Role with name ${roleName} not found`);
      }
      return role;
    } catch (error) {
      throw new InternalServerErrorException('Error finding role by name');
    }
  }
}
