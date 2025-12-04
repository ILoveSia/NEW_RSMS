package com.rsms.domain.auth.dto;

import lombok.*;

import java.util.List;

/**
 * 사용자 생성 요청 DTO
 * - UserMgmt에서 새 사용자 등록 시 사용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

    /**
     * 사용자 아이디 (로그인 ID)
     */
    private String username;

    /**
     * 초기 비밀번호 (BCrypt 해시 전)
     */
    private String password;

    /**
     * 직원번호 (employees FK, NULL 가능)
     */
    private String empNo;

    /**
     * 계정상태: ACTIVE, LOCKED, SUSPENDED, RESIGNED
     */
    private String accountStatus;

    /**
     * 관리자 여부 ('Y', 'N')
     */
    private String isAdmin;

    /**
     * 임원 여부 ('Y', 'N')
     */
    private String isExecutive;

    /**
     * 권한 레벨 (1~10)
     */
    private Integer authLevel;

    /**
     * 로그인 차단 여부 ('Y', 'N')
     */
    private String isLoginBlocked;

    /**
     * 타임존
     */
    private String timezone;

    /**
     * 언어
     */
    private String language;

    /**
     * 활성화 여부 ('Y', 'N')
     */
    private String isActive;

    /**
     * 할당할 역할 ID 목록
     */
    private List<Long> roleIds;
}
