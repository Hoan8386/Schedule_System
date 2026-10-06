package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by TodoController. */
public class TodoRequest extends LinkedHashMap<String, Object> {
    public TodoRequest() { }
    public TodoRequest(Map<String, Object> values) { super(values); }
}
