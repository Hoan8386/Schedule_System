package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class EventScopeResponse extends LinkedHashMap<String, Object> {
    public EventScopeResponse() { }
    public EventScopeResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
