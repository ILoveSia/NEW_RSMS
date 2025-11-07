package com.rsms.domain.responsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 책무기술서 생성/수정 요청 DTO
 * - 프론트엔드에서 전송하는 데이터 구조
 *
 * @author RSMS
 * @since 2025-11-07
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespStatementRequest {

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책ID
     */
    private Long positionId;

    /**
     * 임의 직책 정보
     */
    private ArbitraryPosition arbitraryPosition;

    /**
     * 주관회의체 목록
     */
    private List<MainCommittee> mainCommittees;

    /**
     * 책무개요
     */
    private String responsibilityOverview;

    /**
     * 책무배경
     */
    private String responsibilityBackground;

    /**
     * 책무배분일
     */
    private String responsibilityBackgroundDate;

    /**
     * 책무 목록
     */
    private List<ResponsibilityItem> responsibilities;

    /**
     * 관리의무 목록
     */
    private List<ManagementDuty> managementDuties;

    /**
     * 임의 직책 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArbitraryPosition {
        private String positionName;        // 임의직책명
        private String positionTitle;       // 직책타이틀
        private Boolean isDual;             // 겸직여부
        private String employeeName;        // 직원명
        private String employeeNo;          // 직원번호
        private String userId;              // 사용자ID (로그인자ID)
        private String currentPositionDate; // 현 직책 부여일
        private String dualPositionDetails; // 겸직사항
        private String responsibleDepts;    // 소관부점
    }

    /**
     * 주관회의체 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MainCommittee {
        private String id;              // ID (선택적)
        private String committeeName;   // 회의체명
        private String chairperson;     // 위원장
        private String frequency;       // 개최주기
        private String mainAgenda;      // 주요안건
    }

    /**
     * 책무 항목
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResponsibilityItem {
        private String id;                  // ID (선택적)
        private Integer seq;                // 순번
        private String responsibility;      // 책무
        private String responsibilityDetail; // 책무세부
        private String relatedBasis;        // 관련근거
    }

    /**
     * 관리의무 항목
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagementDuty {
        private String id;                   // ID (선택적)
        private Integer seq;                 // 순번
        private String managementDuty;       // 관리의무
        private String managementDutyDetail; // 관리의무세부
        private String relatedBasis;         // 관련근거
    }
}
