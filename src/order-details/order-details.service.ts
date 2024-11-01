import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrderDetailsDto } from './dto/create-order-details.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';
import { OrderDetails } from '../entities/OrderDetails';
import { Products } from '../entities/Products';
import { ProductImagesService } from '../product-images/product-images.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
    private readonly productImagesService: ProductImagesService,
    private readonly productsService: ProductsService,
  ) {}

  async create(
    createOrderDetailsDto: CreateOrderDetailsDto,
    manager: EntityManager,
  ): Promise<OrderDetails> {
    try {
      // Tạo mới chi tiết đơn hàng từ DTO
      const orderDetail = manager.create(OrderDetails, {
        ...createOrderDetailsDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Lưu chi tiết đơn hàng vào cơ sở dữ liệu
      const savedOrderDetail = await manager.save(orderDetail);
      return savedOrderDetail;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Lỗi khi tạo chi tiết đơn hàng',
      );
    }
  }

  async findAll(): Promise<OrderDetails[]> {
    return await this.orderDetailsRepository.find();
  }

  async findAllByOrderId(orderId: number) {
    const orderDetails = await this.orderDetailsRepository.find({
      where: { orderId },
    });

    if (orderDetails.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy chi tiết đơn hàng nào với Order ID ${orderId}`,
      );
    }

    const productIds = orderDetails.map((od) => od.productId);

    // Lấy danh sách hình ảnh cho các sản phẩm
    const productImages =
      await this.productImagesService.findImagesByProductIds(productIds);

    // Lấy danh sách tên sản phẩm cho các sản phẩm
    const products = await this.productsService.findByIds(productIds);

    // Tạo Map để lưu trữ hình ảnh sản phẩm theo productId
    const productImagesMap = new Map<number, string[]>();
    productImages.forEach((image) => {
      if (!productImagesMap.has(image.productId)) {
        productImagesMap.set(image.productId, []);
      }
      productImagesMap.get(image.productId)?.push(image.imageUrl);
    });

    // Tạo Map để lưu trữ tên sản phẩm theo productId
    const productNamesMap = new Map<number, string>();
    products.forEach((product) => {
      productNamesMap.set(product.productId, product.name);
    });

    // Tạo kết quả với hình ảnh và tên sản phẩm
    const result = orderDetails.map((od) => {
      const images = productImagesMap.get(od.productId) || [];
      const productName =
        productNamesMap.get(od.productId) || 'Unknown Product';
      return {
        ...od,
        images,
        productName,
      };
    });

    return result;
  }

  // async update(
  //   id: number,
  //   updateOrderDetailsDto: UpdateOrderDetailsDto,
  //   updatedBy: string,
  // ): Promise<OrderDetails> {
  //   const orderDetail = await this.findOne(id);
  //   this.orderDetailsRepository.merge(orderDetail, {
  //     ...updateOrderDetailsDto,
  //     updatedBy,
  //     updatedAt: new Date(),
  //   });
  //   return await this.orderDetailsRepository.save(orderDetail);
  // }

  async remove(id: number): Promise<void> {
    const result = await this.orderDetailsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Chi tiết đơn hàng với ID ${id} không tồn tại`,
      );
    }
  }

  async getProductsByOrderId(orderId: number) {
    const query = this.orderDetailsRepository
      .createQueryBuilder('od')
      .innerJoin(Products, 'p', 'p.productId = od.productId')
      .where('od.orderId = :orderId', { orderId })
      .select([
        'p.name AS name',
        'od.quantity AS quantity',
        'od.unitPrice AS unitPrice',
        'od.discountPercent AS discountPercent',
        'od.totalPrice AS totalPrice',
        'od.productId AS productId',
      ]);

    const orderDetails = await query.getRawMany();

    if (orderDetails.length === 0) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
    }

    const productIds = orderDetails.map((orderDetail) => orderDetail.productId);

    const productImages =
      await this.productImagesService.findImagesByProductIds(productIds);

    const groupedImages = new Map<number, string[]>();

    productImages.forEach((image) => {
      if (!groupedImages.has(image.productId)) {
        groupedImages.set(image.productId, []);
      }
      groupedImages.get(image.productId).push(image.imageUrl);
    });
    const orderDetailsWithImages = orderDetails.map((orderDetail) => ({
      ...orderDetail,
      images: groupedImages.get(orderDetail.productId) || [],
    }));

    return { orderDetails: orderDetailsWithImages };
  }
}
