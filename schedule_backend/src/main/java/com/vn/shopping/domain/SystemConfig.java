package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_config")
@Getter
@Setter
@NoArgsConstructor
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id")
    private Integer configId;
    @Column(name = "config_key", nullable = false, unique = true)
    private String configKey;
    @Column(name = "config_value")
    private String configValue;
    @Column(name = "config_type", nullable = false)
    private String configType;
    @Column(name = "description")
    private String description;
    @Column(name = "updated_by")
    private Integer updatedBy;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

