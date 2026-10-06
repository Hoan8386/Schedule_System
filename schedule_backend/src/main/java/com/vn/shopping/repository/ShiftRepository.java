package com.vn.shopping.repository;

import com.vn.shopping.domain.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Integer> {
    List<Shift> findByStoreIdAndStatusOrderByStartTime(Integer storeId, String status);
}

