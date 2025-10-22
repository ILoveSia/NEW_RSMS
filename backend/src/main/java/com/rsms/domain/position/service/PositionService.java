package com.rsms.domain.position.service;

import com.rsms.domain.position.dto.*;
import com.rsms.domain.position.entity.Position;
import com.rsms.domain.position.entity.PositionDetail;
import com.rsms.domain.position.repository.PositionRepository;
import com.rsms.domain.position.repository.PositionDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 직책 Service
 * - 직책 비즈니스 로직 처리
 * - CRUD 및 검색 기능 제공
 * - positions 테이블과 positions_details 테이블 연동 관리
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
    private final PositionDetailRepository positionDetailRepository;

    /**
     * 모든 직책 조회 (positions 기준)
     * - positions 테이블 기준으로 각 직책당 1개 행 반환
     * - 부점명은 배열로 집계하여 orgNames 필드에 저장
     * - 부점 개수도 함께 반환
     *
     * @return 직책 DTO 리스트 (각 직책당 1개 행)
     */
    public List<PositionDto> getAllPositions() {
        log.debug("모든 직책 조회 (positions 기준 그룹화)");

        // positions 기준으로 그룹화된 데이터 조회
        List<java.util.Map<String, Object>> results = positionRepository.findAllPositionsGrouped();
        log.debug("조회된 직책 수: {}", results.size());

        // 각 행을 PositionDto로 변환
        return results.stream()
            .map(row -> {
                // org_names를 "||"로 구분하여 List로 변환
                String orgNamesString = (String) row.get("org_names");
                List<String> orgNames = orgNamesString != null && !orgNamesString.isEmpty()
                    ? List.of(orgNamesString.split("\\|\\|"))
                    : List.of();

                return PositionDto.builder()
                    .positionsId(((Number) row.get("positions_id")).longValue())
                    .ledgerOrderId((String) row.get("ledger_order_id"))
                    .positionsCd((String) row.get("positions_cd"))
                    .positionsName((String) row.get("positions_name"))
                    .hqCode((String) row.get("hq_code"))
                    .hqName((String) row.get("hq_name"))
                    .expirationDate(row.get("expiration_date") != null
                        ? ((java.sql.Date) row.get("expiration_date")).toLocalDate()
                        : null)
                    .positionsStatus((String) row.get("positions_status"))
                    .isActive(convertToString(row.get("is_active")))
                    .isConcurrent(convertToString(row.get("is_concurrent")))
                    .orgNames(orgNames)  // 부점명 리스트
                    .createdBy((String) row.get("created_by"))
                    .createdAt(row.get("created_at") != null
                        ? ((java.sql.Timestamp) row.get("created_at")).toLocalDateTime()
                        : null)
                    .updatedBy((String) row.get("updated_by"))
                    .updatedAt(row.get("updated_at") != null
                        ? ((java.sql.Timestamp) row.get("updated_at")).toLocalDateTime()
                        : null)
                    .build();
            })
            .collect(Collectors.toList());
    }

    /**
     * Object를 String으로 안전하게 변환
     * - Character 또는 String 타입 모두 처리
     * - CHAR(1) 컬럼 처리용 (PostgreSQL이 Character로 반환)
     *
     * @param value 변환할 값
     * @return String 값 (null 가능)
     */
    private String convertToString(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Character) {
            return String.valueOf(value);
        }
        return (String) value;
    }

    /**
     * 직책 검색 (부서 목록 포함)
     * - 키워드, 본부코드, 사용여부, 원장차수로 검색
     * - positions_details + organizations 테이블 조인하여 부서 목록(orgCodes, orgNames) 포함
     *
     * @param request 검색 조건
     * @return 검색 결과 리스트 (부서 목록 포함)
     */
    public List<PositionDto> searchPositions(PositionSearchRequest request) {
        log.debug("직책 검색 - keyword: {}, hqCode: {}, isActive: {}, ledgerOrderId: {}",
            request.getKeyword(), request.getHqCode(), request.getIsActive(), request.getLedgerOrderId());

        List<Position> positions = positionRepository.searchPositions(
            request.getKeyword(),
            request.getHqCode(),
            request.getIsActive(),
            request.getLedgerOrderId()
        );

        return positions.stream()
            .map(position -> {
                PositionDto dto = PositionDto.from(position);

                // positions_details + organizations 조인하여 부서 코드와 부서명 조회
                List<java.util.Map<String, Object>> orgInfoList =
                    positionDetailRepository.findOrgInfoByPositionsId(position.getPositionsId());

                // 조직코드 리스트 추출
                List<String> orgCodes = orgInfoList.stream()
                    .map(map -> (String) map.get("org_code"))
                    .collect(Collectors.toList());

                // 조직명 리스트 추출
                List<String> orgNames = orgInfoList.stream()
                    .map(map -> (String) map.get("org_name"))
                    .collect(Collectors.toList());

                dto.setOrgCodes(orgCodes);
                dto.setOrgNames(orgNames);

                return dto;
            })
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
     * 원장차수별 조회
     * - 원장차수ID로 직책 조회
     *
     * @param ledgerOrderId 원장차수ID
     * @return 직책 DTO 리스트
     */
    public List<PositionDto> getPositionsByLedgerOrderId(String ledgerOrderId) {
        log.debug("원장차수별 조회 - ledgerOrderId: {}", ledgerOrderId);
        return positionRepository.findByLedgerOrderId(ledgerOrderId).stream()
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
     * - 새로운 직책 등록 (positions 테이블)
     * - 직책별 조직 상세 정보 등록 (positions_details 테이블)
     * - 직책명 중복 확인 포함
     *
     * @param request 생성 요청 DTO (orgCodes 포함)
     * @param username 생성자
     * @return 생성된 직책 DTO
     */
    @Transactional
    public PositionDto createPosition(CreatePositionRequest request, String username) {
        log.info("직책 생성 - positionsName: {}, hqCode: {}, orgCodes: {}, user: {}",
            request.getPositionsName(), request.getHqCode(), request.getOrgCodes(), username);

        // 직책명 중복 확인
        if (positionRepository.existsByPositionsName(request.getPositionsName())) {
            throw new IllegalArgumentException("이미 존재하는 직책명입니다: " + request.getPositionsName());
        }

        // 1. positions 테이블에 저장
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

        // 2. positions_details 테이블에 조직코드 리스트 저장 (본부에 속한 모든 부서)
        List<PositionDetail> positionDetails = new ArrayList<>();
        for (String orgCode : request.getOrgCodes()) {
            PositionDetail detail = PositionDetail.builder()
                .positionsId(savedPosition.getPositionsId())
                .hqCode(request.getHqCode())
                .orgCode(orgCode)
                .createdBy(username)
                .updatedBy(username)
                .build();
            positionDetails.add(detail);
        }

        positionDetailRepository.saveAll(positionDetails);
        log.info("직책 상세정보 생성 완료 - positionsId: {}, count: {}",
            savedPosition.getPositionsId(), positionDetails.size());

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
        if (request.getLedgerOrderId() != null) {
            position.setLedgerOrderId(request.getLedgerOrderId());
        }
        if (request.getPositionsCd() != null) {
            position.setPositionsCd(request.getPositionsCd());
        }
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

        // 부점 목록 업데이트 (orgCodes가 제공된 경우)
        if (request.getOrgCodes() != null && !request.getOrgCodes().isEmpty()) {
            // 기존 부점 목록 삭제
            positionDetailRepository.deleteByPositionsId(positionsId);
            log.info("기존 부점 목록 삭제 완료 - positionsId: {}", positionsId);

            // 새로운 부점 목록 저장
            List<PositionDetail> newDetails = new ArrayList<>();
            for (String orgCode : request.getOrgCodes()) {
                PositionDetail detail = PositionDetail.builder()
                    .positionsId(positionsId)
                    .hqCode(request.getHqCode() != null ? request.getHqCode() : position.getHqCode())
                    .orgCode(orgCode)
                    .createdBy(username)
                    .updatedBy(username)
                    .build();
                newDetails.add(detail);
            }
            positionDetailRepository.saveAll(newDetails);
            log.info("새로운 부점 목록 저장 완료 - positionsId: {}, count: {}", positionsId, newDetails.size());
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
     * - 중복 ID 제거 및 이미 삭제된 항목 무시
     *
     * @param positionsIds 직책ID 리스트
     * @param username 삭제자
     */
    @Transactional
    public void deletePositions(List<Long> positionsIds, String username) {
        log.info("직책 복수 삭제 - count: {}, user: {}", positionsIds.size(), username);

        // 중복 제거
        List<Long> uniqueIds = positionsIds.stream().distinct().toList();

        int deletedCount = 0;
        for (Long positionsId : uniqueIds) {
            try {
                deletePosition(positionsId, username);
                deletedCount++;
            } catch (IllegalArgumentException e) {
                // 이미 삭제되었거나 존재하지 않는 경우 무시
                log.warn("직책 삭제 실패 (무시) - positionsId: {}, reason: {}", positionsId, e.getMessage());
            }
        }

        log.info("직책 복수 삭제 완료 - 요청: {}건, 실제 삭제: {}건", positionsIds.size(), deletedCount);
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

    /**
     * 직책별 부점 목록 조회
     * - positions_details + organizations 조인하여 부점 목록 반환
     *
     * @param positionsId 직책ID
     * @return 부점 목록 (org_code, org_name)
     */
    public List<java.util.Map<String, Object>> getPositionDepartments(Long positionsId) {
        log.debug("직책별 부점 목록 조회 - positionsId: {}", positionsId);
        return positionDetailRepository.findOrgInfoByPositionsId(positionsId);
    }
}
