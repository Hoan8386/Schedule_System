package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.ShiftByDate;

import java.time.LocalDate;
import java.util.List;

public interface ShiftByDateRepository extends JpaRepository<ShiftByDate, Integer> {
    List<ShiftByDate> findByWorkDateBetweenOrderByWorkDateAscStartTimeAsc(LocalDate from, LocalDate to);
}

