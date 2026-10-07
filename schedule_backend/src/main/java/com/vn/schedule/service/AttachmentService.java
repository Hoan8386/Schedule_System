package com.vn.schedule.service;

import com.vn.schedule.domain.Attachment;
import com.vn.schedule.repository.AttachmentRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.AttachmentRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AttachmentService {
    private final AttachmentRepository repository;
    private final R2StorageService storageService;

    public AttachmentService(AttachmentRepository repository, R2StorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    public List<Attachment> findAll() {
        return repository.findAll();
    }

    public Attachment findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Attachment create(AttachmentRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Attachment update(Integer id, AttachmentRequest body) {
        Attachment current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Attachment save(AttachmentRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(AttachmentRequest body) {
        repository.delete(toEntity(body));
    }

    @Transactional
    public Attachment uploadImage(MultipartFile file, Integer uploadedBy) {
        R2StorageService.StoredObject stored = storageService.uploadImage(file);
        try {
            Attachment attachment = new Attachment();
            attachment.setFileName(stored.fileName());
            attachment.setFilePath(stored.url());
            attachment.setFileType(stored.fileType());
            attachment.setFileSize(stored.fileSize());
            attachment.setUploadedBy(uploadedBy);
            attachment.setUploadedAt(LocalDateTime.now());
            return repository.save(attachment);
        } catch (RuntimeException exception) {
            storageService.delete(stored.key());
            throw exception;
        }
    }
    private Attachment toEntity(AttachmentRequest body) {
        Attachment entity = new Attachment();
        entity.setAttachmentId((Integer) body.get("attachmentId"));
        entity.setFileName((String) body.get("fileName"));
        entity.setFilePath((String) body.get("filePath"));
        entity.setFileType((String) body.get("fileType"));
        entity.setFileSize((Long) body.get("fileSize"));
        entity.setUploadedBy((Integer) body.get("uploadedBy"));
        entity.setUploadedAt((LocalDateTime) body.get("uploadedAt"));
        return entity;
    }

    private void applyFields(Attachment entity, AttachmentRequest body) {
        entity.setAttachmentId((Integer) body.get("attachmentId"));
        entity.setFileName((String) body.get("fileName"));
        entity.setFilePath((String) body.get("filePath"));
        entity.setFileType((String) body.get("fileType"));
        entity.setFileSize((Long) body.get("fileSize"));
        entity.setUploadedBy((Integer) body.get("uploadedBy"));
        entity.setUploadedAt((LocalDateTime) body.get("uploadedAt"));
    }
}
