package com.vn.schedule.controller;
import com.vn.schedule.domain.ShiftGroup;
import com.vn.schedule.dto.DtoMapper;
import com.vn.schedule.dto.request.ShiftGroupRequest;
import com.vn.schedule.dto.response.ShiftGroupResponse;
import com.vn.schedule.service.ScheduleModule03Service;
import com.vn.schedule.service.ShiftGroupMemberService;
import com.vn.schedule.service.ShiftRegistrationService;
import com.vn.schedule.util.anotation.ApiMessage;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/shift_group")
public class ShiftGroupController {
    private final ScheduleModule03Service service;
    private final ShiftGroupMemberService memberService;
    private final ShiftRegistrationService registrationService;
    public ShiftGroupController(ScheduleModule03Service service, ShiftGroupMemberService memberService,
                                ShiftRegistrationService registrationService) {
        this.service = service;
        this.memberService = memberService;
        this.registrationService = registrationService;
    }
    @GetMapping public List<ShiftGroupResponse> list() {
        Map<Integer, List<Integer>> members = memberService.memberIdsByGroup();
        return service.groups().stream().map(group -> {
            ShiftGroupResponse result = response(group);
            result.values().put("employeeIds", members.getOrDefault(group.getId(), List.of()));
            return result;
        }).toList();
    }
    /** Nhóm ca của nhân viên đang đăng nhập + ca mẫu + ca theo ngày đang mở (mặc định 60 ngày tới). */
    @GetMapping("/me") @ApiMessage("Lấy nhóm ca của tôi")
    public ShiftGroupMemberService.MyShiftGroups mine(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate to) {
        return memberService.myShiftGroups(from, to);
    }
    /** Đăng ký ca trên thời khóa biểu: body { "shiftId": 1, "workDate": "2026-11-05" }. Tự tạo ca theo ngày nếu chưa có. */
    @PostMapping("/me/register") @ApiMessage("Đăng ký ca")
    public ShiftGroupMemberService.OpenShift register(@RequestBody Map<String, String> body) {
        Integer shiftId;
        java.time.LocalDate workDate;
        try {
            shiftId = Integer.valueOf(body.get("shiftId"));
            workDate = java.time.LocalDate.parse(body.get("workDate"));
        } catch (RuntimeException ex) {
            throw new com.vn.schedule.util.ApiException(HttpStatus.BAD_REQUEST, "shiftId hoặc workDate không hợp lệ");
        }
        return registrationService.register(shiftId, workDate);
    }
    @GetMapping("/{id}") public ShiftGroupResponse get(@PathVariable Integer id) { return response(service.group(id)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ShiftGroupResponse create(@RequestBody ShiftGroupRequest body) { return response(service.createGroup(body)); }
    @PutMapping("/{id}") public ShiftGroupResponse update(@PathVariable Integer id, @RequestBody ShiftGroupRequest body) { return response(service.updateGroup(id, body)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Integer id) { service.deleteGroup(id); }

    /** Lưu danh sách thành viên (thay toàn bộ): body { "employeeIds": [1, 2, 3] }. */
    @PutMapping("/{id}/employees") @ApiMessage("Cập nhật nhân viên nhóm ca")
    public Map<String, List<Integer>> saveMembers(@PathVariable Integer id, @RequestBody Map<String, List<Integer>> body) {
        return Map.of("employeeIds", memberService.replaceMembers(id, body.get("employeeIds")));
    }
    private ShiftGroupResponse response(ShiftGroup value) {
        Map<String,Object> result = DtoMapper.toMap(value);
        if (value.getStore() != null) { result.put("storeId", value.getStore().getId()); result.put("storeName", value.getStore().getStoreName()); }
        return new ShiftGroupResponse(result);
    }
}
