package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.BonusRecord;

public interface BonusRecordRepository extends JpaRepository<BonusRecord, Integer> {
}

