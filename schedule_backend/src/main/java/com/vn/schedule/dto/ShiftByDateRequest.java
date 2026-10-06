package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by ShiftByDateController. */
public class ShiftByDateRequest extends LinkedHashMap<String, Object> {
    public ShiftByDateRequest() { }
    public ShiftByDateRequest(Map<String, Object> values) { super(values); }
}
