import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // Import necessary decorators
import { Address } from './entities/address.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
@ApiTags('Address') // Add an API
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' }) // Add an operation summary
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    type: Address,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createAddressDto: CreateAddressDto,
    @Req() req: any, // Inject the request object
  ): Promise<Address> {
    const userId = req.user.id; // Extract user ID from req.user
    return this.addressService.createAddress(userId, createAddressDto);
  }

  @Get('by-user/:authorId')
  @ApiOperation({ summary: 'Get addresses by author' }) // Add an operation summary
  @ApiResponse({
    status: 200,
    description: 'Addresses retrieved successfully',
    type: Address,
    isArray: true,
  })
  async getByAuthor(@Param('authorId') authorId: string): Promise<Address[]> {
    return this.addressService.getAddressByAuthor(authorId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' }) // Add an operation summary
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    type: Address,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Req() req: any, // Inject the request object
  ): Promise<Address> {
    // Logic to check user ownership or admin role
    const user = req.user; // Assuming req.user contains user information from JWT payload

    // Assuming your AddressService's updateAddress method takes userId as well
    const updatedAddress = await this.addressService.updateAddress(
      id,
      updateAddressDto,
      user.id,
    );
    return updatedAddress;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' }) // Add an operation summary
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async delete(
    @Param('id') id: string,
    @Req() req: any, // Inject the request object
  ): Promise<{ message: string }> {
    // Logic to check user ownership
    const user = req.user; // Assuming req.user contains user information from JWT payload

    try {
      await this.addressService.deleteAddress(id, user.id);
      return { message: 'Address deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
