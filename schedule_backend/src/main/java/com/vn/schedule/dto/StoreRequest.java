package com.vn.schedule.dto;

public record StoreRequest(String storeCode, String storeName,
                           String address, String phone, String status, String note) {
}
