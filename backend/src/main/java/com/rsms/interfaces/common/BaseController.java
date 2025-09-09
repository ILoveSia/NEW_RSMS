package com.rsms.interfaces.common;

import com.rsms.domain.common.BaseEntity;
import com.rsms.domain.common.BaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 기본 Controller 추상 클래스
 * 모든 REST Controller의 공통 CRUD 기능을 제공
 * 
 * @param <T> 엔티티 타입
 * @param <ID> 식별자 타입
 * @param <S> 서비스 타입
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
public abstract class BaseController<T extends BaseEntity, ID, S extends BaseService<T, ID>> {
    
    protected final S service;
    
    protected BaseController(S service) {
        this.service = service;
    }
    
    /**
     * 모든 활성 엔티티 조회
     */
    @GetMapping
    public ResponseEntity<List<T>> getAllActive() {
        List<T> entities = service.findAllActive();
        return ResponseEntity.ok(entities);
    }
    
    /**
     * 페이징으로 모든 엔티티 조회
     */
    @GetMapping("/page")
    public ResponseEntity<Page<T>> getAllPaged(Pageable pageable) {
        Page<T> entities = service.findAll(pageable);
        return ResponseEntity.ok(entities);
    }
    
    /**
     * ID로 활성 엔티티 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<T> getById(@PathVariable ID id) {
        T entity = service.findActiveEntityById(id);
        return ResponseEntity.ok(entity);
    }
    
    /**
     * 엔티티 생성
     */
    @PostMapping
    public ResponseEntity<T> create(@RequestBody T entity) {
        validateForCreate(entity);
        T createdEntity = service.create(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEntity);
    }
    
    /**
     * 엔티티 업데이트
     */
    @PutMapping("/{id}")
    public ResponseEntity<T> update(@PathVariable ID id, @RequestBody T entity) {
        // ID 설정 (경로 변수와 본문의 ID 일치 보장)
        entity.setId((Long) id);
        validateForUpdate(entity);
        T updatedEntity = service.update(entity);
        return ResponseEntity.ok(updatedEntity);
    }
    
    /**
     * 엔티티 부분 업데이트
     */
    @PatchMapping("/{id}")
    public ResponseEntity<T> partialUpdate(@PathVariable ID id, @RequestBody T partialEntity) {
        T existingEntity = service.findActiveEntityById(id);
        T mergedEntity = mergeForUpdate(existingEntity, partialEntity);
        validateForUpdate(mergedEntity);
        T updatedEntity = service.update(mergedEntity);
        return ResponseEntity.ok(updatedEntity);
    }
    
    /**
     * 소프트 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDelete(@PathVariable ID id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 하드 삭제 (관리자 권한 필요)
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDelete(@PathVariable ID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 삭제된 엔티티 복구
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restore(@PathVariable ID id) {
        service.restore(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 활성 엔티티 개수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countActive() {
        long count = service.countActive();
        return ResponseEntity.ok(count);
    }
    
    /**
     * 엔티티 존재 여부 확인
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> exists(@PathVariable ID id) {
        boolean exists = service.existsByIdActive(id);
        return ResponseEntity.ok(exists);
    }
    
    // 확장 가능한 훅 메서드들 (하위 클래스에서 필요시 재정의)
    
    /**
     * 생성 전 검증
     */
    protected void validateForCreate(T entity) {
        // 기본 검증 로직 (하위 클래스에서 재정의 가능)
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
    }
    
    /**
     * 업데이트 전 검증
     */
    protected void validateForUpdate(T entity) {
        // 기본 검증 로직 (하위 클래스에서 재정의 가능)
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
        if (entity.getId() == null) {
            throw new IllegalArgumentException("Entity ID cannot be null for update");
        }
    }
    
    /**
     * 부분 업데이트를 위한 엔티티 병합
     */
    protected T mergeForUpdate(T existingEntity, T partialEntity) {
        // 기본 구현: 부분 엔티티의 null이 아닌 필드만 기존 엔티티에 복사
        // 하위 클래스에서 도메인별 로직으로 재정의 권장
        return partialEntity;
    }
}