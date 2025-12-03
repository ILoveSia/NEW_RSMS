package com.rsms.domain.submitreport.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * 제출보고서 검색 요청 DTO
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReportSearchRequest {

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 제출기관코드
     */
    private String submittingAgencyCd;

    /**
     * 제출보고서구분코드
     */
    private String reportTypeCd;

    /**
     * 제출일(시작)
     */
    private LocalDate submissionDateFrom;

    /**
     * 제출일(종료)
     */
    private LocalDate submissionDateTo;
}
