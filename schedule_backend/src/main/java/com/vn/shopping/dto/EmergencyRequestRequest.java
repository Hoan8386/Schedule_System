package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EmergencyRequestController. */
public class EmergencyRequestRequest extends LinkedHashMap<String, Object> {
    public EmergencyRequestRequest() { }
    public EmergencyRequestRequest(Map<String, Object> values) { super(values); }
}
