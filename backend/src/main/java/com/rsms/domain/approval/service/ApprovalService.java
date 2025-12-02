package com.rsms.domain.approval.service;

import com.rsms.domain.approval.dto.*;
import com.rsms.domain.approval.entity.Approval;
import com.rsms.domain.approval.entity.ApprovalHistory;
import com.rsms.domain.approval.entity.ApprovalLine;
import com.rsms.domain.approval.entity.ApprovalLineStep;
import com.rsms.domain.approval.repository.ApprovalHistoryRepository;
import com.rsms.domain.approval.repository.ApprovalLineRepository;
import com.rsms.domain.approval.repository.ApprovalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 결재 서비스
 *
 * @description 결재 관련 비즈니스 로직 처리
 * - 결재 요청, 승인, 반려
 * - 결재함(기안함, 결재대기함, 결재완료함) 조회
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final ApprovalLineRepository approvalLineRepository;

    // ==============================
    // 결재함 조회
    // ==============================

    /**
     * 기안함 조회 (내가 기안한 문서)
     */
    public List<ApprovalDto> getDraftBox(String userId) {
        log.info("기안함 조회 - userId: {}", userId);
        return approvalRepository.findDraftBox(userId).stream()
                .map(ApprovalDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재대기함 조회 (내가 결재할 문서)
     */
    public List<ApprovalDto> getPendingBox(String userId) {
        log.info("결재대기함 조회 - userId: {}", userId);
        return approvalRepository.findPendingBox(userId).stream()
                .map(ApprovalDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재완료함 조회 (내가 결재한 문서)
     */
    public List<ApprovalDto> getCompletedBox(String userId) {
        log.info("결재완료함 조회 - userId: {}", userId);
        return approvalRepository.findCompletedBox(userId).stream()
                .map(ApprovalDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 기안함 검색
     */
    public List<ApprovalDto> searchDraftBox(String userId, ApprovalSearchRequest request) {
        log.info("기안함 검색 - userId: {}", userId);
        LocalDateTime startDate = request.getStartDate() != null ?
                request.getStartDate().atStartOfDay() : null;
        LocalDateTime endDate = request.getEndDate() != null ?
                request.getEndDate().atTime(23, 59, 59) : null;

        return approvalRepository.searchDraftBox(
                userId,
                request.getWorkTypeCd(),
                request.getApprovalStatusCd(),
                request.getKeyword(),
                startDate,
                endDate
        ).stream()
                .map(ApprovalDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재대기함 검색
     */
    public List<ApprovalDto> searchPendingBox(String userId, ApprovalSearchRequest request) {
        log.info("결재대기함 검색 - userId: {}", userId);
        LocalDateTime startDate = request.getStartDate() != null ?
                request.getStartDate().atStartOfDay() : null;
        LocalDateTime endDate = request.getEndDate() != null ?
                request.getEndDate().atTime(23, 59, 59) : null;

        return approvalRepository.searchPendingBox(
                userId,
                request.getWorkTypeCd(),
                request.getKeyword(),
                startDate,
                endDate
        ).stream()
                .map(ApprovalDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재함 건수 조회
     */
    public ApprovalBoxCount getBoxCount(String userId) {
        long draft = approvalRepository.countByDrafterId(userId);
        long pending = approvalRepository.countPendingBox(userId);
        long completed = approvalRepository.countCompletedBox(userId);

        return ApprovalBoxCount.builder()
                .draft(draft)
                .pending(pending)
                .completed(completed)
                .build();
    }

    // ==============================
    // 결재 상세
    // ==============================

    /**
     * 결재 문서 상세 조회
     */
    public ApprovalDto getApproval(String approvalId) {
        log.info("결재 문서 조회 - id: {}", approvalId);
        Approval approval = approvalRepository.findByIdWithHistories(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다: " + approvalId));
        return ApprovalDto.fromEntity(approval);
    }

    // ==============================
    // 결재 요청
    // ==============================

    /**
     * 결재 요청 (기안)
     */
    @Transactional
    public ApprovalDto createApproval(CreateApprovalRequest request, String userId, String userName,
                                       String deptCd, String deptName) {
        log.info("결재 요청 - title: {}, userId: {}", request.getTitle(), userId);

        // 결재선 조회
        ApprovalLine approvalLine = approvalLineRepository.findByIdWithSteps(request.getApprovalLineId())
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + request.getApprovalLineId()));

        // 결재선 단계 확인
        List<ApprovalLineStep> steps = approvalLine.getSteps();
        if (steps.isEmpty()) {
            throw new IllegalArgumentException("결재선에 단계가 없습니다.");
        }

        // 첫 번째 결재자 찾기 (기안 다음 단계)
        ApprovalLineStep firstApproverStep = steps.stream()
                .filter(s -> s.getStepOrder() > 1)
                .findFirst()
                .orElse(null);

        // 결재 ID, 번호 생성
        String approvalId = generateApprovalId();
        String approvalNo = generateApprovalNo();

        // 결재 문서 생성
        Approval approval = Approval.builder()
                .approvalId(approvalId)
                .approvalNo(approvalNo)
                .title(request.getTitle())
                .content(request.getContent())
                .workTypeCd(request.getWorkTypeCd())
                .approvalTypeCd(request.getApprovalTypeCd())  // 결재유형코드 (PLAN_APPROVAL, COMPLETE_APPROVAL, RESULT_APPROVAL)
                .approvalStatusCd(firstApproverStep != null ? "02" : "03") // 다음 결재자가 있으면 진행중, 없으면 완료
                .approvalLineId(request.getApprovalLineId())
                .drafterId(userId)
                .drafterName(userName)
                .drafterDeptId(deptCd)
                .drafterDeptName(deptName)
                .draftDate(LocalDateTime.now())
                .currentApproverId(firstApproverStep != null ? firstApproverStep.getApproverId() : null)
                .currentApproverName(firstApproverStep != null ? firstApproverStep.getApproverName() : null)
                .currentStep(1)
                .totalSteps(steps.size())
                .referenceType(request.getRefDocType())
                .referenceId(request.getRefDocId())
                .priorityCd(request.getIsUrgent() != null && "Y".equals(request.getIsUrgent()) ? "HIGH" : "MEDIUM")
                .createdBy(userId)
                .createdAt(LocalDateTime.now())
                .build();

        if (firstApproverStep == null) {
            approval.setCompletedDate(LocalDateTime.now());
        }

        Approval savedApproval = approvalRepository.save(approval);

        // 기안 이력 생성
        ApprovalLineStep draftStep = steps.stream()
                .filter(s -> s.getStepOrder() == 1)
                .findFirst()
                .orElse(steps.get(0));

        String historyId = generateApprovalHistoryId();
        ApprovalHistory draftHistory = ApprovalHistory.builder()
                .approvalHistoryId(historyId)
                .approval(savedApproval)
                .stepSequence(1)
                .stepName(draftStep.getStepName())
                .stepTypeCd(draftStep.getApprovalTypeCd())
                .actionCd("DRAFT")
                .approverId(userId)
                .approverName(userName)
                .approverDeptId(deptCd)
                .approverDeptName(deptName)
                .actionDate(LocalDateTime.now())
                .actionComment("기안")
                .createdBy(userId)
                .createdAt(LocalDateTime.now())
                .build();
        approvalHistoryRepository.save(draftHistory);

        // 다음 결재자 대기 이력 생성
        if (firstApproverStep != null) {
            String pendingHistoryId = generateApprovalHistoryId();
            ApprovalHistory pendingHistory = ApprovalHistory.builder()
                    .approvalHistoryId(pendingHistoryId)
                    .approval(savedApproval)
                    .stepSequence(firstApproverStep.getStepOrder())
                    .stepName(firstApproverStep.getStepName())
                    .stepTypeCd(firstApproverStep.getApprovalTypeCd())
                    .actionCd("DRAFT") // 초기 상태 - 아직 처리 안됨
                    .approverId(firstApproverStep.getApproverId())
                    .approverName(firstApproverStep.getApproverName())
                    .createdBy(userId)
                    .createdAt(LocalDateTime.now())
                    .build();
            approvalHistoryRepository.save(pendingHistory);
        }

        log.info("결재 요청 완료 - id: {}, no: {}", savedApproval.getApprovalId(), savedApproval.getApprovalNo());
        return ApprovalDto.fromEntity(savedApproval);
    }

    // ==============================
    // 결재 처리
    // ==============================

    /**
     * 결재 처리 (승인/반려)
     */
    @Transactional
    public ApprovalDto processApproval(String approvalId, ProcessApprovalRequest request,
                                        String userId, String userName, String deptCd, String deptName) {
        log.info("결재 처리 - id: {}, result: {}", approvalId, request.getResultCd());

        Approval approval = approvalRepository.findByIdWithHistories(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다: " + approvalId));

        // 결재 가능 상태 확인
        if (!approval.canProcess()) {
            throw new IllegalStateException("결재할 수 없는 상태입니다.");
        }

        // 현재 결재자 확인
        if (!userId.equals(approval.getCurrentApproverId())) {
            throw new IllegalStateException("현재 결재자가 아닙니다.");
        }

        // 현재 대기중인 이력 조회
        ApprovalHistory currentHistory = approvalHistoryRepository
                .findByApproval_ApprovalIdAndStepSequence(approvalId, approval.getCurrentStep() + 1)
                .orElseThrow(() -> new IllegalStateException("결재 이력을 찾을 수 없습니다."));

        // 승인 처리
        if ("APPROVE".equals(request.getResultCd())) {
            currentHistory.approve(request.getComment());
            currentHistory.setApproverDeptId(deptCd);
            currentHistory.setApproverDeptName(deptName);

            // 다음 단계 확인
            ApprovalLine approvalLine = approvalLineRepository.findByIdWithSteps(approval.getApprovalLineId())
                    .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다."));

            int nextStepOrder = approval.getCurrentStep() + 2; // 현재 기준 다음 단계
            ApprovalLineStep nextStep = approvalLine.getSteps().stream()
                    .filter(s -> s.getStepOrder() == nextStepOrder)
                    .findFirst()
                    .orElse(null);

            if (nextStep != null) {
                // 다음 결재자 설정
                approval.processApproval(nextStep.getApproverId(), nextStep.getApproverName());

                // 다음 결재자 대기 이력 생성
                String nextHistoryId = generateApprovalHistoryId();
                ApprovalHistory nextHistory = ApprovalHistory.builder()
                        .approvalHistoryId(nextHistoryId)
                        .approval(approval)
                        .stepSequence(nextStep.getStepOrder())
                        .stepName(nextStep.getStepName())
                        .stepTypeCd(nextStep.getApprovalTypeCd())
                        .actionCd("DRAFT") // 초기 상태 - 아직 처리 안됨
                        .approverId(nextStep.getApproverId())
                        .approverName(nextStep.getApproverName())
                        .createdBy(userId)
                        .createdAt(LocalDateTime.now())
                        .build();
                approvalHistoryRepository.save(nextHistory);
            } else {
                // 마지막 단계 - 결재 완료
                approval.complete();
            }
        }
        // 반려 처리
        else if ("REJECT".equals(request.getResultCd())) {
            currentHistory.reject(request.getComment());
            currentHistory.setApproverDeptId(deptCd);
            currentHistory.setApproverDeptName(deptName);
            approval.reject(request.getComment());
        }

        approval.setUpdatedBy(userId);
        approval.setUpdatedAt(LocalDateTime.now());

        log.info("결재 처리 완료 - id: {}, status: {}", approvalId, approval.getApprovalStatusCd());
        return ApprovalDto.fromEntity(approval);
    }

    /**
     * 결재 회수
     */
    @Transactional
    public ApprovalDto withdrawApproval(String approvalId, String userId) {
        log.info("결재 회수 - id: {}", approvalId);

        Approval approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("결재 문서를 찾을 수 없습니다: " + approvalId));

        // 기안자 확인
        if (!userId.equals(approval.getDrafterId())) {
            throw new IllegalStateException("기안자만 회수할 수 있습니다.");
        }

        // 진행중 상태만 회수 가능
        if (!approval.canProcess()) {
            throw new IllegalStateException("회수할 수 없는 상태입니다.");
        }

        approval.withdraw();
        approval.setUpdatedBy(userId);
        approval.setUpdatedAt(LocalDateTime.now());

        log.info("결재 회수 완료 - id: {}", approvalId);
        return ApprovalDto.fromEntity(approval);
    }

    // ==============================
    // 유틸리티
    // ==============================

    /**
     * 결재 ID 생성
     */
    private String generateApprovalId() {
        long count = approvalRepository.count() + 1;
        return String.format("APR%08d", count);
    }

    /**
     * 결재번호 생성 (APR-YYYY-NNNNN)
     */
    private String generateApprovalNo() {
        String year = Year.now().toString();
        long count = approvalRepository.count() + 1;
        return String.format("APR-%s-%05d", year, count);
    }

    /**
     * 결재이력 ID 생성 (AH00000001 형식)
     */
    private String generateApprovalHistoryId() {
        long count = approvalHistoryRepository.count() + 1;
        return String.format("AH%08d", count);
    }

    /**
     * 결재함 건수 DTO
     */
    @lombok.Getter
    @lombok.Builder
    public static class ApprovalBoxCount {
        private long draft;
        private long pending;
        private long completed;
    }
}
