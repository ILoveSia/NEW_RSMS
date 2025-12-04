package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 역할-권한 매핑 Repository
 * - 역할과 권한의 N:M 관계 관리
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    /**
     * 역할ID와 권한ID로 매핑 조회
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.roleId = :roleId AND rp.permissionId = :permissionId AND rp.isDeleted = 'N'")
    Optional<RolePermission> findByRoleIdAndPermissionId(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);

    /**
     * 역할ID로 매핑 목록 조회
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.roleId = :roleId AND rp.isDeleted = 'N'")
    List<RolePermission> findByRoleId(@Param("roleId") Long roleId);

    /**
     * 권한ID로 매핑 목록 조회
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.permissionId = :permissionId AND rp.isDeleted = 'N'")
    List<RolePermission> findByPermissionId(@Param("permissionId") Long permissionId);

    /**
     * 역할ID로 부여된 권한 매핑 목록 조회
     */
    @Query("SELECT rp FROM RolePermission rp WHERE rp.roleId = :roleId AND rp.granted = 'Y' AND rp.isDeleted = 'N'")
    List<RolePermission> findGrantedByRoleId(@Param("roleId") Long roleId);

    /**
     * 역할ID에 매핑된 권한 수 조회
     */
    @Query("SELECT COUNT(rp) FROM RolePermission rp WHERE rp.roleId = :roleId AND rp.granted = 'Y' AND rp.isDeleted = 'N'")
    Long countByRoleId(@Param("roleId") Long roleId);

    /**
     * 역할ID로 매핑 삭제 (논리적 삭제)
     */
    @Modifying
    @Query("UPDATE RolePermission rp SET rp.isDeleted = 'Y', rp.updatedBy = :updatedBy, rp.updatedAt = CURRENT_TIMESTAMP WHERE rp.roleId = :roleId AND rp.isDeleted = 'N'")
    int softDeleteByRoleId(@Param("roleId") Long roleId, @Param("updatedBy") String updatedBy);

    /**
     * 역할ID와 권한ID 목록으로 매핑 삭제 (논리적 삭제)
     */
    @Modifying
    @Query("UPDATE RolePermission rp SET rp.isDeleted = 'Y', rp.updatedBy = :updatedBy, rp.updatedAt = CURRENT_TIMESTAMP WHERE rp.roleId = :roleId AND rp.permissionId IN :permissionIds AND rp.isDeleted = 'N'")
    int softDeleteByRoleIdAndPermissionIds(@Param("roleId") Long roleId, @Param("permissionIds") List<Long> permissionIds, @Param("updatedBy") String updatedBy);

    /**
     * 매핑 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(rp) > 0 THEN true ELSE false END FROM RolePermission rp WHERE rp.roleId = :roleId AND rp.permissionId = :permissionId AND rp.isDeleted = 'N'")
    boolean existsByRoleIdAndPermissionId(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);

    /**
     * 권한ID로 매핑 삭제 (논리적 삭제)
     * - 권한 삭제 시 연관된 모든 역할-권한 매핑도 삭제
     */
    @Modifying
    @Query("UPDATE RolePermission rp SET rp.isDeleted = 'Y', rp.updatedBy = :updatedBy, rp.updatedAt = CURRENT_TIMESTAMP WHERE rp.permissionId = :permissionId AND rp.isDeleted = 'N'")
    int softDeleteByPermissionId(@Param("permissionId") Long permissionId, @Param("updatedBy") String updatedBy);
}
