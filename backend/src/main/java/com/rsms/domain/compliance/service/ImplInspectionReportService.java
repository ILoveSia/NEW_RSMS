package com.rsms.domain.compliance.service;

import com.rsms.domain.compliance.dto.ImplInspectionReportDto.*;
import com.rsms.domain.compliance.entity.ImplInspectionReport;
import com.rsms.domain.compliance.repository.ImplInspectionReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 이행점검결과보고서 서비스
 * - 이행점검결과보고서 CRUD 비즈니스 로직 처리
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImplInspectionReportService {

    private final ImplInspectionReportRepository reportRepository;

    // ===============================
    // 조회 (Read)
    // ===============================

    /**
     * 보고서 목록 조회
     * - ledgerOrderId 없으면 전체 조회
     * - 이행점검계획ID가 있으면 해당 계획의 보고서만 조회
     *
     * @param ledgerOrderId 원장차수ID (선택 - 없으면 전체 조회)
     * @param implInspectionPlanId 이행점검계획ID (선택)
     * @param orgCode 부서코드 (선택, 현재 미사용)
     * @return 보고서 목록
     */
    public List<Response> getReports(String ledgerOrderId, String implInspectionPlanId, String orgCode) {
        log.info("  [ImplInspectionReportService] 보고서 목록 조회 - ledgerOrderId: {}, planId: {}, orgCode: {}",
                ledgerOrderId, implInspectionPlanId, orgCode);

        List<ImplInspectionReport> reports;

        // ledgerOrderId가 없으면 전체 조회
        if (ledgerOrderId == null || ledgerOrderId.isEmpty()) {
            reports = reportRepository.findByIsActiveOrderByCreatedAtDesc("Y");
        } else if (implInspectionPlanId != null && !implInspectionPlanId.isEmpty()) {
            // 원장차수ID + 이행점검계획ID가 있는 경우
            reports = reportRepository.findByLedgerOrderIdAndImplInspectionPlanIdAndIsActiveOrderByCreatedAtDesc(
                    ledgerOrderId, implInspectionPlanId, "Y");
        } else {
            // 원장차수ID만 있는 경우
            reports = reportRepository.findByLedgerOrderIdAndIsActiveOrderByCreatedAtDesc(
                    ledgerOrderId, "Y");
        }

        log.info("  [ImplInspectionReportService] 조회된 보고서 수: {}", reports.size());
        return Response.fromEntityList(reports);
    }

    /**
     * 보고서 단건 조회
     *
     * @param implInspectionReportId 이행점검결과보고서ID
     * @return 보고서 정보
     */
    public Response getReport(String implInspectionReportId) {
        log.info("  [ImplInspectionReportService] 보고서 단건 조회 - reportId: {}", implInspectionReportId);

        ImplInspectionReport report = reportRepository.findById(implInspectionReportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "보고서를 찾을 수 없습니다: " + implInspectionReportId));

        return Response.fromEntity(report);
    }

    /**
     * 보고서구분별 목록 조회
     *
     * @param reportTypeCd 보고서구분코드 (01: CEO, 02: 임원)
     * @return 보고서 목록
     */
    public List<Response> getReportsByType(String reportTypeCd) {
        log.info("  [ImplInspectionReportService] 보고서구분별 조회 - reportTypeCd: {}", reportTypeCd);

        List<ImplInspectionReport> reports = reportRepository
                .findByReportTypeCdAndIsActiveOrderByCreatedAtDesc(reportTypeCd, "Y");

        return Response.fromEntityList(reports);
    }

    // ===============================
    // 생성 (Create)
    // ===============================

    /**
     * 보고서 생성
     * - ID는 DB 함수를 통해 자동 생성
     *
     * @param request 생성 요청 DTO
     * @param currentUser 현재 사용자
     * @return 생성된 보고서 정보
     */
    @Transactional
    public Response createReport(CreateRequest request, String currentUser) {
        log.info("  [ImplInspectionReportService] 보고서 생성 - planId: {}, reportType: {}, user: {}",
                request.getImplInspectionPlanId(), request.getReportTypeCd(), currentUser);

        // 1. ID 자동 생성 (DB 함수 호출)
        String generatedId = reportRepository.generateImplInspectionReportId(
                request.getImplInspectionPlanId());

        log.info("  [ImplInspectionReportService] 생성된 보고서 ID: {}", generatedId);

        // 2. Entity 생성 및 저장
        ImplInspectionReport report = request.toEntity(generatedId, currentUser);
        ImplInspectionReport saved = reportRepository.save(report);

        log.info("  [ImplInspectionReportService] 보고서 생성 완료 - reportId: {}", saved.getImplInspectionReportId());

        return Response.fromEntity(saved);
    }

    // ===============================
    // 수정 (Update)
    // ===============================

    /**
     * 보고서 수정
     *
     * @param implInspectionReportId 보고서 ID
     * @param request 수정 요청 DTO
     * @param currentUser 현재 사용자
     * @return 수정된 보고서 정보
     */
    @Transactional
    public Response updateReport(String implInspectionReportId, UpdateRequest request, String currentUser) {
        log.info("  [ImplInspectionReportService] 보고서 수정 - reportId: {}, user: {}",
                implInspectionReportId, currentUser);

        // 1. 기존 보고서 조회
        ImplInspectionReport report = reportRepository.findById(implInspectionReportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "보고서를 찾을 수 없습니다: " + implInspectionReportId));

        // 2. 수정 내용 적용
        request.applyTo(report, currentUser);

        // 3. 저장 (JPA dirty checking으로 자동 업데이트)
        ImplInspectionReport updated = reportRepository.save(report);

        log.info("  [ImplInspectionReportService] 보고서 수정 완료 - reportId: {}", updated.getImplInspectionReportId());

        return Response.fromEntity(updated);
    }

    // ===============================
    // 삭제 (Delete)
    // ===============================

    /**
     * 보고서 삭제 (논리적 삭제)
     * - is_active를 'N'으로 변경
     *
     * @param implInspectionReportId 보고서 ID
     * @param currentUser 현재 사용자
     */
    @Transactional
    public void deleteReport(String implInspectionReportId, String currentUser) {
        log.info("  [ImplInspectionReportService] 보고서 삭제 - reportId: {}, user: {}",
                implInspectionReportId, currentUser);

        ImplInspectionReport report = reportRepository.findById(implInspectionReportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "보고서를 찾을 수 없습니다: " + implInspectionReportId));

        // 논리적 삭제
        report.deactivate();
        report.setUpdatedBy(currentUser);

        reportRepository.save(report);

        log.info("  [ImplInspectionReportService] 보고서 삭제 완료 (논리적) - reportId: {}", implInspectionReportId);
    }

    /**
     * 보고서 일괄 삭제 (논리적 삭제)
     *
     * @param reportIds 삭제할 보고서 ID 목록
     * @param currentUser 현재 사용자
     * @return 삭제된 건수
     */
    @Transactional
    public int deleteReports(List<String> reportIds, String currentUser) {
        log.info("  [ImplInspectionReportService] 보고서 일괄 삭제 - count: {}, user: {}",
                reportIds.size(), currentUser);

        int deletedCount = 0;

        for (String reportId : reportIds) {
            try {
                deleteReport(reportId, currentUser);
                deletedCount++;
            } catch (IllegalArgumentException e) {
                log.warn("  [ImplInspectionReportService] 보고서 삭제 실패 - reportId: {}, reason: {}",
                        reportId, e.getMessage());
            }
        }

        log.info("  [ImplInspectionReportService] 보고서 일괄 삭제 완료 - deleted: {}/{}", deletedCount, reportIds.size());

        return deletedCount;
    }

    // ===============================
    // 통계/유틸리티
    // ===============================

    /**
     * 원장차수별 보고서 통계
     *
     * @param ledgerOrderId 원장차수ID
     * @return 보고서 수
     */
    public long getReportCount(String ledgerOrderId) {
        return reportRepository.countByLedgerOrderIdAndIsActive(ledgerOrderId, "Y");
    }

    /**
     * 이행점검계획별 보고서 존재 여부 확인
     *
     * @param implInspectionPlanId 이행점검계획ID
     * @param reportTypeCd 보고서구분코드
     * @return 존재 여부
     */
    public boolean existsReport(String implInspectionPlanId, String reportTypeCd) {
        return reportRepository.existsByImplInspectionPlanIdAndReportTypeCdAndIsActive(
                implInspectionPlanId, reportTypeCd, "Y");
    }
}
