package com.vn.schedule.service;

import com.vn.schedule.domain.Todo;
import com.vn.schedule.repository.TodoRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.request.TodoRequest;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TodoService {
    private final TodoRepository repository;
    public TodoService(TodoRepository repository) {
        this.repository = repository;
    }

    public List<Todo> findAll() {
        return repository.findAll();
    }

    public Todo findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public Todo create(TodoRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public Todo update(Integer id, TodoRequest body) {
        Todo current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public Todo save(TodoRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(TodoRequest body) {
        repository.delete(toEntity(body));
    }
    private Todo toEntity(TodoRequest body) {
        Todo entity = new Todo();
        entity.setTodoId((Integer) body.get("todoId"));
        entity.setAssigneeId((Integer) body.get("assigneeId"));
        entity.setTitle((String) body.get("title"));
        entity.setDescription((String) body.get("description"));
        entity.setTodoType((String) body.get("todoType"));
        entity.setSourceType((String) body.get("sourceType"));
        entity.setSourceId((Integer) body.get("sourceId"));
        entity.setPriority((String) body.get("priority"));
        entity.setDueAt((LocalDateTime) body.get("dueAt"));
        entity.setStatus((String) body.get("status"));
        entity.setIsSystemGenerated((Boolean) body.get("isSystemGenerated"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setCompletedAt((LocalDateTime) body.get("completedAt"));
        return entity;
    }

    private void applyFields(Todo entity, TodoRequest body) {
        entity.setTodoId((Integer) body.get("todoId"));
        entity.setAssigneeId((Integer) body.get("assigneeId"));
        entity.setTitle((String) body.get("title"));
        entity.setDescription((String) body.get("description"));
        entity.setTodoType((String) body.get("todoType"));
        entity.setSourceType((String) body.get("sourceType"));
        entity.setSourceId((Integer) body.get("sourceId"));
        entity.setPriority((String) body.get("priority"));
        entity.setDueAt((LocalDateTime) body.get("dueAt"));
        entity.setStatus((String) body.get("status"));
        entity.setIsSystemGenerated((Boolean) body.get("isSystemGenerated"));
        entity.setCreatedBy((Integer) body.get("createdBy"));
        entity.setCompletedAt((LocalDateTime) body.get("completedAt"));
    }
}
