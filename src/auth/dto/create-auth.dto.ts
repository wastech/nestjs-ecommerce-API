import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  readonly username: string;

  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  readonly email: string;

  @ApiProperty({ description: 'Description' })
  readonly description: string;

  @ApiProperty({ description: 'Password' })
  readonly password: string;

  @ApiProperty({ description: 'Confirm password' })
  readonly confirmPassword: string;

  @ApiProperty({ description: 'User ID' })
  readonly _id: string;

  @ApiProperty({ description: 'Avatar URL' })
  readonly avatar: string;

  @ApiProperty({ description: 'User role' })
  readonly role: string;

  @ApiProperty({ description: 'Timestamps' })
  readonly timestamps: Date;
}
