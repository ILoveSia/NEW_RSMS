package com.rsms.domain.compliance.dto;

import com.rsms.domain.compliance.entity.ImplInspectionPlan;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 이행점검계획 DTO
 * - API 응답용 데이터 전송 객체
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImplInspectionPlanDto {

    // 기본 정보
    private String implInspectionPlanId;    // 이행점검ID
    private String ledgerOrderId;           // 원장차수ID
    private String implInspectionName;      // 이행점검명
    private String inspectionTypeCd;        // 점검유형코드
    private String inspectionTypeName;      // 점검유형명
    private LocalDate implInspectionStartDate;  // 이행점검시작일
    private LocalDate implInspectionEndDate;    // 이행점검종료일
    private String implInspectionStatusCd;  // 이행점검상태코드
    private String implInspectionStatusName;// 이행점검상태명
    private String remarks;                 // 비고

    // 상태 정보
    private String isActive;                // 사용여부

    // 감사 정보
    private LocalDateTime createdAt;        // 등록일시
    private String createdBy;               // 등록자
    private LocalDateTime updatedAt;        // 수정일시
    private String updatedBy;               // 수정자

    // 통계 정보 (선택)
    private Long totalItemCount;            // 전체 항목 수
    private Long completedItemCount;        // 완료 항목 수
    private Long inProgressItemCount;       // 진행중 항목 수

    /**
     * Entity → DTO 변환
     */
    public static ImplInspectionPlanDto from(ImplInspectionPlan entity) {
        return ImplInspectionPlanDto.builder()
                .implInspectionPlanId(entity.getImplInspectionPlanId())
                .ledgerOrderId(entity.getLedgerOrderId())
                .implInspectionName(entity.getImplInspectionName())
                .inspectionTypeCd(entity.getInspectionTypeCd())
                .inspectionTypeName(entity.getInspectionTypeName())
                .implInspectionStartDate(entity.getImplInspectionStartDate())
                .implInspectionEndDate(entity.getImplInspectionEndDate())
                .implInspectionStatusCd(entity.getImplInspectionStatusCd())
                .implInspectionStatusName(entity.getStatusName())
                .remarks(entity.getRemarks())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
