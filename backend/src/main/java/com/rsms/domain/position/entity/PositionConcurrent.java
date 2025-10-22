package com.rsms.domain.position.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 직책겸직 엔티티
 * - 여러 직책을 겸직하는 경우 동일한 concurrent_group_cd로 그룹핑됨
 * - position_concurrents 테이블 매핑
 */
@Entity
@Table(name = "position_concurrents", schema = "rsms")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PositionConcurrent {

    /**
     * 겸직ID (Primary Key, 자동 증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "position_concurrent_id")
    private Long positionConcurrentId;

    /**
     * 원장차수ID
     * - 외래키: ledger_order.ledger_order_id
     */
    @Column(name = "ledger_order_id", nullable = false, length = 8)
    private String ledgerOrderId;

    /**
     * 직책코드
     * - 외래키: positions.positions_cd
     */
    @Column(name = "positions_cd", nullable = false, length = 20)
    private String positionsCd;

    /**
     * 겸직그룹코드
     * - 같은 겸직 관계에 있는 직책들은 동일한 코드를 가짐
     * - 예: G0001, G0002, ...
     */
    @Column(name = "concurrent_group_cd", nullable = false, length = 20)
    private String concurrentGroupCd;

    /**
     * 직책명 (비정규화)
     */
    @Column(name = "positions_name", length = 200)
    private String positionsName;

    /**
     * 대표여부
     * - Y: 대표직책
     * - N: 일반직책
     */
    @Column(name = "is_representative", nullable = false, length = 1)
    private String isRepresentative;

    /**
     * 본부코드
     * - common_code_details의 DPRM_CD 그룹 참조
     */
    @Column(name = "hq_code", nullable = false, length = 20)
    private String hqCode;

    /**
     * 본부명
     */
    @Column(name = "hq_name", nullable = false, length = 200)
    private String hqName;

    /**
     * 사용여부
     * - Y: 사용
     * - N: 미사용
     */
    @Column(name = "is_active", nullable = false, length = 1)
    @Builder.Default
    private String isActive = "Y";

    /**
     * 등록자
     */
    @CreatedBy
    @Column(name = "created_by", nullable = false, updatable = false, length = 100)
    private String createdBy;

    /**
     * 등록일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    @LastModifiedBy
    @Column(name = "updated_by", nullable = false, length = 100)
    private String updatedBy;

    /**
     * 수정일시
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 겸직 활성화
     */
    public void activate() {
        this.isActive = "Y";
    }

    /**
     * 겸직 비활성화
     */
    public void deactivate() {
        this.isActive = "N";
    }

    /**
     * 대표직책으로 설정
     */
    public void setAsRepresentative() {
        this.isRepresentative = "Y";
    }

    /**
     * 일반직책으로 설정
     */
    public void unsetAsRepresentative() {
        this.isRepresentative = "N";
    }

    /**
     * 대표직책 여부 확인
     */
    public boolean isRepresentative() {
        return "Y".equals(this.isRepresentative);
    }

    /**
     * 활성화 여부 확인
     */
    public boolean isActive() {
        return "Y".equals(this.isActive);
    }

    /**
     * 등록자 조회 (BaseEntity 호환성)
     */
    public String getCreatedBy() {
        return this.createdBy;
    }

    /**
     * 수정자 조회 (BaseEntity 호환성)
     */
    public String getLastModifiedBy() {
        return this.updatedBy;
    }
}
