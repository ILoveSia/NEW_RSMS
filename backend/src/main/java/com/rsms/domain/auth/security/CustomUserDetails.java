package com.rsms.domain.auth.security;

import com.rsms.domain.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security UserDetails 구현체
 * - User 엔티티를 Spring Security 인증에 사용 가능한 형태로 변환
 * - 계정 상태, 잠금, 권한 등을 Spring Security와 연동
 *
 * @author RSMS Development Team
 * @since 1.0
 */
public class CustomUserDetails implements UserDetails {

    private final User user;
    private final List<String> roles;

    public CustomUserDetails(User user, List<String> roles) {
        this.user = user;
        this.roles = roles != null ? roles : Collections.emptyList();
    }

    /**
     * 권한 목록 반환
     * - 역할(Role) 기반으로 GrantedAuthority 생성
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
            .collect(Collectors.toList());
    }

    /**
     * 비밀번호 반환
     */
    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    /**
     * 사용자명(로그인 ID) 반환
     */
    @Override
    public String getUsername() {
        return user.getUsername();
    }

    /**
     * 계정 만료 여부
     * - RESIGNED(퇴직) 상태는 만료로 처리
     */
    @Override
    public boolean isAccountNonExpired() {
        return !"RESIGNED".equals(user.getAccountStatus());
    }

    /**
     * 계정 잠금 여부
     * - LOCKED 상태 또는 lockedUntil이 미래 시간인 경우 잠금
     */
    @Override
    public boolean isAccountNonLocked() {
        return !user.isLocked();
    }

    /**
     * 자격 증명(비밀번호) 만료 여부
     * - 현재는 항상 false (만료 안됨)
     * - TODO: 비밀번호 변경일 + N일 정책 추가 가능
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * 계정 활성화 여부
     * - isActive = 'Y', isDeleted = 'N', isLoginBlocked = 'N'
     */
    @Override
    public boolean isEnabled() {
        return user.canLogin();
    }

    // ===============================
    // 추가 메서드
    // ===============================

    /**
     * User 엔티티 반환
     */
    public User getUser() {
        return user;
    }

    /**
     * 사용자 ID 반환
     */
    public Long getUserId() {
        return user.getUserId();
    }

    /**
     * 직원번호 반환
     */
    public String getEmpNo() {
        return user.getEmpNo();
    }

    /**
     * 관리자 권한 확인
     */
    public boolean isAdmin() {
        return user.isAdminUser();
    }

    /**
     * 임원 권한 확인
     */
    public boolean isExecutive() {
        return user.isExecutiveUser();
    }

    /**
     * 권한 레벨 반환
     */
    public Integer getAuthLevel() {
        return user.getAuthLevel();
    }

    /**
     * 비밀번호 변경 필요 여부
     */
    public boolean needsPasswordChange() {
        return user.needsPasswordChange();
    }

    /**
     * 타임존 반환
     */
    public String getTimezone() {
        return user.getTimezone();
    }

    /**
     * 언어 반환
     */
    public String getLanguage() {
        return user.getLanguage();
    }

    /**
     * 역할 목록 반환
     */
    public List<String> getRoles() {
        return roles;
    }

    @Override
    public String toString() {
        return "CustomUserDetails{" +
            "username='" + user.getUsername() + '\'' +
            ", roles=" + roles +
            ", enabled=" + isEnabled() +
            ", accountNonLocked=" + isAccountNonLocked() +
            '}';
    }
}
