package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "regulations_rule")
@Getter
@Setter
@NoArgsConstructor
public class RegulationsRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "regulations_rule_id")
    private Integer regulationsRuleId;
    @Column(name = "organization_setting_id", nullable = false)
    private Integer organizationSettingId;
    @Column(name = "rule_id", nullable = false)
    private Integer ruleId;
}

