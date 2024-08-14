import { Module } from '@nestjs/common';
import { AmenityController } from './amenity.controller';
import { AmenityService } from './amenity.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [AmenityController],
  providers: [AmenityService],
  imports: [
    PrismaModule,
    CloudinaryModule
  ]
})
export class AmenityModule {}
