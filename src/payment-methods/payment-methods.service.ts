import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethods } from '../entities/PaymentMethods';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethods)
    private paymentMethodsRepository: Repository<PaymentMethods>,
  ) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
    userId: number,
  ): Promise<PaymentMethods> {
    try {
      const paymentMethod = this.paymentMethodsRepository.create({
        ...createPaymentMethodDto,
        createdBy: userId,
        updatedBy: userId,
      });
      return await this.paymentMethodsRepository.save(paymentMethod);
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo phương thức thanh toán',
      );
    }
  }

  async findAll(): Promise<PaymentMethods[]> {
    try {
      return await this.paymentMethodsRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi lấy phương thức thanh toán',
      );
    }
  }

  async findOneById(id: number): Promise<PaymentMethods> {
    try {
      const paymentMethod = await this.paymentMethodsRepository.findOneBy({
        paymentMethodId: id,
      });
      if (!paymentMethod) {
        throw new NotFoundException(
          `Phương thức thanh toán với ID ${id} không tồn tại`,
        );
      }
      return paymentMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Lỗi khi lấy phương thức thanh toán',
      );
    }
  }
  async findOneByName(name: string): Promise<PaymentMethods> {
    try {
      const paymentMethod = await this.paymentMethodsRepository.findOneBy({
        name: name, // Tìm theo name
      });
      if (!paymentMethod) {
        throw new NotFoundException(
          `Phương thức thanh toán với tên ${name} không tồn tại`,
        );
      }
      return paymentMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Lỗi khi lấy phương thức thanh toán',
      );
    }
  }

  async update(
    id: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
    userId: number,
  ): Promise<PaymentMethods> {
    try {
      const paymentMethod = await this.findOneById(id);
      this.paymentMethodsRepository.merge(paymentMethod, {
        ...updatePaymentMethodDto,
        updatedBy: userId,
        updatedAt: new Date(),
      });
      return await this.paymentMethodsRepository.save(paymentMethod);
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi cập nhật phương thức thanh toán',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.paymentMethodsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Phương thức thanh toán với ID ${id} không tồn tại`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Lỗi khi xoá phương thức thanh toán',
      );
    }
  }
}
