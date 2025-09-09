package com.rsms.domain.common;

import com.rsms.global.exception.NotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 기본 서비스 클래스
 * 공통 CRUD 기능 제공
 *
 * @param <T> 엔티티 타입
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
     * 모든 엔티티 조회
     */
    public List<T> findAll() {
        return getRepository().findAll();
    }

    /**
     * 엔티티 생성
     */
    @Transactional
    public T save(T entity) {
        return getRepository().save(entity);
    }

    /**
     * 엔티티 수정
     */
    @Transactional
    public T update(T entity) {
        return getRepository().save(entity);
    }

    /**
     * 엔티티 삭제
     */
    @Transactional
    public void delete(T entity) {
        getRepository().delete(entity);
    }

    /**
     * ID로 엔티티 삭제
     */
    @Transactional
    public void deleteById(ID id) {
        if (!existsById(id)) {
            throw new NotFoundException(getEntityName() + " not found with id: " + id);
        }
        getRepository().deleteById(id);
    }

    /**
     * 엔티티 존재 여부 확인
     */
    public boolean existsById(ID id) {
        return getRepository().existsById(id);
    }

    /**
     * 전체 엔티티 개수 조회
     */
    public long count() {
        return getRepository().count();
    }
}