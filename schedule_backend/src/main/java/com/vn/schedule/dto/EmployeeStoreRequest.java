package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EmployeeStoreController. */
public class EmployeeStoreRequest extends LinkedHashMap<String, Object> {
    public EmployeeStoreRequest() { }
    public EmployeeStoreRequest(Map<String, Object> values) { super(values); }
}
