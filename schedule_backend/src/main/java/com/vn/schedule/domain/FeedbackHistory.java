package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/** Lịch sử chuyển trạng thái phản hồi – mỗi lần chuyển kèm một ghi chú (nhận xét) riêng. */
@Entity
@Table(name = "feedback_history")
@Getter
@Setter
@NoArgsConstructor
public class FeedbackHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Integer historyId;
    @Column(name = "feedback_id", nullable = false)
    private Integer feedbackId;
    @Column(name = "from_status", length = 30)
    private String fromStatus;
    @Column(name = "to_status", nullable = false, length = 30)
    private String toStatus;
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    @Column(name = "handled_by")
    private Integer handledBy;
    /** Vai trò người chuyển trạng thái: STORE_MANAGER / MANAGER / ADMIN */
    @Column(name = "handler_role", length = 30)
    private String handlerRole;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
