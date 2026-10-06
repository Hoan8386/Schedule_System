package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by OrganizationSettingController. */
public class OrganizationSettingRequest extends LinkedHashMap<String, Object> {
    public OrganizationSettingRequest() { }
    public OrganizationSettingRequest(Map<String, Object> values) { super(values); }
}
