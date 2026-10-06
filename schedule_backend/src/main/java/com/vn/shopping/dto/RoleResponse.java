package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class RoleResponse extends LinkedHashMap<String, Object> {
    public RoleResponse() { }
    public RoleResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
