package com.rsms.domain.employee.repository;

import com.rsms.domain.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 직원 Repository
 * - 직원 데이터 조회 및 관리
 * - QueryDSL 또는 직접 쿼리를 통한 검색 기능
 */
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {

    /**
     * 직원번호로 직원 조회 (삭제되지 않은 직원만)
     * @param empNo 직원번호
     * @return 직원 정보
     */
    @Query("SELECT e FROM Employee e WHERE e.empNo = :empNo AND e.isDeleted = 'N'")
    Optional<Employee> findByEmpNoAndNotDeleted(@Param("empNo") String empNo);

    /**
     * 조직코드로 직원 목록 조회 (삭제되지 않은 직원만)
     * @param orgCode 조직코드
     * @return 직원 목록
     */
    @Query("SELECT e FROM Employee e WHERE e.orgCode = :orgCode AND e.isDeleted = 'N' ORDER BY e.empName")
    List<Employee> findByOrgCodeAndNotDeleted(@Param("orgCode") String orgCode);

    /**
     * 재직상태로 직원 목록 조회 (삭제되지 않은 직원만)
     * @param employmentStatus 재직상태
     * @return 직원 목록
     */
    @Query("SELECT e FROM Employee e WHERE e.employmentStatus = :employmentStatus AND e.isDeleted = 'N' ORDER BY e.empName")
    List<Employee> findByEmploymentStatusAndNotDeleted(@Param("employmentStatus") String employmentStatus);

    /**
     * 직원명으로 검색 (LIKE, 삭제되지 않은 직원만)
     * @param empName 직원명 (부분 검색)
     * @return 직원 목록
     */
    @Query("SELECT e FROM Employee e WHERE e.empName LIKE %:empName% AND e.isDeleted = 'N' ORDER BY e.empName")
    List<Employee> searchByEmpNameAndNotDeleted(@Param("empName") String empName);

    /**
     * 복합 조건으로 직원 검색 (조직명 JOIN 포함)
     * - 직원번호, 직원명, 조직코드, 재직상태로 검색
     * - 모든 조건은 AND 연산
     * - 빈 값은 조건에서 제외
     *
     * @param empNo 직원번호 (부분 검색)
     * @param empName 직원명 (부분 검색)
     * @param orgCode 조직코드 (정확히 일치)
     * @param employmentStatus 재직상태 (정확히 일치)
     * @return 직원 목록 (조직명 JOIN)
     */
    @Query("""
        SELECT e, o.orgName
        FROM Employee e
        LEFT JOIN Organization o ON e.orgCode = o.orgCode
        WHERE e.isDeleted = 'N'
          AND (:empNo IS NULL OR e.empNo LIKE %:empNo%)
          AND (:empName IS NULL OR e.empName LIKE %:empName%)
          AND (:orgCode IS NULL OR e.orgCode = :orgCode)
          AND (:employmentStatus IS NULL OR e.employmentStatus = :employmentStatus)
        ORDER BY e.empName
    """)
    List<Object[]> searchEmployeesWithOrgName(
        @Param("empNo") String empNo,
        @Param("empName") String empName,
        @Param("orgCode") String orgCode,
        @Param("employmentStatus") String employmentStatus
    );

    /**
     * 활성화된 재직자만 조회 (삭제되지 않은 직원만)
     * @return 활성화된 재직자 목록
     */
    @Query("""
        SELECT e FROM Employee e
        WHERE e.isDeleted = 'N'
          AND e.isActive = 'Y'
          AND e.employmentStatus = 'ACTIVE'
        ORDER BY e.empName
    """)
    List<Employee> findActiveEmployees();

    /**
     * 직급으로 직원 목록 조회 (삭제되지 않은 직원만)
     * @param jobGrade 직급
     * @return 직원 목록
     */
    @Query("SELECT e FROM Employee e WHERE e.jobGrade = :jobGrade AND e.isDeleted = 'N' ORDER BY e.empName")
    List<Employee> findByJobGradeAndNotDeleted(@Param("jobGrade") String jobGrade);

    /**
     * 직급레벨 범위로 직원 목록 조회 (삭제되지 않은 직원만)
     * @param minLevel 최소 직급레벨
     * @param maxLevel 최대 직급레벨
     * @return 직원 목록
     */
    @Query("""
        SELECT e FROM Employee e
        WHERE e.jobLevel BETWEEN :minLevel AND :maxLevel
          AND e.isDeleted = 'N'
        ORDER BY e.jobLevel DESC, e.empName
    """)
    List<Employee> findByJobLevelRangeAndNotDeleted(
        @Param("minLevel") Integer minLevel,
        @Param("maxLevel") Integer maxLevel
    );

    /**
     * 직원번호 목록으로 직원 조회 (삭제되지 않은 직원만)
     * - 점검자/수행자 이름 조회용
     * @param empNos 직원번호 목록
     * @return 직원 목록
     */
    @Query("SELECT e FROM Employee e WHERE e.empNo IN :empNos AND e.isDeleted = 'N'")
    List<Employee> findByEmpNoInAndNotDeleted(@Param("empNos") List<String> empNos);
}
