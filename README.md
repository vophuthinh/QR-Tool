# QR Generator Pro

Ứng dụng tạo mã QR code chuyên nghiệp và đa dạng, được xây dựng với React và Vite. Hỗ trợ nhiều loại nội dung, tùy chỉnh đầy đủ màu sắc, kích thước, logo và định dạng xuất file.

![QR Generator Pro](https://img.shields.io/badge/QR-Generator%20Pro-indigo?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?logo=vite&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&style=flat-square)
![Security](https://img.shields.io/badge/Security-Audited%20✅-brightgreen?style=flat-square)

## ✨ Tính năng

### 🎯 Các loại QR Code

- **🔗 URL/Website** - Liên kết web với validation an toàn
- **📝 Văn bản** - Văn bản thuần túy
- **📶 Wi-Fi** - Thông tin kết nối mạng không dây (SSID, mật khẩu, mã hóa)
- **👤 vCard** - Danh thiếp điện tử với đầy đủ thông tin liên hệ
- **📧 Email** - Tạo email với tiêu đề và nội dung
- **💬 SMS** - Tin nhắn văn bản
- **☎️ Điện thoại** - Số điện thoại để gọi
- **📍 Vị trí** - Tọa độ GPS (vĩ độ, kinh độ)

### 🎨 Tùy chỉnh

- **📏 Kích thước**: Từ 96px đến 8192px với các preset sẵn có
- **🎨 Màu sắc**: Tùy chỉnh màu QR và nền (hỗ trợ hex color picker)
- **🛡️ Độ bền (ECC)**: L, M, Q, H hoặc tự động chọn theo logo
- **🖼️ Logo**: Thêm logo vào giữa QR code với kích thước tùy chỉnh
- **📐 Định dạng**: Xuất PNG/JPG (Canvas) hoặc SVG (Vector)
- **🔲 Margin**: Bật/tắt viền trắng (Quiet Zone)
- **✨ Nền trong suốt**: Hỗ trợ PNG với nền trong suốt

### 🌟 Tính năng nâng cao

- **🌓 Dark Mode**: Chế độ sáng/tối
- **✅ Validation**: Kiểm tra tính hợp lệ của URL, email, số điện thoại
- **🔍 QR Scanner**: Tự động quét và kiểm tra QR code sau khi tạo
- **📱 Responsive**: Giao diện tối ưu cho mobile và desktop
- **💾 Local Storage**: Lưu tùy chọn người dùng
- **🚀 Chế độ nhanh**: UI đơn giản cho người mới bắt đầu
- **⚡ Chế độ chuyên sâu**: Tùy chỉnh chi tiết cho người dùng nâng cao
- **📊 Contrast Checker**: Cảnh báo độ tương phản màu sắc
- **🎯 Size Suggestion**: Đề xuất kích thước tối ưu dựa trên nội dung

## 🚀 Bắt đầu

### Yêu cầu

- Node.js >= 16.x
- npm hoặc yarn hoặc pnpm

### Cài đặt

1. **Clone repository**:
```bash
git clone <repository-url>
cd qr-tool-vite
```

2. **Cài đặt dependencies**:
```bash
npm install
```

3. **Chạy development server**:
```bash
npm run dev
```

4. **Mở trình duyệt**:
Truy cập `http://localhost:5173` (hoặc port được Vite chỉ định)

### Build cho production

```bash
npm run build
```

Kết quả build sẽ nằm trong thư mục `dist/`.

### Preview production build

```bash
npm run preview
```

### Chạy tests

```bash
npm test
```

Hoặc chạy ở chế độ watch:

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

## 📁 Cấu trúc dự án

```
qr-tool-vite/
├── public/              # Static assets
│   └── _headers        # Security headers (CSP, etc.)
├── src/
│   ├── assets/         # Images, fonts
│   ├── components/     # React components
│   │   ├── ExportPanel.jsx
│   │   ├── QrPreview.jsx
│   │   └── Toast.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useTheme.js
│   │   └── useToast.jsx
│   ├── utils/          # Utility functions
│   │   ├── qr-helpers.js
│   │   └── qr-scanner.js
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── tests/              # Test files
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── README.md
└── SECURITY_AUDIT_REPORT.md  # Báo cáo đánh giá bảo mật
```

## 🛠️ Công nghệ sử dụng

### Core
- **React 19.2.0** - UI framework
- **Vite (Rolldown)** - Build tool và dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework

### Libraries
- **qrcode.react** - Thư viện tạo QR code
- **@zxing/browser** - Thư viện quét QR code

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **PostCSS** & **Autoprefixer** - CSS processing

## 🔒 Bảo Mật

Ứng dụng đã được kiểm tra bảo mật toàn diện và sẵn sàng cho production:

- ✅ **0 vulnerabilities** trong dependencies (đã audit và fix)
- ✅ **XSS Protection** thông qua React's built-in escaping
- ✅ **Input Validation** đầy đủ cho URL, email, phone, coordinates
- ✅ **File Upload Security** với giới hạn kích thước và whitelist file types
- ✅ **Content Security Policy (CSP)** được cấu hình với security headers
- ✅ **Local Storage** chỉ lưu UI preferences, không có sensitive data

**Báo cáo bảo mật chi tiết**: Xem [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)

**Kiểm tra bảo mật**:
```bash
npm audit
```

## 📖 Hướng dẫn sử dụng

### Tạo QR Code cơ bản

1. Chọn loại QR code từ dropdown (URL, Text, Wi-Fi, etc.)
2. Nhập thông tin tương ứng
3. Xem trước QR code ở panel bên phải
4. Tải xuống bằng nút "Tải xuống PNG" hoặc "Tải xuống SVG"

### Tùy chỉnh nâng cao (Chế độ Chuyên sâu)

1. Chuyển sang **"⚡ Chuyên sâu"** mode
2. Điều chỉnh:
   - **Kích thước**: Nhập số pixel hoặc dùng slider
   - **ECC Level**: Chọn độ bền phù hợp (AUTO khuyên dùng)
   - **Màu sắc**: Chọn màu QR và nền
   - **Logo**: Upload logo và điều chỉnh kích thước
   - **Định dạng**: Chọn PNG/JPG hoặc SVG

### Mẹo sử dụng

- **Logo lớn**: Dùng ECC Q hoặc H để đảm bảo QR vẫn quét được
- **In ấn**: Dùng SVG cho poster lớn, PNG/JPG cho tem nhỏ
- **Màu sắc**: Đảm bảo contrast ≥ 4.5:1 để QR dễ quét
- **Kích thước**: Theo đề xuất của hệ thống để có module size phù hợp

## 🧪 Testing

Dự án sử dụng Vitest cho unit testing. Các test files nằm trong thư mục `tests/` và cùng thư mục với source files.

```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint
- `npm test` - Chạy tests
- `npm run test:watch` - Chạy tests với watch mode
- `npm audit` - Kiểm tra vulnerabilities trong dependencies

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork project
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 👤 Tác giả

Dự án được phát triển với ❤️ sử dụng React và Vite.

## 🙏 Lời cảm ơn

- [qrcode.react](https://github.com/rosskhanas/react-qr-code) - Thư viện tạo QR code
- [ZXing](https://github.com/zxing-js/browser) - Thư viện quét QR code
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool

---

**Lưu ý**: 
- Dự án này chỉ chạy trên trình duyệt và không yêu cầu backend server. Tất cả xử lý đều diễn ra ở phía client.
- Ứng dụng đã được audit bảo mật và sẵn sàng cho production. Xem [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) để biết thêm chi tiết.
