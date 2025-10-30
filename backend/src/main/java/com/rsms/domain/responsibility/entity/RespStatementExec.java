package com.rsms.domain.responsibility.entity;

import com.rsms.domain.ledger.entity.LedgerOrder;
import com.rsms.domain.position.entity.Position;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.LocalDate;

/**
 * 책무기술서_임원_정보 엔티티
 * - 직책에 대한 책무기술서 임원정보를 관리
 * - positions 테이블과 1:1 관계
 * - BaseEntity를 상속하지 않음 (자체 PK 사용)
 *
 * @author RSMS
 * @since 2025-10-29
 */
@Entity
@Table(name = "resp_statement_execs", schema = "rsms")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RespStatementExec {

    /**
     * 책무기술서_임원_정보ID (PK, 자동증가)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resp_stmt_exec_id")
    private Long respStmtExecId;

    /**
     * 직책ID (FK → positions, UNIQUE for 1:1)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "positions_id", nullable = false, unique = true)
    private Position position;

    /**
     * 원장차수ID (FK → ledger_order)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ledger_order_id", nullable = false)
    private LedgerOrder ledgerOrder;

    /**
     * 사용자ID
     */
    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    /**
     * 이름
     */
    @Column(name = "executive_name", nullable = false, length = 100)
    private String executiveName;

    /**
     * 사번
     */
    @Column(name = "employee_no", length = 100)
    private String employeeNo;

    /**
     * 현 직책 부여일
     */
    @Column(name = "position_assigned_date")
    private LocalDate positionAssignedDate;

    /**
     * 겸직사항
     */
    @Column(name = "concurrent_position", length = 500)
    private String concurrentPosition;

    /**
     * 직무대행자 내용
     */
    @Column(name = "acting_officer_info", length = 2000)
    private String actingOfficerInfo;

    /**
     * 비고
     */
    @Column(name = "remarks", length = 1000)
    private String remarks;

    /**
     * 책무개요 내용
     */
    @Column(name = "responsibility_overview", length = 1000)
    private String responsibilityOverview;

    /**
     * 책무 배분일자
     */
    @Column(name = "responsibility_assigned_date")
    private LocalDate responsibilityAssignedDate;

    /**
     * 사용여부 (Y: 사용, N: 미사용)
     */
    @Column(name = "is_active", nullable = false, length = 1)
    @Builder.Default
    private String isActive = "Y";

    // ===== Audit 필드 (BaseEntity 대신 직접 정의) =====

    /**
     * 생성일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 생성자
     */
    @CreatedBy
    @Column(name = "created_by", nullable = false, length = 50, updatable = false)
    private String createdBy;

    /**
     * 수정자
     */
    @LastModifiedBy
    @Column(name = "updated_by", nullable = false, length = 50)
    private String updatedBy;
}
