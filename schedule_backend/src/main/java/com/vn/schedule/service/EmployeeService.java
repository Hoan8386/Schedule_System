package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.User;
import com.vn.schedule.domain.UserRole;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.EmployeeRequest;
import com.vn.schedule.dto.response.EmployeeResponse;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
public class EmployeeService {
    private final EmployeeRepository repository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final StoreScopeService storeScopeService;

    public EmployeeService(
            EmployeeRepository repository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            StoreScopeService storeScopeService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.storeScopeService = storeScopeService;
    }

    public List<EmployeeResponse> findAll(String status) {
        List<Employee> employees = status == null
                ? repository.findAll()
                : repository.findByStatusOrderByFullName(status);
        Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        return employees.stream()
                .filter(employee -> visibleEmployeeIds == null || visibleEmployeeIds.contains(employee.getId()))
                .map(this::toResponse)
                .toList();
    }

    public Employee findEntityById(Integer id) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi nhân viên"));
        Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        if (visibleEmployeeIds != null && !visibleEmployeeIds.contains(employee.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập nhân viên này");
        }
        return employee;
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest body) {
        User user = resolveOrCreateUser(body);

        Employee entity = new Employee();
        entity.setUser(user);
        entity.setEmployeeCode(body.employeeCode());
        entity.setFullName(body.fullName());
        entity.setAvatar(body.avatar());
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        entity.setIdCardFrontId(body.idCardFrontId());
        entity.setIdCardBackId(body.idCardBackId());
        entity.setHireDate(body.hireDate());
        entity.setStatus(body.status() != null && !body.status().isBlank() ? body.status() : "ACTIVE");
        entity.setNote(body.note());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        Employee saved = repository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public EmployeeResponse update(Integer id, EmployeeRequest body) {
        Employee current = findEntityById(id);
        applyFields(current, body);
        current.setUpdatedAt(LocalDateTime.now());
        return toResponse(repository.save(current));
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findEntityById(id));
    }

    @Transactional
    public Employee save(EmployeeRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmployeeRequest body) {
        repository.delete(toEntity(body));
    }

    public EmployeeResponse findById(Integer id) {
        return toResponse(findEntityById(id));
    }

    private User resolveOrCreateUser(EmployeeRequest body) {
        Integer requestedUserId = body.resolvedUserId();
        if (requestedUserId != null && requestedUserId > 0) {
            return userRepository.findById(requestedUserId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy User với ID: " + requestedUserId));
        }

        // Tự động tìm hoặc tạo User mới cho nhân viên
        String email = body.email() != null && !body.email().isBlank() ? body.email().trim().toLowerCase() : null;
        String phone = body.phone() != null && !body.phone().isBlank() ? body.phone().trim() : null;
        User targetUser = null;
        String rawPassword = null;
        String targetUsername = null;

        if (email != null) {
            Optional<User> existingUserOpt = userRepository.findByEmail(email);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                if (repository.findByUser_Id(existingUser.getId()).isPresent()) {
                    throw new ApiException(HttpStatus.CONFLICT, "Email " + email + " đã được liên kết với một hồ sơ nhân viên khác");
                }
                targetUser = existingUser;
                targetUsername = existingUser.getUsername();
            }
        }

        if (targetUser == null) {
            // Tạo username từ mã nhân viên hoặc tiền tố email
            String baseUsername;
            if (body.employeeCode() != null && !body.employeeCode().isBlank()) {
                baseUsername = body.employeeCode().trim().toLowerCase().replaceAll("[^a-zA-Z0-9_]", "");
            } else if (email != null) {
                baseUsername = email.split("@")[0].toLowerCase().replaceAll("[^a-zA-Z0-9_]", "");
            } else {
                baseUsername = "nv" + (System.currentTimeMillis() % 100000);
            }
            if (baseUsername.isBlank()) {
                baseUsername = "emp" + (System.currentTimeMillis() % 100000);
            }

            String candidateUsername = baseUsername;
            int counter = 1;
            while (userRepository.findByUsername(candidateUsername).isPresent()) {
                candidateUsername = baseUsername + counter++;
            }
            targetUsername = candidateUsername;

            // Khởi tạo mật khẩu ngẫu nhiên: Bloan@ + 4 chữ số
            int randomCode = (int) (Math.random() * 9000 + 1000);
            rawPassword = "Bloan@" + randomCode;

            User newUser = new User();
            newUser.setUsername(targetUsername);
            newUser.setEmail(email);
            newUser.setPhone(phone);
            newUser.setPasswordHash(passwordEncoder.encode(rawPassword));
            newUser.setStatus("ACTIVE");
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());
            targetUser = userRepository.save(newUser);

            // Gán quyền EMPLOYEE trong user_role
            final Integer newUserId = targetUser.getId();
            roleRepository.findByRoleCode("EMPLOYEE").ifPresent(role -> {
                UserRole userRole = new UserRole();
                userRole.setUserId(newUserId);
                userRole.setRoleId(role.getRoleId());
                userRole.setAssignedAt(LocalDateTime.now());
                userRoleRepository.save(userRole);
            });
            log.info("Tự động tạo User mới (ID: {}, Username: {}) cho nhân viên mã {}", targetUser.getId(), targetUsername, body.employeeCode());
        }

        // Gửi email chứa thông tin tài khoản nếu có email và mật khẩu khởi tạo
        if (email != null && rawPassword != null) {
            emailService.sendAccountCreatedEmail(
                    email,
                    body.fullName(),
                    body.employeeCode(),
                    targetUsername,
                    rawPassword
            );
        }

        return targetUser;
    }

    private Employee toEntity(EmployeeRequest body) {
        Employee entity = new Employee();
        entity.setUser(resolveOrCreateUser(body));
        entity.setEmployeeCode(body.employeeCode());
        entity.setFullName(body.fullName());
        entity.setAvatar(body.avatar());
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        entity.setIdCardFrontId(body.idCardFrontId());
        entity.setIdCardBackId(body.idCardBackId());
        entity.setHireDate(body.hireDate());
        entity.setStatus(body.status() != null && !body.status().isBlank() ? body.status() : "ACTIVE");
        entity.setNote(body.note());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return entity;
    }

    private void applyFields(Employee entity, EmployeeRequest body) {
        if (body.resolvedUserId() != null && body.resolvedUserId() > 0) {
            entity.setUser(resolveUser(body));
        }
        entity.setEmployeeCode(body.employeeCode());
        entity.setFullName(body.fullName());
        if (body.avatar() != null) {
            entity.setAvatar(body.avatar());
        }
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        if (body.idCardFrontId() != null) {
            entity.setIdCardFrontId(body.idCardFrontId());
        }
        if (body.idCardBackId() != null) {
            entity.setIdCardBackId(body.idCardBackId());
        }
        entity.setHireDate(body.hireDate());
        if (body.status() != null && !body.status().isBlank()) {
            entity.setStatus(body.status());
        }
        entity.setNote(body.note());
        entity.setUpdatedAt(LocalDateTime.now());
    }

    private User resolveUser(EmployeeRequest body) {
        Integer userId = body.resolvedUserId();
        if (userId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User is required");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getUser() == null ? null : employee.getUser().getId(),
                employee.getEmployeeCode(),
                employee.getFullName(),
                employee.getAvatar(),
                employee.getDateOfBirth(),
                employee.getGender(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getAddress(),
                employee.getIdCardFrontId(),
                employee.getIdCardBackId(),
                employee.getHireDate(),
                employee.getStatus(),
                employee.getNote(),
                employee.getCreatedAt(),
                employee.getUpdatedAt());
    }
}
