package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by SystemConfigController. */
public class SystemConfigRequest extends LinkedHashMap<String, Object> {
    public SystemConfigRequest() { }
    public SystemConfigRequest(Map<String, Object> values) { super(values); }
}
