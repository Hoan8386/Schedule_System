package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class EmployeeStoreResponse extends LinkedHashMap<String, Object> {
    public EmployeeStoreResponse() { }
    public EmployeeStoreResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
