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
     * 직책명으로 조회
     * - 완전 일치 검색
     *
     * @param positionsName 직책명
     * @return 직책 리스트
     */
    List<Position> findByPositionsName(String positionsName);

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
     * 복합 검색 (키워드, 본부코드, 사용여부)
     * - 여러 필드를 OR 조건으로 검색
     * - 본부코드, 사용여부는 AND 조건
     *
     * @param keyword 검색 키워드
     * @param hqCode 본부코드
     * @param isActive 사용여부
     * @return 검색 결과 리스트
     */
    @Query("SELECT p FROM Position p WHERE " +
           "(:keyword IS NULL OR " +
           " p.positionsName LIKE %:keyword% OR " +
           " p.hqName LIKE %:keyword% OR " +
           " p.positionsCd LIKE %:keyword%) AND " +
           "(:hqCode IS NULL OR p.hqCode = :hqCode) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive) " +
           "ORDER BY p.createdAt DESC")
    List<Position> searchPositions(
        @Param("keyword") String keyword,
        @Param("hqCode") String hqCode,
        @Param("isActive") String isActive
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
}
