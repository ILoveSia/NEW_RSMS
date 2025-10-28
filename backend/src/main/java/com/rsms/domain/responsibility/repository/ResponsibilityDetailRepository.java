package com.rsms.domain.responsibility.repository;

import com.rsms.domain.responsibility.entity.ResponsibilityDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 책무 세부내용 Repository
 * - 책무 세부내용 데이터 접근 계층
 *
 * @author Claude AI
 * @since 2025-09-24
 */
@Repository
public interface ResponsibilityDetailRepository extends JpaRepository<ResponsibilityDetail, Long> {

    /**
     * 책무ID로 책무 세부내용 목록 조회
     */
    List<ResponsibilityDetail> findByResponsibilityId(Long responsibilityId);

    /**
     * 책무ID로 책무 세부내용 전체 삭제
     */
    void deleteByResponsibilityId(Long responsibilityId);
}
