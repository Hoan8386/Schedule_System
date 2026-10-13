package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.domain.User;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class StoreScopeService {
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreManagerRepository storeManagerRepository;

    public StoreScopeService(UserRepository userRepository,
                             UserRoleRepository userRoleRepository,
                             RoleRepository roleRepository,
                             EmployeeRepository employeeRepository,
                             EmployeeStoreRepository employeeStoreRepository,
                             StoreManagerRepository storeManagerRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeManagerRepository = storeManagerRepository;
    }

    public boolean isGlobalUser() {
        return visibleStoreIds() == null;
    }

    public boolean isCurrentUserRole(String expectedRole) {
        String login = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"));
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        return userRoleRepository.findByUserId(user.getId()).stream()
                .map(item -> roleRepository.findById(item.getRoleId()).orElse(null))
                .filter(Objects::nonNull)
                .map(role -> role.getRoleCode())
                .anyMatch(expectedRole::equalsIgnoreCase);
    }

    public Integer currentEmployeeId() {
        String login = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"));
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        return employeeRepository.findByUser_Id(user.getId())
                .map(Employee::getId)
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên"));
    }

    public Set<Integer> visibleStoreIds() {
        String login = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"));
        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));

        String roleCode = userRoleRepository.findByUserId(user.getId()).stream()
                .map(userRole -> roleRepository.findById(userRole.getRoleId()).orElse(null))
                .filter(Objects::nonNull)
                .map(role -> role.getRoleCode())
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("");

        if ("ADMIN".equalsIgnoreCase(roleCode) || "MANAGER".equalsIgnoreCase(roleCode)) {
            return null;
        }

        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên"));

        if ("STORE_MANAGER".equalsIgnoreCase(roleCode)) {
            return storeManagerRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                    .map(StoreManager::getStoreId)
                    .collect(Collectors.toSet());
        }

        return employeeStoreRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                .map(EmployeeStore::getStoreId)
                .collect(Collectors.toSet());
    }

    public boolean canAccessStore(Integer storeId) {
        return storeId != null
                && (isGlobalUser() || visibleStoreIds().contains(storeId));
    }

    public void requireStoreAccess(Integer storeId) {
        if (!canAccessStore(storeId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập dữ liệu cửa hàng này");
        }
    }

    public Set<Integer> employeeIdsInVisibleStores() {
        Set<Integer> storeIds = visibleStoreIds();
        if (storeIds == null) {
            return null;
        }
        return employeeStoreRepository.findAll().stream()
                .filter(item -> storeIds.contains(item.getStoreId()))
                .filter(item -> "ACTIVE".equalsIgnoreCase(item.getStatus()))
                .map(EmployeeStore::getEmployeeId)
                .collect(Collectors.toSet());
    }
}
