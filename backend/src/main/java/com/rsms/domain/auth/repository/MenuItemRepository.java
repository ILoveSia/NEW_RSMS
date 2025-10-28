package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 메뉴 아이템 Repository
 * - 시스템 메뉴 구조 관리를 위한 데이터 접근 계층
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /**
     * 메뉴 코드로 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.menuCode = :menuCode AND m.isDeleted = 'N'")
    Optional<MenuItem> findByMenuCode(@Param("menuCode") String menuCode);

    /**
     * 시스템 코드로 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.systemCode = :systemCode AND m.isDeleted = 'N'")
    Optional<MenuItem> findBySystemCode(@Param("systemCode") String systemCode);

    /**
     * 활성 메뉴 전체 조회 (정렬순서대로)
     */
    @Query("SELECT m FROM MenuItem m WHERE m.isActive = 'Y' AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findAllActiveMenus();

    /**
     * 최상위 메뉴 조회 (depth = 1, parentId = null)
     */
    @Query("SELECT m FROM MenuItem m WHERE m.depth = 1 AND m.parentId IS NULL AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findAllTopLevelMenus();

    /**
     * 활성 최상위 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.depth = 1 AND m.parentId IS NULL AND m.isActive = 'Y' AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findActiveTopLevelMenus();

    /**
     * 상위 메뉴 ID로 하위 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.parentId = :parentId AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findByParentId(@Param("parentId") Long parentId);

    /**
     * 상위 메뉴 ID로 활성 하위 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.parentId = :parentId AND m.isActive = 'Y' AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findActiveByParentId(@Param("parentId") Long parentId);

    /**
     * 메뉴 타입별 조회 (folder/page)
     */
    @Query("SELECT m FROM MenuItem m WHERE m.menuType = :menuType AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findByMenuType(@Param("menuType") String menuType);

    /**
     * 활성 페이지 타입 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.menuType = 'page' AND m.isActive = 'Y' AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findActivePageMenus();

    /**
     * 인증 필요 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.requiresAuth = 'Y' AND m.isActive = 'Y' AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> findAuthRequiredMenus();

    /**
     * URL로 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.url = :url AND m.isDeleted = 'N'")
    Optional<MenuItem> findByUrl(@Param("url") String url);

    /**
     * 메뉴명으로 검색 (LIKE 검색)
     */
    @Query("SELECT m FROM MenuItem m WHERE m.menuName LIKE %:menuName% AND m.isDeleted = 'N' ORDER BY m.sortOrder ASC")
    List<MenuItem> searchByMenuName(@Param("menuName") String menuName);

    /**
     * 메뉴 계층 구조 전체 조회 (LeftMenu용)
     * - depth와 sortOrder로 정렬하여 계층 구조 유지
     */
    @Query("SELECT m FROM MenuItem m WHERE m.isActive = 'Y' AND m.isDeleted = 'N' ORDER BY m.depth ASC, m.sortOrder ASC")
    List<MenuItem> findMenuHierarchy();

    /**
     * 대시보드 레이아웃 사용 메뉴 조회
     */
    @Query("SELECT m FROM MenuItem m WHERE m.dashboardLayout = 'Y' AND m.isDeleted = 'N'")
    List<MenuItem> findDashboardLayoutMenus();
}
