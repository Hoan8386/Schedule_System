package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EventScopeController. */
public class EventScopeRequest extends LinkedHashMap<String, Object> {
    public EventScopeRequest() { }
    public EventScopeRequest(Map<String, Object> values) { super(values); }
}
