package com.vn.shopping.controller;

import com.vn.shopping.domain.Employee;
import com.vn.shopping.dto.DtoMapper;
import com.vn.shopping.dto.EmployeeRequest;
import com.vn.shopping.repository.EmployeeRepository;
import com.vn.shopping.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
public class EmployeeController {
    private final EmployeeRepository employees;
    private final UserRepository users;

    public EmployeeController(EmployeeRepository employees, UserRepository users) {
        this.employees = employees;
        this.users = users;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String status) {
        return DtoMapper.toList(status == null ? employees.findAll() : employees.findByStatusOrderByFullName(status));
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Integer id) {
        return DtoMapper.toMap(employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found")));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody EmployeeRequest request) {
        if (request.resolvedUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user.id is required");
        }
        Employee employee = new Employee();
        employee.setUser(users.getReferenceById(request.resolvedUserId()));
        apply(employee, request);
        employee.setId(null);
        return DtoMapper.toMap(employees.save(employee));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Integer id, @RequestBody EmployeeRequest request) {
        Employee employee = employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        apply(employee, request);
        return DtoMapper.toMap(employees.save(employee));
    }

    private void apply(Employee employee, EmployeeRequest request) {
        employee.setEmployeeCode(request.employeeCode());
        employee.setFullName(request.fullName());
        employee.setDateOfBirth(request.dateOfBirth());
        employee.setGender(request.gender());
        employee.setEmail(request.email());
        employee.setPhone(request.phone());
        employee.setAddress(request.address());
        employee.setHireDate(request.hireDate());
        employee.setStatus(request.status());
        employee.setNote(request.note());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        employees.delete(employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found")));
    }
}
