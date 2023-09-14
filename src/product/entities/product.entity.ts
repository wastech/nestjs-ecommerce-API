import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';
import slugify from 'slugify';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: [true, 'Title is required'] }) // Add the required message
  title: string;

  @Prop({ required: [true, 'Image URL is required'], type: Object }) // Add the required message
  imageUrl: {
    url: string;
    publicId: string;
  };

  @Prop({ default: '' })
  slug: string;

  @Prop({ required: [true, 'Description is required'] }) // Add the required message
  description: string;

  @Prop({ required: [true, 'Price is required'], default: 0 }) // Add the required message
  price: number;

  @Prop({ required: [true, 'Count in Stock is required'], default: 0 }) // Add the required message
  countInStock: number;

  @Prop({ required: [true, 'In Stock is required'], default: false }) // Add the required message
  instock: false;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ required: [true, 'Brand is required'] }) // Add the required message
  brand: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'], // Add the required message
  })
  category: Category;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'CreatedBy is required'], // Add the required message
  })
  createdBy: User;

  @Prop({type:Date, default:Date.now})
  updatedAt:Date

}

const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.pre('save', function (next) {
  if (!this.imageUrl || !this.imageUrl.url || !this.imageUrl.publicId) {
    return next(new Error('Image URL is required'));
  }

  if (!this.isModified('title')) {
    return next();
  }
  this.slug = slugify(this.title, { lower: true });
  next();
});
export { ProductSchema };
