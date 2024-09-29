export enum OrderStatus {
  PENDING = 'Pending', // Đơn hàng vừa được tạo, chưa xử lý
  PROCESSING = 'Processing', // Đơn hàng đang được xử lý
  SHIPPED = 'Shipped', // Đơn hàng đã được giao cho đơn vị vận chuyển
  DELIVERED = 'Delivered', // Đơn hàng đã giao thành công
  CANCELED = 'Canceled', // Đơn hàng đã bị hủy
  RETURNED = 'Returned', // Đơn hàng đã được trả lại
  COMPLETED = 'Completed', // Đơn hàng đã hoàn thành (giao thành công và không có vấn đề gì)
}
