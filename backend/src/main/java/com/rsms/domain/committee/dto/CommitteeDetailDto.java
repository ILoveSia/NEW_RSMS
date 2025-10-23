package com.rsms.domain.committee.dto;

import com.rsms.domain.committee.entity.CommitteeDetail;
import lombok.*;

import java.time.format.DateTimeFormatter;

/**
 * 회의체 상세정보 DTO
 *
 * @description 회의체 위원 데이터 전송 객체
 * @author Claude AI
 * @since 2025-10-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeDetailDto {

    /**
     * 회의체상세ID
     */
    private Long committeeDetailsId;

    /**
     * 회의체ID
     */
    private Long committeesId;

    /**
     * 구분 (chairman: 위원장, member: 위원)
     */
    private String committeesType;

    /**
     * 직책ID
     */
    private Long positionsId;

    /**
     * 직책명
     */
    private String positionsName;

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
     * Entity → DTO 변환
     *
     * @param entity CommitteeDetail 엔티티
     * @return CommitteeDetailDto (positionsName은 별도 설정 필요)
     */
    public static CommitteeDetailDto from(CommitteeDetail entity) {
        if (entity == null) {
            return null;
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        return CommitteeDetailDto.builder()
                .committeeDetailsId(entity.getCommitteeDetailsId())
                .committeesId(entity.getCommitteesId())
                .committeesType(entity.getCommitteesType())
                .positionsId(entity.getPositionsId())
                .positionsName(null)  // DB에 없는 컬럼, positions 테이블과 JOIN 필요
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().format(formatter) : null)
                .updatedBy(entity.getUpdatedBy())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().format(formatter) : null)
                .build();
    }
}
