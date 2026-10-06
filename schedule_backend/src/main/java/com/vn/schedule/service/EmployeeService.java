package com.vn.schedule.service;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.User;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.EmployeeRequest;
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

    public List<Employee> findAll() {
        return repository.findAll();
    }

    public Employee findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Employee create(EmployeeRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Employee update(Integer id, EmployeeRequest body) {
        Employee current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Employee save(EmployeeRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(EmployeeRequest body) {
        repository.delete(toEntity(body));
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
}
