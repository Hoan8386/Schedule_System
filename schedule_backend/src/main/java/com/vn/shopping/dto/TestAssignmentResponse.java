package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class TestAssignmentResponse extends LinkedHashMap<String, Object> {
    public TestAssignmentResponse() { }
    public TestAssignmentResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
