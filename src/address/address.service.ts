import { Injectable, NotFoundException,ConflictException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from '../auth/entities/auth.entity';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<Address>,
  ) {}

  async createAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const existingAddress = await this.addressModel
      .findOne({ user: userId })
      .exec();

    if (existingAddress) {
      throw new ConflictException('User already has an address');
    }
    const createdAddress = new this.addressModel({
      ...createAddressDto,
      user: userId, // Set the author field to the user ID
    });

    return createdAddress.save();
  }

  async getAddressByAuthor(authorId: string): Promise<Address[]> {
    return this.addressModel.find({ user: authorId }).exec();
  }

  async updateAddress(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string, // User ID from JWT payload
  ): Promise<Address> {
    const address = await this.addressModel.findById(id).exec();

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.user.toString() !== userId) {
      throw new ConflictException('User is not authorized to update this address');
    }

    // Update the address fields with the DTO
    Object.assign(address, updateAddressDto);

    return address.save();
  }

  async deleteAddress(
    id: string,
    userId: string, // User ID from JWT payload
  ): Promise<void> {
    const address = await this.addressModel.findById(id).exec();

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.user.toString() !== userId) {
      throw new ConflictException('User is not authorized to delete this address');
    }

    await this.addressModel.findByIdAndRemove(id).exec();
  }
  

}
