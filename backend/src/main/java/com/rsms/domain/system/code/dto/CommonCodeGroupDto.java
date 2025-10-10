package com.rsms.domain.system.code.dto;

import com.rsms.domain.system.code.entity.CommonCodeGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 공통코드 그룹 DTO
 *
 * @description 공통코드 그룹 데이터 전송 객체
 * @author Claude AI
 * @since 2025-09-24
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonCodeGroupDto {

    private String groupCode;
    private String groupName;
    private String description;
    private String category;
    private String categoryCode;
    private Boolean systemCode;
    private Boolean editable;
    private Integer sortOrder;
    private String isActive;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
    private List<CommonCodeDetailDto> details;

    /**
     * Entity를 DTO로 변환
     */
    public static CommonCodeGroupDto from(CommonCodeGroup entity) {
        if (entity == null) {
            return null;
        }

        return CommonCodeGroupDto.builder()
            .groupCode(entity.getGroupCode())
            .groupName(entity.getGroupName())
            .description(entity.getDescription())
            .category(entity.getCategory())
            .categoryCode(entity.getCategoryCode())
            .systemCode(entity.getSystemCode())
            .editable(entity.getEditable())
            .sortOrder(entity.getSortOrder())
            .isActive(entity.getIsActive())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedBy(entity.getUpdatedBy())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    /**
     * Entity를 DTO로 변환 (상세 포함)
     */
    public static CommonCodeGroupDto fromWithDetails(CommonCodeGroup entity) {
        if (entity == null) {
            return null;
        }

        CommonCodeGroupDto dto = from(entity);

        if (entity.getDetails() != null && !entity.getDetails().isEmpty()) {
            dto.setDetails(
                entity.getDetails().stream()
                    .map(CommonCodeDetailDto::from)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    /**
     * DTO를 Entity로 변환
     */
    public CommonCodeGroup toEntity() {
        return CommonCodeGroup.builder()
            .groupCode(this.groupCode)
            .groupName(this.groupName)
            .description(this.description)
            .category(this.category)
            .categoryCode(this.categoryCode)
            .systemCode(this.systemCode)
            .editable(this.editable)
            .sortOrder(this.sortOrder)
            .isActive(this.isActive)
            .createdBy(this.createdBy)
            .createdAt(this.createdAt)
            .updatedBy(this.updatedBy)
            .updatedAt(this.updatedAt)
            .build();
    }
}
