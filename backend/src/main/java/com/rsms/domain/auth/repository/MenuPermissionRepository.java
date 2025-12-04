package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.MenuPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 메뉴 권한 Repository
 * - 역할별 메뉴 접근 권한 관리를 위한 데이터 접근 계층
 * - MenuMgmt UI 오른쪽 그리드용 쿼리
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface MenuPermissionRepository extends JpaRepository<MenuPermission, Long> {

    /**
     * 메뉴ID로 권한 목록 조회
     * - MenuMgmt에서 메뉴 선택 시 해당 메뉴의 모든 역할 권한 표시
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.menuId = :menuId AND mp.isDeleted = 'N'")
    List<MenuPermission> findByMenuId(@Param("menuId") Long menuId);

    /**
     * 역할ID로 권한 목록 조회
     * - 특정 역할의 모든 메뉴 권한 조회
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.roleId = :roleId AND mp.isDeleted = 'N'")
    List<MenuPermission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 역할ID와 메뉴ID로 단일 권한 조회
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.roleId = :roleId AND mp.menuId = :menuId AND mp.isDeleted = 'N'")
    Optional<MenuPermission> findByRoleIdAndMenuId(@Param("roleId") Long roleId, @Param("menuId") Long menuId);

    /**
     * 조회 권한이 있는 메뉴 목록 조회 (특정 역할)
     */
    @Query("SELECT mp FROM MenuPermission mp WHERE mp.roleId = :roleId AND mp.canView = 'Y' AND mp.isDeleted = 'N'")
    List<MenuPermission> findViewableByRoleId(@Param("roleId") Long roleId);

    /**
     * 메뉴ID로 권한 삭제 (논리적 삭제)
     * - 메뉴 삭제 시 연관된 모든 권한도 삭제
     */
    @Modifying
    @Query("UPDATE MenuPermission mp SET mp.isDeleted = 'Y', mp.updatedBy = :updatedBy, mp.updatedAt = CURRENT_TIMESTAMP WHERE mp.menuId = :menuId AND mp.isDeleted = 'N'")
    int softDeleteByMenuId(@Param("menuId") Long menuId, @Param("updatedBy") String updatedBy);

    /**
     * 역할ID로 권한 삭제 (논리적 삭제)
     * - 역할 삭제 시 연관된 모든 권한도 삭제
     */
    @Modifying
    @Query("UPDATE MenuPermission mp SET mp.isDeleted = 'Y', mp.updatedBy = :updatedBy, mp.updatedAt = CURRENT_TIMESTAMP WHERE mp.roleId = :roleId AND mp.isDeleted = 'N'")
    int softDeleteByRoleId(@Param("roleId") Long roleId, @Param("updatedBy") String updatedBy);

    /**
     * 단일 권한 삭제 (논리적 삭제)
     */
    @Modifying
    @Query("UPDATE MenuPermission mp SET mp.isDeleted = 'Y', mp.updatedBy = :updatedBy, mp.updatedAt = CURRENT_TIMESTAMP WHERE mp.menuPermissionId = :menuPermissionId AND mp.isDeleted = 'N'")
    int softDeleteById(@Param("menuPermissionId") Long menuPermissionId, @Param("updatedBy") String updatedBy);

    /**
     * 역할-메뉴 조합 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(mp) > 0 THEN true ELSE false END FROM MenuPermission mp WHERE mp.roleId = :roleId AND mp.menuId = :menuId AND mp.isDeleted = 'N'")
    boolean existsByRoleIdAndMenuId(@Param("roleId") Long roleId, @Param("menuId") Long menuId);

    /**
     * 메뉴별 권한 수 조회
     */
    @Query("SELECT COUNT(mp) FROM MenuPermission mp WHERE mp.menuId = :menuId AND mp.isDeleted = 'N'")
    Long countByMenuId(@Param("menuId") Long menuId);

    /**
     * 역할별 권한 수 조회
     */
    @Query("SELECT COUNT(mp) FROM MenuPermission mp WHERE mp.roleId = :roleId AND mp.isDeleted = 'N'")
    Long countByRoleId(@Param("roleId") Long roleId);
}
