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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductWithSalePriceAndCategoriesDto } from './dto/create-product-with-sale-price-and-categories.dto';
import { UpdateProductWithSalePriceAndCategoriesDto } from './dto/update-product-with-sale-price-and-categories.dto';
import { Users } from '../entities/Users';
import { Roles, User } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

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

  @Get('/')
  async findAll(
    @Query('page') page?: number,
    @Query('categories') categories?: string,
  ) {
    let categoryNamesArray: string[] = [];

    if (categories) {
      categoryNamesArray = categories
        .split(',')
        .map((category) => decodeURIComponent(category));
    }
    return this.productsService.findAll(page, categoryNamesArray);
  }

  // API tạo sản phẩm mới (chỉ dành cho Admin)
  // Tham số: DTO chứa thông tin sản phẩm, giá bán và danh mục.
  // Để bảo mật, yêu cầu người dùng có vai trò 'ADMIN' và phải được xác thực bằng JWT.
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body()
    createProductWithSalePriceAndCategoriesDto: CreateProductWithSalePriceAndCategoriesDto,
    @User() user: Users,
  ) {
    return this.productsService.create(
      createProductWithSalePriceAndCategoriesDto,
      user,
    );
  }

  // API cập nhật thông tin sản phẩm (chỉ dành cho Admin)
  // Tham số: 'id' là ID của sản phẩm, DTO chứa thông tin cập nhật về sản phẩm.
  // Để bảo mật, yêu cầu người dùng có vai trò 'ADMIN' và phải được xác thực bằng JWT.
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateProductWithSalePriceAndCategoriesDto: UpdateProductWithSalePriceAndCategoriesDto,
    @User() user: Users,
  ) {
    return this.productsService.update(
      id,
      updateProductWithSalePriceAndCategoriesDto,
      user,
    );
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
