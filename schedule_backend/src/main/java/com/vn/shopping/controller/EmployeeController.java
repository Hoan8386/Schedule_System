package com.vn.shopping.controller;

import com.vn.shopping.dto.*;
import com.vn.shopping.domain.Employee;
import com.vn.shopping.dto.DtoMapper;
import com.vn.shopping.dto.EmployeeRequest;
import com.vn.shopping.repository.EmployeeRepository;
import com.vn.shopping.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<List<EmployeeResponse>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(responses(status == null ? employees.findAll() : employees.findByStatusOrderByFullName(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"))));
    }

    @PostMapping

    public ResponseEntity<EmployeeResponse> create(@RequestBody EmployeeRequest request) {
        if (request.resolvedUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user.id is required");
        }
        Employee employee = new Employee();
        employee.setUser(users.getReferenceById(request.resolvedUserId()));
        apply(employee, request);
        employee.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response(employees.save(employee)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(@PathVariable Integer id, @RequestBody EmployeeRequest request) {
        Employee employee = employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        apply(employee, request);
        return ResponseEntity.ok(response(employees.save(employee)));
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

    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        employees.delete(employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found")));
        return ResponseEntity.noContent().build();
    }

    private List<EmployeeResponse> responses(java.util.Collection<?> values) {
        return values.stream().map(EmployeeResponse::new).toList();
    }

    private EmployeeResponse response(Object value) {
        return new EmployeeResponse(DtoMapper.toMap(value));
    }
}