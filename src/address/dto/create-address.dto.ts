import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'Street name', example: '1234 Main St' })
  @IsString()
  @IsNotEmpty({ message: 'Street should not be empty' })
  readonly street: string;

  @ApiProperty({ description: 'State name', example: 'California' })
  @IsString()
  @IsNotEmpty({ message: 'State should not be empty' })
  readonly state: string;

  @ApiProperty({ description: 'City name', example: 'Los Angeles' })
  @IsString()
  @IsNotEmpty({ message: 'City should not be empty' })
  readonly city: string;

  @ApiProperty({ description: 'Zip code', example: 12345 })
  @IsNotEmpty({ message: 'Zipcode should not be empty' })
  readonly zipcode: number;

  @ApiProperty({ description: 'Country name', example: 'United States' })
  @IsString()
  @IsNotEmpty({ message: 'Country should not be empty' })
  readonly country: string;
}
