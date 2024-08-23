import { Module } from '@nestjs/common';
import { AppotapayController } from './appotapay.controller';
import { AppotapayService } from './appotapay.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AppotapayController],
  providers: [AppotapayService],
  imports: [
    JwtModule,
  ],
  exports: [AppotapayService]
})
export class AppotapayModule {}
