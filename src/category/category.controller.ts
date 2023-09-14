import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from '../auth/entities/auth.entity';
import { RolesGuard } from '../common/roles.guard';
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a category (Admin role required)' })
  @ApiConsumes('multipart/form-data') // Specify that this endpoint consumes multipart form data
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category data with an image',
  }) // Specify the DTO class and description
  @ApiUnauthorizedResponse({
    description: 'Unauthorized or insufficient permissions',
  })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  @UseInterceptors(FileInterceptor('imageUrl')) // Use the FileInterceptor for the 'imageUrl' field
  @UseInterceptors(FileInterceptor('imageUrl')) // Assuming 'image' is the field name in the form data
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ): Promise<Category> {
    const userId = req.user.id;
    return this.categoryService.createCategory(userId, createCategoryDto, file);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully', type: Category, isArray: true })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  async getAllCategories() {
    const result = await this.categoryService.getAllCategories();
    return result;
  }

  @Public()
  @Get(':name')
  @ApiOperation({ summary: 'Get a category by name' })
  @ApiParam({ name: 'name', description: 'Category name', type: String })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: Category })
  @ApiBadRequestResponse({ description: 'Invalid category name' })
  async getCategoryByName(@Param('name') name: string): Promise<Category> {
    const category = await this.categoryService.getCategoryByName(name);

    return category;
  }

  // @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    type: Category,
  })
  @ApiBadRequestResponse({ description: 'Invalid category ID' })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized or insufficient permissions',
  })
  async deleteCategory(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoryService.deleteCategory(id);
    return { message: `Category  ${id} deleted successfully` };
  }
}
