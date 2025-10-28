package com.rsms.domain.auth.controller;

import com.rsms.domain.auth.dto.LoginRequest;
import com.rsms.domain.auth.dto.LoginResponse;
import com.rsms.domain.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

/**
 * 인증 컨트롤러
 * - 로그인, 로그아웃, 세션 관리 API
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * 로그인
     * POST /api/auth/login
     *
     * @param loginRequest 로그인 요청 정보
     * @param session HTTP 세션
     * @return LoginResponse 로그인 결과
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @RequestBody LoginRequest loginRequest,
        HttpSession session
    ) {
        log.info("로그인 API 호출: username={}", loginRequest.getUsername());

        LoginResponse response = authService.login(loginRequest);

        if (response.getSuccess()) {
            // 세션 ID를 응답에 포함 (선택적)
            response.setSessionId(session.getId());
            log.info("로그인 성공: username={}, sessionId={}", loginRequest.getUsername(), session.getId());
            return ResponseEntity.ok(response);
        } else {
            log.warn("로그인 실패: username={}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * 로그아웃
     * POST /api/auth/logout
     *
     * @param session HTTP 세션
     * @return 로그아웃 결과
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        log.info("로그아웃 API 호출");

        boolean success = authService.logout();

        // 세션 무효화
        if (session != null) {
            session.invalidate();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "로그아웃 성공" : "로그아웃 실패");

        return ResponseEntity.ok(response);
    }

    /**
     * 현재 로그인한 사용자 정보 조회
     * GET /api/auth/me
     *
     * @return 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        log.debug("현재 사용자 정보 조회 API 호출");

        LoginResponse.UserInfoDto userInfo = authService.getCurrentUser();

        Map<String, Object> response = new HashMap<>();

        if (userInfo != null) {
            response.put("success", true);
            response.put("userInfo", userInfo);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * 세션 유효성 확인
     * GET /api/auth/session
     *
     * @return 세션 유효 여부
     */
    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> checkSession() {
        log.debug("세션 확인 API 호출");

        boolean isValid = authService.isSessionValid();

        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("message", isValid ? "유효한 세션" : "세션 없음");

        return ResponseEntity.ok(response);
    }

    /**
     * 헬스 체크 (인증 불필요)
     * GET /api/auth/health
     *
     * @return 상태 정보
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "auth");
        return ResponseEntity.ok(response);
    }
}
