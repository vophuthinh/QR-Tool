# QR Generator

Công cụ tạo và quản lý mã QR chuẩn hoá cho tài liệu, chiến dịch, sự kiện và tài sản CNTT trong hệ thống doanh nghiệp HPT – thống nhất brand, bảo mật trên nền tảng Microsoft 365.

Ứng dụng được xây dựng với React và Vite, hỗ trợ nhiều loại nội dung, tùy chỉnh đầy đủ màu sắc, kích thước, logo và định dạng xuất file. Tích hợp Microsoft 365 SSO để đảm bảo chỉ nhân viên nội bộ mới có thể truy cập.

![QR Generator](https://img.shields.io/badge/QR-Generator-indigo?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?logo=vite&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&style=flat-square)
![Security](https://img.shields.io/badge/Security-Audited%20✅-brightgreen?style=flat-square)

## ✨ Tính năng

### 🔐 Bảo mật & Xác thực

- **Microsoft 365 SSO**: Đăng nhập bằng tài khoản Microsoft 365 nội bộ HPT
- **Azure AD Integration**: Tích hợp với Azure Active Directory
- **Single Sign-On (SSO)**: Đăng nhập một lần, truy cập toàn bộ hệ thống
- **User Management**: Hiển thị thông tin người dùng đã đăng nhập
- **Session Management**: Quản lý phiên đăng nhập an toàn

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
- **🏢 Brand Guidelines**: Tự động áp dụng màu sắc và logo theo guideline HPT
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
- **🔄 Loading States**: Hiển thị loading indicator khi tạo QR code lớn
- **🛡️ Error Boundary**: Bắt và xử lý lỗi React một cách an toàn
- **📱 PWA Support**: Hỗ trợ Progressive Web App, có thể cài đặt và hoạt động offline
- **⚡ Code Splitting**: Lazy loading components để tối ưu performance
- **🔍 SEO Optimized**: Open Graph, Twitter Cards, và structured data
- **🏢 Enterprise UI**: Giao diện chuyên nghiệp, phù hợp với môi trường doanh nghiệp

## 🚀 Bắt đầu

### Yêu cầu

- Node.js >= 16.x
- npm hoặc yarn hoặc pnpm
- Tài khoản Microsoft 365 nội bộ HPT (để truy cập ứng dụng)
- Azure AD App Registration (để cấu hình SSO)

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

3. **Cấu hình Microsoft 365 SSO**:
   - Tạo Azure AD App Registration trong Azure Portal
   - Lấy Client ID và Tenant ID
   - Cấu hình Redirect URIs
   - Cập nhật file `src/auth/msalConfig.js` với thông tin Azure AD của bạn

4. **Chạy development server**:
```bash
npm run dev
```

5. **Mở trình duyệt**:
Truy cập `http://localhost:5173` (hoặc port được Vite chỉ định)
- Đăng nhập bằng tài khoản Microsoft 365 nội bộ HPT
- Sau khi đăng nhập thành công, bạn có thể bắt đầu tạo QR code

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
│   ├── _headers        # Security headers (CSP, etc.)
│   ├── manifest.json   # PWA manifest
│   ├── sw.js           # Service Worker
│   └── favicon-16x16.png
├── src/
│   ├── assets/         # Images, fonts
│   ├── auth/           # Authentication configuration
│   │   └── msalConfig.js  # Microsoft 365 SSO configuration
│   ├── components/     # React components
│   │   ├── ErrorBoundary.jsx  # Error boundary component
│   │   ├── ExportPanel.jsx
│   │   ├── QrPreview.jsx
│   │   └── Toast.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx     # Home page (Landing page với SSO)
│   │   └── QRGenerator.jsx  # QR Generator page
│   ├── hooks/          # Custom React hooks
│   │   ├── useTheme.js
│   │   └── useToast.jsx
│   ├── utils/          # Utility functions
│   │   ├── qr-helpers.js
│   │   └── qr-scanner.js
│   ├── App.jsx         # Main application component (routing + auth)
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
- **react-router-dom** - Client-side routing
- **react-hot-toast** - Toast notifications
- **@azure/msal-browser** - Microsoft Authentication Library (MSAL) cho browser
- **@azure/msal-react** - MSAL React integration hooks

### Development Tools
- **ESLint** - Code linting
- **Vitest** - Testing framework
- **PostCSS** & **Autoprefixer** - CSS processing

## 🔒 Bảo Mật

Ứng dụng đã được kiểm tra bảo mật toàn diện và sẵn sàng cho production:

- ✅ **Microsoft 365 SSO Authentication**: Chỉ nhân viên nội bộ HPT mới có thể truy cập
- ✅ **Azure AD Integration**: Tích hợp với Azure Active Directory để quản lý người dùng
- ✅ **Session Management**: Quản lý phiên đăng nhập an toàn với token refresh tự động
- ✅ **0 vulnerabilities** trong dependencies (đã audit và fix)
- ✅ **XSS Protection** đa lớp:
  - React's built-in HTML escaping
  - Input sanitization tự động loại bỏ script tags, event handlers, và dangerous protocols
  - Validation nghiêm ngặt cho tất cả input fields
- ✅ **Code Injection Prevention**:
  - Sanitize tất cả text inputs trước khi xử lý
  - Chặn javascript:, data:, vbscript:, file: protocols
  - Loại bỏ null bytes và control characters
  - Kiểm tra an toàn trước khi lưu vào state
- ✅ **Input Validation** đầy đủ:
  - URL validation với whitelist protocols (http, https, mailto, tel, sms)
  - Email, phone, coordinates validation
  - Data length validation để tránh QR code quá lớn
  - Real-time validation với error messages
- ✅ **File Upload Security**:
  - Giới hạn kích thước 4MB
  - Whitelist file types (PNG, JPG, WebP, SVG)
  - Blob URL cleanup tự động
- ✅ **Content Security Policy (CSP)** được cấu hình với security headers
- ✅ **Local Storage** chỉ lưu UI preferences, không có sensitive data
- ✅ **Error Boundary** để bắt và xử lý lỗi React một cách an toàn
- ✅ **Data Length Protection**: Tự động kiểm tra và cảnh báo khi dữ liệu quá dài

**Báo cáo bảo mật chi tiết**: Xem [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)

**Kiểm tra bảo mật**:
```bash
npm audit
```

## 🚀 Tính năng Production-Ready

Ứng dụng đã được tối ưu và sẵn sàng cho production với các tính năng sau:

- ✅ **Error Boundary**: Bắt và hiển thị lỗi một cách thân thiện
- ✅ **SEO Optimized**: Open Graph, Twitter Cards, và JSON-LD structured data
- ✅ **Loading States**: Loading indicators khi xử lý QR code lớn
- ✅ **Code Splitting**: Lazy loading components để giảm initial bundle size
- ✅ **PWA Support**: Progressive Web App với service worker và manifest
- ✅ **Performance**: Tối ưu với React.memo, useMemo, và useDebounced

## 📖 Hướng dẫn sử dụng

### Đăng nhập

1. Truy cập ứng dụng tại trang chủ
2. Nhấn nút **"Đăng nhập với Microsoft"**
3. Chọn tài khoản Microsoft 365 nội bộ HPT của bạn
4. Xác thực và cấp quyền truy cập
5. Sau khi đăng nhập thành công, bạn sẽ thấy tên của mình ở góc trên bên phải

### Tạo QR Code cơ bản

1. Sau khi đăng nhập, nhấn nút **"Bắt đầu tạo mã QR"**
2. Chọn loại QR code từ dropdown (URL, Text, Wi-Fi, etc.)
3. Nhập thông tin tương ứng
4. Xem trước QR code ở panel bên phải
5. Tải xuống bằng nút "Tải xuống PNG" hoặc "Tải xuống SVG"

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

Dự án sử dụng Vitest cho unit testing với **102 tests** covering core functionality.

### Test Coverage

- ✅ **Authentication Helpers** (44 tests): Domain validation, error handling, user info extraction
- ✅ **MSAL Configuration** (8 tests): Config validation, initialization, error handling
- ✅ **App Authentication** (12 tests): Login flow, logout flow, route protection, error handling
- ✅ **QR Helpers** (14 tests): Validation, color helpers, ECC calculation
- ✅ **QR Generation** (27 tests): All QR types, special characters, edge cases

**Test Files**:
- `tests/auth-helpers.test.js` - Authentication utilities
- `tests/msal-config.test.js` - MSAL configuration
- `tests/app-auth.test.js` - App authentication flow
- `tests/qr-helpers.test.js` - QR validation and helpers
- `src/App.test.js` - QR content generation

### Running Tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Chạy specific test file
npm test -- tests/auth-helpers.test.js

# Chạy với coverage report
npm test -- --coverage
```

**Xem chi tiết**: [TEST_COVERAGE.md](./TEST_COVERAGE.md)

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
- **Yêu cầu đăng nhập**: Ứng dụng yêu cầu đăng nhập bằng tài khoản Microsoft 365 nội bộ HPT để đảm bảo bảo mật.
- Ứng dụng đã được audit bảo mật và sẵn sàng cho production. Xem [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) để biết thêm chi tiết.
- Ứng dụng hỗ trợ PWA, có thể cài đặt trên thiết bị di động và hoạt động offline.
- SEO đã được tối ưu với Open Graph, Twitter Cards, và structured data cho social media sharing.
- Giao diện được thiết kế chuyên nghiệp, phù hợp với môi trường doanh nghiệp với brand guidelines HPT.
