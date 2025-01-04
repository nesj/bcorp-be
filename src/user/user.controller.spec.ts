import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Logger } from '@nestjs/common';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { ChangeProfileDto } from '../dto/changeProfile.dto';
import { UserRequest } from '../types/extendedExpressRequest';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
    changePassword: jest.fn(),
    changeProfile: jest.fn(),
  };

  const mockLogger = {
    error: jest.fn(),
  };

  const mockUserRequest = {
    user: { email: 'test@example.com' },
  } as UserRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Logger, useValue: mockLogger },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'hashedpassword',
      };
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockUserRequest);

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual({ email: 'test@example.com' });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('changeUsersPassword', () => {
    it('should change the user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: 'oldPassword',
        repeatPassword: 'oldPassword',
        newPassword: 'newPassword',
        repeatNewPassword: 'newPassword',
      };
      mockUserService.changePassword.mockResolvedValue(
        'Password changed successfully',
      );

      const result = await controller.changeUsersPassword(
        changePasswordDto,
        mockUserRequest,
      );

      expect(userService.changePassword).toHaveBeenCalledWith(
        changePasswordDto,
        mockUserRequest,
      );
      expect(result).toBe('Password changed successfully');
    });
  });

  describe('changeProfile', () => {
    it('should change the user profile', async () => {
      const changeProfileDto: ChangeProfileDto = {
        newName: 'NewName',
        newSurname: 'NewSurname',
        newEmail: '',
      };
      mockUserService.changeProfile.mockResolvedValue(
        'Profile updated successfully',
      );

      const result = await controller.changeProfile(
        changeProfileDto,
        mockUserRequest,
      );

      expect(userService.changeProfile).toHaveBeenCalledWith(
        changeProfileDto,
        mockUserRequest,
      );
      expect(result).toBe('Profile updated successfully');
    });
  });
});
