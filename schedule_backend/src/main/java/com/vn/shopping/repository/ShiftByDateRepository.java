package com.vn.shopping.repository;

import com.vn.shopping.domain.ShiftByDate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ShiftByDateRepository extends JpaRepository<ShiftByDate, Integer> {
    List<ShiftByDate> findByWorkDateBetweenOrderByWorkDateAscStartTimeAsc(LocalDate from, LocalDate to);
}

