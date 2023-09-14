import { ApiProperty } from '@nestjs/swagger'; // Import the ApiProperty decorator

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category', example: 'Technology' })
  readonly name: string;

  @ApiProperty({ description: 'User ID who owns the category', example: '123456' })
  readonly userId: string;
}
