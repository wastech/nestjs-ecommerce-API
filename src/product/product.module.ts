import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './entities/product.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { RedisCacheModule } from 'src/redis/redis.module';

@Module({
  imports: [
    RedisCacheModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CloudinaryModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
