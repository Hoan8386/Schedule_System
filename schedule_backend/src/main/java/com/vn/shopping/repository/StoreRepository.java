package com.vn.shopping.repository;

import com.vn.shopping.domain.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Integer> {
    List<Store> findByStatusOrderByStoreName(String status);
}

