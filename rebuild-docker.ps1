# Script để rebuild và restart Docker container
Write-Host "Đang dừng container cũ..." -ForegroundColor Yellow
docker-compose down

Write-Host "Đang build lại image..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host "Đang khởi động container mới..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n✅ Hoàn tất! Ứng dụng đang chạy tại http://localhost:3111" -ForegroundColor Green
Write-Host "`nXem logs: docker-compose logs -f" -ForegroundColor Cyan

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 