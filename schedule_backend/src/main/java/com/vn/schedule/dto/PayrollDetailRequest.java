package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by PayrollDetailController. */
public class PayrollDetailRequest extends LinkedHashMap<String, Object> {
    public PayrollDetailRequest() { }
    public PayrollDetailRequest(Map<String, Object> values) { super(values); }
}
