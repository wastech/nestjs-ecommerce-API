import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RedisCacheService } from '../redis/redis-cache.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async createCategory(
    userId: string,
    createCategoryDto: CreateCategoryDto,
    imageFile: Express.Multer.File,
  ): Promise<Category> {
    const transformations = [
      { aspect_ratio: '2.5', gravity: 'auto', width: 100, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ];

    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name,
    });

    if (existingCategory) {
      throw new ConflictException(
        `${createCategoryDto.name} has already been added`,
      );
    }

    const imageUrl = await this.cloudinaryService.uploadImage(
      imageFile,
      'Category',
      transformations,
    );

    const createCategory = new this.categoryModel({
      ...createCategoryDto,
      userId: userId,
      imageUrl: {
        url: imageUrl.url,
        publicId: imageUrl.public_id,
      },
    });

    return createCategory.save();
  }

  async getAllCategories(): Promise<{
    categories: Category[];
    message: string;
  }> {
    const cacheKey = 'all_categories'; // Unique cache key for categories

    // Check if categories are already cached
    const cachedCategories = await this.redisCacheService.get(cacheKey);
    if (cachedCategories) {
      return {
        categories: JSON.parse(cachedCategories),
        message: 'Data fetched from cache',
      };
    }

    // Fetch categories from the database
    const categories = await this.categoryModel.find().exec();

    // Cache the categories
    await this.redisCacheService.set(
      cacheKey,
      JSON.stringify(categories),
      3600,
    ); // Cache for 1 hour

    return { categories, message: 'Data retrieved from database' };
  }

  async getCategoryByName(name: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ name }).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException(`Category with ${id} not found`);
    }

    if (category && category.imageUrl && category.imageUrl.publicId) {
      // Delete the image from Cloudinary
      await this.cloudinaryService.deleteImage(category.imageUrl.publicId);
    }

    // Delete the product from the database
    await this.categoryModel.findByIdAndRemove(id).exec();
  }
}
