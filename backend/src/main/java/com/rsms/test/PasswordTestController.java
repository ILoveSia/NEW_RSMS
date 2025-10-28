package com.rsms.test;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 비밀번호 해시 테스트 컨트롤러 (개발 환경 전용)
 * - BCrypt 해시 생성 및 검증 테스트
 */
@Slf4j
@RestController
@RequestMapping("/test/password")
@RequiredArgsConstructor
public class PasswordTestController {

    private final PasswordEncoder passwordEncoder;

    /**
     * 비밀번호 해시 생성
     */
    @GetMapping("/encode")
    public Map<String, String> encodePassword(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        log.info("Password encoded: {}", password);

        Map<String, String> result = new HashMap<>();
        result.put("password", password);
        result.put("hash", hash);
        return result;
    }

    /**
     * 비밀번호 해시 검증
     */
    @GetMapping("/verify")
    public Map<String, Object> verifyPassword(
            @RequestParam String password,
            @RequestParam String hash) {

        boolean matches = passwordEncoder.matches(password, hash);
        log.info("Password verification: {} - matches: {}", password, matches);

        Map<String, Object> result = new HashMap<>();
        result.put("password", password);
        result.put("hash", hash);
        result.put("matches", matches);
        return result;
    }
}
