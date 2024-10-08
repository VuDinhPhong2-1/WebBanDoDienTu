import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategories } from '../entities/ProductCategories';
import { Products } from '../entities/Products';
import { Categories } from '../entities/Categories';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategories)
    private readonly productCategoriesRepository: Repository<ProductCategories>,

    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,

    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
  ) {}

  // Thêm sản phẩm vào danh mục
  async addProductToCategory(
    productId: number,
    categoryId: number,
    userId: number,
  ): Promise<ProductCategories> {
    // Kiểm tra xem sản phẩm và danh mục có tồn tại không
    const product = await this.productsRepository.findOne({
      where: { productId },
    });
    const category = await this.categoriesRepository.findOne({
      where: { categoryId },
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại`);
    }
    if (!category) {
      throw new NotFoundException(
        `Danh mục với ID ${categoryId} không tồn tại`,
      );
    }

    const productCategory = this.productCategoriesRepository.create({
      productId,
      categoryId,
      createdBy: userId,
      createdDate: new Date(),
    });

    return await this.productCategoriesRepository.save(productCategory);
  }

  // Xóa sản phẩm khỏi danh mục
  async removeProductFromCategory(
    productId: number,
    categoryId: number,
  ): Promise<void> {
    const productCategory = await this.productCategoriesRepository.findOne({
      where: { productId, categoryId },
    });

    if (!productCategory) {
      throw new NotFoundException(
        `Không tìm thấy liên kết giữa sản phẩm và danh mục`,
      );
    }

    await this.productCategoriesRepository.delete(
      productCategory.productCategoryId,
    );
  }

  // Lấy danh sách danh mục của một sản phẩm
  async findCategoriesByProductId(productId: number): Promise<Categories[]> {
    const productCategories = await this.productCategoriesRepository.find({
      where: { productId },
    });

    const categoryIds = productCategories.map((pc) => pc.categoryId);
    return await this.categoriesRepository.findByIds(categoryIds);
  }

  // Lấy danh sách sản phẩm theo danh mục
  async findProductsByCategoryId(categoryId: number): Promise<Products[]> {
    const productCategories = await this.productCategoriesRepository.find({
      where: { categoryId },
    });

    const productIds = productCategories.map((pc) => pc.productId);
    return await this.productsRepository.findByIds(productIds);
  }
}
