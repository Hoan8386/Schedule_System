package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class ScheduleResponse extends LinkedHashMap<String, Object> {
    public ScheduleResponse() { }
    public ScheduleResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
