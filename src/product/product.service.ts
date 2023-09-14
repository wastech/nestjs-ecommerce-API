import { CloudinaryService } from './../cloudinary/cloudinary.service';
import {
  Injectable,
  Next,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { RedisCacheService } from '../redis/redis-cache.service';

interface FilteredProductsResponse {
  message: string;
  products: Product[];
  totalItems: number;
  timestamp: number; // Add the timestamp property
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async createProduct(
    userId: string,
    createProductDto: CreateProductDto,
    imageFile: Express.Multer.File,
  ): Promise<Product> {
    const transformations = [
      { aspect_ratio: '2.5', gravity: 'auto', width: 800, crop: 'fill' },
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ];

    const imageUrl = await this.cloudinaryService.uploadImage(
      imageFile,
      'Product',
      transformations,
    );

    const product = new this.productModel({
      createdBy: userId,
      ...createProductDto,
      imageUrl: {
        url: imageUrl.url,
        publicId: imageUrl.public_id,
      },
    });

    return await product.save();
  }

  async checkForNewData(
    cacheKey: string,
    cachedTimestamp: number,
  ): Promise<boolean> {
    // Query the database to get the latest product's updatedAt timestamp
    const latestProduct = await this.productModel
      .findOne({}, { updatedAt: 1 })
      .sort({ updatedAt: -1 })
      .exec();

    if (!latestProduct) {
      // No product found, consider new data is available
      return true;
    }

    // Compare the cached timestamp with the latest product's updatedAt timestamp
    return cachedTimestamp < latestProduct.updatedAt.getTime();
  }

  async getFromCache(key: string): Promise<string | null> {
    return this.redisCacheService.get(key);
  }

  async cacheFilteredProducts(
    key: string,
    data: string,
    expiresIn: number,
  ): Promise<void> {
    await this.redisCacheService.set(key, data, expiresIn);
  }

  async fetchProductsFromDatabase(
    category: string,
    brand: string,
    instock: boolean,
    minPrice: number,
    maxPrice: number,
    page: number,
    sortField: string,
    sortOrder: 'asc' | 'desc',
  ): Promise<{ products: Product[]; totalItems: number }> {
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (instock !== undefined) {
      query.instock = instock;
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    const sort: any = {};
    sort[sortField] = sortOrder;

    const limit = 10; // Set your desired static limit value

    const totalItems = await this.productModel.countDocuments(query).exec();

    const products = await this.productModel
      .find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { products, totalItems };
  }

  async getFilteredProducts(
    category: string,
    brand: string,
    instock: boolean,
    minPrice: number,
    maxPrice: number,
    page: number,
    sortField: string,
    sortOrder: 'asc' | 'desc',
  ): Promise<FilteredProductsResponse> {
    const cacheKey = JSON.stringify({
      category,
      brand,
      instock,
      minPrice,
      maxPrice,
      page,
      sortField,
      sortOrder,
    });

    const cachedData = await this.redisCacheService.get(cacheKey);
    if (cachedData) {
      const cachedResponse = JSON.parse(cachedData) as FilteredProductsResponse;

      // Check if new data is available
      const newDataAvailable = await this.checkForNewData(
        cacheKey,
        cachedResponse.timestamp, // Pass the cached timestamp value here
      );

      if (newDataAvailable) {
        // If new data is available, return fresh data
        const { products, totalItems } = await this.fetchProductsFromDatabase(
          category,
          brand,
          instock,
          minPrice,
          maxPrice,
          page,
          sortField,
          sortOrder,
        );
        const responseData = {
          products,
          totalItems,
          message: 'Data retrieved from database',
          timestamp: Date.now(),
        };

        // Cache the fresh data
        await this.cacheFilteredProducts(
          cacheKey,
          JSON.stringify(responseData),
          3600,
        );

        return responseData;
      } else {
        // If no new data, return cached data
        return { ...cachedResponse, message: 'Data fetched from cache' };
      }
    } else {
      // No cached data available, fetch from database and cache
      const { products, totalItems } = await this.fetchProductsFromDatabase(
        category,
        brand,
        instock,
        minPrice,
        maxPrice,
        page,
        sortField,
        sortOrder,
      );
      const responseData = {
        products,
        totalItems,
        message: 'Data retrieved from database',
        timestamp: Date.now(),
      };

      // Cache the data
      await this.cacheFilteredProducts(
        cacheKey,
        JSON.stringify(responseData),
        3600, // Cache for 1 hour (3600 seconds)
      );

      return responseData;
    }
  }

  async getProductByIdAndSlug(id: string, slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({
        _id: id,
        slug: slug,
      })
      .populate('category', 'name')
      .exec();

    return product;
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.productModel.findById(productId).exec();
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: Partial<UpdateProductDto>,
    imageFile?: Express.Multer.File,
  ): Promise<Product> {
    const options = { new: true }; // Return the updated document

    // Check if the title has been updated
    if (updateProductDto.title) {
      // If the title has been updated, generate a new slug based on the updated title
      updateProductDto.slug = slugify(updateProductDto.title, { lower: true });
    }

    let imageUrlData: { url: string; publicId: string } | undefined;

    if (imageFile) {
      // Delete the previous image from Cloudinary
      const product = await this.productModel.findById(id).exec();
      if (product) {
        await this.cloudinaryService.deleteImage(product.imageUrl.publicId);
      }

      const transformations = [
        { aspect_ratio: '2.5', gravity: 'auto', width: 800, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ];
      // Upload the new image and get its URL and publicId
      const newImage = await this.cloudinaryService.uploadImage(
        imageFile,
        'updated-images',
        transformations,
      );

      imageUrlData = {
        url: newImage.secure_url,
        publicId: newImage.public_id,
      };
    }
    console.log('object', updateProductDto);

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { ...updateProductDto, imageUrl: imageUrlData },
        options,
      )
      .exec();

    return updatedProduct;
  }

  async deleteProductAndImage(productId: string): Promise<void> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException(`Product with ${productId} not found`);
    }

    // Delete the image from Cloudinary
    await this.cloudinaryService.deleteImage(product.imageUrl.publicId);

    // Delete the product from the database
    await this.productModel.findByIdAndRemove(productId).exec();
  }

  async findSimilarProducts(product: Product): Promise<Product[]> {
    const similarBlogs = await this.productModel
      .find({
        category: product.category,
        _id: { $ne: product._id }, // exclude the current blog post from the results
      })
      .sort({ createdAt: -1 }) // sort by creation date in descending order
      .limit(3) // limit to a maximum of 3 similar posts
      .exec();

    return similarBlogs;
  }
}
