import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingMethods } from '../entities/ShippingMethods';

@Injectable()
export class ShippingMethodsService {
  constructor(
    @InjectRepository(ShippingMethods)
    private shippingMethodsRepository: Repository<ShippingMethods>,
  ) {}

  async create(
    createShippingMethodDto: CreateShippingMethodDto,
    createdBy: string,
  ): Promise<ShippingMethods> {
    try {
      const shippingMethod = this.shippingMethodsRepository.create({
        ...createShippingMethodDto,
        createdBy,
        updatedBy: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return await this.shippingMethodsRepository.save(shippingMethod);
    } catch (error) {
      throw new InternalServerErrorException('Error creating shipping method');
    }
  }

  async findAll(): Promise<ShippingMethods[]> {
    try {
      return await this.shippingMethodsRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching shipping methods');
    }
  }

  async findOne(id: number): Promise<ShippingMethods> {
    try {
      const shippingMethod = await this.shippingMethodsRepository.findOneBy({
        shippingMethodId: id,
      });
      if (!shippingMethod) {
        throw new NotFoundException(`Shipping method with ID ${id} not found`);
      }
      return shippingMethod;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching shipping method');
    }
  }

  async update(
    id: number,
    updateShippingMethodDto: UpdateShippingMethodDto,
    updatedBy: string,
  ): Promise<ShippingMethods> {
    try {
      const shippingMethod = await this.findOne(id);
      this.shippingMethodsRepository.merge(shippingMethod, {
        ...updateShippingMethodDto,
        updatedBy,
        updatedAt: new Date(),
      });
      return await this.shippingMethodsRepository.save(shippingMethod);
    } catch (error) {
      throw new InternalServerErrorException('Error updating shipping method');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.shippingMethodsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Shipping method with ID ${id} not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Error deleting shipping method');
    }
  }
}
