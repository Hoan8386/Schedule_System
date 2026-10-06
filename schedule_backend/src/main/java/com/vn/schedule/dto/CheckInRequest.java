package com.vn.schedule.dto;

import java.math.BigDecimal;

public record CheckInRequest(Integer employeeId, BigDecimal latitude, BigDecimal longitude) {
}
