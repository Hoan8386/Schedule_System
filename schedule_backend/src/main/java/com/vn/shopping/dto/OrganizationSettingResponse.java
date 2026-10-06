package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class OrganizationSettingResponse extends LinkedHashMap<String, Object> {
    public OrganizationSettingResponse() { }
    public OrganizationSettingResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
