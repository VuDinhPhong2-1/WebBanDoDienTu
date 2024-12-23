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

  async findAll(page: number = 1, roleName: string = '') {
    const limit = 10; // Số vai trò trên mỗi trang
    const offset = (page - 1) * limit; // Tính vị trí bắt đầu (offset)

    // Tạo query builder
    const queryBuilder = this.rolesRepository.createQueryBuilder('role');

    // Lọc theo roleName nếu có
    if (roleName) {
      queryBuilder.where('role.name LIKE :roleName', {
        roleName: `%${roleName}%`,
      });
    }

    // Phân trang
    queryBuilder.skip(offset).take(limit);

    // Lấy dữ liệu và tổng số vai trò
    const [roles, total] = await queryBuilder.getManyAndCount();

    // Trả về kết quả với thông tin phân trang
    return {
      result: roles,
      total, // Tổng số vai trò
      currentPage: page, // Trang hiện tại
      totalPages: Math.ceil(total / limit), // Tổng số trang
    };
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
