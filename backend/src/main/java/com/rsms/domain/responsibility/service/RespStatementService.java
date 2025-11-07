package com.rsms.domain.responsibility.service;

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

        return RespStatementResponse.fromEntity(entity);
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
