# API response data contract

Tài liệu này là nguồn tham chiếu nhanh cho AI khi xây dựng frontend hoặc tích hợp
với Schedule System backend.

## 1. Thông tin chung

- Backend: Spring Boot.
- Base URL production: `https://api.nguyenvantrang.cloud`.
- Base path: `/api/v1`.
- Định dạng mặc định: JSON (`Content-Type: application/json`).
- Ngày: `YYYY-MM-DD`.
- Ngày giờ: ISO-8601, ví dụ `2026-10-07T14:30:00`.
- ID của entity: số nguyên, trừ khi response thực tế thể hiện khác.
- Không sử dụng các secret trong file cấu hình backend ở frontend.

## 2. Envelope thành công

Hầu hết response thành công được `FormatRestResponse` bọc trong envelope sau:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Call API Success",
  "data": {}
}
```

---

## 3. Envelope lỗi

Lỗi vẫn dùng các field `statusCode`, `error`, `message`, `data`:

```json
{
  "statusCode": 400,
  "error": "Validation failed",
  "message": [
    "email must be a valid email",
    "password must not be blank"
  ],
  "data": null
}
```

Các trường hợp thường gặp:

| HTTP | Ý nghĩa | Cách xử lý phía client |
|---:|---|---|
| `400` | Request/token/validation không hợp lệ | Hiển thị `message`; nếu là array, hiển thị từng lỗi. |
| `401` | Chưa đăng nhập hoặc access token không hợp lệ/hết hạn | Thử refresh token một lần, sau đó đưa về màn hình login. |
| `403` | Không có quyền | Hiển thị thông báo không đủ quyền, không retry. |
| `404` | Không tìm thấy resource hoặc URL | Hiển thị not found. |
| `409` | Xung đột nghiệp vụ, ví dụ đăng ký ca trùng hoặc ca đã đủ người | Hiển thị `message`, cho người dùng cập nhật lại dữ liệu. |
| `500` | Lỗi máy chủ | Hiển thị lỗi chung; không hiển thị stack trace. |

Không giả định `message` luôn là string. Luôn xử lý cả `string` và `string[]`.

## 4. Quy tắc dữ liệu trong `data`

Các response CRUD được tạo từ các class `*Response` và mapper dùng chung:

- Tên field JSON lấy từ JavaBean getter của entity, thường giữ dạng camelCase.
- Field có giá trị `null` vẫn có thể xuất hiện.
- Quan hệ giữa các entity không được expand sâu để tránh vòng lặp.
- Quan hệ đơn thường có dạng `{ "id": 123 }`.
- Quan hệ collection thường là mảng các object tối giản chứa `id`.
- Các field nhạy cảm như `password`, `passwordHash`, `refreshToken`, `token`,
  `secret` không được đưa vào response entity.
- Một số response kế thừa `LinkedHashMap<String, Object>`, vì vậy frontend
  không nên ép kiểu vào một schema quá cứng nếu chưa kiểm tra endpoint cụ thể.

Ví dụ quan hệ:

```json
{
  "id": 10,
  "employee": { "id": 7 },
  "stores": [{ "id": 1 }, { "id": 2 }]
}
```

## 5. Authentication

### 5.1 Đăng nhập

`POST /api/v1/auth/login`

Response:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Đăng nhập thành công",
  "data": {
    "access_token": "jwt-access-token",
    "refresh_token": "jwt-refresh-token",
    "user": {
      "id": 1,
      "username": "user01",
      "email": "user@example.com",
      "phone": "0900000000",
      "status": "ACTIVE",
      "roleCode": "ADMIN"
    }
  }
}
```

Gửi access token trong header:

```http
Authorization: Bearer <access_token>
```

### 5.2 Các endpoint auth

| Method | Endpoint | `data` thành công |
|---|---|---|
| `POST` | `/auth/register` | `{ "message": string, "token": string }` |
| `POST` | `/auth/confirm` | `null`, HTTP `200` |
| `POST` | `/auth/login` | `{ "access_token": string, "refresh_token": string, "user": UserLogin }`; `user` có thêm `roleCode` |
| `POST` | `/auth/refresh` | Giống login |
| `POST` | `/auth/forgot-password` | `{ "message": string, "token": string }` |
| `POST` | `/auth/reset-password` | `null`, HTTP `200` |

Tên field request refresh là `refreshToken`; tên field response là
`refresh_token` và `access_token`.

`UserLogin` có field role sau:

| Field | Kiểu | Mô tả |
|---|---|---|
| `roleCode` | `string \| null` | Mã role, ví dụ `ADMIN`, `MANAGER`, `EMPLOYEE`. |

Role code được lấy từ bản ghi role đầu tiên trong `user_role`, theo thứ tự
`assignedAt`. Nếu user chưa có bản ghi phân quyền trong `user_role`, field này
sẽ là `null`; cần gán role cho user trước khi đăng nhập.

## 6. CRUD endpoint convention

Các resource CRUD chuẩn dùng quy ước:

| Method | URL | `data` |
|---|---|---|
| `GET` | `/resource` | `Resource[]` |
| `GET` | `/resource/{id}` | `Resource` |
| `POST` | `/resource` | Resource vừa tạo |
| `PUT` | `/resource/{id}` | Resource vừa cập nhật |
| `DELETE` | `/resource/{id}` | Không có body, HTTP `204` |

Danh sách resource và response type tương ứng:

| Resource path | Response type |
|---|---|
| `/attachment` | `AttachmentResponse` |
| `/attendance` | `AttendanceResponse` |
| `/audit_log` | `AuditLogResponse` |
| `/bonus_detail` | `BonusDetailResponse` |
| `/bonus_record` | `BonusRecordResponse` |
| `/disciplinary_record` | `DisciplinaryRecordResponse` |
| `/emergency_request` | `EmergencyRequestResponse` |
| `/employee_evaluation` | `EmployeeEvaluationResponse` |
| `/employee_store` | `EmployeeStoreResponse` |
| `/employee_work_summary` | `EmployeeWorkSummaryResponse` |
| `/evaluation_criteria` | `EvaluationCriteriaResponse` |
| `/evaluation_detail` | `EvaluationDetailResponse` |
| `/event_scope` | `EventScopeResponse` |
| `/feedback` | `FeedbackResponse` |
| `/notification` | `NotificationResponse` |
| `/notification_template` | `NotificationTemplateResponse` |
| `/notification_template_variable` | `NotificationTemplateVariableResponse` |
| `/organization_setting` | `OrganizationSettingResponse` |
| `/payroll` | `PayrollResponse` |
| `/payroll_detail` | `PayrollDetailResponse` |
| `/permission` | `PermissionResponse` |
| `/regulations_rule` | `RegulationsRuleResponse` |
| `/role` | `RoleResponse` |
| `/role_permission` | `RolePermissionResponse` |
| `/rule` | `RuleResponse` |
| `/schedule_period` | `SchedulePeriodResponse` |
| `/shift` | `ShiftResponse` |
| `/shift_assignment` | `ShiftAssignmentResponse` |
| `/shift_by_date` | `ShiftByDateResponse` |
| `/special_event` | `SpecialEventResponse` |
| `/stores` | `StoreResponse` |
| `/store_manager` | `StoreManagerResponse` |
| `/system_config` | `SystemConfigResponse` |
| `/test` | `TestResponse` |
| `/test_assignment` | `TestAssignmentResponse` |
| `/test_option` | `TestOptionResponse` |
| `/test_question` | `TestQuestionResponse` |
| `/test_result` | `TestResultResponse` |
| `/todo` | `TodoResponse` |
| `/user` | `UserResponse` |
| `/user_role` | `UserRoleResponse` |
| `/variable` | `VariableResponse` |
| `/violation` | `ViolationResponse` |

Các path đặc biệt là `/employees`, `/stores`, `/schedule`, `/auth`; xem các mục
bên dưới thay vì áp dụng máy móc CRUD convention.

Health check:

- `GET /health`: endpoint kiểm tra tình trạng server; xem `HealthController` để
  biết payload hiện tại trước khi tạo type cố định cho frontend.

## 7. Employees và file upload

Base path: `/api/v1/employees`.

- `GET /employees`: trả `EmployeeResponse[]`; query tùy chọn `status`.
- `GET /employees/{id}`: trả `EmployeeResponse`.
- `POST /employees`: `multipart/form-data`, tạo employee, trả `EmployeeResponse`,
  HTTP `201`.
- `PUT /employees/{id}`: `multipart/form-data`, cập nhật employee, trả
  `EmployeeResponse`.
- `DELETE /employees/{id}`: HTTP `204`.

Các part bắt buộc khi tạo/cập nhật employee:

```text
userId, employeeCode, fullName, status, idCardFront, idCardBack
```

Các part tùy chọn: `dateOfBirth`, `gender`, `email`, `phone`, `address`,
`hireDate`, `note`.

Upload attachment riêng:

`POST /api/v1/attachment/upload` dùng `multipart/form-data` và trả
`AttachmentResponse` trong `data`.

## 8. Attendance

Attendance được mô tả đầy đủ trong **Module 4 — Quản lý chấm công** ở cuối
phần tài liệu nghiệp vụ. Phần này chỉ giữ liên kết tổng quan để tránh lặp
endpoint và cấu trúc response.

## 9. Schedule

Base path: `/api/v1/schedule`.

| Method | Endpoint | `data` |
|---|---|---|
| `GET` | `/schedule/periods?storeId={id}` | `ScheduleResponse[]` |
| `GET` | `/schedule/shifts?storeId={id}` | `ScheduleResponse[]` |
| `GET` | `/schedule/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` | `ScheduleResponse[]` |
| `GET` | `/schedule/assignments` | `ScheduleResponse[]` |
| `POST` | `/schedule/assignments` | `ScheduleResponse`, HTTP `201` |

`/schedule/assignments` hỗ trợ query `employeeId` hoặc `shiftByDateId`.
Khoảng ngày calendar phải hợp lệ và không dài hơn 3 tháng. Khi đăng ký ca,
request body có dạng:

```json
{
  "shiftByDateId": 12,
  "employeeId": 7
}
```

API có thể trả `409` nếu ca không mở, nhân viên đã đăng ký hoặc ca đã đủ sức
chứa.

## 10. Pagination và query

