package com.rsms.domain.system.code.repository;

import com.rsms.domain.system.code.entity.CommonCodeDetail;
import com.rsms.domain.system.code.entity.CommonCodeDetail.CodeDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 공통코드 상세 Repository
 *
 * @description 공통코드 상세 데이터 접근 인터페이스
 * @author Claude AI
 * @since 2025-09-24
 */
@Repository
public interface CommonCodeDetailRepository extends JpaRepository<CommonCodeDetail, CodeDetailId> {

    /**
     * 그룹코드로 상세 조회
     */
    List<CommonCodeDetail> findByGroupCode(String groupCode);

    /**
     * 그룹코드 및 활성화 여부로 조회
     */
    List<CommonCodeDetail> findByGroupCodeAndIsActive(String groupCode, String isActive);

    /**
     * 그룹코드 및 활성화 여부로 정렬 순서대로 조회
     */
    List<CommonCodeDetail> findByGroupCodeAndIsActiveOrderBySortOrderAsc(String groupCode, String isActive);

    /**
     * 그룹코드로 정렬 순서대로 조회
     */
    List<CommonCodeDetail> findByGroupCodeOrderBySortOrderAsc(String groupCode);

    /**
     * 상세코드명으로 검색 (LIKE)
     */
    List<CommonCodeDetail> findByDetailNameContaining(String detailName);

    /**
     * 그룹코드 및 상세코드명으로 검색
     */
    List<CommonCodeDetail> findByGroupCodeAndDetailNameContaining(String groupCode, String detailName);

    /**
     * 부모코드로 하위 코드 조회 (계층 구조)
     */
    List<CommonCodeDetail> findByGroupCodeAndParentCode(String groupCode, String parentCode);

    /**
     * 부모코드로 하위 코드 조회 (정렬)
     */
    List<CommonCodeDetail> findByGroupCodeAndParentCodeOrderBySortOrderAsc(String groupCode, String parentCode);

    /**
     * 레벨 깊이로 조회
     */
    List<CommonCodeDetail> findByGroupCodeAndLevelDepth(String groupCode, Integer levelDepth);

    /**
     * 상세코드 존재 여부 확인
     */
    boolean existsByGroupCodeAndDetailCode(String groupCode, String detailCode);

    /**
     * 유효 기간 내의 코드 조회
     */
    @Query("SELECT ccd FROM CommonCodeDetail ccd WHERE " +
           "ccd.groupCode = :groupCode AND " +
           "ccd.isActive = 'Y' AND " +
           "(ccd.validFrom IS NULL OR ccd.validFrom <= :checkDate) AND " +
           "(ccd.validUntil IS NULL OR ccd.validUntil >= :checkDate)")
    List<CommonCodeDetail> findValidCodesAtDate(
        @Param("groupCode") String groupCode,
        @Param("checkDate") LocalDate checkDate
    );

    /**
     * 현재 유효한 코드 조회
     */
    @Query("SELECT ccd FROM CommonCodeDetail ccd WHERE " +
           "ccd.groupCode = :groupCode AND " +
           "ccd.isActive = 'Y' AND " +
           "(ccd.validFrom IS NULL OR ccd.validFrom <= CURRENT_DATE) AND " +
           "(ccd.validUntil IS NULL OR ccd.validUntil >= CURRENT_DATE) " +
           "ORDER BY ccd.sortOrder")
    List<CommonCodeDetail> findCurrentValidCodes(@Param("groupCode") String groupCode);

    /**
     * 복합 검색 (그룹코드, 키워드, 활성화 여부)
     */
    @Query("SELECT ccd FROM CommonCodeDetail ccd WHERE " +
           "ccd.groupCode = :groupCode AND " +
           "(:keyword IS NULL OR ccd.detailCode LIKE %:keyword% OR ccd.detailName LIKE %:keyword%) AND " +
           "(:isActive IS NULL OR ccd.isActive = :isActive) " +
           "ORDER BY ccd.sortOrder")
    List<CommonCodeDetail> searchByGroupAndKeyword(
        @Param("groupCode") String groupCode,
        @Param("keyword") String keyword,
        @Param("isActive") String isActive
    );

    /**
     * 확장 속성으로 검색
     */
    @Query("SELECT ccd FROM CommonCodeDetail ccd WHERE " +
           "ccd.groupCode = :groupCode AND " +
           "(ccd.extAttr1 = :attrValue OR ccd.extAttr2 = :attrValue OR ccd.extAttr3 = :attrValue)")
    List<CommonCodeDetail> findByExtAttribute(
        @Param("groupCode") String groupCode,
        @Param("attrValue") String attrValue
    );

    /**
     * 그룹과 함께 상세 조회 (N+1 문제 해결)
     */
    @Query("SELECT ccd FROM CommonCodeDetail ccd " +
           "JOIN FETCH ccd.codeGroup " +
           "WHERE ccd.groupCode = :groupCode AND ccd.detailCode = :detailCode")
    Optional<CommonCodeDetail> findByIdWithGroup(
        @Param("groupCode") String groupCode,
        @Param("detailCode") String detailCode
    );

    /**
     * 그룹코드로 삭제
     */
    void deleteByGroupCode(String groupCode);

    /**
     * 그룹코드 및 상세코드로 삭제
     */
    void deleteByGroupCodeAndDetailCode(String groupCode, String detailCode);

    /**
     * 최대 정렬 순서 조회
     */
    @Query("SELECT COALESCE(MAX(ccd.sortOrder), 0) FROM CommonCodeDetail ccd WHERE ccd.groupCode = :groupCode")
    Integer findMaxSortOrderByGroupCode(@Param("groupCode") String groupCode);
}
