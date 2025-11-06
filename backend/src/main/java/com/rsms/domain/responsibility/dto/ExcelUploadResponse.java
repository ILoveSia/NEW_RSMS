package com.rsms.domain.responsibility.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 엑셀 업로드 응답 DTO
 * - 엑셀 업로드 처리 결과를 클라이언트에 반환
 *
 * @author Claude AI
 * @since 2025-11-06
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelUploadResponse {

    /**
     * 성공 건수
     */
    private int successCount;

    /**
     * 실패 건수
     */
    private int failCount;

    /**
     * 전체 건수
     */
    private int totalCount;

    /**
     * 에러 메시지 목록
     */
    @Builder.Default
    private List<String> errors = new ArrayList<>();

    /**
     * 에러 메시지 추가
     */
    public void addError(String error) {
        this.errors.add(error);
    }
}