Các controller hiện tại chủ yếu trả mảng trực tiếp trong `data`; không tự động
đổi thành `{ meta, result }`. Chỉ khi endpoint thực tế trả
`ResultPaginationDTO` mới dùng schema:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Call API Success",
  "data": {
    "meta": {
      "page": 1,
      "pageSize": 20,
      "pages": 4,
      "total": 73
    },
    "result": []
  }
}
```

Không tự thêm `page`, `pageSize`, `meta` hoặc `result` vào các endpoint đang trả
array.

## 11. Hướng dẫn cho AI xây dựng client

1. Tạo một API client duy nhất để tự động unwrap `data`, nhưng vẫn giữ
   `statusCode`, `message` và `error` khi xử lý lỗi.
2. Với list, kiểm tra `Array.isArray(data)` trước khi map.
3. Hiển thị lỗi từ `message`; nếu là mảng thì join hoặc render theo danh sách.
4. Với HTTP `401`, refresh token tối đa một lần để tránh vòng lặp vô hạn.
5. Không đọc hoặc gửi các field nhạy cảm được loại khỏi entity response.
6. Với entity relation, dùng `relation.id` để lấy ID; không giả định relation đã
   chứa toàn bộ object.
7. Với upload, dùng `FormData`, không tự đặt `Content-Type` để browser tự thêm
   boundary.
8. Khi thêm màn hình cho resource mới, kiểm tra controller và `*Response` tương
   ứng trước khi cố định TypeScript interface.

## 12. Source of truth trong backend

- Envelope thành công: `schedule_backend/src/main/java/com/vn/schedule/util/FormatRestResponse.java`
- Envelope lỗi: `schedule_backend/src/main/java/com/vn/schedule/util/error/GlobalException.java`
- Schema envelope: `schedule_backend/src/main/java/com/vn/schedule/dto/response/RestResponse.java`
- Login response: `schedule_backend/src/main/java/com/vn/schedule/dto/response/ResLoginDTO.java`
- Mapper entity: `schedule_backend/src/main/java/com/vn/schedule/dto/DtoMapper.java`
- Endpoint implementations: `schedule_backend/src/main/java/com/vn/schedule/controller/`

---

## 13. USER API (`/api/v1/user`)

Quản lý tài khoản người dùng hệ thống.
Controller: `UserController.java` | Service: `UserService.java` | Entity: `User.java`

### 13.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/user` | Lấy danh sách toàn bộ user | Không | `200` | `UserResponse[]` |
| `GET` | `/api/v1/user/{id}` | Lấy chi tiết user theo ID | Không | `200` | `UserResponse` |
| `POST` | `/api/v1/user` | Tạo mới user | `UserRequest` (JSON) | `201` | `UserResponse` |
| `PUT` | `/api/v1/user/{id}` | Cập nhật user theo ID | `UserRequest` (JSON) | `200` | `UserResponse` |
| `DELETE` | `/api/v1/user/{id}` | Xóa user theo ID | Không | `204` | Không có body |

### 13.2 Cấu trúc dữ liệu `UserResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | ID duy nhất của user (Primary Key). |
| `username` | `string` | Không | Tên đăng nhập (duy nhất, tối đa 100 ký tự). |
| `email` | `string` | Có | Địa chỉ email (duy nhất). |
| `phone` | `string` | Có | Số điện thoại (duy nhất). |
| `status` | `string` | Không | Trạng thái tài khoản (ví dụ: `ACTIVE`, `INACTIVE`, `BLOCKED`). |
| `lastLoginAt` | `string` (ISO 8601) | Có | Thời điểm đăng nhập gần nhất (ví dụ: `2026-10-07T14:30:00`). |
| `createdAt` | `string` (ISO 8601) | Có | Thời điểm tạo tài khoản. |
| `updatedAt` | `string` (ISO 8601) | Có | Thời điểm cập nhật tài khoản gần nhất. |

> [!IMPORTANT]
> - Trường `passwordHash` / `password` **hoàn toàn bị loại bỏ** trong response bởi `DtoMapper` và `@JsonIgnore`, frontend không bao giờ nhận được mật khẩu.
> - Khóa chính của user trong response là **`id`** (kiểu số nguyên).

### 13.3 Request Body cho POST / PUT (`UserRequest`)

```json
{
  "username": "hoan_admin",
  "passwordHash": "$2a$10$xyz...",
  "email": "hoan@example.com",
  "phone": "0987654321",
  "status": "ACTIVE"
}
```

### 13.4 Ví dụ Response thực tế

#### `GET /api/v1/user` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "phone": "0901234567",
      "status": "ACTIVE",
      "lastLoginAt": "2026-10-08T08:30:00",
      "createdAt": "2026-09-01T10:00:00",
      "updatedAt": "2026-10-08T08:30:00"
    },
    {
      "id": 2,
      "username": "manager_store1",
      "email": "manager1@example.com",
      "phone": "0912345678",
      "status": "ACTIVE",
      "lastLoginAt": null,
      "createdAt": "2026-09-10T14:15:00",
      "updatedAt": "2026-09-10T14:15:00"
    }
  ]
}
```

#### `GET /api/v1/user/1` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy thông tin chi tiết",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "phone": "0901234567",
    "status": "ACTIVE",
    "lastLoginAt": "2026-10-08T08:30:00",
    "createdAt": "2026-09-01T10:00:00",
    "updatedAt": "2026-10-08T08:30:00"
  }
}
```

#### `POST /api/v1/user` (201 Created)
```json
{
  "statusCode": 201,
  "error": null,
  "message": "Tạo mới dữ liệu",
  "data": {
    "id": 3,
    "username": "hoan_admin",
    "email": "hoan@example.com",
    "phone": "0987654321",
    "status": "ACTIVE",
    "lastLoginAt": null,
    "createdAt": "2026-10-08T20:00:00",
    "updatedAt": null
  }
}
```

#### `DELETE /api/v1/user/3` (204 No Content)
- HTTP Status: `204`
- Response Body: Không có nội dung (Empty).

---

## MODULE 2 — NHÂN SỰ VÀ CỬA HÀNG

Module này quản lý hồ sơ nhân viên, thông tin cửa hàng/chi nhánh, phân bổ
nhân viên vào cửa hàng và xác định nhân viên đang giữ vai trò quản lý cửa hàng.

Các resource trong Module 2:

| Nghiệp vụ | Resource | Base path |
|---|---|---|
| Hồ sơ nhân viên | `EMPLOYEE` | `/api/v1/employees` |
| Thông tin cửa hàng / chi nhánh | `STORE` | `/api/v1/stores` |
| Phân bổ nhân viên vào một hoặc nhiều cửa hàng | `EMPLOYEE_STORE` | `/api/v1/employee_store` |
| Xác định nhân viên quản lý cửa hàng | `STORE_MANAGER` | `/api/v1/store_manager` |

### 14A. EMPLOYEE API (`/api/v1/employees`)

Quản lý hồ sơ nghiệp vụ của nhân viên. Mỗi employee bắt buộc liên kết duy nhất
với một user thông qua `userId`.

Controller: `EmployeeController.java` | Entity: `Employee.java`

#### 14A.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Query params | Request Body | HTTP Status | Response `data` |
|---|---|---|---|---|:---:|---|
| `GET` | `/api/v1/employees` | Lấy toàn bộ hồ sơ nhân viên | Không bắt buộc: `status` | Không | `200` | `EmployeeResponse[]` |
| `GET` | `/api/v1/employees/{id}` | Lấy hồ sơ nhân viên theo `employee_id` | Không | Không | `200` | `EmployeeResponse` |
| `POST` | `/api/v1/employees` | Tạo hồ sơ employee và liên kết với user có sẵn | Không | `EmployeeRequest` (JSON) | `201` | `EmployeeResponse` |
| `PUT` | `/api/v1/employees/{id}` | Cập nhật hồ sơ employee theo ID | Không | `EmployeeRequest` (JSON) | `200` | `EmployeeResponse` |
| `DELETE` | `/api/v1/employees/{id}` | Xóa hồ sơ employee theo ID | Không | Không | `204` | Không có body |

#### 14A.2 Query parameter

```http
GET /api/v1/employees?status=ACTIVE
```

- Không truyền `status`: gọi `findAll()` và trả toàn bộ employee.
- Có truyền `status`: lọc theo status và sắp xếp theo `fullName`.
- Giá trị status do dữ liệu nghiệp vụ quyết định, thường dùng `ACTIVE`,
  `INACTIVE` hoặc `RESIGNED`.

#### 14A.3 Cấu trúc dữ liệu `EmployeeResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | Khóa chính employee (`employee_id`). |
| `user` | `{ "id": number }` | Không | User liên kết với employee; response chỉ giữ ID quan hệ. |
| `employeeCode` | `string` | Không | Mã nhân viên, duy nhất. |
| `fullName` | `string` | Không | Họ và tên nhân viên. |
| `dateOfBirth` | `string` (`YYYY-MM-DD`) | Có | Ngày sinh. |
| `gender` | `string` | Có | Giới tính. |
| `email` | `string` | Có | Email nghiệp vụ của employee. |
| `phone` | `string` | Có | Số điện thoại nghiệp vụ. |
| `address` | `string` | Có | Địa chỉ. |
| `idCardFrontId` | `number` | Có | ID attachment mặt trước CCCD. |
| `idCardBackId` | `number` | Có | ID attachment mặt sau CCCD. |
| `hireDate` | `string` (`YYYY-MM-DD`) | Có | Ngày bắt đầu làm việc. |
| `status` | `string` | Không | Trạng thái hồ sơ employee. |
| `note` | `string` | Có | Ghi chú. |
| `createdAt` | `string` (ISO 8601) | Có | Thời điểm tạo. |
| `updatedAt` | `string` (ISO 8601) | Có | Thời điểm cập nhật. |

#### 14A.4 Request Body `EmployeeRequest`

Tạo mới bắt buộc phải truyền `userId`, hoặc truyền object `user` có field `id`.
Backend dùng `resolvedUserId()` để hỗ trợ cả hai cách.

```json
{
  "userId": 12,
  "employeeCode": "EMP0012",
  "fullName": "Nguyễn Văn An",
  "dateOfBirth": "2000-05-12",
  "gender": "MALE",
  "email": "an@example.com",
  "phone": "0900000012",
  "address": "Đà Nẵng",
  "hireDate": "2026-10-01",
  "status": "ACTIVE",
  "note": "Nhân viên bán thời gian"
}
```

Các field `idCardFrontId`, `idCardBackId`, `createdAt` và `updatedAt` không thuộc
request record hiện tại và không được dùng để cập nhật qua controller này.

> [!IMPORTANT]
> - `userId` phải trỏ tới user đã tồn tại.
> - `employee_id` là ID của employee, không phải `user_id`.
> - `PUT` sử dụng ID trên URL để tìm employee; không gửi ID khác trong body.
> - Xóa employee không đồng nghĩa với xóa user liên kết.

