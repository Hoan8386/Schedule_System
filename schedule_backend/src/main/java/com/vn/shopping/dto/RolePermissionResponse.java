package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class RolePermissionResponse extends LinkedHashMap<String, Object> {
    public RolePermissionResponse() { }
    public RolePermissionResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
