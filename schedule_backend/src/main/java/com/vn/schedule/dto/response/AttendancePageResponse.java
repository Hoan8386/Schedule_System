package com.vn.schedule.dto.response;

import java.util.List;

/** Trang chấm công: bản ghi của trang hiện tại + số liệu thẻ thống kê (tính trong phạm vi, không phụ thuộc bộ lọc). */
public record AttendancePageResponse(ResultPaginationDTO.Meta meta, List<AttendanceResponse> result, Summary summary) {

    /** violations: đi muộn hoặc bị từ chối duyệt (giống cách đếm cũ ở frontend). */
    public record Summary(long total, long pendingCheckout, long absent, long violations) {
    }
}
