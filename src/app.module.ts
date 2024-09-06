import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SportsCenterModule } from './sports-center/sports-center.module';
import { CategoryModule } from './category/category.module';
import { AmenityModule } from './amenity/amenity.module';
import { CourtModule } from './court/court.module';
import { HeadquartersModule } from './headquarters/headquarters.module';
import { CommentModule } from './comment/comment.module';
import { BookingModule } from './booking/booking.module';
import { AppotapayModule } from './appotapay/appotapay.module';
import { RegionModule } from './region/region.module';
import { CouponModule } from './coupon/coupon.module';
import { ScheduleModule } from '@nestjs/schedule';
import { InfobipModule } from './infobip/infobip.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
    CloudinaryModule,
    SportsCenterModule,
    CategoryModule,
    AmenityModule,
    CourtModule,
    HeadquartersModule,
    CommentModule,
    BookingModule,
    AppotapayModule,
    RegionModule,
    CouponModule,
    ScheduleModule.forRoot(),
    InfobipModule,
    CacheModule.register({
      isGlobal: true,
      max: 100
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
