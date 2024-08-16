import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';


@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  exports: [JwtService]
})
export class AuthModule {}
