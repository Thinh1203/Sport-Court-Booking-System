import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CouponDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  discountValue: number;

  @IsNotEmpty()
  @IsString()
  discountType: string;

  @IsNotEmpty()
  @IsInt()
  maxUsage: number;

  usedCount?: number;

  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  endDate: string;

  @IsNotEmpty()
  isDynamic: boolean;

  metaData?: string;

  @IsNotEmpty()
  @IsInt()
  minTotalAmount: number;

  MaximumDiscountTotal?: number;
  
  @IsNotEmpty()
  @IsInt()
  theSportsCenterId: number;
}
