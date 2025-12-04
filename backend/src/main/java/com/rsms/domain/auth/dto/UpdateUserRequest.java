package com.rsms.domain.auth.dto;

import lombok.*;

import java.util.List;

/**
 * 사용자 수정 요청 DTO
 * - UserMgmt에서 사용자 정보 수정 시 사용
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    /**
     * 사용자 아이디 (로그인 ID) - 수정 불가
     */
    private String username;

    /**
     * 새 비밀번호 (변경 시에만 사용, NULL이면 변경 안함)
     */
    private String newPassword;

    /**
     * 직원번호 (employees FK)
     */
    private String empNo;

    /**
     * 계정상태: ACTIVE, LOCKED, SUSPENDED, RESIGNED
     */
    private String accountStatus;

    /**
     * 비밀번호 변경 필요 여부 ('Y', 'N')
     */
    private String passwordChangeRequired;

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
     * 할당할 역할 ID 목록 (기존 역할 삭제 후 새로 할당)
     */
    private List<Long> roleIds;
}
