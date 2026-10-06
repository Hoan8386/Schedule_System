package com.vn.schedule.service;

import com.vn.schedule.domain.BonusDetail;
import com.vn.schedule.repository.BonusDetailRepository;
import com.vn.schedule.util.ApiException;
import com.vn.schedule.dto.BonusDetailRequest;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BonusDetailService {
    private final BonusDetailRepository repository;
    public BonusDetailService(BonusDetailRepository repository) {
        this.repository = repository;
    }

    public List<BonusDetail> findAll() {
        return repository.findAll();
    }

    public BonusDetail findById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy bản ghi"));
    }

    @Transactional
    public BonusDetail create(BonusDetailRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public BonusDetail update(Integer id, BonusDetailRequest body) {
        BonusDetail current = findById(id);
        applyFields(current, body);
        return repository.save(current);
    }

    @Transactional
    public void delete(Integer id) {
        repository.delete(findById(id));
    }

    @Transactional
    public BonusDetail save(BonusDetailRequest body) {
        return repository.save(toEntity(body));
    }

    @Transactional
    public void deleteBody(BonusDetailRequest body) {
        repository.delete(toEntity(body));
    }
    private BonusDetail toEntity(BonusDetailRequest body) {
        BonusDetail entity = new BonusDetail();
        entity.setBonusDetailId((Integer) body.get("bonusDetailId"));
        entity.setBonusRecordId((Integer) body.get("bonusRecordId"));
        entity.setRuleId((Integer) body.get("ruleId"));
        entity.setType((String) body.get("type"));
        entity.setAmount((BigDecimal) body.get("amount"));
        entity.setReason((String) body.get("reason"));
        return entity;
    }

    private void applyFields(BonusDetail entity, BonusDetailRequest body) {
        entity.setBonusDetailId((Integer) body.get("bonusDetailId"));
        entity.setBonusRecordId((Integer) body.get("bonusRecordId"));
        entity.setRuleId((Integer) body.get("ruleId"));
        entity.setType((String) body.get("type"));
        entity.setAmount((BigDecimal) body.get("amount"));
        entity.setReason((String) body.get("reason"));
    }
}
