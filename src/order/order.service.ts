import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../models/order';
import { Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import { UserService } from '../user/user.service';
import { orderPrice } from '../enums/orderPriceEnum';
import { GetOrdersDto } from '../dto/getOrders.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UserService,
  ) {}

  async createNewOrder(
    createOrderDto: CreateOrderDto,
    req: UserRequest,
  ): Promise<{ success: boolean; order: Order }> {
    const { orderType, data } = createOrderDto;

    if (!data) {
      throw new BadRequestException('No data to create an order');
    }

    const userEmail = req.user.email;
    const existingUser = await this.userService.findByEmail(userEmail);

    if (!existingUser.emailVerified) {
      throw new UnauthorizedException('Your email is not verified!');
    }

    if (orderPrice[orderType as keyof typeof orderPrice]) {
      const price = orderPrice[orderType as keyof typeof orderPrice];
      const newOrder = this.orderRepository.create({
        orderType,
        data,
        user: existingUser,
      });
      await this.orderRepository.save(newOrder);

      if (existingUser.tokens >= price) {
        existingUser.tokens -= price;
        newOrder.paid = true;

        await this.orderRepository.save(newOrder);
      }

      await this.userService.saveUser(existingUser);

      return { success: true, order: newOrder };
    } else {
      throw new BadRequestException('Order type is not valid');
    }
  }

  async getOrders(
    getOrdersDto: GetOrdersDto,
    req: UserRequest,
  ): Promise<{ total: number; lastPage: number; orders: Order[] }> {
    const { page, limit } = getOrdersDto;
    const email = req.user.email;

    const existingUser = await this.userService.findByEmail(email, false);

    if (!existingUser) {
      this.logger.error('Error getOrders: no existing user');
      throw new InternalServerErrorException('Error while getting all orders');
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: existingUser },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const lastPage = Math.ceil(total / limit);

    return {
      total,
      lastPage,
      orders,
    };
  }

  async buyOrder(
    orderId: number,
    req: UserRequest,
  ): Promise<{ success: boolean }> {
    const email = req.user.email;
    const existingUser = await this.userService.findByEmail(email, false);

    if (!existingUser) {
      this.logger.error('Error buyOrder: no existing user');
      throw new InternalServerErrorException('Error while buying order');
    }

    const order = await this.getOrderById(orderId);

    if (!order) {
      this.logger.error('Error buyOrder: order not found');
      throw new InternalServerErrorException('Order not found');
    }

    if (order.paid) {
      throw new InternalServerErrorException('Order already paid');
    }

    const price = orderPrice[order.orderType as keyof typeof orderPrice];

    if (existingUser.tokens < price) {
      throw new InternalServerErrorException('Not enough tokens');
    }

    existingUser.tokens -= price;
    order.paid = true;

    await this.userService.saveUser(existingUser);
    await this.orderRepository.save(order);

    return { success: true };
  }

  async getOrderById(orderId: number) {
    return await this.orderRepository.findOne({
      where: { id: orderId },
    });
  }
}
