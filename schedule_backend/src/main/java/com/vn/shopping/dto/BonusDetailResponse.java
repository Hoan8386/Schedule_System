package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class BonusDetailResponse extends LinkedHashMap<String, Object> {
    public BonusDetailResponse() { }
    public BonusDetailResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
