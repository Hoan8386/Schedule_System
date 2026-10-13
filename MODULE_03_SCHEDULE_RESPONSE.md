# Module 03 – Schedule & Shift API Response Data

Tài liệu này mô tả cấu trúc dữ liệu chính của module lịch làm việc, ca làm, đăng ký ca và yêu cầu khẩn theo đúng nghiệp vụ hệ thống.

---

## 1. Mục tiêu

- Làm chuẩn dữ liệu trả về từ backend cho module lịch
- Giúp frontend render đúng dữ liệu và form dropdown
- Đồng bộ status / type / enum giữa backend và UI
- Hỗ trợ test nhanh và phát triển API

---

## 2. Module chính

- Schedule Period
- Schedule Round
- Schedule Session
- Shift Group
- Shift
- Shift By Date
- Shift Assignment
- Emergency Request
- Special Event

---

## 3. Schedule Period

```json
{
  "id": 1,
  "schedulePeriodId": 1,
  "periodName": "Kỳ đăng ký tháng 10/2026",
  "periodType": "MONTH",
  "effectiveStartDate": "2026-10-01",
  "effectiveEndDate": "2026-10-31",
  "approvalStartDate": "2026-09-20",
  "approvalEndDate": "2026-09-25",
  "status": "OPEN",
  "createdBy": 1,
  "createdAt": "2026-09-10T08:00:00",
  "finalizedBy": null,
  "finalizedAt": null
}
```

Trường cần chú ý:
- `periodType`: `WEEK` / `MONTH`
- `status`: `DRAFT` / `OPEN` / `CLOSED` / `PENDING` / `FINALIZED`

---

## 4. Schedule Round

```json
{
  "id": 1,
  "scheduleRoundId": 1,
  "roundName": "Đợt 1 tuần 1-2 của 10/2026",
  "registrationStartAt": "2026-10-01T08:00:00",
  "registrationEndAt": "2026-10-02T17:00:00",
  "status": "OPEN",
  "createdBy": 1,
  "createdAt": "2026-09-15T08:00:00"
}
```

- `status`: `OPEN` / `CLOSED`

---

## 5. Schedule Session

```json
{
  "id": 1,
  "scheduleSessionId": 1,
  "sessionName": "Phiên đăng ký ca sáng",
  "sessionOpenAt": "2026-10-03T08:00:00",
  "sessionCloseAt": "2026-10-03T12:00:00",
  "shiftGroupId": 1,
  "status": "OPEN",
  "createdBy": 1,
  "createdAt": "2026-09-20T09:00:00"
}
```

- `status`: `OPEN` / `PENDING` / `CLOSED`

---

## 6. Shift Group

```json
{
  "id": 1,
  "shiftGroupId": 1,
  "storeId": 1,
  "shiftGroupCode": "G1",
  "shiftGroupName": "Nhóm ca dài hạn",
  "description": "Nhóm ca cố định cho nhân viên bán hàng",
  "payRate": 25000,
  "status": "ACTIVE",
  "createdBy": 1,
  "createdAt": "2026-09-10T10:00:00",
  "updatedAt": "2026-09-15T10:00:00"
}
```

- `status`: `ACTIVE` / `INACTIVE`

---

## 7. Shift

```json
{
  "id": 1,
  "shiftId": 1,
  "shiftGroupId": 1,
  "shiftCode": "S1",
  "shiftName": "Ca sáng",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "maxCapacity": 5,
  "payRate": 32000,
  "status": "ACTIVE",
  "note": "Ca sáng chính",
  "createdBy": 1,
  "createdAt": "2026-09-12T08:00:00",
  "updatedAt": "2026-09-12T09:00:00"
}
```

- `status`: `ACTIVE` / `INACTIVE`

---

## 8. Shift By Date

```json
{
  "id": 1,
  "shiftByDateId": 1,
  "shiftId": 1,
  "schedulePeriodId": 1,
  "workDate": "2026-10-05",
  "capacity": 2,
  "shiftName": "Ca sáng",
  "startTime": "08:00:00",
  "endTime": "12:00:00",
  "payRate": 32000,
  "status": "OPEN",
  "managerNote": "Bắt đầu thử nghiệm",
  "createdAt": "2026-10-03T09:00:00",
  "updatedAt": "2026-10-03T09:30:00"
}
```

- `status`: `OPEN` / `FULL` / `CLOSED` / `CANCELLED`

---

## 9. Shift Assignment

```json
{
  "id": 1,
  "shiftAssignmentId": 1,
  "shiftByDateId": 1,
  "employeeId": 101,
  "status": "PENDING",
  "registeredAt": "2026-10-04T15:00:00",
  "approvedBy": null,
  "approvedAt": null,
  "cancelledBy": null,
  "cancelledAt": null,
  "cancellationReason": null,
  "note": "Đăng ký ca đầu tiên"
}
```

- `status`: `PENDING` / `APPROVED` / `REJECTED` / `CANCELLED` / `COMPLETED`

---

## 10. Emergency Request

```json
{
  "id": 1,
  "emergencyRequestId": 1,
  "employeeId": 101,
  "assignmentId": 1,
  "requestType": "CHANGE",
  "fromShiftAssignmentId": null,
  "toAssignmentId": null,
  "reason": "Bị bệnh nên muốn đổi ca",
  "status": "PENDING",
  "requestedAt": "2026-10-05T08:00:00",
  "processedBy": null,
  "processedAt": null,
  "processNote": null
}
```

