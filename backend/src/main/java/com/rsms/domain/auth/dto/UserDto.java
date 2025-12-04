package com.rsms.domain.auth.dto;

import lombok.*;

import java.util.List;

/**
 * 사용자 정보 DTO
 * - UserMgmt 화면에 표시할 사용자 정보
 * - employees 테이블과 조인하여 부서명, 직책명 포함
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    /**
     * 사용자 ID (PK)
     */
    private Long userId;

    /**
     * 사용자 아이디 (로그인 ID)
     */
    private String username;

    /**
     * 직원번호 (employees FK)
     */
    private String empNo;

    /**
     * 직원명 (employees 조인)
     */
    private String empName;

    /**
     * 영문명 (employees 조인)
     */
    private String empNameEn;

    /**
     * 소속조직코드 (employees 조인)
     */
    private String orgCode;

    /**
     * 소속조직명 (organizations 조인)
     */
    private String orgName;

    /**
     * 직책코드 (employees 조인)
     */
    private String positionCode;

    /**
     * 직책명 (positions 조인)
     */
    private String positionName;

    /**
     * 직급 (employees 조인)
     */
    private String jobGrade;

    /**
     * 이메일 (employees 조인)
     */
    private String email;

    /**
     * 계정상태: ACTIVE, LOCKED, SUSPENDED, RESIGNED
     */
    private String accountStatus;

    /**
     * 비밀번호 변경 필요 여부
     */
    private Boolean passwordChangeRequired;

    /**
     * 마지막 로그인 일시
     */
    private String lastLoginAt;

    /**
     * 연속 로그인 실패 횟수
     */
    private Integer failedLoginCount;

    /**
     * 관리자 여부
     */
    private Boolean isAdmin;

    /**
     * 임원 여부
     */
    private Boolean isExecutive;

    /**
     * 권한 레벨 (1~10)
     */
    private Integer authLevel;

    /**
     * 로그인 차단 여부
     */
    private Boolean isLoginBlocked;

    /**
     * 타임존
     */
    private String timezone;

    /**
     * 언어
     */
    private String language;

    /**
     * 활성화 여부
     */
    private Boolean isActive;

    /**
     * 할당된 역할 목록
     */
    private List<UserRoleDto> roles;

    /**
     * 역할 수
     */
    private Integer roleCount;

    /**
     * 생성일시
     */
    private String createdAt;

    /**
     * 수정일시
     */
    private String updatedAt;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 사용자 역할 정보 DTO (내부 클래스)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserRoleDto {
        private Long userRoleId;
        private Long roleId;
        private String roleCode;
        private String roleName;
        private String roleCategory;
        private String assignedAt;
        private String assignedBy;
        private Boolean isActive;
    }
}
