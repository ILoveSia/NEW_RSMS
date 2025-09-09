package com.rsms.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA 설정
 * - JPA Auditing 활성화 (BaseEntity의 @CreatedDate, @LastModifiedDate 자동 처리)
 * - JPA Repository 스캔 설정
 */
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.rsms.domain.*.repository")
public class JpaConfig {
}