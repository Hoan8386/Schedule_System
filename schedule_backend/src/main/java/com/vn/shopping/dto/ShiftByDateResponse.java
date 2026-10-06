package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class ShiftByDateResponse extends LinkedHashMap<String, Object> {
    public ShiftByDateResponse() { }
    public ShiftByDateResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
