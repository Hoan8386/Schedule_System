package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by BonusRecordController. */
public class BonusRecordRequest extends LinkedHashMap<String, Object> {
    public BonusRecordRequest() { }
    public BonusRecordRequest(Map<String, Object> values) { super(values); }
}
