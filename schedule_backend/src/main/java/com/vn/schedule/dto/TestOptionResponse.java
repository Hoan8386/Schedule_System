package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class TestOptionResponse extends LinkedHashMap<String, Object> {
    public TestOptionResponse() { }
    public TestOptionResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
