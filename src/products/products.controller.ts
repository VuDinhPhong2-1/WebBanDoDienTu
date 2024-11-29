// products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductWithSalePriceAndCategoriesDto } from './dto/create-product-with-sale-price-and-categories.dto';
import { UpdateProductWithSalePriceAndCategoriesDto } from './dto/update-product-with-sale-price-and-categories.dto';
import { Users } from '../entities/Users';
import { Roles, User } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  // API lấy sản phẩm theo danh mục
  // Nếu danh mục là cấp 1 hoặc cấp 2, nó sẽ lấy cả sản phẩm của các danh mục con đệ quy (cấp dưới của nó)
  @Get('/category')
  async findProductsByCategory(
    @Query('name') name: string,
    @Query('page') page: number = 1, // Nhận giá trị `page` từ query (mặc định là 1)
    @Query('limit') limit: number = 10, // Nhận giá trị `limit` từ query (mặc định là 10)
  ) {
    let categoryNamesArray: string[] = [];
    if (name) {
      categoryNamesArray = name
        .split(',')
        .map((category) => decodeURIComponent(category));
    }
    return this.productsService.findProductsByRecursiveCategoryName(
      categoryNamesArray,
      page,
      limit,
    );
  }
  @Get('/by-ids')
  async findByIds(@Query('ids') ids: string) {
    if (!ids) {
      throw new BadRequestException('Danh sách IDs không được bỏ trống');
    }

    // Chuyển đổi chuỗi ids thành mảng số
    const idArray = ids.split(',').map((id) => {
      const parsedId = parseInt(id.trim(), 10);
      if (isNaN(parsedId)) {
        throw new BadRequestException(`ID không hợp lệ: ${id}`);
      }
      return parsedId;
    });

    // Gọi service để xử lý
    return this.productsService.findByIds(idArray);
  }
  @Get('/search-by-name')
  async findByName(
    @Query('name') name: string, // Nhận tên sản phẩm từ query
  ) {
    if (!name) {
      throw new BadRequestException('Tên sản phẩm không được bỏ trống');
    }

    const products = await this.productsService.findByName(name);

    if (products.length === 0) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return products; // Gọi service để xử lý logic
  }
  // @Get('/find-all')
  // async adminGetAllProducts(@Query('page') page?: number) {
  //   return this.productsService.adminGetAllProducts(page, categoryNamesArray);
  // }
  @Get('/')
  async findAll(
    @Query('page') page?: string,
    @Query('categories') categories?: string,
  ) {
    let categoryNamesArray: string[] = [];

    const pageNumber = Number(page) || 1;

    if (categories) {
      categoryNamesArray = categories
        .split(',')
        .map((category) => decodeURIComponent(category));
    }

    return this.productsService.findAll(pageNumber, categoryNamesArray);
  }

  @Get('/admin/find-all')
  async adminFindAll(
    @Query('page') page?: string, // Nhận `page` dưới dạng string để dễ ép kiểu
    @Query('productName') productName?: string,
    @Query('categoryName') categoryName?: string,
  ) {
    const numericPage = Number(page) || 1; // Ép kiểu thành số và đặt giá trị mặc định
    return this.productsService.adminFindAll(
      numericPage,
      productName,
      categoryName,
    );
  }

  // API tạo sản phẩm mới (chỉ dành cho Admin)
  // Tham số: DTO chứa thông tin sản phẩm, giá bán và danh mục.
  // Để bảo mật, yêu cầu người dùng có vai trò 'ADMIN' và phải được xác thực bằng JWT.
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  @Post('/')
  async create(
    @Body() body: any,
    @User() user: Users,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    try {
      const product = JSON.parse(body.product);
      const salePrice = JSON.parse(body.salePrice);
      const categoryId = JSON.parse(body.categoryId);

      const createProductWithSalePriceAndCategoriesDto = {
        product,
        salePrice,
        categoryId,
      };

      return this.productsService.create(
        createProductWithSalePriceAndCategoriesDto,
        user,
        images,
      );
    } catch (error) {
      console.log(error);
    }
  }

  // API cập nhật thông tin sản phẩm (chỉ dành cho Admin)
  // Tham số: 'id' là ID của sản phẩm, DTO chứa thông tin cập nhật về sản phẩm.
  // Để bảo mật, yêu cầu người dùng có vai trò 'ADMIN' và phải được xác thực bằng JWT.
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('newImages', 10))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @User() user: Users,
    @UploadedFiles() newImages: Express.Multer.File[],
  ) {
    try {
      const product = JSON.parse(body.product);
      const salePrice = JSON.parse(body.salePrice);
      const categoryId = JSON.parse(body.categoryId);
      const deleteImages = JSON.parse(body.deleteImages);

      const updateProductDto = {
        product,
        salePrice,
        categoryId,
        deleteImages,
      };
      console.log('updateProductDto:', updateProductDto);
      await this.productsService.update(id, updateProductDto, user, newImages);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      // Xử lý lỗi nếu cần
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('top-selling')
  async getTopSellingProducts(
    @Query('year') year: number,
    @Query('month') month?: number,
    @Query('day') day?: number,
  ) {
    if (!year) {
      throw new BadRequestException('Year is required');
    }

    const topProducts = await this.productsService.getTopSellingProducts(
      year,
      month || null,
      day || null,
    );
    return topProducts;
  }
  // API lấy thông tin chi tiết của một sản phẩm
  // Tham số: 'id' là ID của sản phẩm.
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // API xóa sản phẩm (chỉ dành cho Admin)
  // Tham số: 'id' là ID của sản phẩm cần xóa.
  // Để bảo mật, yêu cầu người dùng có vai trò 'ADMIN' và phải được xác thực bằng JWT.
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.productsService.remove(id);
    return { message: 'Sản phẩm đã được xóa thành công' };
  }
}
