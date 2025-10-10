package com.rsms.domain.system.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 공통코드 상세 생성 요청 DTO
 *
 * @description 공통코드 상세 생성 요청 데이터
 * @author Claude AI
 * @since 2025-09-24
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCodeDetailRequest {

    @NotBlank(message = "그룹코드는 필수입니다.")
    private String groupCode;

    @NotBlank(message = "상세코드는 필수입니다.")
    private String detailCode;

    @NotBlank(message = "상세코드명은 필수입니다.")
    private String detailName;

    private String description;

    private String parentCode;

    @NotNull(message = "레벨 깊이는 필수입니다.")
    private Integer levelDepth;

    @NotNull(message = "정렬 순서는 필수입니다.")
    private Integer sortOrder;

    private String extAttr1;

    private String extAttr2;

    private String extAttr3;

    private String extraData;

    private LocalDate validFrom;

    private LocalDate validUntil;

    @NotBlank(message = "사용여부는 필수입니다.")
    private String isActive;
}
