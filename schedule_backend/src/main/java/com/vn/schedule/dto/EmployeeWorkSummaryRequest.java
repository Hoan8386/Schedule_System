package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EmployeeWorkSummaryController. */
public class EmployeeWorkSummaryRequest extends LinkedHashMap<String, Object> {
    public EmployeeWorkSummaryRequest() { }
    public EmployeeWorkSummaryRequest(Map<String, Object> values) { super(values); }
}
