package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class TestQuestionResponse extends LinkedHashMap<String, Object> {
    public TestQuestionResponse() { }
    public TestQuestionResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
