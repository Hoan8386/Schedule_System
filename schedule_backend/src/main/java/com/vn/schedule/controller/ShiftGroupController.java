package com.vn.schedule.controller;
import com.vn.schedule.domain.ShiftGroup;
import com.vn.schedule.dto.DtoMapper;
import com.vn.schedule.dto.request.ShiftGroupRequest;
import com.vn.schedule.dto.response.ShiftGroupResponse;
import com.vn.schedule.service.ScheduleModule03Service;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/shift_group")
public class ShiftGroupController {
    private final ScheduleModule03Service service;
    public ShiftGroupController(ScheduleModule03Service service) { this.service = service; }
    @GetMapping public List<ShiftGroupResponse> list() { return service.groups().stream().map(this::response).toList(); }
    @GetMapping("/{id}") public ShiftGroupResponse get(@PathVariable Integer id) { return response(service.group(id)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ShiftGroupResponse create(@RequestBody ShiftGroupRequest body) { return response(service.createGroup(body)); }
    @PutMapping("/{id}") public ShiftGroupResponse update(@PathVariable Integer id, @RequestBody ShiftGroupRequest body) { return response(service.updateGroup(id, body)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Integer id) { service.deleteGroup(id); }
    private ShiftGroupResponse response(ShiftGroup value) {
        Map<String,Object> result = DtoMapper.toMap(value);
        if (value.getStore() != null) { result.put("storeId", value.getStore().getId()); result.put("storeName", value.getStore().getStoreName()); }
        return new ShiftGroupResponse(result);
    }
}
