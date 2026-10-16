package com.vn.schedule.controller;
import com.vn.schedule.domain.ScheduleRound;
import com.vn.schedule.dto.DtoMapper;
import com.vn.schedule.dto.request.ScheduleRoundRequest;
import com.vn.schedule.dto.response.ScheduleRoundResponse;
import com.vn.schedule.service.ScheduleModule03Service;
import com.vn.schedule.util.anotation.ApiMessage;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/schedule_round")
public class ScheduleRoundController {
    private final ScheduleModule03Service service;
    public ScheduleRoundController(ScheduleModule03Service service) { this.service = service; }
    @GetMapping @ApiMessage("Lấy danh sách đợt đăng ký")
    public List<ScheduleRoundResponse> list() { return service.rounds().stream().map(this::response).toList(); }
    @GetMapping("/{id}") public ScheduleRoundResponse get(@PathVariable Integer id) { return response(service.round(id)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ScheduleRoundResponse create(@RequestBody ScheduleRoundRequest body) { return response(service.createRound(body)); }
    @PutMapping("/{id}") public ScheduleRoundResponse update(@PathVariable Integer id, @RequestBody ScheduleRoundRequest body) { return response(service.updateRound(id, body)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Integer id) { service.deleteRound(id); }
    private ScheduleRoundResponse response(ScheduleRound value) {
        Map<String,Object> result = DtoMapper.toMap(value);
        if (value.getSchedulePeriod() != null) { result.put("schedulePeriodId", value.getSchedulePeriod().getId()); result.put("periodName", value.getSchedulePeriod().getPeriodName()); }
        if (value.getStore() != null) { result.put("storeId", value.getStore().getId()); result.put("storeName", value.getStore().getStoreName()); }
        return new ScheduleRoundResponse(result);
    }
}
