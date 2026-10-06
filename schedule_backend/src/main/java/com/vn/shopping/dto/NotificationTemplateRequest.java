package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by NotificationTemplateController. */
public class NotificationTemplateRequest extends LinkedHashMap<String, Object> {
    public NotificationTemplateRequest() { }
    public NotificationTemplateRequest(Map<String, Object> values) { super(values); }
}
