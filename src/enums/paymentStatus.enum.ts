export enum PaymentStatus {
  Pending = 'pending', // Thanh toán chưa được thực hiện, đơn hàng vẫn đang đợi khách hàng hoặc hệ thống xử lý
  Paid = 'paid', // Thanh toán đã hoàn tất thành công
  Failed = 'failed', // Thanh toán không thành công do lỗi hoặc vấn đề từ hệ thống, tài khoản không đủ tiền, hoặc lỗi khác
  Refunded = 'refunded', // Số tiền đã được hoàn lại cho khách hàng sau khi đơn hàng bị hủy hoặc trả hàng
  PartiallyPaid = 'partially_paid', // Khách hàng đã thực hiện thanh toán một phần nhưng chưa thanh toán đủ toàn bộ số tiền
  Declined = 'declined', // Thanh toán bị từ chối bởi ngân hàng hoặc tổ chức thanh toán
  Authorized = 'authorized', // Thanh toán đã được ủy quyền nhưng chưa bị trừ khỏi tài khoản khách hàng
  Voided = 'voided', // Giao dịch thanh toán đã bị hủy trước khi hoàn tất
  InProgress = 'in_progress', // Thanh toán đang trong quá trình thực hiện, có thể chưa hoàn thành nhưng không có lỗi ngay lập tức
  Chargeback = 'chargeback', // Khách hàng đã yêu cầu hoàn trả thông qua ngân hàng hoặc tổ chức thanh toán, thường do tranh chấp về đơn hàng
}
