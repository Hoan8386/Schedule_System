package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by FeedbackController. */
public class FeedbackRequest extends LinkedHashMap<String, Object> {
    public FeedbackRequest() { }
    public FeedbackRequest(Map<String, Object> values) { super(values); }
}
