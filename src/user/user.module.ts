import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    CloudinaryService
  ],
  imports: [
    PrismaModule,
  ]
})
export class UserModule {}
