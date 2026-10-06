package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class EvaluationDetailResponse extends LinkedHashMap<String, Object> {
    public EvaluationDetailResponse() { }
    public EvaluationDetailResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
