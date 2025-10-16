package com.rsms.domain.ledger.service;

import com.rsms.domain.ledger.dto.*;
import com.rsms.domain.ledger.entity.LedgerOrder;
import com.rsms.domain.ledger.repository.LedgerOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 원장차수 Service
 *
 * @description 원장차수 비즈니스 로직 처리
 * @author Claude AI
 * @since 2025-10-16
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LedgerOrderService {

    private final LedgerOrderRepository ledgerOrderRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 모든 원장차수 조회
     */
    public List<LedgerOrderDto> getAllLedgerOrders() {
        log.debug("모든 원장차수 조회");
        return ledgerOrderRepository.findAll().stream()
            .map(LedgerOrderDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 원장차수 검색
     */
    public List<LedgerOrderDto> searchLedgerOrders(LedgerOrderSearchRequest request) {
        log.debug("원장차수 검색 - keyword: {}, status: {}, year: {}",
            request.getKeyword(), request.getLedgerOrderStatus(), request.getYear());

        return ledgerOrderRepository.searchLedgerOrders(
            request.getKeyword(),
            request.getLedgerOrderStatus(),
            request.getYear()
        ).stream()
            .map(LedgerOrderDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 원장차수 단건 조회
     */
    public LedgerOrderDto getLedgerOrder(String ledgerOrderId) {
        log.debug("원장차수 조회 - ledgerOrderId: {}", ledgerOrderId);
        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(ledgerOrderId)
            .orElseThrow(() -> new IllegalArgumentException("원장차수를 찾을 수 없습니다: " + ledgerOrderId));
        return LedgerOrderDto.from(ledgerOrder);
    }

    /**
     * 원장상태별 조회
     */
    public List<LedgerOrderDto> getLedgerOrdersByStatus(String status) {
        log.debug("원장상태별 조회 - status: {}", status);
        return ledgerOrderRepository.findByLedgerOrderStatusOrderByCreatedAtDesc(status).stream()
            .map(LedgerOrderDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 년도별 조회
     */
    public List<LedgerOrderDto> getLedgerOrdersByYear(String year) {
        log.debug("년도별 조회 - year: {}", year);
        return ledgerOrderRepository.findByYear(year).stream()
            .map(LedgerOrderDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 원장차수 생성
     */
    @Transactional
    public LedgerOrderDto createLedgerOrder(CreateLedgerOrderRequest request, String username) {
        log.info("원장차수 생성 - title: {}, user: {}", request.getLedgerOrderTitle(), username);

        // DB 함수를 통한 ID 생성
        String newLedgerOrderId = generateLedgerOrderId();

        // 원장 제목 중복 확인
        if (request.getLedgerOrderTitle() != null &&
            ledgerOrderRepository.existsByLedgerOrderTitle(request.getLedgerOrderTitle())) {
            throw new IllegalArgumentException("이미 존재하는 원장 제목입니다: " + request.getLedgerOrderTitle());
        }

        LedgerOrder ledgerOrder = LedgerOrder.builder()
            .ledgerOrderId(newLedgerOrderId)
            .ledgerOrderTitle(request.getLedgerOrderTitle())
            .ledgerOrderStatus(request.getLedgerOrderStatus() != null ? request.getLedgerOrderStatus() : "NEW")
            .ledgerOrderRemarks(request.getLedgerOrderRemarks())
            .createdBy(username)
            .createdAt(LocalDateTime.now())
            .updatedBy(username)
            .updatedAt(LocalDateTime.now())
            .build();

        LedgerOrder savedLedgerOrder = ledgerOrderRepository.save(ledgerOrder);
        log.info("원장차수 생성 완료 - ledgerOrderId: {}", savedLedgerOrder.getLedgerOrderId());

        return LedgerOrderDto.from(savedLedgerOrder);
    }

    /**
     * 원장차수 수정
     */
    @Transactional
    public LedgerOrderDto updateLedgerOrder(String ledgerOrderId, UpdateLedgerOrderRequest request, String username) {
        log.info("원장차수 수정 - ledgerOrderId: {}, user: {}", ledgerOrderId, username);

        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(ledgerOrderId)
            .orElseThrow(() -> new IllegalArgumentException("원장차수를 찾을 수 없습니다: " + ledgerOrderId));

        // 원장 제목 중복 확인 (자신 제외)
        if (request.getLedgerOrderTitle() != null &&
            ledgerOrderRepository.existsByTitleExcludingId(request.getLedgerOrderTitle(), ledgerOrderId)) {
            throw new IllegalArgumentException("이미 존재하는 원장 제목입니다: " + request.getLedgerOrderTitle());
        }

        // 비즈니스 로직 호출
        ledgerOrder.update(
            request.getLedgerOrderTitle(),
            request.getLedgerOrderStatus(),
            request.getLedgerOrderRemarks(),
            username
        );

        log.info("원장차수 수정 완료 - ledgerOrderId: {}", ledgerOrderId);

        return LedgerOrderDto.from(ledgerOrder);
    }

    /**
     * 원장차수 삭제
     */
    @Transactional
    public void deleteLedgerOrder(String ledgerOrderId, String username) {
        log.info("원장차수 삭제 - ledgerOrderId: {}, user: {}", ledgerOrderId, username);

        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(ledgerOrderId)
            .orElseThrow(() -> new IllegalArgumentException("원장차수를 찾을 수 없습니다: " + ledgerOrderId));

        // 종료된 원장은 삭제 불가 (비즈니스 규칙)
        if (ledgerOrder.isClosed()) {
            throw new IllegalStateException("종료된 원장차수는 삭제할 수 없습니다.");
        }

        ledgerOrderRepository.delete(ledgerOrder);
        log.info("원장차수 삭제 완료 - ledgerOrderId: {}", ledgerOrderId);
    }

    /**
     * 원장차수 복수 삭제
     */
    @Transactional
    public void deleteLedgerOrders(List<String> ledgerOrderIds, String username) {
        log.info("원장차수 복수 삭제 - count: {}, user: {}", ledgerOrderIds.size(), username);

        for (String ledgerOrderId : ledgerOrderIds) {
            deleteLedgerOrder(ledgerOrderId, username);
        }

        log.info("원장차수 복수 삭제 완료 - count: {}", ledgerOrderIds.size());
    }

    /**
     * 원장상태 변경
     */
    @Transactional
    public LedgerOrderDto changeStatus(String ledgerOrderId, String newStatus, String username) {
        log.info("원장상태 변경 - ledgerOrderId: {}, newStatus: {}, user: {}",
            ledgerOrderId, newStatus, username);

        LedgerOrder ledgerOrder = ledgerOrderRepository.findById(ledgerOrderId)
            .orElseThrow(() -> new IllegalArgumentException("원장차수를 찾을 수 없습니다: " + ledgerOrderId));

        // 비즈니스 로직 호출
        ledgerOrder.changeStatus(newStatus);
        ledgerOrder.setUpdatedBy(username);
        ledgerOrder.setUpdatedAt(LocalDateTime.now());

        log.info("원장상태 변경 완료 - ledgerOrderId: {}, newStatus: {}", ledgerOrderId, newStatus);

        return LedgerOrderDto.from(ledgerOrder);
    }

    /**
     * 상태별 카운트 조회
     */
    public long countByStatus(String status) {
        log.debug("상태별 카운트 조회 - status: {}", status);
        return ledgerOrderRepository.countByLedgerOrderStatus(status);
    }

    /**
     * 년도별 카운트 조회
     */
    public long countByYear(String year) {
        log.debug("년도별 카운트 조회 - year: {}", year);
        return ledgerOrderRepository.countByYear(year);
    }

    /**
     * 검색 조건별 카운트 조회
     */
    public long countBySearchConditions(LedgerOrderSearchRequest request) {
        log.debug("검색 조건별 카운트 조회");
        return ledgerOrderRepository.countBySearchConditions(
            request.getKeyword(),
            request.getLedgerOrderStatus(),
            request.getYear()
        );
    }

    /**
     * 최근 생성된 원장차수 조회
     */
    public List<LedgerOrderDto> getRecentLedgerOrders(int limit) {
        log.debug("최근 생성된 원장차수 조회 - limit: {}", limit);
        return ledgerOrderRepository.findRecentLedgerOrders().stream()
            .limit(limit)
            .map(LedgerOrderDto::from)
            .collect(Collectors.toList());
    }

    // ===============================
    // Private Helper Methods
    // ===============================

    /**
     * DB 함수를 통한 원장차수ID 생성
     */
    private String generateLedgerOrderId() {
        String sql = "SELECT rsms.generate_ledger_order_id()";
        String newId = jdbcTemplate.queryForObject(sql, String.class);
        log.debug("생성된 원장차수ID: {}", newId);
        return newId;
    }
}
