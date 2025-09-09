package com.rsms.domain.common;

import com.rsms.global.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 기본 서비스 클래스
 * 모든 도메인 Service의 공통 기능을 제공
 * BaseEntity를 상속한 엔티티에 대한 CRUD 및 소프트 삭제 기능 포함
 *
 * @param <T> 엔티티 타입 (BaseEntity를 상속해야 함)
 * @param <ID> 엔티티 ID 타입
 */
@Transactional(readOnly = true)
public abstract class BaseService<T extends BaseEntity, ID> {

    protected abstract JpaRepository<T, ID> getRepository();
    
    protected abstract String getEntityName();

    /**
     * ID로 엔티티 조회
     */
    public Optional<T> findById(ID id) {
        return getRepository().findById(id);
    }

    /**
     * ID로 엔티티 조회 (없으면 예외 발생)
     */
    public T findEntityById(ID id) {
        return findById(id)
            .orElseThrow(() -> new NotFoundException(getEntityName() + " not found with id: " + id));
    }

    /**
     * ID로 활성 엔티티 조회
     */
    public Optional<T> findByIdActive(ID id) {
        Optional<T> entity = getRepository().findById(id);
        return entity.filter(BaseEntity::isActive);
    }

    /**
     * ID로 활성 엔티티 조회 (없으면 예외 발생)
     */
    public T findActiveEntityById(ID id) {
        return findByIdActive(id)
            .orElseThrow(() -> new NotFoundException("Active " + getEntityName() + " not found with id: " + id));
    }

    /**
     * 모든 엔티티 조회
     */
    public List<T> findAll() {
        return getRepository().findAll();
    }

    /**
     * 페이징으로 모든 엔티티 조회
     */
    public Page<T> findAll(Pageable pageable) {
        return getRepository().findAll(pageable);
    }

    /**
     * 모든 활성 엔티티 조회
     */
    public List<T> findAllActive() {
        return getRepository().findAll().stream()
            .filter(BaseEntity::isActive)
            .toList();
    }

    /**
     * 엔티티 생성
     */
    @Transactional
    public T create(T entity) {
        validateForCreate(entity);
        beforeCreate(entity);
        
        T savedEntity = getRepository().save(entity);
        publishEvents(savedEntity);
        
        afterCreate(savedEntity);
        return savedEntity;
    }

    /**
     * 엔티티 생성 (기존 호환성)
     */
    @Transactional
    public T save(T entity) {
        return create(entity);
    }

    /**
     * 엔티티 업데이트
     */
    @Transactional
    public T update(T entity) {
        validateForUpdate(entity);
        beforeUpdate(entity);
        
        T savedEntity = getRepository().save(entity);
        publishEvents(savedEntity);
        
        afterUpdate(savedEntity);
        return savedEntity;
    }

    /**
     * 엔티티 삭제 (하드 삭제)
     */
    @Transactional
    public void delete(T entity) {
        validateForDelete(entity);
        beforeDelete(entity);
        
        getRepository().delete(entity);
        
        afterDelete(entity);
    }

    /**
     * ID로 엔티티 삭제 (하드 삭제)
     */
    @Transactional
    public void deleteById(ID id) {
        T entity = findEntityById(id);
        delete(entity);
    }

    /**
     * 소프트 삭제 (활성 상태를 false로 변경)
     */
    @Transactional
    public void softDelete(ID id) {
        T entity = findActiveEntityById(id);
        validateForSoftDelete(entity);
        beforeSoftDelete(entity);
        
        entity.deactivate();
        getRepository().save(entity);
        publishEvents(entity);
        
        afterSoftDelete(entity);
    }

    /**
     * 소프트 삭제된 엔티티 복구
     */
    @Transactional
    public void restore(ID id) {
        T entity = findEntityById(id);
        if (entity.isActive()) {
            throw new IllegalStateException(getEntityName() + " is already active");
        }
        
        validateForRestore(entity);
        beforeRestore(entity);
        
        entity.activate();
        getRepository().save(entity);
        publishEvents(entity);
        
        afterRestore(entity);
    }

    /**
     * 엔티티 존재 여부 확인
     */
    public boolean existsById(ID id) {
        return getRepository().existsById(id);
    }

    /**
     * 활성 엔티티 존재 여부 확인
     */
    public boolean existsByIdActive(ID id) {
        return findByIdActive(id).isPresent();
    }

    /**
     * 전체 엔티티 개수 조회
     */
    public long count() {
        return getRepository().count();
    }

    /**
     * 활성 엔티티 개수 조회
     */
    public long countActive() {
        return getRepository().findAll().stream()
            .mapToLong(entity -> entity.isActive() ? 1L : 0L)
            .sum();
    }

    // 도메인 이벤트 처리
    private void publishEvents(T entity) {
        if (entity.hasEvents()) {
            // 실제 이벤트 발행은 Spring의 ApplicationEventPublisher를 사용
            // 추후 이벤트 발행 로직 추가 예정
            entity.clearEvents();
        }
    }

    // 확장 가능한 훅 메서드들 (하위 클래스에서 필요시 재정의)
    protected void validateForCreate(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
    }
    
    protected void validateForUpdate(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
        if (entity.getId() == null) {
            throw new IllegalArgumentException("Entity ID cannot be null for update");
        }
    }
    
    protected void validateForDelete(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
    }
    
    protected void validateForSoftDelete(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
    }
    
    protected void validateForRestore(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }
    }
    
    protected void beforeCreate(T entity) {
        // 생성 전 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void afterCreate(T entity) {
        // 생성 후 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void beforeUpdate(T entity) {
        // 업데이트 전 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void afterUpdate(T entity) {
        // 업데이트 후 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void beforeDelete(T entity) {
        // 삭제 전 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void afterDelete(T entity) {
        // 삭제 후 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void beforeSoftDelete(T entity) {
        // 소프트 삭제 전 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void afterSoftDelete(T entity) {
        // 소프트 삭제 후 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void beforeRestore(T entity) {
        // 복구 전 처리 (하위 클래스에서 재정의 가능)
    }
    
    protected void afterRestore(T entity) {
        // 복구 후 처리 (하위 클래스에서 재정의 가능)
    }
}