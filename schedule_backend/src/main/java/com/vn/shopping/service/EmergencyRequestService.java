package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.EmergencyRequest;
import com.vn.shopping.repository.EmergencyRequestRepository;
import org.springframework.stereotype.Service;

@Service
public class EmergencyRequestService extends CrudService<EmergencyRequest, Integer> {
    public EmergencyRequestService(EmergencyRequestRepository repository, ObjectMapper mapper) {
        super(repository, mapper, EmergencyRequest.class);
    }
}
