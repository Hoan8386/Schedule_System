package com.vn.shopping.controller;

import com.vn.shopping.dto.DtoMapper;

import com.vn.shopping.domain.SpecialEvent;
import com.vn.shopping.service.SpecialEventService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/special_event")
public class SpecialEventController {
    private final SpecialEventService service;
    public SpecialEventController(SpecialEventService service) { this.service = service; }
    @GetMapping public List<Map<String,Object>> list() { return DtoMapper.toList(service.findAll()); }
    @GetMapping("/{id}") public Map<String,Object> get(@PathVariable Integer id) { return DtoMapper.toMap(service.findById(id)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@RequestBody Map<String,Object> body) { return DtoMapper.toMap(service.create(body)); }
    @PutMapping("/{id}") public Map<String,Object> update(@PathVariable Integer id, @RequestBody Map<String,Object> body) { return DtoMapper.toMap(service.update(id, body)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Integer id) { service.delete(id); }
}

