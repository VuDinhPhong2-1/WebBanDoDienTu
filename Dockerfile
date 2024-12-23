# Sử dụng Node.js làm base image
FROM node:16-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Cài đặt các dependencies
RUN npm install

# Thêm script wait-for-it.sh vào container và cấp quyền thực thi
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Build ứng dụng NestJS
RUN npm run build

# Mở cổng 3001 cho API của NestJS
EXPOSE 3001

# Chạy ứng dụng, sử dụng wait-for-it.sh để đợi SQL Server sẵn sàng
CMD ["npm run start:dev"]


