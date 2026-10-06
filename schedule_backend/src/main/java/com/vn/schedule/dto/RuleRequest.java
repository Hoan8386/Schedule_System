package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by RuleController. */
public class RuleRequest extends LinkedHashMap<String, Object> {
    public RuleRequest() { }
    public RuleRequest(Map<String, Object> values) { super(values); }
}
