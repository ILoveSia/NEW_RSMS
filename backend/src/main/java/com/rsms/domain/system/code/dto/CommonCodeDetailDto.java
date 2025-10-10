package com.rsms.domain.system.code.dto;

import com.rsms.domain.system.code.entity.CommonCodeDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 공통코드 상세 DTO
 *
 * @description 공통코드 상세 데이터 전송 객체
 * @author Claude AI
 * @since 2025-09-24
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonCodeDetailDto {

    private String groupCode;
    private String detailCode;
    private String detailName;
    private String description;
    private String parentCode;
    private Integer levelDepth;
    private Integer sortOrder;
    private String extAttr1;
    private String extAttr2;
    private String extAttr3;
    private String extraData;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private String isActive;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;

    /**
     * Entity를 DTO로 변환
     */
    public static CommonCodeDetailDto from(CommonCodeDetail entity) {
        if (entity == null) {
            return null;
        }

        return CommonCodeDetailDto.builder()
            .groupCode(entity.getGroupCode())
            .detailCode(entity.getDetailCode())
            .detailName(entity.getDetailName())
            .description(entity.getDescription())
            .parentCode(entity.getParentCode())
            .levelDepth(entity.getLevelDepth())
            .sortOrder(entity.getSortOrder())
            .extAttr1(entity.getExtAttr1())
            .extAttr2(entity.getExtAttr2())
            .extAttr3(entity.getExtAttr3())
            .extraData(entity.getExtraData())
            .validFrom(entity.getValidFrom())
            .validUntil(entity.getValidUntil())
            .isActive(entity.getIsActive())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedBy(entity.getUpdatedBy())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    /**
     * DTO를 Entity로 변환
     */
    public CommonCodeDetail toEntity() {
        return CommonCodeDetail.builder()
            .groupCode(this.groupCode)
            .detailCode(this.detailCode)
            .detailName(this.detailName)
            .description(this.description)
            .parentCode(this.parentCode)
            .levelDepth(this.levelDepth)
            .sortOrder(this.sortOrder)
            .extAttr1(this.extAttr1)
            .extAttr2(this.extAttr2)
            .extAttr3(this.extAttr3)
            .extraData(this.extraData)
            .validFrom(this.validFrom)
            .validUntil(this.validUntil)
            .isActive(this.isActive)
            .createdBy(this.createdBy)
            .createdAt(this.createdAt)
            .updatedBy(this.updatedBy)
            .updatedAt(this.updatedAt)
            .build();
    }
}
