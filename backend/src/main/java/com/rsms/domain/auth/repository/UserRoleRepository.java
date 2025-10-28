package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자-역할 Repository
 * - 사용자와 역할 간의 매핑 관계를 관리하는 데이터 접근 계층
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    /**
     * 사용자 ID로 활성 역할 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId AND ur.isActive = 'Y' AND ur.isDeleted = 'N'")
    List<UserRole> findActiveRolesByUserId(@Param("userId") Long userId);

    /**
     * 역할 ID로 할당된 사용자 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.roleId = :roleId AND ur.isActive = 'Y' AND ur.isDeleted = 'N'")
    List<UserRole> findActiveUsersByRoleId(@Param("roleId") Long roleId);

    /**
     * 사용자와 역할의 매핑 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(ur) > 0 THEN true ELSE false END FROM UserRole ur WHERE ur.userId = :userId AND ur.roleId = :roleId AND ur.isDeleted = 'N'")
    boolean existsByUserIdAndRoleId(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * 사용자와 역할의 활성 매핑 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId AND ur.roleId = :roleId AND ur.isActive = 'Y' AND ur.isDeleted = 'N'")
    Optional<UserRole> findActiveByUserIdAndRoleId(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * 사용자 ID로 모든 역할 조회 (활성/비활성 모두)
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId AND ur.isDeleted = 'N'")
    List<UserRole> findAllByUserId(@Param("userId") Long userId);

    /**
     * 역할 ID로 모든 사용자 조회 (활성/비활성 모두)
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.roleId = :roleId AND ur.isDeleted = 'N'")
    List<UserRole> findAllByRoleId(@Param("roleId") Long roleId);

    /**
     * 사용자 ID와 역할 ID 목록으로 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.userId = :userId AND ur.roleId IN :roleIds AND ur.isDeleted = 'N'")
    List<UserRole> findByUserIdAndRoleIdIn(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);

    /**
     * 할당자로 할당한 역할 조회
     */
    @Query("SELECT ur FROM UserRole ur WHERE ur.assignedBy = :assignedBy AND ur.isDeleted = 'N'")
    List<UserRole> findByAssignedBy(@Param("assignedBy") String assignedBy);
}
