package com.rsms.domain.responsibility.service;

import com.rsms.domain.responsibility.dto.CreateManagementObligationRequest;
import com.rsms.domain.responsibility.dto.ManagementObligationDto;
import com.rsms.domain.responsibility.dto.UpdateManagementObligationRequest;
import com.rsms.domain.responsibility.entity.ManagementObligation;
import com.rsms.domain.responsibility.entity.ResponsibilityDetail;
import com.rsms.domain.responsibility.repository.ManagementObligationRepository;
import com.rsms.domain.responsibility.repository.ResponsibilityDetailRepository;
import com.rsms.domain.organization.repository.OrganizationRepository;
import com.rsms.domain.organization.entity.Organization;
import com.rsms.domain.system.code.service.CommonCodeService;
import com.rsms.domain.system.code.dto.CommonCodeDetailDto;
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
    private final ResponsibilityDetailRepository responsibilityDetailRepository;
    private final OrganizationRepository organizationRepository;
    private final CommonCodeService commonCodeService;

    // ===============================
    // 코드 자동 생성 로직
    // ===============================

    /**
     * 관리의무코드 자동 생성
     * - 코드 생성 규칙: 책무세부코드 + "O" + 순번(4자리)
     * - 예시: "20250001M0002D0001O0001" = "20250001M0002D0001"(책무세부코드) + "O" + "0001"(순번)
     *
     * @param responsibilityDetailCd 책무세부코드 (예: "20250001M0002D0001")
     * @return 생성된 관리의무코드 (예: "20250001M0002D0001O0001")
     */
    private String generateObligationCode(String responsibilityDetailCd) {
        log.debug("[ManagementObligationService] 관리의무코드 생성 시작 - responsibilityDetailCd: {}", responsibilityDetailCd);

        // 1. prefix 길이 계산 (책무세부코드 + "O" = prefixLength)
        int prefixLength = responsibilityDetailCd.length() + 1;  // "20250001M0002D0001O"의 길이

        // 2. 최대 순번 조회
        Integer maxSeq = managementObligationRepository.findMaxSequenceByResponsibilityDetailCd(
            responsibilityDetailCd, prefixLength);

        // 3. 다음 순번 계산
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;

        // 4. 4자리 순번으로 포맷팅
        String formattedSeq = String.format("%04d", nextSeq);

        // 5. 코드 조합: responsibilityDetailCd + "O" + 순번
        String code = responsibilityDetailCd + "O" + formattedSeq;

        log.debug("[ManagementObligationService] 관리의무코드 생성 완료 - responsibilityDetailCd: {}, seq: {} -> code: {}",
                  responsibilityDetailCd, nextSeq, code);

        return code;
    }

    /**
     * 관리의무 생성
     * - 관리의무코드는 자동 생성됨
     *
     * @param request 관리의무 생성 요청 DTO
     * @param username 생성자 사용자명
     * @return 생성된 관리의무 DTO
     */
    @Transactional
    public ManagementObligationDto createObligation(CreateManagementObligationRequest request, String username) {
        log.debug("[ManagementObligationService] 관리의무 생성 요청 - responsibilityDetailCd: {}, orgCode: {}, username: {}",
            request.getResponsibilityDetailCd(), request.getOrgCode(), username);

        // 책무세부 엔티티 조회 (FK 연관관계 설정을 위해 필수)
        ResponsibilityDetail responsibilityDetail = responsibilityDetailRepository.findById(request.getResponsibilityDetailCd())
            .orElseThrow(() -> new IllegalArgumentException("책무세부를 찾을 수 없습니다. CODE: " + request.getResponsibilityDetailCd()));

        // 관리의무코드 자동 생성
        String generatedCode = generateObligationCode(request.getResponsibilityDetailCd());

        // 관리의무 엔티티 생성
        ManagementObligation obligation = ManagementObligation.builder()
            .obligationCd(generatedCode)  // 자동 생성된 코드 사용
            .responsibilityDetail(responsibilityDetail)  // 연관관계 설정 (responsibilityDetailCd는 여기서 자동 설정됨)
            .obligationMajorCatCd(request.getObligationMajorCatCd())
            .obligationMiddleCatCd(request.getObligationMiddleCatCd())
            .obligationInfo(request.getObligationInfo())
            .orgCode(request.getOrgCode())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        // 저장
        ManagementObligation saved = managementObligationRepository.save(obligation);
        log.info("[ManagementObligationService] 관리의무 생성 완료 - obligationCd: {}", saved.getObligationCd());

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
     * 전체 관리의무 목록 조회 (조직명 포함)
     *
     * @return 전체 관리의무 DTO 리스트 (조직명 포함)
     */
    public List<ManagementObligationDto> findAll() {
        log.debug("[ManagementObligationService] 전체 관리의무 조회");

        // 전체 조회
        List<ManagementObligation> obligations = managementObligationRepository.findAll();

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
     * 책무세부코드로 관리의무 목록 조회 (조직명 포함)
     *
     * @param responsibilityDetailCd 책무세부코드
     * @return 관리의무 DTO 리스트 (조직명 포함)
     */
    public List<ManagementObligationDto> findByResponsibilityDetailCd(String responsibilityDetailCd) {
        log.debug("[ManagementObligationService] 관리의무 조회 - responsibilityDetailCd: {}", responsibilityDetailCd);

        // 기본 조회 메서드 사용
        List<ManagementObligation> obligations = managementObligationRepository.findByResponsibilityDetailCd(responsibilityDetailCd);

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
     * @param obligationCd 관리의무코드
     */
    @Transactional
    public void deleteObligation(String obligationCd) {
        log.debug("[ManagementObligationService] 관리의무 삭제 요청 - obligationCd: {}", obligationCd);

        if (!managementObligationRepository.existsById(obligationCd)) {
            throw new IllegalArgumentException("관리의무를 찾을 수 없습니다. CODE: " + obligationCd);
        }

        managementObligationRepository.deleteById(obligationCd);
        log.info("[ManagementObligationService] 관리의무 삭제 완료 - obligationCd: {}", obligationCd);
    }

    /**
     * 관리의무 단일 조회 (조직명 포함)
     *
     * @param obligationCd 관리의무코드
     * @return 관리의무 DTO (조직명 포함)
     */
    public ManagementObligationDto getObligation(String obligationCd) {
        log.debug("[ManagementObligationService] 관리의무 단일 조회 - obligationCd: {}", obligationCd);

        ManagementObligation obligation = managementObligationRepository.findById(obligationCd)
            .orElseThrow(() -> new IllegalArgumentException("관리의무를 찾을 수 없습니다. CODE: " + obligationCd));

        // 조직명 조회
        String orgName = "";
        if (obligation.getOrgCode() != null && !obligation.getOrgCode().isEmpty()) {
            orgName = organizationRepository.findById(obligation.getOrgCode())
                    .map(Organization::getOrgName)
                    .orElse("");
        }

        return convertToDtoWithOrgName(obligation, orgName);
    }

    /**
     * 관리의무 수정
     *
     * @param obligationCd 관리의무코드
     * @param request 관리의무 수정 요청 DTO
     * @param username 수정자 사용자명
     * @return 수정된 관리의무 DTO
     */
    @Transactional
    public ManagementObligationDto updateObligation(String obligationCd, UpdateManagementObligationRequest request, String username) {
        log.debug("[ManagementObligationService] 관리의무 수정 요청 - obligationCd: {}, username: {}", obligationCd, username);

        ManagementObligation obligation = managementObligationRepository.findById(obligationCd)
            .orElseThrow(() -> new IllegalArgumentException("관리의무를 찾을 수 없습니다. CODE: " + obligationCd));

        // 수정 가능한 필드만 업데이트
        obligation.setObligationMajorCatCd(request.getObligationMajorCatCd());
        obligation.setObligationMiddleCatCd(request.getObligationMiddleCatCd());
        obligation.setObligationInfo(request.getObligationInfo());
        obligation.setOrgCode(request.getOrgCode());
        obligation.setIsActive(request.getIsActive());
        obligation.setUpdatedBy(username);

        ManagementObligation updated = managementObligationRepository.save(obligation);
        log.info("[ManagementObligationService] 관리의무 수정 완료 - obligationCd: {}", updated.getObligationCd());

        // 조직명 조회
        String orgName = "";
        if (updated.getOrgCode() != null && !updated.getOrgCode().isEmpty()) {
            orgName = organizationRepository.findById(updated.getOrgCode())
                    .map(Organization::getOrgName)
                    .orElse("");
        }

        return convertToDtoWithOrgName(updated, orgName);
    }

    /**
     * 책무세부코드로 모든 관리의무 삭제
     *
     * @param responsibilityDetailCd 책무세부코드
     */
    @Transactional
    public void deleteByResponsibilityDetailCd(String responsibilityDetailCd) {
        log.debug("[ManagementObligationService] 책무세부의 모든 관리의무 삭제 - responsibilityDetailCd: {}", responsibilityDetailCd);

        managementObligationRepository.deleteByResponsibilityDetailCd(responsibilityDetailCd);
        log.info("[ManagementObligationService] 책무세부의 모든 관리의무 삭제 완료 - responsibilityDetailCd: {}", responsibilityDetailCd);
    }

    /**
     * Entity → DTO 변환 (조직명 및 공통코드명 포함)
     *
     * @param obligation 관리의무 엔티티
     * @param orgName 조직명
     * @return 관리의무 DTO
     */
    private ManagementObligationDto convertToDtoWithOrgName(ManagementObligation obligation, String orgName) {
        // 관리의무 대분류 코드명 조회
        String obligationMajorCatName = "";
        try {
            CommonCodeDetailDto majorCatCode = commonCodeService.getCodeDetail(
                "MGMT_OBLG_LCCD", obligation.getObligationMajorCatCd());
            obligationMajorCatName = majorCatCode.getDetailName();
        } catch (Exception e) {
            log.warn("관리의무 대분류 코드명 조회 실패 - code: {}", obligation.getObligationMajorCatCd());
        }

        // 관리의무 중분류 코드명 조회
        String obligationMiddleCatName = "";
        try {
            CommonCodeDetailDto middleCatCode = commonCodeService.getCodeDetail(
                "MGMT_OBLG_MCCD", obligation.getObligationMiddleCatCd());
            obligationMiddleCatName = middleCatCode.getDetailName();
        } catch (Exception e) {
            log.warn("관리의무 중분류 코드명 조회 실패 - code: {}", obligation.getObligationMiddleCatCd());
        }

        // 책무세부내용 조회
        String responsibilityDetailInfo = "";
        if (obligation.getResponsibilityDetail() != null) {
            responsibilityDetailInfo = obligation.getResponsibilityDetail().getResponsibilityDetailInfo();
        }

        return ManagementObligationDto.builder()
            .obligationCd(obligation.getObligationCd())
            .responsibilityDetailCd(obligation.getResponsibilityDetailCd())
            .responsibilityDetailInfo(responsibilityDetailInfo)  // 책무세부내용 추가
            .obligationMajorCatCd(obligation.getObligationMajorCatCd())
            .obligationMajorCatName(obligationMajorCatName)  // 대분류 코드명 추가
            .obligationMiddleCatCd(obligation.getObligationMiddleCatCd())
            .obligationMiddleCatName(obligationMiddleCatName)  // 중분류 코드명 추가
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
            .obligationCd(obligation.getObligationCd())
            .responsibilityDetailCd(obligation.getResponsibilityDetailCd())
            .obligationMajorCatCd(obligation.getObligationMajorCatCd())
            .obligationMiddleCatCd(obligation.getObligationMiddleCatCd())
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
