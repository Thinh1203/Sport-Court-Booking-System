import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [CouponController],
  providers: [CouponService],
  imports: [
    PrismaModule,
    CloudinaryModule
  ]
})
export class CouponModule {}