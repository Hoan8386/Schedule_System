package com.vn.schedule.dto.response;
import com.fasterxml.jackson.annotation.*;
import java.util.*;
public class ScheduleRoundResponse {
    private final Map<String,Object> values = new LinkedHashMap<>();
    public ScheduleRoundResponse(Map<String,Object> values) { this.values.putAll(values); }
    @JsonAnyGetter public Map<String,Object> values() { return values; }
}
