import { Module } from '@nestjs/common';
import { HeadquartersController } from './headquarters.controller';
import { HeadquartersService } from './headquarters.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [HeadquartersController],
  providers: [HeadquartersService],
  imports: [
    CloudinaryModule,
    PrismaModule,
    AuthModule
  ]
})
export class HeadquartersModule {}
