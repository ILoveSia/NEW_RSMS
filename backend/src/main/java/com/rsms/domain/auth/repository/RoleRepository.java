package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 역할 Repository
 * - 역할/권한 관리를 위한 데이터 접근 계층
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * 역할 코드로 조회
     */
    @Query("SELECT r FROM Role r WHERE r.roleCode = :roleCode AND r.isDeleted = 'N'")
    Optional<Role> findByRoleCode(@Param("roleCode") String roleCode);

    /**
     * 역할 코드 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Role r WHERE r.roleCode = :roleCode AND r.isDeleted = 'N'")
    boolean existsByRoleCode(@Param("roleCode") String roleCode);

    /**
     * 활성 역할 전체 조회 (정렬순서대로)
     */
    @Query("SELECT r FROM Role r WHERE r.status = 'ACTIVE' AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> findAllActiveRoles();

    /**
     * 역할 분류별 조회
     * @param roleCategory 역할 분류 (최고관리자, 관리자, 사용자)
     */
    @Query("SELECT r FROM Role r WHERE r.roleCategory = :roleCategory AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> findByRoleCategory(@Param("roleCategory") String roleCategory);

    /**
     * 시스템 역할 조회
     */
    @Query("SELECT r FROM Role r WHERE r.isSystemRole = 'Y' AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> findAllSystemRoles();

    /**
     * 사용자 정의 역할 조회
     */
    @Query("SELECT r FROM Role r WHERE r.isSystemRole = 'N' AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> findAllCustomRoles();

    /**
     * 상위 역할로 하위 역할 조회 (계층 구조)
     */
    @Query("SELECT r FROM Role r WHERE r.parentRoleId = :parentRoleId AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> findByParentRoleId(@Param("parentRoleId") Long parentRoleId);

    /**
     * 최상위 역할 조회 (parentRoleId가 null)
     */
    @Query("SELECT r FROM Role r WHERE r.parentRoleId IS NULL AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> findAllTopLevelRoles();

    /**
     * 역할명으로 검색 (LIKE 검색)
     */
    @Query("SELECT r FROM Role r WHERE r.roleName LIKE %:roleName% AND r.isDeleted = 'N' ORDER BY r.sortOrder ASC")
    List<Role> searchByRoleName(@Param("roleName") String roleName);
}
