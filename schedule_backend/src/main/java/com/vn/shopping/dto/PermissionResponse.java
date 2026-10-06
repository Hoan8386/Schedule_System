package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class PermissionResponse extends LinkedHashMap<String, Object> {
    public PermissionResponse() { }
    public PermissionResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
