package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by RoleController. */
public class RoleRequest extends LinkedHashMap<String, Object> {
    public RoleRequest() { }
    public RoleRequest(Map<String, Object> values) { super(values); }
}
