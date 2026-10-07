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
      "status": "ACTIVE"
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
| `POST` | `/auth/login` | `{ "access_token": string, "refresh_token": string, "user": UserLogin }` |
| `POST` | `/auth/refresh` | Giống login |
| `POST` | `/auth/forgot-password` | `{ "message": string, "token": string }` |
| `POST` | `/auth/reset-password` | `null`, HTTP `200` |

Tên field request refresh là `refreshToken`; tên field response là
`refresh_token` và `access_token`.

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
