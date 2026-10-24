package com.vn.schedule.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.service.DatabaseBackupService;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import com.vn.schedule.util.anotation.ApiMessage;

/**
 * Xuất / nhập database. Không đi qua PermissionInterceptor (lần đầu database trống chưa có bảng quyền),
 * quyền được kiểm tra trực tiếp tại đây:
 * - Tài khoản đang đăng nhập có vai trò ADMIN, hoặc
 * - Gửi header X-Setup-Key khớp app.database.setup-key (biến môi trường DB_SETUP_KEY), hoặc
 * - Chỉ riêng import: database chưa có tài khoản nào và chưa cấu hình setup key (cài đặt lần đầu).
 */
@RestController
@RequestMapping("/api/v1/database")
public class DatabaseController {
    private static final DateTimeFormatter FILE_TIME = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");

    private final DatabaseBackupService backups;
    private final UserRepository users;
    private final UserRoleRepository userRoles;
    private final String setupKey;

    public DatabaseController(DatabaseBackupService backups, UserRepository users, UserRoleRepository userRoles,
            @Value("${app.database.setup-key:}") String setupKey) {
        this.backups = backups;
        this.users = users;
        this.userRoles = userRoles;
        this.setupKey = setupKey == null ? "" : setupKey.trim();
    }

    /** Công khai: màn hình đăng nhập dùng để biết có cần hiện bước nhập dữ liệu lần đầu không. */
    @GetMapping("/status")
    @ApiMessage("Lấy trạng thái database")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "initialized", backups.isInitialized(),
                "setupKeyRequired", !setupKey.isEmpty()));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestHeader(value = "X-Setup-Key", required = false) String key) {
        if (!isAdmin() && !matchesSetupKey(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Chỉ quản trị viên mới được xuất database");
        }
        String fileName = "schedule_system-" + LocalDateTime.now().format(FILE_TIME) + ".sql";
        return ResponseEntity.ok()
                .contentType(new MediaType("application", "sql", StandardCharsets.UTF_8))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(fileName).build().toString())                .body(backups.exportSql());
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    @ApiMessage("Nhập database thành công")
    public ResponseEntity<Map<String, Object>> importSql(
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-Setup-Key", required = false) String key) throws IOException {
        boolean firstSetup = setupKey.isEmpty() && !backups.isInitialized();
        if (!firstSetup && !isAdmin() && !matchesSetupKey(key)) {
            throw new ApiException(HttpStatus.FORBIDDEN, setupKey.isEmpty()
                    ? "Database đã có dữ liệu – hãy đăng nhập bằng tài khoản ADMIN để nhập"
                    : "Setup key không đúng");
        }
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn file .sql");
        }
        int executed = backups.importSql(file.getBytes());
        return ResponseEntity.ok(Map.of("statements", executed));
    }

    private boolean isAdmin() {
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null || login.isBlank()) {
            return false;
        }
        try {
            return users.findByUsername(login)
                    .or(() -> users.findByEmail(login))
                    .filter(user -> "ACTIVE".equalsIgnoreCase(user.getStatus()))
                    .map(user -> userRoles.findRoleCodesByUserId(user.getId()).contains("ADMIN"))
                    .orElse(false);
        } catch (RuntimeException exception) {
            // Bảng tài khoản / vai trò chưa tồn tại
            return false;
        }
    }

    private boolean matchesSetupKey(String key) {
        return !setupKey.isEmpty() && key != null && MessageDigest.isEqual(
                setupKey.getBytes(StandardCharsets.UTF_8), key.trim().getBytes(StandardCharsets.UTF_8));
    }
}
