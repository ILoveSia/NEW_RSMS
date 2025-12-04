package com.rsms.domain.position.repository;

import com.rsms.domain.position.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 직책 Repository
 * - 직책 데이터베이스 접근 인터페이스
 * - JPA 기본 CRUD + 커스텀 쿼리 제공
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    /**
     * 직책코드로 조회
     * - 완전 일치 검색
     *
     * @param positionsCd 직책코드
     * @return 직책 Optional
     */
    java.util.Optional<Position> findByPositionsCd(String positionsCd);

    /**
     * 직책명으로 조회
     * - 완전 일치 검색
     *
     * @param positionsName 직책명
     * @return 직책 리스트
     */
    List<Position> findByPositionsName(String positionsName);

    /**
     * 직책코드 목록으로 일괄 조회
     * - UserMgmtService에서 직위명 조회 시 사용
     *
     * @param positionsCdList 직책코드 목록
     * @return 직책 리스트
     */
    List<Position> findByPositionsCdIn(List<String> positionsCdList);

    /**
     * 직책명으로 검색 (LIKE)
     * - 부분 일치 검색
     *
     * @param positionsName 직책명
     * @return 직책 리스트
     */
    List<Position> findByPositionsNameContaining(String positionsName);

    /**
     * 본부코드로 조회
     * - 특정 본부의 직책 조회
     *
     * @param hqCode 본부코드
     * @return 직책 리스트
     */
    List<Position> findByHqCode(String hqCode);

    /**
     * 원장차수ID로 조회
     * - 특정 원장차수의 직책 조회
     *
     * @param ledgerOrderId 원장차수ID
     * @return 직책 리스트
     */
    List<Position> findByLedgerOrderId(String ledgerOrderId);

    /**
     * 원장차수ID와 직책코드로 조회
     * - 특정 원장차수의 특정 직책 조회 (엑셀 업로드 시 사용)
     * - 동일한 직책코드가 여러 원장차수에 존재할 수 있으므로 두 조건으로 조회
     *
     * @param ledgerOrderId 원장차수ID
     * @param positionsCd 직책코드
     * @return 직책 Optional
     */
    java.util.Optional<Position> findByLedgerOrderIdAndPositionsCd(String ledgerOrderId, String positionsCd);

    /**
     * 사용여부로 조회
     * - Y 또는 N으로 필터링
     *
     * @param isActive 사용여부
     * @return 직책 리스트
     */
    List<Position> findByIsActive(String isActive);

    /**
     * 사용여부로 조회 (생성일시 역순 정렬)
     * - 최신순으로 정렬된 결과
     *
     * @param isActive 사용여부
     * @return 직책 리스트
     */
    List<Position> findByIsActiveOrderByCreatedAtDesc(String isActive);

    /**
     * 직책명 존재 여부 확인
     * - 중복 검사용
     *
     * @param positionsName 직책명
     * @return 존재 여부
     */
    boolean existsByPositionsName(String positionsName);

    /**
     * 직책명 중복 확인 (자신 제외)
     * - 수정 시 중복 검사용
     *
     * @param positionsName 직책명
     * @param excludeId 제외할 직책ID
     * @return 중복 여부
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
           "FROM Position p WHERE " +
           "p.positionsName = :positionsName AND " +
           "p.positionsId <> :excludeId")
    boolean existsByPositionsNameExcludingId(
        @Param("positionsName") String positionsName,
        @Param("excludeId") Long excludeId
    );

    /**
     * 복합 검색 (키워드, 본부코드, 사용여부, 원장차수)
     * - 여러 필드를 OR 조건으로 검색
     * - 본부코드, 사용여부, 원장차수는 AND 조건
     *
     * @param keyword 검색 키워드
     * @param hqCode 본부코드
     * @param isActive 사용여부
     * @param ledgerOrderId 원장차수ID
     * @return 검색 결과 리스트
     */
    @Query("SELECT p FROM Position p WHERE " +
           "(:keyword IS NULL OR " +
           " p.positionsName LIKE %:keyword% OR " +
           " p.hqName LIKE %:keyword% OR " +
           " p.positionsCd LIKE %:keyword%) AND " +
           "(:hqCode IS NULL OR p.hqCode = :hqCode) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive) AND " +
           "(:ledgerOrderId IS NULL OR p.ledgerOrderId = :ledgerOrderId) " +
           "ORDER BY p.createdAt DESC")
    List<Position> searchPositions(
        @Param("keyword") String keyword,
        @Param("hqCode") String hqCode,
        @Param("isActive") String isActive,
        @Param("ledgerOrderId") String ledgerOrderId
    );

    /**
     * 최근 생성된 직책 조회
     * - 생성일시 기준 최신순 정렬
     *
     * @return 전체 직책 리스트 (최신순)
     */
    @Query("SELECT p FROM Position p ORDER BY p.createdAt DESC")
    List<Position> findRecentPositions();

    /**
     * 사용여부별 카운트
     * - Y 또는 N 개수
     *
     * @param isActive 사용여부
     * @return 카운트
     */
    long countByIsActive(String isActive);

    /**
     * 본부코드별 카운트
     * - 특정 본부의 직책 수
     *
     * @param hqCode 본부코드
     * @return 카운트
     */
    long countByHqCode(String hqCode);

    /**
     * 전체 카운트 (검색 조건 포함)
     * - 검색 조건에 맞는 직책 수
     *
     * @param keyword 검색 키워드
     * @param hqCode 본부코드
     * @param isActive 사용여부
     * @return 카운트
     */
    @Query("SELECT COUNT(p) FROM Position p WHERE " +
           "(:keyword IS NULL OR " +
           " p.positionsName LIKE %:keyword% OR " +
           " p.hqName LIKE %:keyword% OR " +
           " p.positionsCd LIKE %:keyword%) AND " +
           "(:hqCode IS NULL OR p.hqCode = :hqCode) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive)")
    long countBySearchConditions(
        @Param("keyword") String keyword,
        @Param("hqCode") String hqCode,
        @Param("isActive") String isActive
    );

    /**
     * 모든 직책 조회 (positions + positions_details + organizations 3개 테이블 조인)
     * - 각 부서별로 별도 행 반환 (GROUP BY 없음)
     * - positions_id가 같아도 org_code가 다르면 여러 행으로 반환
     *
     * @return Map 리스트 (각 부서별 행)
     */
    @Query(value = """
        SELECT a.positions_id
              ,a.ledger_order_id
              ,a.positions_cd
              ,a.positions_name
              ,a.hq_code
              ,a.hq_name
              ,a.expiration_date
              ,a.positions_status
              ,a.is_active
              ,a.is_concurrent
              ,a.created_by
              ,a.created_at
              ,a.updated_by
              ,a.updated_at
              ,b.org_code
              ,c.org_name
        FROM rsms.positions a
        INNER JOIN rsms.positions_details b ON a.positions_id = b.positions_id
        INNER JOIN rsms.organizations c ON b.org_code = c.org_code
        ORDER BY a.positions_id, b.org_code
        """, nativeQuery = true)
    List<java.util.Map<String, Object>> findAllWithDetails();

    /**
     * 모든 직책 조회 (positions 기준 그룹화)
     * - positions 테이블 기준으로 각 직책당 1개 행 반환
     * - 부점명은 배열로 집계 (STRING_AGG 사용)
     * - 부점명 개수도 함께 반환
     * - position_concurrents 테이블과 LEFT JOIN하여 실제 겸직 여부 실시간 반영
     * - 겸직의 대표(is_representative = 'Y')일 때만 겸직여부 'Y' 표시
     *
     * @return Map 리스트 (각 직책당 1개 행, 부점명 배열 및 실제 겸직 여부 포함)
     */
    @Query(value = """
        SELECT a.positions_id
              ,a.ledger_order_id
              ,a.positions_cd
              ,a.positions_name
              ,a.hq_code
              ,a.hq_name
              ,a.expiration_date
              ,a.positions_status
              ,a.is_active
              ,CASE
                WHEN COUNT(CASE WHEN pc.is_representative = 'Y' THEN 1 END) > 0 THEN 'Y'
                ELSE 'N'
               END as is_concurrent
              ,a.executive_emp_no
              ,e.emp_name as executive_name
              ,a.created_by
              ,a.created_at
              ,a.updated_by
              ,a.updated_at
              ,STRING_AGG(c.org_name, '||' ORDER BY c.org_name) as org_names
              ,COUNT(DISTINCT b.org_code) as org_count
        FROM rsms.positions a
        LEFT JOIN rsms.positions_details b ON a.positions_id = b.positions_id
        LEFT JOIN rsms.organizations c ON b.org_code = c.org_code
        LEFT JOIN rsms.position_concurrents pc
          ON a.ledger_order_id = pc.ledger_order_id
          AND a.positions_cd = pc.positions_cd
          AND pc.is_active = 'Y'
        LEFT JOIN rsms.employees e ON a.executive_emp_no = e.emp_no
        GROUP BY a.positions_id, a.ledger_order_id, a.positions_cd, a.positions_name,
                 a.hq_code, a.hq_name, a.expiration_date, a.positions_status,
                 a.is_active, a.executive_emp_no, e.emp_name, a.created_by, a.created_at,
                 a.updated_by, a.updated_at
        ORDER BY a.positions_id
        """, nativeQuery = true)
    List<java.util.Map<String, Object>> findAllPositionsGrouped();
}
