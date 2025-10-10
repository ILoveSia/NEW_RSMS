package com.rsms.domain.system.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 공통코드 그룹 수정 요청 DTO
 *
 * @description 공통코드 그룹 수정 요청 데이터
 * @author Claude AI
 * @since 2025-09-24
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCodeGroupRequest {

    @NotBlank(message = "그룹코드명은 필수입니다.")
    private String groupName;

    private String description;

    @NotBlank(message = "구분은 필수입니다.")
    private String category;

    @NotNull(message = "정렬 순서는 필수입니다.")
    private Integer sortOrder;

    @NotBlank(message = "사용여부는 필수입니다.")
    private String isActive;
}
