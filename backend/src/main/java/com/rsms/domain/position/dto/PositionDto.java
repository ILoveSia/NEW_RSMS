package com.rsms.domain.position.dto;

import com.rsms.domain.position.entity.Position;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 직책 DTO
 * - 직책 데이터를 API 요청/응답에 사용
 * - Entity와 외부 계층 간 데이터 전송용
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PositionDto {

    /**
     * 직책ID (PK)
     */
    private Long positionsId;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 직책코드
     */
    private String positionsCd;

    /**
     * 직책명
     */
    private String positionsName;

    /**
     * 본부코드
     */
    private String hqCode;

    /**
     * 본부명
     */
    private String hqName;

    /**
     * 만료일
     */
    private LocalDate expirationDate;

    /**
     * 상태
     */
    private String positionsStatus;

    /**
     * 사용여부 (Y/N)
     */
    private String isActive;

    /**
     * 겸직여부 (Y/N)
     */
    private String isConcurrent;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * Entity를 DTO로 변환
     * - Position Entity → PositionDto 매핑
     *
     * @param entity Position Entity
     * @return PositionDto
     */
    public static PositionDto from(Position entity) {
        if (entity == null) {
            return null;
        }

        return PositionDto.builder()
            .positionsId(entity.getPositionsId())
            .ledgerOrderId(entity.getLedgerOrderId())
            .positionsCd(entity.getPositionsCd())
            .positionsName(entity.getPositionsName())
            .hqCode(entity.getHqCode())
            .hqName(entity.getHqName())
            .expirationDate(entity.getExpirationDate())
            .positionsStatus(entity.getPositionsStatus())
            .isActive(entity.getIsActive())
            .isConcurrent(entity.getIsConcurrent())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedBy(entity.getUpdatedBy())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    /**
     * DTO를 Entity로 변환
     * - PositionDto → Position Entity 매핑
     *
     * @return Position Entity
     */
    public Position toEntity() {
        return Position.builder()
            .positionsId(this.positionsId)
            .ledgerOrderId(this.ledgerOrderId)
            .positionsCd(this.positionsCd)
            .positionsName(this.positionsName)
            .hqCode(this.hqCode)
            .hqName(this.hqName)
            .expirationDate(this.expirationDate)
            .positionsStatus(this.positionsStatus)
            .isActive(this.isActive)
            .isConcurrent(this.isConcurrent)
            .createdBy(this.createdBy)
            .createdAt(this.createdAt)
            .updatedBy(this.updatedBy)
            .updatedAt(this.updatedAt)
            .build();
    }
}