- `requestType`: `CHANGE` / `ADD` / `CANCEL`
- `status`: `PENDING` / `APPROVED` / `REJECTED` / `CANCELLED`

---

## 11. Special Event

```json
{
  "id": 1,
  "eventId": 1,
  "eventName": "Khuyến mãi cuối tuần",
  "description": "Lớn hơn 50% doanh số",
  "eventType": "SALE",
  "startDate": "2026-10-10",
  "endDate": "2026-10-12",
  "status": "SCHEDULED",
  "createdBy": 1,
  "createdAt": "2026-09-20T09:00:00",
  "updatedAt": "2026-09-20T10:00:00"
}
```

- `eventType`: `SALE` / `PROMOTION` / `HOLIDAY` / `SPECIAL`
- `status`: `ACTIVE` / `INACTIVE` / `SCHEDULED` / `CANCELLED`

---

## 12. Status / Type chuẩn

### 12.1. Schedule Period
```json
{
  "periodType": ["WEEK", "MONTH"],
  "status": ["DRAFT", "OPEN", "CLOSED", "PENDING", "FINALIZED"]
}
```

### 12.2. Schedule Round
```json
{
  "status": ["OPEN", "CLOSED"]
}
```

### 12.3. Schedule Session
```json
{
  "status": ["OPEN", "PENDING", "CLOSED"]
}
```

### 12.4. Shift Group / Shift
```json
{
  "status": ["ACTIVE", "INACTIVE"]
}
```

### 12.5. Shift By Date
```json
{
  "status": ["OPEN", "FULL", "CLOSED", "CANCELLED"]
}
```

### 12.6. Shift Assignment
```json
{
  "status": ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"]
}
```

### 12.7. Emergency
```json
{
  "requestType": ["CHANGE", "ADD", "CANCEL"],
  "status": ["PENDING", "APPROVED", "REJECTED", "CANCELLED"]
}
```

### 12.8. Event
```json
{
  "eventType": ["SALE", "PROMOTION", "HOLIDAY", "SPECIAL"],
  "status": ["ACTIVE", "INACTIVE", "SCHEDULED", "CANCELLED"]
}
```

---

## 13. Response format chuẩn

```json
{
  "statusCode": 200,
  "message": "Call API Success",
  "error": null,
  "data": {
    "id": 1,
    "status": "OPEN"
  }
}
```

Với danh sách:

```json
{
  "statusCode": 200,
  "message": "Call API Success",
  "error": null,
  "data": [
    { "id": 1, "status": "OPEN" },
    { "id": 2, "status": "CLOSED" }
  ]
}
```

---

## 14. Dữ liệu mẫu để test nhanh

```json
{
  "period": {
    "periodName": "Kỳ đăng ký tháng 10/2026",
    "periodType": "MONTH",
    "effectiveStartDate": "2026-10-01",
    "effectiveEndDate": "2026-10-31",
    "approvalStartDate": "2026-09-20",
    "approvalEndDate": "2026-09-25",
    "status": "OPEN"
  },
  "round": {
    "roundName": "Đợt 1 tuần 1-2 của 10/2026",
    "registrationStartAt": "2026-10-01T08:00:00",
    "registrationEndAt": "2026-10-02T17:00:00",
    "status": "OPEN"
  },
  "group": {
    "storeId": 1,
    "shiftGroupCode": "G1",
    "shiftGroupName": "Nhóm ca dài hạn",
    "description": "Ca cố định cho nhân viên bán hàng",
    "payRate": 25000,
    "status": "ACTIVE"
  },
  "shift": {
    "shiftGroupId": 1,
    "shiftCode": "S1",
    "shiftName": "Ca sáng",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "maxCapacity": 5,
    "payRate": 32000,
    "status": "ACTIVE"
  },
  "shiftByDate": {
    "shiftId": 1,
    "schedulePeriodId": 1,
    "workDate": "2026-10-05",
    "capacity": 2,
    "shiftName": "Ca sáng",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "payRate": 32000,
    "status": "OPEN"
  },
  "assignment": {
    "shiftByDateId": 1,
    "employeeId": 101,
    "status": "PENDING"
  },
  "emergency": {
    "employeeId": 101,
    "requestType": "CHANGE",
    "reason": "Bị bệnh nên đổi ca",
    "status": "PENDING"
  }
}
```

---

## 15. Gợi ý khi phát triển UI

- `status` và `type` dùng dropdown
- Không nhập tay nếu đã có giá trị cố định
- UI không tự định nghĩa enum riêng nếu backend đã có nguôn chuẩn
- Các form nên theo đúng thứ tự nghiệp vụ: kỳ -> đợt -> phiên -> nhóm ca -> ca -> ca theo ngày -> đăng ký ca -> yêu cầu khẩn

---

## 16. Kết luận

Module lịch làm việc cần có dữ liệu chuẩn, rõ ràng và nhất quán giữa backend và frontend. Điều quan trọng nhất là: các trường trạng thái và loại phải dùng tập hợp giá trị cố định, không nhập text tùy ý.
