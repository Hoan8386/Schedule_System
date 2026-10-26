package com.vn.schedule.dto.request;

import java.util.List;

/**
 * Phân bổ nhân sự của một cửa hàng (trang Cửa hàng), áp dụng trong một giao dịch:
 * - managerEmployeeId: trưởng cửa hàng mới (null = giữ nguyên, 0 = bỏ trống).
 * - members: nhân viên làm tại cửa hàng (thêm nếu chưa có) kèm vị trí mới (null = giữ nguyên).
 * - removals: nhân viên rời cửa hàng, có thể chuyển sang cửa hàng khác; không còn cửa hàng nào thì chuyển tạm nghỉ.
 */
public record StoreStaffRequest(Integer managerEmployeeId, List<Member> members, List<Removal> removals) {
    public record Member(Integer employeeId, String position) {
    }

    public record Removal(Integer employeeId, Integer transferToStoreId) {
    }
}
