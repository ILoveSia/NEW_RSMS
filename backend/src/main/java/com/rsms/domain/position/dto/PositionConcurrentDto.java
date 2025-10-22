package com.rsms.domain.position.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 직책겸직 DTO
 * - position_concurrents 테이블 데이터 전송 객체
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionConcurrentDto {

    /**
     * 겸직ID
     */
    private Long positionConcurrentId;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책코드
     */
    private String positionsCd;

    /**
     * 겸직그룹코드 (G0001, G0002, ...)
     */
    private String concurrentGroupCd;

    /**
     * 직책명
     */
    private String positionsName;

    /**
     * 대표여부 (Y/N)
     */
    private String isRepresentative;

    /**
     * 본부코드
     */
    private String hqCode;

    /**
     * 본부명
     */
    private String hqName;

    /**
     * 사용여부 (Y/N)
     */
    private String isActive;

    /**
     * 등록자
     */
    private String createdBy;

    /**
     * 등록일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;
}
