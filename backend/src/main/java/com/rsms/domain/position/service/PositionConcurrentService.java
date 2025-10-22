package com.rsms.domain.position.service;

import com.rsms.domain.position.dto.CreatePositionConcurrentRequest;
import com.rsms.domain.position.dto.PositionConcurrentDto;
import com.rsms.domain.position.entity.PositionConcurrent;
import com.rsms.domain.position.repository.PositionConcurrentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 직책겸직 Service
 * - 겸직 등록/조회/수정/삭제 비즈니스 로직
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PositionConcurrentService {

    private final PositionConcurrentRepository positionConcurrentRepository;

    /**
     * 겸직그룹코드 자동 생성 (G0001, G0002, ...)
     * - G + 4자리 숫자 (0001부터 시작)
     */
    private String generateConcurrentGroupCd() {
        Integer maxNumber = positionConcurrentRepository.findMaxConcurrentGroupNumber();
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("G%04d", nextNumber);
    }

    /**
     * 겸직 등록
     * - 여러 직책을 한번에 등록 (같은 겸직그룹)
     * - concurrent_group_cd는 자동 생성 (G0001, G0002, ...)
     */
    @Transactional
    public List<PositionConcurrentDto> createPositionConcurrents(CreatePositionConcurrentRequest request) {
        log.debug("겸직 등록 시작: ledgerOrderId={}, positions={}",
            request.getLedgerOrderId(), request.getPositions().size());

        // 검증
        if (request.getPositions() == null || request.getPositions().isEmpty()) {
            throw new IllegalArgumentException("겸직 직책 목록이 비어있습니다.");
        }

        // 대표직책이 1개만 있는지 확인
        long representativeCount = request.getPositions().stream()
            .filter(p -> "Y".equals(p.getIsRepresentative()))
            .count();

        if (representativeCount != 1) {
            throw new IllegalArgumentException("대표직책은 반드시 1개만 지정해야 합니다.");
        }

        // 겸직그룹코드 자동 생성
        String concurrentGroupCd = generateConcurrentGroupCd();
        log.debug("생성된 겸직그룹코드: {}", concurrentGroupCd);

        // 겸직 엔티티 목록 생성
        List<PositionConcurrent> concurrents = request.getPositions().stream()
            .map(item -> PositionConcurrent.builder()
                .ledgerOrderId(request.getLedgerOrderId())
                .positionsCd(item.getPositionsCd())
                .concurrentGroupCd(concurrentGroupCd)
                .positionsName(item.getPositionsName())
                .isRepresentative(item.getIsRepresentative() != null ? item.getIsRepresentative() : "N")
                .hqCode(item.getHqCode())
                .hqName(item.getHqName())
                .isActive("Y")
                .build())
            .collect(Collectors.toList());

        // 일괄 저장
        List<PositionConcurrent> savedConcurrents = positionConcurrentRepository.saveAll(concurrents);
        log.debug("겸직 등록 완료: {} 건", savedConcurrents.size());

        // DTO 변환 후 반환
        return savedConcurrents.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 원장차수ID로 겸직 목록 조회 (positions 테이블 조인)
     * - positions 테이블의 최신 본부코드/본부명을 함께 조회
     */
    @Transactional(readOnly = true)
    public List<PositionConcurrentDto> getPositionConcurrentsByLedgerOrderId(String ledgerOrderId) {
        log.debug("겸직 목록 조회 (positions 조인): ledgerOrderId={}", ledgerOrderId);

        // positions 테이블과 조인하여 조회
        List<PositionConcurrent> concurrents = positionConcurrentRepository.findByLedgerOrderIdWithPositions(ledgerOrderId);

        return concurrents.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 겸직그룹코드로 겸직 목록 조회
     */
    @Transactional(readOnly = true)
    public List<PositionConcurrentDto> getPositionConcurrentsByConcurrentGroupCd(String concurrentGroupCd) {
        log.debug("겸직 그룹 조회: concurrentGroupCd={}", concurrentGroupCd);

        List<PositionConcurrent> concurrents = positionConcurrentRepository.findByConcurrentGroupCd(concurrentGroupCd);

        return concurrents.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 사용중인 겸직 목록 조회 (is_active = 'Y')
     */
    @Transactional(readOnly = true)
    public List<PositionConcurrentDto> getActivePositionConcurrents(String ledgerOrderId) {
        log.debug("사용중인 겸직 목록 조회: ledgerOrderId={}", ledgerOrderId);

        List<PositionConcurrent> concurrents = positionConcurrentRepository.findActiveByLedgerOrderId(ledgerOrderId);

        return concurrents.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 겸직그룹 삭제
     * - 겸직그룹코드에 속한 모든 겸직 삭제
     */
    @Transactional
    public void deletePositionConcurrentGroup(String concurrentGroupCd) {
        log.debug("겸직 그룹 삭제: concurrentGroupCd={}", concurrentGroupCd);

        positionConcurrentRepository.deleteByConcurrentGroupCd(concurrentGroupCd);

        log.debug("겸직 그룹 삭제 완료: concurrentGroupCd={}", concurrentGroupCd);
    }

    /**
     * 겸직그룹 비활성화
     * - 겸직그룹코드에 속한 모든 겸직을 is_active = 'N'으로 변경
     */
    @Transactional
    public void deactivatePositionConcurrentGroup(String concurrentGroupCd) {
        log.debug("겸직 그룹 비활성화: concurrentGroupCd={}", concurrentGroupCd);

        List<PositionConcurrent> concurrents = positionConcurrentRepository.findByConcurrentGroupCd(concurrentGroupCd);

        concurrents.forEach(PositionConcurrent::deactivate);

        positionConcurrentRepository.saveAll(concurrents);

        log.debug("겸직 그룹 비활성화 완료: {} 건", concurrents.size());
    }

    /**
     * Entity -> DTO 변환
     */
    private PositionConcurrentDto convertToDto(PositionConcurrent entity) {
        return PositionConcurrentDto.builder()
            .positionConcurrentId(entity.getPositionConcurrentId())
            .ledgerOrderId(entity.getLedgerOrderId())
            .positionsCd(entity.getPositionsCd())
            .concurrentGroupCd(entity.getConcurrentGroupCd())
            .positionsName(entity.getPositionsName())
            .isRepresentative(entity.getIsRepresentative())
            .hqCode(entity.getHqCode())
            .hqName(entity.getHqName())
            .isActive(entity.getIsActive())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedBy(entity.getLastModifiedBy())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
