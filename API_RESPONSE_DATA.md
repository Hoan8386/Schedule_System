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

Base path: `/api/v1/attendance`.

- `GET /attendance`: trả `AttendanceResponse[]`; query tùy chọn `employeeId`.
- `POST /attendance/check-in`: check-in và trả `AttendanceResponse`.
- `GET /attendance/{id}`: trả `AttendanceResponse`.
- `POST /attendance`: tạo attendance và trả `AttendanceResponse`.
- `PUT /attendance/{id}`: cập nhật và trả `AttendanceResponse`.
- `DELETE /attendance/{id}`: HTTP `204`.

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

## 14. ROLE API (`/api/v1/role`)

Quản lý danh mục các vai trò trong hệ thống (ADMIN, MANAGER, EMPLOYEE, ...).
Controller: `RoleController.java` | Service: `RoleService.java` | Entity: `Role.java`

### 14.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/role` | Lấy danh sách toàn bộ role | Không | `200` | `RoleResponse[]` |
| `GET` | `/api/v1/role/{id}` | Lấy chi tiết role theo ID | Không | `200` | `RoleResponse` |
| `POST` | `/api/v1/role` | Tạo mới role | `RoleRequest` (JSON) | `201` | `RoleResponse` |
| `PUT` | `/api/v1/role/{id}` | Cập nhật role theo ID | `RoleRequest` (JSON) | `200` | `RoleResponse` |
| `DELETE` | `/api/v1/role/{id}` | Xóa role theo ID | Không | `204` | Không có body |

### 14.2 Cấu trúc dữ liệu `RoleResponse`

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

### 14.3 Request Body cho POST / PUT (`RoleRequest`)

```json
{
  "roleCode": "SHIFT_LEADER",
  "roleName": "Trưởng ca làm việc",
  "description": "Quản lý và phân ca cho nhân viên trong ca trực",
  "status": "ACTIVE"
}
```

### 14.4 Ví dụ Response thực tế

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

## 15. PERMISSION API (`/api/v1/permission`)

Quản lý danh mục quyền hạn (từng hành động/API cụ thể).
Controller: `PermissionController.java` | Service: `PermissionService.java` | Entity: `Permission.java`

### 15.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/permission` | Lấy danh sách toàn bộ quyền | Không | `200` | `PermissionResponse[]` |
| `GET` | `/api/v1/permission/{id}` | Lấy chi tiết quyền theo ID | Không | `200` | `PermissionResponse` |
| `POST` | `/api/v1/permission` | Tạo mới quyền | `PermissionRequest` (JSON) | `201` | `PermissionResponse` |
| `PUT` | `/api/v1/permission/{id}` | Cập nhật quyền theo ID | `PermissionRequest` (JSON) | `200` | `PermissionResponse` |
| `DELETE` | `/api/v1/permission/{id}` | Xóa quyền theo ID | Không | `204` | Không có body |

### 15.2 Cấu trúc dữ liệu `PermissionResponse`

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

### 15.3 Request Body cho POST / PUT (`PermissionRequest`)

```json
{
  "permissionCode": "USER_CREATE",
  "permissionName": "Tạo người dùng mới",
  "description": "Cho phép thêm tài khoản người dùng vào hệ thống",
  "apiPath": "/api/v1/user",
  "method": "POST"
}
```

### 15.4 Ví dụ Response thực tế

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

## 16. USER_ROLE API (`/api/v1/user_role`)

Bảng liên kết phân quyền vai trò cho tài khoản người dùng (quan hệ nhiều-nhiều User <-> Role).
Controller: `UserRoleController.java` | Service: `UserRoleService.java` | Entity: `UserRole.java`

> [!CAUTION]
> **ĐẶC THÙ RẤT QUAN TRỌNG VỀ API ROUTING:**
> 1. Đây là bảng có **khóa chính kết hợp (Composite Key)** gồm `userId` và `roleId`.
> 2. **KHÔNG CÓ** endpoint `GET /api/v1/user_role/{id}`.
> 3. Endpoint `PUT` là **`PUT /api/v1/user_role`** (KHÔNG có `{id}` trên URL, toàn bộ thông tin truyền qua Request Body).
> 4. Endpoint `DELETE` là **`DELETE /api/v1/user_role`** (KHÔNG có `{id}` trên URL, thông tin khóa chính truyền qua **Request Body JSON**).

