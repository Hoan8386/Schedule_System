package com.vn.shopping.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vn.shopping.domain.Todo;
import com.vn.shopping.repository.TodoRepository;
import org.springframework.stereotype.Service;

@Service
public class TodoService extends CrudService<Todo, Integer> {
    public TodoService(TodoRepository repository, ObjectMapper mapper) {
        super(repository, mapper, Todo.class);
    }
}
