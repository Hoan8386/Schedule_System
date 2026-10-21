package com.vn.schedule.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;
    @Column(name = "employee_id", nullable = false)
    private Integer employeeId;
    @Column(name = "store_id")
    private Integer storeId;
    @Column(name = "shift_by_date_id")
    private Integer shiftByDateId;
    @Column(name = "feedback_type", nullable = false)
    private String feedbackType;
    @Column(name = "target_employee_id")
    private Integer targetEmployeeId;
    @Column(name = "rating")
    private BigDecimal rating;
    @Column(name = "title")
    private String title;
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    /** Vai trò của người gửi: EMPLOYEE / STORE_MANAGER */
    @Column(name = "sender_role", length = 30)
    private String senderRole;
    /** Đối tượng nhận phản hồi: STORE_MANAGER / MANAGER / ADMIN */
    @Column(name = "target_role", length = 30)
    private String targetRole;
    /** Danh sách attachment_id của ảnh đính kèm, phân tách bằng dấu phẩy */
    @Column(name = "attachment_ids", length = 500)
    private String attachmentIds;
    @Column(name = "status", nullable = false)
    private String status;
    @Column(name = "handled_by")
    private Integer handledBy;
    /** Vai trò người xử lý gần nhất (MANAGER xử lý phản hồi gửi trưởng cửa hàng = phản hồi thay) */
    @Column(name = "handler_role", length = 30)
    private String handlerRole;
    @Column(name = "handled_at")
    private LocalDateTime handledAt;
    @Column(name = "response", columnDefinition = "TEXT")
    private String response;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

