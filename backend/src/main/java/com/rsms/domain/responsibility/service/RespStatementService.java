package com.rsms.domain.responsibility.service;

import com.rsms.domain.committee.entity.Committee;
import com.rsms.domain.committee.entity.CommitteeDetail;
import com.rsms.domain.committee.repository.CommitteeDetailRepository;
import com.rsms.domain.ledger.entity.LedgerOrder;
import com.rsms.domain.ledger.repository.LedgerOrderRepository;
import com.rsms.domain.position.entity.Position;
import com.rsms.domain.position.repository.PositionRepository;
import com.rsms.domain.responsibility.dto.RespStatementRequest;
import com.rsms.domain.responsibility.dto.RespStatementResponse;
import com.rsms.domain.responsibility.entity.RespStatementExec;
import com.rsms.domain.responsibility.repository.RespStatementExecRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 책무기술서 서비스
 * - 책무기술서 CRUD 비즈니스 로직
 *
 * @author RSMS
 * @since 2025-11-07
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RespStatementService {

    private final RespStatementExecRepository respStatementExecRepository;
    private final PositionRepository positionRepository;
    private final LedgerOrderRepository ledgerOrderRepository;
    private final CommitteeDetailRepository committeeDetailRepository;

    /**
     * 책무기술서 생성
     *
     * @param request 생성 요청 DTO
     * @return 생성된 책무기술서 응답 DTO
     */
    @Transactional
    public RespStatementResponse create(RespStatementRequest request) {
        log.info("[RespStatementService] 책무기술서 생성 요청 - positionId: {}, ledgerOrderId: {}",
                request.getPositionId(), request.getLedgerOrderId());

        // 직책 조회
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "직책을 찾을 수 없습니다. positionId: " + request.getPositionId()));

        // 원장차수 조회
        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(request.getLedgerOrderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "원장차수를 찾을 수 없습니다. ledgerOrderId: " + request.getLedgerOrderId()));

        // Entity 생성
        RespStatementExec entity = RespStatementExec.builder()
                .position(position)
                .ledgerOrder(ledgerOrder)
                .userId(request.getArbitraryPosition().getUserId()) // 로그인 사용자 ID
                .executiveName(request.getArbitraryPosition().getEmployeeName())
                .employeeNo(request.getArbitraryPosition().getEmployeeNo()) // 직원번호(사번)
                .positionAssignedDate(parseDate(request.getArbitraryPosition().getCurrentPositionDate()))
                .concurrentPosition(request.getArbitraryPosition().getDualPositionDetails())
                .actingOfficerInfo(null) // TODO: 직무대행자 정보 추가 필요
                .remarks(null)
                .responsibilityOverview(request.getResponsibilityOverview())
                .responsibilityAssignedDate(parseDate(request.getResponsibilityBackgroundDate()))
                .isActive("Y")
                .build();

        // 저장
        RespStatementExec savedEntity = respStatementExecRepository.save(entity);

        log.info("[RespStatementService] 책무기술서 생성 완료 - id: {}", savedEntity.getRespStmtExecId());

        return RespStatementResponse.fromEntity(savedEntity);
    }

    /**
     * 책무기술서 수정
     *
     * @param id 책무기술서 ID
     * @param request 수정 요청 DTO
     * @return 수정된 책무기술서 응답 DTO
     */
    @Transactional
    public RespStatementResponse update(Long id, RespStatementRequest request) {
        log.info("[RespStatementService] 책무기술서 수정 요청 - id: {}", id);

        // 기존 Entity 조회
        RespStatementExec entity = respStatementExecRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "책무기술서를 찾을 수 없습니다. id: " + id));

        // Entity 수정
        entity.setExecutiveName(request.getArbitraryPosition().getEmployeeName());
        entity.setPositionAssignedDate(parseDate(request.getArbitraryPosition().getCurrentPositionDate()));
        entity.setConcurrentPosition(request.getArbitraryPosition().getDualPositionDetails());
        entity.setResponsibilityOverview(request.getResponsibilityOverview());
        entity.setResponsibilityAssignedDate(parseDate(request.getResponsibilityBackgroundDate()));

        // 저장 (변경 감지로 자동 저장)
        log.info("[RespStatementService] 책무기술서 수정 완료 - id: {}", id);

        return RespStatementResponse.fromEntity(entity);
    }

    /**
     * 책무기술서 삭제
     *
     * @param id 책무기술서 ID
     */
    @Transactional
    public void delete(Long id) {
        log.info("[RespStatementService] 책무기술서 삭제 요청 - id: {}", id);

        RespStatementExec entity = respStatementExecRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "책무기술서를 찾을 수 없습니다. id: " + id));

        respStatementExecRepository.delete(entity);

        log.info("[RespStatementService] 책무기술서 삭제 완료 - id: {}", id);
    }

    /**
     * 책무기술서 목록 조회 (페이징)
     * - 전체 조회 (필터 없음)
     *
     * @param pageable 페이징 정보
     * @return 책무기술서 목록 (페이징)
     */
    public Page<RespStatementResponse> findAll(Pageable pageable) {
        log.info("[RespStatementService] 책무기술서 목록 조회 - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<RespStatementExec> entities = respStatementExecRepository.findAll(pageable);

        return entities.map(RespStatementResponse::fromEntity);
    }

    /**
     * 책무기술서 목록 조회 (필터링 + 페이징)
     * - 원장차수ID, 직책명, 사용여부로 필터링
     *
     * @param ledgerOrderId 원장차수ID (선택)
     * @param positionName 직책명 (선택)
     * @param isActive 사용여부 (선택)
     * @param pageable 페이징 정보
     * @return 필터링된 책무기술서 목록 (페이징)
     */
    public Page<RespStatementResponse> findAllWithFilters(
            String ledgerOrderId,
            String positionName,
            Boolean isActive,
            Pageable pageable) {
        log.info("[RespStatementService] 책무기술서 필터링 조회 - ledgerOrderId: {}, positionName: {}, isActive: {}, page: {}, size: {}",
                ledgerOrderId, positionName, isActive, pageable.getPageNumber(), pageable.getPageSize());

        // Boolean → String 'Y'/'N' 변환
        String isActiveStr = null;
        if (isActive != null) {
            isActiveStr = isActive ? "Y" : "N";
        }

        Page<RespStatementExec> entities = respStatementExecRepository.findAllWithFilters(
                ledgerOrderId,
                positionName,
                isActiveStr,
                pageable
        );

        log.info("[RespStatementService] 필터링 조회 완료 - 총 {}건", entities.getTotalElements());

        return entities.map(RespStatementResponse::fromEntity);
    }

    /**
     * 책무기술서 상세 조회
     *
     * @param id 책무기술서 ID
     * @return 책무기술서 응답 DTO
     */
    public RespStatementResponse findById(Long id) {
        log.info("[RespStatementService] 책무기술서 상세 조회 - id: {}", id);

        RespStatementExec entity = respStatementExecRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "책무기술서를 찾을 수 없습니다. id: " + id));

        // 기본 Response 생성
        RespStatementResponse response = RespStatementResponse.fromEntity(entity);

        // 주관회의체 목록 조회 및 설정
        List<RespStatementResponse.MainCommitteeResponse> mainCommittees = getMainCommitteesByPositionId(entity.getPosition().getPositionsId());
        response.setMainCommittees(mainCommittees);

        log.info("[RespStatementService] 주관회의체 조회 완료 - 개수: {}", mainCommittees.size());

        return response;
    }

    /**
     * 직책ID로 주관회의체 목록 조회
     *
     * @param positionId 직책ID
     * @return 주관회의체 목록
     */
    private List<RespStatementResponse.MainCommitteeResponse> getMainCommitteesByPositionId(Long positionId) {
        // 해당 직책이 소속된 회의체 상세 정보 조회 (회의체 정보 JOIN FETCH)
        List<CommitteeDetail> committeeDetails = committeeDetailRepository.findCommitteesByPositionId(positionId);

        // 회의체 정보 변환
        return committeeDetails.stream()
                .map(detail -> {
                    Committee committee = detail.getCommittee();
                    return RespStatementResponse.MainCommitteeResponse.builder()
                            .id(String.valueOf(committee.getCommitteesId()))
                            .committeeName(committee.getCommitteesTitle())
                            .chairperson(detail.getCommitteesType()) // 위원장/위원 구분
                            .frequency(committee.getCommitteeFrequency())
                            .mainAgenda(committee.getResolutionMatters())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 날짜 문자열을 LocalDate로 변환
     *
     * @param dateString 날짜 문자열 (yyyy-MM-dd)
     * @return LocalDate 객체
     */
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            log.warn("[RespStatementService] 날짜 파싱 실패 - dateString: {}", dateString, e);
            return null;
        }
    }
}
