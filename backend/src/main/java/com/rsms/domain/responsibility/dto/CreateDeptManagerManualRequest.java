package com.rsms.domain.responsibility.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 부서장업무메뉴얼 생성 요청 DTO
 * - 메뉴얼코드(manualCd)는 서버에서 자동 생성되므로 요청 필드에 포함하지 않음
 * - 필수 필드: ledgerOrderId, obligationCd, orgCode, respItem, activityName
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDeptManagerManualRequest {
    // ===============================
    // 기본 정보 (필수)
    // ===============================

    /**
     * 원장차수ID (FK → ledger_order) (필수)
     * - 예시: "20250001"
     */
    private String ledgerOrderId;

    /**
     * 관리의무코드 (FK → management_obligations) (필수)
     * - 예시: "20250001M0002D0001O0001"
     */
    private String obligationCd;

    /**
     * 조직코드 (FK → organizations) (필수)
     * - 예시: "ORG001"
     */
    private String orgCode;

    // ===============================
    // 관리활동 기본정보 (필수)
    // ===============================

    /**
     * 책무관리항목 (필수)
     * - 최대 500자
     */
    private String respItem;

    /**
     * 관리활동명 (필수)
     * - 최대 200자
     */
    private String activityName;

    // ===============================
    // 수행 정보 (선택)
    // ===============================

    /**
     * 수행자ID (FK → users) (선택)
     */
    private String executorId;

    /**
     * 수행일자 (선택)
     */
    private LocalDate executionDate;

    /**
     * 수행상태 (선택, 기본값: "01" 미수행)
     * - 01: 미수행
     * - 02: 수행완료
     */
    private String executionStatus;

    /**
     * 수행결과코드 (선택)
     * - 01: 적정
     * - 02: 부적정
     */
    private String executionResultCd;

    /**
     * 수행결과내용 (선택)
     * - TEXT 타입
     */
    private String executionResultContent;

    // ===============================
    // 수행점검 정보 (선택)
    // ===============================

    /**
     * 점검항목 (선택)
     * - 최대 500자
     */
    private String execCheckMethod;

    /**
     * 점검세부내용 (선택)
     * - TEXT 타입
     */
    private String execCheckDetail;

    /**
     * 점검주기 (선택)
     * - 공통코드: FLFL_ISPC_FRCD
     */
    private String execCheckFrequencyCd;

    // ===============================
    // 상태 관리 (선택)
    // ===============================

    /**
     * 사용여부 (선택, 기본값: "Y")
     * - Y: 사용
     * - N: 미사용
     */
    private String isActive;

    /**
     * 상태 (선택, 기본값: "active")
     * - active: 활성
     * - inactive: 비활성
     */
    private String status;

    /**
     * 비고 (선택)
     * - TEXT 타입
     */
    private String remarks;

    // 참고: 메뉴얼코드(manualCd)는 서버에서 자동 생성되므로 요청 필드에 포함하지 않음
    // 참고: createdAt, createdBy, updatedAt, updatedBy는 서버에서 자동 설정됨
}
