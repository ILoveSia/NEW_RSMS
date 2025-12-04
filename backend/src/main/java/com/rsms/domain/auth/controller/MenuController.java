package com.rsms.domain.auth.controller;

import com.rsms.domain.auth.dto.*;
import com.rsms.domain.auth.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 메뉴 컨트롤러
 * - LeftMenu용 메뉴 조회 API
 * - 메뉴 관리 API
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@Slf4j
public class MenuController {

    private final MenuService menuService;

    /**
     * 메뉴 계층 구조 조회 (LeftMenu용)
     * GET /api/menus/hierarchy
     *
     * @return 메뉴 계층 구조
     */
    @GetMapping("/hierarchy")
    public ResponseEntity<Map<String, Object>> getMenuHierarchy() {
        log.debug("메뉴 계층 구조 조회 API 호출");

        List<MenuItemDto> menus = menuService.getMenuHierarchy();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("menus", menus);
        response.put("totalCount", menus.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 최상위 메뉴 목록 조회
     * GET /api/menus/top
     *
     * @return 최상위 메뉴 목록
     */
    @GetMapping("/top")
    public ResponseEntity<Map<String, Object>> getTopLevelMenus() {
        log.debug("최상위 메뉴 조회 API 호출");

        List<MenuItemDto> menus = menuService.getTopLevelMenus();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("menus", menus);
        response.put("totalCount", menus.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 특정 메뉴의 하위 메뉴 조회
     * GET /api/menus/{parentId}/children
     *
     * @param parentId 상위 메뉴 ID
     * @return 하위 메뉴 목록
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<Map<String, Object>> getChildMenus(@PathVariable Long parentId) {
        log.debug("하위 메뉴 조회 API 호출: parentId={}", parentId);

        List<MenuItemDto> menus = menuService.getChildMenus(parentId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("menus", menus);
        response.put("totalCount", menus.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 메뉴 코드로 단일 메뉴 조회
     * GET /api/menus/code/{menuCode}
     *
     * @param menuCode 메뉴 코드
     * @return 메뉴 정보
     */
    @GetMapping("/code/{menuCode}")
    public ResponseEntity<Map<String, Object>> getMenuByCode(@PathVariable String menuCode) {
        log.debug("메뉴 조회 API 호출: menuCode={}", menuCode);

        MenuItemDto menu = menuService.getMenuByCode(menuCode);

        Map<String, Object> response = new HashMap<>();
        if (menu != null) {
            response.put("success", true);
            response.put("menu", menu);
        } else {
            response.put("success", false);
            response.put("message", "메뉴를 찾을 수 없습니다");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * URL로 메뉴 조회
     * GET /api/menus/url
     *
     * @param url URL 경로 (쿼리 파라미터)
     * @return 메뉴 정보
     */
    @GetMapping("/url")
    public ResponseEntity<Map<String, Object>> getMenuByUrl(@RequestParam String url) {
        log.debug("URL로 메뉴 조회 API 호출: url={}", url);

        MenuItemDto menu = menuService.getMenuByUrl(url);

        Map<String, Object> response = new HashMap<>();
        if (menu != null) {
            response.put("success", true);
            response.put("menu", menu);
        } else {
            response.put("success", false);
            response.put("message", "메뉴를 찾을 수 없습니다");
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 메뉴명으로 검색
     * GET /api/menus/search
     *
     * @param menuName 검색할 메뉴명 (쿼리 파라미터)
     * @return 검색 결과 목록
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchMenus(@RequestParam String menuName) {
        log.debug("메뉴 검색 API 호출: menuName={}", menuName);

        List<MenuItemDto> menus = menuService.searchMenus(menuName);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("menus", menus);
        response.put("totalCount", menus.size());

        return ResponseEntity.ok(response);
    }

    /**
     * 헬스 체크
     * GET /api/menus/health
     *
     * @return 상태 정보
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "menu");
        return ResponseEntity.ok(response);
    }

    // ===============================
    // 메뉴 CRUD API (MenuMgmt용)
    // ===============================

    /**
     * 전체 메뉴 목록 조회
     * GET /api/menus
     *
     * @return 전체 메뉴 목록
     */
    @GetMapping
    public ResponseEntity<List<MenuItemDto>> getAllMenus() {
        log.debug("GET /api/menus - 전체 메뉴 목록 조회");
        List<MenuItemDto> menus = menuService.getAllMenus();
        return ResponseEntity.ok(menus);
    }

    /**
     * 메뉴 단건 조회
     * GET /api/menus/{menuId}
     *
     * @param menuId 메뉴 ID
     * @return 메뉴 정보
     */
    @GetMapping("/{menuId}")
    public ResponseEntity<MenuItemDto> getMenu(@PathVariable Long menuId) {
        log.debug("GET /api/menus/{} - 메뉴 단건 조회", menuId);
        MenuItemDto menu = menuService.getMenuById(menuId);
        if (menu == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(menu);
    }

    /**
     * 메뉴 생성
     * POST /api/menus
     *
     * @param request 생성 요청 DTO
     * @return 생성된 메뉴 정보
     */
    @PostMapping
    public ResponseEntity<MenuItemDto> createMenu(@RequestBody CreateMenuRequest request) {
        log.debug("POST /api/menus - 메뉴 생성 request: {}", request);
        MenuItemDto menu = menuService.createMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(menu);
    }

    /**
     * 메뉴 수정
     * PUT /api/menus/{menuId}
     *
     * @param menuId 메뉴 ID
     * @param request 수정 요청 DTO
     * @return 수정된 메뉴 정보
     */
    @PutMapping("/{menuId}")
    public ResponseEntity<MenuItemDto> updateMenu(
            @PathVariable Long menuId,
            @RequestBody UpdateMenuRequest request) {
        log.debug("PUT /api/menus/{} - 메뉴 수정 request: {}", menuId, request);
        MenuItemDto menu = menuService.updateMenu(menuId, request);
        return ResponseEntity.ok(menu);
    }

    /**
     * 메뉴 삭제
     * DELETE /api/menus/{menuId}
     *
     * @param menuId 메뉴 ID
     */
    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long menuId) {
        log.debug("DELETE /api/menus/{} - 메뉴 삭제", menuId);
        menuService.deleteMenu(menuId);
        return ResponseEntity.noContent().build();
    }

    // ===============================
    // 메뉴 권한 API (MenuMgmt 오른쪽 그리드용)
    // ===============================

    /**
     * 메뉴별 권한 목록 조회
     * GET /api/menus/{menuId}/permissions
     *
     * @param menuId 메뉴 ID
     * @return 권한 목록
     */
    @GetMapping("/{menuId}/permissions")
    public ResponseEntity<List<MenuPermissionDto>> getMenuPermissions(@PathVariable Long menuId) {
        log.debug("GET /api/menus/{}/permissions - 메뉴 권한 목록 조회", menuId);
        List<MenuPermissionDto> permissions = menuService.getMenuPermissions(menuId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * 메뉴 권한 생성
     * POST /api/menus/permissions
     *
     * @param request 생성 요청 DTO
     * @return 생성된 권한 정보
     */
    @PostMapping("/permissions")
    public ResponseEntity<MenuPermissionDto> createMenuPermission(@RequestBody CreateMenuPermissionRequest request) {
        log.debug("POST /api/menus/permissions - 메뉴 권한 생성 request: {}", request);
        MenuPermissionDto permission = menuService.createMenuPermission(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(permission);
    }

    /**
     * 메뉴 권한 수정
     * PUT /api/menus/permissions/{menuPermissionId}
     *
     * @param menuPermissionId 메뉴 권한 ID
     * @param request 수정 요청 DTO
     * @return 수정된 권한 정보
     */
    @PutMapping("/permissions/{menuPermissionId}")
    public ResponseEntity<MenuPermissionDto> updateMenuPermission(
            @PathVariable Long menuPermissionId,
            @RequestBody UpdateMenuPermissionRequest request) {
        log.debug("PUT /api/menus/permissions/{} - 메뉴 권한 수정 request: {}", menuPermissionId, request);
        MenuPermissionDto permission = menuService.updateMenuPermission(menuPermissionId, request);
        return ResponseEntity.ok(permission);
    }

    /**
     * 메뉴 권한 삭제
     * DELETE /api/menus/permissions/{menuPermissionId}
     *
     * @param menuPermissionId 메뉴 권한 ID
     */
    @DeleteMapping("/permissions/{menuPermissionId}")
    public ResponseEntity<Void> deleteMenuPermission(@PathVariable Long menuPermissionId) {
        log.debug("DELETE /api/menus/permissions/{} - 메뉴 권한 삭제", menuPermissionId);
        menuService.deleteMenuPermission(menuPermissionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 메뉴 권한 복수 삭제
     * DELETE /api/menus/permissions
     *
     * @param menuPermissionIds 메뉴 권한 ID 목록
     */
    @DeleteMapping("/permissions")
    public ResponseEntity<Void> deleteMenuPermissions(@RequestBody List<Long> menuPermissionIds) {
        log.debug("DELETE /api/menus/permissions - 메뉴 권한 복수 삭제 ids: {}", menuPermissionIds);
        menuService.deleteMenuPermissions(menuPermissionIds);
        return ResponseEntity.noContent().build();
    }
}
