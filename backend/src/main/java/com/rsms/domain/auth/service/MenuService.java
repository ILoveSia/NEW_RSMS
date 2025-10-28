package com.rsms.domain.auth.service;

import com.rsms.domain.auth.dto.MenuItemDto;
import com.rsms.domain.auth.entity.MenuItem;
import com.rsms.domain.auth.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
}
