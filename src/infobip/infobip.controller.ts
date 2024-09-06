import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { InfobipService } from './infobip.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller('sms')
export class InfobipController {
  constructor(private readonly infobipService: InfobipService) {}

  @Post('received')
  @UseGuards(AuthGuard)
  @ApiResponse({ status: 200, description: 'OTP created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Error' })
  @ApiBearerAuth()
  async sendSms(@Res() res: Response, @Req() req: Request) {
    try {
      const user = req['user'];
      const result = await this.infobipService.sendSms(Number(user.id));
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: result
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: error.message,
      });
    }
  }
}
