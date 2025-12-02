package com.rsms.domain.approval.service;

import com.rsms.domain.approval.dto.*;
import com.rsms.domain.approval.entity.ApprovalLine;
import com.rsms.domain.approval.entity.ApprovalLineStep;
import com.rsms.domain.approval.repository.ApprovalLineRepository;
import com.rsms.domain.approval.repository.ApprovalLineStepRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 결재선 서비스
 *
 * @description 결재선 관련 비즈니스 로직 처리
 * - 결재선 CRUD
 * - 결재선 단계 관리
 *
 * @author Claude AI
 * @since 2025-12-02
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalLineService {

    private final ApprovalLineRepository approvalLineRepository;
    private final ApprovalLineStepRepository approvalLineStepRepository;

    /**
     * 전체 결재선 목록 조회
     */
    public List<ApprovalLineDto> getAllApprovalLines() {
        log.info("전체 결재선 목록 조회");
        return approvalLineRepository.findAll().stream()
                .map(ApprovalLineDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재선 검색
     */
    public List<ApprovalLineDto> searchApprovalLines(String workTypeCd, String isUsed, String keyword) {
        log.info("결재선 검색 - workTypeCd: {}, isUsed: {}, keyword: {}", workTypeCd, isUsed, keyword);
        return approvalLineRepository.search(
                workTypeCd != null && !workTypeCd.isEmpty() ? workTypeCd : null,
                isUsed != null && !isUsed.isEmpty() ? isUsed : null,
                keyword != null && !keyword.isEmpty() ? keyword : null
        ).stream()
                .map(ApprovalLineDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재선 단건 조회
     */
    public ApprovalLineDto getApprovalLine(String approvalLineId) {
        log.info("결재선 조회 - id: {}", approvalLineId);
        ApprovalLine approvalLine = approvalLineRepository.findByIdWithSteps(approvalLineId)
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));
        return ApprovalLineDto.fromEntity(approvalLine);
    }

    /**
     * 업무구분별 사용중인 결재선 목록 조회
     */
    public List<ApprovalLineDto> getActiveApprovalLinesByWorkType(String workTypeCd) {
        log.info("업무구분별 사용중인 결재선 조회 - workTypeCd: {}", workTypeCd);
        return approvalLineRepository.findByWorkTypeCdAndIsUsedOrderBySequenceAsc(workTypeCd, "Y").stream()
                .map(ApprovalLineDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 결재선 생성
     */
    @Transactional
    public ApprovalLineDto createApprovalLine(CreateApprovalLineRequest request, String userId) {
        log.info("결재선 생성 - name: {}, workTypeCd: {}", request.getApprovalLineName(), request.getWorkTypeCd());

        // 결재선 ID 생성 (시퀀스 기반)
        String approvalLineId = generateApprovalLineId();

        // 다음 순서 조회
        Integer nextSequence = approvalLineRepository.getNextSequence(request.getWorkTypeCd());

        ApprovalLine approvalLine = ApprovalLine.builder()
                .approvalLineId(approvalLineId)
                .approvalLineName(request.getApprovalLineName())
                .workTypeCd(request.getWorkTypeCd())
                .popupTitle(request.getPopupTitle())
                .sequence(nextSequence)
                .isUsed("Y")
                .isEditable(request.getIsEditable() != null ? request.getIsEditable() : "N")
                .remarks(request.getRemarks())
                .createdBy(userId)
                .createdAt(LocalDateTime.now())
                .build();

        ApprovalLine savedLine = approvalLineRepository.save(approvalLine);

        // 결재선 단계 생성
        if (request.getSteps() != null && !request.getSteps().isEmpty()) {
            for (CreateApprovalLineStepRequest stepRequest : request.getSteps()) {
                String stepId = generateApprovalLineStepId();
                ApprovalLineStep step = ApprovalLineStep.builder()
                        .approvalLineStepId(stepId)
                        .approvalLine(savedLine)
                        .stepOrder(stepRequest.getStepOrder())
                        .stepName(stepRequest.getStepName())
                        .approvalTypeCd(stepRequest.getApprovalTypeCd())
                        .approverTypeCd(stepRequest.getApproverTypeCd())
                        .approverId(stepRequest.getApproverId())
                        .approverName(stepRequest.getApproverName())
                        .isRequired(stepRequest.getIsRequired() != null ? stepRequest.getIsRequired() : "Y")
                        .remarks(stepRequest.getRemarks())
                        .createdBy(userId)
                        .createdAt(LocalDateTime.now())
                        .build();
                approvalLineStepRepository.save(step);
            }
        }

        log.info("결재선 생성 완료 - id: {}", savedLine.getApprovalLineId());
        return ApprovalLineDto.fromEntity(savedLine);
    }

    /**
     * 결재선 수정
     */
    @Transactional
    public ApprovalLineDto updateApprovalLine(String approvalLineId, UpdateApprovalLineRequest request, String userId) {
        log.info("결재선 수정 - id: {}", approvalLineId);

        ApprovalLine approvalLine = approvalLineRepository.findById(approvalLineId)
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));

        approvalLine.update(
                request.getApprovalLineName(),
                request.getPopupTitle(),
                request.getIsEditable(),
                request.getRemarks(),
                userId
        );

        // 단계 교체 (기존 삭제 후 새로 생성)
        if (request.getSteps() != null) {
            approvalLineStepRepository.deleteByApprovalLine_ApprovalLineId(approvalLineId);

            for (CreateApprovalLineStepRequest stepRequest : request.getSteps()) {
                String stepId = generateApprovalLineStepId();
                ApprovalLineStep step = ApprovalLineStep.builder()
                        .approvalLineStepId(stepId)
                        .approvalLine(approvalLine)
                        .stepOrder(stepRequest.getStepOrder())
                        .stepName(stepRequest.getStepName())
                        .approvalTypeCd(stepRequest.getApprovalTypeCd())
                        .approverTypeCd(stepRequest.getApproverTypeCd())
                        .approverId(stepRequest.getApproverId())
                        .approverName(stepRequest.getApproverName())
                        .isRequired(stepRequest.getIsRequired() != null ? stepRequest.getIsRequired() : "Y")
                        .remarks(stepRequest.getRemarks())
                        .createdBy(userId)
                        .createdAt(LocalDateTime.now())
                        .build();
                approvalLineStepRepository.save(step);
            }
        }

        log.info("결재선 수정 완료 - id: {}", approvalLineId);
        return ApprovalLineDto.fromEntity(approvalLine);
    }

    /**
     * 결재선 삭제
     */
    @Transactional
    public void deleteApprovalLine(String approvalLineId) {
        log.info("결재선 삭제 - id: {}", approvalLineId);

        ApprovalLine approvalLine = approvalLineRepository.findById(approvalLineId)
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));

        // 단계 먼저 삭제
        approvalLineStepRepository.deleteByApprovalLine_ApprovalLineId(approvalLineId);

        // 결재선 삭제
        approvalLineRepository.delete(approvalLine);

        log.info("결재선 삭제 완료 - id: {}", approvalLineId);
    }

    /**
     * 결재선 복수 삭제
     */
    @Transactional
    public void deleteApprovalLines(List<String> approvalLineIds) {
        log.info("결재선 복수 삭제 - count: {}", approvalLineIds.size());

        for (String id : approvalLineIds) {
            deleteApprovalLine(id);
        }

        log.info("결재선 복수 삭제 완료 - count: {}", approvalLineIds.size());
    }

    /**
     * 결재선 사용여부 토글
     */
    @Transactional
    public ApprovalLineDto toggleActive(String approvalLineId, String userId) {
        log.info("결재선 사용여부 토글 - id: {}", approvalLineId);

        ApprovalLine approvalLine = approvalLineRepository.findById(approvalLineId)
                .orElseThrow(() -> new IllegalArgumentException("결재선을 찾을 수 없습니다: " + approvalLineId));

        if (approvalLine.isActive()) {
            approvalLine.deactivate();
        } else {
            approvalLine.activate();
        }
        approvalLine.setUpdatedBy(userId);

        log.info("결재선 사용여부 토글 완료 - id: {}, isUsed: {}", approvalLineId, approvalLine.getIsUsed());
        return ApprovalLineDto.fromEntity(approvalLine);
    }

    /**
     * 통계 조회
     */
    public ApprovalLineStatistics getStatistics() {
        long total = approvalLineRepository.count();
        long used = approvalLineRepository.countByIsUsed("Y");
        long unused = approvalLineRepository.countByIsUsed("N");

        return ApprovalLineStatistics.builder()
                .total(total)
                .used(used)
                .unused(unused)
                .build();
    }

    /**
     * 결재선 ID 생성 (시퀀스 기반 간단 구현)
     */
    private String generateApprovalLineId() {
        long count = approvalLineRepository.count() + 1;
        return String.format("AL%05d", count);
    }

    /**
     * 결재선 단계 ID 생성 (시퀀스 기반)
     */
    private String generateApprovalLineStepId() {
        long count = approvalLineStepRepository.count() + 1;
        return String.format("ALS%08d", count);
    }

    /**
     * 결재선 통계 내부 클래스
     */
    @lombok.Getter
    @lombok.Builder
    public static class ApprovalLineStatistics {
        private long total;
        private long used;
        private long unused;
    }
}
