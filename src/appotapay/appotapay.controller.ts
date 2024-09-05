import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppotapayService } from './appotapay.service';
import { Response } from 'express';

@Controller('appotapay')
export class AppotapayController {
  constructor(private readonly appotaPayService: AppotapayService) {}

  @Get('redirect')
  async paymentResult(@Query('data') data: string, @Res() res: Response) {
    try {
      const result = await this.appotaPayService.processingReturnedResult(data);

      return result === 'success'
        ? res.redirect(`https://teksport-nu.vercel.app/result?isSuccess=true`)
        : res.redirect(`https://teksport-nu.vercel.app/result?isSuccess=false`);
    } catch (error) {
      return res
        .status(HttpStatus.BAD_GATEWAY)
        .json({ message: 'Payment fail' });
    }
  }
}
