package com.rsms.domain.auth.controller;

import com.rsms.domain.auth.dto.MenuItemDto;
import com.rsms.domain.auth.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
}
