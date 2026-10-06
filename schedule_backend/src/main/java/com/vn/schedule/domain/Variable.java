package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "variable")
@Getter
@Setter
@NoArgsConstructor
public class Variable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variable_id")
    private Integer variableId;
    @Column(name = "variable_code", nullable = false, unique = true)
    private String variableCode;
    @Column(name = "variable_name", nullable = false)
    private String variableName;
    @Column(name = "data_type", nullable = false)
    private String dataType;
    @Column(name = "source_field", nullable = false)
    private String sourceField;
    @Column(name = "status", nullable = false)
    private String status;
}

