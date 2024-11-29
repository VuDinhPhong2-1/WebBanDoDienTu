import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(
        new BadRequestException('Only image files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước 5MB
};
