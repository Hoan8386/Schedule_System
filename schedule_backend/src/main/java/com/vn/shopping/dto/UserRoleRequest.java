package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by UserRoleController. */
public class UserRoleRequest extends LinkedHashMap<String, Object> {
    public UserRoleRequest() { }
    public UserRoleRequest(Map<String, Object> values) { super(values); }
}
