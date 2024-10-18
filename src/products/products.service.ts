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
import { ProductImagesService } from '../product-images/product-images.service';
import { ProductImages } from '../entities/ProductImages';
import { Brands } from '../entities/Brands';

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

    @InjectRepository(Brands)
    private readonly brandsRepository: Repository<Brands>,

    private readonly salePricesService: SalePricesService,

    private readonly productImagesService: ProductImagesService,
  ) {}

  // Tạo mới sản phẩm với giá bán và liên kết danh mục
  async create(
    createProductDto: CreateProductWithSalePriceAndCategoriesDto,
    user: Users,
  ): Promise<Products> {
    const { product, salePrice, categoryIds, images } = createProductDto;

    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo sản phẩm mới
      const newProduct = this.productsRepository.create({
        ...product,
        createdBy: user.userId,
      });
      const savedProduct = await queryRunner.manager.save(newProduct);

      // Lưu ảnh sản phẩm nếu có
      await this.productImagesService.createImages(
        savedProduct.productId,
        images,
        user,
      );

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
    const { product, salePrice, categoryIds, images } = updateProductDto;

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

      // Cập nhật ảnh sản phẩm
      if (images) {
        // Xóa các ảnh cũ
        await this.productImagesService.removeImagesByProductId(productId);
        // Thêm ảnh mới
        await this.productImagesService.createImages(
          updatedProduct.productId,
          images,
          user,
        );
      }

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
  async findAll(page: number = 1, categoryNames?: string[]) {
    try {
      const limit = 10;
      const queryRunner =
        this.productsRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      let products = [];
      if (categoryNames && categoryNames.length > 0) {
        // Tạo các placeholder tương ứng với số lượng phần tử trong mảng
        const placeholders = categoryNames
          .map((_, index) => `@${index}`)
          .join(', ');

        // Tạo câu truy vấn sử dụng các placeholder
        products = await queryRunner.query(
          `
          SELECT 
          p.ProductID AS "productId", 
          p.Name, 
          p.Description, 
          p.Quantity, 
          p.BrandID, 
          p.discountId, 
          p.createdBy, 
          p.updatedBy, 
          p.createdAt, 
          p.updatedAt, 
          p.avatar_url
        FROM Products p
        JOIN ProductCategories pc ON p.ProductID = pc.ProductID
        JOIN Categories c ON pc.CategoryID = c.CategoryID
        WHERE c.Name IN (${placeholders});
          `,
          categoryNames,
        );
      } else {
        products = await this.productsRepository.find();
      }
      // tạo mảng mới lấy productIds
      const productIds = products.map((p) => p.productId);

      // lấy ra sale price của sản phẩm
      const salePrices = await this.salePricesRepository.find({
        where: { productId: In(productIds) },
      });
      // Gom nhóm salePrice theo productID
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

      const productImages = await this.productsRepository.manager.find(
        ProductImages,
        {
          where: { productId: In(productIds) },
        },
      );

      const productImagesMap = new Map<number, string[]>();
      productImages.forEach((image) => {
        if (!productImagesMap.has(image.productId)) {
          productImagesMap.set(image.productId, []);
        }
        productImagesMap.get(image.productId)?.push(image.imageUrl);
      });

      const now = new Date();

      const result = products.map((product) => {
        const prices = calculatePrices(
          product,
          salePriceMap.get(product.productId) || [],
          discountMap,
          now,
        );

        const images = productImagesMap.get(product.productId) || [];

        return {
          ...product,
          ...prices,
          images,
        };
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
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
      const brandName = await this.brandsRepository.findOne({
        where: { brandId: product.brandId },
        select: ['name'],
      });

      // Lấy tất cả hình ảnh sản phẩm
      const productImages =
        await this.productImagesService.findImagesByProductId(productId);

      const now = new Date();

      const salePrices = await this.salePricesRepository.find({
        where: { productId },
      });

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

      const prices = calculatePrices(product, salePrices, discountMap, now);

      // Lấy thông tin các danh mục liên quan đến sản phẩm
      const productCategories = await this.productCategoriesRepository.find({
        where: { productId },
      });

      const categoryIds = productCategories.map((pc) => pc.categoryId);
      const categories = await this.categoriesRepository.find({
        where: { categoryId: In(categoryIds) },
      });

      const categoryMap = new Map<number, Categories>();
      categories.forEach((category) => {
        categoryMap.set(category.categoryId, category);
      });

      const productCategoriesList = Array.from(
        new Set(productCategories.map((pc) => categoryMap.get(pc.categoryId))),
      );

      return {
        ...product,
        ...prices,
        categories: productCategoriesList,
        images: productImages,
        brandName,
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

  // Phương thức để lấy sản phẩm dựa trên danh mục đệ quy
  async findProductsByRecursiveCategoryName(
    categoryNames: string[], // Nhận mảng tên danh mục
    page: number, // Nhận số trang
    limit: number, // Nhận số sản phẩm trên mỗi trang
  ): Promise<any> {
    const queryRunner =
      this.productsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      // Tạo placeholders cho các giá trị của categoryNames
      const placeholders = categoryNames
        .map((_, index) => `@${index}`)
        .join(', ');

      // Lấy các danh mục đệ quy từ categoryNames, bao gồm cả tên danh mục
      const categories = await queryRunner.query(
        `
        WITH RecursiveCategories AS (
          SELECT CategoryID, ParentCategoryID, Name
          FROM Categories
          WHERE Name IN (${placeholders})
          
          UNION ALL
  
          SELECT c.CategoryID, c.ParentCategoryID, c.Name
          FROM Categories c
          INNER JOIN RecursiveCategories rc ON c.ParentCategoryID = rc.CategoryID
        )
        SELECT DISTINCT CategoryID, Name
        FROM RecursiveCategories;
        `,
        categoryNames, // Truyền mảng tên danh mục vào truy vấn
      );

      // Tạo map để lưu trữ tên danh mục dựa trên CategoryID
      const categoryMap = new Map<number, string>();
      const categoryIds = categories.map((c) => {
        categoryMap.set(c.CategoryID, c.Name);
        return c.CategoryID;
      });

      // Lấy tổng số sản phẩm (totalItems)
      const totalItems = await this.productsRepository.count({
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

      // Tính toán giá trị `skip` và `take` cho phân trang
      const skip = (page - 1) * limit;

      // Lấy danh sách sản phẩm dựa trên các danh mục và phân trang
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
        skip: skip, // Số sản phẩm bỏ qua
        take: limit, // Số sản phẩm lấy ra
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

      const productImages = await this.productsRepository.manager.find(
        ProductImages,
        {
          where: { productId: In(productIds) },
        },
      );

      const productImagesMap = new Map<number, string[]>();
      productImages.forEach((image) => {
        if (!productImagesMap.has(image.productId)) {
          productImagesMap.set(image.productId, []);
        }
        productImagesMap.get(image.productId)?.push(image.imageUrl);
      });

      const now = new Date();

      // Trả về danh sách sản phẩm với giá và hình ảnh, kèm theo tên danh mục
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

        const images = productImagesMap.get(product.productId) || [];

        return {
          ...product,
          ...prices,
          categories: productCategoriesList, // Gắn danh sách tên các danh mục
          images,
        };
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        totalItems,
        currentPage: page,
        totalPages,
        itemsPerPage: limit,
        products: result,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy sản phẩm cho các danh mục này',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findByName(name: string): Promise<any> {
    try {
      const products = await this.productsRepository.query(
        `
        SELECT productId, name, description, brandId, discountId, avatar_url
        FROM Products
        WHERE LOWER(Name) LIKE LOWER(@0)
        `,
        [`%${name}%`], // Truyền tham số dưới dạng mảng
      );
      const productIds = products.map((p) => p.productId);
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

      const productImages = await this.productsRepository.manager.find(
        ProductImages,
        {
          where: { productId: In(productIds) },
        },
      );

      const productImagesMap = new Map<number, string[]>();
      productImages.forEach((image) => {
        if (!productImagesMap.has(image.productId)) {
          productImagesMap.set(image.productId, []);
        }
        productImagesMap.get(image.productId)?.push(image.imageUrl);
      });

      const now = new Date();

      // Trả về danh sách sản phẩm với giá và hình ảnh, kèm theo tên danh mục
      const result = products.map((product) => {
        const prices = calculatePrices(
          product,
          salePriceMap.get(product.productId) || [],
          discountMap,
          now,
        );

        const images = productImagesMap.get(product.productId) || [];

        return {
          ...product,
          ...prices,
          images,
        };
      });
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
      throw new BadRequestException('Lỗi khi tìm kiếm sản phẩm theo tên');
    }
  }
}
