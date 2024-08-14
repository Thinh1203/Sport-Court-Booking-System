import { Module } from '@nestjs/common';
import { HeadquartersController } from './headquarters.controller';
import { HeadquartersService } from './headquarters.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [HeadquartersController],
  providers: [HeadquartersService],
  imports: [
    CloudinaryModule,
    PrismaModule
  ]
})
export class HeadquartersModule {}
