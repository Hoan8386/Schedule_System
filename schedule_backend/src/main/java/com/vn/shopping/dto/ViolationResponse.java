package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class ViolationResponse extends LinkedHashMap<String, Object> {
    public ViolationResponse() { }
    public ViolationResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
