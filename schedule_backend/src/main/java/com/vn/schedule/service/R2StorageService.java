package com.vn.schedule.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.vn.schedule.util.ApiException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class R2StorageService {
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    private final ObjectProvider<S3Client> clientProvider;
    private final String bucket;
    private final String publicBaseUrl;

    public R2StorageService(
            ObjectProvider<S3Client> clientProvider,
            @Value("${r2.bucket:}") String bucket,
            @Value("${r2.public-base-url:}") String publicBaseUrl) {
        this.clientProvider = clientProvider;
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl;
    }

    public StoredObject uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ảnh tải lên không được để trống");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Ảnh không được vượt quá 10MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ hỗ trợ tệp hình ảnh");
        }

        S3Client client = clientProvider.getIfAvailable();
        if (client == null || bucket.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Lưu trữ R2 chưa được cấu hình. Hãy đặt R2_ENABLED và các biến R2_*");
        }

        String key = "images/" + UUID.randomUUID() + extensionOf(file.getOriginalFilename());
        try {
            client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(contentType)
                            .cacheControl("public, max-age=31536000, immutable")
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
        } catch (IOException | RuntimeException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "Không thể tải ảnh lên Cloudflare R2: " + exception.getMessage());
        }

        return new StoredObject(key, publicUrl(key), file.getOriginalFilename(),
                contentType, file.getSize());
    }

    public void delete(String key) {
        S3Client client = clientProvider.getIfAvailable();
        if (client == null || bucket.isBlank() || key == null || key.isBlank()) {
            return;
        }
        client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }

    private String publicUrl(String key) {
        if (publicBaseUrl.isBlank()) {
            return key;
        }
        return publicBaseUrl.replaceAll("/+$", "") + "/" + key;
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dot = originalFilename.lastIndexOf('.');
        return dot >= 0 ? originalFilename.substring(dot).replaceAll("[^A-Za-z0-9.]", "") : "";
    }

    public record StoredObject(
            String key,
            String url,
            String fileName,
            String fileType,
            long fileSize) {
    }
}