#### 14A.5 Ví dụ response

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy dữ liệu",
  "data": [
    {
      "id": 12,
      "user": { "id": 35 },
      "employeeCode": "EMP0012",
      "fullName": "Nguyễn Văn An",
      "dateOfBirth": "2000-05-12",
      "gender": "MALE",
      "email": "an@example.com",
      "phone": "0900000012",
      "address": "Đà Nẵng",
      "idCardFrontId": null,
      "idCardBackId": null,
      "hireDate": "2026-10-01",
      "status": "ACTIVE",
      "note": "Nhân viên bán thời gian",
      "createdAt": "2026-10-01T08:00:00",
      "updatedAt": "2026-10-01T08:00:00"
    }
  ]
}
```

### 14B. STORE API (`/api/v1/stores`)

Quản lý thông tin cửa hàng hoặc chi nhánh trong hệ thống.

Controller: `StoreController.java` | Entity: `Store.java`

#### 14B.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Query params | Request Body | HTTP Status | Response `data` |
|---|---|---|---|---|:---:|---|
| `GET` | `/api/v1/stores` | Lấy toàn bộ cửa hàng | Không bắt buộc: `status` | Không | `200` | `StoreResponse[]` |
| `GET` | `/api/v1/stores/{id}` | Lấy cửa hàng theo `store_id` | Không | Không | `200` | `StoreResponse` |
| `POST` | `/api/v1/stores` | Tạo cửa hàng mới | Không | `StoreRequest` (JSON) | `201` | `StoreResponse` |
| `PUT` | `/api/v1/stores/{id}` | Cập nhật cửa hàng theo ID | Không | `StoreRequest` (JSON) | `200` | `StoreResponse` |
| `DELETE` | `/api/v1/stores/{id}` | Xóa cửa hàng theo ID | Không | Không | `204` | Không có body |

#### 14B.2 Query parameter

```http
GET /api/v1/stores?status=ACTIVE
```

- Không truyền `status`: trả `stores.findAll()`.
- Có truyền `status`: lọc theo trạng thái và sắp xếp tăng dần theo `storeName`.

#### 14B.3 Cấu trúc dữ liệu `StoreResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | Khóa chính cửa hàng (`store_id`). |
| `storeCode` | `string` | Không | Mã cửa hàng, duy nhất. |
| `storeName` | `string` | Không | Tên cửa hàng / chi nhánh. |
| `logoImage` | `string` | Có | Ảnh logo dạng Data URL (`data:<mime>;base64,...`) để dùng trực tiếp trong `src`. |
| `logoContentType` | `string` | Có | MIME type của ảnh logo, ví dụ `image/png`. |
| `address` | `string` | Có | Địa chỉ cửa hàng. |
| `phone` | `string` | Có | Số điện thoại cửa hàng. |
| `status` | `string` | Không | Trạng thái cửa hàng. |
| `note` | `string` | Có | Ghi chú. |
| `createdAt` | `string` (ISO 8601) | Có | Thời điểm tạo. |
| `updatedAt` | `string` (ISO 8601) | Có | Thời điểm cập nhật. |

#### 14B.4 Request Body `StoreRequest`

```json
{
  "storeCode": "STORE_DN_01",
  "storeName": "Schedule Đà Nẵng",
  "logoId": 8,
  "address": "12 Nguyễn Văn Linh, Đà Nẵng",
  "phone": "0236000001",
  "status": "ACTIVE",
  "note": "Chi nhánh trung tâm"
}
```

`storeCode`, `storeName` và `status` là các field bắt buộc theo entity. `logoId`,
`address`, `phone` và `note` có thể là `null`.

#### 14B.4A Upload logo cửa hàng

Trước khi tạo hoặc cập nhật cửa hàng, client gửi ảnh dạng `multipart/form-data`:

```http
POST /api/v1/attachment/upload
Content-Type: multipart/form-data
```

Field bắt buộc là `file`. Backend kiểm tra đây là ảnh tối đa 10 MB, lưu file lên
Cloudflare R2, lưu metadata vào bảng `attachment` và trả về `attachmentId`
cùng `url`. Client dùng `attachmentId` làm `logoId` trong request
`POST /api/v1/stores` hoặc `PUT /api/v1/stores/{id}`.

Response của `GET /api/v1/stores` và `GET /api/v1/stores/{id}` không trả
`logoId` hoặc URL ảnh riêng. Backend đọc ảnh từ R2 và nhúng trực tiếp vào
response dưới dạng Data URL:

```json
{
  "storeName": "Schedule Đà Nẵng",
  "logoContentType": "image/png",
  "logoImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
}
```

Frontend dùng trực tiếp `logoImage` cho thuộc tính `src` của thẻ ảnh.

```json
{
  "attachmentId": 18,
  "fileName": "logo.png",
  "filePath": "images/uuid.png",
  "fileType": "image/png",
  "fileSize": 24576,
  "url": "https://cdn.example.com/images/uuid.png"
}
```

> [!IMPORTANT]
> - `id` trong response là `store_id`.
> - Khi `PUT`, ID lấy từ URL `/stores/{id}`; không dùng ID trong body.
> - `GET /stores?status=...` dùng đúng giá trị status lưu trong database.
> - `logoImage` và `logoContentType` chỉ có khi `logoId` trỏ tới attachment tồn tại.

#### 14B.5 Ví dụ response

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy dữ liệu",
  "data": [
    {
      "id": 1,
      "storeCode": "STORE_DN_01",
      "storeName": "Schedule Đà Nẵng",
      "logoId": 8,
      "address": "12 Nguyễn Văn Linh, Đà Nẵng",
      "phone": "0236000001",
      "status": "ACTIVE",
      "note": "Chi nhánh trung tâm",
      "createdAt": "2026-10-01T08:00:00",
      "updatedAt": "2026-10-01T08:00:00"
    }
  ]
}
```

### 14C. EMPLOYEE_STORE API (`/api/v1/employee_store`)

Quản lý quan hệ phân bổ một employee vào một hoặc nhiều store. Đây là bảng
liên kết nghiệp vụ, không phải quan hệ JPA object được expand trong response.

Controller: `EmployeeStoreController.java` | Service: `EmployeeStoreService.java` |
Entity: `EmployeeStore.java`

#### 14C.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/employee_store` | Lấy danh sách phân bổ, có thể lọc theo cửa hàng, vai trò và trạng thái | Query tùy chọn | `200` | `EmployeeStoreResponse[]` |
| `GET` | `/api/v1/employee_store/{id}` | Lấy bản ghi phân bổ theo ID | Không | `200` | `EmployeeStoreResponse` |
| `POST` | `/api/v1/employee_store` | Phân bổ employee vào store | `EmployeeStoreRequest` (JSON) | `201` | `EmployeeStoreResponse` |
| `PUT` | `/api/v1/employee_store/{id}` | Cập nhật bản ghi phân bổ | `EmployeeStoreRequest` (JSON) | `200` | `EmployeeStoreResponse` |
| `DELETE` | `/api/v1/employee_store/{id}` | Xóa phân bổ employee-store | Không | `204` | Không có body |

#### 14C.2 Cấu trúc dữ liệu `EmployeeStoreResponse`

Các bộ lọc hỗ trợ:

```http
GET /api/v1/employee_store?storeId=1&role=MANAGER&status=ACTIVE&primary=true
```

- `storeId`: chỉ lấy nhân viên đang được phân bổ vào cửa hàng đó.
- `role`: `MANAGER` lấy nhân viên có bản ghi quản lý cửa hàng đang tương ứng;
  `EMPLOYEE` hoặc `STAFF` lấy các nhân viên còn lại.
- `status`: lọc trạng thái phân bổ.
- `primary`: `true` hoặc `false`, lọc cửa hàng chính/phụ.

Khi `PUT /api/v1/employee_store/{id}`, `employeeId` và `storeId` trong request
được cập nhật trực tiếp. Vì vậy có thể chuyển nhân viên phụ trách sang nhân viên
khác hoặc chuyển phân bổ sang cửa hàng khác mà không thay đổi
`employeeStoreId` trên URL.

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `employeeStoreId` | `number` | Không | Khóa chính của bản ghi phân bổ. |
| `employeeId` | `number` | Không | ID employee được phân bổ. |
| `storeId` | `number` | Không | ID store tiếp nhận employee. |
| `startDate` | `string` (`YYYY-MM-DD`) | Có | Ngày bắt đầu phân bổ. |
| `endDate` | `string` (`YYYY-MM-DD`) | Có | Ngày kết thúc phân bổ. |
| `isPrimary` | `boolean` | Có | Có phải cửa hàng chính của employee hay không. |
| `status` | `string` | Có | Trạng thái phân bổ. |
| `assignedBy` | `number` | Có | ID user thực hiện phân bổ. |
| `createdAt` | `string` (ISO 8601) | Có | Thời điểm tạo bản ghi. |

#### 14C.3 Request Body `EmployeeStoreRequest`

```json
{
  "employeeId": 12,
  "storeId": 1,
  "startDate": "2026-10-01",
  "endDate": null,
  "isPrimary": true,
  "status": "ACTIVE",
  "assignedBy": 35
}
```

> [!IMPORTANT]
> - `employeeId` là `employee_id`, không phải `user_id`.
> - `storeId` là `store_id`.
> - Có thể tạo nhiều bản ghi cho cùng một employee để phân bổ vào nhiều cửa hàng.
> - `employeeStoreId` là khóa của bản ghi quan hệ; khi cập nhật nên dùng ID trên URL.
> - Controller hiện trả CRUD chuẩn và không tự kiểm tra employee/store tồn tại trước
>   khi lưu; lỗi khóa ngoại sẽ do database xử lý.

#### 14C.4 Ví dụ response

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "employeeStoreId": 21,
      "employeeId": 12,
      "storeId": 1,
      "startDate": "2026-10-01",
      "endDate": null,
      "isPrimary": true,
      "status": "ACTIVE",
      "assignedBy": 35,
      "createdAt": "2026-10-01T08:30:00"
    }
  ]
}
```

### 14D. STORE_MANAGER API (`/api/v1/store_manager`)

Quản lý việc bổ nhiệm employee làm quản lý của store trong một khoảng thời gian.

Controller: `StoreManagerController.java` | Service: `StoreManagerService.java` |
Entity: `StoreManager.java`

#### 14D.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/store_manager` | Lấy toàn bộ lịch sử / bản ghi quản lý cửa hàng | Không | `200` | `StoreManagerResponse[]` |
| `GET` | `/api/v1/store_manager/{id}` | Lấy bản ghi quản lý theo ID | Không | `200` | `StoreManagerResponse` |
| `POST` | `/api/v1/store_manager` | Bổ nhiệm employee làm quản lý store | `StoreManagerRequest` (JSON) | `201` | `StoreManagerResponse` |
| `PUT` | `/api/v1/store_manager/{id}` | Cập nhật bản ghi bổ nhiệm | `StoreManagerRequest` (JSON) | `200` | `StoreManagerResponse` |
| `DELETE` | `/api/v1/store_manager/{id}` | Xóa bản ghi bổ nhiệm | Không | `204` | Không có body |

#### 14D.2 Cấu trúc dữ liệu `StoreManagerResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `storeManagerId` | `number` | Không | Khóa chính bản ghi bổ nhiệm. |
| `storeId` | `number` | Không | ID cửa hàng được quản lý. |
| `employeeId` | `number` | Không | ID employee được bổ nhiệm. |
| `startDate` | `string` (`YYYY-MM-DD`) | Có | Ngày bắt đầu giữ vai trò. |
| `endDate` | `string` (`YYYY-MM-DD`) | Có | Ngày kết thúc giữ vai trò. |
| `status` | `string` | Có | Trạng thái bổ nhiệm. |
| `assignedBy` | `number` | Có | ID user thực hiện bổ nhiệm. |
| `note` | `string` | Có | Ghi chú bổ nhiệm. |
| `createdAt` | `string` (ISO 8601) | Có | Thời điểm tạo bản ghi. |

