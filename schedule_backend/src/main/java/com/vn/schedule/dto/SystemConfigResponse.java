package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class SystemConfigResponse extends LinkedHashMap<String, Object> {
    public SystemConfigResponse() { }
    public SystemConfigResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
