package com.rsms.domain.auth.repository;

import com.rsms.domain.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 사용자 Repository
 * - Spring Security 인증 및 사용자 관리를 위한 데이터 접근 계층
 *
 * @author RSMS Development Team
 * @since 1.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 사용자 아이디로 조회 (로그인용)
     * - 삭제되지 않은 사용자만 조회
     */
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.isDeleted = 'N'")
    Optional<User> findByUsername(@Param("username") String username);

    /**
     * 직원번호로 조회
     */
    @Query("SELECT u FROM User u WHERE u.empNo = :empNo AND u.isDeleted = 'N'")
    Optional<User> findByEmpNo(@Param("empNo") String empNo);

    /**
     * 사용자 아이디 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.username = :username AND u.isDeleted = 'N'")
    boolean existsByUsername(@Param("username") String username);

    /**
     * 직원번호 존재 여부 확인
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.empNo = :empNo AND u.isDeleted = 'N'")
    boolean existsByEmpNo(@Param("empNo") String empNo);

    /**
     * 활성 사용자 조회
     * - isActive = 'Y', isDeleted = 'N', accountStatus = 'ACTIVE'
     */
    @Query("SELECT u FROM User u WHERE u.isActive = 'Y' AND u.isDeleted = 'N' AND u.accountStatus = 'ACTIVE'")
    java.util.List<User> findAllActiveUsers();

    /**
     * 관리자 권한 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.isAdmin = 'Y' AND u.isDeleted = 'N'")
    java.util.List<User> findAllAdminUsers();

    /**
     * 임원 권한 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.isExecutive = 'Y' AND u.isDeleted = 'N'")
    java.util.List<User> findAllExecutiveUsers();

    /**
     * 계정 잠금 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.accountStatus = 'LOCKED' AND u.isDeleted = 'N'")
    java.util.List<User> findAllLockedUsers();

    /**
     * 비밀번호 변경 필요 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.passwordChangeRequired = 'Y' AND u.isDeleted = 'N'")
    java.util.List<User> findUsersNeedingPasswordChange();

    /**
     * 삭제되지 않은 전체 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.isDeleted = 'N' ORDER BY u.userId DESC")
    java.util.List<User> findAllNotDeleted();

    /**
     * 사용자명 또는 직원번호로 검색 (부분 일치)
     */
    @Query("SELECT u FROM User u WHERE u.isDeleted = 'N' AND " +
           "(u.username LIKE %:keyword% OR u.empNo LIKE %:keyword%)")
    java.util.List<User> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 계정상태별 사용자 조회
     */
    @Query("SELECT u FROM User u WHERE u.accountStatus = :status AND u.isDeleted = 'N'")
    java.util.List<User> findByAccountStatus(@Param("status") String status);

    /**
     * 활성 사용자 수 조회
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = 'Y' AND u.isDeleted = 'N'")
    long countActiveUsers();

    /**
     * 전체 사용자 수 조회 (삭제되지 않은)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.isDeleted = 'N'")
    long countAllNotDeleted();
}
