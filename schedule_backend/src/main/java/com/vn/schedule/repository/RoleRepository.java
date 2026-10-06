package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.Role;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleCode(String roleCode);
}
