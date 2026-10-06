package com.vn.shopping.dto;

import java.math.BigDecimal;

public record CheckInRequest(Integer employeeId, BigDecimal latitude, BigDecimal longitude) {
}
