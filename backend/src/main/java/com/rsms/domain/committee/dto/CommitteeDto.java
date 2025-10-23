package com.rsms.domain.committee.dto;

import com.rsms.domain.committee.entity.Committee;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 회의체 DTO
 *
 * @description 회의체 데이터 전송 객체
 * @author Claude AI
 * @since 2025-10-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeDto {

    /**
     * 회의체ID
     */
    private Long committeesId;

    /**
     * 원장차수ID
     */
    private String ledgerOrderId;

    /**
     * 회의체명
     */
    private String committeesTitle;

    /**
     * 개최주기
     */
    private String committeeFrequency;

    /**
     * 주요심의 의결 사항
     */
    private String resolutionMatters;

    /**
     * 사용여부
     */
    private String isActive;

    /**
     * 생성자
     */
    private String createdBy;

    /**
     * 생성일시
     */
    private String createdAt;

    /**
     * 수정자
     */
    private String updatedBy;

    /**
     * 수정일시
     */
    private String updatedAt;

    /**
     * 위원 목록
     */
    private List<CommitteeDetailDto> members;

    /**
     * Entity → DTO 변환
     */
    public static CommitteeDto from(Committee entity) {
        if (entity == null) {
            return null;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return CommitteeDto.builder()
                .committeesId(entity.getCommitteesId())
                .ledgerOrderId(entity.getLedgerOrderId())
                .committeesTitle(entity.getCommitteesTitle())
                .committeeFrequency(entity.getCommitteeFrequency())
                .resolutionMatters(entity.getResolutionMatters())
                .isActive(entity.getIsActive())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().format(formatter) : null)
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().format(formatter) : null)
                .build();
    }

    /**
     * Entity → DTO 변환 (위원 목록 포함)
     */
    public static CommitteeDto fromWithMembers(Committee entity, List<CommitteeDetailDto> members) {
        CommitteeDto dto = from(entity);
        if (dto != null) {
            dto.setMembers(members);
        }
        return dto;
    }
}
