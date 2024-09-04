import { IsBoolean, IsInt, IsString } from 'class-validator';

export class UpdateCouponDto {
  status: string;

  code: string;

  description: string;

  discountValue: number;

  discountType: string;

  maxUsage: number;

  usedCount: number;

  startDate: string;

  endDate: string;

  isDynamic: boolean;

  metaData: string;

  minTotalAmount: number;

  MaximumDiscountTotal: number;
}
