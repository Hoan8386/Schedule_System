package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.DisciplinaryRecord;

public interface DisciplinaryRecordRepository extends JpaRepository<DisciplinaryRecord, Integer> {
}