#### 14D.3 Request Body `StoreManagerRequest`

```json
{
  "storeId": 1,
  "employeeId": 12,
  "startDate": "2026-10-01",
  "endDate": null,
  "status": "ACTIVE",
  "assignedBy": 35,
  "note": "Bổ nhiệm quản lý cửa hàng"
}
```

> [!IMPORTANT]
> - `employeeId` phải là ID của employee, không phải ID tài khoản user.
> - `storeId` phải là ID của store.
> - Module này lưu lịch sử bổ nhiệm; việc một store có một hay nhiều manager
>   đang hoạt động cần được kiểm soát ở tầng nghiệp vụ hoặc database.
> - `storeManagerId` lấy từ response và dùng trong URL khi cập nhật/xóa.

#### 14D.4 Ví dụ response

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "storeManagerId": 7,
      "storeId": 1,
      "employeeId": 12,
      "startDate": "2026-10-01",
      "endDate": null,
      "status": "ACTIVE",
      "assignedBy": 35,
      "note": "Bổ nhiệm quản lý cửa hàng",
      "createdAt": "2026-10-01T08:45:00"
    }
  ]
}
```

### 14E. Quy tắc dùng chung cho Module 2

- Tất cả response đều nằm trong envelope chuẩn `statusCode`, `error`, `message`,
  `data`.
- Danh sách trả `data` là mảng; không tự đọc trực tiếp response envelope như một
  mảng.
- Ngày dùng định dạng `YYYY-MM-DD`; ngày giờ dùng ISO-8601.
- Xóa thành công trả HTTP `204` và không có response body.
- Khi có lỗi `400`, `404`, `409` hoặc `500`, frontend phải hiển thị `message`;
  `message` có thể là chuỗi hoặc mảng chuỗi.
- Không gửi các field ID tự sinh trong body tạo mới. Với PUT, luôn dùng ID trên URL.

---



# MODULE 3 - QUẢN LÝ LỊCH LÀM VIỆC VÀ YÊU CẦU KHẨN

Module 3 gồm các nghiệp vụ:

| Nghiệp vụ | Resource | Endpoint |
|---|---|---|
| Kỳ lập lịch | `SCHEDULE_PERIOD` | `/api/v1/schedule_period` |
| Ca làm việc mẫu | `SHIFT` | `/api/v1/shift` |
| Ca làm việc theo ngày | `SHIFT_BY_DATE` | `/api/v1/shift_by_date` |
| Phân công nhân viên vào ca | `SHIFT_ASSIGNMENT` | `/api/v1/shift_assignment` |
| Yêu cầu khẩn cấp | `EMERGENCY_REQUEST` | `/api/v1/emergency_request` |

Các controller tương ứng:

- `SchedulePeriodController`
- `ShiftController`
- `ShiftByDateController`
- `ShiftAssignmentController`
- `EmergencyRequestController`

## 15. Quy ước chung Module 3

- Tất cả endpoint đều bắt đầu bằng `/api/v1`.
- Danh sách trả về `data` là một mảng.
- Chi tiết, tạo mới và cập nhật trả về `data` là một object.
- Tạo mới trả HTTP `201 Created`.
- Cập nhật trả HTTP `200 OK`.
- Xóa thành công trả HTTP `204 No Content`, không có body.
- Ngày dùng định dạng `YYYY-MM-DD`.
- Giờ dùng định dạng `HH:mm:ss`.
- Ngày giờ dùng ISO-8601, ví dụ `2026-10-08T08:30:00`.
- ID của bản ghi tạo tự động không gửi trong request POST.
- Với PUT và DELETE, ID phải truyền trên URL.
- Các field quan hệ chỉ gửi ID, không gửi object entity lồng nhau.

---

## 15A. SCHEDULE_PERIOD API (`/api/v1/schedule_period`)

Quản lý kỳ lập lịch theo từng cửa hàng. Một kỳ lập lịch xác định khoảng thời
gian mà cửa hàng mở đăng ký và chốt lịch làm việc.

### 15A.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/schedule_period` | Lấy toàn bộ kỳ lập lịch | Không | `200` | `SchedulePeriodResponse[]` |
| `GET` | `/api/v1/schedule_period/{id}` | Lấy một kỳ lập lịch theo ID | Không | `200` | `SchedulePeriodResponse` |
| `POST` | `/api/v1/schedule_period` | Tạo kỳ lập lịch mới | JSON | `201` | `SchedulePeriodResponse` |
| `PUT` | `/api/v1/schedule_period/{id}` | Cập nhật kỳ lập lịch | JSON | `200` | `SchedulePeriodResponse` |
| `DELETE` | `/api/v1/schedule_period/{id}` | Xóa kỳ lập lịch | Không | `204` | Không có body |

### 15A.2 Cấu trúc `SchedulePeriodResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | ID kỳ lập lịch (`schedule_period_id`). |
| `store` hoặc `storeId` | `object/number` | Không | Cửa hàng áp dụng. Khi response dùng mapper quan hệ, giá trị thường chứa ID quan hệ. |
| `periodName` | `string` | Không | Tên kỳ, ví dụ `Tuần 1 tháng 10/2026`. |
| `periodType` | `string` | Không | Loại kỳ, ví dụ `WEEKLY`, `MONTHLY`. |
| `startDate` | `string` | Không | Ngày bắt đầu kỳ. |
| `endDate` | `string` | Không | Ngày kết thúc kỳ. |
| `registrationOpenAt` | `string` | Có | Thời điểm bắt đầu đăng ký. |
| `registrationCloseAt` | `string` | Có | Thời điểm đóng đăng ký. |
| `status` | `string` | Không | Trạng thái kỳ, ví dụ `DRAFT`, `OPEN`, `CLOSED`, `FINALIZED`. |
| `createdAt` | `string` | Có | Thời điểm tạo. |
| `createdBy` | `number` | Có | User tạo kỳ. |
| `finalizedBy` | `number` | Có | User chốt kỳ. |
| `finalizedAt` | `string` | Có | Thời điểm chốt kỳ. |

### 15A.3 Request Body POST/PUT

```json
{
  "storeId": 1,
  "periodName": "Tuần 1 tháng 10/2026",
  "periodType": "WEEKLY",
  "startDate": "2026-10-05",
  "endDate": "2026-10-11",
  "registrationOpenAt": "2026-10-01T08:00:00",
  "registrationCloseAt": "2026-10-03T23:59:59",
  "status": "OPEN",
  "createdBy": 1
}
```

Khi cập nhật trạng thái đã chốt, có thể truyền thêm:

```json
{
  "status": "FINALIZED",
  "finalizedBy": 1,
  "finalizedAt": "2026-10-04T18:00:00"
}
```

---

## 15B. SHIFT API (`/api/v1/shift`)

Quản lý ca làm việc mẫu của một cửa hàng. Đây là định nghĩa ca theo giờ,
chưa gắn với một ngày cụ thể.

### 15B.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/shift` | Lấy toàn bộ ca mẫu | Không | `200` | `ShiftResponse[]` |
| `GET` | `/api/v1/shift/{id}` | Lấy ca mẫu theo ID | Không | `200` | `ShiftResponse` |
| `POST` | `/api/v1/shift` | Tạo ca mẫu | JSON | `201` | `ShiftResponse` |
| `PUT` | `/api/v1/shift/{id}` | Cập nhật ca mẫu | JSON | `200` | `ShiftResponse` |
| `DELETE` | `/api/v1/shift/{id}` | Xóa ca mẫu | Không | `204` | Không có body |

### 15B.2 Cấu trúc `ShiftResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | ID ca (`shift_id`). |
| `store` hoặc `storeId` | `object/number` | Không | Cửa hàng sở hữu ca. |
| `shiftCode` | `string` | Không | Mã ca duy nhất trong phạm vi nghiệp vụ. |
| `shiftName` | `string` | Không | Tên ca, ví dụ `Ca sáng`. |
| `startTime` | `string` | Không | Giờ bắt đầu. |
| `endTime` | `string` | Không | Giờ kết thúc. |
| `maxCapacity` | `number` | Có | Số nhân viên tối đa của ca. |
| `payRate` | `number` | Có | Mức lương/đơn giá của ca. |
| `status` | `string` | Không | `ACTIVE` hoặc `INACTIVE`. |
| `note` | `string` | Có | Ghi chú ca. |
| `createdBy` | `number` | Có | User tạo ca. |
| `createdAt` | `string` | Có | Thời điểm tạo. |
| `updatedAt` | `string` | Có | Thời điểm cập nhật. |

### 15B.3 Request Body POST/PUT

```json
{
  "storeId": 1,
  "shiftCode": "MORNING",
  "shiftName": "Ca sáng",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "maxCapacity": 5,
  "payRate": 250000,
  "status": "ACTIVE",
  "note": "Ca làm việc buổi sáng",
  "createdBy": 1
}
```

---

## 15C. SHIFT_BY_DATE API (`/api/v1/shift_by_date`)

Quản lý ca được phát sinh cho một ngày cụ thể. Bản ghi có thể lấy thông tin
giờ từ `SHIFT`, đồng thời cho phép điều chỉnh sức chứa, đơn giá hoặc ghi chú
cho riêng ngày đó.

### 15C.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/shift_by_date` | Lấy toàn bộ ca theo ngày | Không | `200` | `ShiftByDateResponse[]` |
| `GET` | `/api/v1/shift_by_date/{id}` | Lấy ca theo ngày theo ID | Không | `200` | `ShiftByDateResponse` |
| `POST` | `/api/v1/shift_by_date` | Tạo ca cho một ngày | JSON | `201` | `ShiftByDateResponse` |
| `PUT` | `/api/v1/shift_by_date/{id}` | Cập nhật ca theo ngày | JSON | `200` | `ShiftByDateResponse` |
| `DELETE` | `/api/v1/shift_by_date/{id}` | Xóa ca theo ngày | Không | `204` | Không có body |

### 15C.2 Cấu trúc `ShiftByDateResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | ID ca theo ngày (`shift_by_date_id`). |
| `shift` hoặc `shiftId` | `object/number` | Không | Ca mẫu nguồn. |
| `schedulePeriod` hoặc `schedulePeriodId` | `object/number` | Có | Kỳ lập lịch chứa ca. |
| `workDate` | `string` | Không | Ngày làm việc. |
| `capacity` | `number` | Có | Số lượng đã đăng ký/được phân bổ. |
| `shiftName` | `string` | Có | Tên ca hiển thị tại ngày đó. |
| `startTime` | `string` | Có | Giờ bắt đầu áp dụng trong ngày. |
| `endTime` | `string` | Có | Giờ kết thúc áp dụng trong ngày. |
| `maxCapacity` | `number` | Có | Sức chứa tối đa của ca. |
| `payRate` | `number` | Có | Đơn giá áp dụng trong ngày. |
| `status` | `string` | Không | Trạng thái ca. |
| `managerNote` | `string` | Có | Ghi chú của quản lý. |

