package com.rsms.domain.position.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 직책겸직 등록 요청 DTO
 * - 여러 직책을 한번에 등록 (같은 겸직그룹)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePositionConcurrentRequest {

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 겸직 직책 목록
     * - 같은 겸직그룹에 속할 직책들
     */
    private List<PositionConcurrentItem> positions;

    /**
     * 겸직 직책 항목
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PositionConcurrentItem {
        /**
         * 직책코드
         */
        private String positionsCd;

        /**
         * 직책명
         */
        private String positionsName;

        /**
         * 대표여부 (Y/N)
         */
        private String isRepresentative;

        /**
         * 본부코드
         */
        private String hqCode;

        /**
         * 본부명
         */
        private String hqName;
    }
}
