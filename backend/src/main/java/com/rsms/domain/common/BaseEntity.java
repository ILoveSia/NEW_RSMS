package com.rsms.domain.common;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 모든 엔티티의 기본 클래스
 * 공통 필드 (ID, 생성/수정 일시, 생성/수정자, 버전, 활성화 상태) 제공
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_id", updatable = false, length = 100)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_id", length = 100)
    private String lastModifiedBy;

    @Column(name = "active")
    private Boolean active = true;

    @Version
    @Column(name = "version")
    private Long version = 0L;

    // Domain Event 지원 (JPA 이벤트)
    @Transient
    private List<DomainEvent> domainEvents = new ArrayList<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    /**
     * 엔티티가 새로운 엔티티인지 확인
     */
    public boolean isNew() {
        return this.id == null;
    }

    /**
     * 엔티티가 활성 상태인지 확인
     */
    public boolean isActive() {
        return this.active != null && this.active;
    }

    /**
     * 엔티티를 비활성화
     */
    public void deactivate() {
        this.active = false;
    }

    /**
     * 엔티티를 활성화
     */
    public void activate() {
        this.active = true;
    }

    // Domain Event 관련 메서드
    /**
     * 도메인 이벤트 등록
     */
    public void registerEvent(DomainEvent event) {
        if (this.domainEvents == null) {
            this.domainEvents = new ArrayList<>();
        }
        this.domainEvents.add(event);
    }

    /**
     * 등록된 도메인 이벤트 목록 반환 (읽기 전용)
     */
    public List<DomainEvent> getEvents() {
        return this.domainEvents == null ? 
            Collections.emptyList() : 
            Collections.unmodifiableList(this.domainEvents);
    }

    /**
     * 등록된 도메인 이벤트 모두 클리어
     */
    public void clearEvents() {
        if (this.domainEvents != null) {
            this.domainEvents.clear();
        }
    }

    /**
     * 등록된 도메인 이벤트가 있는지 확인
     */
    public boolean hasEvents() {
        return this.domainEvents != null && !this.domainEvents.isEmpty();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        BaseEntity that = (BaseEntity) obj;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}