### 15C.3 Request Body POST/PUT

```json
{
  "shiftId": 3,
  "schedulePeriodId": 2,
  "workDate": "2026-10-08",
  "capacity": 0,
  "shiftName": "Ca sáng - Thứ năm",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "maxCapacity": 5,
  "payRate": 250000,
  "status": "OPEN",
  "managerNote": "Có thể đăng ký thêm"
}
```

---

## 15D. SHIFT_ASSIGNMENT API (`/api/v1/shift_assignment`)

Quản lý việc phân công một nhân viên vào một ca cụ thể. Một nhân viên không
được tạo hai bản ghi cho cùng một `shiftByDateId` theo ràng buộc duy nhất của
bảng `shift_assignment`.

### 15D.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/shift_assignment` | Lấy toàn bộ phân công ca | Không | `200` | `ShiftAssignmentResponse[]` |
| `GET` | `/api/v1/shift_assignment/{id}` | Lấy phân công theo ID | Không | `200` | `ShiftAssignmentResponse` |
| `POST` | `/api/v1/shift_assignment` | Đăng ký/phân công nhân viên vào ca | JSON | `201` | `ShiftAssignmentResponse` |
| `PUT` | `/api/v1/shift_assignment/{id}` | Cập nhật phân công ca | JSON | `200` | `ShiftAssignmentResponse` |
| `DELETE` | `/api/v1/shift_assignment/{id}` | Xóa phân công ca | Không | `204` | Không có body |

### 15D.2 Cấu trúc `ShiftAssignmentResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | ID phân công (`assignment_id`). |
| `shiftByDate` hoặc `shiftByDateId` | `object/number` | Không | Ca theo ngày được phân công. |
| `employee` hoặc `employeeId` | `object/number` | Không | Nhân viên được phân công. |
| `status` | `string` | Không | Ví dụ `PENDING`, `APPROVED`, `CANCELLED`, `COMPLETED`. |
| `registeredAt` | `string` | Có | Thời điểm đăng ký. |
| `approvedAt` | `string` | Có | Thời điểm được duyệt. |
| `cancelledAt` | `string` | Có | Thời điểm hủy. |
| `cancellationReason` | `string` | Có | Lý do hủy. |
| `note` | `string` | Có | Ghi chú phân công. |

### 15D.3 Request Body POST/PUT

```json
{
  "shiftByDateId": 10,
  "employeeId": 12,
  "status": "PENDING",
  "registeredAt": "2026-10-05T09:00:00",
  "note": "Nhân viên đăng ký ca sáng"
}
```

Khi duyệt phân công:

```json
{
  "status": "APPROVED",
  "approvedAt": "2026-10-05T10:00:00",
  "note": "Đã duyệt bởi quản lý cửa hàng"
}
```

Khi hủy:

```json
{
  "status": "CANCELLED",
  "cancelledAt": "2026-10-05T11:00:00",
  "cancellationReason": "Nhân viên có việc đột xuất"
}
```

---

## 15E. EMERGENCY_REQUEST API (`/api/v1/emergency_request`)

Quản lý yêu cầu phát sinh khẩn cấp liên quan đến phân công ca, chẳng hạn
đổi ca, xin thay ca hoặc chuyển nhân viên giữa các phân công.

### 15E.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/emergency_request` | Lấy toàn bộ yêu cầu khẩn cấp | Không | `200` | `EmergencyRequestResponse[]` |
| `GET` | `/api/v1/emergency_request/{id}` | Lấy yêu cầu theo ID | Không | `200` | `EmergencyRequestResponse` |
| `POST` | `/api/v1/emergency_request` | Tạo yêu cầu khẩn cấp | JSON | `201` | `EmergencyRequestResponse` |
| `PUT` | `/api/v1/emergency_request/{id}` | Cập nhật/xử lý yêu cầu | JSON | `200` | `EmergencyRequestResponse` |
| `DELETE` | `/api/v1/emergency_request/{id}` | Xóa yêu cầu | Không | `204` | Không có body |

### 15E.2 Cấu trúc `EmergencyRequestResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `emergencyRequestId` | `number` | Không | ID yêu cầu (`emergency_request_id`). |
| `employeeId` | `number` | Không | Nhân viên tạo hoặc liên quan đến yêu cầu. |
| `assignmentId` | `number` | Có | Phân công hiện tại liên quan đến yêu cầu. |
| `requestType` | `string` | Không | Loại yêu cầu, ví dụ `SHIFT_SWAP`, `ABSENCE`, `REPLACEMENT`. |
| `fromShiftAssignmentId` | `number` | Có | Phân công nguồn khi đổi/chuyển ca. |
| `toAssignmentId` | `number` | Có | Phân công đích hoặc phân công thay thế. |
| `reason` | `string` | Không | Lý do yêu cầu. |
| `status` | `string` | Không | Ví dụ `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`. |
| `requestedAt` | `string` | Có | Thời điểm tạo yêu cầu. |
| `processedBy` | `number` | Có | User xử lý yêu cầu. |
| `processedAt` | `string` | Có | Thời điểm xử lý. |
| `processNote` | `string` | Có | Ghi chú xử lý. |

### 15E.3 Request Body POST/PUT

Tạo yêu cầu đổi ca:

```json
{
  "employeeId": 12,
  "assignmentId": 25,
  "requestType": "SHIFT_SWAP",
  "fromShiftAssignmentId": 25,
  "toAssignmentId": 31,
  "reason": "Có lịch học đột xuất",
  "status": "PENDING",
  "requestedAt": "2026-10-08T08:15:00"
}
```

Duyệt hoặc từ chối yêu cầu:

```json
{
  "status": "APPROVED",
  "processedBy": 1,
  "processedAt": "2026-10-08T09:00:00",
  "processNote": "Đã xác nhận nhân sự thay thế"
}
```

### 15E.4 Quy trình trạng thái khuyến nghị

1. Nhân viên tạo request với `status = PENDING`.
2. Quản lý kiểm tra phân công nguồn và phân công đích.
3. Quản lý cập nhật `status = APPROVED` hoặc `REJECTED`.
4. Khi xử lý phải ghi `processedBy`, `processedAt` và `processNote`.
5. Không xóa request đã xử lý nếu cần lưu lịch sử; nên chuyển trạng thái
   `CANCELLED` hoặc giữ `APPROVED/REJECTED`.

## 15F. Ví dụ response Module 3

Ví dụ response thành công của API:

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu thành công",
  "data": [
    {
      "id": 10,
      "shiftByDate": {
        "id": 10
      },
      "employee": {
        "id": 12
      },
      "status": "APPROVED",
      "registeredAt": "2026-10-05T09:00:00",
      "approvedAt": "2026-10-05T10:00:00",
      "cancelledAt": null,
      "cancellationReason": null,
      "note": null
    }
  ]
}
```

> Lưu ý: tên field quan hệ trong response phụ thuộc cách mapper response của
> backend. Request luôn dùng field ID phẳng như `storeId`, `shiftId`,
> `schedulePeriodId`, `shiftByDateId` và `employeeId` để tránh gửi entity lồng
> nhau.

Các field:

| Field | Kiểu | Mô tả |
|---|---|---|
| `statusCode` | `number` | HTTP status code của response. |
| `error` | `string \| null` | Thường là `null` khi thành công. |
| `message` | `string \| string[]` | Thông báo hiển thị hoặc thông báo nghiệp vụ. |
| `data` | `object \| array \| null` | Payload thực tế của API. |

`data` có thể là:

```json
// Chi tiết hoặc create/update
{
  "id": 1,
  "name": "Example"
}
```

```json
// Danh sách
[
  { "id": 1, "name": "Example 1" },
  { "id": 2, "name": "Example 2" }
]
```

Với `204 No Content` (thường là delete), không có payload JSON. Client nên coi
request là thành công khi HTTP status là `204`.

# MODULE 4 - QUẢN LÝ CHẤM CÔNG

Module 4 gồm nghiệp vụ `ATTENDANCE`, dùng để ghi nhận thời điểm check-in,
check-out, trạng thái chấm công và kết quả đối soát với lịch làm việc.

## 21. Quy ước chung Module 4

- Base path: `/api/v1/attendance`.
- Response sử dụng envelope chuẩn gồm `statusCode`, `error`, `message` và `data`.
- Danh sách trả `data` là mảng; chi tiết, tạo mới và cập nhật trả `data` là object.
- `employeeId` là bắt buộc khi check-in hoặc tạo bản ghi chấm công.
- Ngày giờ dùng ISO-8601, ví dụ `2026-10-08T08:30:00`.
- Tọa độ và độ chính xác GPS dùng kiểu số thập phân.
- Xóa thành công trả HTTP `204 No Content` và không có response body.

## 21A. ATTENDANCE API (`/api/v1/attendance`)

### 21A.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/attendance` | Lấy toàn bộ bản ghi chấm công | Không | `200` | `AttendanceResponse[]` |
| `GET` | `/api/v1/attendance?employeeId={id}` | Lấy bản ghi theo nhân viên, sắp xếp check-in mới nhất trước | Không | `200` | `AttendanceResponse[]` |
| `GET` | `/api/v1/attendance/{id}` | Lấy chi tiết bản ghi chấm công | Không | `200` | `AttendanceResponse` |
| `POST` | `/api/v1/attendance/check-in` | Tạo bản ghi check-in tại thời điểm hiện tại | `CheckInRequest` | `201` | `AttendanceResponse` |
| `POST` | `/api/v1/attendance` | Tạo bản ghi chấm công thủ công | `AttendanceRequest` | `201` | `AttendanceResponse` |
| `PUT` | `/api/v1/attendance/{id}` | Cập nhật check-out, trạng thái và ghi chú | `AttendanceRequest` | `200` | `AttendanceResponse` |
| `DELETE` | `/api/v1/attendance/{id}` | Xóa bản ghi chấm công | Không | `204` | Không có body |

### 21A.2 Cấu trúc `AttendanceResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `id` | `number` | Không | ID bản ghi (`attendance_id`). |
| `employee` | `object` | Không | Nhân viên liên kết; thường chứa `id`, `employeeCode`, `fullName`. |
| `shiftByDate` | `object` | Có | Ca làm việc theo ngày được đối soát. |
| `checkInAt` | `string` | Có | Thời điểm check-in. |
| `checkInLatitude` | `number` | Có | Vĩ độ lúc check-in. |
| `checkInLongitude` | `number` | Có | Kinh độ lúc check-in. |
| `checkInAccuracy` | `number` | Có | Sai số GPS lúc check-in. |
| `attachmentId` | `number` | Có | ID ảnh hoặc file đính kèm. |
| `checkOutAt` | `string` | Có | Thời điểm check-out. |
| `checkOutLatitude` | `number` | Có | Vĩ độ lúc check-out. |
| `checkOutLongitude` | `number` | Có | Kinh độ lúc check-out. |
| `checkOutAccuracy` | `number` | Có | Sai số GPS lúc check-out. |
| `workedHours` | `number` | Có | Tổng số giờ đã làm. |
| `attendanceStatus` | `string` | Không | Trạng thái chấm công, ví dụ `PRESENT`, `ABSENT`, `LATE`. |
| `scheduleMatchStatus` | `string` | Không | Kết quả đối soát với lịch. |
| `approvalStatus` | `string` | Không | Trạng thái duyệt. |
| `approvedBy` | `number` | Có | ID user duyệt. |
| `approvedAt` | `string` | Có | Thời điểm duyệt. |
| `note` | `string` | Có | Ghi chú hoặc lý do điều chỉnh. |
| `createdAt` | `string` | Có | Thời điểm tạo. |
| `updatedAt` | `string` | Có | Thời điểm cập nhật. |

