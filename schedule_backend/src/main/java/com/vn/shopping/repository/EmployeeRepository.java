package com.vn.shopping.repository;

import com.vn.shopping.domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    List<Employee> findByStatusOrderByFullName(String status);
}

