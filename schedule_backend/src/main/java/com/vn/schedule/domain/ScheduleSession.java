package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_session")
@Getter @Setter @NoArgsConstructor
public class ScheduleSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_session_id")
    private Integer id;
    @Column(name = "session_name", nullable = false) private String sessionName;
    @Column(name = "session_open_at") private LocalDateTime sessionOpenAt;
    @Column(name = "session_close_at") private LocalDateTime sessionCloseAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_round_id")
    private ScheduleRound scheduleRound;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_group_id")
    private ShiftGroup shiftGroup;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(nullable = false) private String status;
    @Column(name = "created_by") private Integer createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
}
