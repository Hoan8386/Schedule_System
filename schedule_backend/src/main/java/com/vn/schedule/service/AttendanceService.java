package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Attendance;
import com.vn.schedule.repository.AttendanceRepository;

import org.springframework.stereotype.Service;

@Service
public class AttendanceService extends CrudService<Attendance, Integer> {
    public AttendanceService(AttendanceRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Attendance.class);
    }
}
