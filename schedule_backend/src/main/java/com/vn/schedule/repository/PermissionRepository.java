package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
}

