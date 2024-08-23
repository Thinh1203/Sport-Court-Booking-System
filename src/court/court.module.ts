import { Module } from '@nestjs/common';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CourtController],
  providers: [CourtService],
  imports: [
    PrismaModule,
    CloudinaryModule,
    AuthModule
  ]
})
export class CourtModule {}
