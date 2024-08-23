import { forwardRef, Module } from '@nestjs/common';
import { AppotapayController } from './appotapay.controller';
import { AppotapayService } from './appotapay.service';
import { JwtModule } from '@nestjs/jwt';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  controllers: [AppotapayController],
  providers: [AppotapayService],
  imports: [
    JwtModule,
    forwardRef(() => BookingModule)
  ],
  exports: [AppotapayService]
})
export class AppotapayModule {}
