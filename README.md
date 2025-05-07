# 🌱 MANAGER-GREENAPP - Trang Quản Lý

Đây là một ứng dụng web quản lý được xây dựng với **Vite** và **TypeScript**, hỗ trợ quản lý các tác vụ như đơn hàng, sản phẩm, tin nhắn, giá cả, và hỗ trợ. Dự án sử dụng **React** (giả định từ `.tsx`) và tổ chức theo mô hình nguồn (`src`) với định tuyến và các thành phần tái sử dụng.

---

## 🚀 Bắt đầu

### 1. Cài đặt dependencies

Cài đặt các thư viện **Node.js**:

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` (nếu cần thiết) để thiết lập các biến môi trường, ví dụ:

```env
VITE_API_URL=http://localhost:3000/api
PORT=5173
```

Cấu hình thêm trong `vite.config.ts` nếu cần.

### 3. Chạy dự án

#### Bước 1: Khởi động ứng dụng

Khởi động ứng dụng với **Vite**:

```bash
npm run dev
```

Ứng dụng sẽ chạy trên `http://localhost:5173` (hoặc cổng được định nghĩa trong `.env`).

#### Bước 2: Kiểm tra ứng dụng

Mở trình duyệt tại `http://localhost:5173` để truy cập trang quản lý. Đảm bảo các trang như `home`, `order`, `product`, v.v. hoạt động đúng.

#### Bước 3: Xây dựng cho sản xuất

Tạo bản build:

```bash
npm run build
```

Chạy bản build để kiểm tra:

```bash
npm run preview
```

---

## 🗂 Cấu trúc thư mục

```plaintext
MANAGER-GREENAPP/
├── node_modules/           # Thư viện Node.js
├── public/                 # Tài nguyên tĩnh
├── src/                    # Nguồn mã chính
│   ├── assets/             # Tài nguyên (hình ảnh, font)
│   ├── components/         # Thành phần tái sử dụng
│   ├── context/            # Quản lý context (state)
│   ├── constants/          # Hằng số
│   ├── features/           # Logic đặc thù
│   ├── pages/              # Trang quản lý
│   │   ├── home/           # Trang chính
│   │   ├── message/        # Trang tin nhắn
│   │   ├── order/          # Trang đơn hàng
│   │   ├── price/          # Trang giá cả
│   │   ├── product/        # Trang sản phẩm
│   │   ├── support/        # Trang hỗ trợ
│   │   └── NotFound.tsx    # Trang lỗi 404
│   ├── routes/             # Định tuyến
│   ├── services/           # Dịch vụ (API, logic)
│   ├── utils/              # Hàm tiện ích
│   ├── App.tsx             # Thành phần chính
│   └── main.ts             # Điểm nhập ứng dụng
├── index.html              # File HTML gốc
├── package-lock.json       # Khóa phiên bản dependencies
├── package.json            # Dependencies và scripts
└── vite.config.ts          # Cấu hình Vite
```

---

## 🧱 Công nghệ sử dụng

- **Vite**: Công cụ xây dựng nhanh.
- **TypeScript**: Đảm bảo mã nguồn an toàn.
- **React**: Framework UI.
- **JavaScript/TypeScript**: Logic ứng dụng.

---

## 📝 Ghi chú

- Đảm bảo đã cài **Node.js**.
- Kiểm tra kết nối API (nếu có) trước khi chạy.
- Chỉnh sửa các trang trong `src/pages` để tùy chỉnh.

---

## ✍️ Tác giả

- Nhóm: Green
- Email: [phamvanduy.dev@gmail.com](mailto:phamvanduy.dev@gmail.com)
- GitHub: [GreenTreeApp](https://github.com/GreenTreeApp)

Cảm ơn bạn đã sử dụng dự án! 🌟