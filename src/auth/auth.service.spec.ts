import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginUserDto } from '../dto/loginUser.dto';
import { GoogleUser } from '../types/googleUserInterface';
import { User } from '../models/user';
jest.mock('../user/user.service');
jest.mock('generate-password');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: UserService;
  let mockJwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUserService = module.get<UserService>(UserService);
    mockJwtService = module.get<JwtService>(JwtService);

    mockJwtService.verify = jest.fn();
    mockUserService.findByEmail = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecoveryToken', () => {
    it('should throw an error if email does not exist', async () => {
      const createRecoveryTokenDto = { email: 'nonexistent@example.com' };

      mockUserService.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(
        service.createRecoveryToken(createRecoveryTokenDto),
      ).rejects.toThrowError(new BadRequestException('Email does not exist'));
    });

    it('should return success when email exists', async () => {
      const createRecoveryTokenDto = { email: 'existing@example.com' };
      const existingUser = { id: 1, email: 'existing@example.com' };

      mockUserService.findByEmail = jest.fn().mockResolvedValue(existingUser);

      mockJwtService.sign = jest.fn().mockReturnValue('recovery-token');

      mockJwtService.verify = jest
        .fn()
        .mockReturnValue({ email: 'existing@example.com' });

      const result = await service.createRecoveryToken(createRecoveryTokenDto);

      expect(result.success).toBe(true);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        createRecoveryTokenDto.email,
        false,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: existingUser.email,
      });
    });
  });

  describe('passwordRecoveryVerify', () => {
    it('should return false if the token is invalid', async () => {
      const token = 'invalid-token';

      mockJwtService.verify = jest.fn().mockReturnValue(null);

      const result = await service.passwordRecoveryVerify(token);

      expect(result.success).toBe(false);
    });

    it('should return true if the token is valid and the user exists', async () => {
      const token = 'valid-token';
      const email = 'valid@example.com';

      mockJwtService.verify = jest
        .fn()
        .mockReturnValue({ email: 'valid@example.com' });

      mockUserService.findByEmail = jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'valid@example.com' });

      const result = await service.passwordRecoveryVerify(token);

      expect(result.success).toBe(true);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email, false);
    });

    it('should return false if the token is valid but the user does not exist', async () => {
      const token = 'valid-token';

      mockJwtService.verify = jest
        .fn()
        .mockReturnValue({ email: 'nonexistent@example.com' });

      mockUserService.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await service.passwordRecoveryVerify(token);

      expect(result.success).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'John',
        surname: 'Doe',
        regType: 'form',
        password: 'password123',
        repeatPassword: 'password123',
      };

      const newUser = {
        email: createUserDto.email,
        name: createUserDto.name,
        surname: createUserDto.surname,
        id: 1,
        tokens: 0,
        emailVerified: false,
      };

      mockUserService.register = jest.fn().mockResolvedValue(newUser);

      mockJwtService.sign = jest.fn().mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);

      expect(result.user).toEqual(newUser);
      expect(result.token).toEqual('jwt-token');
      expect(mockUserService.register).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
        tokens: newUser.tokens,
        emailVerified: newUser.emailVerified,
      });
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'login@example.com',
        password: 'password123',
      };

      const user: User = {
        id: 1,
        email: loginUserDto.email,
        name: 'John',
        surname: 'Doe',
        password: 'password123',
        emailVerificationToken: '',
        registrationType: 'form',
        tokens: 0,
        emailVerified: false,
        role: '',
        orders: [],
        transactions: [],
      };

      mockUserService.login = jest.fn().mockResolvedValue(loginUserDto);
      mockJwtService.sign = jest.fn().mockReturnValue('jwt-token');

      const result = await service.login(loginUserDto);

      expect(result.user).toEqual(loginUserDto);
      expect(result.token).toEqual('jwt-token');
      expect(mockUserService.login).toHaveBeenCalledWith(loginUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email });
    });
  });

  describe('callbackFromGoogle', () => {
    it('should return token for existing user', async () => {
      const googleUser: GoogleUser = {
        email: 'googleuser@example.com',
        firstName: 'John',
        accessToken: '',
        picture: '',
      };

      const existingUser = {
        id: 1,
        email: 'googleuser@example.com',
        name: 'John',
        surname: '',
        emailVerified: true,
        tokens: 0,
      };

      const token = 'existingUserToken';

      mockUserService.findByEmail = jest.fn().mockResolvedValue(existingUser);
      mockJwtService.sign = jest.fn().mockReturnValue(token);

      const result = await service.callbackFromGoogle(googleUser);

      expect(result.token).toEqual(token);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        googleUser.email,
        false,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        surname: existingUser.surname,
        tokens: existingUser.tokens,
        emailVerified: existingUser.emailVerified,
      });
    });

    it('should register a new user and return token for non-existing user', async () => {
      const googleUser: GoogleUser = {
        email: 'nonexistentuser@example.com',
        firstName: 'Jane',
        accessToken: '',
        picture: '',
      };

      mockUserService.findByEmail = jest.fn().mockResolvedValue(null);

      mockUserService.register = jest.fn().mockResolvedValue({
        id: 1,
        email: googleUser.email,
        name: googleUser.firstName,
      });

      mockJwtService.sign = jest.fn().mockReturnValue('newUserToken');

      const result = await service.callbackFromGoogle(googleUser);

      expect(result.token).toEqual('newUserToken');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(
        googleUser.email,
        false,
      );
      expect(mockUserService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: googleUser.email,
          name: googleUser.firstName,
          surname: '',
          regType: 'Google',
        }),
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });
});
