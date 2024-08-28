import { Module } from '@nestjs/common';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [RegionController],
  providers: [RegionService],
  imports: [
    PrismaModule,
    AuthModule
  ]
})
export class RegionModule {}
