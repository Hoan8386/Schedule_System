package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by TestResultController. */
public class TestResultRequest extends LinkedHashMap<String, Object> {
    public TestResultRequest() { }
    public TestResultRequest(Map<String, Object> values) { super(values); }
}
