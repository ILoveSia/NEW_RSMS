package com.rsms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 로그인 요청 DTO
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * 사용자 아이디
     */
    private String username;

    /**
     * 비밀번호
     */
    private String password;

    /**
     * 자동 로그인 여부 (선택)
     */
    private Boolean rememberMe;
}
