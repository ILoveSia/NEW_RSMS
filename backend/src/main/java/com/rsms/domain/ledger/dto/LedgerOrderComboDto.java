package com.rsms.domain.ledger.dto;

import com.rsms.domain.ledger.entity.LedgerOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 원장차수 콤보박스 DTO
 *
 * @description 원장차수 콤보박스용 경량 DTO (PROG, CLSD만 조회)
 * @author Claude AI
 * @since 2025-10-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerOrderComboDto {

    /**
     * 원장차수ID (예: 20250001)
     */
    private String ledgerOrderId;

    /**
     * 원장 제목 (예: 1차점검이행)
     */
    private String ledgerOrderTitle;

    /**
     * 원장상태 (PROG: 진행중, CLSD: 종료)
     */
    private String ledgerOrderStatus;

    /**
     * 콤보박스에 표시될 라벨 (포맷팅됨)
     * - PROG: "20250001-1차점검이행[진행중]"
     * - CLSD: "20250001-1차점검이행"
     */
    private String displayLabel;

    /**
     * Entity를 ComboDto로 변환 (라벨 자동 생성)
     */
    public static LedgerOrderComboDto from(LedgerOrder entity) {
        if (entity == null) {
            return null;
        }

        String label = formatDisplayLabel(
            entity.getLedgerOrderId(),
            entity.getLedgerOrderTitle(),
            entity.getLedgerOrderStatus()
        );

        return LedgerOrderComboDto.builder()
            .ledgerOrderId(entity.getLedgerOrderId())
            .ledgerOrderTitle(entity.getLedgerOrderTitle())
            .ledgerOrderStatus(entity.getLedgerOrderStatus())
            .displayLabel(label)
            .build();
    }

    /**
     * 콤보박스 표시용 라벨 포맷팅
     * - PROG: "20250001-1차점검이행[진행중]"
     * - CLSD: "20250001-1차점검이행"
     */
    private static String formatDisplayLabel(String id, String title, String status) {
        String baseLabel = id + "-" + title;

        // PROG일 때만 [진행중] 표시
        if ("PROG".equals(status)) {
            return baseLabel + "[진행중]";
        }

        return baseLabel;
    }
}
