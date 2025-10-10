package com.rsms.domain.system.code.repository;

import com.rsms.domain.system.code.entity.CommonCodeGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 공통코드 그룹 Repository
 *
 * @description 공통코드 그룹 데이터 접근 인터페이스
 * @author Claude AI
 * @since 2025-09-24
 */
@Repository
public interface CommonCodeGroupRepository extends JpaRepository<CommonCodeGroup, String> {

    /**
     * 활성화된 그룹 조회
     */
    List<CommonCodeGroup> findByIsActive(String isActive);

    /**
     * 카테고리별 그룹 조회
     */
    List<CommonCodeGroup> findByCategory(String category);

    /**
     * 카테고리 코드별 그룹 조회
     */
    List<CommonCodeGroup> findByCategoryCode(String categoryCode);

    /**
     * 시스템 코드 여부로 그룹 조회
     */
    List<CommonCodeGroup> findBySystemCode(Boolean systemCode);

    /**
     * 활성화 및 카테고리별 그룹 조회
     */
    List<CommonCodeGroup> findByIsActiveAndCategory(String isActive, String category);

    /**
     * 그룹명으로 검색 (LIKE)
     */
    List<CommonCodeGroup> findByGroupNameContaining(String groupName);

    /**
     * 그룹코드 또는 그룹명으로 검색
     */
    @Query("SELECT ccg FROM CommonCodeGroup ccg WHERE " +
           "ccg.groupCode LIKE %:keyword% OR " +
           "ccg.groupName LIKE %:keyword%")
    List<CommonCodeGroup> searchByKeyword(@Param("keyword") String keyword);

    /**
     * 복합 검색 (키워드, 카테고리, 활성화 여부)
     */
    @Query("SELECT ccg FROM CommonCodeGroup ccg WHERE " +
           "(:keyword IS NULL OR ccg.groupCode LIKE %:keyword% OR ccg.groupName LIKE %:keyword%) AND " +
           "(:category IS NULL OR ccg.category = :category) AND " +
           "(:isActive IS NULL OR ccg.isActive = :isActive)")
    Page<CommonCodeGroup> searchWithFilters(
        @Param("keyword") String keyword,
        @Param("category") String category,
        @Param("isActive") String isActive,
        Pageable pageable
    );

    /**
     * 정렬 순서로 조회
     */
    List<CommonCodeGroup> findAllByOrderBySortOrderAsc();

    /**
     * 카테고리별 정렬 순서로 조회
     */
    List<CommonCodeGroup> findByCategoryOrderBySortOrderAsc(String category);

    /**
     * 그룹코드 존재 여부 확인
     */
    boolean existsByGroupCode(String groupCode);

    /**
     * 수정 가능한 그룹 조회
     */
    List<CommonCodeGroup> findByEditable(Boolean editable);

    /**
     * 상세 정보와 함께 그룹 조회 (N+1 문제 해결)
     */
    @Query("SELECT DISTINCT ccg FROM CommonCodeGroup ccg " +
           "LEFT JOIN FETCH ccg.details " +
           "WHERE ccg.groupCode = :groupCode")
    Optional<CommonCodeGroup> findByIdWithDetails(@Param("groupCode") String groupCode);

    /**
     * 활성화된 그룹과 상세 정보 함께 조회
     */
    @Query("SELECT DISTINCT ccg FROM CommonCodeGroup ccg " +
           "LEFT JOIN FETCH ccg.details d " +
           "WHERE ccg.isActive = 'Y' AND (d.isActive = 'Y' OR d.isActive IS NULL) " +
           "ORDER BY ccg.sortOrder, d.sortOrder")
    List<CommonCodeGroup> findAllActiveWithDetails();
}
