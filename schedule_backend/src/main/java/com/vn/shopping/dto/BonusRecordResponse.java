package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class BonusRecordResponse extends LinkedHashMap<String, Object> {
    public BonusRecordResponse() { }
    public BonusRecordResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
