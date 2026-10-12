package com.vn.schedule.dto.request;
import com.fasterxml.jackson.annotation.*;
import java.util.*;
public class ScheduleSessionRequest {
    private final Map<String,Object> values = new LinkedHashMap<>();
    @JsonAnySetter public void put(String name, Object value) { values.put(name, value); }
    public Object get(String name) { return values.get(name); }
    @JsonAnyGetter public Map<String,Object> values() { return values; }
}
