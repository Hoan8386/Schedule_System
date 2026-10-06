package com.vn.shopping.dto;

public record StoreRequest(String storeCode, String storeName, Integer logoId,
                           String address, String phone, String status, String note) {
}
