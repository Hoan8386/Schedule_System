package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by SchedulePeriodController. */
public class SchedulePeriodRequest extends LinkedHashMap<String, Object> {
    public SchedulePeriodRequest() { }
    public SchedulePeriodRequest(Map<String, Object> values) { super(values); }
}
