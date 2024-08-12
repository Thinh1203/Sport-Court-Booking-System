import { Module } from '@nestjs/common';
import { SportsCenterController } from './sports-center.controller';
import { SportsCenterService } from './sports-center.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [SportsCenterController],
  providers: [
    SportsCenterService,
    CloudinaryService
  ],
  imports: [
    PrismaModule,
  ]
})
export class SportsCenterModule {}
