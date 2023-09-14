import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: String, required: true })
  @IsNotEmpty({ message: 'Name should not be empty' })
  name: string;

  @Prop({ required: [true, 'Image URL is required'], type: Object }) // Add the required message
  @IsNotEmpty({ message: 'ImageUrl should not be empty' })
  imageUrl: {
    url: string;
    publicId: string;
  };
}

export type CategoryDocument = Category & Document;

export const CategorySchema = SchemaFactory.createForClass(Category);
