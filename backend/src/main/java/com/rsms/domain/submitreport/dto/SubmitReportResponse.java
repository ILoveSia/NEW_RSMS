package com.rsms.domain.submitreport.dto;

import com.rsms.domain.submitreport.entity.SubmitReport;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 제출보고서 응답 DTO
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReportResponse {

    /**
     * 보고서ID
     */
    private Long reportId;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 제출기관코드
     */
    private String submittingAgencyCd;

    /**
     * 제출기관명 (공통코드에서 조회)
     */
    private String submittingAgencyName;

    /**
     * 제출보고서구분코드
     */
    private String reportTypeCd;

    /**
     * 제출보고서구분명 (공통코드에서 조회)
     */
    private String reportTypeName;

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

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 생성일시
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

    /**
     * 첨부파일 개수
     */
    private Integer attachmentCount;

    /**
     * Entity -> DTO 변환 (기본)
     */
    public static SubmitReportResponse from(SubmitReport entity) {
        return SubmitReportResponse.builder()
                .reportId(entity.getReportId())
                .ledgerOrderId(entity.getLedgerOrderId())
                .submittingAgencyCd(entity.getSubmittingAgencyCd())
                .reportTypeCd(entity.getReportTypeCd())
                .subReportTitle(entity.getSubReportTitle())
                .targetExecutiveEmpNo(entity.getTargetExecutiveEmpNo())
                .targetExecutiveName(entity.getTargetExecutiveName())
                .positionId(entity.getPositionId())
                .positionName(entity.getPositionName())
                .submissionDate(entity.getSubmissionDate())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Entity -> DTO 변환 (코드명 포함)
     */
    public static SubmitReportResponse from(SubmitReport entity, String submittingAgencyName, String reportTypeName) {
        SubmitReportResponse response = from(entity);
        response.setSubmittingAgencyName(submittingAgencyName);
        response.setReportTypeName(reportTypeName);
        return response;
    }

    /**
     * Entity -> DTO 변환 (첨부파일 개수 포함)
     *
     * @param entity 제출보고서 엔티티
     * @param attachmentCount 첨부파일 개수
     * @return 응답 DTO
     */
    public static SubmitReportResponse from(SubmitReport entity, int attachmentCount) {
        SubmitReportResponse response = from(entity);
        response.setAttachmentCount(attachmentCount);
        return response;
    }
}
