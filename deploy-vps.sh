#!/bin/bash

# Script deploy QR Generator Pro lên VPS Linux
# Sử dụng: chmod +x deploy-vps.sh && ./deploy-vps.sh

set -e  # Dừng nếu có lỗi

echo "🚀 Bắt đầu deploy QR Generator Pro lên VPS..."

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

# Dừng và xóa container cũ
echo "📦 Dừng container cũ..."
docker-compose down 2>/dev/null || true

# Xóa image cũ (tùy chọn)
echo "🧹 Dọn dẹp image cũ..."
docker rmi qr-tool-vite-qr-generator:latest 2>/dev/null || true

# Build lại image mới
echo "🔨 Build image mới với port 3111..."
docker-compose build --no-cache

# Khởi động container
echo "🚀 Khởi động container..."
docker-compose up -d

# Kiểm tra trạng thái
echo "⏳ Đợi container khởi động..."
sleep 5

# Kiểm tra health
echo "🏥 Kiểm tra health..."
docker-compose ps

# Hiển thị logs
echo "📋 Logs container:"
docker-compose logs --tail=20

echo ""
echo "✅ Deploy hoàn tất!"
echo "🌐 Ứng dụng đang chạy tại: http://$(hostname -I | awk '{print $1}'):3111"
echo "📊 Xem logs: docker-compose logs -f"
echo "🛑 Dừng: docker-compose down"

