package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class NotificationTemplateResponse extends LinkedHashMap<String, Object> {
    public NotificationTemplateResponse() { }
    public NotificationTemplateResponse(Object values) {
        if (values instanceof Map<?, ?> map) { map.forEach((key, value) -> put(String.valueOf(key), value)); }
    }
}
