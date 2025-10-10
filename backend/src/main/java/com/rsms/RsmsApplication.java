package com.rsms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * EMS (Entity Management System) Backend Application
 *
 * Java 21 + Spring Boot 3.3.5 기반 백엔드 애플리케이션
 *
 * @author EMS Team
 * @since 2025-09-05
 */
@SpringBootApplication
@EnableCaching        // 캐싱 활성화 (Ehcache → Redis 전환 가능)
@EnableScheduling     // 스케줄링 활성화 (세션 정리 등)
@EnableAsync          // 비동기 처리 활성화 (Virtual Threads 지원)
@EntityScan(basePackages = "com.rsms.domain")
@EnableJpaRepositories(basePackages = "com.rsms.domain")
public class RsmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(RsmsApplication.class, args);
    }

}