package com.vn.schedule.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * employeeCode: bỏ qua – mã do hệ thống tự sinh khi tạo, không đổi khi sửa.
 * position: EMPLOYEE / STORE_MANAGER (bắt buộc khi tạo; null khi sửa = giữ nguyên).
 * storeIds: danh sách cửa hàng phân bổ (null = không đổi phân bổ), primaryStoreId: cửa hàng chính trong danh sách.
 */
public record EmployeeRequest(Integer userId, String employeeCode, String fullName,
                              String avatar,
                              LocalDate dateOfBirth, String gender, String email,
                              String phone, String address,
                              Integer idCardFrontId, Integer idCardBackId,
                              Integer signatureId,
                              LocalDate hireDate,
                              String status, String note, Map<String, Object> user,
                              String position, List<Integer> storeIds, Integer primaryStoreId,
                              LocalDate storeStartDate) {
    public Integer resolvedUserId() {
        if (userId != null && userId > 0) {
            return userId;
        }
        Object id = user == null ? null : user.get("id");
        if (id instanceof Number number && number.intValue() > 0) {
            return number.intValue();
        }
        return null;
    }
}
