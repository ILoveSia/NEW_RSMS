package com.rsms.domain.approval.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * 결재 검색 요청 DTO
 *
 * @description 결재함 검색 시 필요한 조건
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalSearchRequest {

    /**
     * 업무구분코드
     */
    private String workTypeCd;

    /**
     * 결재상태코드
     */
    private String approvalStatusCd;

    /**
     * 검색 키워드 (제목, 기안자명)
     */
    private String keyword;

    /**
     * 검색 시작일
     */
    private LocalDate startDate;

    /**
     * 검색 종료일
     */
    private LocalDate endDate;
}
