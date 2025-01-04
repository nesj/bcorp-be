import {
  Controller,
  Logger,
  UseGuards,
  Request,
  Body,
  Post,
  HttpException,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { OrderService } from './order.service';
import { UserRequest } from '../types/extendedExpressRequest';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { GetOrdersDto } from '../dto/getOrders.dto';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post('/')
  async getOrders(
    @Body() getOrdersDto: GetOrdersDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.orderService.getOrders(getOrdersDto, req);
    } catch (error) {
      this.logger.error('get orders error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post('create')
  async createNewOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.orderService.createNewOrder(createOrderDto, req);
    } catch (error) {
      this.logger.error('create order error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Get('buy')
  async buyOrder(
    @Query('orderId') orderId: number,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.orderService.buyOrder(orderId, req);
    } catch (error) {
      this.logger.error('buy order error: ', error.message);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
