package com.rsms.infrastructure.config;

import com.rsms.domain.auth.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 설정
 * - Database 기반 세션 관리
 * - CustomUserDetailsService 연동
 * - CORS 설정
 * - 권한 설정
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    /**
     * 보안 필터 체인 설정
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // SecurityContext를 세션에 저장하도록 명시적 설정
            .securityContext(securityContext -> securityContext
                .requireExplicitSave(false))  // SecurityContext를 자동으로 세션에 저장

            // 세션 설정 (Database 기반)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            )

            // 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 공개 API
                .requestMatchers("/", "/health", "/actuator/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()

                // 인증 API (로그인/로그아웃은 인증 불필요)
                .requestMatchers("/api/auth/login", "/api/auth/logout", "/api/auth/health").permitAll()

                // 시스템 관리 API (개발 단계에서 임시 허용 - 운영 환경에서는 인증 필요로 변경)
                .requestMatchers("/api/system/**").permitAll()

                // 관리자 API
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // 나머지 API는 인증 필요
                .requestMatchers("/api/**").authenticated()

                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )

            .build();
    }

    /**
     * 비밀번호 암호화
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * CORS 설정
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:4000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:4000",
            "http://127.0.0.1:5173"
        ));
        
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * 세션 쿠키 직렬화 설정
     * - 쿠키 기반 세션 관리로 브라우저 새로고침 시에도 세션 유지
     * - SameSite=Lax로 CSRF 보호
     */
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSIONID");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(false);  // 로컬 환경 (운영에서는 true)
        serializer.setSameSite("Lax");
        serializer.setCookiePath("/");
        serializer.setCookieMaxAge(1800);  // 30분
        return serializer;
    }

    /**
     * AuthenticationProvider 설정
     * - CustomUserDetailsService와 PasswordEncoder 연동
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * AuthenticationManager Bean
     * - 인증 처리를 위한 매니저
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}