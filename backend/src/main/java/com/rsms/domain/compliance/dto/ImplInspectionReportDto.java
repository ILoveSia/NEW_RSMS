package com.rsms.domain.compliance.dto;

import com.rsms.domain.compliance.entity.ImplInspectionReport;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 이행점검결과보고서 DTO 클래스
 * - 요청/응답 DTO 정의
 * - Entity ↔ DTO 변환 메서드 포함
 *
 * @author Claude AI
 * @since 2025-12-03
 */
public class ImplInspectionReportDto {

    /**
     * 이행점검결과보고서 응답 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        /** 이행점검결과보고서ID */
        private String implInspectionReportId;
        /** 원장차수ID */
        private String ledgerOrderId;
        /** 이행점검계획ID */
        private String implInspectionPlanId;
        /** 보고서구분코드 */
        private String reportTypeCd;
        /** 보고서구분명 */
        private String reportTypeName;
        /** 검토내용 */
        private String reviewContent;
        /** 검토일자 */
        private LocalDate reviewDate;
        /** 결과 */
        private String result;
        /** 개선조치 */
        private String improvementAction;
        /** 비고 */
        private String remarks;
        /** 사용여부 */
        private String isActive;
        /** 등록일시 */
        private LocalDateTime createdAt;
        /** 등록자 */
        private String createdBy;
        /** 수정일시 */
        private LocalDateTime updatedAt;
        /** 수정자 */
        private String updatedBy;

        // 추가 정보 (조인 데이터)
        /** 이행점검명 */
        private String implInspectionName;
        /** 점검기간 (시작일 ~ 종료일) */
        private String inspectionPeriod;

        /**
         * Entity → Response DTO 변환
         */
        public static Response fromEntity(ImplInspectionReport entity) {
            if (entity == null) {
                return null;
            }

            ResponseBuilder builder = Response.builder()
                    .implInspectionReportId(entity.getImplInspectionReportId())
                    .ledgerOrderId(entity.getLedgerOrderId())
                    .implInspectionPlanId(entity.getImplInspectionPlanId())
                    .reportTypeCd(entity.getReportTypeCd())
                    .reportTypeName(entity.getReportTypeName())
                    .reviewContent(entity.getReviewContent())
                    .reviewDate(entity.getReviewDate())
                    .result(entity.getResult())
                    .improvementAction(entity.getImprovementAction())
                    .remarks(entity.getRemarks())
                    .isActive(entity.getIsActive())
                    .createdAt(entity.getCreatedAt())
                    .createdBy(entity.getCreatedBy())
                    .updatedAt(entity.getUpdatedAt())
                    .updatedBy(entity.getUpdatedBy());

            // 이행점검계획 정보 추가 (연관 엔티티 로드된 경우)
            if (entity.getImplInspectionPlan() != null) {
                builder.implInspectionName(entity.getImplInspectionPlan().getImplInspectionName());
                builder.inspectionPeriod(
                        entity.getImplInspectionPlan().getImplInspectionStartDate() + " ~ " +
                        entity.getImplInspectionPlan().getImplInspectionEndDate()
                );
            }

            return builder.build();
        }

        /**
         * Entity 리스트 → Response DTO 리스트 변환
         */
        public static List<Response> fromEntityList(List<ImplInspectionReport> entities) {
            return entities.stream()
                    .map(Response::fromEntity)
                    .collect(Collectors.toList());
        }
    }

    /**
     * 이행점검결과보고서 생성 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        /** 원장차수ID (필수) */
        private String ledgerOrderId;
        /** 이행점검계획ID (필수) */
        private String implInspectionPlanId;
        /** 보고서구분코드 (필수: 01-CEO, 02-임원) */
        private String reportTypeCd;
        /** 검토내용 */
        private String reviewContent;
        /** 검토일자 */
        private LocalDate reviewDate;
        /** 결과 */
        private String result;
        /** 개선조치 */
        private String improvementAction;
        /** 비고 */
        private String remarks;

        /**
         * CreateRequest → Entity 변환
         */
        public ImplInspectionReport toEntity(String generatedId, String currentUser) {
            LocalDateTime now = LocalDateTime.now();
            return ImplInspectionReport.builder()
                    .implInspectionReportId(generatedId)
                    .ledgerOrderId(this.ledgerOrderId)
                    .implInspectionPlanId(this.implInspectionPlanId)
                    .reportTypeCd(this.reportTypeCd)
                    .reviewContent(this.reviewContent)
                    .reviewDate(this.reviewDate)
                    .result(this.result)
                    .improvementAction(this.improvementAction)
                    .remarks(this.remarks)
                    .isActive("Y")
                    .createdAt(now)
                    .createdBy(currentUser)
                    .updatedAt(now)
                    .updatedBy(currentUser)
                    .build();
        }
    }

    /**
     * 이행점검결과보고서 수정 요청 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        /** 보고서구분코드 */
        private String reportTypeCd;
        /** 검토내용 */
        private String reviewContent;
        /** 검토일자 */
        private LocalDate reviewDate;
        /** 결과 */
        private String result;
        /** 개선조치 */
        private String improvementAction;
        /** 비고 */
        private String remarks;

        /**
         * Entity 업데이트 적용
         */
        public void applyTo(ImplInspectionReport entity, String currentUser) {
            if (this.reportTypeCd != null) {
                entity.setReportTypeCd(this.reportTypeCd);
            }
            if (this.reviewContent != null) {
                entity.setReviewContent(this.reviewContent);
            }
            if (this.reviewDate != null) {
                entity.setReviewDate(this.reviewDate);
            }
            if (this.result != null) {
                entity.setResult(this.result);
            }
            if (this.improvementAction != null) {
                entity.setImprovementAction(this.improvementAction);
            }
            if (this.remarks != null) {
                entity.setRemarks(this.remarks);
            }
            entity.setUpdatedBy(currentUser);
            entity.setUpdatedAt(LocalDateTime.now());
        }
    }

    /**
     * 이행점검결과보고서 검색 조건 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchCondition {
        /** 원장차수ID */
        private String ledgerOrderId;
        /** 이행점검계획ID */
        private String implInspectionPlanId;
        /** 보고서구분코드 */
        private String reportTypeCd;
        /** 부서코드 */
        private String orgCode;
        /** 검토일자 시작 */
        private LocalDate reviewDateFrom;
        /** 검토일자 종료 */
        private LocalDate reviewDateTo;
    }

    /**
     * 이행점검결과보고서 목록 응답 DTO (페이징 포함)
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        /** 보고서 목록 */
        private List<Response> reports;
        /** 전체 건수 */
        private long totalCount;
        /** 현재 페이지 */
        private int page;
        /** 페이지 크기 */
        private int size;
        /** 전체 페이지 수 */
        private int totalPages;
    }
}