### 16.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/user_role` | Lấy danh sách toàn bộ liên kết user - role | Không | `200` | `UserRoleResponse[]` |
| `POST` | `/api/v1/user_role` | Gán role cho user | `UserRoleRequest` (JSON) | `201` | `UserRoleResponse` |
| `PUT` | `/api/v1/user_role` | Cập nhật thông tin gán role | `UserRoleRequest` (JSON) | `200` | `UserRoleResponse` |
| `DELETE` | `/api/v1/user_role` | Xóa liên kết role khỏi user | `UserRoleRequest` (JSON Body) | `204` | Không có body |

### 16.2 Cấu trúc dữ liệu `UserRoleResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `userId` | `number` | Không | ID của User (Khóa chính phần 1). |
| `roleId` | `number` | Không | ID của Role (Khóa chính phần 2). |
| `assignedBy` | `number` | Có | ID của user (thường là Admin) thực hiện gán quyền. |
| `assignedAt` | `string` (ISO 8601) | Có | Thời điểm gán quyền (ví dụ: `2026-10-08T10:00:00`). |

### 16.3 Request Body cho POST / PUT / DELETE (`UserRoleRequest`)

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

### 16.4 Ví dụ Response thực tế

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

## 17. ROLE_PERMISSION API (`/api/v1/role_permission`)

Bảng liên kết gán quyền cho vai trò (quan hệ nhiều-nhiều Role <-> Permission).
Controller: `RolePermissionController.java` | Service: `RolePermissionService.java` | Entity: `RolePermission.java`

> [!CAUTION]
> **ĐẶC THÙ RẤT QUAN TRỌNG VỀ API ROUTING:**
> 1. Bảng có **khóa chính kết hợp (Composite Key)** gồm `roleId` và `permissionId`.
> 2. **KHÔNG CÓ** endpoint `GET /api/v1/role_permission/{id}`.
> 3. Endpoint `PUT` là **`PUT /api/v1/role_permission`** (KHÔNG có `{id}` trên URL, nhận dữ liệu qua body).
> 4. Endpoint `DELETE` là **`DELETE /api/v1/role_permission`** (KHÔNG có `{id}` trên URL, thông tin khóa chính truyền qua **Request Body JSON**).

### 17.1 Danh sách endpoints

| Method | Endpoint | Mô tả | Request Body | HTTP Status | Response `data` |
|---|---|---|---|:---:|---|
| `GET` | `/api/v1/role_permission` | Lấy danh sách toàn bộ liên kết role - permission | Không | `200` | `RolePermissionResponse[]` |
| `POST` | `/api/v1/role_permission` | Gán permission cho role | `RolePermissionRequest` (JSON) | `201` | `RolePermissionResponse` |
| `PUT` | `/api/v1/role_permission` | Cập nhật gán permission cho role | `RolePermissionRequest` (JSON) | `200` | `RolePermissionResponse` |
| `DELETE` | `/api/v1/role_permission` | Gỡ permission khỏi role | `RolePermissionRequest` (JSON Body) | `204` | Không có body |

### 17.2 Cấu trúc dữ liệu `RolePermissionResponse`

| Field | Kiểu dữ liệu | Nullable | Mô tả |
|---|---|:---:|---|
| `roleId` | `number` | Không | ID của Role (Khóa chính phần 1). |
| `permissionId` | `number` | Không | ID của Permission (Khóa chính phần 2). |

*(Đối tượng này chỉ có đúng 2 trường `roleId` và `permissionId`).*

### 17.3 Request Body cho POST / PUT / DELETE (`RolePermissionRequest`)

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

### 17.4 Ví dụ Response thực tế

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

## 18. Tổng hợp & TypeScript Interfaces cho Frontend

### 18.1 Bảng so sánh 5 Resource

| Resource | Base Path | Primary Key Name | Có GET /{id}? | Kiểu gọi DELETE |
|---|---|---|:---:|---|
| **USER** | `/api/v1/user` | `id` | Có | `DELETE /api/v1/user/{id}` |
| **ROLE** | `/api/v1/role` | `roleId` | Có | `DELETE /api/v1/role/{id}` |
| **PERMISSION** | `/api/v1/permission` | `permissionId` | Có | `DELETE /api/v1/permission/{id}` |
| **USER_ROLE** | `/api/v1/user_role` | `userId` + `roleId` | **Không** | `DELETE /api/v1/user_role` với `{ userId, roleId }` trong body |
| **ROLE_PERMISSION** | `/api/v1/role_permission` | `roleId` + `permissionId` | **Không** | `DELETE /api/v1/role_permission` với `{ roleId, permissionId }` trong body |

### 18.2 TypeScript Definitions sẵn sàng sử dụng

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

