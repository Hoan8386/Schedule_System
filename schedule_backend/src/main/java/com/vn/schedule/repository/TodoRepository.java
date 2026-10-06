package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Todo;

public interface TodoRepository extends JpaRepository<Todo, Integer> {
}

