package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class TestResponse extends LinkedHashMap<String, Object> {
    public TestResponse() { }
    public TestResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
