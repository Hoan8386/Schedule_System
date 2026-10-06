package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class EmergencyRequestResponse extends LinkedHashMap<String, Object> {
    public EmergencyRequestResponse() { }
    public EmergencyRequestResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
