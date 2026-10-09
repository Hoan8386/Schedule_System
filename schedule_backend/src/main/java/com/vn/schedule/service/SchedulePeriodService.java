package com.vn.schedule.service;

import com.vn.schedule.domain.SchedulePeriod;
import com.vn.schedule.domain.Store;
import com.vn.schedule.domain.User;
import com.vn.schedule.domain.Employee;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.EmployeeStoreRepository;
import com.vn.schedule.repository.SchedulePeriodRepository;
import com.vn.schedule.repository.StoreManagerRepository;
import com.vn.schedule.repository.StoreRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.repository.UserRoleRepository;
import com.vn.schedule.repository.RoleRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.util.SecurityUtil;
import com.vn.schedule.dto.request.SchedulePeriodRequest;
import java.time.LocalDateTime;
import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SchedulePeriodService {
    private final SchedulePeriodRepository repository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeStoreRepository employeeStoreRepository;
    private final StoreManagerRepository storeManagerRepository;

    public SchedulePeriodService(SchedulePeriodRepository repository, StoreRepository storeRepository,
                                UserRepository userRepository, UserRoleRepository userRoleRepository,
                                RoleRepository roleRepository, EmployeeRepository employeeRepository,
                                EmployeeStoreRepository employeeStoreRepository,
                                StoreManagerRepository storeManagerRepository) {
        this.repository = repository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.employeeStoreRepository = employeeStoreRepository;
        this.storeManagerRepository = storeManagerRepository;
    }

    public List<SchedulePeriod> findAll() {
        return findAll(null, null, null, null, null);
    }

    public List<SchedulePeriod> findAll(String q, LocalDate from, LocalDate to, Integer storeId, String status) {
        Set<Integer> visibleStoreIds = visibleStoreIds();
        String normalizedQuery = q == null ? "" : q.trim().toLowerCase();

        return repository.findAll().stream()
                .filter(item -> visibleStoreIds == null || visibleStoreIds.contains(item.getStore().getId()))
                .filter(item -> storeId == null || item.getStore().getId().equals(storeId))
                .filter(item -> from == null || !item.getStartDate().isBefore(from))
                .filter(item -> to == null || !item.getEndDate().isAfter(to))
                .filter(item -> status == null || status.isBlank() || status.equalsIgnoreCase(item.getStatus()))
                .filter(item -> normalizedQuery.isBlank()
                        || contains(item.getPeriodName(), normalizedQuery)
                        || contains(item.getPeriodType(), normalizedQuery)
                        || contains(item.getStore() != null && item.getStore().getStoreName() != null ? item.getStore().getStoreName() : null, normalizedQuery))
                .toList();
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private Set<Integer> visibleStoreIds() {
        String login = SecurityUtil.getCurrentUserLogin().orElse(null);
        if (login == null) return Set.of();

        User user = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));

        String roleCode = userRoleRepository.findByUserId(user.getId()).stream()
                .map(userRole -> roleRepository.findById(userRole.getRoleId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(role -> role.getRoleCode())
                .findFirst()
                .orElse("");

        if ("MANAGER".equalsIgnoreCase(roleCode) || "ADMIN".equalsIgnoreCase(roleCode)) {
            return null;
        }

        Employee employee = employeeRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Tài khoản chưa có hồ sơ nhân viên"));

        if ("STORE_MANAGER".equalsIgnoreCase(roleCode)) {
            return storeManagerRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                    .map(item -> item.getStoreId())
                    .collect(Collectors.toSet());
        }

        return employeeStoreRepository.findByEmployeeIdAndStatus(employee.getId(), "ACTIVE").stream()
                .map(item -> item.getStoreId())
                .collect(Collectors.toSet());
    }

    public SchedulePeriod findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public SchedulePeriod create(SchedulePeriodRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public SchedulePeriod update(Integer id, SchedulePeriodRequest body) {
        SchedulePeriod current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public SchedulePeriod save(SchedulePeriodRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(SchedulePeriodRequest body) {
        repository.delete(toEntity(body));
    }
    private SchedulePeriod toEntity(SchedulePeriodRequest body) {
        SchedulePeriod entity = new SchedulePeriod();
        entity.setId((Integer) body.get("id"));
        entity.setStore(resolveStore(body));
        entity.setPeriodName((String) body.get("periodName"));
        entity.setPeriodType((String) body.get("periodType"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setRegistrationOpenAt((LocalDateTime) body.get("registrationOpenAt"));
        entity.setRegistrationCloseAt((LocalDateTime) body.get("registrationCloseAt"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setFinalizedBy((Integer) body.get("finalizedBy"));
        entity.setFinalizedAt((LocalDateTime) body.get("finalizedAt"));
        return entity;
    }

    private void applyFields(SchedulePeriod entity, SchedulePeriodRequest body) {
        entity.setId((Integer) body.get("id"));
        entity.setStore(resolveStore(body));
        entity.setPeriodName((String) body.get("periodName"));
        entity.setPeriodType((String) body.get("periodType"));
        entity.setStartDate((LocalDate) body.get("startDate"));
        entity.setEndDate((LocalDate) body.get("endDate"));
        entity.setRegistrationOpenAt((LocalDateTime) body.get("registrationOpenAt"));
        entity.setRegistrationCloseAt((LocalDateTime) body.get("registrationCloseAt"));
        entity.setStatus((String) body.get("status"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setFinalizedBy((Integer) body.get("finalizedBy"));
        entity.setFinalizedAt((LocalDateTime) body.get("finalizedAt"));
    }

    private Store resolveStore(SchedulePeriodRequest body) {
        return storeRepository.getReferenceById(requiredId(body.get("store"), "store"));
    }

    private Integer requiredId(Object value, String fieldName) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof java.util.Map<?, ?> map && map.get("id") instanceof Number number) {
            return number.intValue();
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, fieldName + " is required");
    }
}
