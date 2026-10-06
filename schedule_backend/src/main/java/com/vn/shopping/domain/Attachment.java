package com.vn.shopping.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachment")
@Getter
@Setter
@NoArgsConstructor
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Integer attachmentId;
    @Column(name = "file_name", nullable = false)
    private String fileName;
    @Column(name = "file_path", nullable = false)
    private String filePath;
    @Column(name = "file_type", nullable = false)
    private String fileType;
    @Column(name = "file_size")
    private Long fileSize;
    @Column(name = "uploaded_by")
    private Integer uploadedBy;
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
}

