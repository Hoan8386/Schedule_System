package com.vn.shopping.repository;

import com.vn.shopping.domain.UserRole;
import com.vn.shopping.domain.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
}

