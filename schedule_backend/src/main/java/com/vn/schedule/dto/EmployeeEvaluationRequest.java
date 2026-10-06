package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EmployeeEvaluationController. */
public class EmployeeEvaluationRequest extends LinkedHashMap<String, Object> {
    public EmployeeEvaluationRequest() { }
    public EmployeeEvaluationRequest(Map<String, Object> values) { super(values); }
}
