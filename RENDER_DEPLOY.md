# Hướng dẫn Deploy lên Render.com

Tài liệu này hướng dẫn bạn cách đưa Landing Page lên môi trường Production (sử dụng Render) an toàn và không gặp lỗi thiếu biến môi trường.

## Phương pháp 1: Deploy bằng Blueprint (Dễ nhất)

Nếu tài khoản GitHub của bạn đã liên kết với Render, bạn có thể tự động hóa toàn bộ bằng Blueprint:
1. Đảm bảo file `render.yaml` đã được đẩy (commit & push) lên GitHub repository của bạn.
2. Đăng nhập vào Render Dashboard.
3. Chọn **New** -> **Blueprint**.
4. Kết nối đến repository của bạn.
5. Khi hệ thống nhận diện `render.yaml`, Render sẽ yêu cầu bạn nhập các giá trị còn thiếu (những biến có `sync: false`):
   - `ADMIN_USERNAME`: Tên đăng nhập Admin.
   - `ADMIN_PASSWORD`: Mật khẩu Admin.
   - `SITE_URL`: Domain của web (ví dụ: `https://your-landing-page.onrender.com`).
   - `FB_PIXEL_ID`: (Không bắt buộc) Nhập nếu bạn có mã Pixel.
6. Click **Apply**. Render sẽ tự động sinh `SESSION_SECRET` siêu bảo mật và cài đặt mọi thứ.

## Phương pháp 2: Deploy thủ công (Web Service)

1. Đăng nhập Render Dashboard, chọn **New** -> **Web Service**.
2. Kết nối với GitHub Repository của bạn.
3. Cấu hình cơ bản:
   - **Name**: `landing-page-forex`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Cuộn xuống phần **Environment Variables**, chọn **Add Environment Variable** và thêm tất cả các biến bắt buộc sau:
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: Một chuỗi ngẫu nhiên dài (Ví dụ: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p...`)
   - `ADMIN_USERNAME`: Tên đăng nhập của bạn (ví dụ: `admin`)
   - `ADMIN_PASSWORD`: Mật khẩu của bạn
   - `SITE_URL`: Tên miền của web (có thể cập nhật lại sau khi Render cấp link `.onrender.com`)
   - `FB_PIXEL_ID`: (Không bắt buộc)
5. Nhấn **Create Web Service**.

## Lưu ý quan trọng
- Server được lập trình để **fail-fast**. Nếu bạn khai báo thiếu `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, hoặc `SITE_URL`, server sẽ tự động báo lỗi và sập ngay lập tức để bảo vệ hệ thống.
- Tuyệt đối không commit file `.env` chứa mật khẩu thật lên GitHub.
- Database (`db/database.db`) trên Render Web Service (Free/Starter) có thể bị reset mỗi khi deploy mới do đây là hệ thống ephemeral (ổ cứng tạm). Bạn nên cân nhắc thêm **Render Disk** (trả phí) mount vào thư mục `db` và `public/uploads` để giữ lại dữ liệu vĩnh viễn.
