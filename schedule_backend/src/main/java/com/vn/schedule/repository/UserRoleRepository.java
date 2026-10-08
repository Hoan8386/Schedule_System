package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(Integer userId);
}
