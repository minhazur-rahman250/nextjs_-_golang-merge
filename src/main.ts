import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ contentSecurityPolicy: false })); // Swagger UI চালু রাখতে CSP বন্ধ
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // DTO-তে নেই এমন field বাদ
      forbidNonWhitelisted: true, // অতিরিক্ত field পাঠালে 400
      transform: true,            // query string থেকে number ইত্যাদি কনভার্ট
    }),
  );

  // @Exclude() (যেমন password) কার্যকর করে
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('LMS API')
    .setDescription('Role-based Learning Management System API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();