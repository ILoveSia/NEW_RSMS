package com.rsms.domain.responsibility.service;

import com.rsms.domain.committee.repository.CommitteeDetailRepository;
import com.rsms.domain.organization.repository.OrganizationRepository;
import com.rsms.domain.position.entity.Position;
import com.rsms.domain.position.repository.PositionConcurrentRepository;
import com.rsms.domain.position.repository.PositionDetailRepository;
import com.rsms.domain.position.repository.PositionRepository;
import com.rsms.domain.responsibility.dto.PositionResponsibilityDataDto;
import com.rsms.domain.responsibility.entity.RespStatementExec;
import com.rsms.domain.responsibility.repository.ManagementObligationRepository;
import com.rsms.domain.responsibility.repository.RespStatementExecRepository;
import com.rsms.domain.responsibility.repository.ResponsibilityDetailRepository;
import com.rsms.domain.responsibility.repository.ResponsibilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 직책 선택 시 책무기술서 관련 데이터 조회 서비스
 * - 7개 필드를 한번에 조회하는 단일 API 서비스
 *
 * @author RSMS
 * @since 2025-10-29
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PositionResponsibilityDataService {

    private final PositionRepository positionRepository;
    private final PositionConcurrentRepository positionConcurrentRepository;
    private final PositionDetailRepository positionDetailRepository;
    private final RespStatementExecRepository respStatementExecRepository;
    private final CommitteeDetailRepository committeeDetailRepository;
    private final ResponsibilityRepository responsibilityRepository;
    private final ResponsibilityDetailRepository responsibilityDetailRepository;
    private final ManagementObligationRepository managementObligationRepository;

    /**
     * 직책ID로 책무기술서 관련 전체 데이터 조회
     * - 7개 필드를 한번에 조회하여 반환
     *
     * @param positionId 직책ID
     * @return 책무기술서 관련 전체 데이터
     */
    public PositionResponsibilityDataDto getPositionResponsibilityData(Long positionId) {
        log.info("직책ID {}의 책무기술서 데이터 조회 시작", positionId);

        // 직책 정보 조회
        Position position = positionRepository.findById(positionId)
                .orElseThrow(() -> new IllegalArgumentException("직책을 찾을 수 없습니다. ID: " + positionId));

        // 1. 겸직여부 조회 (positions ⟷ position_concurrents 조인)
        String isConcurrent = getIsConcurrent(position.getLedgerOrderId(), position.getPositionsCd());

        // 2, 3번: resp_statement_execs 조회
        RespStatementExec respStmtExec = respStatementExecRepository
                .findByPosition_PositionsId(positionId)
                .orElse(null);

        // 4. 소관부점 조회 (positions_details ⟷ organizations, 전부 한줄로)
        String departments = getDepartments(positionId);

        // 5. 주관회의체 조회 (committee_details ⟷ committees)
        List<PositionResponsibilityDataDto.CommitteeInfo> committees = getCommittees(positionId);

        // 6. 책무목록 조회 (responsibilities)
        List<PositionResponsibilityDataDto.ResponsibilityInfo> responsibilities = getResponsibilities(positionId);

        // 7. 관리의무 조회 (responsibilities → responsibility_details → management_obligations, 전부 표시)
        List<PositionResponsibilityDataDto.ManagementObligationInfo> managementObligations =
                getManagementObligations(positionId);

        log.info("직책ID {}의 책무기술서 데이터 조회 완료", positionId);

        return PositionResponsibilityDataDto.builder()
                .isConcurrent(isConcurrent)
                .positionAssignedDate(respStmtExec != null ? respStmtExec.getPositionAssignedDate() : null)
                .concurrentPosition(respStmtExec != null ? respStmtExec.getConcurrentPosition() : null)
                .departments(departments)
                .committees(committees)
                .responsibilities(responsibilities)
                .managementObligations(managementObligations)
                .build();
    }

    /**
     * 1. 겸직여부 조회
     * - position_concurrents 테이블에 데이터가 있으면 'Y', 없으면 'N'
     */
    private String getIsConcurrent(String ledgerOrderId, String positionsCd) {
        boolean exists = positionConcurrentRepository
                .existsByLedgerOrderIdAndPositionsCd(ledgerOrderId, positionsCd);
        return exists ? "Y" : "N";
    }

    /**
     * 4. 소관부점 조회 (전부 한줄로, 콤마 구분)
     * - positions_details ⟷ organizations 조인
     */
    private String getDepartments(Long positionId) {
        // positions_details에서 org_code 목록 조회
        List<String> orgCodes = positionDetailRepository.findOrgCodesByPositionId(positionId);

        if (orgCodes.isEmpty()) {
            return "";
        }

        // org_code들을 콤마로 구분하여 한줄로 반환
        return String.join(", ", orgCodes);
    }

    /**
     * 5. 주관회의체 조회
     * - committee_details ⟷ committees
     */
    private List<PositionResponsibilityDataDto.CommitteeInfo> getCommittees(Long positionId) {
        return committeeDetailRepository.findCommitteesByPositionId(positionId).stream()
                .map(detail -> PositionResponsibilityDataDto.CommitteeInfo.builder()
                        .committeesId(detail.getCommittee().getCommitteesId())
                        .committeesTitle(detail.getCommittee().getCommitteesTitle())
                        .committeeFrequency(detail.getCommittee().getCommitteeFrequency())
                        .resolutionMatters(detail.getCommittee().getResolutionMatters())
                        .committeesType(detail.getCommitteesType())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 6. 책무목록 조회
     * - responsibilities + responsibility_details (책무세부내용)
     */
    private List<PositionResponsibilityDataDto.ResponsibilityInfo> getResponsibilities(Long positionId) {
        return responsibilityRepository.findByPositions_PositionsId(positionId).stream()
                .map(resp -> {
                    // responsibility_details에서 첫 번째 세부내용 조회
                    // (책무당 여러 세부내용이 있을 수 있지만, UI에는 첫 번째만 표시)
                    String responsibilityDetailInfo = responsibilityDetailRepository
                            .findByResponsibilityId(resp.getResponsibilityId())
                            .stream()
                            .findFirst()
                            .map(detail -> detail.getResponsibilityDetailInfo())
                            .orElse(null);

                    return PositionResponsibilityDataDto.ResponsibilityInfo.builder()
                            .responsibilityId(resp.getResponsibilityId())
                            .responsibilityCat(resp.getResponsibilityCat())
                            .responsibilityCd(resp.getResponsibilityCd())
                            .responsibilityInfo(resp.getResponsibilityInfo())
                            .responsibilityDetailInfo(responsibilityDetailInfo)
                            .responsibilityLegal(resp.getResponsibilityLegal())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 7. 관리의무 조회 (책무의 관리의무 전부 표시)
     * - responsibilities → responsibility_details → management_obligations
     */
    private List<PositionResponsibilityDataDto.ManagementObligationInfo> getManagementObligations(Long positionId) {
        // 1단계: 직책의 모든 책무ID 조회
        List<Long> responsibilityIds = responsibilityRepository
                .findByPositions_PositionsId(positionId).stream()
                .map(resp -> resp.getResponsibilityId())
                .collect(Collectors.toList());

        if (responsibilityIds.isEmpty()) {
            return List.of();
        }

        // 2단계: 책무ID들로 관리의무 전체 조회
        return managementObligationRepository.findByResponsibilityIds(responsibilityIds).stream()
                .map(obligation -> PositionResponsibilityDataDto.ManagementObligationInfo.builder()
                        .managementObligationId(obligation.getManagementObligationId())
                        .responsibilityId(obligation.getResponsibilityDetail().getResponsibility().getResponsibilityId())
                        .obligationMajorCatCd(obligation.getObligationMajorCatCd())
                        .obligationMiddleCatCd(obligation.getObligationMiddleCatCd())
                        .obligationCd(obligation.getObligationCd())
                        .obligationInfo(obligation.getObligationInfo())
                        .orgCode(obligation.getOrgCode())
                        .build())
                .collect(Collectors.toList());
    }
}
