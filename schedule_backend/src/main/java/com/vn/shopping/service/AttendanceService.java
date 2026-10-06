package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Attendance;
import com.vn.shopping.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService extends CrudService<Attendance, Integer> {
    public AttendanceService(AttendanceRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Attendance.class);
    }
}
