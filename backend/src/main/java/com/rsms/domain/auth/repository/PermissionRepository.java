package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 권한 Repository
 * - 권한(상세역할) 관리를 위한 데이터 접근 계층
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    /**
     * 권한 코드로 조회
     */
    @Query("SELECT p FROM Permission p WHERE p.permissionCode = :code AND p.isDeleted = 'N'")
    Optional<Permission> findByPermissionCode(@Param("code") String permissionCode);

    /**
     * 권한 코드 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Permission p WHERE p.permissionCode = :code AND p.isDeleted = 'N'")
    boolean existsByPermissionCode(@Param("code") String permissionCode);

    /**
     * 활성 권한 전체 조회 (정렬순서대로)
     */
    @Query("SELECT p FROM Permission p WHERE p.isActive = 'Y' AND p.isDeleted = 'N' ORDER BY p.sortOrder ASC")
    List<Permission> findAllActivePermissions();

    /**
     * 삭제되지 않은 모든 권한 조회
     */
    @Query("SELECT p FROM Permission p WHERE p.isDeleted = 'N' ORDER BY p.sortOrder ASC")
    List<Permission> findAllNotDeleted();

    /**
     * 메뉴별 권한 조회
     */
    @Query("SELECT p FROM Permission p WHERE p.menuId = :menuId AND p.isDeleted = 'N' ORDER BY p.sortOrder ASC")
    List<Permission> findByMenuId(@Param("menuId") Long menuId);

    /**
     * 업무 권한 조회
     */
    @Query("SELECT p FROM Permission p WHERE p.businessPermission = 'Y' AND p.isDeleted = 'N' ORDER BY p.sortOrder ASC")
    List<Permission> findAllBusinessPermissions();

    /**
     * 권한명으로 검색 (LIKE 검색)
     */
    @Query("SELECT p FROM Permission p WHERE p.permissionName LIKE %:name% AND p.isDeleted = 'N' ORDER BY p.sortOrder ASC")
    List<Permission> searchByPermissionName(@Param("name") String permissionName);

    /**
     * 특정 역할에 할당된 권한 목록 조회 (role_permissions 테이블 조인)
     */
    @Query("SELECT p FROM Permission p " +
           "INNER JOIN RolePermission rp ON p.permissionId = rp.permissionId " +
           "WHERE rp.roleId = :roleId AND rp.granted = 'Y' AND rp.isDeleted = 'N' AND p.isDeleted = 'N' " +
           "ORDER BY p.sortOrder ASC")
    List<Permission> findByRoleId(@Param("roleId") Long roleId);
}
