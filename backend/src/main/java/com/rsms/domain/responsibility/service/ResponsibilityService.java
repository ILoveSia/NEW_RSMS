package com.rsms.domain.responsibility.service;

import com.rsms.domain.responsibility.dto.*;
import com.rsms.domain.responsibility.entity.Responsibility;
import com.rsms.domain.responsibility.repository.ResponsibilityRepository;
import com.rsms.domain.system.code.entity.CommonCodeDetail;
import com.rsms.domain.system.code.repository.CommonCodeDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 책무 Service
 * - 책무 비즈니스 로직 처리
 * - CRUD 및 검색 기능 제공
 *
 * @author Claude AI
 * @since 2025-09-24
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponsibilityService {

    private final ResponsibilityRepository responsibilityRepository;
    private final CommonCodeDetailRepository commonCodeDetailRepository;

    /**
     * 원장차수ID와 직책ID로 책무 목록 조회
     */
    public List<ResponsibilityDto> getResponsibilitiesByLedgerAndPosition(String ledgerOrderId, Long positionsId) {
        log.debug("책무 목록 조회 - ledgerOrderId: {}, positionsId: {}", ledgerOrderId, positionsId);

        List<Responsibility> responsibilities = responsibilityRepository
            .findByLedgerOrderIdAndPositionsId(ledgerOrderId, positionsId);

        // 공통코드 조회 (책무카테고리, 책무코드)
        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return responsibilities.stream()
            .map(r -> convertToDto(r, categoryMap, codeMap))
            .collect(Collectors.toList());
    }

    /**
     * 4개 테이블 조인 책무 목록 조회
     * - positions, responsibilities, responsibility_details, management_obligations
     * - 1:N 관계로 인해 직책, 책무, 책무세부가 중복될 수 있음 (정상)
     */
    public List<ResponsibilityListDto> getAllResponsibilitiesWithJoin(String ledgerOrderId, String positionsName, String responsibilityCd) {
        log.debug("4테이블 조인 책무 목록 조회 - ledgerOrderId: {}, positionsName: {}, responsibilityCd: {}",
                  ledgerOrderId, positionsName, responsibilityCd);

        List<Map<String, Object>> results = responsibilityRepository.findAllResponsibilitiesWithJoin(
            ledgerOrderId, positionsName, responsibilityCd);

        // 공통코드 조회
        Map<String, String> responsibilityCatMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> responsibilityCdMap = getCommonCodeMap("RSBT_OBLG_CD");
        Map<String, String> obligationMajorCatMap = getCommonCodeMap("OBLG_MAJOR_CAT_CD");
        Map<String, String> obligationMiddleCatMap = getCommonCodeMap("OBLG_MIDDLE_CAT_CD");

        List<ResponsibilityListDto> dtoList = results.stream()
            .map(row -> convertMapToListDto(row, responsibilityCatMap, responsibilityCdMap,
                                            obligationMajorCatMap, obligationMiddleCatMap))
            .collect(Collectors.toList());

        log.debug("4테이블 조인 책무 목록 조회 완료 - 결과 수: {}", dtoList.size());
        return dtoList;
    }

    /**
     * 책무 단건 조회
     */
    public ResponsibilityDto getResponsibility(Long responsibilityId) {
        log.debug("책무 단건 조회 - responsibilityId: {}", responsibilityId);

        Responsibility responsibility = responsibilityRepository.findById(responsibilityId)
            .orElseThrow(() -> new RuntimeException("책무를 찾을 수 없습니다. ID: " + responsibilityId));

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(responsibility, categoryMap, codeMap);
    }

    /**
     * 책무 생성
     */
    @Transactional
    public ResponsibilityDto createResponsibility(CreateResponsibilityRequest request, String username) {
        log.debug("책무 생성 요청 - request: {}, username: {}", request, username);

        // 책무 엔티티 생성
        Responsibility responsibility = Responsibility.builder()
            .ledgerOrderId(request.getLedgerOrderId())
            .positionsId(request.getPositionsId())
            .responsibilityCat(request.getResponsibilityCat())
            .responsibilityCd(request.getResponsibilityCd())
            .responsibilityInfo(request.getResponsibilityInfo())
            .responsibilityLegal(request.getResponsibilityLegal())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        Responsibility saved = responsibilityRepository.save(responsibility);
        log.info("책무 생성 완료 - responsibilityId: {}", saved.getResponsibilityId());

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(saved, categoryMap, codeMap);
    }

    /**
     * 책무 수정
     */
    @Transactional
    public ResponsibilityDto updateResponsibility(Long responsibilityId, UpdateResponsibilityRequest request, String username) {
        log.debug("책무 수정 요청 - responsibilityId: {}, request: {}, username: {}", responsibilityId, request, username);

        Responsibility responsibility = responsibilityRepository.findById(responsibilityId)
            .orElseThrow(() -> new RuntimeException("책무를 찾을 수 없습니다. ID: " + responsibilityId));

        responsibility.update(
            request.getResponsibilityInfo(),
            request.getResponsibilityLegal(),
            request.getIsActive(),
            username
        );

        Responsibility updated = responsibilityRepository.save(responsibility);
        log.info("책무 수정 완료 - responsibilityId: {}", updated.getResponsibilityId());

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(updated, categoryMap, codeMap);
    }

    /**
     * 책무 삭제
     */
    @Transactional
    public void deleteResponsibility(Long responsibilityId) {
        log.debug("책무 삭제 요청 - responsibilityId: {}", responsibilityId);

        if (!responsibilityRepository.existsById(responsibilityId)) {
            throw new RuntimeException("책무를 찾을 수 없습니다. ID: " + responsibilityId);
        }

        responsibilityRepository.deleteById(responsibilityId);
        log.info("책무 삭제 완료 - responsibilityId: {}", responsibilityId);
    }

    /**
     * 원장차수ID와 직책ID로 모든 책무 삭제 후 새로 저장
     */
    @Transactional
    public List<ResponsibilityDto> saveAllResponsibilities(String ledgerOrderId, Long positionsId,
                                                           List<CreateResponsibilityRequest> requests, String username) {
        log.debug("책무 전체 저장 - ledgerOrderId: {}, positionsId: {}, count: {}", ledgerOrderId, positionsId, requests.size());

        // 기존 책무 전체 삭제
        responsibilityRepository.deleteByLedgerOrderIdAndPositionsId(ledgerOrderId, positionsId);
        log.debug("기존 책무 전체 삭제 완료");

        // 새로운 책무 저장
        List<Responsibility> responsibilities = requests.stream()
            .map(req -> Responsibility.builder()
                .ledgerOrderId(ledgerOrderId)
                .positionsId(positionsId)
                .responsibilityCat(req.getResponsibilityCat())
                .responsibilityCd(req.getResponsibilityCd())
                .responsibilityInfo(req.getResponsibilityInfo())
                .responsibilityLegal(req.getResponsibilityLegal())
                .isActive(req.getIsActive() != null ? req.getIsActive() : "Y")
                .createdBy(username)
                .updatedBy(username)
                .build())
            .collect(Collectors.toList());

        List<Responsibility> savedList = responsibilityRepository.saveAll(responsibilities);
        log.info("책무 전체 저장 완료 - count: {}", savedList.size());

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return savedList.stream()
            .map(r -> convertToDto(r, categoryMap, codeMap))
            .collect(Collectors.toList());
    }

    /**
     * 공통코드 맵 조회 (코드 -> 명칭)
     */
    private Map<String, String> getCommonCodeMap(String groupCode) {
        List<CommonCodeDetail> codes = commonCodeDetailRepository
            .findByGroupCodeAndIsActive(groupCode, "Y");

        return codes.stream()
            .collect(Collectors.toMap(
                CommonCodeDetail::getDetailCode,
                CommonCodeDetail::getDetailName,
                (existing, replacement) -> existing
            ));
    }

    /**
     * Entity -> DTO 변환
     */
    private ResponsibilityDto convertToDto(Responsibility entity, Map<String, String> categoryMap, Map<String, String> codeMap) {
        return ResponsibilityDto.builder()
            .responsibilityId(entity.getResponsibilityId())
            .ledgerOrderId(entity.getLedgerOrderId())
            .positionsId(entity.getPositionsId())
            .responsibilityCat(entity.getResponsibilityCat())
            .responsibilityCatName(categoryMap.get(entity.getResponsibilityCat()))
            .responsibilityCd(entity.getResponsibilityCd())
            .responsibilityCdName(codeMap.get(entity.getResponsibilityCd()))
            .responsibilityInfo(entity.getResponsibilityInfo())
            .responsibilityLegal(entity.getResponsibilityLegal())
            .expirationDate(entity.getExpirationDate())
            .responsibilityStatus(entity.getResponsibilityStatus())
            .isActive(entity.getIsActive())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedBy(entity.getUpdatedBy())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    /**
     * Map -> ResponsibilityListDto 변환
     * - Native Query 결과를 DTO로 변환
     */
    private ResponsibilityListDto convertMapToListDto(Map<String, Object> row,
                                                      Map<String, String> responsibilityCatMap,
                                                      Map<String, String> responsibilityCdMap,
                                                      Map<String, String> obligationMajorCatMap,
                                                      Map<String, String> obligationMiddleCatMap) {
        return ResponsibilityListDto.builder()
            // positions 테이블
            .positionsId(getLongValue(row, "positions_id"))
            .ledgerOrderId(getStringValue(row, "ledger_order_id"))
            .positionsCd(getStringValue(row, "positions_cd"))
            .positionsName(getStringValue(row, "positions_name"))
            .hqCode(getStringValue(row, "hq_code"))
            .hqName(getStringValue(row, "hq_name"))
            // responsibilities 테이블
            .responsibilityId(getLongValue(row, "responsibility_id"))
            .responsibilityCat(getStringValue(row, "responsibility_cat"))
            .responsibilityCatName(responsibilityCatMap.get(getStringValue(row, "responsibility_cat")))
            .responsibilityCd(getStringValue(row, "responsibility_cd"))
            .responsibilityCdName(responsibilityCdMap.get(getStringValue(row, "responsibility_cd")))
            .responsibilityInfo(getStringValue(row, "responsibility_info"))
            .responsibilityLegal(getStringValue(row, "responsibility_legal"))
            .responsibilityIsActive(getStringValue(row, "responsibility_is_active"))
            // responsibility_details 테이블
            .responsibilityDetailId(getLongValue(row, "responsibility_detail_id"))
            .responsibilityDetailInfo(getStringValue(row, "responsibility_detail_info"))
            .detailIsActive(getStringValue(row, "detail_is_active"))
            // management_obligations 테이블
            .managementObligationId(getLongValue(row, "management_obligation_id"))
            .obligationMajorCatCd(getStringValue(row, "obligation_major_cat_cd"))
            .obligationMajorCatName(obligationMajorCatMap.get(getStringValue(row, "obligation_major_cat_cd")))
            .obligationMiddleCatCd(getStringValue(row, "obligation_middle_cat_cd"))
            .obligationMiddleCatName(obligationMiddleCatMap.get(getStringValue(row, "obligation_middle_cat_cd")))
            .obligationCd(getStringValue(row, "obligation_cd"))
            .obligationInfo(getStringValue(row, "obligation_info"))
            .orgCode(getStringValue(row, "org_code"))
            .obligationIsActive(getStringValue(row, "obligation_is_active"))
            .build();
    }

    /**
     * Map에서 String 값 추출
     */
    private String getStringValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * Map에서 Long 값 추출
     */
    private Long getLongValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) return null;
        if (value instanceof Long) return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number) return ((Number) value).longValue();
        return null;
    }
}
