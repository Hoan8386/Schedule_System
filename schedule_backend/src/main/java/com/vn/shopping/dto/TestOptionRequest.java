package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by TestOptionController. */
public class TestOptionRequest extends LinkedHashMap<String, Object> {
    public TestOptionRequest() { }
    public TestOptionRequest(Map<String, Object> values) { super(values); }
}
