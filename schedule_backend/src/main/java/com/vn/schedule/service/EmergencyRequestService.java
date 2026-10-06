package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.EmergencyRequest;
import com.vn.schedule.repository.EmergencyRequestRepository;

import org.springframework.stereotype.Service;

@Service
public class EmergencyRequestService extends CrudService<EmergencyRequest, Integer> {
    public EmergencyRequestService(EmergencyRequestRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmergencyRequest.class);
    }
}
