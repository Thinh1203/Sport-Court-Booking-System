import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      origin: true,
      methods: 'GET,PUT,PATCH,POST,DELETE',
      credentials: true
    }
  ); 
  const config = new DocumentBuilder()
      .setTitle('Sport court booking system - Api')
      .setDescription('Develop an application for a sports court booking system using Nest.js. The application should allow users to search for sports courts, view court details, make bookings, and manage their bookings')
      .setVersion('1.0')
      .addTag('auth')
      .addTag('user')
      .addTag('amenity')
      .addTag('category')
      .addTag('comment')
      .addTag('booking')
      .addTag('court')
      .addTag('headquarter')
      .addTag('coupon')
      .addTag('location')
      .addTag('sport-center').
      addTag('region')
      .addBearerAuth()
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
