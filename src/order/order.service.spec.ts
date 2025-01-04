import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../models/order';
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRequest } from '../types/extendedExpressRequest';

describe('OrderService', () => {
  let service: OrderService;

  const mockUserService = {
    findByEmail: jest.fn(),
    saveUser: jest.fn(),
  };

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRequest = {
    user: { email: 'test@example.com' },
  } as UserRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: UserService, useValue: mockUserService },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewOrder', () => {
    it('should create a new order and reduce tokens', async () => {
      const createOrderDto = { orderType: 'orderType', data: 'data' };

      const user = {
        email: 'test@example.com',
        emailVerified: true,
        tokens: 10,
      };
      const order = { orderType: 'orderType', data: 'data', paid: false };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockOrderRepository.create.mockReturnValue(order);
      mockOrderRepository.save.mockResolvedValue(order);

      await expect(
        service.createNewOrder(createOrderDto, mockUserRequest),
      ).resolves.toEqual({
        success: true,
        order,
      });
      expect(mockUserService.saveUser).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException if data is missing', async () => {
      const createOrderDto = { orderType: 'orderType1', data: '' };

      await expect(
        service.createNewOrder(createOrderDto, mockUserRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if email is not verified', async () => {
      const createOrderDto = { orderType: 'orderType1', data: 'data' };

      const user = {
        email: 'test@example.com',
        emailVerified: false,
        tokens: 10,
      };

      mockUserService.findByEmail.mockResolvedValue(user);

      await expect(
        service.createNewOrder(createOrderDto, mockUserRequest),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if order type is invalid', async () => {
      const createOrderDto = { orderType: 'invalidType', data: 'data' };

      const user = {
        email: 'test@example.com',
        emailVerified: true,
        tokens: 10,
      };
      mockUserService.findByEmail.mockResolvedValue(user);

      await expect(
        service.createNewOrder(createOrderDto, mockUserRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrders', () => {
    it('should return a list of orders', async () => {
      const getOrdersDto = { page: 1, limit: 10 };

      const user = {
        email: 'test@example.com',
        emailVerified: true,
        tokens: 10,
      };
      const orders = [{ id: 1, orderType: 'orderType1', data: 'data' }];
      const total = 1;

      mockUserService.findByEmail.mockResolvedValue(user);
      mockOrderRepository.findAndCount.mockResolvedValue([orders, total]);

      const result = await service.getOrders(getOrdersDto, mockUserRequest);

      expect(result.total).toBe(total);
      expect(result.orders).toEqual(orders);
    });

    it('should throw InternalServerErrorException if no user is found', async () => {
      const getOrdersDto = { page: 1, limit: 10 };

      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.getOrders(getOrdersDto, mockUserRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('buyOrder', () => {
    it('should allow a user to buy an order if they have enough tokens', async () => {
      const orderId = 1;

      const user = {
        email: 'test@example.com',
        emailVerified: true,
        tokens: 10,
      };
      const order = {
        id: 1,
        orderType: 'orderType1',
        data: 'data',
        paid: false,
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockOrderRepository.findOne.mockResolvedValue(order);
      mockOrderRepository.save.mockResolvedValue(order);
      mockUserService.saveUser.mockResolvedValue(user);

      await expect(service.buyOrder(orderId, mockUserRequest)).resolves.toEqual(
        {
          success: true,
        },
      );
      expect(mockUserService.saveUser).toHaveBeenCalledWith(user);
    });

    it('should throw InternalServerErrorException if order is not found', async () => {
      const orderId = 1;

      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.buyOrder(orderId, mockUserRequest)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if user does not have enough tokens', async () => {
      const orderId = 1;

      const user = {
        email: 'test@example.com',
        emailVerified: true,
        tokens: 0,
      };
      const order = {
        id: 1,
        orderType: 'orderType',
        data: 'data',
        paid: false,
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockOrderRepository.findOne.mockResolvedValue(order);

      await expect(service.buyOrder(orderId, mockUserRequest)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if order is already paid', async () => {
      const orderId = 1;

      const user = {
        email: 'test@example.com',
        emailVerified: true,
        tokens: 10,
      };
      const order = {
        id: 1,
        orderType: 'orderType1',
        data: 'data',
        paid: true,
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      mockOrderRepository.findOne.mockResolvedValue(order);

      await expect(service.buyOrder(orderId, mockUserRequest)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
