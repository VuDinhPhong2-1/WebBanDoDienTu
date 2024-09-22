import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các trường không có trong DTO
      forbidNonWhitelisted: true, // Ném lỗi nếu có trường không được xác định
      transform: true, // Chuyển đổi các giá trị đầu vào (ví dụ: chuyển từ string sang số)
    }),
  );
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
