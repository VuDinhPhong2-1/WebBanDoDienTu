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
import { TempImagesService } from '../temp-images/temp-images.service';
import { UploadService } from '../upload/upload.service';

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
    private readonly tempImagesService: TempImagesService,
    private readonly uploadService: UploadService,
  ) {}

  // Tạo mới sản phẩm với giá bán và liên kết danh mục
  async create(
    createProductDto: CreateProductWithSalePriceAndCategoriesDto,
    user: Users,
    images: Express.Multer.File[], // Chấp nhận mảng file
  ): Promise<Products> {
    const { product, salePrice, categoryId } = createProductDto;

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

      // Upload và lưu ảnh sản phẩm nếu có
      if (images && images.length > 0) {
        const uploadPromises = images.map((image) =>
          this.uploadService.uploadFile(image),
        );
        const uploadedImages = await Promise.all(uploadPromises);

        await this.productImagesService.createImages(
          savedProduct.productId,
          uploadedImages.map((image) => image.url), // Truyền các URL ảnh đã upload
          user,
        );
      }

      // Tạo giá bán cho sản phẩm
      const newSalePrice: CreateSalePriceDto = {
        ...salePrice,
        productId: savedProduct.productId,
      };
      await this.salePricesService.create(newSalePrice, queryRunner);

      // Tạo liên kết với các danh mục
      if (categoryId) {
        const productCategory = this.productCategoriesRepository.create({
          productId: savedProduct.productId,
          categoryId, // Sử dụng categoryId thay vì lặp qua mảng
          createdBy: user.userId,
        });
        await queryRunner.manager.save(productCategory);
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
  // Cập nhật sản phẩm với giá bán và liên kết danh mục
  async update(
    productId: number,
    updateProductDto: UpdateProductWithSalePriceAndCategoriesDto,
    user: Users,
    newImages: Express.Multer.File[],
  ): Promise<Products> {
    const { product, salePrice, categoryIds, deleteImages } = updateProductDto;

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

      // Xóa các bản ghi có URL trong deleteImages (nếu có)
      if (deleteImages && deleteImages.length > 0) {
        await queryRunner.manager.delete(ProductImages, {
          imageUrl: In(deleteImages),
        });
      }

      // Upload và lưu ảnh mới (newImages)
      if (newImages && newImages.length > 0) {
        const uploadPromises = newImages.map((image) =>
          this.uploadService.uploadFile(image),
        );
        const uploadedImages = await Promise.all(uploadPromises);

        // Lưu các ảnh vào bảng ProductImages
        await this.productImagesService.createImages(
          updatedProduct.productId,
          uploadedImages.map((image) => image.url), // Truyền các URL ảnh đã upload
          user,
        );
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
      const offset = (page - 1) * limit;

      const queryRunner =
        this.productsRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      let products = [];

      if (categoryNames && categoryNames.length > 0) {
        // Tạo các placeholder tương ứng với số lượng phần tử trong mảng
        const placeholders = categoryNames
          .map((_, index) => `@${index}`)
          .join(', ');

        products = await queryRunner.query(
          `
            SELECT 
              p.productID AS "productId", 
              p.name, 
              p.description, 
              p.quantity, 
              p.brandID, 
              p.discountId, 
              p.createdBy, 
              p.updatedBy, 
              p.createdAt, 
              p.updatedAt
            FROM Products p
            JOIN ProductCategories pc ON p.ProductID = pc.ProductID
            JOIN Categories c ON pc.CategoryID = c.CategoryID
            WHERE c.Name IN (${placeholders})
            ORDER BY p.ProductID  
            OFFSET ${Number(offset)} ROWS
            FETCH NEXT ${limit} ROWS ONLY;
            `,
          categoryNames,
        );
      } else {
        products = await this.productsRepository.find({
          take: limit,
          skip: Number(offset),
        });
      }

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

  async adminFindAll(
    page: number = 1,
    productName: string = '',
    categoryName: string = '',
  ) {
    try {
      const limit = 10; // Số sản phẩm mỗi trang
      const offset = (page - 1) * limit;

      // Tạo query builder cho Products
      const queryBuilder =
        this.productsRepository.createQueryBuilder('product');

      // Nối với bảng ProductCategories và Categories nếu có categoryName
      if (categoryName) {
        queryBuilder
          .innerJoin(
            ProductCategories,
            'productCategory',
            'product.productId = productCategory.productId',
          )
          .innerJoin(
            Categories,
            'category',
            'productCategory.categoryId = category.categoryId',
          )
          .andWhere('category.name LIKE :categoryName', {
            categoryName: `%${categoryName}%`,
          });
      }

      // Lọc theo tên sản phẩm nếu có productName
      if (productName) {
        queryBuilder.andWhere('product.name LIKE :productName', {
          productName: `%${productName}%`,
        });
      }

      // Phân trang: skip + take
      queryBuilder.offset(offset).limit(limit);

      // Lấy dữ liệu
      const [products, total] = await queryBuilder.getManyAndCount();

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
      return {
        result,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
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

      // Lấy các giá bán liên quan đến sản phẩm
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

      // Trích xuất dữ liệu salePrices
      const salePriceDetails = salePrices.map((salePrice) => ({
        startDate: salePrice.startDate,
        endDate: salePrice.endDate,
        applyDate: salePrice.applyDate,
      }));

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
        salePrices: salePriceDetails, // Thêm danh sách salePrices vào kết quả trả về
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

  // Thêm phương thức trong service để lấy sản phẩm theo mảng ids
  async findByIds(ids: number[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Danh sách IDs không hợp lệ');
    }
    try {
      const products = await this.productsRepository.find({
        where: { productId: In(ids) },
      });

      if (products.length === 0) {
        throw new NotFoundException(
          'Không tìm thấy sản phẩm với các IDs đã cho',
        );
      }
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
      throw new BadRequestException(error.message);
    }
  }

  async reduceProductQuantity(
    productId: number,
    quantity: number,
    queryRunner: any,
  ): Promise<void> {
    // Lấy sản phẩm từ database
    const product = await queryRunner.manager.findOne(Products, {
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm với ID: ${productId}`,
      );
    }

    // Kiểm tra xem sản phẩm có đủ số lượng không
    if (product.quantity < quantity) {
      throw new BadRequestException(
        `Sản phẩm ${product.name} không đủ số lượng`,
      );
    }

    // Trừ đi số lượng sản phẩm
    product.quantity -= quantity;

    await queryRunner.manager.save(product);
  }

  async getTopSellingProducts(
    year: number,
    month: number | null = null,
    day: number | null = null,
  ) {
    const products = await this.productsRepository.query(
      `
      SELECT TOP 4 
          P.Name,
          SUM(OD.Quantity) AS TotalQuantitySold
      FROM 
          Orders O
      JOIN 
          OrderDetails OD ON O.OrderID = OD.OrderID
      JOIN 
          Products P ON OD.ProductID = P.ProductID
      WHERE 
          YEAR(O.OrderDate) = @0
          AND (@1 IS NULL OR MONTH(O.OrderDate) = @1)
          AND (@2 IS NULL OR DAY(O.OrderDate) = @2)
      GROUP BY 
          P.Name
      ORDER BY 
          TotalQuantitySold DESC;
      `,
      [year, month, day],
    );

    return products;
  }
}
