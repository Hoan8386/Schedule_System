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
    private final StoreScopeService storeScopeService;
    public TodoService(TodoRepository repository, StoreScopeService storeScopeService) {
        this.repository = repository;
        this.storeScopeService = storeScopeService;
    }

    public List<Todo> findAll() {
        java.util.Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        // Việc mới tạo trước
        return repository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Order.desc("createdAt"), org.springframework.data.domain.Sort.Order.desc("todoId"))).stream()
                .filter(item -> visibleEmployeeIds == null
                        || visibleEmployeeIds.contains(item.getAssigneeId())
                        || visibleEmployeeIds.contains(item.getCreatedBy()))
                .toList();
    }

    public Todo findById(Integer id) {
        Todo item = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
        java.util.Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        if (visibleEmployeeIds != null
                && !visibleEmployeeIds.contains(item.getAssigneeId())
                && !visibleEmployeeIds.contains(item.getCreatedBy())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập công việc này");
        }
        return item;
    }

    @Transactional
    public Todo create(TodoRequest body) {
        Todo item = toEntity(body);
        java.util.Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        if (visibleEmployeeIds != null
                && !visibleEmployeeIds.contains(item.getAssigneeId())
                && !visibleEmployeeIds.contains(item.getCreatedBy())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Công việc phải thuộc cửa hàng bạn đang quản lý");
        }
        return repository.save(item);
    }

    @Transactional
    public Todo update(Integer id, TodoRequest body) {
        Todo current = findById(id);
        applyFields(current, body);
        java.util.Set<Integer> visibleEmployeeIds = storeScopeService.employeeIdsInVisibleStores();
        if (visibleEmployeeIds != null
                && !visibleEmployeeIds.contains(current.getAssigneeId())
                && !visibleEmployeeIds.contains(current.getCreatedBy())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Công việc phải thuộc cửa hàng bạn đang quản lý");
        }
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
