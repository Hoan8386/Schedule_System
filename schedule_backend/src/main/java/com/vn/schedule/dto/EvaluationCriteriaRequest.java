package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EvaluationCriteriaController. */
public class EvaluationCriteriaRequest extends LinkedHashMap<String, Object> {
    public EvaluationCriteriaRequest() { }
    public EvaluationCriteriaRequest(Map<String, Object> values) { super(values); }
}
