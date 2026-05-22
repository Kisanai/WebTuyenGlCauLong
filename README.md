# Badminton Finder (WebTuyểnGL)

Ứng dụng web giúp người chơi cầu lông đăng bài tìm người ghép sân, đăng ký slot và quản lý yêu cầu. Có khu vực **quản trị** riêng với thống kê biểu đồ.

## Công nghệ

| Thành phần | Stack |
|------------|--------|
| Frontend | React 19, Vite 8, React Router, Bootstrap 5, Recharts, Axios |
| Backend | Flask, Flask-CORS, PyJWT, PyMongo |
| Cơ sở dữ liệu | MongoDB |

## Cấu trúc thư mục

```
WebTuyểnGL/
├── backend/          # API Flask
│   ├── routes/       # auth, posts, bookings, notifications, users, admin
│   ├── models/
│   ├── database/
│   └── app.py
├── frontend/         # Giao diện React
│   └── src/
├── scripts/          # Chia sẻ link (Cloudflare Tunnel)
└── README.md
```

## Yêu cầu

- **Node.js** 18+ và npm
- **Python** 3.10+
- **MongoDB** đang chạy (local hoặc Atlas)

## Cài đặt

### 1. MongoDB

Tạo file `backend/.env` (copy từ mẫu):

```bash
cp backend/.env.example backend/.env
```

Chỉnh `MONGO_URI`, `DB_NAME`, `JWT_SECRET` cho phù hợp.

### 2. Backend

```powershell
cd backend

# Tạo virtualenv (Python Windows chuẩn)
py -3 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Hoặc nếu venv dùng thư mục bin (MSYS/Git Bash):
.\venv\bin\Activate.ps1
pip install -r requirements.txt

python app.py
```

API chạy tại: **http://127.0.0.1:5000**

Lần đầu chạy, hệ thống tự tạo tài khoản quản trị mặc định (chi tiết trong `backend/models/user_model.py`).

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Giao diện local: **http://localhost:5173**

Trong chế độ dev, frontend gọi API qua **proxy Vite** (cùng origin) tới backend `127.0.0.1:5000`.

## Chạy nhanh (máy dev)

| Terminal | Lệnh |
|----------|------|
| 1 | `cd backend` → `.\venv\bin\python.exe app.py` (hoặc `python app.py` sau khi activate venv) |
| 2 | `cd frontend` → `npm run dev` |

## Chia sẻ cho người khác (Cloudflare Tunnel)

Dùng **Cloudflare Tunnel** để tạo link công khai `https://....trycloudflare.com` — người nhận mở từ bất kỳ đâu, **không cần cùng WiFi** và **không cần sửa firewall**.

**3 terminal** (giữ cả 3 chạy):

| Terminal | Lệnh |
|----------|------|
| 1 | Backend: `python app.py` |
| 2 | Frontend: `npm run dev` |
| 3 | Tunnel: `npm run tunnel` |

Terminal 3 in link dạng:

```text
https://xxxx-xx-xx.trycloudflare.com
```

Gửi link đó cho người khác. Họ truy cập `/admin/login` nếu cần vào quản trị.

Hoặc chạy script:

```powershell
.\scripts\chia-se-link.ps1
```

**Lưu ý:** Link đổi mỗi lần chạy lại tunnel. Tắt terminal tunnel hoặc tắt máy → link hết hiệu lực.

## Tính năng chính

### Người dùng

- Đăng ký / đăng nhập
- Xem bài đăng tìm người chơi
- Tạo bài đăng, quản lý bài của mình
- Đăng ký slot, xem slot đã đăng ký
- Thông báo

### Quản trị

- Trang riêng: `/admin/login` (qua link Cloudflare: `https://....trycloudflare.com/admin/login`)
- Sau đăng nhập tài khoản có `role: admin` → `/admin`
- Tab **Thống kê** (biểu đồ), **Người dùng**, **Bài viết**
- Xóa bài viết / tài khoản (không xóa admin)

## API (tóm tắt)

| Prefix | Mô tả |
|--------|--------|
| `/auth` | Đăng ký, đăng nhập |
| `/posts` | Bài đăng |
| `/bookings` | Đăng ký slot |
| `/notifications` | Thông báo |
| `/users` | Người dùng |
| `/admin` | Quản trị (yêu cầu JWT + role admin) |

Header xác thực: `Authorization: Bearer <token>`

## Lệnh npm

```bash
npm run dev      # Dev server (local + proxy API)
npm run tunnel   # Cloudflare Tunnel — chia sẻ ra internet
npm run build    # Build production
```

## Lưu ý phát triển

- **Vite proxy:** Chỉ proxy API (`/auth`, `/posts`, … và `/admin/users|posts|stats`). Không proxy `/admin` hay `/admin/login` (trang React).
- **Virtualenv:** Project có thể dùng `venv\Scripts\` (Windows) hoặc `venv\bin\` (MSYS). Chọn đúng lệnh `Activate.ps1` / `python.exe` tương ứng.
- **Production:** Deploy frontend (Vercel/Netlify) + backend (Render/Railway) + MongoDB Atlas; đặt `VITE_API_URL` trỏ tới API production.

## Xử lý sự cố

| Triệu chứng | Gợi ý |
|-------------|--------|
| `No module named 'flask'` | Kích hoạt venv trước khi `python app.py` |
| `/admin` báo Not Found | Restart `npm run dev` sau khi đổi `vite.config.js` |
| Link Cloudflare không mở được | Kiểm tra terminal 1–2 còn chạy; thử tạo tunnel mới |
| Trang trắng / API lỗi qua tunnel | Đảm bảo `npm run dev` đang chạy (proxy API qua cổng 5173) |
| API lỗi local | Kiểm tra MongoDB và `backend/.env` |
| Không vào được admin | Đăng nhập tại `/admin/login` bằng tài khoản có `role: admin` |

## Giấy phép

Dự án học tập / nội bộ có thể phát triển thêm nếu có kinh phí.
