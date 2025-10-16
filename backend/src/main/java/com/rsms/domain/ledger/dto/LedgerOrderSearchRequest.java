package com.rsms.domain.ledger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 원장차수 검색 요청 DTO
 *
 * @description 원장차수 검색 시 사용하는 요청 객체
 * @author Claude AI
 * @since 2025-10-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerOrderSearchRequest {

    /**
     * 검색 키워드 (원장차수ID, 제목, 비고 검색)
     */
    private String keyword;

    /**
     * 원장상태 (NEW, PROG, CLSD)
     */
    private String ledgerOrderStatus;

    /**
     * 년도 (YYYY)
     */
    private String year;
}
