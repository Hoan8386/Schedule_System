package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "todo")
@Getter
@Setter
@NoArgsConstructor
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "todo_id")
    private Integer todoId;
    @Column(name = "assignee_id", nullable = false)
    private Integer assigneeId;
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "description")
    private String description;
    @Column(name = "todo_type", nullable = false)
    private String todoType;
    @Column(name = "source_type")
    private String sourceType;
    @Column(name = "source_id")
    private Integer sourceId;
    @Column(name = "priority", nullable = false)
    private String priority;
    @Column(name = "due_at")
    private LocalDateTime dueAt;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "is_system_generated")
    private Boolean isSystemGenerated;
    @Column(name = "created_by")
    private Integer createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}

