package com.rsms.domain.auth.service;

import com.rsms.domain.auth.dto.LoginRequest;
import com.rsms.domain.auth.dto.LoginResponse;
import com.rsms.domain.auth.entity.User;
import com.rsms.domain.auth.repository.UserRepository;
import com.rsms.domain.auth.security.CustomUserDetails;
import com.rsms.domain.auth.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 인증 서비스
 * - 로그인, 로그아웃, 세션 관리
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * 로그인 처리
     * - 사용자 인증 및 세션 생성
     *
     * @param loginRequest 로그인 요청 정보
     * @return LoginResponse 로그인 결과 및 사용자 정보
     */
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            log.info("로그인 시도: username={}", loginRequest.getUsername());

            // 1. 사용자 조회
            User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다"));

            // 2. 계정 잠금 확인
            if (user.isLocked()) {
                log.warn("계정 잠금: username={}, lockedUntil={}", user.getUsername(), user.getLockedUntil());
                throw new LockedException("계정이 잠겨있습니다. " + user.getLockedUntil() + " 까지 로그인할 수 없습니다");
            }

            // 3. Spring Security 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            // 4. SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 5. 로그인 성공 처리
            user.onLoginSuccess();
            userRepository.save(user);

            // 6. UserDetails에서 역할 정보 가져오기
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<String> roles = customUserDetailsService.getUserRoles(user.getUserId());

            // 7. 응답 생성
            log.info("로그인 성공: username={}, userId={}", user.getUsername(), user.getUserId());

            return LoginResponse.builder()
                .success(true)
                .message("로그인 성공")
                .userInfo(LoginResponse.UserInfoDto.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .empNo(user.getEmpNo())
                    .isAdmin("Y".equals(user.getIsAdmin()))
                    .isExecutive("Y".equals(user.getIsExecutive()))
                    .authLevel(user.getAuthLevel())
                    .roles(roles)
                    .needsPasswordChange("Y".equals(user.getPasswordChangeRequired()))
                    .timezone(user.getTimezone())
                    .language(user.getLanguage())
                    .build())
                .build();

        } catch (BadCredentialsException e) {
            log.warn("로그인 실패 - 잘못된 자격증명: username={}", loginRequest.getUsername());

            // 로그인 실패 횟수 증가
            userRepository.findByUsername(loginRequest.getUsername())
                .ifPresent(user -> {
                    user.incrementFailedLoginCount();
                    userRepository.save(user);
                });

            return LoginResponse.builder()
                .success(false)
                .message("아이디 또는 비밀번호가 일치하지 않습니다")
                .build();

        } catch (LockedException e) {
            log.warn("로그인 실패 - 계정 잠금: username={}", loginRequest.getUsername());
            return LoginResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();

        } catch (Exception e) {
            log.error("로그인 실패 - 예기치 않은 오류: username={}", loginRequest.getUsername(), e);
            return LoginResponse.builder()
                .success(false)
                .message("로그인 처리 중 오류가 발생했습니다")
                .build();
        }
    }

    /**
     * 로그아웃 처리
     * - SecurityContext 클리어
     *
     * @return 로그아웃 성공 여부
     */
    public boolean logout() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                String username = authentication.getName();
                log.info("로그아웃: username={}", username);
            }

            SecurityContextHolder.clearContext();
            return true;

        } catch (Exception e) {
            log.error("로그아웃 실패", e);
            return false;
        }
    }

    /**
     * 현재 로그인한 사용자 정보 조회
     *
     * @return UserInfoDto 사용자 정보 (로그인하지 않은 경우 null)
     */
    @Transactional(readOnly = true)
    public LoginResponse.UserInfoDto getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }

            if (authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                User user = userDetails.getUser();

                return LoginResponse.UserInfoDto.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .empNo(user.getEmpNo())
                    .isAdmin("Y".equals(user.getIsAdmin()))
                    .isExecutive("Y".equals(user.getIsExecutive()))
                    .authLevel(user.getAuthLevel())
                    .roles(userDetails.getRoles())
                    .needsPasswordChange("Y".equals(user.getPasswordChangeRequired()))
                    .timezone(user.getTimezone())
                    .language(user.getLanguage())
                    .build();
            }

            return null;

        } catch (Exception e) {
            log.error("현재 사용자 정보 조회 실패", e);
            return null;
        }
    }

    /**
     * 세션 유효성 확인
     *
     * @return 세션 유효 여부
     */
    public boolean isSessionValid() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return authentication != null && authentication.isAuthenticated();
        } catch (Exception e) {
            return false;
        }
    }
}
