import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CouponInterface } from '../interfaces';

@Injectable()
export class ParseCouponDtoPipe implements PipeTransform {
  transform(value: CouponInterface, metadata: ArgumentMetadata) {
    // console.log('Received value:', value);
    try {
      value.status = String(value.status);
      value.code = String(value.code);
      value.description = String(value.description);
      value.discountValue = Number(value.discountValue);
      value.discountType = String(value.discountType);
      value.maxUsage = Number(value.maxUsage);
      value.startDate = String(value.startDate);
      value.endDate = String(value.endDate);
      value.isDynamic = Boolean(value.isDynamic);
      value.metaData = value.metaData ? String(value.metaData) : null;
      value.minTotalAmount = Number(value.minTotalAmount);
      value.MaximumDiscountTotal = value.MaximumDiscountTotal
        ? Number(value.MaximumDiscountTotal)
        : null;
      value.theSportsCenterId = Number(value.theSportsCenterId);
      // console.log('Transformed value:', value);

      return value;
    } catch (error) {
      console.error('Error in ParseCourtDtoPipe:', error);
      throw new BadRequestException('Invalid input data format');
    }
  }
}
