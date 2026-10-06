package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class SchedulePeriodResponse extends LinkedHashMap<String, Object> {
    public SchedulePeriodResponse() { }
    public SchedulePeriodResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
