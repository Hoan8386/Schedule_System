package com.vn.schedule.service;

import com.vn.schedule.domain.Attendance;
import com.vn.schedule.domain.Employee;
import com.vn.schedule.domain.ShiftByDate;
import com.vn.schedule.dto.response.AttendanceResponse;
import com.vn.schedule.repository.AttendanceRepository;
import com.vn.schedule.repository.EmployeeRepository;
import com.vn.schedule.repository.ShiftByDateRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.AttendanceRequest;
import com.vn.schedule.dto.request.CheckInRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AttendanceService {
    private final AttendanceRepository repository;
    private final EmployeeRepository employeeRepository;
    private final ShiftByDateRepository shiftByDateRepository;

    public AttendanceService(AttendanceRepository repository, EmployeeRepository employeeRepository,
            ShiftByDateRepository shiftByDateRepository) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.shiftByDateRepository = shiftByDateRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findAll(Integer employeeId) {
        List<Attendance> values = employeeId == null
                ? repository.findAll()
                : repository.findByEmployeeIdOrderByCheckInAtDesc(employeeId);
        return values.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AttendanceResponse findResponseById(Integer id) {
        return toResponse(findById(id));
    }

    public Attendance findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public AttendanceResponse checkIn(CheckInRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));
        Attendance item = new Attendance();
        item.setEmployee(employee);
        item.setCheckInAt(LocalDateTime.now());
        item.setCheckInLatitude(request.latitude());
        item.setCheckInLongitude(request.longitude());
        item.setAttendanceStatus("PRESENT");
        item.setScheduleMatchStatus("PENDING");
        item.setApprovalStatus("PENDING");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        return toResponse(repository.save(item));
    }

    @Transactional
    public AttendanceResponse create(AttendanceRequest body) {
        return toResponse(repository.save(toEntity(body)));
    }

    @Transactional
    public AttendanceResponse update(Integer id, AttendanceRequest body) {
        Attendance current = findById(id);
        applyFields(current, body);
        return toResponse(repository.save(current));
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
        entity.setShiftByDate(resolveShiftByDate(body.shiftByDateId()));
        entity.setCheckInLatitude(body.checkInLatitude());
        entity.setCheckInLongitude(body.checkInLongitude());
        entity.setCheckOutAt(body.checkOutAt());
        entity.setAttendanceStatus(body.attendanceStatus());
        entity.setApprovalStatus(body.approvalStatus());
        entity.setNote(body.note());
        return entity;
    }

    private void applyFields(Attendance entity, AttendanceRequest body) {
        if (body.resolvedEmployeeId() != null) {
            entity.setEmployee(resolveEmployee(body));
        }
        if (body.shiftByDateId() != null) {
            entity.setShiftByDate(resolveShiftByDate(body.shiftByDateId()));
        }
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

    private ShiftByDate resolveShiftByDate(Integer shiftByDateId) {
        if (shiftByDateId == null) {
            return null;
        }
        return shiftByDateRepository.findById(shiftByDateId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Shift by date not found"));
    }

    private AttendanceResponse toResponse(Attendance item) {
        Employee employee = item.getEmployee();
        ShiftByDate shiftByDate = item.getShiftByDate();
        return new AttendanceResponse(
                item.getId(),
                employee == null ? null : new AttendanceResponse.EmployeeSummary(
                        employee.getId(),
                        employee.getEmployeeCode(),
                        employee.getFullName(),
                        employee.getEmail(),
                        employee.getPhone()),
                employee == null ? null : employee.getId(),
                shiftByDate == null ? null : new AttendanceResponse.ShiftByDateSummary(
                        shiftByDate.getId(),
                        shiftByDate.getShiftName(),
                        shiftByDate.getWorkDate(),
                        shiftByDate.getStartTime(),
                        shiftByDate.getEndTime(),
                        shiftByDate.getStatus()),
                shiftByDate == null ? null : shiftByDate.getId(),
                item.getCheckInAt(),
                item.getCheckInLatitude(),
                item.getCheckInLongitude(),
                item.getCheckInAccuracy(),
                item.getAttachmentId(),
                item.getCheckOutAt(),
                item.getCheckOutLatitude(),
                item.getCheckOutLongitude(),
                item.getCheckOutAccuracy(),
                item.getWorkedHours(),
                item.getAttendanceStatus(),
                item.getScheduleMatchStatus(),
                item.getApprovalStatus(),
                item.getApprovedBy(),
                item.getApprovedAt(),
                item.getNote(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
