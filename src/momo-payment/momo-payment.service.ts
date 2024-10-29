import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { MomoPayment } from '../entities/MoMoPayment';
import { Repository } from 'typeorm';

@Injectable()
export class MomoPaymentService {
  constructor(
    @InjectRepository(MomoPayment)
    private momoPaymentRepository: Repository<MomoPayment>,
  ) {}

  // Hàm lấy MomoPayment có isActive = true
  async getActiveMomoPayment(): Promise<MomoPayment> {
    const activePayment = await this.momoPaymentRepository.findOne({
      where: { isActive: true },
    });
    if (!activePayment) {
      throw new NotFoundException(
        'No active MoMo payment configuration found.',
      );
    }
    return activePayment;
  }

  // Cập nhật hàm payment để lấy thông tin từ cấu hình có isActive = true
  async payment(amount: number, orderIdURL: number) {
    // Kiểm tra số tiền hợp lệ
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount.');
    }
    console.log('orderIdURL', orderIdURL);

    // Lấy cấu hình MoMo có isActive = true
    const activeConfig = await this.getActiveMomoPayment();

    // Các tham số cấu hình thanh toán MoMo từ bản ghi
    const {
      accessKey,
      secretKey,
      partnerCode,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      autoCapture,
      lang,
    } = activeConfig;
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const redirectUrlWithOrderId = `${redirectUrl}${orderIdURL}`;
    // Chuỗi để tạo chữ ký HMAC SHA256
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrlWithOrderId}&requestId=${requestId}&requestType=${requestType}`;

    // Tạo chữ ký
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Nội dung gửi đến MoMo API
    const requestBody = {
      partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId,
      amount, // `amount` là số nguyên
      orderId,
      orderInfo,
      redirectUrl: redirectUrlWithOrderId,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      signature,
    };

    // Cấu hình yêu cầu
    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    };

    // In ra requestBody để kiểm tra định dạng
    console.log('Request Body:', requestBody);

    // Gửi yêu cầu đến API và xử lý kết quả
    try {
      const result = await axios.request(options);
      console.log('Payment Request Successful:', result.data);
      return result.data;
    } catch (error) {
      console.error('Payment Request Failed:', error);
      return error.response ? error.response.data : error.message;
    }
  }

  async createPayment(paymentData: Partial<MomoPayment>) {
    // Kiểm tra nếu `isActive` là true trong yêu cầu mới
    if (paymentData.isActive) {
      // Đặt `isActive` = false cho tất cả các bản ghi trước
      await this.momoPaymentRepository.update(
        { isActive: true },
        { isActive: false },
      );
    }

    // Tạo một bản ghi mới với dữ liệu từ `paymentData`
    const newPayment = this.momoPaymentRepository.create(paymentData);

    // Lưu bản ghi mới vào cơ sở dữ liệu
    try {
      return await this.momoPaymentRepository.save(newPayment);
    } catch (error) {
      throw new BadRequestException(
        'Failed to create new MoMo payment configuration.',
      );
    }
  }
}
