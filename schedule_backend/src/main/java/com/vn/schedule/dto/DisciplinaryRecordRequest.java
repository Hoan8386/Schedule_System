package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by DisciplinaryRecordController. */
public class DisciplinaryRecordRequest extends LinkedHashMap<String, Object> {
    public DisciplinaryRecordRequest() { }
    public DisciplinaryRecordRequest(Map<String, Object> values) { super(values); }
}
