package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by TestAssignmentController. */
public class TestAssignmentRequest extends LinkedHashMap<String, Object> {
    public TestAssignmentRequest() { }
    public TestAssignmentRequest(Map<String, Object> values) { super(values); }
}
