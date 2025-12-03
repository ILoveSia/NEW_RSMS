package com.rsms.domain.submitreport.service;

import com.rsms.domain.common.attachment.repository.AttachmentRepository;
import com.rsms.domain.submitreport.dto.SubmitReportRequest;
import com.rsms.domain.submitreport.dto.SubmitReportResponse;
import com.rsms.domain.submitreport.dto.SubmitReportSearchRequest;
import com.rsms.domain.submitreport.entity.SubmitReport;
import com.rsms.domain.submitreport.repository.SubmitReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 제출보고서 서비스
 * - 제출보고서 CRUD 비즈니스 로직 처리
 * - 정부기관(금융감독원 등)에 제출하는 보고서 관리
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmitReportService {

    private final SubmitReportRepository submitReportRepository;
    private final AttachmentRepository attachmentRepository;

    /**
     * 첨부파일 엔티티 타입 (submit_reports 테이블)
     */
    private static final String ATTACHMENT_ENTITY_TYPE = "submit_reports";

    // ===============================
    // 조회 (Read)
    // ===============================

    /**
     * 제출보고서 목록 조회 (조건 검색)
     * - 검색조건이 없으면 전체 조회
     *
     * @param searchRequest 검색 조건 DTO
     * @return 제출보고서 목록
     */
    public List<SubmitReportResponse> searchReports(SubmitReportSearchRequest searchRequest) {
        log.info("  [SubmitReportService] 제출보고서 검색");
        log.info("    - 원장차수ID: {}", searchRequest.getLedgerOrderId());
        log.info("    - 제출기관: {}", searchRequest.getSubmittingAgencyCd());
        log.info("    - 보고서구분: {}", searchRequest.getReportTypeCd());
        log.info("    - 제출일From: {}", searchRequest.getSubmissionDateFrom());
        log.info("    - 제출일To: {}", searchRequest.getSubmissionDateTo());

        List<SubmitReport> reports = submitReportRepository.searchByConditions(
                searchRequest.getLedgerOrderId(),
                searchRequest.getSubmittingAgencyCd(),
                searchRequest.getReportTypeCd(),
                searchRequest.getSubmissionDateFrom(),
                searchRequest.getSubmissionDateTo()
        );

        log.info("  [SubmitReportService] 검색 결과: {} 건", reports.size());

        // Entity -> DTO 변환 시 첨부파일 개수 포함
        return reports.stream()
                .map(report -> {
                    int attachmentCount = (int) attachmentRepository
                            .countByEntityTypeAndEntityIdAndIsActiveY(
                                    ATTACHMENT_ENTITY_TYPE,
                                    String.valueOf(report.getReportId()));
                    return SubmitReportResponse.from(report, attachmentCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 전체 제출보고서 목록 조회
     *
     * @return 제출보고서 목록
     */
    public List<SubmitReportResponse> getAllReports() {
        log.info("  [SubmitReportService] 전체 제출보고서 조회");

        List<SubmitReport> reports = submitReportRepository.findAll();

        log.info("  [SubmitReportService] 조회 결과: {} 건", reports.size());

        // Entity -> DTO 변환 시 첨부파일 개수 포함
        return reports.stream()
                .map(report -> {
                    int attachmentCount = (int) attachmentRepository
                            .countByEntityTypeAndEntityIdAndIsActiveY(
                                    ATTACHMENT_ENTITY_TYPE,
                                    String.valueOf(report.getReportId()));
                    return SubmitReportResponse.from(report, attachmentCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 원장차수ID로 제출보고서 목록 조회
     *
     * @param ledgerOrderId 원장차수ID
     * @return 제출보고서 목록
     */
    public List<SubmitReportResponse> getReportsByLedgerOrderId(String ledgerOrderId) {
        log.info("  [SubmitReportService] 원장차수별 제출보고서 조회 - ledgerOrderId: {}", ledgerOrderId);

        List<SubmitReport> reports = submitReportRepository.findByLedgerOrderIdOrderBySubmissionDateDesc(ledgerOrderId);

        // Entity -> DTO 변환 시 첨부파일 개수 포함
        return reports.stream()
                .map(report -> {
                    int attachmentCount = (int) attachmentRepository
                            .countByEntityTypeAndEntityIdAndIsActiveY(
                                    ATTACHMENT_ENTITY_TYPE,
                                    String.valueOf(report.getReportId()));
                    return SubmitReportResponse.from(report, attachmentCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 제출보고서 단건 조회
     *
     * @param reportId 보고서ID
     * @return 제출보고서 정보
     */
    public SubmitReportResponse getReport(Long reportId) {
        log.info("  [SubmitReportService] 제출보고서 단건 조회 - reportId: {}", reportId);

        SubmitReport report = submitReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "제출보고서를 찾을 수 없습니다: " + reportId));

        // 첨부파일 개수 조회
        int attachmentCount = (int) attachmentRepository
                .countByEntityTypeAndEntityIdAndIsActiveY(
                        ATTACHMENT_ENTITY_TYPE,
                        String.valueOf(reportId));

        return SubmitReportResponse.from(report, attachmentCount);
    }

    // ===============================
    // 생성 (Create)
    // ===============================

    /**
     * 제출보고서 생성
     *
     * @param request 생성 요청 DTO
     * @param currentUser 현재 사용자
     * @return 생성된 제출보고서 정보
     */
    @Transactional
    public SubmitReportResponse createReport(SubmitReportRequest request, String currentUser) {
        log.info("  [SubmitReportService] 제출보고서 생성");
        log.info("    - 원장차수ID: {}", request.getLedgerOrderId());
        log.info("    - 제출기관: {}", request.getSubmittingAgencyCd());
        log.info("    - 보고서구분: {}", request.getReportTypeCd());
        log.info("    - 사용자: {}", currentUser);

        // Entity 생성
        SubmitReport report = SubmitReport.builder()
                .ledgerOrderId(request.getLedgerOrderId())
                .submittingAgencyCd(request.getSubmittingAgencyCd())
                .reportTypeCd(request.getReportTypeCd())
                .subReportTitle(request.getSubReportTitle())
                .targetExecutiveEmpNo(request.getTargetExecutiveEmpNo())
                .targetExecutiveName(request.getTargetExecutiveName())
                .positionId(request.getPositionId())
                .positionName(request.getPositionName())
                .submissionDate(request.getSubmissionDate())
                .remarks(request.getRemarks())
                .createdBy(currentUser)
                .updatedBy(currentUser)
                .build();

        SubmitReport saved = submitReportRepository.save(report);

        log.info("  [SubmitReportService] 제출보고서 생성 완료 - reportId: {}", saved.getReportId());

        return SubmitReportResponse.from(saved);
    }

    // ===============================
    // 수정 (Update)
    // ===============================

    /**
     * 제출보고서 수정
     *
     * @param reportId 보고서ID
     * @param request 수정 요청 DTO
     * @param currentUser 현재 사용자
     * @return 수정된 제출보고서 정보
     */
    @Transactional
    public SubmitReportResponse updateReport(Long reportId, SubmitReportRequest request, String currentUser) {
        log.info("  [SubmitReportService] 제출보고서 수정 - reportId: {}, user: {}", reportId, currentUser);

        // 기존 보고서 조회
        SubmitReport report = submitReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "제출보고서를 찾을 수 없습니다: " + reportId));

        // 수정 내용 적용
        report.update(
                request.getSubmittingAgencyCd(),
                request.getReportTypeCd(),
                request.getSubReportTitle(),
                request.getTargetExecutiveEmpNo(),
                request.getTargetExecutiveName(),
                request.getPositionId(),
                request.getPositionName(),
                request.getSubmissionDate(),
                request.getRemarks()
        );
        report.setUpdatedBy(currentUser);

        SubmitReport updated = submitReportRepository.save(report);

        log.info("  [SubmitReportService] 제출보고서 수정 완료 - reportId: {}", updated.getReportId());

        return SubmitReportResponse.from(updated);
    }

    // ===============================
    // 삭제 (Delete)
    // ===============================

    /**
     * 제출보고서 삭제 (물리적 삭제)
     * - submit_reports 테이블은 is_active 컬럼이 없으므로 물리적 삭제 수행
     *
     * @param reportId 보고서ID
     * @param currentUser 현재 사용자
     */
    @Transactional
    public void deleteReport(Long reportId, String currentUser) {
        log.info("  [SubmitReportService] 제출보고서 삭제 - reportId: {}, user: {}", reportId, currentUser);

        SubmitReport report = submitReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "제출보고서를 찾을 수 없습니다: " + reportId));

        submitReportRepository.delete(report);

        log.info("  [SubmitReportService] 제출보고서 삭제 완료 - reportId: {}", reportId);
    }

    /**
     * 제출보고서 일괄 삭제
     *
     * @param reportIds 삭제할 보고서 ID 목록
     * @param currentUser 현재 사용자
     * @return 삭제된 건수
     */
    @Transactional
    public int deleteReports(List<Long> reportIds, String currentUser) {
        log.info("  [SubmitReportService] 제출보고서 일괄 삭제 - count: {}, user: {}", reportIds.size(), currentUser);

        int deletedCount = 0;

        for (Long reportId : reportIds) {
            try {
                deleteReport(reportId, currentUser);
                deletedCount++;
            } catch (IllegalArgumentException e) {
                log.warn("  [SubmitReportService] 제출보고서 삭제 실패 - reportId: {}, reason: {}",
                        reportId, e.getMessage());
            }
        }

        log.info("  [SubmitReportService] 제출보고서 일괄 삭제 완료 - deleted: {}/{}", deletedCount, reportIds.size());

        return deletedCount;
    }

    // ===============================
    // 통계/유틸리티
    // ===============================

    /**
     * 원장차수별 제출보고서 수 조회
     *
     * @param ledgerOrderId 원장차수ID
     * @return 제출보고서 수
     */
    public long getReportCount(String ledgerOrderId) {
        return submitReportRepository.countByLedgerOrderId(ledgerOrderId);
    }
}
