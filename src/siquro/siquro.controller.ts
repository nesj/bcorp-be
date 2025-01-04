import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { SiquroService } from './siquro.service';
import { UserRequest } from '../types/extendedExpressRequest';
import { CreateTransactionDto } from '../dto/createTransaction.dto';
import { SiquroWebhookDto } from '../dto/siquroWebhook.dto';

@Controller('siquro')
export class SiquroController {
  private readonly logger = new Logger(SiquroController.name);

  constructor(private readonly siquroService: SiquroService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-transaction')
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: UserRequest,
  ) {
    try {
      return await this.siquroService.createTransaction(
        createTransactionDto,
        req,
      );
    } catch (error) {
      this.logger.error('create-transaction error: ', error.message);

      throw new HttpException(error.message, error.status || 500);
    }
  }

  @Post('webhook')
  async newWebhook(
    @Body() siquroWebhookDto: SiquroWebhookDto,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      const signature = headers['X-SIQ-SIGNATURE'];
      const timestamp = headers['X-SIQ-TIMESTAMP'];

      return await this.siquroService.newWebhook(
        siquroWebhookDto,
        signature,
        timestamp,
      );
    } catch (error) {
      this.logger.error('webhook error: ', error.message);

      throw new HttpException(error.message, error.status || 500);
    }
  }
}
