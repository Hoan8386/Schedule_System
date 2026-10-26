package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.Role;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.domain.UserRole;
import com.vn.schedule.dto.request.StoreStaffRequest;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Quy tắc nghiệp vụ dùng chung cho trang Nhân sự và trang Cửa hàng:
 * - Vị trí của nhân viên (Nhân viên / Trưởng cửa hàng) chính là vai trò tài khoản, quyền đi theo vị trí.
 * - Phân bổ cửa hàng (employee_store): một nhân viên thuộc nhiều cửa hàng; bỏ khỏi cửa hàng = kết thúc phân bổ (giữ lịch sử).
 * - Nhân viên đang làm việc phải thuộc ít nhất một cửa hàng, không còn cửa hàng nào thì chuyển sang tạm nghỉ.
 * - Mỗi cửa hàng có một trưởng cửa hàng đang phụ trách (store_manager ACTIVE).
 */
@Service
public class EmployeeAssignmentService {
    public static final String EMPLOYEE = "EMPLOYEE";
    public static final String STORE_MANAGER = "STORE_MANAGER";
    /** Vị trí người dùng nghiệp vụ được chọn; ADMIN / MANAGER do quản trị viên cấp ở trang tài khoản. */
    public static final Set<String> POSITIONS = Set.of(EMPLOYEE, STORE_MANAGER);
    private static final String ACTIVE = "ACTIVE";
    private static final String INACTIVE = "INACTIVE";

    private final EmployeeRepository employeeRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreManagerRepository storeManagerRepository;
    private final StoreRepository storeRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final StoreScopeService storeScopeService;

    public EmployeeAssignmentService(EmployeeRepository employeeRepository,
                                     EmployeeStoreRepository employeeStoreRepository,
                                     StoreManagerRepository storeManagerRepository,
                                     StoreRepository storeRepository,
                                     RoleRepository roleRepository,
                                     UserRoleRepository userRoleRepository,
                                     StoreScopeService storeScopeService) {
        this.employeeRepository = employeeRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeManagerRepository = storeManagerRepository;
        this.storeRepository = storeRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.storeScopeService = storeScopeService;
    }

    /** "EMPLOYEE" / "STORE_MANAGER"; null hoặc rỗng = không đổi; giá trị khác = lỗi. */
    public static String normalizePosition(String position) {
        if (position == null || position.isBlank()) return null;
        String value = position.trim().toUpperCase();
        if (!POSITIONS.contains(value)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vị trí chỉ có thể là Nhân viên hoặc Trưởng cửa hàng");
        }
        return value;
    }

    /** Vị trí theo vai trò tài khoản: trưởng cửa hàng ưu tiên hơn nhân viên; tài khoản quản trị trả về mã vai trò. */
    public static String positionFrom(Collection<String> roleCodes) {
        if (roleCodes.contains(STORE_MANAGER)) return STORE_MANAGER;
        if (roleCodes.contains(EMPLOYEE)) return EMPLOYEE;
        return roleCodes.stream().findFirst().orElse(null);
    }

    /** Vị trí của nhiều tài khoản trong một truy vấn: userId → vị trí. */
    public Map<Integer, String> positionsByUserIds(Collection<Integer> userIds) {
        if (userIds.isEmpty()) return Map.of();
        Map<Integer, Set<String>> codes = new HashMap<>();
        for (Object[] row : userRoleRepository.findRoleCodesByUserIds(userIds)) {
            codes.computeIfAbsent((Integer) row[0], key -> new LinkedHashSet<>()).add(String.valueOf(row[1]).toUpperCase());
        }
        Map<Integer, String> result = new HashMap<>();
        codes.forEach((userId, roleCodes) -> result.put(userId, positionFrom(roleCodes)));
        return result;
    }

    public String positionOf(Employee employee) {
        if (employee.getUser() == null) return null;
        return positionFrom(userRoleRepository.findRoleCodesByUserId(employee.getUser().getId()).stream()
                .map(String::toUpperCase).toList());
    }

    /**
     * Đặt vị trí: thay vai trò EMPLOYEE / STORE_MANAGER của tài khoản (giữ nguyên ADMIN / MANAGER nếu có).
     * Thôi làm trưởng cửa hàng thì kết thúc mọi phân công phụ trách cửa hàng.
     */
    @Transactional
    public void setPosition(Employee employee, String position) {
        String target = normalizePosition(position);
        if (target == null || employee.getUser() == null) return;
        Integer userId = employee.getUser().getId();
        Role targetRole = roleRepository.findByRoleCode(target)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Hệ thống chưa có vai trò " + target));
        String other = EMPLOYEE.equals(target) ? STORE_MANAGER : EMPLOYEE;
        roleRepository.findByRoleCode(other).ifPresent(role -> userRoleRepository.findByUserId(userId).stream()
                .filter(userRole -> userRole.getRoleId().equals(role.getRoleId()))
                .forEach(userRoleRepository::delete));
        boolean hasTarget = userRoleRepository.findByUserId(userId).stream()
                .anyMatch(userRole -> userRole.getRoleId().equals(targetRole.getRoleId()));
        if (!hasTarget) {
            UserRole userRole = new UserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(targetRole.getRoleId());
            userRole.setAssignedBy(currentUserId());
            userRole.setAssignedAt(LocalDateTime.now());
            userRoleRepository.save(userRole);
        }
        if (EMPLOYEE.equals(target)) {
            endManagerRows(employee.getId(), null);
        } else {
            // Mới lên trưởng cửa hàng: nhận phụ trách các cửa hàng đang làm mà chưa có trưởng cửa hàng
            activeStoreIds(employee.getId()).stream()
                    .filter(storeId -> storeManagerRepository.findByStoreIdAndStatus(storeId, ACTIVE).isEmpty())
                    .forEach(storeId -> createManagerRow(storeId, employee.getId()));
        }
    }

