package com.rsms.domain.compliance.dto;

import lombok.*;

import java.util.List;

/**
 * 점검자 일괄 지정 요청 DTO
 * - impl_inspection_items 테이블의 inspector_id 일괄 업데이트용
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignInspectorBatchRequest {

    /**
     * 점검항목ID 목록
     * - impl_inspection_items 테이블의 impl_inspection_item_id
     */
    private List<String> itemIds;

    /**
     * 점검자ID
     * - employees 테이블의 emp_no
     */
    private String inspectorId;
}
