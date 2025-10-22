package com.rsms.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA 설정
 * - JPA Auditing 활성화 (BaseEntity의 @CreatedDate, @LastModifiedDate 자동 처리)
 * - JPA Repository 스캔 설정
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableJpaRepositories(basePackages = "com.rsms.domain")
public class JpaConfig {

    /**
     * JPA Auditing을 위한 현재 사용자 정보 제공자
     * - @CreatedBy, @LastModifiedBy 어노테이션에 자동으로 사용자 정보 입력
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
                // 인증되지 않은 경우 시스템 사용자로 처리
                return Optional.of("SYSTEM");
            }

            // 인증된 사용자명 반환
            return Optional.of(authentication.getName());
        };
    }
}