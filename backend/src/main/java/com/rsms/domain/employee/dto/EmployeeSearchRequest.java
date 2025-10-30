package com.rsms.domain.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 직원 검색 요청 DTO
 * - 직원 검색 시 사용하는 필터 조건
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSearchRequest {

    /**
     * 직원번호 (LIKE 검색)
     */
    private String empNo;

    /**
     * 직원명 (LIKE 검색)
     */
    private String empName;

    /**
     * 조직코드 (EQUAL 검색)
     */
    private String orgCode;

    /**
     * 재직상태 (EQUAL 검색)
     * - ACTIVE: 재직
     * - RESIGNED: 퇴사
     * - LEAVE: 휴직
     */
    private String employmentStatus;

    /**
     * 고용형태 (EQUAL 검색)
     * - REGULAR: 정규직
     * - CONTRACT: 계약직
     * - INTERN: 인턴
     * - PART_TIME: 파트타임
     */
    private String employmentType;

    /**
     * 직급 (EQUAL 검색)
     */
    private String jobGrade;

    /**
     * 활성화 여부 (EQUAL 검색)
     * - Y: 활성
     * - N: 비활성
     */
    private String isActive;
}
