import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SportsCenterModule } from './sports-center/sports-center.module';
import { SportsCourtsModule } from './sports-court/sports-courts.module';
import { CategoryModule } from './category/category.module';


@Module({
  imports: [   
    ConfigModule.forRoot(),
    UserModule, AuthModule, CloudinaryModule, SportsCenterModule, SportsCourtsModule, CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
