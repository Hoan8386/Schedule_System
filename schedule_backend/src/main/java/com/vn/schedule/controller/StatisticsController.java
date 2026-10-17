package com.vn.schedule.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vn.schedule.dto.response.DashboardResponse;
import com.vn.schedule.dto.response.StatisticsResponse;
import com.vn.schedule.service.DashboardService;
import com.vn.schedule.service.StatisticsService;

import java.time.LocalDate;
import java.util.List;
import com.vn.schedule.util.anotation.ApiMessage;

/**
 * Thống kê theo vai trò. Mặc định lấy tháng hiện tại nếu không truyền from/to (yyyy-MM-dd).
 */
@RestController
@RequestMapping("/api/v1/statistics")
public class StatisticsController {
    private final StatisticsService service;
    private final DashboardService dashboardService;

    public StatisticsController(StatisticsService service, DashboardService dashboardService) {
        this.service = service;
        this.dashboardService = dashboardService;
    }

    @GetMapping("/manager/dashboard")
    @ApiMessage("Tổng quan toàn chuỗi")
    public ResponseEntity<DashboardResponse.Manager> managerDashboard() {
        return ResponseEntity.ok(dashboardService.manager());
    }

    @GetMapping("/store-manager/dashboard")
    @ApiMessage("Tổng quan cửa hàng")
    public ResponseEntity<DashboardResponse.StoreManager> storeManagerDashboard() {
        return ResponseEntity.ok(dashboardService.storeManager());
    }

    @GetMapping("/me/dashboard")
    @ApiMessage("Tổng quan cá nhân")
    public ResponseEntity<DashboardResponse.Employee> myDashboard() {
        return ResponseEntity.ok(dashboardService.employee());
    }

    @GetMapping("/manager")
    @ApiMessage("Thống kê toàn chuỗi")
    public ResponseEntity<StatisticsResponse.Overview> manager(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer storeId) {
        return ResponseEntity.ok(service.managerOverview(from, to, storeId));
    }

    @GetMapping("/store-manager")
    @ApiMessage("Thống kê cửa hàng")
    public ResponseEntity<StatisticsResponse.Overview> storeManager(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer storeId) {
        return ResponseEntity.ok(service.storeManagerOverview(from, to, storeId));
    }

    @GetMapping("/store-manager/employee/{employeeId}/shifts")
    @ApiMessage("Lịch sử ca của nhân viên")
    public ResponseEntity<List<StatisticsResponse.ShiftRow>> employeeShifts(
            @PathVariable Integer employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer storeId) {
        return ResponseEntity.ok(service.employeeShifts(employeeId, from, to, storeId));
    }

    @GetMapping("/me")
    @ApiMessage("Thống kê cá nhân")
    public ResponseEntity<StatisticsResponse.Personal> me(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Integer storeId) {
        return ResponseEntity.ok(service.personal(from, to, storeId));
    }
}