    public List<Integer> activeStoreIds(Integer employeeId) {
        return employeeStoreRepository.findByEmployeeIdAndStatus(employeeId, ACTIVE).stream()
                .map(EmployeeStore::getStoreId)
                .distinct()
                .toList();
    }

    /**
     * Đồng bộ danh sách cửa hàng của nhân viên: thêm cửa hàng mới, kết thúc phân bổ ở cửa hàng bị bỏ,
     * đánh dấu cửa hàng chính. Không còn cửa hàng nào thì nhân viên đang làm việc chuyển sang tạm nghỉ.
     */
    @Transactional
    public void syncStores(Employee employee, Collection<Integer> storeIds, Integer primaryStoreId, LocalDate startDate) {
        Set<Integer> wanted = new LinkedHashSet<>(storeIds);
        wanted.forEach(this::requireStore);
        List<Integer> current = activeStoreIds(employee.getId());
        current.stream().filter(storeId -> !wanted.contains(storeId)).forEach(storeId -> removeFromStore(employee, storeId));
        wanted.stream().filter(storeId -> !current.contains(storeId)).forEach(storeId -> addToStore(employee, storeId, startDate));
        Integer primary = primaryStoreId != null && wanted.contains(primaryStoreId)
                ? primaryStoreId
                : wanted.stream().findFirst().orElse(null);
        markPrimary(employee.getId(), primary);
        suspendIfNoStore(employee);
    }

    /** Thêm nhân viên vào cửa hàng (bỏ qua nếu đang làm ở đó). Cửa hàng đầu tiên là cửa hàng chính. */
    @Transactional
    public void addToStore(Employee employee, Integer storeId, LocalDate startDate) {
        requireStore(storeId);
        List<EmployeeStore> active = employeeStoreRepository.findByEmployeeIdAndStatus(employee.getId(), ACTIVE);
        if (active.stream().anyMatch(item -> storeId.equals(item.getStoreId()))) return;
        EmployeeStore assignment = new EmployeeStore();
        assignment.setEmployeeId(employee.getId());
        assignment.setStoreId(storeId);
        assignment.setStartDate(startDate != null ? startDate : LocalDate.now());
        assignment.setIsPrimary(active.isEmpty());
        assignment.setStatus(ACTIVE);
        assignment.setAssignedBy(currentUserId());
        assignment.setCreatedAt(LocalDateTime.now());
        employeeStoreRepository.save(assignment);
        // Trưởng cửa hàng vào cửa hàng chưa có người phụ trách thì phụ trách luôn
        if (STORE_MANAGER.equals(positionOf(employee)) && storeManagerRepository.findByStoreIdAndStatus(storeId, ACTIVE).isEmpty()) {
            createManagerRow(storeId, employee.getId());
        }
    }

    /** Kết thúc phân bổ của nhân viên tại cửa hàng (và phụ trách cửa hàng đó nếu có), giữ lại lịch sử. */
    @Transactional
    public void removeFromStore(Employee employee, Integer storeId) {
        List<EmployeeStore> active = employeeStoreRepository.findByEmployeeIdAndStatus(employee.getId(), ACTIVE);
        boolean wasPrimary = false;
        for (EmployeeStore item : active) {
            if (!storeId.equals(item.getStoreId())) continue;
            wasPrimary |= Boolean.TRUE.equals(item.getIsPrimary());
            item.setStatus(INACTIVE);
            item.setEndDate(LocalDate.now());
            item.setIsPrimary(false);
            employeeStoreRepository.save(item);
        }
        endManagerRows(employee.getId(), storeId);
        if (wasPrimary) {
            active.stream()
                    .filter(item -> !storeId.equals(item.getStoreId()))
                    .findFirst()
                    .ifPresent(item -> markPrimary(employee.getId(), item.getStoreId()));
        }
    }

    /** Nhân viên đang làm việc mà không còn thuộc cửa hàng nào → tạm nghỉ (INACTIVE). Trả về true nếu đã chuyển. */
    @Transactional
    public boolean suspendIfNoStore(Employee employee) {
        if (!ACTIVE.equalsIgnoreCase(employee.getStatus()) || !activeStoreIds(employee.getId()).isEmpty()) return false;
        employee.setStatus(INACTIVE);
        employee.setUpdatedAt(LocalDateTime.now());
        employeeRepository.save(employee);
        return true;
    }

