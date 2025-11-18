package com.rsms.domain.responsibility.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 부서장업무메뉴얼 수정 요청 DTO
 * - PK(manualCd), FK(ledgerOrderId, obligationCd, orgCode)는 수정 불가
 * - 수정 가능한 필드만 포함
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDeptManagerManualRequest {
    // ===============================
    // 관리활동 기본정보 (수정 가능)
    // ===============================

    /**
     * 책무관리항목 (수정 가능)
     * - 최대 500자
     */
    private String respItem;

    /**
     * 관리활동명 (수정 가능)
     * - 최대 200자
     */
    private String activityName;

    // ===============================
    // 수행 정보 (수정 가능)
    // ===============================

    /**
     * 수행자ID (수정 가능)
     */
    private String executorId;

    /**
     * 수행일자 (수정 가능)
     */
    private LocalDate executionDate;

    /**
     * 수행상태 (수정 가능)
     * - 01: 미수행
     * - 02: 수행완료
     */
    private String executionStatus;

    /**
     * 수행결과코드 (수정 가능)
     * - 01: 적정
     * - 02: 부적정
     */
    private String executionResultCd;

    /**
     * 수행결과내용 (수정 가능)
     * - TEXT 타입
     */
    private String executionResultContent;

    // ===============================
    // 수행점검 정보 (수정 가능)
    // ===============================

    /**
     * 점검항목 (수정 가능)
     * - 최대 500자
     */
    private String execCheckMethod;

    /**
     * 점검세부내용 (수정 가능)
     * - TEXT 타입
     */
    private String execCheckDetail;

    /**
     * 점검주기 (수정 가능)
     * - 공통코드: FLFL_ISPC_FRCD
     */
    private String execCheckFrequencyCd;

    // ===============================
    // 상태 관리 (수정 가능)
    // ===============================

    /**
     * 사용여부 (수정 가능)
     * - Y: 사용
     * - N: 미사용
     */
    private String isActive;

    /**
     * 상태 (수정 가능)
     * - active: 활성
     * - inactive: 비활성
     */
    private String status;

    /**
     * 비고 (수정 가능)
     * - TEXT 타입
     */
    private String remarks;

    // 참고: PK(manualCd), FK(ledgerOrderId, obligationCd, orgCode)는 수정 불가
    // 참고: updatedAt, updatedBy는 서버에서 자동 설정됨
}
