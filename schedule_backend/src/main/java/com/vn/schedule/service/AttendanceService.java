package com.vn.schedule.service;

import com.vn.schedule.domain.Attendance;
import com.vn.schedule.domain.Employee;
import com.vn.schedule.repository.AttendanceRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.AttendanceRequest;
import java.time.LocalDateTime;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AttendanceService {
    private final AttendanceRepository repository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(AttendanceRepository repository, EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public List<Attendance> findAll() {
        return repository.findAll();
    }

    public Attendance findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Attendance create(AttendanceRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Attendance update(Integer id, AttendanceRequest body) {
        Attendance current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Attendance save(AttendanceRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(AttendanceRequest body) {
        repository.delete(toEntity(body));
    }
    private Attendance toEntity(AttendanceRequest body) {
        Attendance entity = new Attendance();
        entity.setEmployee(resolveEmployee(body));
        entity.setCheckInLatitude(body.checkInLatitude());
        entity.setCheckInLongitude(body.checkInLongitude());
        entity.setCheckOutAt(body.checkOutAt());
        entity.setAttendanceStatus(body.attendanceStatus());
        entity.setApprovalStatus(body.approvalStatus());
        entity.setNote(body.note());
        return entity;
    }

    private void applyFields(Attendance entity, AttendanceRequest body) {
        entity.setEmployee(resolveEmployee(body));
        entity.setCheckInLatitude(body.checkInLatitude());
        entity.setCheckInLongitude(body.checkInLongitude());
        entity.setCheckOutAt(body.checkOutAt());
        entity.setAttendanceStatus(body.attendanceStatus());
        entity.setApprovalStatus(body.approvalStatus());
        entity.setNote(body.note());
    }

    private Employee resolveEmployee(AttendanceRequest body) {
        Integer employeeId = body.resolvedEmployeeId();
        if (employeeId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Employee is required");
        }
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
    }
}
