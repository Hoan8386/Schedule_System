package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by TestQuestionController. */
public class TestQuestionRequest extends LinkedHashMap<String, Object> {
    public TestQuestionRequest() { }
    public TestQuestionRequest(Map<String, Object> values) { super(values); }
}
