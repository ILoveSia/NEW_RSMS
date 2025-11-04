package com.rsms.domain.system.code.service;

import com.rsms.domain.system.code.dto.*;
import com.rsms.domain.system.code.entity.CommonCodeDetail;
import com.rsms.domain.system.code.entity.CommonCodeGroup;
import com.rsms.domain.system.code.repository.CommonCodeDetailRepository;
import com.rsms.domain.system.code.repository.CommonCodeGroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 공통코드 Service
 *
 * @description 공통코드 비즈니스 로직 처리
 * @author Claude AI
 * @since 2025-09-24
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonCodeService {

    private final CommonCodeGroupRepository codeGroupRepository;
    private final CommonCodeDetailRepository codeDetailRepository;

    // ===============================
    // 코드 그룹 관련
    // ===============================

    /**
     * 모든 코드 그룹 조회
     */
    public List<CommonCodeGroupDto> getAllCodeGroups() {
        log.debug("모든 코드 그룹 조회");
        return codeGroupRepository.findAllByOrderBySortOrderAsc().stream()
            .map(CommonCodeGroupDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 코드 그룹 페이징 조회
     */
    public Page<CommonCodeGroupDto> getCodeGroups(String keyword, String category, String isActive, Pageable pageable) {
        log.debug("코드 그룹 검색 - keyword: {}, category: {}, isActive: {}", keyword, category, isActive);
        return codeGroupRepository.searchWithFilters(keyword, category, isActive, pageable)
            .map(CommonCodeGroupDto::from);
    }

    /**
     * 코드 그룹 단건 조회
     */
    public CommonCodeGroupDto getCodeGroup(String groupCode) {
        log.debug("코드 그룹 조회 - groupCode: {}", groupCode);
        CommonCodeGroup codeGroup = codeGroupRepository.findById(groupCode)
            .orElseThrow(() -> new IllegalArgumentException("코드 그룹을 찾을 수 없습니다: " + groupCode));
        return CommonCodeGroupDto.from(codeGroup);
    }

    /**
     * 코드 그룹 및 상세 조회
     */
    public CommonCodeGroupDto getCodeGroupWithDetails(String groupCode) {
        log.debug("코드 그룹 및 상세 조회 - groupCode: {}", groupCode);
        CommonCodeGroup codeGroup = codeGroupRepository.findByIdWithDetails(groupCode)
            .orElseThrow(() -> new IllegalArgumentException("코드 그룹을 찾을 수 없습니다: " + groupCode));
        return CommonCodeGroupDto.fromWithDetails(codeGroup);
    }

    /**
     * 활성화된 모든 코드 그룹 및 상세 조회
     */
    public List<CommonCodeGroupDto> getAllActiveCodeGroupsWithDetails() {
        log.debug("활성화된 모든 코드 그룹 및 상세 조회");
        return codeGroupRepository.findAllActiveWithDetails().stream()
            .map(CommonCodeGroupDto::fromWithDetails)
            .collect(Collectors.toList());
    }

    /**
     * 카테고리별 코드 그룹 조회
     */
    public List<CommonCodeGroupDto> getCodeGroupsByCategory(String category) {
        log.debug("카테고리별 코드 그룹 조회 - category: {}", category);
        return codeGroupRepository.findByCategoryOrderBySortOrderAsc(category).stream()
            .map(CommonCodeGroupDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 코드 그룹 생성
     */
    @Transactional
    public CommonCodeGroupDto createCodeGroup(CreateCodeGroupRequest request, String username) {
        log.info("코드 그룹 생성 - groupCode: {}, user: {}", request.getGroupCode(), username);

        // 중복 체크
        if (codeGroupRepository.existsByGroupCode(request.getGroupCode())) {
            throw new IllegalArgumentException("이미 존재하는 그룹코드입니다: " + request.getGroupCode());
        }

        CommonCodeGroup codeGroup = CommonCodeGroup.builder()
            .groupCode(request.getGroupCode())
            .groupName(request.getGroupName())
            .description(request.getDescription())
            .category(request.getCategory())
            .categoryCode(request.getCategoryCode())
            .systemCode(request.getSystemCode())
            .editable(request.getEditable())
            .sortOrder(request.getSortOrder())
            .isActive(request.getIsActive())
            .createdBy(username)
            .createdAt(LocalDateTime.now())
            .updatedBy(username)
            .updatedAt(LocalDateTime.now())
            .build();

        CommonCodeGroup savedGroup = codeGroupRepository.save(codeGroup);
        return CommonCodeGroupDto.from(savedGroup);
    }

    /**
     * 코드 그룹 수정
     */
    @Transactional
    public CommonCodeGroupDto updateCodeGroup(String groupCode, UpdateCodeGroupRequest request, String username) {
        log.info("코드 그룹 수정 - groupCode: {}, user: {}", groupCode, username);

        CommonCodeGroup codeGroup = codeGroupRepository.findById(groupCode)
            .orElseThrow(() -> new IllegalArgumentException("코드 그룹을 찾을 수 없습니다: " + groupCode));

        // 비즈니스 로직 호출
        codeGroup.update(
            request.getGroupName(),
            request.getDescription(),
            request.getCategory(),
            request.getSortOrder()
        );

        codeGroup.setIsActive(request.getIsActive());
        codeGroup.setUpdatedBy(username);
        codeGroup.setUpdatedAt(LocalDateTime.now());

        return CommonCodeGroupDto.from(codeGroup);
    }

    /**
     * 코드 그룹 삭제
     */
    @Transactional
    public void deleteCodeGroup(String groupCode, String username) {
        log.info("코드 그룹 삭제 - groupCode: {}, user: {}", groupCode, username);

        CommonCodeGroup codeGroup = codeGroupRepository.findById(groupCode)
            .orElseThrow(() -> new IllegalArgumentException("코드 그룹을 찾을 수 없습니다: " + groupCode));

        if (codeGroup.isSystemCode()) {
            throw new IllegalStateException("시스템 코드는 삭제할 수 없습니다.");
        }

        codeGroupRepository.delete(codeGroup);
    }

    /**
     * 코드 그룹 활성화/비활성화
     */
    @Transactional
    public void toggleCodeGroupActive(String groupCode, String username) {
        log.info("코드 그룹 활성화/비활성화 - groupCode: {}, user: {}", groupCode, username);

        CommonCodeGroup codeGroup = codeGroupRepository.findById(groupCode)
            .orElseThrow(() -> new IllegalArgumentException("코드 그룹을 찾을 수 없습니다: " + groupCode));

        if ("Y".equals(codeGroup.getIsActive())) {
            codeGroup.deactivate();
        } else {
            codeGroup.activate();
        }

        codeGroup.setUpdatedBy(username);
        codeGroup.setUpdatedAt(LocalDateTime.now());
    }

    // ===============================
    // 코드 상세 관련
    // ===============================

    /**
     * 그룹별 상세 코드 조회
     */
    public List<CommonCodeDetailDto> getCodeDetailsByGroup(String groupCode) {
        log.debug("그룹별 상세 코드 조회 - groupCode: {}", groupCode);
        return codeDetailRepository.findByGroupCodeOrderBySortOrderAsc(groupCode).stream()
            .map(CommonCodeDetailDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 그룹별 활성화된 상세 코드 조회
     */
    public List<CommonCodeDetailDto> getActiveCodeDetailsByGroup(String groupCode) {
        log.debug("그룹별 활성화된 상세 코드 조회 - groupCode: {}", groupCode);
        return codeDetailRepository.findByGroupCodeAndIsActiveOrderBySortOrderAsc(groupCode, "Y").stream()
            .map(CommonCodeDetailDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 현재 유효한 코드 조회
     */
    public List<CommonCodeDetailDto> getCurrentValidCodes(String groupCode) {
        log.debug("현재 유효한 코드 조회 - groupCode: {}", groupCode);
        return codeDetailRepository.findCurrentValidCodes(groupCode).stream()
            .map(CommonCodeDetailDto::from)
            .collect(Collectors.toList());
    }

    /**
     * 상세 코드 단건 조회
     */
    public CommonCodeDetailDto getCodeDetail(String groupCode, String detailCode) {
        log.debug("상세 코드 조회 - groupCode: {}, detailCode: {}", groupCode, detailCode);
        CommonCodeDetail.CodeDetailId id = new CommonCodeDetail.CodeDetailId(groupCode, detailCode);
        CommonCodeDetail codeDetail = codeDetailRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format("상세 코드를 찾을 수 없습니다: %s-%s", groupCode, detailCode)));
        return CommonCodeDetailDto.from(codeDetail);
    }

    /**
     * 상세 코드 생성
     */
    @Transactional
    public CommonCodeDetailDto createCodeDetail(CreateCodeDetailRequest request, String username) {
        log.info("상세 코드 생성 - groupCode: {}, detailCode: {}, user: {}",
            request.getGroupCode(), request.getDetailCode(), username);

        // 그룹 존재 여부 확인
        if (!codeGroupRepository.existsByGroupCode(request.getGroupCode())) {
            throw new IllegalArgumentException("코드 그룹을 찾을 수 없습니다: " + request.getGroupCode());
        }

        // 중복 체크
        if (codeDetailRepository.existsByGroupCodeAndDetailCode(
            request.getGroupCode(), request.getDetailCode())) {
            throw new IllegalArgumentException(
                String.format("이미 존재하는 상세 코드입니다: %s-%s",
                    request.getGroupCode(), request.getDetailCode()));
        }

        CommonCodeDetail codeDetail = CommonCodeDetail.builder()
            .groupCode(request.getGroupCode())
            .detailCode(request.getDetailCode())
            .detailName(request.getDetailName())
            .description(request.getDescription())
            .parentCode(request.getParentCode())
            .levelDepth(request.getLevelDepth())
            .sortOrder(request.getSortOrder())
            .extAttr1(request.getExtAttr1())
            .extAttr2(request.getExtAttr2())
            .extAttr3(request.getExtAttr3())
            .extraData(request.getExtraData())
            .validFrom(request.getValidFrom())
            .validUntil(request.getValidUntil())
            .isActive(request.getIsActive())
            .createdBy(username)
            .createdAt(LocalDateTime.now())
            .updatedBy(username)
            .updatedAt(LocalDateTime.now())
            .build();

        CommonCodeDetail savedDetail = codeDetailRepository.save(codeDetail);
        return CommonCodeDetailDto.from(savedDetail);
    }

    /**
     * 상세 코드 수정
     */
    @Transactional
    public CommonCodeDetailDto updateCodeDetail(
        String groupCode, String detailCode, UpdateCodeDetailRequest request, String username) {
        log.info("상세 코드 수정 - groupCode: {}, detailCode: {}, user: {}",
            groupCode, detailCode, username);

        CommonCodeDetail.CodeDetailId id = new CommonCodeDetail.CodeDetailId(groupCode, detailCode);
        CommonCodeDetail codeDetail = codeDetailRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format("상세 코드를 찾을 수 없습니다: %s-%s", groupCode, detailCode)));

        // detailCode 변경 처리 (복합키의 일부 변경)
        if (request.getDetailCode() != null && !request.getDetailCode().equals(detailCode)) {
            log.info("detailCode 변경 감지: {} -> {}", detailCode, request.getDetailCode());

            // 기존 데이터 복사하여 새 엔티티 생성
            CommonCodeDetail newCodeDetail = CommonCodeDetail.builder()
                .groupCode(groupCode)
                .detailCode(request.getDetailCode())
                .detailName(request.getDetailName())
                .description(request.getDescription())
                .parentCode(codeDetail.getParentCode())
                .levelDepth(codeDetail.getLevelDepth())
                .sortOrder(request.getSortOrder())
                .extAttr1(request.getExtAttr1())
                .extAttr2(request.getExtAttr2())
                .extAttr3(request.getExtAttr3())
                .extraData(codeDetail.getExtraData())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .isActive(request.getIsActive())
                .createdBy(codeDetail.getCreatedBy())
                .createdAt(codeDetail.getCreatedAt())
                .updatedBy(username)
                .updatedAt(LocalDateTime.now())
                .build();

            // 기존 행 삭제, 새 행 생성
            codeDetailRepository.delete(codeDetail);
            codeDetailRepository.flush(); // 즉시 DB에 반영
            codeDetail = codeDetailRepository.save(newCodeDetail);
        } else {
            // detailCode 변경 없음 - 기존 방식으로 업데이트
            codeDetail.update(
                request.getDetailName(),
                request.getDescription(),
                request.getSortOrder(),
                request.getExtAttr1(),
                request.getExtAttr2(),
                request.getExtAttr3()
            );

            if (request.getValidFrom() != null || request.getValidUntil() != null) {
                codeDetail.setValidPeriod(request.getValidFrom(), request.getValidUntil());
            }

            codeDetail.setIsActive(request.getIsActive());
            codeDetail.setUpdatedBy(username);
            codeDetail.setUpdatedAt(LocalDateTime.now());
        }

        return CommonCodeDetailDto.from(codeDetail);
    }

    /**
     * 상세 코드 삭제
     */
    @Transactional
    public void deleteCodeDetail(String groupCode, String detailCode, String username) {
        log.info("상세 코드 삭제 - groupCode: {}, detailCode: {}, user: {}",
            groupCode, detailCode, username);

        CommonCodeDetail.CodeDetailId id = new CommonCodeDetail.CodeDetailId(groupCode, detailCode);
        if (!codeDetailRepository.existsById(id)) {
            throw new IllegalArgumentException(
                String.format("상세 코드를 찾을 수 없습니다: %s-%s", groupCode, detailCode));
        }

        codeDetailRepository.deleteById(id);
    }

    /**
     * 상세 코드 활성화/비활성화
     */
    @Transactional
    public void toggleCodeDetailActive(String groupCode, String detailCode, String username) {
        log.info("상세 코드 활성화/비활성화 - groupCode: {}, detailCode: {}, user: {}",
            groupCode, detailCode, username);

        CommonCodeDetail.CodeDetailId id = new CommonCodeDetail.CodeDetailId(groupCode, detailCode);
        CommonCodeDetail codeDetail = codeDetailRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                String.format("상세 코드를 찾을 수 없습니다: %s-%s", groupCode, detailCode)));

        if ("Y".equals(codeDetail.getIsActive())) {
            codeDetail.deactivate();
        } else {
            codeDetail.activate();
        }

        codeDetail.setUpdatedBy(username);
        codeDetail.setUpdatedAt(LocalDateTime.now());
    }
}
