import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Product } from './entities/product.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Public } from 'src/common/decorators/public.decorator';
import { RedisCacheService } from 'src/redis/redis-cache.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

interface FilteredProductsResponse {
  message: string;
  products: Product[];
  totalItems: number;
  timestamp: number; // Add the timestamp property
}

type CachedResponse = {
  products: Product[];
  totalItems: number;
  message: string;
  timestamp: number; // Add a timestamp property
};

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart form data
  @ApiBody({
    type: CreateProductDto,
    description: 'Product data with an image',
  }) // Specify the DTO class and description
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized or insufficient permissions',
  })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  @UseInterceptors(FileInterceptor('imageUrl')) // Use the FileInterceptor for the 'imageUrl' field
  @UseInterceptors(FileInterceptor('imageUrl')) // Assuming 'image' is the field name in the form data
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ): Promise<Product> {
    const userId = req.user.id;
    return this.productService.createProduct(userId, createProductDto, file);
  }

  @Public()
  @ApiOperation({ summary: 'Get filtered products' })
  @ApiQuery({
    name: 'category',
    description: 'Category filter',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'brand',
    description: 'Brand filter',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'instock',
    description: 'In stock filter',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'minPrice',
    description: 'Minimum price filter',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'maxPrice',
    description: 'Maximum price filter',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'sortField',
    description: 'Sort field',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered products retrieved successfully',
    type: Product,
  })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  @Get('products')
  async getFilteredProducts(
    @Query('category') category: string,
    @Query('brand') brand: string,
    @Query('instock') instock: boolean,
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
    @Query('page') page: number,
    @Query('sortField') sortField: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
  ): Promise<FilteredProductsResponse> {
    const result = await this.productService.getFilteredProducts(
      category,
      brand,
      instock,
      minPrice,
      maxPrice,
      page,
      sortField,
      sortOrder,
    );

    return result;
  }

  @Patch(':productId')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'productId', description: 'Product ID', type: String })
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart form data
  @ApiBody({
    type: UpdateProductDto,
    description: 'Partial product data with an image',
  }) // Specify the DTO class and description
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized or insufficient permissions',
  })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  @UseInterceptors(FileInterceptor('imageUrl')) // Use the FileInterceptor for the 'imageUrl' field
  @UseInterceptors(FileInterceptor('imageUrl'))
  async updateProduct(
    @Param('productId') productId: string,
    @UploadedFile() imageUrl: Express.Multer.File,
    @Req() req: any,
    @Body() updateProductDto: Partial<UpdateProductDto>,
  ): Promise<Product> {
    const user = req.user;
    const product = await this.productService.getProductById(productId);

    if (
      product.createdBy.toString() !== user._id.toString() &&
      user.role !== 'admin'
    ) {
      throw new UnauthorizedException(
        `You are not authorized to update this post`,
      );
    }
    console.log('object', updateProductDto);
    return this.productService.updateProduct(
      productId,
      updateProductDto,
      imageUrl,
    );
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Delete a product and its image by ID' })
  @ApiParam({ name: 'productId', description: 'Product ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product and image deleted successfully',
  })
  @ApiBadRequestResponse({ description: 'Bad request or invalid product ID' })
  async deleteProductAndImage(@Param('productId') productId: string) {
    await this.productService.deleteProductAndImage(productId);
    return { message: 'Product and image deleted successfully' };
  }

  @Public()
  @Get(':id/similars')
  @ApiOperation({ summary: 'Find similar products for a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Similar products retrieved successfully',
    type: Product,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async findSimilarBlogs(@Param('id') id: string): Promise<Product[]> {
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const similarBlogs = await this.productService.findSimilarProducts(product);

    return similarBlogs;
  }

  @Public()
  @ApiOperation({ summary: 'Get a product by ID and slug' })
  @ApiParam({ name: 'id', description: 'Product ID', type: String })
  @ApiParam({ name: 'slug', description: 'Product slug', type: String })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully', type: Product })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @Get(':id/:slug')
  async getProductByIdAndSlug(
    @Param('id') id: string,
    @Param('slug') slug: string,
  ) {
    const product = await this.productService.getProductByIdAndSlug(id, slug);
    return product;
  }
}
