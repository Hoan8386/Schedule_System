package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class UserResponse extends LinkedHashMap<String, Object> {
    public UserResponse() { }
    public UserResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
