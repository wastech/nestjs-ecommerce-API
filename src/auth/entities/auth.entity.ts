import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as uniqueValidator from 'mongoose-unique-validator';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export enum Role {
  Guest = 'guest',
  SubAdmin = 'sub_admin',
  Admin = 'admin',
}

@Schema({ timestamps: true })
export class Auth {
  @Prop({ type: String, required: true })
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @Prop({ type: String, required: true })
  @IsNotEmpty({ message: 'Description should not be empty' })
  description: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ required: true, unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Prop({ required: true })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;

  @Prop({ type: String, enum: Role, default: Role.Guest })
  role: Role;
}

export type AuthDocument = Auth & Document;

export const AuthSchema =
  SchemaFactory.createForClass(Auth).plugin(uniqueValidator);
