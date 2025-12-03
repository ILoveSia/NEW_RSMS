package com.rsms.domain.compliance.dto;

import lombok.*;

import java.util.List;

/**
 * 임원이행점검보고서 DTO
 * - 집계현황, 책무별/관리의무별/관리활동별 점검현황 데이터
 *
 * @author Claude AI
 * @since 2025-12-03
 */
public class ExecutiveReportDto {

    /**
     * 임원이행점검보고서 전체 응답 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutiveReportResponse {
        /** 집계 현황 */
        private SummaryStats summary;

        /** 책무별 점검 현황 */
        private List<ResponsibilityInspection> responsibilityInspections;

        /** 관리의무별 점검 현황 */
        private List<ObligationInspection> obligationInspections;

        /** 관리활동별 점검 현황 */
        private List<ActivityInspection> activityInspections;
    }

    /**
     * 집계 현황 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryStats {
        /** 총 책무 수 */
        private int totalResponsibilities;

        /** 총 관리의무 수 */
        private int totalObligations;

        /** 총 관리활동 수 */
        private int totalActivities;

        /** 이행점검결과 - 적정 건수 */
        private int appropriateCount;

        /** 이행점검결과 - 부적정 건수 */
        private int inappropriateCount;

        /** 개선조치 - 완료 건수 */
        private int improvementCompletedCount;

        /** 개선조치 - 진행중 건수 */
        private int improvementInProgressCount;
    }

    /**
     * 책무별 점검 현황 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResponsibilityInspection {
        /** 책무코드 */
        private String responsibilityCd;

        /** 책무명 */
        private String responsibilityInfo;

        /** 점검결과 (적정/부적정/미점검) */
        private String inspectionResult;

        /** 총 관리의무 수 */
        private int totalObligations;

        /** 총 관리활동 수 */
        private int totalActivities;

        /** 적정 건수 */
        private int appropriateCount;

        /** 부적정 건수 */
        private int inappropriateCount;
    }

    /**
     * 관리의무별 점검 현황 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ObligationInspection {
        /** 관리의무코드 */
        private String obligationCd;

        /** 관리의무내용 */
        private String obligationInfo;

        /** 책무코드 */
        private String responsibilityCd;

        /** 책무명 */
        private String responsibilityInfo;

        /** 점검결과 (적정/부적정/미점검) */
        private String inspectionResult;

        /** 총 관리활동 수 */
        private int totalActivities;

        /** 적정 건수 */
        private int appropriateCount;

        /** 부적정 건수 */
        private int inappropriateCount;
    }

    /**
     * 관리활동별 점검 현황 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityInspection {
        /** 이행점검항목ID */
        private String implInspectionItemId;

        /** 부서장업무메뉴얼CD */
        private String manualCd;

        /** 관리활동명 */
        private String activityName;

        /** 책무관리항목 */
        private String respItem;

        /** 관리의무코드 */
        private String obligationCd;

        /** 관리의무내용 */
        private String obligationInfo;

        /** 책무코드 */
        private String responsibilityCd;

        /** 책무명 */
        private String responsibilityInfo;

        /** 점검결과상태코드 (01:미점검, 02:적정, 03:부적정) */
        private String inspectionStatusCd;

        /** 점검결과명 */
        private String inspectionStatusName;

        /** 개선이행상태코드 */
        private String improvementStatusCd;

        /** 개선이행상태명 */
        private String improvementStatusName;

        /** 부서코드 */
        private String orgCode;

        /** 부서명 */
        private String orgName;
    }
}
