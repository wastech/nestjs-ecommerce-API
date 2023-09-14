import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Address {
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'  })
  user: User;

  @Prop({ type: String, required: true })
  @IsNotEmpty({ message: 'Username should not be empty' })
  street: string;

  @Prop({ type: String, required: true })
  @IsNotEmpty({ message: 'Description should not be empty' })
  state: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ required: true })
  @IsNotEmpty( { message: 'Zipcode  should not be empty' })
  zipcode: number;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Password should not be empty' })
  country: string;
}

export type AddressDocument = Address & Document;

export const AddressSchema = SchemaFactory.createForClass(Address);
