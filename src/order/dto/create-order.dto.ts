import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../product/entities/product.entity';

export class OrderItemDto {
  @ApiProperty({ type: Product, description: 'Product details' })
  product: Product;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Image URL of the product', example: 'https://example.com/image.jpg' })
  image: string;

  @ApiProperty({ description: 'Name of the product', example: 'Smartphone' })
  name: string;

  @ApiProperty({ description: 'Price of the product', example: 599.99 })
  price: number;
}

export class AddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  street: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  city: string;

  @ApiProperty({ description: 'State', example: 'NY' })
  state: string;

  @ApiProperty({ description: 'ZIP code', example: '10001' })
  zipCode: string;
}


export class CreateOrderDto {
  @ApiProperty({ description: 'Payment method', example: 'Credit Card' })
  paymentMethod: string;

  @ApiProperty({ description: 'Tax price', example: 20.0 })
  taxPrice: number;

  @ApiProperty({ description: 'Shipping price', example: 10.0 })
  shippingPrice: number;

  @ApiProperty({ description: 'Paid status', example: true })
  isPaid: boolean;

  @ApiProperty({ description: 'Date of payment', example: '2023-08-20T10:00:00Z' })
  paidAt: Date;

  @ApiProperty({ description: 'Delivered status', example: false })
  isDelivered: boolean;

  @ApiProperty({ description: 'Date of delivery', example: '2023-08-25T15:00:00Z' })
  deliveredAt: Date;

  @ApiProperty({ type: [OrderItemDto], description: 'List of order items' })
  orderItems: OrderItemDto[];

  @ApiProperty({ description: 'Total order price', example: 629.99 })
  totalPrice: number;

  @ApiProperty({ type: AddressDto, description: 'Shipping address' })
  shippingAddress: AddressDto;
}
