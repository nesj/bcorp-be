import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../models/user';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginUserDto } from '../dto/loginUser.dto';
import { ChangePasswordDto } from '../dto/changePassword.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import { ChangeProfileDto } from '../dto/changeProfile.dto';
import { JwtService } from '@nestjs/jwt';
import { PasswordRecoveryDTO } from '../dto/passwordRecovery.dto';
import { UpdateProfileDto } from '../dto/updateProfile.dto';
import { GetProfileInfoDto } from '../dto/getProfileInfo.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async recoverPassword(
    passwordRecoveryDto: PasswordRecoveryDTO,
  ): Promise<{ success: boolean; token: string }> {
    const { token, newPassword, repeatNewPassword } = passwordRecoveryDto;
    const { email } = this.jwtService.verify(token);

    if (!email) {
      throw new BadRequestException('Error: token is incorrect');
    }

    const existingUser = await this.findByEmail(email, false);

    if (!existingUser) {
      throw new BadRequestException('Error: token is incorrect');
    }

    if (newPassword !== repeatNewPassword) {
      throw new BadRequestException('The passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedPassword;

    const saved = await this.saveUser(existingUser);

    const newToken = this.generateJwt(existingUser);

    if (saved) {
      return { success: true, token: newToken };
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const {
      email,
      password,
      repeatPassword,
      name,
      surname,
      regType,
      birthDate,
      locale,
      role,
    } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    if (password !== repeatPassword) {
      throw new BadRequestException('Password missmatch');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      surname,
      role,
      registrationType: regType,
      emailVerified: regType === 'Google' ? true : false,
      birthDate,
    });

    await this.userRepository.save(newUser);

    if (regType.toLowerCase() === 'form') {
      const emailToken = this.generateEmailJwt(newUser.id, newUser.email);

      newUser.emailVerificationToken = emailToken;
      // for future
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const verifyEmailUrl = `${process.env.FRONTEND_URL}/${locale}/verify-new-email?token=${newUser.emailVerificationToken}`;
      console.log('verifyEmailUrl: ', verifyEmailUrl);

      await this.userRepository.save(newUser);
    }

    delete newUser.password;

    return newUser;
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }],
    });

    if (!existingUser) {
      throw new BadRequestException('User with this email does not exist');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Wrong password');
    }

    delete existingUser.password;

    return existingUser;
  }

  async findByEmail(email: string, throwError: boolean = true): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }],
      select: [
        'id',
        'email',
        'name',
        'role',
        'surname',
        'tokens',
        'emailVerified',
        'subjects',
      ],
    });

    if (!existingUser && throwError) {
      throw new BadRequestException('User with this email does not exist');
    }

    return existingUser;
  }

  async findById(id: number, req?: UserRequest): Promise<User> {

    const existingUser = await this.userRepository.findOne({
      where: [{ id }],
    });

    if (!existingUser) {
      throw new BadRequestException('User with this id does not exist');
    }

    return existingUser;
  }

  async saveUser(user: DeepPartial<User>): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!existingUser) {
      throw new BadRequestException('User with this id does not exist');
    }

    Object.assign(existingUser, user);
    await this.userRepository.save(existingUser);

    return true;
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    req: UserRequest,
  ): Promise<{ success: boolean }> {
    const { password, repeatPassword, newPassword, repeatNewPassword } =
      changePasswordDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email: req.user.email }],
    });

    if (!existingUser) {
      throw new InternalServerErrorException('User not found');
    }

    if (password !== repeatPassword) {
      throw new BadRequestException('Old passwords do not match');
    }

    if (newPassword !== repeatNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Wrong password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    existingUser.password = hashedNewPassword;
    await this.userRepository.save(existingUser);

    return { success: true };
  }

  async changeProfile(
    changeProfileDto: ChangeProfileDto,
    req: UserRequest,
  ): Promise<{ success: boolean; newEmail: boolean; token: string }> {
    const { newName, newSurname, newEmail } = changeProfileDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email: req.user.email }],
    });

    const userFromRequest = newEmail
      ? await this.userRepository.findOne({
          where: [{ email: newEmail }],
        })
      : undefined;

    if (!existingUser) {
      throw new InternalServerErrorException('User not found');
    }

    if (userFromRequest) {
      throw new BadRequestException('Email already exists');
    }

    let emailChanged: boolean = false;

    if (newName) {
      existingUser.name = newName;
    }

    if (newSurname) {
      existingUser.surname = newSurname;
    }

    if (newEmail) {
      existingUser.emailVerificationToken = this.generateEmailJwt(
        existingUser.id,
        newEmail,
      );
      emailChanged = true;
      // for future
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const verifyEmailUrl = `${process.env.FRONTEND_URL}/auth/verify-new-email?token=${existingUser.emailVerificationToken}`;

      console.log('verifyNewEmailLink: ', verifyEmailUrl);
    }

    await this.userRepository.save(existingUser);

    const token = this.generateJwt(existingUser);

    return { success: true, newEmail: emailChanged, token: token };
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    req: UserRequest,
  ): Promise<{ success: boolean }> {
    const { fields, values } = updateProfileDto;

    if (fields.length !== values.length) {
      throw new BadRequestException('Fields and values length mismatch.');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email: req.user.email }],
    });

    fields.forEach((field, index) => {
      const key = field as keyof typeof existingUser;

      if (key in existingUser) {
        if (
          typeof existingUser[key] === typeof values[index] ||
          existingUser[key] === null
        ) {
          existingUser[key] = values[index] as never;
        } else {
          throw new BadRequestException(
            `Invalid type for field '${field}'. Expected '${typeof existingUser[key]}'.`,
          );
        }
      } else {
        throw new BadRequestException(
          `Field '${field}' does not exist on user entity.`,
        );
      }
    });

    await this.saveUser(existingUser);

    return { success: true };
  }

  async getProfileInfo(
    getProfileInfoDTO: GetProfileInfoDto,
  ): Promise<Partial<User>> {
    const { select, email, id } = getProfileInfoDTO;

    const user = await this.userRepository.findOne({
      where: email ? { email } : id ? { id } : undefined,
      select: select,
    });

    return user;
  }

  generateEmailJwt(userId: number, newEmail: string): string {
    return this.jwtService.sign(
      {
        userId: userId,
        newEmail: newEmail,
      },
      { expiresIn: '10000y' },
    );
  }

  generateJwt(user: User): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      tokens: user.tokens,
      emailVerified: user.emailVerified,
    });
  }
}
