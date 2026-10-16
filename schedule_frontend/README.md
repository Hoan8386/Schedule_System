# Schedule Frontend – Ăn Vặt BLOAN

Giao diện quản lý ca làm, chấm công và nhân sự (Next.js 16 + Tailwind CSS v4).

```bash
npm run dev     # chạy môi trường phát triển (Turbopack)
npm run build   # build production
npm run lint    # kiểm tra ESLint
```

Biến môi trường: `NEXT_PUBLIC_API_URL` (mặc định `http://localhost:8080`).

## Cấu trúc thư mục

```
src/
├── app/                  Routing của Next.js (layout, page gốc chọn layout theo vai trò)
├── styles/theme.css      File CSS dùng chung toàn hệ thống: design token + class giao diện
├── components/
│   ├── ui/               Thành phần cơ bản: Button, Card, Modal/Drawer, Field/Input/Select,
│   │                     Badge, Alert, EmptyState, Spinner, PageHeader, Tabs
│   └── layout/           AppShell (Sidebar + Topbar) dùng chung cho mọi vai trò
├── features/             Mỗi vai trò một thư mục; trang lớn có thư mục riêng
│   ├── auth/             Đăng nhập, đăng ký, quên mật khẩu
│   ├── admin/            AdminLayout + tai-khoan/, api/, thong-bao/, thuong-hieu/ ...
│   ├── management/       ManagementLayout + lich/, nhan-su/, bai-test/, tong-quan/ ...
│   ├── store-manager/    StoreManagerLayout + todo/, bai-test/, vi-pham/, yeu-cau/ ...
│   └── employee/         EmployeeLayout + bai-kiem-tra/, dang-ky-ca/ ...
├── lib/
│   ├── api/              Tầng gọi API (import duy nhất từ "@/lib/api")
│   │   ├── http.ts       HTTP client, ApiError, helper crud()/withQuery()/uploadFile()
│   │   ├── auth.ts, admin.ts, employee.ts, storeManager.ts
│   │   ├── manager/      API quản lý chuỗi theo domain: hr, schedule, operations, test
│   │   └── types/        Kiểu response/request theo domain
│   ├── format.ts         Định dạng ngày giờ, tiền, chuẩn hóa dữ liệu backend
│   ├── theme.ts          Màu biểu đồ theo token, đổi theme lúc chạy
│   ├── hooks.ts          Hook dùng chung (useInitialLoad)
│   └── cn.ts             Ghép className
├── context/              AuthContext, ToastContext
└── types/                Kiểu dữ liệu xác thực
```

### Quy ước cho một trang lớn

Một trang có nhiều tab/modal được tách thành thư mục riêng, ví dụ `features/management/lich/`:

| File | Vai trò |
|---|---|
| `LichPage.tsx` | Điểm vào: header, tab, ghép các phần |
| `useScheduleData.ts` / `useScheduleLookups.ts` | Tải dữ liệu, map tra cứu, suy luận quan hệ |
| `ScheduleContext.tsx` | Chia sẻ dữ liệu + hành động cho các tab (tránh truyền props nhiều tầng) |
| `constants.ts` | Kiểu, nhãn, màu trạng thái |
| `tabs/`, `form/`, `components/` | Từng tab, form modal, thành phần nhỏ |

Giữ mỗi file dưới khoảng 300–400 dòng; khi vượt, tách tab/modal/bảng ra file riêng.

## Theme

Toàn bộ màu sắc khai báo dạng biến CSS trong [`src/styles/theme.css`](src/styles/theme.css) và được ánh xạ sang Tailwind:

| Class | Ý nghĩa |
|---|---|
| `brand-50 … brand-950` | Màu thương hiệu chính (mặc định vàng cam BLOAN) |
| `brand-contrast` | Màu chữ đặt trên nền `brand-500` |
| `accent` | Màu nhấn (đỏ logo) |
| `slate-*` | Màu trung tính, trỏ về `--neutral-*` nên cũng đổi theo theme |
| `app`, `page`, `surface` | Nền ứng dụng, nền trang, nền thẻ |
| `success`, `warning`, `danger`, `info` | Màu trạng thái |

Class dùng chung: `.page`, `.card`, `.tile`, `.btn` + `.btn-primary|secondary|danger|ghost`, `.field-label`, `.field-input`,
`.badge` + `.badge-*`, `.alert-*`, `.modal-backdrop`, `.modal-panel`, `.tab-active|inactive`, `.empty-state`.

**Quy tắc:** không dùng mã hex cứng hay palette `amber-*` trong component; dùng `brand-*`, `accent`, `slate-*`.
Thư viện cần chuỗi màu (Recharts) lấy từ `chartColors` trong `src/lib/theme.ts`.

**Đổi theme:**

1. Sửa giá trị biến trong `:root` của `theme.css`; hoặc
2. Thêm một khối `[data-theme="ten-theme"] { --brand-500: ...; }` rồi gọi `setThemeName("ten-theme")`
   (có sẵn ví dụ `ocean`); hoặc
3. Ghi đè từng token lúc chạy: `applyTheme({ "brand-500": "#2563eb", accent: "#ec4899" })`.
