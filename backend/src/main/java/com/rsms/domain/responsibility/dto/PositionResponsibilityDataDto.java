package com.rsms.domain.responsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 직책 선택 시 조회되는 책무기술서 관련 전체 데이터 DTO
 * - 7개 필드를 한번에 조회하여 반환
 *
 * @author RSMS
 * @since 2025-10-29
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionResponsibilityDataDto {

    /**
     * 1. 겸직여부 (Y: 겸직, N: 전임)
     * - positions ⟷ position_concurrents 조인 후 is_representative 확인
     */
    private String isConcurrent;

    /**
     * 2. 현 직책 부여일
     * - resp_statement_execs.position_assigned_date
     */
    private LocalDate positionAssignedDate;

    /**
     * 3. 겸직사항
     * - resp_statement_execs.concurrent_position
     */
    private String concurrentPosition;

    /**
     * 4. 소관부점 (전부 한줄로 표시, 콤마 구분)
     * - positions_details ⟷ organizations 조인
     */
    private String departments;

    /**
     * 5. 주관회의체 (Grid)
     * - committee_details ⟷ committees
     */
    private List<CommitteeInfo> committees;

    /**
     * 6. 책무목록 (Grid)
     * - responsibilities
     */
    private List<ResponsibilityInfo> responsibilities;

    /**
     * 7. 관리의무 (Grid) - 책무의 관리의무 전부 표시
     * - responsibilities → responsibility_details → management_obligations
     */
    private List<ManagementObligationInfo> managementObligations;

    /**
     * 주관회의체 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CommitteeInfo {
        private Long committeesId;           // 회의체ID
        private String committeesTitle;      // 회의체명
        private String committeeFrequency;   // 개최주기
        private String resolutionMatters;    // 주요심의 의결사항
        private String committeesType;       // 위원장/위원 구분
    }

    /**
     * 책무 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResponsibilityInfo {
        private String responsibilityId;        // 책무코드 (PK, ID → Code로 변경)
        private String responsibilityCat;       // 책무카테고리
        private String responsibilityCd;        // 책무코드
        private String responsibilityInfo;      // 책무내용
        private String responsibilityDetailInfo; // 책무세부내용 (responsibility_details 테이블)
        private String responsibilityLegal;     // 책무관련근거
    }

    /**
     * 관리의무 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ManagementObligationInfo {
        private String managementObligationId;        // 관리의무코드 (PK, ID → Code로 변경)
        private String responsibilityId;              // 책무세부코드 (연관관계 표시용, ID → Code로 변경)
        private String obligationMajorCatCd;          // 관리의무 대분류
        private String obligationMiddleCatCd;         // 관리의무 중분류
        private String obligationCd;                  // 관리의무코드
        private String obligationInfo;                // 관리의무내용
        private String orgCode;                       // 조직코드
    }
}
