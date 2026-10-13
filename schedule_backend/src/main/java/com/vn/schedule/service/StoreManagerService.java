package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.EmployeeStore;
import com.vn.schedule.domain.StoreManager;
import com.vn.schedule.domain.User;
import com.vn.schedule.dto.request.StoreManagerRequest;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreManagerService {
    private final StoreManagerRepository repository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeStoreRepository employeeStoreRepository;

    public StoreManagerService(StoreManagerRepository repository,
                              UserRepository userRepository,
                              UserRoleRepository userRoleRepository,
                              RoleRepository roleRepository,
                              EmployeeRepository employeeRepository,
                              EmployeeStoreRepository employeeStoreRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.employeeStoreRepository = employeeStoreRepository;
    }

    public List<StoreManager> findAll() {
        Set<Integer> visibleStoreIds = visibleStoreIds();
        return repository.findAll().stream()
                .filter(item -> visibleStoreIds == null || visibleStoreIds.contains(item.getStoreId()))
                .toList();
    }

    public StoreManager findById(Integer id) {
        StoreManager item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));

        Set<Integer> visibleStoreIds = visibleStoreIds();
        if (visibleStoreIds != null && !visibleStoreIds.contains(item.getStoreId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu cửa hàng này");
        }

        return item;
    }

    @Transactional
    public StoreManager create(StoreManagerRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public StoreManager update(Integer id, StoreManagerRequest body) {
        StoreManager current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public StoreManager save(StoreManagerRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(StoreManagerRequest body) {
        repository.delete(toEntity(body));
    }

    private Set<Integer> visibleStoreIds() {
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null) {
            return Set.of();
        }

        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));

        String roleCode = userRoleRepository.findByUserId(user.getId()).stream()
                .map(userRole -> roleRepository.findById(userRole.getRoleId()).orElse(null))
                .filter(Objects::nonNull)
                .map(role -> role.getRoleCode())
                .findFirst()
                .orElse("");

        if ("MANAGER".equalsIgnoreCase(roleCode) || "ADMIN".equalsIgnoreCase(roleCode)) {
            return null;
        }

        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên"));

        if ("STORE_MANAGER".equalsIgnoreCase(roleCode)) {
            return repository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                    .map(StoreManager::getStoreId)
                    .collect(Collectors.toSet());
        }

        return employeeStoreRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                .map(EmployeeStore::getStoreId)
                .collect(Collectors.toSet());
    }

    private StoreManager toEntity(StoreManagerRequest body) {
        StoreManager entity = new StoreManager();
        entity.setStoreManagerId((Integer) body.get("storeManagerId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setNote((String) body.get("note"));
        return entity;
    }

    private void applyFields(StoreManager entity, StoreManagerRequest body) {
        entity.setStoreManagerId((Integer) body.get("storeManagerId"));
        entity.setStoreId((Integer) body.get("storeId"));
        entity.setEmployeeId((Integer) body.get("employeeId"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setStatus((String) body.get("status"));
        entity.setAssignedBy((Integer) body.get("assignedBy"));
        entity.setNote((String) body.get("note"));
    }
}
