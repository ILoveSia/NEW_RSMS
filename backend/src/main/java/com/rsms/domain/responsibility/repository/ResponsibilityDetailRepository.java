package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.ResponsibilityDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 책무 세부내용 Repository
 * - 책무 세부내용 데이터 접근 계층
 *
 * @author Claude AI
 * @since 2025-09-24
 * @updated 2025-01-05 - PK/FK 타입 변경 (Long → String), 코드 생성용 쿼리 메서드 추가
 */
@Repository
public interface ResponsibilityDetailRepository extends JpaRepository<ResponsibilityDetail, String> {

    /**
     * 책무코드로 책무 세부내용 목록 조회
     */
    List<ResponsibilityDetail> findByResponsibilityCd(String responsibilityCd);

    /**
     * 책무코드 목록으로 책무 세부내용 목록 조회 (IN 절)
     */
    List<ResponsibilityDetail> findByResponsibilityCdIn(List<String> responsibilityCodes);

    /**
     * 책무코드로 책무 세부내용 전체 삭제
     */
    void deleteByResponsibilityCd(String responsibilityCd);

    // ===============================
    // 코드 생성용 쿼리 메서드
    // ===============================

    /**
     * 특정 책무코드의 최대 순번 조회 (코드 생성용)
     *
     * @param responsibilityCd 책무코드 (예: "20250001RM0001")
     * @return 최대 순번 (없으면 0)
     *
     * 사용 예시:
     * - responsibilityCd = "20250001RM0001"
     * - 책무코드 suffix = "RM0001" (뒷 9자리 추출 방법은 Service에서 처리)
     * - 기존 코드: "RM0001D0001", "RM0001D0002"
     * - 코드에서 "D" 다음 4자리 추출: "0001", "0002"
     * - 반환값: 2
     * - 다음 코드: "RM0001D0003"
     */
    @Query("""
        SELECT COALESCE(MAX(CAST(SUBSTRING(rd.responsibilityDetailCd, :prefixLength + 1, 4) AS integer)), 0)
        FROM ResponsibilityDetail rd
        WHERE rd.responsibilityCd = :responsibilityCd
        """)
    Integer findMaxSequenceByResponsibilityCd(
        @Param("responsibilityCd") String responsibilityCd,
        @Param("prefixLength") Integer prefixLength
    );

    /**
     * 책무세부코드 존재 여부 확인
     */
    boolean existsByResponsibilityDetailCd(String responsibilityDetailCd);
}
