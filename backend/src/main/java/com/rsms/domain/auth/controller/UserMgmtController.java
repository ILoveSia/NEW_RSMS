package com.rsms.domain.auth.controller;

import com.rsms.domain.auth.dto.CreateUserRequest;
import com.rsms.domain.auth.dto.UpdateUserRequest;
import com.rsms.domain.auth.dto.UserDto;
import com.rsms.domain.auth.service.UserMgmtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 사용자 관리 Controller
 * - 사용자 CRUD API
 * - 역할 매핑 관리
 * - UserMgmt UI 백엔드
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class UserMgmtController {

    private final UserMgmtService userMgmtService;

    // ===============================
    // 사용자 CRUD
    // ===============================

    /**
     * 모든 사용자 조회
     * - GET /api/system/users
     * - employees 테이블과 조인하여 부서명, 직책명 포함
     */
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        log.debug("GET /api/system/users - 모든 사용자 조회");
        List<UserDto> users = userMgmtService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * 사용자 검색
     * - GET /api/system/users/search
     * - 사용자명 또는 직원번호로 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam(required = false, defaultValue = "") String keyword) {
        log.debug("GET /api/system/users/search - 사용자 검색 keyword: {}", keyword);
        List<UserDto> users = userMgmtService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }

    /**
     * 사용자 단건 조회
     * - GET /api/system/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long userId) {
        log.debug("GET /api/system/users/{} - 사용자 단건 조회", userId);
        UserDto user = userMgmtService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    /**
     * 사용자 생성
     * - POST /api/system/users
     * - 역할 할당 포함
     */
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        log.debug("POST /api/system/users - 사용자 생성 username: {}", request.getUsername());
        try {
            UserDto user = userMgmtService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (IllegalArgumentException e) {
            log.error("사용자 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자 수정
     * - PUT /api/system/users/{userId}
     * - 비밀번호 변경 및 역할 재할당 포함
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest request) {
        log.debug("PUT /api/system/users/{} - 사용자 수정", userId);
        try {
            UserDto user = userMgmtService.updateUser(userId, request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            log.error("사용자 수정 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 사용자 삭제 (논리적 삭제)
     * - DELETE /api/system/users/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        log.debug("DELETE /api/system/users/{} - 사용자 삭제", userId);
        try {
            userMgmtService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.error("사용자 삭제 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 사용자 복수 삭제
     * - DELETE /api/system/users
     */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> deleteUsers(@RequestBody List<Long> userIds) {
        log.debug("DELETE /api/system/users - 사용자 복수 삭제 userIds: {}", userIds);
        int successCount = 0;
        int failCount = 0;

        for (Long userId : userIds) {
            try {
                userMgmtService.deleteUser(userId);
                successCount++;
            } catch (IllegalArgumentException e) {
                log.warn("사용자 삭제 실패 userId: {} - {}", userId, e.getMessage());
                failCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
            "successCount", successCount,
            "failCount", failCount,
            "totalRequested", userIds.size()
        ));
    }

    // ===============================
    // 역할 관리
    // ===============================

    /**
     * 활성 역할 목록 조회 (드롭다운용)
     * - GET /api/system/users/roles
     * - 사용자 등록/수정 폼의 역할 선택용
     */
    @GetMapping("/roles")
    public ResponseEntity<List<UserDto.UserRoleDto>> getActiveRoles() {
        log.debug("GET /api/system/users/roles - 활성 역할 목록 조회");
        List<UserDto.UserRoleDto> roles = userMgmtService.getActiveRoles();
        return ResponseEntity.ok(roles);
    }
}
