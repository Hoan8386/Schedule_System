package com.vn.schedule.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResultPaginationDTO {
    private Meta meta;
    private Object result;

    public ResultPaginationDTO(Meta meta, Object result) {
        this.meta = meta;
        this.result = result;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Meta {
        private int page;
        private int pageSize;
        private int pages; // tổng số trang
        private long total; // tổng số bản ghi

        public Meta(int page, int pageSize, int pages, long total) {
            this.page = page;
            this.pageSize = pageSize;
            this.pages = pages;
            this.total = total;
        }
    }
}