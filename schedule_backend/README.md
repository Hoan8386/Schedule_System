# Shopping backend

Spring Boot backend for the `schedule_system` database, using the root package
`com.vn.shopping`.

## Chạy local

1. Tạo database và dữ liệu mẫu:
   `mysql -u root -p < ../sql`
2. Chạy ứng dụng: `mvn spring-boot:run`

Biến môi trường: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SERVER_PORT`,
`CORS_ALLOWED_ORIGINS`. Hibernate dùng `ddl-auto: validate`.

## Cấu hình

Cấu hình Java nằm trong `src/main/java/com/vn/shopping/config`:

- `CorsConfig`: cấu hình CORS cho frontend.
- `JacksonConfig`: serialize ngày giờ theo ISO-8601.
- `DateTimeFormatConfiguration`: nhận ngày giờ từ query/request theo ISO-8601.

Cấu hình Spring Boot nằm trong `src/main/resources/application.yml`. Không đặt
mật khẩu database hoặc API key trực tiếp trong source; dùng biến môi trường khi
triển khai.

## Cấu trúc

Mã nguồn nằm dưới `src/main/java/com/vn/shopping`, gồm `config`, `controller`,
`domain`, `dto`, `repository`, `service` và `util`. Main class là
`ShoppingApplication`.

Mỗi trong 44 bảng có entity, repository, service và controller riêng với CRUD
REST tại `/api/{table}` (GET collection/item, POST, PUT và DELETE). Các khóa
ghép dùng PUT/DELETE với JSON chứa khóa. Các API nghiệp vụ hiện có vẫn được giữ:

- `/api/stores`, `/api/employees`
- `/api/schedule/periods`, `/api/schedule/shifts`, `/api/schedule/calendar`, `/api/schedule/assignments`
- `/api/attendance` và `/api/attendance/check-in`

## Postman

Import duy nhất file `postman/Schedule_System.postman_collection.json`. Các biến
local đã được nhúng trực tiếp trong collection, không cần import environment
riêng. Sau khi import, chạy backend ở port `8080` rồi chạy các request.
Collection gồm:

- `Business APIs`: health check, các API lịch làm việc (`/schedule/*`), lọc
  nhân viên/cửa hàng và chấm công/check-in.
- `Resource APIs (44 controllers)`: mỗi controller có một folder riêng với
  `GET list`, `GET by id`, `POST create`, `PUT update` và `DELETE`. Body JSON
  được điền theo dữ liệu mẫu trong file `../sql`; các bảng ít dữ liệu dùng body
  tối thiểu để có thể chỉnh sửa trước khi gửi.

Các controller dùng khóa ghép (`user_role`, `role_permission`,
`notification_template_variable`) không có endpoint `GET /{id}` trong mã
nguồn. Folder tương ứng ghi rõ điều này; `PUT` và `DELETE` gửi toàn bộ khóa
ghép trong JSON body theo đúng controller.

Collection variables đã khai báo `baseUrl`, các khóa chính thường dùng (`userId`,
`employeeId`, `storeId`, `schedulePeriodId`, `shiftByDateId`, `roleId`,
`permissionId`) và biến ID cho từng resource. Có thể đổi giá trị các biến này
trước khi chạy request. Sau khi tạo bản ghi, cập nhật biến ID thủ công bằng ID
trả về nếu muốn chạy tiếp các request `GET/PUT/DELETE`.
