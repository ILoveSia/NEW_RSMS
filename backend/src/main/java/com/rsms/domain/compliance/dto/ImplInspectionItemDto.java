package com.rsms.domain.compliance.dto;

import com.rsms.domain.compliance.entity.ImplInspectionItem;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 이행점검항목 DTO
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
public class ImplInspectionItemDto {

    // 기본 정보
    private String implInspectionItemId;    // 이행점검항목ID
    private String implInspectionPlanId;    // 이행점검ID
    private String manualCd;                // 부서장업무메뉴얼CD

    // 부서장업무메뉴얼 정보 (중첩 객체)
    private DeptManagerManualInfo deptManagerManual;

    // 이행점검계획 정보 (중첩 객체) - 점검자지정 페이지용
    private ImplInspectionPlanInfo implInspectionPlan;

    /**
     * 부서장업무메뉴얼 정보 중첩 객체
     * - 관리의무, 책무상세, 책무 정보 포함
     * - 수행정보 포함 (수행자명, 수행결과 등)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeptManagerManualInfo {
        private String manualCd;            // 부서장업무메뉴얼CD
        private String respItem;            // 책무관리항목
        private String activityName;        // 관리활동명
        private String orgCode;             // 조직코드
        private String orgName;             // 부서명 (조직 테이블에서 조회 필요)
        private String obligationCd;        // 관리의무코드
        private String obligationInfo;      // 관리의무내용 (management_obligations.obligation_info)
        private String execCheckFrequencyCd; // 수행점검주기 (점검주기)
        private String execCheckMethod;     // 수행점검항목 (이행점검방법)

        // 수행정보 (dept_manager_manuals 테이블)
        private String executorId;          // 수행자ID
        private String executorName;        // 수행자명 (employees.emp_name)
        private String executionDate;       // 수행일자
        private String executionStatus;     // 수행상태코드
        private String executionStatusName; // 수행상태명
        private String executionResultCd;   // 수행결과코드
        private String executionResultName; // 수행결과명
        private String executionResultContent; // 수행결과내용

        // 책무상세 정보
        private String responsibilityDetailCd;   // 책무상세코드
        private String responsibilityDetailInfo; // 책무상세내용 (responsibility_details.responsibility_detail_info)

        // 책무 정보
        private String responsibilityCd;    // 책무코드
        private String responsibilityInfo;  // 책무내용 (responsibilities.responsibility_info)
    }

    /**
     * 이행점검계획 정보 중첩 객체 - 점검자지정 페이지용
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImplInspectionPlanInfo {
        private String implInspectionPlanId;    // 이행점검계획ID
        private String ledgerOrderId;           // 원장차수ID
        private String implInspectionName;      // 이행점검명
        private String inspectionTypeCd;        // 점검유형코드
        private String implInspectionStartDate; // 점검시작일
        private String implInspectionEndDate;   // 점검종료일
    }

    // 1단계: 점검 정보
    private String inspectorId;             // 점검자ID
    private String inspectorName;           // 점검자명
    private String inspectionStatusCd;      // 점검결과상태코드
    private String inspectionStatusName;    // 점검결과상태명
    private String inspectionResultContent; // 점검결과내용
    private LocalDate inspectionDate;       // 점검일자

    // 2단계: 개선이행 정보
    private String improvementStatusCd;     // 개선이행상태코드
    private String improvementStatusName;   // 개선이행상태명
    private String improvementManagerId;    // 개선담당자ID
    private String improvementManagerName;  // 개선담당자명
    private String improvementPlanContent;  // 개선계획내용
    private LocalDate improvementPlanDate;  // 개선계획수립일자
    private String improvementDetailContent;// 개선이행세부내용
    private LocalDate improvementCompletedDate; // 개선완료일자

    // 3단계: 최종점검 정보
    private String finalInspectionResultCd; // 최종점검결과코드
    private String finalInspectionResultName;// 최종점검결과명
    private String finalInspectionResultContent; // 최종점검결과내용
    private LocalDate finalInspectionDate;  // 최종점검일자

    // 부가 정보
    private Integer rejectionCount;         // 반려 횟수
    private Boolean isFinalCompleted;       // 최종 완료 여부

    // 상태 정보
    private String isActive;                // 사용여부

    // 감사 정보
    private LocalDateTime createdAt;        // 등록일시
    private String createdBy;               // 등록자
    private LocalDateTime updatedAt;        // 수정일시
    private String updatedBy;               // 수정자

    /**
     * Entity → DTO 변환
     */
    public static ImplInspectionItemDto from(ImplInspectionItem entity) {
        ImplInspectionItemDto dto = ImplInspectionItemDto.builder()
                .implInspectionItemId(entity.getImplInspectionItemId())
                .implInspectionPlanId(entity.getImplInspectionPlanId())
                .manualCd(entity.getManualCd())
                .inspectorId(entity.getInspectorId())
                .inspectorName(entity.getInspectorName())  // 점검자명 (Transient 필드)
                .inspectionStatusCd(entity.getInspectionStatusCd())
                .inspectionStatusName(entity.getInspectionStatusName())
                .inspectionResultContent(entity.getInspectionResultContent())
                .inspectionDate(entity.getInspectionDate())
                .improvementStatusCd(entity.getImprovementStatusCd())
                .improvementStatusName(entity.getImprovementStatusName())
                .improvementManagerId(entity.getImprovementManagerId())
                .improvementPlanContent(entity.getImprovementPlanContent())
                .improvementPlanDate(entity.getImprovementPlanDate())
                .improvementDetailContent(entity.getImprovementDetailContent())
                .improvementCompletedDate(entity.getImprovementCompletedDate())
                .finalInspectionResultCd(entity.getFinalInspectionResultCd())
                .finalInspectionResultContent(entity.getFinalInspectionResultContent())
                .finalInspectionDate(entity.getFinalInspectionDate())
                .rejectionCount(entity.getRejectionCount())
                .isFinalCompleted(entity.isFinalCompleted())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();

        // 부서장업무메뉴얼 정보 추가 (중첩 객체로 설정)
        // 책무/책무상세/관리의무 정보 포함
        if (entity.getDeptManagerManual() != null) {
            var manual = entity.getDeptManagerManual();

            // 조직명 조회 (organization 연관 엔티티에서 가져옴)
            String orgName = manual.getOrgCode();  // 기본값: orgCode
            if (manual.getOrganization() != null) {
                orgName = manual.getOrganization().getOrgName();
            }

            // 관리의무 정보 조회 (managementObligation → responsibilityDetail → responsibility)
            String obligationInfo = null;
            String responsibilityDetailCd = null;
            String responsibilityDetailInfo = null;
            String responsibilityCd = null;
            String responsibilityInfo = null;

            if (manual.getManagementObligation() != null) {
                var obligation = manual.getManagementObligation();
                obligationInfo = obligation.getObligationInfo();

                if (obligation.getResponsibilityDetail() != null) {
                    var detail = obligation.getResponsibilityDetail();
                    responsibilityDetailCd = detail.getResponsibilityDetailCd();
                    responsibilityDetailInfo = detail.getResponsibilityDetailInfo();

                    if (detail.getResponsibility() != null) {
                        var resp = detail.getResponsibility();
                        responsibilityCd = resp.getResponsibilityCd();
                        responsibilityInfo = resp.getResponsibilityInfo();
                    }
                }
            }

            DeptManagerManualInfo manualInfo = DeptManagerManualInfo.builder()
                    .manualCd(manual.getManualCd())
                    .respItem(manual.getRespItem())
                    .activityName(manual.getActivityName())
                    .orgCode(manual.getOrgCode())
                    .orgName(orgName)
                    .obligationCd(manual.getObligationCd())
                    .obligationInfo(obligationInfo)
                    .execCheckFrequencyCd(manual.getExecCheckFrequencyCd())
                    .execCheckMethod(manual.getExecCheckMethod())
                    // 수행정보 (dept_manager_manuals 테이블)
                    .executorId(manual.getExecutorId())
                    .executorName(manual.getExecutorName())
                    .executionDate(manual.getExecutionDate() != null ? manual.getExecutionDate().toString() : null)
                    .executionStatus(manual.getExecutionStatus())
                    .executionStatusName(manual.getExecutionStatusName())
                    .executionResultCd(manual.getExecutionResultCd())
                    .executionResultName(manual.getExecutionResultName())
                    .executionResultContent(manual.getExecutionResultContent())
                    // 책무 정보
                    .responsibilityDetailCd(responsibilityDetailCd)
                    .responsibilityDetailInfo(responsibilityDetailInfo)
                    .responsibilityCd(responsibilityCd)
                    .responsibilityInfo(responsibilityInfo)
                    .build();
            dto.setDeptManagerManual(manualInfo);
        }

        // 이행점검계획 정보 추가 (점검자지정 페이지용)
        if (entity.getImplInspectionPlan() != null) {
            var plan = entity.getImplInspectionPlan();
            ImplInspectionPlanInfo planInfo = ImplInspectionPlanInfo.builder()
                    .implInspectionPlanId(plan.getImplInspectionPlanId())
                    .ledgerOrderId(plan.getLedgerOrderId())
                    .implInspectionName(plan.getImplInspectionName())
                    .inspectionTypeCd(plan.getInspectionTypeCd())
                    // LocalDate → String 변환 (null-safe)
                    .implInspectionStartDate(plan.getImplInspectionStartDate() != null
                            ? plan.getImplInspectionStartDate().toString() : null)
                    .implInspectionEndDate(plan.getImplInspectionEndDate() != null
                            ? plan.getImplInspectionEndDate().toString() : null)
                    .build();
            dto.setImplInspectionPlan(planInfo);
        }

        return dto;
    }
}
