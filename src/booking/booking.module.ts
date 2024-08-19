import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [BookingController],
  providers: [BookingService],
  imports: [
    PrismaModule
  ]
})
export class BookingModule {}
