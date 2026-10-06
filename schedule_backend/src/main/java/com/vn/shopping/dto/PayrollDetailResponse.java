package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class PayrollDetailResponse extends LinkedHashMap<String, Object> {
    public PayrollDetailResponse() { }
    public PayrollDetailResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
