package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.util.ApiException;

import org.springframework.http.HttpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public class CrudService<T, ID> {
    protected final JpaRepository<T, ID> repository;
    private final ObjectMapper mapper;
    private final Class<T> entityType;
    public CrudService(JpaRepository<T, ID> repository, ObjectMapper mapper, Class<T> entityType) {
        this.repository = repository; this.mapper = mapper; this.entityType = entityType;
    }
    public List<T> findAll() { return repository.findAll(); }
    public T findById(ID id) { return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi")); }
    @Transactional public T create(Object body) { return repository.save(mapper.convertValue(body, entityType)); }
    @Transactional public T update(ID id, Object body) { T current = findById(id); try { mapper.updateValue(current, body); } catch (Exception ex) { throw new ApiException(HttpStatus.BAD_REQUEST, "Dữ liệu cập nhật không hợp lệ"); } return repository.save(current); }
    @Transactional public void delete(ID id) { repository.delete(findById(id)); }
    @Transactional public T save(Object body) { return repository.save(mapper.convertValue(body, entityType)); }
    @Transactional public void deleteBody(Object body) { repository.delete(mapper.convertValue(body, entityType)); }
}
