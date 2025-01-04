import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateOrderDto } from '../dto/createOrder.dto';
import { GetOrdersDto } from '../dto/getOrders.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Order } from '../models/order';

describe('OrderController', () => {
  let controller: OrderController;

  const mockOrderService = {
    createNewOrder: jest.fn(),
    getOrders: jest.fn(),
    buyOrder: jest.fn(),
  };

  const mockUserRequest: UserRequest = {
    user: { email: 'test@example.com' },
  } as UserRequest;

  const createOrderDto: CreateOrderDto = {
    orderType: 'orderType',
    data: 'data',
  };

  const getOrdersDto: GetOrdersDto = {
    page: 1,
    limit: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNewOrder', () => {
    it('should create a new order successfully', async () => {
      mockOrderService.createNewOrder.mockResolvedValue({
        success: true,
        order: {},
      });

      const result = await controller.createNewOrder(
        createOrderDto,
        mockUserRequest,
      );
      expect(result).toEqual({ success: true, order: {} });
      expect(mockOrderService.createNewOrder).toHaveBeenCalledWith(
        createOrderDto,
        mockUserRequest,
      );
    });

    it('should throw UnauthorizedException if email is not verified', async () => {
      mockOrderService.createNewOrder.mockRejectedValue(
        new UnauthorizedException('Your email is not verified!'),
      );

      await expect(
        controller.createNewOrder(createOrderDto, mockUserRequest),
      ).rejects.toThrowError(
        new UnauthorizedException('Your email is not verified!'),
      );
    });

    it('should throw BadRequestException for invalid order type', async () => {
      mockOrderService.createNewOrder.mockRejectedValue(
        new BadRequestException('Order type is not valid'),
      );

      await expect(
        controller.createNewOrder(createOrderDto, mockUserRequest),
      ).rejects.toThrowError(
        new BadRequestException('Order type is not valid'),
      );
    });
  });

  describe('getOrders', () => {
    it('should get orders successfully', async () => {
      const mockResponse: { total: number; lastPage: number; orders: Order[] } =
        {
          total: 10,
          lastPage: 2,
          orders: [], // Здесь массив будет пустым, но с типом Order[]
        };
      mockOrderService.getOrders.mockResolvedValue(mockResponse);

      const result = await controller.getOrders(getOrdersDto, mockUserRequest);
      expect(result).toEqual(mockResponse);
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(
        getOrdersDto,
        mockUserRequest,
      );
    });

    it('should throw InternalServerErrorException when user not found', async () => {
      mockOrderService.getOrders.mockRejectedValue(
        new InternalServerErrorException('Error while getting all orders'),
      );

      await expect(
        controller.getOrders(getOrdersDto, mockUserRequest),
      ).rejects.toThrowError(
        new InternalServerErrorException('Error while getting all orders'),
      );
    });
  });

  describe('buyOrder', () => {
    it('should complete a buy order successfully', async () => {
      mockOrderService.buyOrder.mockResolvedValue({ success: true });

      const result = await controller.buyOrder(1, mockUserRequest);
      expect(result).toEqual({ success: true });
      expect(mockOrderService.buyOrder).toHaveBeenCalledWith(
        1,
        mockUserRequest,
      );
    });

    it('should throw InternalServerErrorException if order already paid', async () => {
      mockOrderService.buyOrder.mockRejectedValue(
        new InternalServerErrorException('Order already paid'),
      );

      await expect(
        controller.buyOrder(1, mockUserRequest),
      ).rejects.toThrowError(
        new InternalServerErrorException('Order already paid'),
      );
    });

    it('should throw InternalServerErrorException if not enough tokens', async () => {
      mockOrderService.buyOrder.mockRejectedValue(
        new InternalServerErrorException('Not enough tokens'),
      );

      await expect(
        controller.buyOrder(1, mockUserRequest),
      ).rejects.toThrowError(
        new InternalServerErrorException('Not enough tokens'),
      );
    });
  });
});
