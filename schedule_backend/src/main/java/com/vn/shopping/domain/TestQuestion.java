package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "test_question")
@Getter
@Setter
@NoArgsConstructor
public class TestQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Integer questionId;
    @Column(name = "test_id", nullable = false)
    private Integer testId;
    @Column(name = "question_text", nullable = false)
    private String questionText;
    @Column(name = "question_type", nullable = false)
    private String questionType;
    @Column(name = "score")
    private BigDecimal score;
    @Column(name = "display_order")
    private Integer displayOrder;
}

