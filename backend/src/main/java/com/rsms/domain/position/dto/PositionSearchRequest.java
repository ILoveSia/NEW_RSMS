package com.rsms.domain.position.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 직책 검색 요청 DTO
 * - 직책 검색 조건을 담는 객체
 * - 키워드, 본부코드, 사용여부로 검색
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionSearchRequest {

    /**
     * 검색 키워드
     * - 직책명, 본부명, 직책코드 검색
     */
    private String keyword;

    /**
     * 본부코드 필터
     * - 특정 본부로 필터링
     */
    private String hqCode;

    /**
     * 사용여부 필터
     * - Y 또는 N으로 필터링
     */
    private String isActive;

    /**
     * 원장차수ID 필터
     * - 특정 원장차수로 필터링
     */
    private String ledgerOrderId;
}
