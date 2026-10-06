package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class VariableResponse extends LinkedHashMap<String, Object> {
    public VariableResponse() { }
    public VariableResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
