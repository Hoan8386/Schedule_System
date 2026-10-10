
package com.vn.schedule.controller;

import com.vn.schedule.domain.ShiftAssignment;
import com.vn.schedule.dto.request.ShiftAssignmentRequest;
import com.vn.schedule.dto.response.ShiftAssignmentResponse;
import com.vn.schedule.service.ShiftAssignmentService;
import com.vn.schedule.util.anotation.ApiMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shift_assignment")
public class ShiftAssignmentController {

    private final ShiftAssignmentService service;

    public ShiftAssignmentController(ShiftAssignmentService service) {
        this.service = service;
    }

    @GetMapping
    @ApiMessage("Lấy danh sách dữ liệu")
    public ResponseEntity<List<ShiftAssignmentResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @ApiMessage("Lấy thông tin chi tiết")
    public ResponseEntity<ShiftAssignmentResponse> get(@PathVariable Integer id) {
        ShiftAssignment entity = service.findById(id);
        return ResponseEntity.ok(toResponse(entity));
    }

    @PostMapping
    @ApiMessage("Tạo mới dữ liệu")
    public ResponseEntity<ShiftAssignmentResponse> create(
            @RequestBody ShiftAssignmentRequest body) {
        ShiftAssignment entity = service.create(body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(entity));
    }

    @PutMapping("/{id}")
    @ApiMessage("Cập nhật dữ liệu")
    public ResponseEntity<ShiftAssignmentResponse> update(
            @PathVariable Integer id,
            @RequestBody ShiftAssignmentRequest body) {
        ShiftAssignment entity = service.update(id, body);
        return ResponseEntity.ok(toResponse(entity));
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Xóa dữ liệu")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private ShiftAssignmentResponse toResponse(ShiftAssignment entity) {
        ShiftAssignmentResponse response = new ShiftAssignmentResponse();

        response.setId(entity.getId());

        if (entity.getShiftByDate() != null) {
            response.setShiftByDateId(entity.getShiftByDate().getId());
        }

        if (entity.getEmployee() != null) {
            response.setEmployeeId(entity.getEmployee().getId());
        }

        response.setStatus(entity.getStatus());
        response.setRegisteredAt(entity.getRegisteredAt());
        response.setApprovedAt(entity.getApprovedAt());
        response.setCancelledAt(entity.getCancelledAt());
        response.setCancellationReason(entity.getCancellationReason());
        response.setNote(entity.getNote());

        return response;
    }
}
