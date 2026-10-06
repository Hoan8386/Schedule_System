package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by AuditLogController. */
public class AuditLogRequest extends LinkedHashMap<String, Object> {
    public AuditLogRequest() { }
    public AuditLogRequest(Map<String, Object> values) { super(values); }
}
