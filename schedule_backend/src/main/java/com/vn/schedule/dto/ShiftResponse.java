package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class ShiftResponse extends LinkedHashMap<String, Object> {
    public ShiftResponse() { }
    public ShiftResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
