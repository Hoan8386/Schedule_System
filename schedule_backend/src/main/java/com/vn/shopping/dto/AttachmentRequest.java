package com.vn.shopping.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Request payload owned by AttachmentController. */
public class AttachmentRequest extends LinkedHashMap<String, Object> {
    public AttachmentRequest() { }
    public AttachmentRequest(Map<String, Object> values) { super(values); }
}
