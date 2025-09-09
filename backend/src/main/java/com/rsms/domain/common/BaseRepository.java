package com.rsms.domain.common;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 기본 Repository 인터페이스
 * 모든 도메인 Repository의 공통 기능을 정의
 * 
 * @param <T> 엔티티 타입 (BaseEntity를 상속해야 함)
 * @param <ID> 식별자 타입
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity, ID> extends JpaRepository<T, ID> {
    
    /**
     * 활성 상태인 엔티티만 조회
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.active = true")
    List<T> findAllActive();
    
    /**
     * 활성 상태인 엔티티만 페이징 조회
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.active = true")
    Page<T> findAllActive(Pageable pageable);
    
    /**
     * ID로 활성 상태인 엔티티 조회
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.active = true")
    Optional<T> findByIdActive(@Param("id") ID id);
    
    /**
     * 비활성 상태인 엔티티만 조회
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.active = false")
    List<T> findAllInactive();
    
    /**
     * 소프트 삭제 (active = false로 변경)
     */
    @Query("UPDATE #{#entityName} e SET e.active = false WHERE e.id = :id")
    void softDelete(@Param("id") ID id);
    
    /**
     * 소프트 삭제된 엔티티 복구
     */
    @Query("UPDATE #{#entityName} e SET e.active = true WHERE e.id = :id")
    void restore(@Param("id") ID id);
    
    /**
     * 특정 사용자가 생성한 활성 엔티티 조회
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.createdBy = :createdBy AND e.active = true")
    List<T> findByCreatedByAndActive(@Param("createdBy") String createdBy);
    
    /**
     * 활성 엔티티 총 개수
     */
    @Query("SELECT COUNT(e) FROM #{#entityName} e WHERE e.active = true")
    long countActive();
}