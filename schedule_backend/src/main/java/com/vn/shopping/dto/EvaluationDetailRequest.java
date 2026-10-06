package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by EvaluationDetailController. */
public class EvaluationDetailRequest extends LinkedHashMap<String, Object> {
    public EvaluationDetailRequest() { }
    public EvaluationDetailRequest(Map<String, Object> values) { super(values); }
}
