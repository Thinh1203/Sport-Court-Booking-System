import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [
    CloudinaryModule,
    PrismaModule,
    AuthModule
  ]
})
export class CommentModule {}