### 21A.3 Request Body `CheckInRequest`

`POST /api/v1/attendance/check-in` tự gán `checkInAt`, `attendanceStatus =
PRESENT`, `scheduleMatchStatus = PENDING` và `approvalStatus = PENDING`.

```json
{
  "employeeId": 4,
  "latitude": 10.7769,
  "longitude": 106.7009
}
```

### 21A.4 Request Body `AttendanceRequest`

```json
{
  "employeeId": 4,
  "shiftByDateId": 12,
  "checkOutAt": "2026-10-08T17:05:00",
  "attendanceStatus": "PRESENT",
  "approvalStatus": "PENDING",
  "note": "Check-out đúng giờ",
  "checkInLatitude": 10.7769,
  "checkInLongitude": 106.7009
}
```

Khi cập nhật bằng `PUT`, truyền các field cần xử lý theo `AttendanceRequest`;
`checkOutAt`, `attendanceStatus`, `approvalStatus` và `note` là các field được
controller cập nhật.

### 21A.5 Ví dụ response

```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy dữ liệu",
  "data": [
    {
      "id": 15,
      "employee": {
        "id": 4,
        "employeeCode": "NV0004",
        "fullName": "Lê Thị Mai"
      },
      "shiftByDate": {
        "id": 12,
        "workDate": "2026-10-08"
      },
      "checkInAt": "2026-10-08T08:02:00",
      "checkOutAt": "2026-10-08T17:05:00",
      "workedHours": 8.05,
      "attendanceStatus": "PRESENT",
      "scheduleMatchStatus": "MATCHED",
      "approvalStatus": "APPROVED",
      "note": null
    }
  ]
}
```

---

# MODULE 5 - QUẢN LÝ QUY ĐỊNH, VI PHẠM VÀ KHEN THƯỞNG

Module 5 gồm các nghiệp vụ:

| Nghiệp vụ | Resource | Endpoint |
|---|---|---|
| Quy định | `RULE` | `/api/v1/rule` |
| Vi phạm | `VIOLATION` | `/api/v1/violation` |
| Hồ sơ kỷ luật | `DISCIPLINARY_RECORD` | `/api/v1/disciplinary_record` |
| Bản ghi thưởng | `BONUS_RECORD` | `/api/v1/bonus_record` |
| Chi tiết thưởng | `BONUS_DETAIL` | `/api/v1/bonus_detail` |

## 22. Quy ước chung Module 5

- Tất cả endpoint đều bắt đầu bằng `/api/v1`.
- Response sử dụng envelope chuẩn gồm `statusCode`, `error`, `message` và `data`.
- Danh sách trả `data` là một mảng; chi tiết, tạo mới và cập nhật trả `data` là một object.
- Tạo mới trả HTTP `201 Created`.
- Cập nhật trả HTTP `200 OK`.
- Xóa thành công trả HTTP `204 No Content` và không có response body.
- Các ID được sinh tự động không gửi trong request `POST`.
- Với `PUT` và `DELETE`, ID bản ghi truyền trên URL.
- Ngày dùng định dạng `YYYY-MM-DD`; ngày giờ dùng ISO-8601, ví dụ
  `2026-10-08T08:30:00`.
- Các trường tiền tệ dùng kiểu số thập phân, không gửi ký hiệu tiền tệ trong JSON.
- Các trường trạng thái và loại nghiệp vụ là chuỗi; giá trị hợp lệ do nghiệp vụ
  và dữ liệu trong database quy định.

## 22A. RULE API (`/api/v1/rule`)

Quản lý danh mục các quy định áp dụng cho nhân viên, bao gồm loại hình phạt và
mức phạt mặc định.

### 22A.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/rule` | Lấy toàn bộ quy định | Không | `200` | `RuleResponse[]` |
| `GET` | `/api/v1/rule/{id}` | Lấy quy định theo `ruleId` | Không | `200` | `RuleResponse` |
| `POST` | `/api/v1/rule` | Tạo quy định mới | `RuleRequest` | `201` | `RuleResponse` |
| `PUT` | `/api/v1/rule/{id}` | Cập nhật quy định | `RuleRequest` | `200` | `RuleResponse` |
| `DELETE` | `/api/v1/rule/{id}` | Xóa quy định | Không | `204` | Không có body |

### 22A.2 Cấu trúc `RuleResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `ruleId` | `number` | Không | ID quy định. |
| `ruleCode` | `string` | Không | Mã quy định, duy nhất. |
| `ruleName` | `string` | Không | Tên quy định. |
| `category` | `string` | Có | Nhóm quy định. |
| `description` | `string` | Có | Nội dung mô tả. |
| `penaltyType` | `string` | Có | Loại hình phạt. |
| `penaltyAmount` | `number` | Có | Mức phạt mặc định. |
| `status` | `string` | Không | Trạng thái quy định. |
| `createdBy` | `number` | Có | ID user tạo. |
| `updatedBy` | `number` | Có | ID user cập nhật gần nhất. |
| `createdAt` | `string` | Có | Thời điểm tạo. |
| `updatedAt` | `string` | Có | Thời điểm cập nhật. |

### 22A.3 Request Body `RuleRequest`

`POST` không cần gửi `ruleId`, `createdAt` hoặc `updatedAt`.

```json
{
  "ruleCode": "LATE_ARRIVAL",
  "ruleName": "Đi trễ",
  "category": "ATTENDANCE",
  "description": "Nhân viên đến sau giờ bắt đầu ca",
  "penaltyType": "MONEY",
  "penaltyAmount": 50000,
  "status": "ACTIVE",
  "createdBy": 1,
  "updatedBy": 1
}
```

## 22B. VIOLATION API (`/api/v1/violation`)

Ghi nhận một lần vi phạm phát sinh từ quy định và có thể liên kết với bản ghi
chấm công, bằng chứng hoặc mã kỷ luật.

### 22B.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/violation` | Lấy toàn bộ vi phạm | Không | `200` | `ViolationResponse[]` |
| `GET` | `/api/v1/violation/{id}` | Lấy vi phạm theo `violationId` | Không | `200` | `ViolationResponse` |
| `POST` | `/api/v1/violation` | Tạo vi phạm mới | `ViolationRequest` | `201` | `ViolationResponse` |
| `PUT` | `/api/v1/violation/{id}` | Cập nhật vi phạm | `ViolationRequest` | `200` | `ViolationResponse` |
| `DELETE` | `/api/v1/violation/{id}` | Xóa vi phạm | Không | `204` | Không có body |

### 22B.2 Cấu trúc `ViolationResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `violationId` | `number` | Không | ID vi phạm. |
| `ruleId` | `number` | Không | ID quy định liên quan. |
| `disciplinaryCodeId` | `number` | Không | ID mã kỷ luật. |
| `attendanceId` | `number` | Có | ID bản ghi chấm công liên quan. |
| `violationTime` | `string` | Không | Thời điểm xảy ra vi phạm. |
| `description` | `string` | Có | Mô tả chi tiết vi phạm. |
| `evidenceId` | `number` | Có | ID file/bằng chứng. |
| `ruleName` | `string` | Không | Tên quy định được lưu tại thời điểm vi phạm. |
| `category` | `string` | Có | Nhóm quy định. |
| `ruleDescription` | `string` | Có | Nội dung quy định tại thời điểm vi phạm. |
| `penaltyType` | `string` | Có | Loại hình phạt. |
| `penaltyAmount` | `number` | Có | Mức phạt. |
| `status` | `string` | Không | Trạng thái xử lý vi phạm. |
| `createdBy` | `number` | Có | ID user tạo. |
| `createdAt` | `string` | Có | Thời điểm tạo. |

### 22B.3 Request Body `ViolationRequest`

```json
{
  "ruleId": 1,
  "disciplinaryCodeId": 2,
  "attendanceId": 15,
  "violationTime": "2026-10-08T08:30:00",
  "description": "Đến muộn 30 phút",
  "evidenceId": 7,
  "ruleName": "Đi trễ",
  "category": "ATTENDANCE",
  "ruleDescription": "Nhân viên phải có mặt trước giờ bắt đầu ca",
  "penaltyType": "MONEY",
  "penaltyAmount": 50000,
  "status": "PENDING",
  "createdBy": 1
}
```

## 22C. DISCIPLINARY_RECORD API (`/api/v1/disciplinary_record`)

Quản lý hồ sơ kỷ luật của nhân viên theo cửa hàng, bao gồm số tiền phạt, lý do
và trạng thái phê duyệt.

### 22C.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/disciplinary_record` | Lấy toàn bộ hồ sơ kỷ luật | Không | `200` | `DisciplinaryRecordResponse[]` |
| `GET` | `/api/v1/disciplinary_record/{id}` | Lấy hồ sơ theo `disciplinaryId` | Không | `200` | `DisciplinaryRecordResponse` |
| `POST` | `/api/v1/disciplinary_record` | Tạo hồ sơ kỷ luật | `DisciplinaryRecordRequest` | `201` | `DisciplinaryRecordResponse` |
| `PUT` | `/api/v1/disciplinary_record/{id}` | Cập nhật hồ sơ kỷ luật | `DisciplinaryRecordRequest` | `200` | `DisciplinaryRecordResponse` |
| `DELETE` | `/api/v1/disciplinary_record/{id}` | Xóa hồ sơ kỷ luật | Không | `204` | Không có body |

### 22C.2 Cấu trúc `DisciplinaryRecordResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `disciplinaryId` | `number` | Không | ID hồ sơ kỷ luật. |
| `storeId` | `number` | Có | Cửa hàng phát sinh hồ sơ. |
| `employeeId` | `number` | Không | Nhân viên bị xử lý. |
| `disciplinaryType` | `string` | Không | Loại hình kỷ luật. |
| `amount` | `number` | Có | Số tiền phạt hoặc giá trị kỷ luật. |
| `reason` | `string` | Có | Lý do xử lý. |
| `status` | `string` | Không | Trạng thái hồ sơ. |
| `createdBy` | `number` | Có | ID user lập hồ sơ. |
| `approvedBy` | `number` | Có | ID user phê duyệt. |
| `approvedAt` | `string` | Có | Thời điểm phê duyệt. |
| `createdAt` | `string` | Có | Thời điểm tạo. |

### 22C.3 Request Body `DisciplinaryRecordRequest`

