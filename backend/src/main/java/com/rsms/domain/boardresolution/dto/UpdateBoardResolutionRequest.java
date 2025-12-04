package com.rsms.domain.boardresolution.dto;

import lombok.*;

/**
 * 이사회결의 수정 요청 DTO
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBoardResolutionRequest {

    /**
     * 이사회 결의명
     */
    private String resolutionName;

    /**
     * 요약정보
     */
    private String summary;

    /**
     * 내용
     */
    private String content;
}
