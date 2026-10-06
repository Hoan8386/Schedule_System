package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class EmployeeEvaluationResponse extends LinkedHashMap<String, Object> {
    public EmployeeEvaluationResponse() { }
    public EmployeeEvaluationResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
