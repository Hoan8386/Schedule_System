package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_round")
@Getter @Setter @NoArgsConstructor
public class ScheduleRound {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_round_id")
    private Integer id;
    @Column(name = "round_name", nullable = false) private String roundName;
    @Column(name = "registration_start_at") private LocalDateTime registrationStartAt;
    @Column(name = "registration_end_at") private LocalDateTime registrationEndAt;
    @Column(nullable = false) private String status;
    @Column(name = "created_by") private Integer createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
}
