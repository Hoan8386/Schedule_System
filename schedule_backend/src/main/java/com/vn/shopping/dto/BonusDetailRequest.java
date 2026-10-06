package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by BonusDetailController. */
public class BonusDetailRequest extends LinkedHashMap<String, Object> {
    public BonusDetailRequest() { }
    public BonusDetailRequest(Map<String, Object> values) { super(values); }
}
