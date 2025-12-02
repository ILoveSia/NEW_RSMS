package com.rsms.domain.approval.controller;

import com.rsms.domain.approval.dto.*;
import com.rsms.domain.approval.service.ApprovalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.rsms.domain.auth.security.CustomUserDetails;
import com.rsms.domain.employee.entity.Employee;
import com.rsms.domain.employee.repository.EmployeeRepository;
import com.rsms.domain.organization.entity.Organization;
import com.rsms.domain.organization.repository.OrganizationRepository;

/**
 * 결재 Controller
 *
 * @description 결재 문서 관리 REST API 제공
 * - 결재함 조회 (기안함, 결재대기함, 결재완료함)
 * - 결재 요청, 승인, 반려, 회수
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Slf4j
@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;

    /**
     * 현재 로그인한 사용자의 직원번호(empNo) 반환
     * - DB의 approver_id, drafter_id 등은 직원번호를 사용
     */
    private String getCurrentUserEmpNo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            String empNo = userDetails.getEmpNo();
            log.debug("현재 사용자 직원번호: {}", empNo);
            return empNo;
        }
        log.warn("인증 정보가 없거나 CustomUserDetails가 아님. anonymous 반환");
        return "anonymous";
    }

    /**
     * 현재 로그인한 사용자의 Employee 정보 조회
     * - empNo로 employees 테이블에서 조회
     */
    private Employee getCurrentEmployee() {
        String empNo = getCurrentUserEmpNo();
        if ("anonymous".equals(empNo)) {
            return null;
        }
        return employeeRepository.findByEmpNoAndNotDeleted(empNo).orElse(null);
    }

    /**
     * 현재 로그인한 사용자의 이름 반환
     * - Employee 엔티티에서 실제 이름(empName) 조회
     */
    private String getCurrentUserName() {
        Employee employee = getCurrentEmployee();
        if (employee != null) {
            return employee.getEmpName();
        }
        // Employee가 없으면 username 반환
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userDetails.getUser().getUsername();
        }
        return "사용자";
    }

    /**
     * 현재 로그인한 사용자의 부서코드 반환
     * - Employee 엔티티에서 실제 부서코드(orgCode) 조회
     */
    private String getCurrentUserDeptCd() {
        Employee employee = getCurrentEmployee();
        if (employee != null) {
            return employee.getOrgCode();
        }
        return null;
    }

    /**
     * 현재 로그인한 사용자의 부서명 반환
     * - Employee의 orgCode로 Organization 테이블에서 조회
     */
    private String getCurrentUserDeptName() {
        Employee employee = getCurrentEmployee();
        if (employee != null && employee.getOrgCode() != null) {
            // Organization 테이블에서 부서명 조회
            return organizationRepository.findById(employee.getOrgCode())
                    .map(Organization::getOrgName)
                    .orElse(employee.getOrgCode());
        }
        return null;
    }

    // ==============================
    // 결재함 조회
    // ==============================

    /**
     * 기안함 조회
     * - GET /api/approvals/draft-box
     */
    @GetMapping("/draft-box")
    public ResponseEntity<List<ApprovalDto>> getDraftBox() {
        String empNo = getCurrentUserEmpNo();
        log.info("GET /api/approvals/draft-box - 기안함 조회, empNo: {}", empNo);
        List<ApprovalDto> approvals = approvalService.getDraftBox(empNo);
        return ResponseEntity.ok(approvals);
    }

    /**
     * 결재대기함 조회
     * - GET /api/approvals/pending-box
     */
    @GetMapping("/pending-box")
    public ResponseEntity<List<ApprovalDto>> getPendingBox() {
        String empNo = getCurrentUserEmpNo();
        log.info("GET /api/approvals/pending-box - 결재대기함 조회, empNo: {}", empNo);
        List<ApprovalDto> approvals = approvalService.getPendingBox(empNo);
        log.info("결재대기함 조회 결과: {}건", approvals.size());
        return ResponseEntity.ok(approvals);
    }

    /**
     * 결재완료함 조회
     * - GET /api/approvals/completed-box
     */
    @GetMapping("/completed-box")
    public ResponseEntity<List<ApprovalDto>> getCompletedBox() {
        String empNo = getCurrentUserEmpNo();
        log.info("GET /api/approvals/completed-box - 결재완료함 조회, empNo: {}", empNo);
        List<ApprovalDto> approvals = approvalService.getCompletedBox(empNo);
        return ResponseEntity.ok(approvals);
    }

    /**
     * 기안함 검색
     * - GET /api/approvals/draft-box/search
     */
    @GetMapping("/draft-box/search")
    public ResponseEntity<List<ApprovalDto>> searchDraftBox(
            @RequestParam(required = false) String workTypeCd,
            @RequestParam(required = false) String approvalStatusCd,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        String empNo = getCurrentUserEmpNo();
        log.info("GET /api/approvals/draft-box/search - 기안함 검색, empNo: {}", empNo);

        ApprovalSearchRequest request = ApprovalSearchRequest.builder()
                .workTypeCd(workTypeCd)
                .approvalStatusCd(approvalStatusCd)
                .keyword(keyword)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        List<ApprovalDto> approvals = approvalService.searchDraftBox(empNo, request);
        return ResponseEntity.ok(approvals);
    }

    /**
     * 결재대기함 검색
     * - GET /api/approvals/pending-box/search
     */
    @GetMapping("/pending-box/search")
    public ResponseEntity<List<ApprovalDto>> searchPendingBox(
            @RequestParam(required = false) String workTypeCd,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        String empNo = getCurrentUserEmpNo();
        log.info("GET /api/approvals/pending-box/search - 결재대기함 검색, empNo: {}", empNo);

        ApprovalSearchRequest request = ApprovalSearchRequest.builder()
                .workTypeCd(workTypeCd)
                .keyword(keyword)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        List<ApprovalDto> approvals = approvalService.searchPendingBox(empNo, request);
        return ResponseEntity.ok(approvals);
    }

    /**
     * 결재함 건수 조회
     * - GET /api/approvals/box-count
     */
    @GetMapping("/box-count")
    public ResponseEntity<Map<String, Long>> getBoxCount() {
        String empNo = getCurrentUserEmpNo();
        log.info("GET /api/approvals/box-count - 결재함 건수 조회, empNo: {}", empNo);
        ApprovalService.ApprovalBoxCount count = approvalService.getBoxCount(empNo);
        return ResponseEntity.ok(Map.of(
                "draft", count.getDraft(),
                "pending", count.getPending(),
                "completed", count.getCompleted()
        ));
    }

    // ==============================
    // 결재 상세
    // ==============================

    /**
     * 결재 문서 상세 조회
     * - GET /api/approvals/{approvalId}
     */
    @GetMapping("/{approvalId}")
    public ResponseEntity<ApprovalDto> getApproval(@PathVariable String approvalId) {
        log.info("GET /api/approvals/{} - 결재 문서 조회", approvalId);
        ApprovalDto approval = approvalService.getApproval(approvalId);
        return ResponseEntity.ok(approval);
    }

    // ==============================
    // 결재 요청/처리
    // ==============================

    /**
     * 결재 요청 (기안)
     * - POST /api/approvals
     */
    @PostMapping
    public ResponseEntity<ApprovalDto> createApproval(
            @Valid @RequestBody CreateApprovalRequest request) {
        log.info("POST /api/approvals - 결재 요청: {}", request.getTitle());

        // CustomUserDetails에서 사용자 정보 조회
        String empNo = getCurrentUserEmpNo();
        String userName = getCurrentUserName();
        String deptCd = getCurrentUserDeptCd();
        String deptName = getCurrentUserDeptName();

        ApprovalDto created = approvalService.createApproval(request, empNo, userName, deptCd, deptName);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 결재 처리 (승인/반려)
     * - POST /api/approvals/{approvalId}/process
     */
    @PostMapping("/{approvalId}/process")
    public ResponseEntity<ApprovalDto> processApproval(
            @PathVariable String approvalId,
            @Valid @RequestBody ProcessApprovalRequest request) {
        log.info("POST /api/approvals/{}/process - 결재 처리: {}", approvalId, request.getResultCd());

        String empNo = getCurrentUserEmpNo();
        String userName = getCurrentUserName();
        String deptCd = getCurrentUserDeptCd();
        String deptName = getCurrentUserDeptName();

        ApprovalDto processed = approvalService.processApproval(
                approvalId, request, empNo, userName, deptCd, deptName);
        return ResponseEntity.ok(processed);
    }

    /**
     * 결재 회수
     * - POST /api/approvals/{approvalId}/withdraw
     */
    @PostMapping("/{approvalId}/withdraw")
    public ResponseEntity<ApprovalDto> withdrawApproval(
            @PathVariable String approvalId) {
        String empNo = getCurrentUserEmpNo();
        log.info("POST /api/approvals/{}/withdraw - 결재 회수, empNo: {}", approvalId, empNo);
        ApprovalDto withdrawn = approvalService.withdrawApproval(approvalId, empNo);
        return ResponseEntity.ok(withdrawn);
    }

    /**
     * 결재 일괄 처리 (승인)
     * - POST /api/approvals/batch-approve
     */
    @PostMapping("/batch-approve")
    public ResponseEntity<Map<String, Object>> batchApprove(
            @RequestBody List<String> approvalIds,
            @RequestParam(required = false) String comment) {
        log.info("POST /api/approvals/batch-approve - 일괄 승인: {} 건", approvalIds.size());

        String empNo = getCurrentUserEmpNo();
        String userName = getCurrentUserName();
        String deptCd = getCurrentUserDeptCd();
        String deptName = getCurrentUserDeptName();

        int successCount = 0;
        int failCount = 0;

        ProcessApprovalRequest request = ProcessApprovalRequest.builder()
                .resultCd("APPROVE")
                .comment(comment != null ? comment : "일괄 승인")
                .build();

        for (String approvalId : approvalIds) {
            try {
                approvalService.processApproval(approvalId, request, empNo, userName, deptCd, deptName);
                successCount++;
            } catch (Exception e) {
                log.error("일괄 승인 실패 - id: {}, error: {}", approvalId, e.getMessage());
                failCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", successCount,
                "fail", failCount
        ));
    }

    /**
     * 결재 일괄 처리 (반려)
     * - POST /api/approvals/batch-reject
     */
    @PostMapping("/batch-reject")
    public ResponseEntity<Map<String, Object>> batchReject(
            @RequestBody List<String> approvalIds,
            @RequestParam(required = false) String comment) {
        log.info("POST /api/approvals/batch-reject - 일괄 반려: {} 건", approvalIds.size());

        String empNo = getCurrentUserEmpNo();
        String userName = getCurrentUserName();
        String deptCd = getCurrentUserDeptCd();
        String deptName = getCurrentUserDeptName();

        int successCount = 0;
        int failCount = 0;

        ProcessApprovalRequest request = ProcessApprovalRequest.builder()
                .resultCd("REJECT")
                .comment(comment != null ? comment : "일괄 반려")
                .build();

        for (String approvalId : approvalIds) {
            try {
                approvalService.processApproval(approvalId, request, empNo, userName, deptCd, deptName);
                successCount++;
            } catch (Exception e) {
                log.error("일괄 반려 실패 - id: {}, error: {}", approvalId, e.getMessage());
                failCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", successCount,
                "fail", failCount
        ));
    }
}
