package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class AuditLogResponse extends LinkedHashMap<String, Object> {
    public AuditLogResponse() { }
    public AuditLogResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
