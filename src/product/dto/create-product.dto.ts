import { ApiProperty } from '@nestjs/swagger'; // Import the ApiProperty decorator

export class CreateProductDto {
  @ApiProperty({ description: 'Title of the product', example: 'Smartphone' })
  title: string;

  // @ApiProperty({ description: 'URL of the product image', example: 'https://example.com/image.jpg' })
  // imageUrl: string;

  @ApiProperty({ description: 'Slug of the product', example: 'smartphone' })
  slug: string;

  @ApiProperty({ description: 'Description of the product', example: 'A high-quality smartphone' })
  description: string;

  @ApiProperty({ description: 'Price of the product', example: 599.99 })
  price: number;

  @ApiProperty({ description: 'Number of items in stock', example: 100 })
  countInStock: number;

  @ApiProperty({ description: 'Availability status of the product', example: false })
  instock: false;

  @ApiProperty({ description: 'Rating of the product', example: 4.5 })
  rating: number;

  @ApiProperty({ description: 'Brand of the product', example: 'Apple' })
  brand: string;

  @ApiProperty({ description: 'Category of the product', example: 'Electronics' })
  category: string;
}
