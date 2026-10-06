package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by ShiftAssignmentController. */
public class ShiftAssignmentRequest extends LinkedHashMap<String, Object> {
    public ShiftAssignmentRequest() { }
    public ShiftAssignmentRequest(Map<String, Object> values) { super(values); }
}
