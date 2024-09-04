import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CouponController],
  providers: [CouponService],
  imports: [
    PrismaModule,
    CloudinaryModule,
    AuthModule
  ]
})
export class CouponModule {}
