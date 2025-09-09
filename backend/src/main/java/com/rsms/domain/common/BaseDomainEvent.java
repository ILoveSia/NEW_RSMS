package com.rsms.domain.common;

import java.time.LocalDateTime;

/**
 * 도메인 이벤트 기본 구현체
 * 모든 도메인 이벤트가 공통으로 가져야 할 속성들을 제공
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
public abstract class BaseDomainEvent implements DomainEvent {
    
    private final LocalDateTime occurredOn;
    private final Long aggregateId;
    
    protected BaseDomainEvent(Long aggregateId) {
        this.aggregateId = aggregateId;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public LocalDateTime occurredOn() {
        return occurredOn;
    }
    
    @Override
    public Long aggregateId() {
        return aggregateId;
    }
    
    @Override
    public String eventType() {
        return this.getClass().getSimpleName();
    }
}