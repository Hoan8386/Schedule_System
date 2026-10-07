package com.vn.schedule.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import com.vn.schedule.domain.Employee;
import com.vn.schedule.dto.*;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.UserRepository;
import com.vn.schedule.service.AttachmentService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {
    private final EmployeeRepository employees;
    private final UserRepository users;
    private final AttachmentService attachments;

    public EmployeeController(
            EmployeeRepository employees,
            UserRepository users,
            AttachmentService attachments) {
        this.employees = employees;
        this.users = users;
        this.attachments = attachments;
    }

    @GetMapping
    @ApiMessage("Lấy dữ liệu")
    public ResponseEntity<List<EmployeeResponse>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(responses(status == null ? employees.findAll() : employees.findByStatusOrderByFullName(status)));
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<EmployeeResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(response(employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"))));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)

    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<EmployeeResponse> create(
            @RequestParam Integer userId,
            @RequestParam String employeeCode,
            @RequestParam String fullName,
            @RequestParam(required = false) LocalDate dateOfBirth,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) LocalDate hireDate,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            @RequestPart("idCardFront") MultipartFile idCardFront,
            @RequestPart("idCardBack") MultipartFile idCardBack) {
        EmployeeRequest request = new EmployeeRequest(
                userId, employeeCode, fullName, dateOfBirth, gender, email, phone,
                address, hireDate, status, note, null);
        if (request.resolvedUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "user.id is required");
        }
        Employee employee = new Employee();
        employee.setUser(users.getReferenceById(request.resolvedUserId()));
        apply(employee, request);
        employee.setIdCardFrontId(attachments.uploadImage(idCardFront, null).getAttachmentId());
        employee.setIdCardBackId(attachments.uploadImage(idCardBack, null).getAttachmentId());
        employee.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response(employees.save(employee)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<EmployeeResponse> update(
            @PathVariable Integer id,
            @RequestParam Integer userId,
            @RequestParam String employeeCode,
            @RequestParam String fullName,
            @RequestParam(required = false) LocalDate dateOfBirth,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) LocalDate hireDate,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            @RequestPart("idCardFront") MultipartFile idCardFront,
            @RequestPart("idCardBack") MultipartFile idCardBack) {
        EmployeeRequest request = new EmployeeRequest(
                userId, employeeCode, fullName, dateOfBirth, gender, email, phone,
                address, hireDate, status, note, null);
        Employee employee = employees.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        apply(employee, request);
        employee.setIdCardFrontId(attachments.uploadImage(idCardFront, null).getAttachmentId());
        employee.setIdCardBackId(attachments.uploadImage(idCardBack, null).getAttachmentId());
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

    @ApiMessage("Xóa dữ liệu")
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
