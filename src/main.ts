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

  // Cấu hình CORS để tránh lỗi
  app.enableCors({
    origin: 'http://localhost:3000', // Thay thế bằng domain frontend của bạn
    credentials: true, // Để gửi cookie hoặc thông tin xác thực cùng request
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Cho phép các phương thức HTTP
    allowedHeaders: 'Content-Type, Accept, Authorization', // Các header được phép
  });

  app.use(cookieParser());
  await app.listen(3001);
}
bootstrap();