```json
{
  "storeId": 1,
  "employeeId": 4,
  "disciplinaryType": "WARNING",
  "amount": 100000,
  "reason": "Vi phạm quy định chấm công nhiều lần",
  "status": "PENDING",
  "createdBy": 1,
  "approvedBy": null,
  "approvedAt": null
}
```

## 22D. BONUS_RECORD API (`/api/v1/bonus_record`)

Quản lý tổng hợp thưởng, phạt và số tiền cuối cùng của một nhân viên theo kỳ
lương.

### 22D.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/bonus_record` | Lấy toàn bộ bản ghi thưởng | Không | `200` | `BonusRecordResponse[]` |
| `GET` | `/api/v1/bonus_record/{id}` | Lấy bản ghi theo `bonusRecordId` | Không | `200` | `BonusRecordResponse` |
| `POST` | `/api/v1/bonus_record` | Tạo bản ghi thưởng | `BonusRecordRequest` | `201` | `BonusRecordResponse` |
| `PUT` | `/api/v1/bonus_record/{id}` | Cập nhật bản ghi thưởng | `BonusRecordRequest` | `200` | `BonusRecordResponse` |
| `DELETE` | `/api/v1/bonus_record/{id}` | Xóa bản ghi thưởng | Không | `204` | Không có body |

### 22D.2 Cấu trúc `BonusRecordResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `bonusRecordId` | `number` | Không | ID bản ghi thưởng. |
| `employeeId` | `number` | Không | Nhân viên nhận tổng hợp thưởng/phạt. |
| `payrollMonth` | `string` | Không | Tháng lương, dùng ngày đại diện theo định dạng `YYYY-MM-DD`. |
| `totalBonus` | `number` | Không | Tổng tiền thưởng. |
| `totalPenalty` | `number` | Không | Tổng tiền phạt. |
| `totalAmount` | `number` | Không | Tổng tiền sau khi cộng thưởng và trừ phạt. |
| `status` | `string` | Không | Trạng thái bản ghi. |
| `createdBy` | `number` | Không | ID user tạo. |
| `approvedBy` | `number` | Có | ID user phê duyệt. |
| `approvedAt` | `string` | Có | Thời điểm phê duyệt. |

### 22D.3 Request Body `BonusRecordRequest`

```json
{
  "employeeId": 4,
  "payrollMonth": "2026-10-01",
  "totalBonus": 500000,
  "totalPenalty": 100000,
  "totalAmount": 400000,
  "status": "PENDING",
  "createdBy": 1,
  "approvedBy": null,
  "approvedAt": null
}
```

## 22E. BONUS_DETAIL API (`/api/v1/bonus_detail`)

Quản lý từng khoản thưởng hoặc phạt chi tiết thuộc một `BONUS_RECORD` và tham
chiếu đến quy định tương ứng.

### 22E.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/bonus_detail` | Lấy toàn bộ chi tiết thưởng/phạt | Không | `200` | `BonusDetailResponse[]` |
| `GET` | `/api/v1/bonus_detail/{id}` | Lấy chi tiết theo `bonusDetailId` | Không | `200` | `BonusDetailResponse` |
| `POST` | `/api/v1/bonus_detail` | Tạo khoản thưởng/phạt chi tiết | `BonusDetailRequest` | `201` | `BonusDetailResponse` |
| `PUT` | `/api/v1/bonus_detail/{id}` | Cập nhật khoản thưởng/phạt | `BonusDetailRequest` | `200` | `BonusDetailResponse` |
| `DELETE` | `/api/v1/bonus_detail/{id}` | Xóa khoản thưởng/phạt | Không | `204` | Không có body |

### 22E.2 Cấu trúc `BonusDetailResponse`

| Field | Kiểu | Nullable | Mô tả |
|---|---|:---:|---|
| `bonusDetailId` | `number` | Không | ID chi tiết thưởng/phạt. |
| `bonusRecordId` | `number` | Không | ID bản ghi tổng hợp. |
| `ruleId` | `number` | Không | ID quy định áp dụng. |
| `type` | `string` | Không | Loại khoản, ví dụ `BONUS` hoặc `PENALTY`. |
| `amount` | `number` | Không | Giá trị khoản thưởng/phạt. |
| `reason` | `string` | Có | Lý do phát sinh khoản. |

### 22E.3 Request Body `BonusDetailRequest`

```json
{
  "bonusRecordId": 10,
  "ruleId": 1,
  "type": "BONUS",
  "amount": 500000,
  "reason": "Hoàn thành vượt chỉ tiêu tháng"
}
```

### 22E.4 Quan hệ nghiệp vụ

- Một `BONUS_RECORD` có thể có nhiều `BONUS_DETAIL`.
- `BONUS_DETAIL.bonusRecordId` phải trỏ đến bản ghi `BONUS_RECORD` tồn tại.
- `BONUS_DETAIL.ruleId` phải trỏ đến quy định `RULE` tồn tại.
- `type` xác định khoản tiền là thưởng hay phạt; `amount` luôn là giá trị số
  dương, còn việc cộng hoặc trừ được xác định bởi `type`.

---

## 23. ROLE API (`/api/v1/role`)

Quản lý danh mục các vai trò trong hệ thống (ADMIN, MANAGER, EMPLOYEE, ...).
Controller: `RoleController.java` | Service: `RoleService.java` | Entity: `Role.java`

### 23.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/role` | Lấy danh sách toàn bộ role | Không | `200` | `RoleResponse[]` |
| `GET` | `/api/v1/role/{id}` | Lấy chi tiết role theo ID | Không | `200` | `RoleResponse` |
| `POST` | `/api/v1/role` | Tạo mới role | `RoleRequest` (JSON) | `201` | `RoleResponse` |
| `PUT` | `/api/v1/role/{id}` | Cập nhật role theo ID | `RoleRequest` (JSON) | `200` | `RoleResponse` |
| `DELETE` | `/api/v1/role/{id}` | Xóa role theo ID | Không | `204` | Không có body |

### 23.2 Cấu trúc dữ liệu `RoleResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `roleId` | `number` | Không | **Khóa chính của role (LƯU Ý: tên trường là `roleId`, KHÔNG PHẢI `id`).** |
| `roleCode` | `string` | Không | Mã định danh vai trò (duy nhất, ví dụ: `ADMIN`, `MANAGER`, `EMPLOYEE`). |
| `roleName` | `string` | Không | Tên hiển thị vai trò (ví dụ: `Quản trị viên hệ thống`). |
| `description` | `string` | Có | Mô tả chức năng của vai trò. |
| `status` | `string` | Có | Trạng thái (ví dụ: `ACTIVE`, `INACTIVE`). |

> [!WARNING]
> **Điểm bẫy Frontend cần chú ý:**
> Khóa chính của Role trả về qua API là **`roleId`** chứ **KHÔNG PHẢI `id`** (do getter trong entity là `getRoleId()`). Frontend khi render bảng, key selector hay edit/delete URL phải truyền `item.roleId`.

### 23.3 Request Body cho POST / PUT (`RoleRequest`)

```json
{
  "roleCode": "SHIFT_LEADER",
  "roleName": "Trưởng ca làm việc",
  "description": "Quản lý và phân ca cho nhân viên trong ca trực",
  "status": "ACTIVE"
}
```

### 23.4 Ví dụ Response thực tế

#### `GET /api/v1/role` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "roleId": 1,
      "roleCode": "ADMIN",
      "roleName": "Quản trị viên",
      "description": "Toàn quyền quản trị hệ thống",
      "status": "ACTIVE"
    },
    {
      "roleId": 2,
      "roleCode": "MANAGER",
      "roleName": "Quản lý cửa hàng",
      "description": "Quản lý nhân viên và lịch làm việc của chi nhánh",
      "status": "ACTIVE"
    },
    {
      "roleId": 3,
      "roleCode": "EMPLOYEE",
      "roleName": "Nhân viên",
      "description": "Nhân viên xem ca và chấm công",
      "status": "ACTIVE"
    }
  ]
}
```

#### `GET /api/v1/role/1` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy thông tin chi tiết",
  "data": {
    "roleId": 1,
    "roleCode": "ADMIN",
    "roleName": "Quản trị viên",
    "description": "Toàn quyền quản trị hệ thống",
    "status": "ACTIVE"
  }
}
```

#### `POST /api/v1/role` (201 Created)
```json
{
  "statusCode": 201,
  "error": null,
  "message": "Tạo mới dữ liệu",
  "data": {
    "roleId": 4,
    "roleCode": "SHIFT_LEADER",
    "roleName": "Trưởng ca làm việc",
    "description": "Quản lý và phân ca cho nhân viên trong ca trực",
    "status": "ACTIVE"
  }
}
```

---

## 24. PERMISSION API (`/api/v1/permission`)

Quản lý danh mục quyền hạn (từng hành động/API cụ thể).
Controller: `PermissionController.java` | Service: `PermissionService.java` | Entity: `Permission.java`

### 24.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/permission` | Lấy danh sách toàn bộ quyền | Không | `200` | `PermissionResponse[]` |
| `GET` | `/api/v1/permission/{id}` | Lấy chi tiết quyền theo ID | Không | `200` | `PermissionResponse` |
| `POST` | `/api/v1/permission` | Tạo mới quyền | `PermissionRequest` (JSON) | `201` | `PermissionResponse` |
| `PUT` | `/api/v1/permission/{id}` | Cập nhật quyền theo ID | `PermissionRequest` (JSON) | `200` | `PermissionResponse` |
| `DELETE` | `/api/v1/permission/{id}` | Xóa quyền theo ID | Không | `204` | Không có body |

### 24.2 Cấu trúc dữ liệu `PermissionResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `permissionId` | `number` | Không | **Khóa chính của permission (LƯU Ý: tên trường là `permissionId`, KHÔNG PHẢI `id`).** |
| `permissionCode` | `string` | Không | Mã định danh quyền (duy nhất, ví dụ: `USER_VIEW`, `USER_CREATE`). |
| `permissionName` | `string` | Không | Tên hiển thị quyền (ví dụ: `Xem danh sách người dùng`). |
| `description` | `string` | Có | Mô tả chi tiết quyền hạn. |
| `apiPath` | `string` | Có | Đường dẫn API áp dụng quyền (ví dụ: `/api/v1/user`, `/api/v1/shift/**`). |
| `method` | `string` | Có | HTTP method tương ứng (ví dụ: `GET`, `POST`, `PUT`, `DELETE`). |

> [!WARNING]
> **Điểm bẫy Frontend cần chú ý:**
> Khóa chính của Permission trả về qua API là **`permissionId`** chứ **KHÔNG PHẢI `id`** (do getter trong entity là `getPermissionId()`).

### 24.3 Request Body cho POST / PUT (`PermissionRequest`)

```json
{
  "permissionCode": "USER_CREATE",
  "permissionName": "Tạo người dùng mới",
  "description": "Cho phép thêm tài khoản người dùng vào hệ thống",
  "apiPath": "/api/v1/user",
  "method": "POST"
}
```

### 24.4 Ví dụ Response thực tế

