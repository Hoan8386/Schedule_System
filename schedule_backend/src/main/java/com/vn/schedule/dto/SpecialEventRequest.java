package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by SpecialEventController. */
public class SpecialEventRequest extends LinkedHashMap<String, Object> {
    public SpecialEventRequest() { }
    public SpecialEventRequest(Map<String, Object> values) { super(values); }
}
