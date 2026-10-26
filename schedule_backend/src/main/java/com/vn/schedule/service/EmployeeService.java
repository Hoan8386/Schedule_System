package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.Store;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.domain.User;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.PageSupport;
import com.vn.schedule.dto.request.EmployeeRequest;
import com.vn.schedule.dto.response.EmployeePageResponse;
import com.vn.schedule.dto.response.EmployeeResponse;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EmployeeService {
    private final EmployeeRepository repository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final StoreScopeService storeScopeService;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreRepository storeRepository;
    private final StoreManagerService storeManagerService;
    private final EmployeeAssignmentService assignmentService;

    private static final Set<String> GENDERS = Set.of("MALE", "FEMALE");
    private static final Set<String> STATUSES = Set.of("ACTIVE", "INACTIVE", "RESIGNED");

    /** Khóa sắp xếp được phép cho trang nhân sự (kèm id để thứ tự ổn định giữa các trang). */
    private static final Map<String, Sort> PAGE_SORTS = Map.of(
            "newest", Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")),
            "name", Sort.by(Sort.Order.asc("fullName"), Sort.Order.asc("id")),
            "code", Sort.by(Sort.Order.asc("employeeCode"), Sort.Order.asc("id")),
            "hireDate", Sort.by(Sort.Order.desc("hireDate"), Sort.Order.desc("id")));

    public EmployeeService(
            EmployeeRepository repository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            StoreScopeService storeScopeService,
            EmployeeStoreRepository employeeStoreRepository,
            StoreRepository storeRepository,
            StoreManagerService storeManagerService,
            EmployeeAssignmentService assignmentService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.storeScopeService = storeScopeService;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeRepository = storeRepository;
        this.storeManagerService = storeManagerService;
        this.assignmentService = assignmentService;
    }

    public List<EmployeeResponse> findAll(String status) {
        Integer selfId = storeScopeService.isCurrentUserRole("EMPLOYEE") ? storeScopeService.currentEmployeeId() : null;
        Set<Integer> visibleStoreIds = storeScopeService.visibleStoreIds();
        // Giữ thứ tự cũ: không lọc trạng thái thì theo id, có lọc thì theo họ tên
        Sort sort = status == null ? Sort.by("id") : Sort.by("fullName");
        List<Employee> employees = repository.findInScope(status, selfId, visibleStoreIds == null,
                StoreScopeService.inParam(visibleStoreIds), sort);
        // Vị trí của cả danh sách trong một truy vấn
        Map<Integer, String> positions = assignmentService.positionsByUserIds(employees.stream()
                .filter(employee -> employee.getUser() != null)
                .map(employee -> employee.getUser().getId())
                .collect(Collectors.toSet()));
        return employees.stream()
                .map(employee -> toResponse(employee,
                        employee.getUser() == null ? null : positions.get(employee.getUser().getId())))
                .toList();
    }

    /**
     * Trang nhân sự có phân trang: lọc hồ sơ + điều kiện phân bổ cửa hàng tại DB, rồi nạp phân bổ / tên cửa hàng
     * của đúng các nhân viên trong trang (truy vấn theo lô) thay vì frontend tải 4 danh sách đầy đủ rồi tự ghép.
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public EmployeePageResponse page(Integer page, Integer size, String sort, String query, String status,
                                     Integer storeId, String role, String assignmentStatus, Boolean primary,
                                     String position) {
        Pageable pageable = PageSupport.pageable(page, size, sort, PAGE_SORTS, "newest");
        String statusFilter = blankToNull(status);
        String roleFilter = normalizeRole(role);
        String assignmentStatusFilter = blankToNull(assignmentStatus);
        String positionFilter = blankToNull(position) == null ? null : EmployeeAssignmentService.normalizePosition(position);
        boolean assignmentFilter = storeId != null || roleFilter != null || assignmentStatusFilter != null || primary != null;

        Integer selfId = storeScopeService.isCurrentUserRole("EMPLOYEE") ? storeScopeService.currentEmployeeId() : null;
        Set<Integer> visibleStoreIds = storeScopeService.visibleStoreIds();
        boolean allStores = visibleStoreIds == null;
        Collection<Integer> scopeStoreIds = StoreScopeService.inParam(visibleStoreIds);

        Page<Employee> employees = "NONE".equals(roleFilter)
                ? Page.empty(pageable)
                : repository.searchPage(statusFilter, selfId, allStores, scopeStoreIds, PageSupport.keyword(query),
                        assignmentFilter, storeId, assignmentStatusFilter, primary, roleFilter, positionFilter, pageable);

        List<Integer> pageIds = employees.getContent().stream().map(Employee::getId).toList();
        Map<Integer, List<EmployeeStore>> assignments = pageIds.isEmpty()
                ? Map.of()
                : employeeStoreRepository.search(allStores, scopeStoreIds,
                                false, pageIds, storeId, assignmentStatusFilter, primary, roleFilter)
                        .stream()
                        .collect(Collectors.groupingBy(EmployeeStore::getEmployeeId));
        Set<Integer> storeIds = assignments.values().stream().flatMap(List::stream)
                .map(EmployeeStore::getStoreId)
                .collect(Collectors.toSet());
        Map<Integer, String> storeNames = storeIds.isEmpty() ? Map.of()
                : storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(Store::getId, store -> String.valueOf(store.getStoreName())));
        Set<Integer> managerIds = storeManagerService.findAll().stream()
                .filter(manager -> "ACTIVE".equalsIgnoreCase(manager.getStatus()))
                .map(StoreManager::getEmployeeId)
                .collect(Collectors.toSet());
        Map<Integer, String> positions = assignmentService.positionsByUserIds(employees.getContent().stream()
                .filter(employee -> employee.getUser() != null)
                .map(employee -> employee.getUser().getId())
                .collect(Collectors.toSet()));

        List<EmployeePageResponse.Item> items = employees.getContent().stream()
                .map(employee -> toItem(employee, managerIds.contains(employee.getId()),
                        employee.getUser() == null ? null : positions.get(employee.getUser().getId()),
                        assignments.getOrDefault(employee.getId(), List.of()), storeNames))
                .toList();
        Object[] counts = repository.countInScope(statusFilter, selfId, allStores, scopeStoreIds).get(0);
        EmployeePageResponse.Summary summary = new EmployeePageResponse.Summary(
                ((Number) counts[0]).longValue(), ((Number) counts[1]).longValue(),
                repository.countStoreManagersInScope(statusFilter, selfId, allStores, scopeStoreIds));
        return new EmployeePageResponse(PageSupport.meta(employees), items, summary);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() || "ALL".equalsIgnoreCase(value.trim()) ? null : value.trim();
    }

    /** Như /employee_store: ALL / rỗng = không lọc, STAFF = EMPLOYEE, giá trị lạ = không khớp bản ghi nào. */
    private static String normalizeRole(String role) {
        String value = blankToNull(role);
        if (value == null) return null;
        String upper = value.toUpperCase();
        if ("STAFF".equals(upper)) return "EMPLOYEE";
        return "MANAGER".equals(upper) || "EMPLOYEE".equals(upper) ? upper : "NONE";
    }

    private EmployeePageResponse.Item toItem(Employee employee, boolean manager, String position, List<EmployeeStore> assignments,
                                             Map<Integer, String> storeNames) {
        return new EmployeePageResponse.Item(
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
                employee.getSignatureId(),
                employee.getHireDate(),
                employee.getStatus(),
                employee.getNote(),
                employee.getCreatedAt(),
                employee.getUpdatedAt(),
                manager,
                position,
                assignments.stream()
                        .map(item -> new EmployeePageResponse.Assignment(
                                item.getEmployeeStoreId(), item.getEmployeeId(), item.getStoreId(),
                                storeNames.get(item.getStoreId()), item.getStartDate(), item.getEndDate(),
                                item.getIsPrimary(), item.getStatus(), item.getAssignedBy(), item.getCreatedAt()))
                        .toList());
    }

    public Employee findEntityById(Integer id) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi nhân viên"));
        Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        if (storeScopeService.isCurrentUserRole("EMPLOYEE")
                && !employee.getId().equals(storeScopeService.currentEmployeeId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn chỉ được xem hồ sơ của mình");
        }
        if (visibleEmployeeIds != null && !visibleEmployeeIds.contains(employee.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập nhân viên này");
        }
        return employee;
    }

    /**
     * Tạo nhân viên: mã tự sinh (NVxxxx), vị trí bắt buộc và quyết định quyền của tài khoản tự tạo,
     * phân bổ cửa hàng theo storeIds.
     */
    @Transactional
    public EmployeeResponse create(EmployeeRequest body) {
        validate(body);
        String position = EmployeeAssignmentService.normalizePosition(body.position());
        if (position == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn vị trí của nhân viên");
        }
        if (body.resolvedUserId() == null && (body.email() == null || body.email().isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng nhập Email để hệ thống tạo tài khoản và gửi thông tin đăng nhập");
        }
        String employeeCode = nextEmployeeCode();
        User user = resolveOrCreateUser(body, employeeCode);

        Employee entity = new Employee();
        entity.setUser(user);
        entity.setEmployeeCode(employeeCode);
        entity.setFullName(body.fullName().trim());
        entity.setAvatar(body.avatar());
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender().trim().toUpperCase());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        entity.setIdCardFrontId(body.idCardFrontId());
        entity.setIdCardBackId(body.idCardBackId());
        entity.setSignatureId(body.signatureId());
        entity.setHireDate(body.hireDate());
        entity.setStatus(body.status() != null && !body.status().isBlank() ? body.status().trim().toUpperCase() : "ACTIVE");
        entity.setNote(body.note());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        Employee saved = repository.save(entity);
        assignmentService.setPosition(saved, position);
        if (body.storeIds() != null) {
            assignmentService.syncStores(saved, body.storeIds(), body.primaryStoreId(),
                    body.storeStartDate() != null ? body.storeStartDate() : body.hireDate());
        }
        return toResponse(saved);
    }

    /** Sửa hồ sơ: mã nhân viên giữ nguyên; position / storeIds = null thì không đổi vị trí / phân bổ. */
    @Transactional
    public EmployeeResponse update(Integer id, EmployeeRequest body) {
        Employee current = findEntityById(id);
        validate(body);
        applyFields(current, body);
        current.setUpdatedAt(LocalDateTime.now());
        Employee saved = repository.save(current);
        if (body.position() != null && !body.position().isBlank()) {
            assignmentService.setPosition(saved, body.position());
        }
        if (body.storeIds() != null) {
            assignmentService.syncStores(saved, body.storeIds(), body.primaryStoreId(), body.storeStartDate());
        }
        return toResponse(saved);
    }

    /** Dữ liệu bắt buộc: họ tên, ngày sinh, giới tính Nam / Nữ; trạng thái chỉ gồm đang làm việc / tạm nghỉ / đã nghỉ việc. */
    private static void validate(EmployeeRequest body) {
        if (body.fullName() == null || body.fullName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng nhập họ và tên");
        }
        if (body.dateOfBirth() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng nhập ngày sinh");
        }
        if (body.dateOfBirth().isAfter(java.time.LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ngày sinh không được ở tương lai");
        }
        if (body.gender() == null || !GENDERS.contains(body.gender().trim().toUpperCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn giới tính (Nam hoặc Nữ)");
        }
        if (body.status() != null && !body.status().isBlank() && !STATUSES.contains(body.status().trim().toUpperCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái chỉ có Đang làm việc, Tạm nghỉ hoặc Đã nghỉ việc");
        }
    }

    /** Mã nhân viên kế tiếp: NV + số lớn nhất hiện có + 1, đủ 4 chữ số (NV0025). */
    private String nextEmployeeCode() {
        int max = repository.findGeneratedCodes().stream()
                .map(code -> code.substring(2))
                .filter(number -> number.matches("\\d{1,9}"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0);
        return String.format("NV%04d", max + 1);
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

    /** Tài khoản của nhân viên: tìm theo userId / email hoặc tạo mới (quyền gán sau theo vị trí). */
    private User resolveOrCreateUser(EmployeeRequest body, String employeeCode) {
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
            if (employeeCode != null && !employeeCode.isBlank()) {
                baseUsername = employeeCode.trim().toLowerCase().replaceAll("[^a-zA-Z0-9_]", "");
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
            log.info("Tự động tạo User mới (ID: {}, Username: {}) cho nhân viên mã {}", targetUser.getId(), targetUsername, employeeCode);
        }

        // Gửi email chứa thông tin tài khoản nếu có email và mật khẩu khởi tạo
        if (email != null && rawPassword != null) {
            emailService.sendAccountCreatedEmail(
                    email,
                    body.fullName(),
                    employeeCode,
                    targetUsername,
                    rawPassword
            );
        }

        return targetUser;
    }

    private Employee toEntity(EmployeeRequest body) {
        Employee entity = new Employee();
        entity.setUser(resolveOrCreateUser(body, body.employeeCode()));
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
        entity.setSignatureId(body.signatureId());
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
        entity.setFullName(body.fullName().trim());
        if (body.avatar() != null) {
            entity.setAvatar(body.avatar());
        }
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender().trim().toUpperCase());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        entity.setSignatureId(body.signatureId());
        if (body.idCardFrontId() != null) {
            entity.setIdCardFrontId(body.idCardFrontId());
        }
        if (body.idCardBackId() != null) {
            entity.setIdCardBackId(body.idCardBackId());
        }
        entity.setHireDate(body.hireDate());
        if (body.status() != null && !body.status().isBlank()) {
            entity.setStatus(body.status().trim().toUpperCase());
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
        return toResponse(employee, assignmentService.positionOf(employee));
    }

    private EmployeeResponse toResponse(Employee employee, String position) {
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
                employee.getSignatureId(),
                employee.getHireDate(),
                employee.getStatus(),
                employee.getNote(),
                employee.getCreatedAt(),
                employee.getUpdatedAt(),
                position);
    }
}
