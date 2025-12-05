package com.rsms.domain.auth.service;

import com.rsms.domain.auth.dto.*;
import com.rsms.domain.auth.entity.MenuItem;
import com.rsms.domain.auth.entity.MenuPermission;
import com.rsms.domain.auth.entity.Role;
import com.rsms.domain.auth.repository.MenuItemRepository;
import com.rsms.domain.auth.repository.MenuPermissionRepository;
import com.rsms.domain.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 메뉴 서비스
 * - LeftMenu용 메뉴 계층 구조 조회
 * - 메뉴 관리 기능
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuPermissionRepository menuPermissionRepository;
    private final RoleRepository roleRepository;

    /**
     * 메뉴 계층 구조 조회 (LeftMenu용)
     * - 활성화된 메뉴만 조회
     * - 계층 구조로 변환하여 반환
     *
     * @return 메뉴 계층 구조 목록
     */
    @Transactional(readOnly = true)
    public List<MenuItemDto> getMenuHierarchy() {
        log.debug("메뉴 계층 구조 조회 시작");

        // 1. 활성 메뉴 전체 조회
        List<MenuItem> allMenus = menuItemRepository.findAllActiveMenus();
        log.debug("활성 메뉴 조회 완료: {} 개", allMenus.size());

        // 2. Entity -> DTO 변환
        List<MenuItemDto> menuDtos = allMenus.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());

        // 3. 계층 구조 생성
        List<MenuItemDto> hierarchy = buildMenuHierarchy(menuDtos);
        log.debug("메뉴 계층 구조 생성 완료: 최상위 메뉴 {} 개", hierarchy.size());

        return hierarchy;
    }

    /**
     * 메뉴 계층 구조 생성
     * - parentId를 기준으로 부모-자식 관계 구성
     *
     * @param allMenus 전체 메뉴 목록
     * @return 계층 구조화된 메뉴 목록
     */
    private List<MenuItemDto> buildMenuHierarchy(List<MenuItemDto> allMenus) {
        // 1. menuId를 key로 하는 Map 생성 (빠른 조회)
        Map<Long, MenuItemDto> menuMap = allMenus.stream()
            .collect(Collectors.toMap(MenuItemDto::getMenuId, menu -> menu));

        // 2. 최상위 메뉴 목록
        List<MenuItemDto> rootMenus = new ArrayList<>();

        // 3. 각 메뉴를 순회하며 부모-자식 관계 설정
        for (MenuItemDto menu : allMenus) {
            if (menu.getParentId() == null) {
                // 최상위 메뉴 (parentId가 null)
                rootMenus.add(menu);
            } else {
                // 하위 메뉴 - 부모 메뉴를 찾아서 children에 추가
                MenuItemDto parent = menuMap.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(menu);
                }
            }
        }

        // 4. 각 레벨에서 sortOrder로 정렬
        sortMenusByOrder(rootMenus);

        return rootMenus;
    }

    /**
     * 메뉴 목록과 하위 메뉴들을 sortOrder로 정렬
     *
     * @param menus 정렬할 메뉴 목록
     */
    private void sortMenusByOrder(List<MenuItemDto> menus) {
        if (menus == null || menus.isEmpty()) {
            return;
        }

        // 현재 레벨 정렬
        menus.sort((m1, m2) -> {
            if (m1.getSortOrder() == null) return 1;
            if (m2.getSortOrder() == null) return -1;
            return m1.getSortOrder().compareTo(m2.getSortOrder());
        });

        // 하위 메뉴 재귀적으로 정렬
        for (MenuItemDto menu : menus) {
            if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
                sortMenusByOrder(menu.getChildren());
            }
        }
    }

    /**
     * Entity를 DTO로 변환
     * - Y/N 문자열을 Boolean으로 변환
     * - 날짜 필드는 문자열로 변환
     *
     * @param entity MenuItem 엔티티
     * @return MenuItemDto
     */
    private MenuItemDto convertToDto(MenuItem entity) {
        return MenuItemDto.builder()
            .menuId(entity.getMenuId())
            .menuCode(entity.getMenuCode())
            .menuName(entity.getMenuName())
            .description(entity.getDescription())
            .url(entity.getUrl())
            .parameters(entity.getParameters())
            .menuType(entity.getMenuType())
            .depth(entity.getDepth())
            .parentId(entity.getParentId())
            .sortOrder(entity.getSortOrder())
            .systemCode(entity.getSystemCode())
            .icon(entity.getIcon())
            .isActive("Y".equals(entity.getIsActive()))
            .requiresAuth("Y".equals(entity.getRequiresAuth()))
            .openInNewWindow("Y".equals(entity.getOpenInNewWindow()))
            .dashboardLayout("Y".equals(entity.getDashboardLayout()))
            .isTestPage("Y".equals(entity.getIsTestPage()))
            .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
            .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
            .createdBy(entity.getCreatedBy())
            .updatedBy(entity.getUpdatedBy())
            .children(null)  // 초기값 null, 계층 구조 생성 시 설정
            .build();
    }

    /**
     * 메뉴 코드로 단일 메뉴 조회
     *
     * @param menuCode 메뉴 코드
     * @return MenuItemDto
     */
    @Transactional(readOnly = true)
    public MenuItemDto getMenuByCode(String menuCode) {
        log.debug("메뉴 조회: menuCode={}", menuCode);

        return menuItemRepository.findByMenuCode(menuCode)
            .map(this::convertToDto)
            .orElse(null);
    }

    /**
     * 최상위 메뉴 목록 조회
     *
     * @return 최상위 메뉴 목록
     */
    @Transactional(readOnly = true)
    public List<MenuItemDto> getTopLevelMenus() {
        log.debug("최상위 메뉴 조회");

        return menuItemRepository.findActiveTopLevelMenus().stream()
            .map(this::convertToDto)
            .sorted((m1, m2) -> {
                if (m1.getSortOrder() == null) return 1;
                if (m2.getSortOrder() == null) return -1;
                return m1.getSortOrder().compareTo(m2.getSortOrder());
            })
            .collect(Collectors.toList());
    }

    /**
     * 특정 메뉴의 하위 메뉴 조회
     *
     * @param parentId 상위 메뉴 ID
     * @return 하위 메뉴 목록
     */
    @Transactional(readOnly = true)
    public List<MenuItemDto> getChildMenus(Long parentId) {
        log.debug("하위 메뉴 조회: parentId={}", parentId);

        return menuItemRepository.findActiveByParentId(parentId).stream()
            .map(this::convertToDto)
            .sorted((m1, m2) -> {
                if (m1.getSortOrder() == null) return 1;
                if (m2.getSortOrder() == null) return -1;
                return m1.getSortOrder().compareTo(m2.getSortOrder());
            })
            .collect(Collectors.toList());
    }

    /**
     * URL로 메뉴 조회
     *
     * @param url URL 경로
     * @return MenuItemDto
     */
    @Transactional(readOnly = true)
    public MenuItemDto getMenuByUrl(String url) {
        log.debug("URL로 메뉴 조회: url={}", url);

        return menuItemRepository.findByUrl(url)
            .map(this::convertToDto)
            .orElse(null);
    }

    /**
     * 메뉴명으로 검색
     *
     * @param menuName 검색할 메뉴명
     * @return 검색 결과 목록
     */
    @Transactional(readOnly = true)
    public List<MenuItemDto> searchMenus(String menuName) {
        log.debug("메뉴 검색: menuName={}", menuName);

        return menuItemRepository.searchByMenuName(menuName).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    // ===============================
    // 메뉴 CRUD 기능 (MenuMgmt용)
    // ===============================

    /**
     * 메뉴 단건 조회 (ID)
     *
     * @param menuId 메뉴 ID
     * @return MenuItemDto
     */
    @Transactional(readOnly = true)
    public MenuItemDto getMenuById(Long menuId) {
        log.debug("메뉴 조회: menuId={}", menuId);

        return menuItemRepository.findById(menuId)
            .filter(menu -> "N".equals(menu.getIsDeleted()))
            .map(this::convertToDto)
            .orElse(null);
    }

    /**
     * 전체 메뉴 목록 조회 (삭제되지 않은 것만)
     *
     * @return 전체 메뉴 목록
     */
    @Transactional(readOnly = true)
    public List<MenuItemDto> getAllMenus() {
        log.debug("전체 메뉴 목록 조회");

        return menuItemRepository.findAll().stream()
            .filter(menu -> "N".equals(menu.getIsDeleted()))
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 메뉴 생성
     *
     * @param request 생성 요청 DTO
     * @return 생성된 MenuItemDto
     */
    @Transactional
    public MenuItemDto createMenu(CreateMenuRequest request) {
        log.debug("메뉴 생성: request={}", request);

        // 메뉴 코드 중복 검사
        if (menuItemRepository.findByMenuCode(request.getMenuCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 메뉴 코드입니다: " + request.getMenuCode());
        }

        // 시스템 코드 중복 검사
        if (menuItemRepository.findBySystemCode(request.getSystemCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 시스템 코드입니다: " + request.getSystemCode());
        }

        MenuItem menu = MenuItem.builder()
            .menuCode(request.getMenuCode())
            .menuName(request.getMenuName())
            .description(request.getDescription())
            .url(request.getUrl())
            .parameters(request.getParameters())
            .menuType(request.getMenuType() != null ? request.getMenuType() : "page")
            .depth(request.getDepth() != null ? request.getDepth() : 1)
            .parentId(request.getParentId())
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .systemCode(request.getSystemCode())
            .icon(request.getIcon())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .isTestPage(request.getIsTestPage() != null ? request.getIsTestPage() : "N")
            .requiresAuth(request.getRequiresAuth() != null ? request.getRequiresAuth() : "Y")
            .openInNewWindow(request.getOpenInNewWindow() != null ? request.getOpenInNewWindow() : "N")
            .dashboardLayout(request.getDashboardLayout() != null ? request.getDashboardLayout() : "N")
            .createdBy("system")
            .updatedBy("system")
            .isDeleted("N")
            .build();

        MenuItem savedMenu = menuItemRepository.save(menu);
        log.info("메뉴 생성 완료: menuId={}", savedMenu.getMenuId());

        return convertToDto(savedMenu);
    }

    /**
     * 메뉴 수정
     *
     * @param menuId 메뉴 ID
     * @param request 수정 요청 DTO
     * @return 수정된 MenuItemDto
     */
    @Transactional
    public MenuItemDto updateMenu(Long menuId, UpdateMenuRequest request) {
        log.debug("메뉴 수정: menuId={}, request={}", menuId, request);

        MenuItem menu = menuItemRepository.findById(menuId)
            .filter(m -> "N".equals(m.getIsDeleted()))
            .orElseThrow(() -> new IllegalArgumentException("메뉴를 찾을 수 없습니다: " + menuId));

        // 필드 업데이트
        if (request.getMenuName() != null) {
            menu.setMenuName(request.getMenuName());
        }
        if (request.getDescription() != null) {
            menu.setDescription(request.getDescription());
        }
        if (request.getUrl() != null) {
            menu.setUrl(request.getUrl());
        }
        if (request.getParameters() != null) {
            menu.setParameters(request.getParameters());
        }
        if (request.getSortOrder() != null) {
            menu.setSortOrder(request.getSortOrder());
        }
        if (request.getSystemCode() != null) {
            menu.setSystemCode(request.getSystemCode());
        }
        if (request.getIcon() != null) {
            menu.setIcon(request.getIcon());
        }
        if (request.getIsActive() != null) {
            menu.setIsActive(request.getIsActive());
        }
        if (request.getIsTestPage() != null) {
            menu.setIsTestPage(request.getIsTestPage());
        }
        if (request.getRequiresAuth() != null) {
            menu.setRequiresAuth(request.getRequiresAuth());
        }
        if (request.getOpenInNewWindow() != null) {
            menu.setOpenInNewWindow(request.getOpenInNewWindow());
        }
        if (request.getDashboardLayout() != null) {
            menu.setDashboardLayout(request.getDashboardLayout());
        }
        menu.setUpdatedBy("system");

        MenuItem savedMenu = menuItemRepository.save(menu);
        log.info("메뉴 수정 완료: menuId={}", savedMenu.getMenuId());

        return convertToDto(savedMenu);
    }

    /**
     * 메뉴 삭제 (논리적 삭제)
     *
     * @param menuId 메뉴 ID
     */
    @Transactional
    public void deleteMenu(Long menuId) {
        log.debug("메뉴 삭제: menuId={}", menuId);

        MenuItem menu = menuItemRepository.findById(menuId)
            .filter(m -> "N".equals(m.getIsDeleted()))
            .orElseThrow(() -> new IllegalArgumentException("메뉴를 찾을 수 없습니다: " + menuId));

        // 하위 메뉴 존재 확인
        List<MenuItem> childMenus = menuItemRepository.findByParentId(menuId);
        if (!childMenus.isEmpty()) {
            throw new IllegalArgumentException("하위 메뉴가 있는 메뉴는 삭제할 수 없습니다.");
        }

        // 메뉴 권한도 함께 삭제
        menuPermissionRepository.softDeleteByMenuId(menuId, "system");

        // 메뉴 삭제
        menu.setIsDeleted("Y");
        menu.setUpdatedBy("system");
        menuItemRepository.save(menu);

        log.info("메뉴 삭제 완료: menuId={}", menuId);
    }

    // ===============================
    // 메뉴 권한 CRUD 기능 (MenuMgmt 오른쪽 그리드용)
    // ===============================

    /**
     * 메뉴별 권한 목록 조회
     * - MenuMgmt 오른쪽 그리드에 표시할 역할별 권한 정보
     *
     * @param menuId 메뉴 ID
     * @return 권한 목록
     */
    @Transactional(readOnly = true)
    public List<MenuPermissionDto> getMenuPermissions(Long menuId) {
        log.debug("메뉴 권한 목록 조회: menuId={}", menuId);

        List<MenuPermission> permissions = menuPermissionRepository.findByMenuId(menuId);

        return permissions.stream()
            .map(this::convertToMenuPermissionDto)
            .collect(Collectors.toList());
    }

    /**
     * 메뉴 권한 생성
     *
     * @param request 생성 요청 DTO
     * @return 생성된 MenuPermissionDto
     */
    @Transactional
    public MenuPermissionDto createMenuPermission(CreateMenuPermissionRequest request) {
        log.debug("메뉴 권한 생성: request={}", request);

        // 중복 검사
        if (menuPermissionRepository.existsByRoleIdAndMenuId(request.getRoleId(), request.getMenuId())) {
            throw new IllegalArgumentException("이미 존재하는 역할-메뉴 권한입니다.");
        }

        MenuPermission permission = MenuPermission.builder()
            .menuId(request.getMenuId())
            .roleId(request.getRoleId())
            .canView(request.getCanView() != null ? request.getCanView() : "N")
            .canCreate(request.getCanCreate() != null ? request.getCanCreate() : "N")
            .canUpdate(request.getCanUpdate() != null ? request.getCanUpdate() : "N")
            .canDelete(request.getCanDelete() != null ? request.getCanDelete() : "N")
            .canSelect(request.getCanSelect() != null ? request.getCanSelect() : "N")
            .assignedAt(LocalDateTime.now())
            .assignedBy("system")
            .createdBy("system")
            .updatedBy("system")
            .isDeleted("N")
            .build();

        MenuPermission savedPermission = menuPermissionRepository.save(permission);
        log.info("메뉴 권한 생성 완료: menuPermissionId={}", savedPermission.getMenuPermissionId());

        return convertToMenuPermissionDto(savedPermission);
    }

    /**
     * 메뉴 권한 수정
     *
     * @param menuPermissionId 메뉴 권한 ID
     * @param request 수정 요청 DTO
     * @return 수정된 MenuPermissionDto
     */
    @Transactional
    public MenuPermissionDto updateMenuPermission(Long menuPermissionId, UpdateMenuPermissionRequest request) {
        log.debug("메뉴 권한 수정: menuPermissionId={}, request={}", menuPermissionId, request);

        MenuPermission permission = menuPermissionRepository.findById(menuPermissionId)
            .filter(p -> "N".equals(p.getIsDeleted()))
            .orElseThrow(() -> new IllegalArgumentException("메뉴 권한을 찾을 수 없습니다: " + menuPermissionId));

        permission.updatePermissions(
            request.getCanView(),
            request.getCanCreate(),
            request.getCanUpdate(),
            request.getCanDelete(),
            request.getCanSelect(),
            "system"
        );

        MenuPermission savedPermission = menuPermissionRepository.save(permission);
        log.info("메뉴 권한 수정 완료: menuPermissionId={}", savedPermission.getMenuPermissionId());

        return convertToMenuPermissionDto(savedPermission);
    }

    /**
     * 메뉴 권한 삭제 (논리적 삭제)
     *
     * @param menuPermissionId 메뉴 권한 ID
     */
    @Transactional
    public void deleteMenuPermission(Long menuPermissionId) {
        log.debug("메뉴 권한 삭제: menuPermissionId={}", menuPermissionId);

        int deleted = menuPermissionRepository.softDeleteById(menuPermissionId, "system");
        if (deleted == 0) {
            throw new IllegalArgumentException("메뉴 권한을 찾을 수 없습니다: " + menuPermissionId);
        }

        log.info("메뉴 권한 삭제 완료: menuPermissionId={}", menuPermissionId);
    }

    /**
     * 메뉴 권한 복수 삭제 (논리적 삭제)
     *
     * @param menuPermissionIds 메뉴 권한 ID 목록
     */
    @Transactional
    public void deleteMenuPermissions(List<Long> menuPermissionIds) {
        log.debug("메뉴 권한 복수 삭제: ids={}", menuPermissionIds);

        for (Long id : menuPermissionIds) {
            menuPermissionRepository.softDeleteById(id, "system");
        }

        log.info("메뉴 권한 복수 삭제 완료: count={}", menuPermissionIds.size());
    }

    /**
     * MenuPermission Entity -> DTO 변환
     * - Role 정보를 함께 조회하여 포함
     */
    private MenuPermissionDto convertToMenuPermissionDto(MenuPermission entity) {
        // Role 정보 조회
        Optional<Role> roleOpt = roleRepository.findById(entity.getRoleId());
        String roleCode = "";
        String roleName = "";
        String roleCategory = "";

        if (roleOpt.isPresent()) {
            Role role = roleOpt.get();
            roleCode = role.getRoleCode();
            roleName = role.getRoleName();
            // 역할 카테고리: role_category 필드 직접 사용 (없으면 role_type 기반 결정)
            roleCategory = role.getRoleCategory() != null && !role.getRoleCategory().isEmpty()
                ? role.getRoleCategory()
                : determineRoleCategory(role.getRoleType());
        }

        return MenuPermissionDto.builder()
            .menuPermissionId(entity.getMenuPermissionId())
            .menuId(entity.getMenuId())
            .roleId(entity.getRoleId())
            .roleCode(roleCode)
            .roleName(roleName)
            .roleCategory(roleCategory)
            .canView("Y".equals(entity.getCanView()))
            .canCreate("Y".equals(entity.getCanCreate()))
            .canUpdate("Y".equals(entity.getCanUpdate()))
            .canDelete("Y".equals(entity.getCanDelete()))
            .canSelect("Y".equals(entity.getCanSelect()))
            .assignedBy(entity.getAssignedBy())
            .assignedAt(entity.getAssignedAt() != null
                ? entity.getAssignedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                : null)
            .build();
    }

    /**
     * 역할 타입에 따른 카테고리 결정
     */
    private String determineRoleCategory(String roleType) {
        if (roleType == null) return "사용자";

        switch (roleType) {
            case "CEO":
            case "C-LEVEL":
                return "최고관리자";
            case "ADMIN":
            case "MANAGER":
                return "관리자";
            default:
                return "사용자";
        }
    }
}
