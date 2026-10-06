package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by RegulationsRuleController. */
public class RegulationsRuleRequest extends LinkedHashMap<String, Object> {
    public RegulationsRuleRequest() { }
    public RegulationsRuleRequest(Map<String, Object> values) { super(values); }
}
