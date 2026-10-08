package com.vn.schedule.dto.response;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import java.util.LinkedHashMap;
import java.util.Map;

/** Jackson-compatible legacy payload with dynamic fields. */
public class ViolationResponse {
    private final Map<String, Object> values = new LinkedHashMap<>();

    public ViolationResponse(Map<String, Object> values) { this.values.putAll(values); }

    @JsonAnySetter
    public void put(String name, Object value) { values.put(name, value); }

    public Object get(String name) { return values.get(name); }

    @JsonAnyGetter
    public Map<String, Object> values() { return values; }
}
