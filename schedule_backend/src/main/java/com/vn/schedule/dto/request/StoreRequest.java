package com.vn.schedule.dto.request;

public record StoreRequest(String storeCode, String storeName, Integer storeImageId,
                           String address, String phone, String status, String note) {
}


