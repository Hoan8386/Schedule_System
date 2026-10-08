package com.vn.schedule.dto.request;

import java.math.BigDecimal;

public record CheckInRequest(Integer employeeId, BigDecimal latitude, BigDecimal longitude) {
}
