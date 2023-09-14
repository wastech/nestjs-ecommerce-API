import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderItemDto } from './dto/create.orderitem.dto';
import { OrderItemDto } from './dto/create-order.dto';
// import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface';
import { Order } from './entities/order.entity';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBearerAuth() // Specify that bearer token authorization is required for this endpoint
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or missing token' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: any,
  ): Promise<Order> {
    const userId = req.user.id;
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get orders' })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [Order],
  })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  async getOrders(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.orderService.getOrders(page, limit);
  }

  @Delete(':orderId')
  @ApiOperation({ summary: 'Delete an order by ID' })
  @ApiBearerAuth() // Specify that bearer token authorization is required for this endpoint
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or missing token' })
  async deleteOrder(
    @Param('orderId') orderId: string,
    @Req() req,
  ): Promise<void> {
    const userId = req.user.id; // Assuming you have implemented authentication

    await this.orderService.deleteOrder(orderId, userId);
  }

  @Post(':orderId/orderItems')
  @ApiOperation({ summary: 'Create an order item for an order' })
  @ApiBearerAuth() // Specify that bearer token authorization is required for this endpoint
  @ApiParam({ name: 'orderId', description: 'Order ID', type: String })
  @ApiResponse({ status: 201, description: 'Order item created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or missing token' })
  async createOrderItem(
    @Body() orderItemDto: OrderItemDto,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.createOrderItem(orderId, orderItemDto);
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get orders by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [Order],
  })
  @ApiBadRequestResponse({ description: 'Bad request or missing data' })
  async getOrdersByUser(
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    return this.orderService.getOrdersByUser(userId, page, limit);
  }
}
