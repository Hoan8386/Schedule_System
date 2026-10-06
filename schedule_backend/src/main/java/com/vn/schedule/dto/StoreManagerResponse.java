package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class StoreManagerResponse extends LinkedHashMap<String, Object> {
    public StoreManagerResponse() { }
    public StoreManagerResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
