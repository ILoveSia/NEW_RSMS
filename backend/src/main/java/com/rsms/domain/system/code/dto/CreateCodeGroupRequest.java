package com.rsms.domain.system.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 공통코드 그룹 생성 요청 DTO
 *
 * @description 공통코드 그룹 생성 요청 데이터
 * @author Claude AI
 * @since 2025-09-24
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCodeGroupRequest {

    @NotBlank(message = "그룹코드는 필수입니다.")
    private String groupCode;

    @NotBlank(message = "그룹코드명은 필수입니다.")
    private String groupName;

    private String description;

    @NotBlank(message = "구분은 필수입니다.")
    private String category;

    @NotBlank(message = "카테고리 코드는 필수입니다.")
    private String categoryCode;

    @NotNull(message = "시스템 코드 여부는 필수입니다.")
    private Boolean systemCode;

    @NotNull(message = "수정 가능 여부는 필수입니다.")
    private Boolean editable;

    @NotNull(message = "정렬 순서는 필수입니다.")
    private Integer sortOrder;

    @NotBlank(message = "사용여부는 필수입니다.")
    private String isActive;
}
