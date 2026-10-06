package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by RolePermissionController. */
public class RolePermissionRequest extends LinkedHashMap<String, Object> {
    public RolePermissionRequest() { }
    public RolePermissionRequest(Map<String, Object> values) { super(values); }
}
