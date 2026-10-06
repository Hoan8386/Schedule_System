package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by PermissionController. */
public class PermissionRequest extends LinkedHashMap<String, Object> {
    public PermissionRequest() { }
    public PermissionRequest(Map<String, Object> values) { super(values); }
}
