package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vn.schedule.domain.UserRole;
import com.vn.schedule.domain.UserRoleId;
import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(Integer userId);

    @Query("""
            select r.roleCode
            from UserRole ur, Role r
            where ur.userId = :userId
              and ur.roleId = r.roleId
            order by ur.assignedAt asc
            """)
    List<String> findRoleCodesByUserId(@Param("userId") Integer userId);
}
