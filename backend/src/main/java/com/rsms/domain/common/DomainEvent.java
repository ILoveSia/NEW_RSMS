package com.rsms.domain.common;

import java.time.LocalDateTime;

/**
 * 도메인 이벤트 기본 인터페이스
 * DDD 패턴에서 도메인 내 발생하는 중요한 사건들을 표현
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
public interface DomainEvent {
    
    /**
     * 이벤트 발생 시각
     */
    LocalDateTime occurredOn();
    
    /**
     * 이벤트 종류
     */
    String eventType();
    
    /**
     * 이벤트 발생한 Aggregate의 ID
     */
    Long aggregateId();
    
    /**
     * 이벤트 데이터 (JSON 형태로 직렬화 가능한 데이터)
     */
    Object eventData();
}