package com.rsms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * - Spring Security 인증에 사용되는 사용자 계정 정보
 * - employees 테이블과 1:1 관계 (emp_no FK)
 * - BCrypt 해시 (강도 12) 사용
 * - Serializable 구현: Spring Session에 세션 저장을 위해 필요
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Entity
@Table(name = "users", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 사용자ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    /**
     * 사용자 아이디 (로그인 ID)
     */
    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;

    /**
     * BCrypt 해시 (강도 12)
     */
    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    /**
     * 직원번호 (employees FK)
     */
    @Column(name = "emp_no", length = 20, nullable = false, unique = true)
    private String empNo;

    /**
     * 계정상태: ACTIVE(재직), LOCKED(잠김), SUSPENDED(정지), RESIGNED(퇴직)
     */
    @Column(name = "account_status", length = 20, nullable = false)
    private String accountStatus;

    /**
     * 비밀번호 변경 필요 여부 ('Y', 'N')
     */
    @Column(name = "password_change_required", length = 1, nullable = false)
    private String passwordChangeRequired;

    /**
     * 비밀번호 마지막 변경일시
     */
    @Column(name = "password_last_changed_at")
    private LocalDateTime passwordLastChangedAt;

    /**
     * 마지막 로그인 일시
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /**
     * 연속 로그인 실패 횟수 (5회 이상 시 계정 잠금)
     */
    @Column(name = "failed_login_count", nullable = false)
    private Integer failedLoginCount;

    /**
     * 계정 잠금 해제 일시 (NULL이면 잠금 아님)
     */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    /**
     * 관리자 여부 ('Y', 'N')
     */
    @Column(name = "is_admin", length = 1, nullable = false)
    private String isAdmin;

    /**
     * 임원 여부 ('Y', 'N')
     */
    @Column(name = "is_executive", length = 1, nullable = false)
    private String isExecutive;

    /**
     * 권한 레벨 (1~10, 높을수록 강력)
     */
    @Column(name = "auth_level", nullable = false)
    private Integer authLevel;

    /**
     * 로그인 차단 여부 ('Y', 'N')
     */
    @Column(name = "is_login_blocked", length = 1, nullable = false)
    private String isLoginBlocked;

    /**
     * 타임존 (기본값: Asia/Seoul)
     */
    @Column(name = "timezone", length = 50, nullable = false)
    private String timezone;

    /**
     * 언어 (ko, en)
     */
    @Column(name = "language", length = 10, nullable = false)
    private String language;

    /**
     * 활성화 여부 ('Y', 'N')
     */
    @Column(name = "is_active", length = 1, nullable = false)
    private String isActive;

    /**
     * 생성자
     */
    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    /**
     * 생성일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    @Column(name = "updated_by", length = 100, nullable = false)
    private String updatedBy;

    /**
     * 수정일시
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 삭제여부 ('Y', 'N')
     */
    @Column(name = "is_deleted", length = 1, nullable = false)
    private String isDeleted;

    // ===============================
    // 비즈니스 로직
    // ===============================

    /**
     * 로그인 실패 횟수 증가
     */
    public void incrementFailedLoginCount() {
        this.failedLoginCount = (this.failedLoginCount == null ? 0 : this.failedLoginCount) + 1;

        // 5회 이상 실패 시 30분 잠금
        if (this.failedLoginCount >= 5) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(30);
            this.accountStatus = "LOCKED";
        }
    }

    /**
     * 로그인 성공 처리
     */
    public void onLoginSuccess() {
        this.failedLoginCount = 0;
        this.lastLoginAt = LocalDateTime.now();

        // 잠금 해제
        if ("LOCKED".equals(this.accountStatus)) {
            this.accountStatus = "ACTIVE";
            this.lockedUntil = null;
        }
    }

    /**
     * 계정 잠금 여부 확인
     */
    public boolean isLocked() {
        if (this.lockedUntil == null) {
            return false;
        }

        // 잠금 시간이 지났으면 자동 해제
        if (LocalDateTime.now().isAfter(this.lockedUntil)) {
            this.accountStatus = "ACTIVE";
            this.lockedUntil = null;
            this.failedLoginCount = 0;
            return false;
        }

        return true;
    }

    /**
     * 로그인 가능 여부 확인
     */
    public boolean canLogin() {
        return "Y".equals(this.isActive)
            && "N".equals(this.isLoginBlocked)
            && "N".equals(this.isDeleted)
            && "ACTIVE".equals(this.accountStatus)
            && !isLocked();
    }

    /**
     * 관리자 권한 확인
     */
    public boolean isAdminUser() {
        return "Y".equals(this.isAdmin);
    }

    /**
     * 임원 권한 확인
     */
    public boolean isExecutiveUser() {
        return "Y".equals(this.isExecutive);
    }

    /**
     * 비밀번호 변경 필요 여부 확인
     */
    public boolean needsPasswordChange() {
        return "Y".equals(this.passwordChangeRequired);
    }

    /**
     * 비밀번호 변경
     */
    public void changePassword(String newPasswordHash, String updatedBy) {
        this.passwordHash = newPasswordHash;
        this.passwordLastChangedAt = LocalDateTime.now();
        this.passwordChangeRequired = "N";
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 계정 활성화
     */
    public void activate() {
        this.isActive = "Y";
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * 계정 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.accountStatus == null) {
            this.accountStatus = "ACTIVE";
        }
        if (this.passwordChangeRequired == null) {
            this.passwordChangeRequired = "Y";
        }
        if (this.failedLoginCount == null) {
            this.failedLoginCount = 0;
        }
        if (this.isAdmin == null) {
            this.isAdmin = "N";
        }
        if (this.isExecutive == null) {
            this.isExecutive = "N";
        }
        if (this.authLevel == null) {
            this.authLevel = 1;
        }
        if (this.isLoginBlocked == null) {
            this.isLoginBlocked = "N";
        }
        if (this.timezone == null) {
            this.timezone = "Asia/Seoul";
        }
        if (this.language == null) {
            this.language = "ko";
        }
        if (this.isActive == null) {
            this.isActive = "Y";
        }
        if (this.isDeleted == null) {
            this.isDeleted = "N";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
