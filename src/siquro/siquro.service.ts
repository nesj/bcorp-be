import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../models/transaction';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from '../dto/createTransaction.dto';
import { UserRequest } from '../types/extendedExpressRequest';
import { UserService } from '../user/user.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user';
import { SiquroWebhookDto } from '../dto/siquroWebhook.dto';
import * as crypto from 'crypto';
import { PacksPrices } from '../enums/packsPricesEnum';
import { PacksTokens } from '../enums/packsTokensEnum';
import { SiquroWebhook } from '../models/siquroWebhook';

@Injectable()
export class SiquroService {
  private readonly logger = new Logger(SiquroService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(SiquroWebhook)
    private readonly webhookRepository: Repository<SiquroWebhook>,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    req: UserRequest,
  ): Promise<{ success: boolean; paymentUrl?: string }> {
    const { countryCode, type, pack, tokens } = createTransactionDto;
    const userEmail = req.user.email;

    const existingUser = await this.userService.findByEmail(userEmail, false);

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    if (!existingUser.name || !existingUser.surname) {
      throw new BadRequestException('User doesnt have name or surname');
    }

    if (!existingUser.emailVerified) {
      throw new BadRequestException('Your email is not verificated');
    }

    let amount: number;
    let packTokens: number;

    if (type === 'packs') {
      amount = PacksPrices[pack];
      packTokens = PacksTokens[pack];
    } else if (type === 'custom') {
      amount = tokens * Number(process.env.TOKEN_PRICE);
    }

    const returnUrl = `${process.env.FRONTEND_URL}/dashboard?redirect=true`;
    const webhookUrl = `${process.env.BACKEND_URL}/siquro/webhook`;

    const bodyForSiquro = {
      merchantId: process.env.SIQURO_MERCHANT_ID,
      amount: Number(amount),
      email: userEmail,
      firstName: existingUser.name,
      lastName: existingUser.surname,
      returnUrl: returnUrl,
      webhookUrl: webhookUrl,
      provider: 'paidby',
      countryCode,
    };

    const siquroResponse = await firstValueFrom(
      this.httpService.post(`${process.env.SIQURO_GATE_URL}/`, bodyForSiquro, {
        headers: {
          Authorization: `Basic ${process.env.SIQURO_MERCHANT_ENCODED_KEY}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    const siquroTransaction = siquroResponse.data;

    const createdInternalTransaction = await this.createInternalTransaction(
      packTokens ? packTokens : tokens,
      amount,
      siquroTransaction,
      existingUser,
    );

    if (createdInternalTransaction) {
      return { success: true, paymentUrl: siquroTransaction.paymentUrl };
    }
  }

  async createInternalTransaction(
    tokens: number,
    amount: number,
    siquroTransaction: any,
    user: User,
  ): Promise<{ success: boolean }> {
    const transaction = this.transactionRepository.create({
      originalRequest: siquroTransaction,
      siquroId: siquroTransaction.id,
      status: siquroTransaction.status,
      amount: amount,
      tokens: tokens,
      user,
    });

    await this.transactionRepository.save(transaction);

    return { success: true };
  }

  async newWebhook(
    siquroWebhookDto: SiquroWebhookDto,
    signature: string,
    timestamp: string,
  ) {
    const { txId, status } = siquroWebhookDto;
    const transaction = await this.transactionRepository.findOne({
      where: { siquroId: txId },
      relations: ['user'],
    });

    if (!transaction) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }

    const newWebhook = this.webhookRepository.create({
      transaction,
      status,
    });

    await this.webhookRepository.save(newWebhook);

    const tokenApiSecret = process.env.SIQURO_API_SECRET;

    const rawRequestBody = JSON.stringify(siquroWebhookDto);
    const signedPayload = timestamp + '.' + rawRequestBody;

    const expectedSignature = crypto
      .createHmac('sha256', tokenApiSecret)
      .update(signedPayload)
      .digest('hex');

    if (this.compareSignatures(signature, expectedSignature)) {
      newWebhook.webhookVerified = true;
      await this.webhookRepository.save(newWebhook);

      if (
        status === 'PAYMENT_COMPLETE' &&
        transaction.status !== 'PAYMENT_COMPLETE'
      ) {
        transaction.status = status;
        transaction.user.tokens += transaction.tokens;

        await this.webhookRepository.save(newWebhook);
        await this.transactionRepository.save(transaction);
        await this.userService.saveUser(transaction.user);
      }

      throw new HttpException('Successfully', HttpStatus.OK);
    } else {
      this.logger.warn('Invalid signature');
      throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
    }
  }

  private compareSignatures(
    signature: string,
    expectedSignature: string,
  ): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
