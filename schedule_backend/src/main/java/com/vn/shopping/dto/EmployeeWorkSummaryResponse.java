package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class EmployeeWorkSummaryResponse extends LinkedHashMap<String, Object> {
    public EmployeeWorkSummaryResponse() { }
    public EmployeeWorkSummaryResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
