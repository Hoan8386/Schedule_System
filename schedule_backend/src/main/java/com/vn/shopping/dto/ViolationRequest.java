package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by ViolationController. */
public class ViolationRequest extends LinkedHashMap<String, Object> {
    public ViolationRequest() { }
    public ViolationRequest(Map<String, Object> values) { super(values); }
}
