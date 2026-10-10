
package com.vn.schedule.dto.response;

import java.time.LocalDateTime;

public class ShiftAssignmentResponse {

    private Integer id;
    private Integer shiftByDateId;
    private Integer employeeId;
    private String status;
    private LocalDateTime registeredAt;
    private LocalDateTime approvedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private String note;

    public ShiftAssignmentResponse() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getShiftByDateId() {
        return shiftByDateId;
    }

    public void setShiftByDateId(Integer shiftByDateId) {
        this.shiftByDateId = shiftByDateId;
    }

    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
