import { Module } from '@nestjs/common';
import { SportsCourtsController } from './sports-courts.controller';
import { SportsCourtsService } from './sports-courts.service';

@Module({
  controllers: [SportsCourtsController],
  providers: [SportsCourtsService]
})
export class SportsCourtsModule {}
