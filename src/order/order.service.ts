import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create.orderitem.dto';

import { Order, OrderDocument } from './entities/order.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { JwtPayload } from '../user/interfaces/jwt-payload.interface';
import { Product } from '../product/entities/product.entity';
import { OrderItem, OrderItemDocument } from './entities/order-item.entity';
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    // Calculate totalItemPrice based on the prices of items in createOrderDto
    const totalItemPrice = createOrderDto.orderItems.reduce(
      (total, item) => total + item.price,
      0,
    );

    // Calculate taxPrice and shippingPrice (you can adjust the calculations as needed)
    const taxRate = 0.1; // Example tax rate of 10%
    const shippingFee = 5; // Example shipping fee
    const taxPrice = totalItemPrice * taxRate;
    const shippingPrice = shippingFee;

    // Calculate the final total price
    const totalPrice = totalItemPrice + taxPrice + shippingPrice;

    const createdOrder = new this.orderModel({
      ...createOrderDto,
      userId: userId,
      totalPrice: totalPrice,
      taxPrice: taxPrice,
      shippingPrice: shippingPrice,
    });
    return createdOrder.save();
  }

  async createOrderItem(
    orderId: string,
    orderItemDto: OrderItemDto,
  ): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.orderItems.push(orderItemDto);
    return order.save();
  }

  async getOrders(page: number, limit: number): Promise<any> {
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const totalOrders = await this.orderModel.countDocuments().exec();

    const orders = await this.orderModel
      .find()
      .sort({ createdAt: 'desc' })
      .skip(startIndex)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(totalOrders / limit);

    const groupedOrders = await this.groupOrdersByDate();

    return {
      orders,
      totalPages,
      groupedOrders,
    };
  }
  async groupOrdersByDate(): Promise<any> {
    return this.orderModel
      .aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$totalPrice' },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .exec();
  }

  async getOrdersByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    const startIndex = (page - 1) * limit;

    const totalOrders = await this.orderModel
      .countDocuments({ user: userId })
      .exec();

    const orders = await this.orderModel
      .find({ userId: userId })
      .sort({ createdAt: 'desc' })
      .skip(startIndex)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(totalOrders / limit);

    const groupedOrders = await this.groupOrdersByDate();

    return {
      orders,
      totalPages,
      groupedOrders,
    };
  }

  async deleteOrder(orderId: string, userId: string): Promise<void> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this order',
      );
    }

    await this.orderModel.deleteOne({ _id: orderId }).exec();
  }
}
