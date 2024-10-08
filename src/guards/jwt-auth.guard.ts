import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Thêm logic xác thực tùy chỉnh ở đây nếu cần
    // Ví dụ, bạn có thể sử dụng Reflector để đọc metadata tùy chỉnh
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Tùy chỉnh xử lý lỗi
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Bạn không có quyền truy cập, vui lòng đăng nhập lại.',
        )
      );
    }
    return user;
  }
}
