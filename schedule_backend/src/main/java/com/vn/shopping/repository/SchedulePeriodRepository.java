package com.vn.shopping.repository;

import com.vn.shopping.domain.SchedulePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchedulePeriodRepository extends JpaRepository<SchedulePeriod, Integer> {
    List<SchedulePeriod> findByStoreIdOrderByStartDateDesc(Integer storeId);
}

