package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by PayrollController. */
public class PayrollRequest extends LinkedHashMap<String, Object> {
    public PayrollRequest() { }
    public PayrollRequest(Map<String, Object> values) { super(values); }
}
