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

  // Gán một vai trò cho người dùng
  async assignRoleToUser(
    userId: number,
    roleId: number,
    adminId?: number,
  ): Promise<UserRoles> {
    try {
      // Kiểm tra xem người dùng có tồn tại hay không
      const user = await this.usersRepository.findOneBy({ userId });
      if (!user) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID ${userId}.`,
        );
      }

      // Kiểm tra xem vai trò có tồn tại hay không
      const role = await this.rolesRepository.findOneBy({ roleId });
      if (!role) {
        throw new NotFoundException(`Không tìm thấy vai trò với ID ${roleId}.`);
      }

      // Tạo mới một mục UserRoles và lưu vào cơ sở dữ liệu
      const userRole = this.userRolesRepository.create({
        userId,
        roleId,
        createdBy: adminId, // Bạn có thể thay đổi logic cho createdBy
        updatedBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.userRolesRepository.save(userRole);
    } catch (error) {
      // Xử lý các lỗi không mong muốn
      throw new InternalServerErrorException(
        `Không thể gán vai trò: ${error.message}`,
      );
    }
  }

  // Xóa một vai trò khỏi người dùng
  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    try {
      // Tìm vai trò được gán cho người dùng
      const userRole = await this.userRolesRepository.findOne({
        where: { userId, roleId },
      });

      // Nếu không tìm thấy vai trò, ném ra lỗi
      if (!userRole) {
        throw new NotFoundException(
          `Vai trò với ID ${roleId} chưa được gán cho người dùng với ID ${userId}.`,
        );
      }

      // Xóa vai trò
      await this.userRolesRepository.remove(userRole);
    } catch (error) {
      // Xử lý các lỗi không mong muốn
      throw new InternalServerErrorException(
        `Không thể xóa vai trò: ${error.message}`,
      );
    }
  }

  // Lấy tất cả các vai trò được gán cho một người dùng cụ thể
  async getUserRoles(userId: number): Promise<UserRoles[]> {
    try {
      // Tìm tất cả các vai trò liên kết với người dùng
      const userRoles = await this.userRolesRepository.find({
        where: { userId },
        relations: ['role'], // Đảm bảo tải thông tin vai trò liên quan
      });

      // Nếu không tìm thấy vai trò, ném ra lỗi
      if (!userRoles || userRoles.length === 0) {
        throw new NotFoundException(
          `Người dùng với ID ${userId} không có vai trò nào.`,
        );
      }

      return userRoles;
    } catch (error) {
      // Xử lý các lỗi không mong muốn
      throw new InternalServerErrorException(
        `Không thể lấy vai trò của người dùng: ${error.message}`,
      );
    }
  }
}
