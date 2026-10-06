package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class FeedbackResponse extends LinkedHashMap<String, Object> {
    public FeedbackResponse() { }
    public FeedbackResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
