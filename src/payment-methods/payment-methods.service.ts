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
      throw new InternalServerErrorException('Error creating payment method');
    }
  }

  async findAll(): Promise<PaymentMethods[]> {
    try {
      return await this.paymentMethodsRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching payment methods');
    }
  }

  async findOne(id: number): Promise<PaymentMethods> {
    try {
      const paymentMethod = await this.paymentMethodsRepository.findOneBy({
        paymentMethodId: id,
      });
      if (!paymentMethod) {
        throw new NotFoundException(`Payment method with ID ${id} not found`);
      }
      return paymentMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching payment method');
    }
  }

  async update(
    id: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
    userId: number,
  ): Promise<PaymentMethods> {
    try {
      const paymentMethod = await this.findOne(id);
      this.paymentMethodsRepository.merge(paymentMethod, {
        ...updatePaymentMethodDto,
        updatedBy: userId,
        updatedAt: new Date(),
      });
      return await this.paymentMethodsRepository.save(paymentMethod);
    } catch (error) {
      throw new InternalServerErrorException('Error updating payment method');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.paymentMethodsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Payment method with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting payment method');
    }
  }
}
