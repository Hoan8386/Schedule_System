package com.vn.schedule.util;

import com.vn.schedule.dto.response.ResultPaginationDTO;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

/**
 * Chuẩn hóa tham số phân trang cho các API danh sách.
 * - page bắt đầu từ 1 (giống cấu hình spring.data.web.pageable.one-indexed-parameters).
 * - size mặc định 10, tối đa 100; giá trị không hợp lệ được đưa về mặc định / giới hạn.
 * - sort chỉ nhận các khóa đã khai báo (không cho client truyền tên cột tùy ý), dạng "key" hoặc "key,asc|desc".
 */
public final class PageSupport {
    public static final int DEFAULT_SIZE = 10;
    public static final int MAX_SIZE = 100;

    private PageSupport() {
    }

    public static Pageable pageable(Integer page, Integer size, String sort, Map<String, Sort> sorts, String defaultSort) {
        int pageIndex = page == null || page < 1 ? 0 : page - 1;
        int pageSize = size == null || size < 1 ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        return PageRequest.of(pageIndex, pageSize, sortOf(sort, sorts, defaultSort));
    }

    private static Sort sortOf(String sort, Map<String, Sort> sorts, String defaultSort) {
        if (sort == null || sort.isBlank()) {
            return sorts.get(defaultSort);
        }
        String[] parts = sort.trim().split(",");
        Sort base = sorts.get(parts[0].trim());
        if (base == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Tham số sort không hợp lệ: " + parts[0] + " (chỉ nhận: " + String.join(", ", sorts.keySet()) + ")");
        }
        if (parts.length < 2 || parts[1].isBlank()) {
            return base;
        }
        String direction = parts[1].trim().toLowerCase();
        if (!direction.equals("asc") && !direction.equals("desc")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chiều sắp xếp chỉ nhận asc hoặc desc");
        }
        // Đổi chiều khóa chính, giữ nguyên các khóa phụ (id...) để thứ tự ổn định
        List<Sort.Order> orders = base.toList();
        Sort result = Sort.by(direction.equals("asc") ? orders.get(0).with(Sort.Direction.ASC) : orders.get(0).with(Sort.Direction.DESC));
        for (int i = 1; i < orders.size(); i++) {
            result = result.and(Sort.by(orders.get(i)));
        }
        return result;
    }

    public static <T, R> ResultPaginationDTO result(Page<T> page, Function<T, R> mapper) {
        return new ResultPaginationDTO(meta(page), page.getContent().stream().map(mapper).toList());
    }

    public static ResultPaginationDTO.Meta meta(Page<?> page) {
        return new ResultPaginationDTO.Meta(page.getNumber() + 1, page.getSize(), page.getTotalPages(), page.getTotalElements());
    }

    /** Chuỗi tìm kiếm đã chuẩn hóa (null khi rỗng) để truyền vào điều kiện LIKE. */
    public static String keyword(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String trimmed = query.trim().toLowerCase();
        return "%" + trimmed.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }
}
