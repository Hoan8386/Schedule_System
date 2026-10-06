package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class TodoResponse extends LinkedHashMap<String, Object> {
    public TodoResponse() { }
    public TodoResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
