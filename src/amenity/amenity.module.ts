import { Module } from '@nestjs/common';
import { AmenityController } from './amenity.controller';
import { AmenityService } from './amenity.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AmenityController],
  providers: [AmenityService],
  imports: [
    PrismaModule,
    CloudinaryModule,
    AuthModule
  ]
})
export class AmenityModule {}
