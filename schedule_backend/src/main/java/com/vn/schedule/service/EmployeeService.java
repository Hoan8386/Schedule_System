package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.User;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EmployeeRequest;
import com.vn.schedule.dto.EmployeeResponse;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository repository;
    private final UserRepository userRepository;

    public EmployeeService(EmployeeRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<EmployeeResponse> findAll(String status) {
        List<Employee> employees = status == null
                ? repository.findAll()
                : repository.findByStatusOrderByFullName(status);
        return employees.stream().map(this::toResponse).toList();
    }

    public Employee findEntityById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest body) {
        return toResponse(repository.save(toEntity(body)));
    }

    @Transactional
    public EmployeeResponse update(Integer id, EmployeeRequest body) {
        Employee current = findEntityById(id);
        applyFields(current, body);
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
    private Employee toEntity(EmployeeRequest body) {
        Employee entity = new Employee();
        entity.setUser(resolveUser(body));
        entity.setEmployeeCode(body.employeeCode());
        entity.setFullName(body.fullName());
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        entity.setHireDate(body.hireDate());
        entity.setStatus(body.status());
        entity.setNote(body.note());
        return entity;
    }

    private void applyFields(Employee entity, EmployeeRequest body) {
        entity.setUser(resolveUser(body));
        entity.setEmployeeCode(body.employeeCode());
        entity.setFullName(body.fullName());
        entity.setDateOfBirth(body.dateOfBirth());
        entity.setGender(body.gender());
        entity.setEmail(body.email());
        entity.setPhone(body.phone());
        entity.setAddress(body.address());
        entity.setHireDate(body.hireDate());
        entity.setStatus(body.status());
        entity.setNote(body.note());
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
