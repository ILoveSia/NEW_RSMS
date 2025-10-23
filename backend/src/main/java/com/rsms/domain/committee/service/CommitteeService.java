package com.rsms.domain.committee.service;

import com.rsms.domain.committee.dto.*;
import com.rsms.domain.committee.entity.Committee;
import com.rsms.domain.committee.entity.CommitteeDetail;
import com.rsms.domain.committee.repository.CommitteeRepository;
import com.rsms.domain.committee.repository.CommitteeDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 회의체 Service
 *
 * @description 회의체 비즈니스 로직 처리
 * - CRUD 및 검색 기능 제공
 * - committees 테이블과 committee_details 테이블 연동 관리
 *
 * @author Claude AI
 * @since 2025-10-24
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommitteeService {

    private final CommitteeRepository committeeRepository;
    private final CommitteeDetailRepository committeeDetailRepository;

    /**
     * 모든 회의체 조회
     */
    public List<CommitteeDto> getAllCommittees() {
        log.debug("모든 회의체 조회");

        List<Committee> committees = committeeRepository.findAll();
        log.debug("조회된 회의체 수: {}", committees.size());

        return committees.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 원장차수별 회의체 조회
     */
    public List<CommitteeDto> getCommitteesByLedgerOrderId(String ledgerOrderId) {
        log.debug("원장차수별 회의체 조회: {}", ledgerOrderId);

        List<Committee> committees = committeeRepository.findByLedgerOrderIdOrderByCommitteesIdDesc(ledgerOrderId);
        log.debug("조회된 회의체 수: {}", committees.size());

        return committees.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 회의체ID로 상세 조회 (위원 목록 포함)
     * - positions 테이블과 JOIN하여 직책명 포함
     */
    public CommitteeDto getCommitteeById(Long committeeId) {
        log.debug("회의체 상세 조회: {}", committeeId);

        Committee committee = committeeRepository.findByCommitteesId(committeeId)
                .orElseThrow(() -> new IllegalArgumentException("회의체를 찾을 수 없습니다: " + committeeId));

        // positions와 JOIN하여 직책명 포함한 위원 목록 조회
        List<Map<String, Object>> detailsWithPositions = committeeDetailRepository
                .findCommitteeDetailsWithPositionsByCommitteesId(committeeId);

        List<CommitteeDetailDto> members = detailsWithPositions.stream()
                .map(row -> CommitteeDetailDto.builder()
                        .committeeDetailsId(((Number) row.get("committee_details_id")).longValue())
                        .committeesId(((Number) row.get("committees_id")).longValue())
                        .committeesType((String) row.get("committees_type"))
                        .positionsId(((Number) row.get("positions_id")).longValue())
                        .positionsName((String) row.get("positions_name"))  // positions 테이블에서 JOIN한 값
                        .createdBy((String) row.get("created_by"))
                        .createdAt(row.get("created_at") != null ? row.get("created_at").toString() : null)
                        .updatedBy((String) row.get("updated_by"))
                        .updatedAt(row.get("updated_at") != null ? row.get("updated_at").toString() : null)
                        .build())
                .collect(Collectors.toList());

        return CommitteeDto.fromWithMembers(committee, members);
    }

    /**
     * 회의체 등록
     */
    @Transactional
    public CommitteeDto createCommittee(CommitteeCreateRequest request, String createdBy) {
        log.debug("회의체 등록: {}", request.getCommitteesTitle());

        // 회의체명 중복 체크
        if (committeeRepository.existsByLedgerOrderIdAndCommitteesTitle(
                request.getLedgerOrderId(), request.getCommitteesTitle())) {
            throw new IllegalArgumentException("이미 존재하는 회의체명입니다: " + request.getCommitteesTitle());
        }

        // Committee 엔티티 생성
        Committee committee = Committee.builder()
                .ledgerOrderId(request.getLedgerOrderId())
                .committeesTitle(request.getCommitteesTitle())
                .committeeFrequency(request.getCommitteeFrequency())
                .resolutionMatters(request.getResolutionMatters())
                .isActive(request.getIsActive())
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedBy(createdBy)
                .updatedAt(LocalDateTime.now())
                .build();

        Committee savedCommittee = committeeRepository.save(committee);
        log.debug("회의체 저장 완료: ID={}", savedCommittee.getCommitteesId());

        // CommitteeDetail 엔티티 생성 (위원 목록)
        List<CommitteeDetail> details = request.getMembers().stream()
                .map(member -> {
                    CommitteeDetail detail = CommitteeDetail.builder()
                            .committeesId(savedCommittee.getCommitteesId())
                            .committeesType(member.getCommitteesType())
                            .positionsId(member.getPositionsId())
                            .createdBy(createdBy)
                            .createdAt(LocalDateTime.now())
                            .updatedBy(createdBy)
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return detail;
                })
                .collect(Collectors.toList());

        committeeDetailRepository.saveAll(details);
        log.debug("회의체 위원 저장 완료: {}명", details.size());

        // 저장된 데이터 조회하여 반환
        return getCommitteeById(savedCommittee.getCommitteesId());
    }

    /**
     * 회의체 수정
     */
    @Transactional
    public CommitteeDto updateCommittee(Long committeeId, CommitteeUpdateRequest request, String updatedBy) {
        log.debug("회의체 수정: ID={}", committeeId);

        Committee committee = committeeRepository.findByCommitteesId(committeeId)
                .orElseThrow(() -> new IllegalArgumentException("회의체를 찾을 수 없습니다: " + committeeId));

        // Committee 정보 수정
        committee.update(
                request.getCommitteesTitle(),
                request.getCommitteeFrequency(),
                request.getResolutionMatters(),
                updatedBy
        );

        // 사용여부 수정
        if ("Y".equals(request.getIsActive())) {
            committee.activate();
        } else {
            committee.deactivate();
        }

        committeeRepository.save(committee);
        log.debug("회의체 수정 완료: ID={}", committeeId);

        // 기존 위원 정보 삭제
        committeeDetailRepository.deleteByCommitteesId(committeeId);
        log.debug("기존 위원 정보 삭제 완료");

        // 새로운 위원 정보 저장
        List<CommitteeDetail> newDetails = request.getMembers().stream()
                .map(member -> {
                    CommitteeDetail detail = CommitteeDetail.builder()
                            .committeesId(committeeId)
                            .committeesType(member.getCommitteesType())
                            .positionsId(member.getPositionsId())
                            .createdBy(updatedBy)
                            .createdAt(LocalDateTime.now())
                            .updatedBy(updatedBy)
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return detail;
                })
                .collect(Collectors.toList());

        committeeDetailRepository.saveAll(newDetails);
        log.debug("새로운 위원 정보 저장 완료: {}명", newDetails.size());

        // 수정된 데이터 조회하여 반환
        return getCommitteeById(committeeId);
    }

    /**
     * 회의체 삭제
     */
    @Transactional
    public void deleteCommittee(Long committeeId) {
        log.debug("회의체 삭제: ID={}", committeeId);

        Committee committee = committeeRepository.findByCommitteesId(committeeId)
                .orElseThrow(() -> new IllegalArgumentException("회의체를 찾을 수 없습니다: " + committeeId));

        // 위원 정보 먼저 삭제
        committeeDetailRepository.deleteByCommitteesId(committeeId);
        log.debug("회의체 위원 삭제 완료");

        // 회의체 삭제
        committeeRepository.delete(committee);
        log.debug("회의체 삭제 완료: ID={}", committeeId);
    }

    /**
     * 회의체 일괄 삭제
     */
    @Transactional
    public void deleteCommittees(List<Long> committeeIds) {
        log.debug("회의체 일괄 삭제: {}개", committeeIds.size());

        for (Long committeeId : committeeIds) {
            deleteCommittee(committeeId);
        }

        log.debug("회의체 일괄 삭제 완료");
    }

    /**
     * Entity → DTO 변환 (위원 목록 포함)
     * - positions 테이블과 JOIN하여 직책명 포함
     */
    private CommitteeDto convertToDto(Committee committee) {
        // positions와 JOIN하여 직책명 포함한 위원 목록 조회
        List<Map<String, Object>> detailsWithPositions = committeeDetailRepository
                .findCommitteeDetailsWithPositionsByCommitteesId(committee.getCommitteesId());

        List<CommitteeDetailDto> members = detailsWithPositions.stream()
                .map(row -> CommitteeDetailDto.builder()
                        .committeeDetailsId(((Number) row.get("committee_details_id")).longValue())
                        .committeesId(((Number) row.get("committees_id")).longValue())
                        .committeesType((String) row.get("committees_type"))
                        .positionsId(((Number) row.get("positions_id")).longValue())
                        .positionsName((String) row.get("positions_name"))  // positions 테이블에서 JOIN한 값
                        .createdBy((String) row.get("created_by"))
                        .createdAt(row.get("created_at") != null ? row.get("created_at").toString() : null)
                        .updatedBy((String) row.get("updated_by"))
                        .updatedAt(row.get("updated_at") != null ? row.get("updated_at").toString() : null)
                        .build())
                .collect(Collectors.toList());

        return CommitteeDto.fromWithMembers(committee, members);
    }
}
