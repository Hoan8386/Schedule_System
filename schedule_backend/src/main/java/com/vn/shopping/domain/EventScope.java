package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "event_scope")
@Getter
@Setter
@NoArgsConstructor
public class EventScope {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_scope_id")
    private Integer eventScopeId;
    @Column(name = "event_id", nullable = false)
    private Integer eventId;
    @Column(name = "scope_type", nullable = false)
    private String scopeType;
    @Column(name = "schedule_period_id")
    private Integer schedulePeriodId;
    @Column(name = "shift_by_date_id")
    private Integer shiftByDateId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "day_of_week")
    private Integer dayOfWeek;
    @Column(name = "shift_id")
    private Integer shiftId;
}

