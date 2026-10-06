package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by ShiftController. */
public class ShiftRequest extends LinkedHashMap<String, Object> {
    public ShiftRequest() { }
    public ShiftRequest(Map<String, Object> values) { super(values); }
}
