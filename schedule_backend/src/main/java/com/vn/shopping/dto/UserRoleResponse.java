package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class UserRoleResponse extends LinkedHashMap<String, Object> {
    public UserRoleResponse() { }
    public UserRoleResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
