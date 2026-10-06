package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.SchedulePeriod;

import java.util.List;

public interface SchedulePeriodRepository extends JpaRepository<SchedulePeriod, Integer> {
    List<SchedulePeriod> findByStoreIdOrderByStartDateDesc(Integer storeId);
}

