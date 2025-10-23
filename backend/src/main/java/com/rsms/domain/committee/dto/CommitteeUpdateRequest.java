package com.rsms.domain.committee.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

/**
 * 회의체 수정 요청 DTO
 *
 * @description 회의체 수정 시 사용하는 요청 데이터
 * @author Claude AI
 * @since 2025-10-24
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeUpdateRequest {

    /**
     * 회의체명
     */
    @NotBlank(message = "회의체명은 필수입니다")
    @Size(max = 200, message = "회의체명은 최대 200자입니다")
    private String committeesTitle;

    /**
     * 개최주기
     */
    @NotBlank(message = "개최주기는 필수입니다")
    @Size(max = 50, message = "개최주기는 최대 50자입니다")
    private String committeeFrequency;

    /**
     * 주요심의 의결 사항
     */
    private String resolutionMatters;

    /**
     * 사용여부 (Y/N)
     */
    @NotBlank(message = "사용여부는 필수입니다")
    @Size(max = 1, message = "사용여부는 Y 또는 N입니다")
    private String isActive;

    /**
     * 위원 목록
     */
    @Valid
    @NotNull(message = "위원 목록은 필수입니다")
    private List<CommitteeMemberRequest> members;

    /**
     * 위원 정보 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CommitteeMemberRequest {

        /**
         * 구분 (chairman/member)
         */
        @NotBlank(message = "구분은 필수입니다")
        private String committeesType;

        /**
         * 직책ID
         */
        @NotNull(message = "직책ID는 필수입니다")
        private Long positionsId;

        /**
         * 직책명
         */
        @NotBlank(message = "직책명은 필수입니다")
        private String positionsName;
    }
}
