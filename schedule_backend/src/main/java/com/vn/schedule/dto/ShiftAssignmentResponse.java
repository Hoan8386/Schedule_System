package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class ShiftAssignmentResponse extends LinkedHashMap<String, Object> {
    public ShiftAssignmentResponse() { }
    public ShiftAssignmentResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
