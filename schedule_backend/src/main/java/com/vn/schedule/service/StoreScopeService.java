package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.domain.User;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Phạm vi dữ liệu của người đang đăng nhập (vai trò, hồ sơ nhân viên, cửa hàng được xem).
 * Kết quả được ghi nhớ trong phạm vi một HTTP request: trước đây mỗi lần kiểm tra quyền
 * (thường nằm trong vòng lặp từng bản ghi) đều truy vấn lại user / user_role / role / employee.
 */
@Service
public class StoreScopeService {
    private static final String SCOPE_ATTRIBUTE = StoreScopeService.class.getName() + ".scope";

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreManagerRepository storeManagerRepository;

    public StoreScopeService(UserRepository userRepository,
                             UserRoleRepository userRoleRepository,
                             EmployeeRepository employeeRepository,
                             EmployeeStoreRepository employeeStoreRepository,
                             StoreManagerRepository storeManagerRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.employeeRepository = employeeRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeManagerRepository = storeManagerRepository;
    }

    /** Dữ liệu phạm vi của một lần đăng nhập; các phần tốn truy vấn được tính khi cần lần đầu. */
    private static final class Scope {
        final String login;
        final Integer userId;
        List<String> roleCodes;
        Integer employeeId;
        boolean employeeLoaded;
        Set<Integer> storeIds;
        boolean storeIdsLoaded;
        Set<Integer> employeeIdsInStores;
        boolean employeeIdsLoaded;

        Scope(String login, Integer userId) {
            this.login = login;
            this.userId = userId;
        }
    }

    private Scope scope() {
        String login = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"));
        RequestAttributes request = RequestContextHolder.getRequestAttributes();
        if (request != null
                && request.getAttribute(SCOPE_ATTRIBUTE, RequestAttributes.SCOPE_REQUEST) instanceof Scope cached
                && cached.login.equals(login)) {
            return cached;
        }
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        Scope scope = new Scope(login, user.getId());
        if (request != null) {
            request.setAttribute(SCOPE_ATTRIBUTE, scope, RequestAttributes.SCOPE_REQUEST);
        }
        return scope;
    }

    private List<String> roleCodes(Scope scope) {
        if (scope.roleCodes == null) {
            scope.roleCodes = userRoleRepository.findRoleCodesByUserId(scope.userId);
        }
        return scope.roleCodes;
    }

    private String primaryRole(Scope scope) {
        return roleCodes(scope).stream().filter(Objects::nonNull).findFirst().orElse("");
    }

    /** Hồ sơ nhân viên của tài khoản (null nếu chưa có). */
    private Integer employeeIdOrNull(Scope scope) {
        if (!scope.employeeLoaded) {
            scope.employeeId = employeeRepository.findByUser_Id(scope.userId).map(Employee::getId).orElse(null);
            scope.employeeLoaded = true;
        }
        return scope.employeeId;
    }

    public boolean isGlobalUser() {
        return visibleStoreIds() == null;
    }

    public boolean isCurrentUserRole(String expectedRole) {
        return roleCodes(scope()).stream().anyMatch(expectedRole::equalsIgnoreCase);
    }

    /** Vai trò dùng để xác định phạm vi (vai trò đầu tiên theo role_id, rỗng nếu chưa gán). */
    public String primaryRoleCode() {
        return primaryRole(scope());
    }

    /** Id tài khoản đang đăng nhập. */
    public Integer currentUserId() {
        return scope().userId;
    }

    public Integer currentEmployeeId() {
        Integer employeeId = employeeIdOrNull(scope());
        if (employeeId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên");
        }
        return employeeId;
    }

    /** null = được xem mọi cửa hàng (ADMIN / MANAGER). */
    public Set<Integer> visibleStoreIds() {
        Scope scope = scope();
        if (scope.storeIdsLoaded) {
            return scope.storeIds;
        }
        String roleCode = primaryRole(scope);
        Set<Integer> storeIds;
        if ("ADMIN".equalsIgnoreCase(roleCode) || "MANAGER".equalsIgnoreCase(roleCode)) {
            storeIds = null;
        } else {
            Integer employeeId = currentEmployeeId();
            storeIds = "STORE_MANAGER".equalsIgnoreCase(roleCode)
                    ? storeManagerRepository.findByEmployeeIdAndStatus(employeeId, "ACTIVE").stream()
                            .map(StoreManager::getStoreId)
                            .collect(Collectors.toUnmodifiableSet())
                    : employeeStoreRepository.findByEmployeeIdAndStatus(employeeId, "ACTIVE").stream()
                            .map(EmployeeStore::getStoreId)
                            .collect(Collectors.toUnmodifiableSet());
        }
        scope.storeIds = storeIds;
        scope.storeIdsLoaded = true;
        return storeIds;
    }

    public boolean canAccessStore(Integer storeId) {
        if (storeId == null) {
            return false;
        }
        Set<Integer> storeIds = visibleStoreIds();
        return storeIds == null || storeIds.contains(storeId);
    }

    public void requireStoreAccess(Integer storeId) {
        if (!canAccessStore(storeId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập dữ liệu cửa hàng này");
        }
    }

    /** null = mọi nhân viên; ngược lại là nhân viên đang ACTIVE ở các cửa hàng được xem. */
    public Set<Integer> employeeIdsInVisibleStores() {
        Set<Integer> storeIds = visibleStoreIds();
        if (storeIds == null) {
            return null;
        }
        Scope scope = scope();
        if (!scope.employeeIdsLoaded) {
            scope.employeeIdsInStores = storeIds.isEmpty()
                    ? Set.of()
                    : Set.copyOf(employeeStoreRepository.findActiveEmployeeIdsByStoreIds(storeIds));
            scope.employeeIdsLoaded = true;
        }
        return scope.employeeIdsInStores;
    }

    /** Tham số IN cho JPQL: tập rỗng được thay bằng giá trị không tồn tại để câu lệnh luôn hợp lệ. */
    public static Collection<Integer> inParam(Collection<Integer> ids) {
        return ids == null || ids.isEmpty() ? List.of(-1) : ids;
    }
}
