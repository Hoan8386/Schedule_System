package com.vn.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vn.schedule.domain.OrganizationSetting;

public interface OrganizationSettingRepository extends JpaRepository<OrganizationSetting, Integer> {
}

