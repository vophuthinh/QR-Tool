# Security Policy / Chính sách bảo mật

`QR-Tool` có thể được dùng để tạo và đọc mã QR chứa dữ liệu nhạy cảm (token, URL nội bộ, dữ liệu đã mã hoá,…).  
Tài liệu này mô tả các phiên bản được hỗ trợ bảo mật và cách báo cáo lỗ hổng.

---

## Supported Versions / Các phiên bản được hỗ trợ

Chỉ những phiên bản bên dưới mới được xem xét nhận bản vá bảo mật.

| Version        | Supported | Ghi chú                               |
| -------------- | --------- | ------------------------------------- |
| 1.0.0       | ✅        | Nhận bugfix & security patch         |
| 0.x.x và thấp hơn | ❌    | Không còn được hỗ trợ / EOL          |

> 🔧 *Hãy cập nhật bảng này khi bạn phát hành phiên bản mới (ví dụ 2.x.x).*

---

## Reporting a Vulnerability / Báo cáo lỗ hổng bảo mật

If you discover a security issue, **please do NOT open a public GitHub issue.**

Nếu bạn phát hiện lỗ hổng, **vui lòng KHÔNG tạo issue public trên GitHub.**  
Thay vào đó:

1. **Tạo “Security advisory” riêng tư trên GitHub** cho repo `QR-Tool`  
   - Vào tab **Security → Advisories → Report a vulnerability** (nếu bạn có quyền),  
   - Hoặc gửi mô tả qua kênh liên hệ bảo mật (email / ticket nội bộ) nếu nhóm bạn có quy định riêng.
2. Cung cấp thông tin chi tiết:
   - Phiên bản `QR-Tool` đang dùng (`package.json` hoặc tag git),
   - Môi trường (Node version, OS, framework, cách deploy),
   - Bước tái hiện lỗi (step-by-step, input mẫu, log liên quan),
   - Tác động dự kiến (ví dụ: lộ secret, RCE, bypass auth,…).
3. Đánh dấu mức độ nghiêm trọng bạn đánh giá (Low / Medium / High / Critical).

We will:
- Acknowledge your report as soon as possible,
- Investigate the issue and work on a fix,
- Coordinate with you on responsible disclosure if needed.

Chúng tôi sẽ:
- Xác nhận đã nhận báo cáo sớm nhất có thể,
- Phân tích, tái hiện lỗi và đề xuất bản vá,
- Thống nhất với bạn cách công bố thông tin (nếu cần) theo hướng **tiết lộ có trách nhiệm**.

---

## Responsible Disclosure / Tiết lộ có trách nhiệm

- Vui lòng **không khai thác lỗ hổng trên hệ thống thực** ngoài phạm vi kiểm thử được phép.
- Không chia sẻ PoC công khai, bài blog, hoặc nội dung demo chi tiết **trước khi bản vá được phát hành** và người dùng có thời gian cập nhật.
- Sau khi bản vá được phát hành, bạn có thể công bố chi tiết kỹ thuật; nếu muốn, hãy mention repo để cùng nâng cao nhận thức bảo mật.

---

## Security Guidelines for Users / Hướng dẫn bảo mật cho người dùng `QR-Tool`

Khi triển khai `QR-Tool` trong hệ thống của bạn, hãy lưu ý:

1. **Không đưa secret trực tiếp vào QR**  
   - Hạn chế nhúng mật khẩu, access token, private key,… vào nội dung QR ở dạng plain text.  
   - Nên dùng **token ngắn hạn** hoặc **ID/handle** rồi tra cứu qua server.

2. **Sử dụng HTTPS & môi trường tin cậy**  
   - Deploy backend / web app dùng `QR-Tool` trên HTTPS,
   - Hạn chế quét / giải mã QR chứa dữ liệu nhạy cảm trên thiết bị không thuộc quản lý của công ty.

3. **Bảo vệ khóa mã hoá / API key**  
   - Nếu `QR-Tool` được dùng kèm chức năng mã hoá (ví dụ key AES, JWT secret,…),  
     lưu trong biến môi trường hoặc secret manager, **không commit lên Git**.
   - Hạn chế nhúng key vào JavaScript phía client nếu không thực sự cần thiết.

4. **Cập nhật phiên bản thường xuyên**  
   - Luôn dùng bản mới nhất trong nhánh được hỗ trợ,
   - Theo dõi changelog để cập nhật các bản vá bảo mật.

---

## Contact / Liên hệ

For security-related questions, please contact:  
**`vophuthinhcm@gmail.com`**

Mọi câu hỏi hoặc góp ý liên quan đến bảo mật có thể gửi về:  
**`vophuthinhcm@gmail.com`**.

---
