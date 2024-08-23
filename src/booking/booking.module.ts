import { forwardRef, Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AppotapayModule } from 'src/appotapay/appotapay.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [
    PrismaModule,
    JwtModule,
    AppotapayModule
  ],
  exports: [BookingService]
})
export class BookingModule {}