    /**
     * Đổi trưởng cửa hàng: kết thúc người đang phụ trách, giao cho nhân viên mới (tự thêm vào cửa hàng
     * và chuyển vị trí sang trưởng cửa hàng nếu chưa). employee = null: cửa hàng không còn trưởng cửa hàng.
     */
    @Transactional
    public void assignManager(Integer storeId, Employee employee) {
        requireStore(storeId);
        List<StoreManager> current = storeManagerRepository.findByStoreIdAndStatus(storeId, ACTIVE);
        if (employee != null && current.size() == 1 && employee.getId().equals(current.get(0).getEmployeeId())) return;
        LocalDate today = LocalDate.now();
        current.forEach(row -> {
            row.setStatus(INACTIVE);
            row.setEndDate(today);
            storeManagerRepository.save(row);
        });
        if (employee == null) return;
        if (!ACTIVE.equalsIgnoreCase(employee.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Nhân viên " + employee.getFullName() + " không còn làm việc nên không thể làm trưởng cửa hàng");
        }
        if (!STORE_MANAGER.equals(positionOf(employee))) setPosition(employee, STORE_MANAGER);
        addToStore(employee, storeId, today);
        if (storeManagerRepository.findByStoreIdAndStatus(storeId, ACTIVE).isEmpty()) {
            createManagerRow(storeId, employee.getId());
        }
    }

    /** Kết thúc phụ trách cửa hàng của nhân viên (storeId = null: mọi cửa hàng). */
    private void endManagerRows(Integer employeeId, Integer storeId) {
        LocalDate today = LocalDate.now();
        storeManagerRepository.findByEmployeeIdAndStatus(employeeId, ACTIVE).stream()
                .filter(row -> storeId == null || storeId.equals(row.getStoreId()))
                .forEach(row -> {
                    row.setStatus(INACTIVE);
                    row.setEndDate(today);
                    storeManagerRepository.save(row);
                });
    }

    private void createManagerRow(Integer storeId, Integer employeeId) {
        StoreManager row = new StoreManager();
        row.setStoreId(storeId);
        row.setEmployeeId(employeeId);
        row.setStartDate(LocalDate.now());
        row.setStatus(ACTIVE);
        row.setAssignedBy(currentUserId());
        row.setCreatedAt(LocalDateTime.now());
        storeManagerRepository.save(row);
    }

    private void markPrimary(Integer employeeId, Integer primaryStoreId) {
        employeeStoreRepository.findByEmployeeIdAndStatus(employeeId, ACTIVE).forEach(item -> {
            boolean primary = primaryStoreId != null && primaryStoreId.equals(item.getStoreId());
            if (!Boolean.valueOf(primary).equals(item.getIsPrimary())) {
                item.setIsPrimary(primary);
                employeeStoreRepository.save(item);
            }
        });
    }

    private void requireStore(Integer storeId) {
        if (storeId == null || !storeRepository.existsById(storeId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Không tìm thấy cửa hàng #" + storeId);
        }
        storeScopeService.requireStoreAccess(storeId);
    }

    /** Áp dụng thay đổi nhân sự của cửa hàng (xem StoreStaffRequest). */
    @Transactional
    public void updateStoreStaff(Integer storeId, StoreStaffRequest body) {
        requireStore(storeId);
        LocalDate today = LocalDate.now();
        for (StoreStaffRequest.Removal removal : body.removals() == null ? List.<StoreStaffRequest.Removal>of() : body.removals()) {
            Employee employee = employee(removal.employeeId());
            removeFromStore(employee, storeId);
            if (removal.transferToStoreId() != null && !removal.transferToStoreId().equals(storeId)) {
                addToStore(employee, removal.transferToStoreId(), today);
            }
            suspendIfNoStore(employee);
        }
        for (StoreStaffRequest.Member member : body.members() == null ? List.<StoreStaffRequest.Member>of() : body.members()) {
            Employee employee = employee(member.employeeId());
            if ("RESIGNED".equalsIgnoreCase(employee.getStatus())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Nhân viên " + employee.getFullName() + " đã nghỉ việc");
            }
            addToStore(employee, storeId, today);
            // Nhân viên tạm nghỉ được phân bổ lại vào cửa hàng thì làm việc trở lại
            if (!ACTIVE.equalsIgnoreCase(employee.getStatus())) {
                employee.setStatus(ACTIVE);
                employee.setUpdatedAt(LocalDateTime.now());
                employeeRepository.save(employee);
            }
            if (member.position() != null && !member.position().isBlank()) setPosition(employee, member.position());
        }
        if (body.managerEmployeeId() != null) {
            assignManager(storeId, body.managerEmployeeId() == 0 ? null : employee(body.managerEmployeeId()));
        }
    }

    private Employee employee(Integer employeeId) {
        if (employeeId == null) throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu mã nhân viên");
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên #" + employeeId));
    }

    private Integer currentUserId() {
        return SecurityUtil.getCurrentUserLogin().isEmpty() ? null : storeScopeService.currentUserId();
    }
}
