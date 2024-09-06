import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import * as speakeasy from 'speakeasy';

@Injectable()
export class InfobipService {
  private apiUrl: string;
  private url: string;
  private apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.url = this.configService.get<string>('INFOBIP_BASE_URL');
    this.apiKey = this.configService.get<string>('INFOBIP_API_KEY');
    this.apiUrl = `https://${this.url}/sms/2/text/advanced`;
  }
  private otpCache = new Map<string, { otp: string; expiresAt: number }>();

  private convertPhoneNumber (phoneNumber: string): string {
    if (phoneNumber.startsWith('0')) {
      return '+84' + phoneNumber.slice(1);
    }
    return phoneNumber;
  }

  private saveOTPToMemory(phoneNumber: string, otp: string) {
    const expiresAt = Date.now() + 120000;
    this.otpCache.set(phoneNumber, { otp, expiresAt });

    setTimeout(() => {
      this.otpCache.delete(phoneNumber);
    }, 120000);
  }
  async sendSms(id: number): Promise<any> {
    const headers = {
      Authorization: `App ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const phoneNumber = this.convertPhoneNumber(existingUser.phoneNumber);
    
    const otp = speakeasy.totp({
      secret: this.configService.get<string>('OTP_SECRET'),
      encoding: this.configService.get<string>('OTP_ENDCODEDING'),
      digits: Number(this.configService.get<string>('OTP_DIGITS')),
      step: Number(this.configService.get<string>('OTP_STEP')),
    });
    this.saveOTPToMemory(phoneNumber, otp);
    const payload = {
      messages: [
        {
          destinations: [{ to: phoneNumber }],
          from: 'InfoSMS',
          text: otp,
        },
      ],
    };
    const response = await firstValueFrom(
      this.httpService.post(this.apiUrl, payload, { headers }),
    );

    return response.data;
  }
}
