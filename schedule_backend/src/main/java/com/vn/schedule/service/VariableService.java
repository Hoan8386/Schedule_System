package com.vn.schedule.service;

import com.vn.schedule.domain.Variable;
import com.vn.schedule.repository.VariableRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.VariableRequest;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VariableService {
    private final VariableRepository repository;
    public VariableService(VariableRepository repository) {
        this.repository = repository;
    }

    public List<Variable> findAll() {
        return repository.findAll();
    }

    public Variable findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Variable create(VariableRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Variable update(Integer id, VariableRequest body) {
        Variable current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Variable save(VariableRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(VariableRequest body) {
        repository.delete(toEntity(body));
    }
    private Variable toEntity(VariableRequest body) {
        Variable entity = new Variable();
        entity.setVariableId((Integer) body.get("variableId"));
        entity.setVariableCode((String) body.get("variableCode"));
        entity.setVariableName((String) body.get("variableName"));
        entity.setDataType((String) body.get("dataType"));
        entity.setSourceField((String) body.get("sourceField"));
        entity.setStatus((String) body.get("status"));
        return entity;
    }

    private void applyFields(Variable entity, VariableRequest body) {
        entity.setVariableId((Integer) body.get("variableId"));
        entity.setVariableCode((String) body.get("variableCode"));
        entity.setVariableName((String) body.get("variableName"));
        entity.setDataType((String) body.get("dataType"));
        entity.setSourceField((String) body.get("sourceField"));
        entity.setStatus((String) body.get("status"));
    }
}