#### `GET /api/v1/permission` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "permissionId": 1,
      "permissionCode": "USER_VIEW",
      "permissionName": "Xem danh sách người dùng",
      "description": "Xem danh sách và chi tiết người dùng",
      "apiPath": "/api/v1/user",
      "method": "GET"
    },
    {
      "permissionId": 2,
      "permissionCode": "USER_CREATE",
      "permissionName": "Tạo người dùng mới",
      "description": "Cho phép tạo mới tài khoản",
      "apiPath": "/api/v1/user",
      "method": "POST"
    },
    {
      "permissionId": 3,
      "permissionCode": "USER_UPDATE",
      "permissionName": "Cập nhật người dùng",
      "description": "Cho phép chỉnh sửa thông tin tài khoản",
      "apiPath": "/api/v1/user/*",
      "method": "PUT"
    },
    {
      "permissionId": 4,
      "permissionCode": "USER_DELETE",
      "permissionName": "Xóa người dùng",
      "description": "Cho phép xóa tài khoản khỏi hệ thống",
      "apiPath": "/api/v1/user/*",
      "method": "DELETE"
    }
  ]
}
```

#### `GET /api/v1/permission/2` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy thông tin chi tiết",
  "data": {
    "permissionId": 2,
    "permissionCode": "USER_CREATE",
    "permissionName": "Tạo người dùng mới",
    "description": "Cho phép tạo mới tài khoản",
    "apiPath": "/api/v1/user",
    "method": "POST"
  }
}
```

---

## 25. USER_ROLE API (`/api/v1/user_role`)

Bảng liên kết phân quyền vai trò cho tài khoản người dùng (quan hệ nhiều-nhiều User <-> Role).
Controller: `UserRoleController.java` | Service: `UserRoleService.java` | Entity: `UserRole.java`

> [!CAUTION]
> **ĐẶC THÙ RẤT QUAN TRỌNG VỀ API ROUTING:**
> 1. Đây là bảng có **khóa chính kết hợp (Composite Key)** gồm `userId` và `roleId`.
> 2. **KHÔNG CÓ** endpoint `GET /api/v1/user_role/{id}`.
> 3. Endpoint `PUT` là **`PUT /api/v1/user_role`** (KHÔNG có `{id}` trên URL, toàn bộ thông tin truyền qua Request Body).
> 4. Endpoint `DELETE` là **`DELETE /api/v1/user_role`** (KHÔNG có `{id}` trên URL, thông tin khóa chính truyền qua **Request Body JSON**).

### 25.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/user_role` | Lấy danh sách toàn bộ liên kết user - role | Không | `200` | `UserRoleResponse[]` |
| `POST` | `/api/v1/user_role` | Gán role cho user | `UserRoleRequest` (JSON) | `201` | `UserRoleResponse` |
| `PUT` | `/api/v1/user_role` | Cập nhật thông tin gán role | `UserRoleRequest` (JSON) | `200` | `UserRoleResponse` |
| `DELETE` | `/api/v1/user_role` | Xóa liên kết role khỏi user | `UserRoleRequest` (JSON Body) | `204` | Không có body |

### 25.2 Cấu trúc dữ liệu `UserRoleResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `userId` | `number` | Không | ID của User (Khóa chính phần 1). |
| `roleId` | `number` | Không | ID của Role (Khóa chính phần 2). |
| `assignedBy` | `number` | Có | ID của user (thường là Admin) thực hiện gán quyền. |
| `assignedAt` | `string` (ISO 8601) | Có | Thời điểm gán quyền (ví dụ: `2026-10-08T10:00:00`). |

### 25.3 Request Body cho POST / PUT / DELETE (`UserRoleRequest`)

#### Khi tạo mới / gán quyền (POST):
```json
{
  "userId": 1,
  "roleId": 2,
  "assignedBy": 1
}
```

#### Khi xóa liên kết gán quyền (DELETE):
```json
{
  "userId": 1,
  "roleId": 2
}
```

> [!TIP]
> **Cách gọi DELETE từ Frontend:**
> - **Axios:**
>   ```typescript
>   await axios.delete('/api/v1/user_role', {
>     data: { userId: 1, roleId: 2 }
>   });
>   ```
> - **Fetch API:**
>   ```typescript
>   await fetch('/api/v1/user_role', {
>     method: 'DELETE',
>     headers: { 'Content-Type': 'application/json' },
>     body: JSON.stringify({ userId: 1, roleId: 2 })
>   });
>   ```

### 25.4 Ví dụ Response thực tế

#### `GET /api/v1/user_role` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "userId": 1,
      "roleId": 1,
      "assignedBy": 1,
      "assignedAt": "2026-09-01T10:00:00"
    },
    {
      "userId": 2,
      "roleId": 2,
      "assignedBy": 1,
      "assignedAt": "2026-09-10T14:15:00"
    }
  ]
}
```

#### `POST /api/v1/user_role` (201 Created)
```json
{
  "statusCode": 201,
  "error": null,
  "message": "Tạo mới dữ liệu",
  "data": {
    "userId": 3,
    "roleId": 3,
    "assignedBy": 1,
    "assignedAt": "2026-10-08T20:15:00"
  }
}
```

---

## 26. ROLE_PERMISSION API (`/api/v1/role_permission`)

Bảng liên kết gán quyền cho vai trò (quan hệ nhiều-nhiều Role <-> Permission).
Controller: `RolePermissionController.java` | Service: `RolePermissionService.java` | Entity: `RolePermission.java`

> [!CAUTION]
> **ĐẶC THÙ RẤT QUAN TRỌNG VỀ API ROUTING:**
> 1. Bảng có **khóa chính kết hợp (Composite Key)** gồm `roleId` và `permissionId`.
> 2. **KHÔNG CÓ** endpoint `GET /api/v1/role_permission/{id}`.
> 3. Endpoint `PUT` là **`PUT /api/v1/role_permission`** (KHÔNG có `{id}` trên URL, nhận dữ liệu qua body).
> 4. Endpoint `DELETE` là **`DELETE /api/v1/role_permission`** (KHÔNG có `{id}` trên URL, thông tin khóa chính truyền qua **Request Body JSON**).

### 26.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/role_permission` | Lấy danh sách toàn bộ liên kết role - permission | Không | `200` | `RolePermissionResponse[]` |
| `POST` | `/api/v1/role_permission` | Gán permission cho role | `RolePermissionRequest` (JSON) | `201` | `RolePermissionResponse` |
| `PUT` | `/api/v1/role_permission` | Cập nhật gán permission cho role | `RolePermissionRequest` (JSON) | `200` | `RolePermissionResponse` |
| `DELETE` | `/api/v1/role_permission` | Gỡ permission khỏi role | `RolePermissionRequest` (JSON Body) | `204` | Không có body |

### 26.2 Cấu trúc dữ liệu `RolePermissionResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `roleId` | `number` | Không | ID của Role (Khóa chính phần 1). |
| `permissionId` | `number` | Không | ID của Permission (Khóa chính phần 2). |

*(Đối tượng này chỉ có đúng 2 trường `roleId` và `permissionId`).*

### 26.3 Request Body cho POST / PUT / DELETE (`RolePermissionRequest`)

```json
{
  "roleId": 2,
  "permissionId": 1
}
```

> [!TIP]
> **Cách gọi DELETE từ Frontend:**
> - **Axios:**
>   ```typescript
>   await axios.delete('/api/v1/role_permission', {
>     data: { roleId: 2, permissionId: 1 }
>   });
>   ```
> - **Fetch API:**
>   ```typescript
>   await fetch('/api/v1/role_permission', {
>     method: 'DELETE',
>     headers: { 'Content-Type': 'application/json' },
>     body: JSON.stringify({ roleId: 2, permissionId: 1 })
>   });
>   ```

### 26.4 Ví dụ Response thực tế

#### `GET /api/v1/role_permission` (200 OK)
```json
{
  "statusCode": 200,
  "error": null,
  "message": "Lấy danh sách dữ liệu",
  "data": [
    {
      "roleId": 1,
      "permissionId": 1
    },
    {
      "roleId": 1,
      "permissionId": 2
    },
    {
      "roleId": 2,
      "permissionId": 1
    }
  ]
}
```

#### `POST /api/v1/role_permission` (201 Created)
```json
{
  "statusCode": 201,
  "error": null,
  "message": "Tạo mới dữ liệu",
  "data": {
    "roleId": 2,
    "permissionId": 3
  }
}
```

---

## 27. Tổng hợp & TypeScript Interfaces cho Frontend

### 27.1 Bảng so sánh 5 Resource

| Resource | Base Path | Primary Key Name | Có GET /{id}? | Kiểu gọi DELETE |
|---|---|---|:---:|---|
| **USER** | `/api/v1/user` | `id` | Có | `DELETE /api/v1/user/{id}` |
| **ROLE** | `/api/v1/role` | `roleId` | Có | `DELETE /api/v1/role/{id}` |
| **PERMISSION** | `/api/v1/permission` | `permissionId` | Có | `DELETE /api/v1/permission/{id}` |
| **USER_ROLE** | `/api/v1/user_role` | `userId` + `roleId` | **Không** | `DELETE /api/v1/user_role` với `{ userId, roleId }` trong body |
| **ROLE_PERMISSION** | `/api/v1/role_permission` | `roleId` + `permissionId` | **Không** | `DELETE /api/v1/role_permission` với `{ roleId, permissionId }` trong body |

### 27.2 TypeScript Definitions sẵn sàng sử dụng

Frontend có thể copy trực tiếp đoạn code sau vào dự án (ví dụ file `types/auth-rbac.ts`):

```typescript
// Envelope chuẩn của hệ thống
export interface ApiResponse<T> {
  statusCode: number;
  error: string | null;
  message: string | string[];
  data: T;
}

// 1. USER
export interface UserResponse {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UserCreateRequest {
  username: string;
  passwordHash: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface UserUpdateRequest {
  username?: string;
  passwordHash?: string;
  email?: string;
  phone?: string;
  status?: string;
  lastLoginAt?: string;
}

// 2. ROLE
export interface RoleResponse {
  roleId: number; // LƯU Ý: roleId, không phải id
  roleCode: string;
  roleName: string;
  description: string | null;
  status: string | null;
}

export interface RoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  status?: string;
}

// 3. PERMISSION
export interface PermissionResponse {
  permissionId: number; // LƯU Ý: permissionId, không phải id
  permissionCode: string;
  permissionName: string;
  description: string | null;
  apiPath: string | null;
  method: string | null;
}

export interface PermissionRequest {
  permissionCode: string;
  permissionName: string;
  description?: string;
  apiPath?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | string;
}

// 4. USER_ROLE
export interface UserRoleResponse {
  userId: number;
  roleId: number;
  assignedBy: number | null;
  assignedAt: string | null;
}

export interface UserRoleRequest {
  userId: number;
  roleId: number;
  assignedBy?: number;
  assignedAt?: string;
}

// 5. ROLE_PERMISSION
export interface RolePermissionResponse {
  roleId: number;
  permissionId: number;
}

export interface RolePermissionRequest {
  roleId: number;
  permissionId: number;
}
```
