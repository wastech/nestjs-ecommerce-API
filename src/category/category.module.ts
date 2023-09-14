import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './entities/category.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RedisCacheModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    CloudinaryModule,
    RedisCacheModule
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
