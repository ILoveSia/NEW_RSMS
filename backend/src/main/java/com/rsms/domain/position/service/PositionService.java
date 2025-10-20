package com.rsms.domain.position.service;

import com.rsms.domain.position.dto.*;
import com.rsms.domain.position.entity.Position;
import com.rsms.domain.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 직책 Service
 * - 직책 비즈니스 로직 처리
 * - CRUD 및 검색 기능 제공
 *
 * @author Claude AI
 * @since 2025-10-20
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PositionService {

    private final PositionRepository positionRepository;

    /**
     * 모든 직책 조회
     * - 전체 직책 목록 반환
     *
     * @return 직책 DTO 리스트
     */
    public List<PositionDto> getAllPositions() {
        log.debug("모든 직책 조회");
        return positionRepository.findAll().stream()
            .map(PositionDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 직책 검색
     * - 키워드, 본부코드, 사용여부로 검색
     *
     * @param request 검색 조건
     * @return 검색 결과 리스트
     */
    public List<PositionDto> searchPositions(PositionSearchRequest request) {
        log.debug("직책 검색 - keyword: {}, hqCode: {}, isActive: {}",
            request.getKeyword(), request.getHqCode(), request.getIsActive());

        return positionRepository.searchPositions(
            request.getKeyword(),
            request.getHqCode(),
            request.getIsActive()
        ).stream()
            .map(PositionDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 직책 단건 조회
     * - ID로 직책 조회
     *
     * @param positionsId 직책ID
     * @return 직책 DTO
     */
    public PositionDto getPosition(Long positionsId) {
        log.debug("직책 조회 - positionsId: {}", positionsId);
        Position position = positionRepository.findById(positionsId)
            .orElseThrow(() -> new IllegalArgumentException("직책을 찾을 수 없습니다: " + positionsId));
        return PositionDto.from(position);
    }

    /**
     * 사용여부별 조회
     * - 사용여부(Y/N)로 필터링
     *
     * @param isActive 사용여부
     * @return 직책 DTO 리스트
     */
    public List<PositionDto> getPositionsByActive(String isActive) {
        log.debug("사용여부별 조회 - isActive: {}", isActive);
        return positionRepository.findByIsActiveOrderByCreatedAtDesc(isActive).stream()
            .map(PositionDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 본부코드별 조회
     * - 본부코드로 직책 조회
     *
     * @param hqCode 본부코드
     * @return 직책 DTO 리스트
     */
    public List<PositionDto> getPositionsByHqCode(String hqCode) {
        log.debug("본부코드별 조회 - hqCode: {}", hqCode);
        return positionRepository.findByHqCode(hqCode).stream()
            .map(PositionDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 직책 생성
     * - 새로운 직책 등록
     * - 직책명 중복 확인 포함
     *
     * @param request 생성 요청 DTO
     * @param username 생성자
     * @return 생성된 직책 DTO
     */
    @Transactional
    public PositionDto createPosition(CreatePositionRequest request, String username) {
        log.info("직책 생성 - positionsName: {}, user: {}", request.getPositionsName(), username);

        // 직책명 중복 확인
        if (positionRepository.existsByPositionsName(request.getPositionsName())) {
            throw new IllegalArgumentException("이미 존재하는 직책명입니다: " + request.getPositionsName());
        }

        Position position = Position.builder()
            .ledgerOrderId(request.getLedgerOrderId())
            .positionsCd(request.getPositionsCd())
            .positionsName(request.getPositionsName())
            .hqCode(request.getHqCode())
            .hqName(request.getHqName())
            .expirationDate(request.getExpirationDate() != null ? request.getExpirationDate() : LocalDate.of(9999, 12, 31))
            .positionsStatus(request.getPositionsStatus())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .isConcurrent(request.getIsConcurrent() != null ? request.getIsConcurrent() : "N")
            .createdBy(username)
            .updatedBy(username)
            .build();

        Position savedPosition = positionRepository.save(position);
        log.info("직책 생성 완료 - positionsId: {}", savedPosition.getPositionsId());

        return PositionDto.from(savedPosition);
    }

    /**
     * 직책 수정
     * - 기존 직책 정보 수정
     * - 직책명 중복 확인 포함 (자신 제외)
     *
     * @param positionsId 직책ID
     * @param request 수정 요청 DTO
     * @param username 수정자
     * @return 수정된 직책 DTO
     */
    @Transactional
    public PositionDto updatePosition(Long positionsId, UpdatePositionRequest request, String username) {
        log.info("직책 수정 - positionsId: {}, user: {}", positionsId, username);

        Position position = positionRepository.findById(positionsId)
            .orElseThrow(() -> new IllegalArgumentException("직책을 찾을 수 없습니다: " + positionsId));

        // 직책명 중복 확인 (자신 제외)
        if (request.getPositionsName() != null &&
            positionRepository.existsByPositionsNameExcludingId(request.getPositionsName(), positionsId)) {
            throw new IllegalArgumentException("이미 존재하는 직책명입니다: " + request.getPositionsName());
        }

        // 비즈니스 로직 호출 (Entity의 update 메서드)
        position.update(
            request.getPositionsName(),
            request.getHqName(),
            username
        );

        // 추가 필드 업데이트
        if (request.getHqCode() != null) {
            position.setHqCode(request.getHqCode());
        }
        if (request.getExpirationDate() != null) {
            position.setExpirationDate(request.getExpirationDate());
        }
        if (request.getPositionsStatus() != null) {
            position.setPositionsStatus(request.getPositionsStatus());
        }
        if (request.getIsActive() != null) {
            position.setIsActive(request.getIsActive());
        }
        if (request.getIsConcurrent() != null) {
            position.setIsConcurrent(request.getIsConcurrent());
        }

        log.info("직책 수정 완료 - positionsId: {}", positionsId);

        return PositionDto.from(position);
    }

    /**
     * 직책 삭제
     * - 직책 단건 삭제
     *
     * @param positionsId 직책ID
     * @param username 삭제자
     */
    @Transactional
    public void deletePosition(Long positionsId, String username) {
        log.info("직책 삭제 - positionsId: {}, user: {}", positionsId, username);

        Position position = positionRepository.findById(positionsId)
            .orElseThrow(() -> new IllegalArgumentException("직책을 찾을 수 없습니다: " + positionsId));

        positionRepository.delete(position);
        log.info("직책 삭제 완료 - positionsId: {}", positionsId);
    }

    /**
     * 직책 복수 삭제
     * - 여러 직책 일괄 삭제
     *
     * @param positionsIds 직책ID 리스트
     * @param username 삭제자
     */
    @Transactional
    public void deletePositions(List<Long> positionsIds, String username) {
        log.info("직책 복수 삭제 - count: {}, user: {}", positionsIds.size(), username);

        for (Long positionsId : positionsIds) {
            deletePosition(positionsId, username);
        }

        log.info("직책 복수 삭제 완료 - count: {}", positionsIds.size());
    }

    /**
     * 직책 활성화/비활성화 토글
     * - 사용여부를 Y ↔ N으로 변경
     *
     * @param positionsId 직책ID
     * @param username 수정자
     * @return 수정된 직책 DTO
     */
    @Transactional
    public PositionDto toggleActive(Long positionsId, String username) {
        log.info("직책 활성화/비활성화 - positionsId: {}, user: {}", positionsId, username);

        Position position = positionRepository.findById(positionsId)
            .orElseThrow(() -> new IllegalArgumentException("직책을 찾을 수 없습니다: " + positionsId));

        // Entity의 비즈니스 로직 활용
        if (position.isActiveStatus()) {
            position.deactivate();
        } else {
            position.activate();
        }

        position.setUpdatedBy(username);
        position.setUpdatedAt(LocalDateTime.now());

        log.info("직책 활성화/비활성화 완료 - positionsId: {}, isActive: {}", positionsId, position.getIsActive());

        return PositionDto.from(position);
    }

    /**
     * 사용여부별 카운트 조회
     * - 사용중(Y) 또는 미사용(N) 직책 수
     *
     * @param isActive 사용여부
     * @return 카운트
     */
    public long countByActive(String isActive) {
        log.debug("사용여부별 카운트 조회 - isActive: {}", isActive);
        return positionRepository.countByIsActive(isActive);
    }

    /**
     * 본부코드별 카운트 조회
     * - 특정 본부의 직책 수
     *
     * @param hqCode 본부코드
     * @return 카운트
     */
    public long countByHqCode(String hqCode) {
        log.debug("본부코드별 카운트 조회 - hqCode: {}", hqCode);
        return positionRepository.countByHqCode(hqCode);
    }

    /**
     * 검색 조건별 카운트 조회
     * - 검색 조건에 맞는 직책 수
     *
     * @param request 검색 조건
     * @return 카운트
     */
    public long countBySearchConditions(PositionSearchRequest request) {
        log.debug("검색 조건별 카운트 조회");
        return positionRepository.countBySearchConditions(
            request.getKeyword(),
            request.getHqCode(),
            request.getIsActive()
        );
    }

    /**
     * 최근 생성된 직책 조회
     * - 생성일시 기준 최신순 정렬
     *
     * @param limit 조회 개수
     * @return 최근 직책 리스트
     */
    public List<PositionDto> getRecentPositions(int limit) {
        log.debug("최근 생성된 직책 조회 - limit: {}", limit);
        return positionRepository.findRecentPositions().stream()
            .limit(limit)
            .map(PositionDto::from)
            .collect(Collectors.toList());
    }
}
