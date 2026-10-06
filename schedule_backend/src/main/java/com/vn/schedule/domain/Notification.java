package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer notificationId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "notification_template_id")
    private Integer notificationTemplateId;
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "content", nullable = false)
    private String content;
    @Column(name = "notification_type", nullable = false)
    private String notificationType;
    @Column(name = "source_type")
    private String sourceType;
    @Column(name = "source_id")
    private Integer sourceId;
    @Column(name = "is_read")
    private Boolean isRead;
    @Column(name = "read_at")
    private LocalDateTime readAt;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

