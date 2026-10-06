package com.vn.schedule.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by StoreManagerController. */
public class StoreManagerRequest extends LinkedHashMap<String, Object> {
    public StoreManagerRequest() { }
    public StoreManagerRequest(Map<String, Object> values) { super(values); }
}
