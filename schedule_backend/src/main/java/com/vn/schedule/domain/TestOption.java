package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "test_option")
@Getter
@Setter
@NoArgsConstructor
public class TestOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "option_id")
    private Integer optionId;
    @Column(name = "question_id", nullable = false)
    private Integer questionId;
    @Column(name = "option_text", nullable = false)
    private String optionText;
    @Column(name = "is_correct")
    private Boolean isCorrect;
    @Column(name = "display_order")
    private Integer displayOrder;
}

