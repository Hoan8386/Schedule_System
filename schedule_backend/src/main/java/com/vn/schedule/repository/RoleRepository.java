package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Role;

public interface RoleRepository extends JpaRepository<Role, Integer> {
}

