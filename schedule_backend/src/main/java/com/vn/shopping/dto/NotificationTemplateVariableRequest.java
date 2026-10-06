package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by NotificationTemplateVariableController. */
public class NotificationTemplateVariableRequest extends LinkedHashMap<String, Object> {
    public NotificationTemplateVariableRequest() { }
    public NotificationTemplateVariableRequest(Map<String, Object> values) { super(values); }
}
