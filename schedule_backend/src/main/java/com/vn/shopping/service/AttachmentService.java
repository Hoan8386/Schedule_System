package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Attachment;
import com.vn.shopping.repository.AttachmentRepository;
import org.springframework.stereotype.Service;

@Service
public class AttachmentService extends CrudService<Attachment, Integer> {
    public AttachmentService(AttachmentRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Attachment.class);
    }
}
