package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Attachment;
import com.vn.schedule.repository.AttachmentRepository;

import org.springframework.stereotype.Service;

@Service
public class AttachmentService extends CrudService<Attachment, Integer> {
    public AttachmentService(AttachmentRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Attachment.class);
    }
}
