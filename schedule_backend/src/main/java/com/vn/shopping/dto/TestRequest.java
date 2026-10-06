package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by TestController. */
public class TestRequest extends LinkedHashMap<String, Object> {
    public TestRequest() { }
    public TestRequest(Map<String, Object> values) { super(values); }
}
