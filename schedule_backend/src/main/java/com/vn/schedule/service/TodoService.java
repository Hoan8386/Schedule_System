package com.vn.schedule.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.schedule.domain.Todo;
import com.vn.schedule.repository.TodoRepository;

import org.springframework.stereotype.Service;

@Service
public class TodoService extends CrudService<Todo, Integer> {
    public TodoService(TodoRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Todo.class);
    }
}
