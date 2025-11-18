package com.rsms.domain.responsibility.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 부서장업무메뉴얼 응답 DTO
 * - 부서장업무메뉴얼 조회 시 반환되는 데이터 구조
 * - 관계 테이블 정보 포함 (responsibilities, responsibility_details,
 * management_obligations, organizations)
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeptManagerManualDto {
    // ===============================
    // 기본 정보
    // ===============================

    /**
     * 메뉴얼코드 (PK, 업무 코드)
     * - 코드 생성 규칙: 관리의무코드 + "A" + 순번(4자리)
     * - 예시: "20250001M0002D0001O0001A0001"
     */
    private String manualCd;

    /**
     * 원장차수ID (FK → ledger_order)
     * - 예시: "20250001"
     */
    private String ledgerOrderId;

    /**
     * 관리의무코드 (FK → management_obligations)
     * - 예시: "20250001M0002D0001O0001"
     */
    private String obligationCd;

    /**
     * 조직코드 (FK → organizations)
     * - 예시: "ORG001"
     */
    private String orgCode;

    // ===============================
    // 관리활동 기본정보
    // ===============================

    /**
     * 책무관리항목
     * - 최대 500자
     */
    private String respItem;

    /**
     * 관리활동명
     * - 최대 200자
     */
    private String activityName;

    // ===============================
    // 수행 정보
    // ===============================

    /**
     * 수행자ID (FK → users)
     */
    private String executorId;

    /**
     * 수행일자
     */
    private LocalDate executionDate;

    /**
     * 수행상태
     * - 01: 미수행
     * - 02: 수행완료
     */
    private String executionStatus;

    /**
     * 수행상태명
     * - 코드명 조회 결과
     */
    private String executionStatusName;

    /**
     * 수행결과코드
     * - 01: 적정
     * - 02: 부적정
     */
    private String executionResultCd;

    /**
     * 수행결과명
     * - 코드명 조회 결과
     */
    private String executionResultName;

    /**
     * 수행결과내용
     * - TEXT 타입
     */
    private String executionResultContent;

    // ===============================
    // 수행점검 정보
    // ===============================

    /**
     * 점검항목 (수행점검항목)
     * - 최대 500자
     */
    private String execCheckMethod;

    /**
     * 점검세부내용 (수행점검세부내용)
     * - TEXT 타입
     */
    private String execCheckDetail;

    /**
     * 점검주기 (수행점검주기)
     * - 공통코드: FLFL_ISPC_FRCD
     */
    private String execCheckFrequencyCd;

    /**
     * 점검주기명
     * - 코드명 조회 결과
     */
    private String execCheckFrequencyName;

    // ===============================
    // 상태 관리
    // ===============================

    /**
     * 사용여부
     * - Y: 사용
     * - N: 미사용
     */
    private String isActive;

    /**
     * 상태
     * - active: 활성
     * - inactive: 비활성
     */
    private String status;

    // ===============================
    // 감사 필드
    // ===============================

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 승인일시
     */
    private LocalDateTime approvedAt;

    /**
     * 승인자
     */
    private String approvedBy;

    /**
     * 비고
     * - TEXT 타입
     */
    private String remarks;

    // ===============================
    // 관계 테이블 정보 (JOIN)
    // ===============================

    /**
     * 책무구분 (responsibilities.responsibility_cat)
     */
    private String responsibilityCat;

    /**
     * 책무 (responsibilities.responsibility_info)
     */
    private String responsibilityInfo;

    /**
     * 책무상세 (responsibility_details.responsibility_detail_info)
     */
    private String responsibilityDetailInfo;

    /**
     * 관리의무 (management_obligations.obligation_info)
     */
    private String obligationInfo;

    /**
     * 부점명 (organizations.org_name)
     */
    private String orgName;
}
