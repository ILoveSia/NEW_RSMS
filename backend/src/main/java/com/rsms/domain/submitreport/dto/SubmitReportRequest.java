package com.rsms.domain.submitreport.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * 제출보고서 생성/수정 요청 DTO
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReportRequest {

    /**
     * 원장차수ID (필수)
     */
    private String ledgerOrderId;

    /**
     * 제출기관코드 (필수)
     */
    private String submittingAgencyCd;

    /**
     * 제출보고서구분코드 (필수)
     */
    private String reportTypeCd;

    /**
     * 제출보고서 제목
     */
    private String subReportTitle;

    /**
     * 제출 대상 임원 사번
     */
    private String targetExecutiveEmpNo;

    /**
     * 제출 대상 임원명
     */
    private String targetExecutiveName;

    /**
     * 임원 직책ID
     */
    private Long positionId;

    /**
     * 직책명
     */
    private String positionName;

    /**
     * 제출일
     */
    private LocalDate submissionDate;

    /**
     * 비고
     */
    private String remarks;
}
