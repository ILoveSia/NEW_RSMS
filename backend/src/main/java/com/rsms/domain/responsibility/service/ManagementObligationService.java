package com.rsms.domain.responsibility.service;

import com.rsms.domain.responsibility.dto.CreateManagementObligationRequest;
import com.rsms.domain.responsibility.dto.ManagementObligationDto;
import com.rsms.domain.responsibility.entity.ManagementObligation;
import com.rsms.domain.responsibility.repository.ManagementObligationRepository;
import com.rsms.domain.organization.repository.OrganizationRepository;
import com.rsms.domain.organization.entity.Organization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리의무 서비스
 * - 관리의무 CRUD 비즈니스 로직 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagementObligationService {

    private final ManagementObligationRepository managementObligationRepository;
    private final OrganizationRepository organizationRepository;

    /**
     * 관리의무 생성
     * - 책무세부에 대한 관리의무를 개별 저장
     *
     * @param request 관리의무 생성 요청 DTO
     * @param username 생성자 사용자명
     * @return 생성된 관리의무 DTO
     */
    @Transactional
    public ManagementObligationDto createObligation(CreateManagementObligationRequest request, String username) {
        log.debug("[ManagementObligationService] 관리의무 생성 요청 - responsibilityDetailId: {}, orgCode: {}, username: {}",
            request.getResponsibilityDetailId(), request.getOrgCode(), username);

        // 관리의무 엔티티 생성
        ManagementObligation obligation = ManagementObligation.builder()
            .responsibilityDetailId(request.getResponsibilityDetailId())
            .obligationMajorCatCd(request.getObligationMajorCatCd())
            .obligationMiddleCatCd(request.getObligationMiddleCatCd())
            .obligationCd(request.getObligationCd())
            .obligationInfo(request.getObligationInfo())
            .orgCode(request.getOrgCode())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        // 저장
        ManagementObligation saved = managementObligationRepository.save(obligation);
        log.info("[ManagementObligationService] 관리의무 생성 완료 - managementObligationId: {}", saved.getManagementObligationId());

        // 조직명 조회 (org_code가 있는 경우에만)
        String orgName = "";
        if (saved.getOrgCode() != null && !saved.getOrgCode().isEmpty()) {
            orgName = organizationRepository.findById(saved.getOrgCode())
                    .map(Organization::getOrgName)
                    .orElse("");
        }

        // DTO 변환 후 반환 (조직명 포함)
        return convertToDtoWithOrgName(saved, orgName);
    }

    /**
     * 책무세부ID로 관리의무 목록 조회 (조직명 포함)
     *
     * @param responsibilityDetailId 책무세부ID
     * @return 관리의무 DTO 리스트 (조직명 포함)
     */
    public List<ManagementObligationDto> findByResponsibilityDetailId(Long responsibilityDetailId) {
        log.debug("[ManagementObligationService] 관리의무 조회 - responsibilityDetailId: {}", responsibilityDetailId);

        // 기본 조회 메서드 사용
        List<ManagementObligation> obligations = managementObligationRepository.findByResponsibilityDetailId(responsibilityDetailId);

        // 각 관리의무에 대해 org_name 조회하여 DTO 변환
        return obligations.stream()
            .map(obligation -> {
                String orgName = "";
                if (obligation.getOrgCode() != null && !obligation.getOrgCode().isEmpty()) {
                    orgName = organizationRepository.findById(obligation.getOrgCode())
                            .map(org -> org.getOrgName())
                            .orElse("");
                }
                return convertToDtoWithOrgName(obligation, orgName);
            })
            .collect(Collectors.toList());
    }

    /**
     * 관리의무 삭제
     *
     * @param managementObligationId 관리의무ID
     */
    @Transactional
    public void deleteObligation(Long managementObligationId) {
        log.debug("[ManagementObligationService] 관리의무 삭제 요청 - managementObligationId: {}", managementObligationId);

        if (!managementObligationRepository.existsById(managementObligationId)) {
            throw new IllegalArgumentException("관리의무를 찾을 수 없습니다. ID: " + managementObligationId);
        }

        managementObligationRepository.deleteById(managementObligationId);
        log.info("[ManagementObligationService] 관리의무 삭제 완료 - managementObligationId: {}", managementObligationId);
    }

    /**
     * 책무세부ID로 모든 관리의무 삭제
     *
     * @param responsibilityDetailId 책무세부ID
     */
    @Transactional
    public void deleteByResponsibilityDetailId(Long responsibilityDetailId) {
        log.debug("[ManagementObligationService] 책무세부의 모든 관리의무 삭제 - responsibilityDetailId: {}", responsibilityDetailId);

        managementObligationRepository.deleteByResponsibilityDetailId(responsibilityDetailId);
        log.info("[ManagementObligationService] 책무세부의 모든 관리의무 삭제 완료 - responsibilityDetailId: {}", responsibilityDetailId);
    }

    /**
     * Entity → DTO 변환 (조직명 포함)
     *
     * @param obligation 관리의무 엔티티
     * @param orgName 조직명
     * @return 관리의무 DTO
     */
    private ManagementObligationDto convertToDtoWithOrgName(ManagementObligation obligation, String orgName) {
        return ManagementObligationDto.builder()
            .managementObligationId(obligation.getManagementObligationId())
            .responsibilityDetailId(obligation.getResponsibilityDetailId())
            .obligationMajorCatCd(obligation.getObligationMajorCatCd())
            .obligationMiddleCatCd(obligation.getObligationMiddleCatCd())
            .obligationCd(obligation.getObligationCd())
            .obligationInfo(obligation.getObligationInfo())
            .orgCode(obligation.getOrgCode())
            .orgName(orgName)  // 조직명 추가
            .isActive(obligation.getIsActive())
            .createdAt(obligation.getCreatedAt())
            .createdBy(obligation.getCreatedBy())
            .updatedAt(obligation.getUpdatedAt())
            .updatedBy(obligation.getUpdatedBy())
            .build();
    }

    /**
     * Entity → DTO 변환 (기본)
     *
     * @param obligation 관리의무 엔티티
     * @return 관리의무 DTO
     */
    private ManagementObligationDto convertToDto(ManagementObligation obligation) {
        return ManagementObligationDto.builder()
            .managementObligationId(obligation.getManagementObligationId())
            .responsibilityDetailId(obligation.getResponsibilityDetailId())
            .obligationMajorCatCd(obligation.getObligationMajorCatCd())
            .obligationMiddleCatCd(obligation.getObligationMiddleCatCd())
            .obligationCd(obligation.getObligationCd())
            .obligationInfo(obligation.getObligationInfo())
            .orgCode(obligation.getOrgCode())
            .isActive(obligation.getIsActive())
            .createdAt(obligation.getCreatedAt())
            .createdBy(obligation.getCreatedBy())
            .updatedAt(obligation.getUpdatedAt())
            .updatedBy(obligation.getUpdatedBy())
            .build();
    }
}
