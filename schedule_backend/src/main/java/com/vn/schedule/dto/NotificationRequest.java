package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by NotificationController. */
public class NotificationRequest extends LinkedHashMap<String, Object> {
    public NotificationRequest() { }
    public NotificationRequest(Map<String, Object> values) { super(values); }
}
