import { Module } from '@nestjs/common';
import { SportsCenterController } from './sports-center.controller';
import { SportsCenterService } from './sports-center.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [SportsCenterController],
  providers: [
    SportsCenterService,
  ],
  imports: [
    PrismaModule,
    CloudinaryModule,
    AuthModule
  ]
})
export class SportsCenterModule {}
