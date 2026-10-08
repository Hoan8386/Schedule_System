package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.vn.schedule.domain.Attachment;
import com.vn.schedule.dto.*;
import com.vn.schedule.dto.request.*;
import com.vn.schedule.dto.response.*;
import com.vn.schedule.service.AttachmentService;
import com.vn.schedule.service.R2StorageService;
import java.time.LocalDateTime;

import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/attachment")
public class AttachmentController {
    private final AttachmentService service;
    private final R2StorageService storage;

    public AttachmentController(AttachmentService service, R2StorageService storage) {
        this.service = service;
        this.storage = storage;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @ApiMessage("Tải ảnh lên thành công")
    public ResponseEntity<AttachmentResponse> upload(@RequestPart("file") MultipartFile file) {
        R2StorageService.StoredObject object = storage.uploadImage(file);
        Attachment attachment = new Attachment();
        attachment.setFileName(object.fileName());
        attachment.setFilePath(object.key());
        attachment.setFileType(object.fileType());
        attachment.setFileSize(object.fileSize());
        attachment.setUploadedAt(LocalDateTime.now());
        Attachment saved = service.saveEntity(attachment);
        AttachmentResponse response = response(saved);
        response.put("url", object.url());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<AttachmentResponse>> list() {
        return ResponseEntity.ok(responses(service.findAll()));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<AttachmentResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(service.findById(id)));
    }

    @GetMapping("/file/{id}")
    public ResponseEntity<byte[]> file(@PathVariable Integer id) {
        Attachment attachment = service.findById(id);

            MediaType mediaType;
            try {
                mediaType = MediaType.parseMediaType(attachment.getFileType());
            } catch (IllegalArgumentException exception) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(storage.download(attachment.getFilePath()));
    }

    @PostMapping

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<AttachmentResponse> create(@RequestBody AttachmentRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(response(service.create(body)));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<AttachmentResponse> update(@PathVariable Integer id, @RequestBody AttachmentRequest body) {
        return ResponseEntity.ok(response(service.update(id, body)));
    }

    @DeleteMapping("/{id}")

    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private List<AttachmentResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(value -> new AttachmentResponse(DtoMapper.toMap(value))).toList();
    }

    private AttachmentResponse response(Object value) {
        return new AttachmentResponse(DtoMapper.toMap(value));
    }
}
