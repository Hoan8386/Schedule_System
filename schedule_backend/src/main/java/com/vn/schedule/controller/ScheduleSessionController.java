package com.vn.schedule.controller;
import com.vn.schedule.domain.ScheduleSession;
import com.vn.schedule.dto.DtoMapper;
import com.vn.schedule.dto.request.ScheduleSessionRequest;
import com.vn.schedule.dto.response.ScheduleSessionResponse;
import com.vn.schedule.service.ScheduleModule03Service;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/schedule_session")
public class ScheduleSessionController {
    private final ScheduleModule03Service service;
    public ScheduleSessionController(ScheduleModule03Service service) { this.service = service; }
    @GetMapping public List<ScheduleSessionResponse> list() { return service.sessions().stream().map(this::response).toList(); }
    @GetMapping("/{id}") public ScheduleSessionResponse get(@PathVariable Integer id) { return response(service.session(id)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ScheduleSessionResponse create(@RequestBody ScheduleSessionRequest body) { return response(service.createSession(body)); }
    @PutMapping("/{id}") public ScheduleSessionResponse update(@PathVariable Integer id, @RequestBody ScheduleSessionRequest body) { return response(service.updateSession(id, body)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Integer id) { service.deleteSession(id); }
    private ScheduleSessionResponse response(ScheduleSession value) {
        Map<String,Object> result = DtoMapper.toMap(value);
        if (value.getScheduleRound() != null) { result.put("scheduleRoundId", value.getScheduleRound().getId()); result.put("roundName", value.getScheduleRound().getRoundName()); }
        if (value.getShiftGroup() != null) { result.put("shiftGroupId", value.getShiftGroup().getId()); result.put("shiftGroupName", value.getShiftGroup().getShiftGroupName()); }
        return new ScheduleSessionResponse(result);
    }
}
