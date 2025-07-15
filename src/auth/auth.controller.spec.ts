import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, HttpException } from '@nestjs/common';
import { rolesEnum } from 'src/enums/rolesEnum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createRecoveryToken: jest.fn(),
            recoverPassword: jest.fn(),
            passwordRecoveryVerify: jest.fn(),
            verifyNewEmail: jest.fn(),
            register: jest.fn(),
            login: jest.fn(),
            callbackFromGoogle: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRecoveryToken', () => {
    it('should call authService.createRecoveryToken and return success', async () => {
      const createRecoveryTokenDto = { email: 'test@example.com' };
      jest
        .spyOn(authService, 'createRecoveryToken')
        .mockResolvedValue({ success: true });

      const result = await controller.createRecoveryToken(createRecoveryTokenDto);
      expect(result).toEqual({ success: true });
    });

    it('should throw BadRequestException if email does not exist', async () => {
      const createRecoveryTokenDto = { email: 'nonexistent@example.com' };
      jest
        .spyOn(authService, 'createRecoveryToken')
        .mockRejectedValue(new BadRequestException('Email does not exist'));

      await expect(
        controller.createRecoveryToken(createRecoveryTokenDto),
      ).rejects.toThrowError(new BadRequestException('Email does not exist'));
    });
  });

  describe('passwordRecovery', () => {
    it('should call authService.recoverPassword and return success', async () => {
      const dto = {
        newPassword: 'newpassword',
        repeatNewPassword: 'newpassword',
        token: 'validToken',
      };
      jest.spyOn(authService, 'recoverPassword').mockResolvedValue({ success: true, token: 'newValidToken' });

      const result = await controller.passwordRecovery(dto);
      expect(result).toEqual({ success: true, token: 'newValidToken' });
    });

    it('should throw HttpException if recoverPassword fails', async () => {
      const dto = {
        newPassword: 'newpassword',
        repeatNewPassword: 'newpassword',
        token: 'invalidToken',
      };
      jest.spyOn(authService, 'recoverPassword').mockRejectedValue(new HttpException('Recovery failed', 500));

      await expect(controller.passwordRecovery(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('verifyPasswordRecovery', () => {
    it('should call authService.passwordRecoveryVerify and return success', async () => {
      jest.spyOn(authService, 'passwordRecoveryVerify').mockResolvedValue({ success: true });

      const result = await controller.verifyPasswordRecovery('validToken');
      expect(result).toEqual({ success: true });
    });

    it('should throw HttpException if token is invalid', async () => {
      jest.spyOn(authService, 'passwordRecoveryVerify').mockRejectedValue(new HttpException('Invalid token', 400));

      await expect(controller.verifyPasswordRecovery('invalidToken')).rejects.toThrow(HttpException);
    });
  });

  describe('verifyNewEmail', () => {
    it('should call authService.verifyNewEmail and return success', async () => {
      jest.spyOn(authService, 'verifyNewEmail').mockResolvedValue({
        success: true,
        token: 'newValidToken',
        newEmail: 'new@example.com',
      });

      const result = await controller.veryfyNewEmail('validToken');
      expect(result).toEqual({
        success: true,
        token: 'newValidToken',
        newEmail: 'new@example.com',
      });
    });

    it('should throw HttpException if token verification fails', async () => {
      jest.spyOn(authService, 'verifyNewEmail').mockRejectedValue(new HttpException('Invalid token', 400));

      await expect(controller.veryfyNewEmail('invalidToken')).rejects.toThrow(HttpException);
    });
  });

  describe('register', () => {
    it('should call authService.register and return user and token', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'John',
        surname: 'Doe',
        regType: 'form',
        password: 'password123',
        repeatPassword: 'password123',
        role: rolesEnum.STUDENT,
        birthDate: '2000-01-01',
        locale: 'en',
      };

      jest.spyOn(authService, 'register').mockResolvedValue({
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'John',
          surname: 'Doe',
          password: 'password123',
          emailVerificationToken: '',
          registrationType: 'form',
          tokens: 0,
          emailVerified: false,
          role: rolesEnum.STUDENT,
          orders: [],
          transactions: [],
          descr: null,
          avatar: null,
          smallAvatar: null,
          birthDate: null,
          teacherLessons: [],
          studentLessons: [],
        },
        token: 'mock-token',
      });

      const result = await controller.register(createUserDto);
      expect(result).toEqual({
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'John',
          surname: 'Doe',
          password: 'password123',
          emailVerificationToken: '',
          registrationType: 'form',
          tokens: 0,
          emailVerified: false,
          role: rolesEnum.STUDENT,
          orders: [],
          transactions: [],
          descr: null,
          avatar: null,
          smallAvatar: null,
          birthDate: null,
          teacherLessons: [],
          studentLessons: [],
        },
        token: 'mock-token',
      });
    });

    it('should throw HttpException if registration fails', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'John',
        surname: 'Doe',
        regType: 'form',
        password: 'password123',
        repeatPassword: 'password123',
        role: rolesEnum.STUDENT,
        birthDate: '2000-01-01',
        locale: 'en',
      };
      jest.spyOn(authService, 'register').mockRejectedValue(new HttpException('Registration failed', 500));

      await expect(controller.register(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should call authService.login and return user and token', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'John',
          surname: 'Doe',
          password: 'password123',
          emailVerificationToken: '',
          registrationType: 'form',
          tokens: 0,
          emailVerified: false,
          role: rolesEnum.STUDENT,
          orders: [],
          transactions: [],
          descr: null,
          avatar: null,
          smallAvatar: null,
          birthDate: null,
          teacherLessons: [],
          studentLessons: [],
        },
        token: 'validToken',
      });

      const result = await controller.login(loginUserDto);
      expect(result).toEqual({
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'John',
          surname: 'Doe',
          password: 'password123',
          emailVerificationToken: '',
          registrationType: 'form',
          tokens: 0,
          emailVerified: false,
          role: rolesEnum.STUDENT,
          orders: [],
          transactions: [],
          descr: null,
          avatar: null,
          smallAvatar: null,
          birthDate: null,
          teacherLessons: [],
          studentLessons: [],
        },
        token: 'validToken',
      });
    });

    it('should throw HttpException if login fails', async () => {
      const loginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      jest.spyOn(authService, 'login').mockRejectedValue(new HttpException('Login failed', 401));

      await expect(controller.login(loginUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect to frontend with token', async () => {
      const googleUser = { email: 'test@example.com', firstName: 'John' };
      const response = { redirect: jest.fn() };
      jest.spyOn(authService, 'callbackFromGoogle').mockResolvedValue({ token: 'validToken' });

      await controller.googleAuthRedirect({ user: googleUser }, response as any);

      expect(response.redirect).toHaveBeenCalledWith(
        `${process.env.FRONTEND_URL}/auth/callback?token=validToken`,
      );
    });

    it('should throw HttpException if google callback fails', async () => {
      const googleUser = { email: 'test@example.com', firstName: 'John' };
      const response = { redirect: jest.fn() };
      jest.spyOn(authService, 'callbackFromGoogle').mockRejectedValue(new HttpException('Google login failed', 500));

      await expect(
        controller.googleAuthRedirect({ user: googleUser }, response as any),
      ).rejects.toThrow(HttpException);
    });
  });
});
