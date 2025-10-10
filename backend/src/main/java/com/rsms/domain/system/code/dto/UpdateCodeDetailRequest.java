package com.rsms.domain.system.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 공통코드 상세 수정 요청 DTO
 *
 * @description 공통코드 상세 수정 요청 데이터
 * @author Claude AI
 * @since 2025-09-24
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCodeDetailRequest {

    @NotBlank(message = "상세코드명은 필수입니다.")
    private String detailName;

    private String description;

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
