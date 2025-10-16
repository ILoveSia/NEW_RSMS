package com.rsms.domain.ledger.dto;

import com.rsms.domain.ledger.entity.LedgerOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 원장차수 DTO
 *
 * @description 원장차수 데이터 전송 객체
 * @author Claude AI
 * @since 2025-10-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerOrderDto {

    private String ledgerOrderId;
    private String ledgerOrderTitle;
    private String ledgerOrderStatus;
    private String ledgerOrderRemarks;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    /**
     * Entity를 DTO로 변환
     */
    public static LedgerOrderDto from(LedgerOrder entity) {
        if (entity == null) {
            return null;
        }

        return LedgerOrderDto.builder()
            .ledgerOrderId(entity.getLedgerOrderId())
            .ledgerOrderTitle(entity.getLedgerOrderTitle())
            .ledgerOrderStatus(entity.getLedgerOrderStatus())
            .ledgerOrderRemarks(entity.getLedgerOrderRemarks())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedBy(entity.getUpdatedBy())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    /**
     * DTO를 Entity로 변환
     */
    public LedgerOrder toEntity() {
        return LedgerOrder.builder()
            .ledgerOrderId(this.ledgerOrderId)
            .ledgerOrderTitle(this.ledgerOrderTitle)
            .ledgerOrderStatus(this.ledgerOrderStatus)
            .ledgerOrderRemarks(this.ledgerOrderRemarks)
            .createdBy(this.createdBy)
            .createdAt(this.createdAt)
            .updatedBy(this.updatedBy)
            .updatedAt(this.updatedAt)
            .build();
    }
}
