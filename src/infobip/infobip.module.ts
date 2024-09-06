import { Module } from '@nestjs/common';
import { InfobipController } from './infobip.controller';
import { InfobipService } from './infobip.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [InfobipController],
  providers: [InfobipService],
  imports: [HttpModule, ConfigModule, AuthModule, PrismaModule],
})
export class InfobipModule {}
