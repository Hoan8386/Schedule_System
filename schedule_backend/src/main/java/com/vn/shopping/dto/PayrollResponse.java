package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class PayrollResponse extends LinkedHashMap<String, Object> {
    public PayrollResponse() { }
    public PayrollResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
