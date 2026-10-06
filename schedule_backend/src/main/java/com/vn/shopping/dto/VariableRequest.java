package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by VariableController. */
public class VariableRequest extends LinkedHashMap<String, Object> {
    public VariableRequest() { }
    public VariableRequest(Map<String, Object> values) { super(values); }
}
