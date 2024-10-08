import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Connection } from 'typeorm';
import { Products } from '../entities/Products';
import { Discounts } from '../entities/Discounts';
import { SalePrices } from '../entities/SalePrices';
import { ProductCategories } from '../entities/ProductCategories';
import { Categories } from '../entities/Categories';
import { Users } from '../entities/Users';
import { CreateProductWithSalePriceAndCategoriesDto } from './dto/create-product-with-sale-price-and-categories.dto';
import { UpdateProductWithSalePriceAndCategoriesDto } from './dto/update-product-with-sale-price-and-categories.dto';
import { SalePricesService } from '../sale-prices/sale-prices.service';
import { CreateSalePriceDto } from '../sale-prices/dto/create-sale-price.dto';
import { calculatePrices } from '../utils/price-calculation';

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
    createProductDto: CreateProductWithSalePriceAndCategoriesDto,
    user: Users,
  ): Promise<Products> {
    const { product, salePrice, categoryIds } = createProductDto;

    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Kiểm tra tồn tại và tính hợp lệ của các categoryIds
      if (categoryIds?.length) {
        const existingCategories = await queryRunner.manager.find(Categories, {
          where: { categoryId: In(categoryIds), isActive: true },
        });

        if (existingCategories.length !== categoryIds.length) {
          throw new BadRequestException('Một hoặc nhiều danh mục không hợp lệ');
        }
      }

      // Kiểm tra tính hợp lệ của discountId
      if (product.discountId) {
        const existingDiscount = await queryRunner.manager.findOne(Discounts, {
          where: { discountId: product.discountId, isActive: true },
        });

        if (!existingDiscount) {
          throw new BadRequestException('Discount ID không hợp lệ');
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
      if (categoryIds?.length) {
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
    updateProductDto: UpdateProductWithSalePriceAndCategoriesDto,
    user: Users,
  ): Promise<Products> {
    const { product, salePrice, categoryIds } = updateProductDto;

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
        // Kiểm tra tồn tại và tính hợp lệ của các categoryIds
        if (categoryIds.length) {
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
        if (categoryIds.length) {
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

  // Lấy danh sách sản phẩm
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

      const salePrices = await this.salePricesRepository.find({
        where: { productId: In(productIds) },
      });

      const salePriceMap = new Map<number, SalePrices[]>();
      salePrices.forEach((sp) => {
        if (!salePriceMap.has(sp.productId)) {
          salePriceMap.set(sp.productId, []);
        }
        salePriceMap.get(sp.productId)?.push(sp);
      });

      const discounts = await this.discountsRepository.find({
        where: {
          discountId: In(products.map((p) => p.discountId).filter(Boolean)),
        },
      });

      const discountMap = new Map<number, Discounts>();
      discounts.forEach((discount) => {
        discountMap.set(discount.discountId, discount);
      });

      const now = new Date();

      const result = products.map((product) => {
        const prices = calculatePrices(
          product,
          salePriceMap.get(product.productId) || [],
          discountMap,
          now,
        );

        const pcs = productCategories.filter(
          (pc) => pc.productId === product.productId,
        );
        const productCategoriesList = Array.from(
          new Set(pcs.map((pc) => categoryMap.get(pc.categoryId))),
        );

        return {
          ...product,
          ...prices,
          categories: productCategoriesList,
        };
      });

      return result;
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách sản phẩm');
    }
  }

  // Lấy thông tin chi tiết của sản phẩm
  async findOne(productId: number): Promise<any> {
    try {
      const product = await this.productsRepository.findOne({
        where: { productId },
      });
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm');
      }

      const now = new Date();

      // Lấy giá bán của sản phẩm
      const salePrices = await this.salePricesRepository.find({
        where: { productId },
      });

      // Lấy thông tin chiết khấu
      let discount: Discounts | undefined;
      if (product.discountId) {
        discount = await this.discountsRepository.findOne({
          where: { discountId: product.discountId },
        });
      }

      const discountMap = new Map<number, Discounts>();
      if (discount) {
        discountMap.set(discount.discountId, discount);
      }

      // Tính giá cho sản phẩm
      const prices = calculatePrices(product, salePrices, discountMap, now);

      // Lấy các danh mục của sản phẩm
      const pcs = await this.productCategoriesRepository.find({
        where: { productId },
      });

      const categoryIds = pcs.map((pc) => pc.categoryId);
      const categories = await this.categoriesRepository.find({
        where: { categoryId: In(categoryIds) },
      });

      return {
        ...product,
        ...prices,
        categories,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Xóa sản phẩm và các liên kết
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

  // Phương thức để lấy sản phẩm dựa trên danh mục đệ quy từ 'laptop'
  async findProductsByRecursiveCategory(categoryName: string): Promise<any[]> {
    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // Lấy các danh mục đệ quy từ categoryName
      const categories = await queryRunner.query(
        `
        WITH RecursiveCategories AS (
          SELECT CategoryID, ParentCategoryID, Name
          FROM Categories
          WHERE Name = @0
          
          UNION ALL
  
          SELECT c.CategoryID, c.ParentCategoryID, c.Name
          FROM Categories c
          INNER JOIN RecursiveCategories rc ON c.ParentCategoryID = rc.CategoryID
        )
        SELECT DISTINCT CategoryID
        FROM RecursiveCategories;
        `,
        [categoryName],
      );

      const categoryIds = categories.map((c) => c.CategoryID);

      // Lấy danh sách sản phẩm dựa trên các danh mục
      const products = await this.productsRepository.find({
        where: {
          productId: In(
            (
              await this.productCategoriesRepository.find({
                where: { categoryId: In(categoryIds) },
              })
            ).map((pc) => pc.productId),
          ),
        },
      });

      const productIds = products.map((p) => p.productId);

      const productCategories = await this.productCategoriesRepository.find({
        where: { productId: In(productIds) },
      });

      const salePrices = await this.salePricesRepository.find({
        where: { productId: In(productIds) },
      });

      const salePriceMap = new Map<number, SalePrices[]>();
      salePrices.forEach((sp) => {
        if (!salePriceMap.has(sp.productId)) {
          salePriceMap.set(sp.productId, []);
        }
        salePriceMap.get(sp.productId)?.push(sp);
      });

      const discounts = await this.discountsRepository.find({
        where: {
          discountId: In(products.map((p) => p.discountId).filter(Boolean)),
        },
      });

      const discountMap = new Map<number, Discounts>();
      discounts.forEach((discount) => {
        discountMap.set(discount.discountId, discount);
      });

      const now = new Date();

      // Trả về danh sách sản phẩm với giá
      const result = products.map((product) => {
        const prices = calculatePrices(
          product,
          salePriceMap.get(product.productId) || [],
          discountMap,
          now,
        );

        const pcs = productCategories.filter(
          (pc) => pc.productId === product.productId,
        );
        const productCategoriesList = Array.from(
          new Set(pcs.map((pc) => pc.categoryId)),
        );

        return {
          ...product,
          ...prices,
          categories: productCategoriesList,
        };
      });

      return result;
    } catch (error) {
      throw new BadRequestException('Không thể lấy sản phẩm cho danh mục này');
    } finally {
      await queryRunner.release();
    }
  }
}
