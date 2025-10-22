package com.rsms.domain.organization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 조직 엔티티
 * - organizations 테이블 매핑
 * - 본부, 부점, 영업점 조직 정보 관리
 *
 * @author Claude AI
 * @since 2025-10-21
 */
@Entity
@Table(name = "organizations", schema = "rsms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @Column(name = "org_code", length = 20)
    private String orgCode;

    @Column(name = "hq_code", length = 20, nullable = false)
    private String hqCode;

    @Column(name = "org_type", length = 20)
    private String orgType;

    @Column(name = "org_name", length = 200)
    private String orgName;

    @Column(name = "is_active", length = 1)
    private String isActive;

    @Column(name = "is_branch_office", length = 1)
    private String isBranchOffice;

    @Column(name = "is_closed", length = 1)
    private String isClosed;

    @Column(name = "closed_date")
    private LocalDate closedDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
