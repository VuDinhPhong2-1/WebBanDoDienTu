// products.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { Products } from '../entities/Products';
import { Discounts } from '../entities/Discounts';
import { SalePrices } from '../entities/SalePrices';
import { ProductCategories } from '../entities/ProductCategories';
import { Categories } from '../entities/Categories';

import { CreateProductWithSalePriceAndCategoriesDto } from './dto/create-product-with-sale-price-and-categories.dto';
import { UpdateProductWithSalePriceAndCategoriesDto } from './dto/update-product-with-sale-price-and-categories.dto';
import { Users } from '../entities/Users';
import { SalePricesService } from '../sale-prices/sale-prices.service';
import { CreateSalePriceDto } from '../sale-prices/dto/create-sale-price.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,

    @InjectRepository(Discounts)
    private readonly discountsRepository: Repository<Discounts>,

    @InjectRepository(SalePrices)
    private readonly salePricesRepository: Repository<SalePrices>,

    @InjectRepository(ProductCategories)
    private readonly productCategoriesRepository: Repository<ProductCategories>,

    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,

    private readonly salePricesService: SalePricesService,
  ) {}

  // Tạo mới sản phẩm với giá bán và liên kết danh mục
  async create(
    createProductWithSalePriceAndCategoriesDto: CreateProductWithSalePriceAndCategoriesDto,
    user: Users,
  ): Promise<Products> {
    const { product, salePrice, categoryIds } =
      createProductWithSalePriceAndCategoriesDto;

    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra tồn tại và tính hợp lệ của các categoryId
      if (categoryIds && categoryIds.length > 0) {
        const existingCategories = await queryRunner.manager.find(Categories, {
          where: { categoryId: In(categoryIds), isActive: true },
        });

        if (existingCategories.length !== categoryIds.length) {
          throw new BadRequestException('Một hoặc nhiều danh mục không hợp lệ');
        }
      }

      // Tạo sản phẩm mới
      const newProduct = this.productsRepository.create({
        ...product,
        createdBy: user.userId,
      });
      const savedProduct = await queryRunner.manager.save(newProduct);

      // Tạo giá bán cho sản phẩm
      const newSalePrice: CreateSalePriceDto = {
        ...salePrice,
        productId: savedProduct.productId,
      };
      await this.salePricesService.create(newSalePrice, queryRunner);

      // Tạo liên kết với các danh mục
      if (categoryIds && categoryIds.length > 0) {
        const productCategories = categoryIds.map((categoryId) =>
          this.productCategoriesRepository.create({
            productId: savedProduct.productId,
            categoryId,
            createdBy: user.userId,
          }),
        );
        await queryRunner.manager.save(productCategories);
      }

      await queryRunner.commitTransaction();
      return savedProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || 'Không thể tạo sản phẩm');
    } finally {
      await queryRunner.release();
    }
  }

  // Cập nhật sản phẩm với giá bán và liên kết danh mục
  async update(
    productId: number,
    updateProductWithSalePriceAndCategoriesDto: UpdateProductWithSalePriceAndCategoriesDto,
    user: Users,
  ): Promise<Products> {
    const { product, salePrice, categoryIds } =
      updateProductWithSalePriceAndCategoriesDto;

    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm sản phẩm cần cập nhật
      const existingProduct = await queryRunner.manager.findOne(Products, {
        where: { productId },
      });
      if (!existingProduct) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Cập nhật thông tin sản phẩm
      Object.assign(existingProduct, product, { updatedBy: user.userId });
      const updatedProduct = await queryRunner.manager.save(existingProduct);

      // Cập nhật giá bán nếu có
      if (salePrice) {
        const newSalePrice: CreateSalePriceDto = {
          ...salePrice,
          productId: updatedProduct.productId,
        };
        await this.salePricesService.create(newSalePrice, queryRunner);
      }

      // Cập nhật liên kết danh mục nếu có
      if (categoryIds) {
        // Kiểm tra tồn tại và tính hợp lệ của các categoryId
        if (categoryIds.length > 0) {
          const existingCategories = await queryRunner.manager.find(
            Categories,
            {
              where: { categoryId: In(categoryIds), isActive: true },
            },
          );

          if (existingCategories.length !== categoryIds.length) {
            throw new BadRequestException(
              'Một hoặc nhiều danh mục không hợp lệ',
            );
          }
        }

        // Xóa các liên kết hiện tại
        await queryRunner.manager.delete(ProductCategories, { productId });

        // Tạo lại các liên kết mới
        if (categoryIds && categoryIds.length > 0) {
          const productCategories = categoryIds.map((categoryId) =>
            this.productCategoriesRepository.create({
              productId: updatedProduct.productId,
              categoryId,
              updatedBy: user.userId,
            }),
          );
          await queryRunner.manager.save(productCategories);
        }
      }

      await queryRunner.commitTransaction();
      return updatedProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error.message || 'Không thể cập nhật sản phẩm',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Lấy tất cả sản phẩm kèm thông tin danh mục và giá
  async findAll(): Promise<any[]> {
    try {
      const products = await this.productsRepository.find();

      const productIds = products.map((p) => p.productId);
      const productCategories = await this.productCategoriesRepository.find({
        where: { productId: In(productIds) },
      });

      const categoryIds = productCategories.map((pc) => pc.categoryId);
      const categories = await this.categoriesRepository.find({
        where: { categoryId: In(categoryIds) },
      });

      const categoryMap = new Map<number, Categories>();
      categories.forEach((category) => {
        categoryMap.set(category.categoryId, category);
      });

      const now = new Date();

      const salePrices = await this.salePricesRepository.find({
        where: { productId: In(productIds) },
      });

      const discounts = await this.discountsRepository.find({
        where: {
          discountId: In(
            products.map((p) => p.discountId).filter((id) => id !== null),
          ),
        },
      });

      const discountMap = new Map<number, Discounts>();
      discounts.forEach((discount) => {
        discountMap.set(discount.discountId, discount);
      });

      // Tạo một map cho sale prices theo productId
      const salePriceMap = new Map<number, SalePrices[]>();
      salePrices.forEach((sp) => {
        if (!salePriceMap.has(sp.productId)) {
          salePriceMap.set(sp.productId, []);
        }
        salePriceMap.get(sp.productId)?.push(sp);
      });

      const result = products.map((product) => {
        // Lấy các sale price của sản phẩm
        const spList = salePriceMap.get(product.productId) || [];

        // Lấy giá gốc
        const originalSalePrice = spList.reduce(
          (prev, current) =>
            prev.applyDate < current.applyDate ? prev : current,
          spList[0] || { price: 0, applyDate: new Date(0) },
        );
        const originalPrice = originalSalePrice.price;

        // Lấy giá hiện tại
        const currentSalePrice = spList
          .filter((sp) => sp.startDate <= now && sp.endDate >= now)
          .sort((a, b) => b.applyDate.getTime() - a.applyDate.getTime())[0];
        const currentPrice = currentSalePrice
          ? currentSalePrice.price
          : originalPrice;

        // Áp dụng chiết khấu nếu có
        let discountedPrice = currentPrice;
        if (product.discountId) {
          const discount = discountMap.get(product.discountId);
          if (
            discount &&
            discount.isActive &&
            discount.startDate <= now &&
            discount.endDate >= now
          ) {
            discountedPrice =
              currentPrice - currentPrice * (discount.discountPercent / 100);
          }
        }

        // Lấy các danh mục của sản phẩm
        const pcs = productCategories.filter(
          (pc) => pc.productId === product.productId,
        );
        const productCategoriesList = pcs.map((pc) =>
          categoryMap.get(pc.categoryId),
        );

        return {
          ...product,
          originalPrice,
          currentPrice,
          discountedPrice,
          categories: productCategoriesList,
        };
      });

      return result;
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách sản phẩm');
    }
  }

  // Lấy thông tin một sản phẩm cụ thể kèm thông tin danh mục và giá
  async findOne(productId: number): Promise<any> {
    try {
      const product = await this.productsRepository.findOne({
        where: { productId },
      });
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      const now = new Date();

      // Lấy giá gốc
      const originalSalePrice = await this.salePricesRepository.findOne({
        where: { productId: product.productId },
        order: { applyDate: 'ASC' },
      });
      const originalPrice = originalSalePrice ? originalSalePrice.price : 0;

      // Lấy giá hiện tại
      const currentSalePrice = await this.salePricesRepository.findOne({
        where: {
          productId: product.productId,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
        order: { applyDate: 'DESC' },
      });
      const currentPrice = currentSalePrice
        ? currentSalePrice.price
        : originalPrice;

      // Áp dụng chiết khấu nếu có
      let discountedPrice = currentPrice;
      if (product.discountId) {
        const discount = await this.discountsRepository.findOne({
          where: { discountId: product.discountId },
        });

        if (
          discount &&
          discount.isActive &&
          discount.startDate <= now &&
          discount.endDate >= now
        ) {
          discountedPrice =
            currentPrice - currentPrice * (discount.discountPercent / 100);
        }
      }

      // Lấy các ProductCategories liên quan
      const pcs = await this.productCategoriesRepository.find({
        where: { productId: product.productId },
      });

      const categoryIds = pcs.map((pc) => pc.categoryId);
      const categories = await this.categoriesRepository.find({
        where: { categoryId: In(categoryIds) },
      });

      return {
        ...product,
        originalPrice,
        currentPrice,
        discountedPrice,
        categories,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Xóa sản phẩm kèm các liên kết danh mục và giá bán
  async remove(productId: number): Promise<void> {
    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Products, {
        where: { productId },
      });
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      // Xóa các liên kết trong ProductCategories
      await queryRunner.manager.delete(ProductCategories, { productId });

      // Xóa giá bán liên quan
      await queryRunner.manager.delete(SalePrices, { productId });

      // Xóa sản phẩm
      await queryRunner.manager.remove(product);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Không thể xóa sản phẩm');
    } finally {
      await queryRunner.release();
    }
  }
}
