import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // DTO তে define না করা extra field auto বাদ দেয়
      forbidNonWhitelisted: true, // extra field পাঠালে error দেয় (নিরাপত্তার জন্য ভালো)
      transform: true,            // string থেকে number, boolean auto কনভার্ট করে
    }),
  );
}
await bootstrap();
