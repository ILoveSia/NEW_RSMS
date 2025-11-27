package com.rsms.domain.compliance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 이행점검계획 생성 요청 DTO
 * - impl_inspection_plans 생성 + impl_inspection_items 일괄 생성
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateImplInspectionPlanRequest {

    /**
     * 원장차수ID (필수)
     */
    @NotBlank(message = "원장차수ID는 필수입니다")
    @Size(max = 8, message = "원장차수ID는 8자 이하입니다")
    private String ledgerOrderId;

    /**
     * 이행점검명 (필수)
     */
    @NotBlank(message = "이행점검명은 필수입니다")
    @Size(max = 200, message = "이행점검명은 200자 이하입니다")
    private String implInspectionName;

    /**
     * 점검유형코드 (01:정기점검, 02:특별점검)
     */
    @Size(max = 20, message = "점검유형코드는 20자 이하입니다")
    private String inspectionTypeCd;

    /**
     * 이행점검시작일 (필수)
     */
    @NotNull(message = "이행점검시작일은 필수입니다")
    private LocalDate implInspectionStartDate;

    /**
     * 이행점검종료일 (필수)
     */
    @NotNull(message = "이행점검종료일은 필수입니다")
    private LocalDate implInspectionEndDate;

    /**
     * 비고
     */
    private String remarks;

    /**
     * 선택된 부서장업무메뉴얼CD 목록 (점검항목 생성용)
     * - 체크박스로 선택된 manualCd 목록
     */
    @NotNull(message = "점검대상 항목을 선택해주세요")
    @Size(min = 1, message = "최소 1개 이상의 점검대상 항목을 선택해주세요")
    private List<String> manualCds;
}
