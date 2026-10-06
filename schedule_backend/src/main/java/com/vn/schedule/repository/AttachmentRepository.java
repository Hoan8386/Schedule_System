package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Attachment;

public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
}

