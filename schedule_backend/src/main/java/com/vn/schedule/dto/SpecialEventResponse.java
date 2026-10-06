package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class SpecialEventResponse extends LinkedHashMap<String, Object> {
    public SpecialEventResponse() { }
    public SpecialEventResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
