package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class TestResultResponse extends LinkedHashMap<String, Object> {
    public TestResultResponse() { }
    public TestResultResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
