import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'crypto';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class AppotapayService {
    private apiKey: string;
    private partnerKey: string;
    private secretKey: string;
    
  constructor(
    private readonly configService: ConfigService,   
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService
  ) {
    this.apiKey = this.configService.get<string>('APPOTAPAY_API_KEY');
    this.secretKey = this.configService.get<string>('APPOTAPAY_API_SECRETKEY');
    this.partnerKey = this.configService.get<string>('APPOTAPAY_PARTNER_CODE');
  }

  private createJWT(): string {
    const currentTimestamp = Math.floor(Date.now() / 1000); 
    const payload = {
      iss: this.partnerKey,
      jti: `${this.apiKey}-${currentTimestamp}`,
      api_key: this.apiKey,
      expiresIn: currentTimestamp + 30000
    };
    return this.jwtService.sign(payload, {
      secret: this.secretKey,
      header: {
        "typ": "JWT",
        "alg": "HS256",
        "cty": "appotapay-api;v=1"
      }
    });
  }

  private ksort = (obj: any): any => {
    let keys = Object.keys(obj).sort();
    let sortedObj: any = {};
    
    for (let i in keys) {
      sortedObj[keys[i]] = obj[keys[i]];
    }
    return sortedObj;
  }

  private createSignature(data: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }
  async createTransaction(bill: any): Promise<any> {
    
    const url = 'https://payment.dev.appotapay.com/api/v2/orders/payment';

    const payload = {
      transaction: {
        amount: bill.amount,
        currency: "VND",
        bankCode: "",
        paymentMethod: "ATM",
        action: "PAY",
      },
      partnerReference: {
        order: {
          id: String(bill.id), 
          info: 'test thanh toan',
          extraData: "",
        },
        notificationConfig: {
          notifyUrl: "http://localhost:3030/appotapay/ipn",
          redirectUrl: "http://localhost:3030/appotapay/redirect"
        },
      },
    };

    const sortedKeys = this.ksort(payload);
  
    let signData = '';
    for (let [key, value] of Object.entries(sortedKeys)) {
    
      if (value !== null && value !== undefined) {
        signData += `&${key}=${encodeURIComponent(value.toString())}`;
      }
    }

    signData = signData.substring(1);    
    const signature = this.createSignature(signData);

    payload['signature'] = signature;
    
    const jwt = await this.createJWT();
    
    const headers = {
      'X-APPOTAPAY-AUTH': jwt,
      'Content-Type': 'application/json',
      'X-Language': 'vi'
    };
    
    try {
      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (error) {
      console.log(error.response.data);

      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async processingReturnedResult(data: string, signature: string): Promise<string | Object> {
    try {
      const decodeReturnedData = Buffer.from(data, 'base64').toString('utf-8');
      let jsonData: any;
      jsonData = JSON.parse(decodeReturnedData);
      const result = await this.bookingService.updateBookingBill(jsonData);
      return result; 
    } catch (error) {
      return { message: error };
    }
  }
}
