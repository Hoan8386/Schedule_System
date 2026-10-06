package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "bonus_detail")
@Getter
@Setter
@NoArgsConstructor
public class BonusDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bonus_detail_id")
    private Integer bonusDetailId;
    @Column(name = "bonus_record_id", nullable = false)
    private Integer bonusRecordId;
    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;
    @Column(name = "type", nullable = false)
    private String type;
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    @Column(name = "reason")
    private String reason;
}

