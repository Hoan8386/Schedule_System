package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Integer auditId;
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    @Column(name = "action", nullable = false)
    private String action;
    @Column(name = "entity_type")
    private String entityType;
    @Column(name = "entity_id")
    private Integer entityId;
    @Column(name = "old_value")
    private String oldValue;
    @Column(name = "new_value")
    private String newValue;
    @Column(name = "ip_address")
    private String ipAddress;
    @Column(name = "user_agent")
    private String userAgent;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

