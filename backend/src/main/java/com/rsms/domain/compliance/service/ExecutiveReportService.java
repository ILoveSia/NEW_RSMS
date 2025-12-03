package com.rsms.domain.compliance.service;

import com.rsms.domain.compliance.dto.ExecutiveReportDto.*;
import com.rsms.domain.compliance.entity.ImplInspectionItem;
import com.rsms.domain.compliance.repository.ImplInspectionItemRepository;
import com.rsms.domain.responsibility.entity.DeptManagerManual;
import com.rsms.domain.responsibility.entity.ManagementObligation;
import com.rsms.domain.responsibility.entity.Responsibility;
import com.rsms.domain.responsibility.entity.ResponsibilityDetail;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 임원이행점검보고서 서비스
 * - 집계현황, 책무별/관리의무별/관리활동별 점검현황 조회
 *
 * @author Claude AI
 * @since 2025-12-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExecutiveReportService {

    private final ImplInspectionItemRepository itemRepository;

    /**
     * 임원이행점검보고서 데이터 조회
     *
     * @param ledgerOrderId       원장차수ID (필수)
     * @param implInspectionPlanId 이행점검계획ID (선택)
     * @param orgCode             부서코드 (선택)
     * @return 임원이행점검보고서 응답 DTO
     */
    public ExecutiveReportResponse getExecutiveReport(
            String ledgerOrderId,
            String implInspectionPlanId,
            String orgCode) {

        log.info("✅ [ExecutiveReportService] 임원이행점검보고서 조회");
        log.info("  - 원장차수ID: {}", ledgerOrderId);
        log.info("  - 이행점검계획ID: {}", implInspectionPlanId);
        log.info("  - 부서코드: {}", orgCode);

        // 1. 이행점검항목 조회
        List<ImplInspectionItem> items = findItems(ledgerOrderId, implInspectionPlanId, orgCode);
        log.info("  - 조회된 항목 수: {}", items.size());

        // 2. 집계 현황 생성
        SummaryStats summary = buildSummaryStats(items);

        // 3. 책무별 점검 현황 생성
        List<ResponsibilityInspection> responsibilityInspections = buildResponsibilityInspections(items);

        // 4. 관리의무별 점검 현황 생성
        List<ObligationInspection> obligationInspections = buildObligationInspections(items);

        // 5. 관리활동별 점검 현황 생성
        List<ActivityInspection> activityInspections = buildActivityInspections(items);

        return ExecutiveReportResponse.builder()
                .summary(summary)
                .responsibilityInspections(responsibilityInspections)
                .obligationInspections(obligationInspections)
                .activityInspections(activityInspections)
                .build();
    }

    /**
     * 이행점검항목 조회 (조건별)
     */
    private List<ImplInspectionItem> findItems(String ledgerOrderId, String implInspectionPlanId, String orgCode) {
        List<ImplInspectionItem> items;

        if (implInspectionPlanId != null && !implInspectionPlanId.isEmpty()) {
            // 이행점검계획ID로 조회
            items = itemRepository.findByImplInspectionPlanIdAndIsActive(implInspectionPlanId, "Y");
        } else {
            // 원장차수ID로 조회 (Plan을 통해)
            items = itemRepository.findByImplInspectionPlan_LedgerOrderIdAndIsActive(ledgerOrderId, "Y");
        }

        // 부서코드 필터링
        if (orgCode != null && !orgCode.isEmpty()) {
            items = items.stream()
                    .filter(item -> item.getDeptManagerManual() != null &&
                            orgCode.equals(item.getDeptManagerManual().getOrgCode()))
                    .collect(Collectors.toList());
        }

        return items;
    }

    /**
     * 집계 현황 생성
     */
    private SummaryStats buildSummaryStats(List<ImplInspectionItem> items) {
        // 책무 집계 (중복 제거)
        Set<String> responsibilities = new HashSet<>();
        Set<String> obligations = new HashSet<>();
        int appropriateCount = 0;
        int inappropriateCount = 0;
        int improvementCompleted = 0;
        int improvementInProgress = 0;

        for (ImplInspectionItem item : items) {
            DeptManagerManual manual = item.getDeptManagerManual();
            if (manual != null && manual.getManagementObligation() != null) {
                ManagementObligation obligation = manual.getManagementObligation();
                obligations.add(obligation.getObligationCd());

                if (obligation.getResponsibilityDetail() != null &&
                        obligation.getResponsibilityDetail().getResponsibility() != null) {
                    responsibilities.add(obligation.getResponsibilityDetail().getResponsibility().getResponsibilityCd());
                }
            }

            // 점검결과 집계
            String statusCd = item.getInspectionStatusCd();
            if ("02".equals(statusCd)) {
                appropriateCount++;
            } else if ("03".equals(statusCd)) {
                inappropriateCount++;

                // 부적정인 경우 개선이행상태 집계
                String improvementStatusCd = item.getImprovementStatusCd();
                if ("06".equals(improvementStatusCd)) {
                    improvementCompleted++;
                } else if (improvementStatusCd != null && !"01".equals(improvementStatusCd)) {
                    improvementInProgress++;
                }
            }
        }

        return SummaryStats.builder()
                .totalResponsibilities(responsibilities.size())
                .totalObligations(obligations.size())
                .totalActivities(items.size())
                .appropriateCount(appropriateCount)
                .inappropriateCount(inappropriateCount)
                .improvementCompletedCount(improvementCompleted)
                .improvementInProgressCount(improvementInProgress)
                .build();
    }

    /**
     * 책무별 점검 현황 생성
     */
    private List<ResponsibilityInspection> buildResponsibilityInspections(List<ImplInspectionItem> items) {
        // 책무별 그룹핑
        Map<String, List<ImplInspectionItem>> groupByResponsibility = new LinkedHashMap<>();

        for (ImplInspectionItem item : items) {
            String respCd = getResponsibilityCd(item);
            if (respCd != null) {
                groupByResponsibility.computeIfAbsent(respCd, k -> new ArrayList<>()).add(item);
            }
        }

        List<ResponsibilityInspection> result = new ArrayList<>();
        for (Map.Entry<String, List<ImplInspectionItem>> entry : groupByResponsibility.entrySet()) {
            String respCd = entry.getKey();
            List<ImplInspectionItem> groupItems = entry.getValue();

            // 책무명 가져오기
            String respInfo = getResponsibilityInfo(groupItems.get(0));

            // 관리의무 중복 제거
            Set<String> obligations = new HashSet<>();
            int appropriate = 0;
            int inappropriate = 0;

            for (ImplInspectionItem item : groupItems) {
                String oblCd = getObligationCd(item);
                if (oblCd != null) {
                    obligations.add(oblCd);
                }

                if ("02".equals(item.getInspectionStatusCd())) {
                    appropriate++;
                } else if ("03".equals(item.getInspectionStatusCd())) {
                    inappropriate++;
                }
            }

            // 점검결과 판정: 부적정이 하나라도 있으면 "부적정", 전부 적정이면 "적정", 그 외 "점검"
            String inspectionResult;
            if (inappropriate > 0) {
                inspectionResult = "부적정";
            } else if (appropriate == groupItems.size() && appropriate > 0) {
                inspectionResult = "적정";
            } else {
                inspectionResult = "점검";
            }

            result.add(ResponsibilityInspection.builder()
                    .responsibilityCd(respCd)
                    .responsibilityInfo(respInfo)
                    .inspectionResult(inspectionResult)
                    .totalObligations(obligations.size())
                    .totalActivities(groupItems.size())
                    .appropriateCount(appropriate)
                    .inappropriateCount(inappropriate)
                    .build());
        }

        return result;
    }

    /**
     * 관리의무별 점검 현황 생성
     */
    private List<ObligationInspection> buildObligationInspections(List<ImplInspectionItem> items) {
        // 관리의무별 그룹핑
        Map<String, List<ImplInspectionItem>> groupByObligation = new LinkedHashMap<>();

        for (ImplInspectionItem item : items) {
            String oblCd = getObligationCd(item);
            if (oblCd != null) {
                groupByObligation.computeIfAbsent(oblCd, k -> new ArrayList<>()).add(item);
            }
        }

        List<ObligationInspection> result = new ArrayList<>();
        for (Map.Entry<String, List<ImplInspectionItem>> entry : groupByObligation.entrySet()) {
            String oblCd = entry.getKey();
            List<ImplInspectionItem> groupItems = entry.getValue();

            // 관리의무 정보 가져오기
            String oblInfo = getObligationInfo(groupItems.get(0));
            String respCd = getResponsibilityCd(groupItems.get(0));
            String respInfo = getResponsibilityInfo(groupItems.get(0));

            int appropriate = 0;
            int inappropriate = 0;

            for (ImplInspectionItem item : groupItems) {
                if ("02".equals(item.getInspectionStatusCd())) {
                    appropriate++;
                } else if ("03".equals(item.getInspectionStatusCd())) {
                    inappropriate++;
                }
            }

            // 점검결과 판정
            String inspectionResult;
            if (inappropriate > 0) {
                inspectionResult = "부적정";
            } else if (appropriate == groupItems.size() && appropriate > 0) {
                inspectionResult = "적정";
            } else {
                inspectionResult = "점검";
            }

            result.add(ObligationInspection.builder()
                    .obligationCd(oblCd)
                    .obligationInfo(oblInfo)
                    .responsibilityCd(respCd)
                    .responsibilityInfo(respInfo)
                    .inspectionResult(inspectionResult)
                    .totalActivities(groupItems.size())
                    .appropriateCount(appropriate)
                    .inappropriateCount(inappropriate)
                    .build());
        }

        return result;
    }

    /**
     * 관리활동별 점검 현황 생성
     */
    private List<ActivityInspection> buildActivityInspections(List<ImplInspectionItem> items) {
        return items.stream()
                .map(item -> {
                    DeptManagerManual manual = item.getDeptManagerManual();
                    String activityName = manual != null ? manual.getActivityName() : "";
                    String respItem = manual != null ? manual.getRespItem() : "";
                    String oblCd = getObligationCd(item);
                    String oblInfo = getObligationInfo(item);
                    String respCd = getResponsibilityCd(item);
                    String respInfo = getResponsibilityInfo(item);
                    String orgCode = manual != null ? manual.getOrgCode() : "";
                    String orgName = (manual != null && manual.getOrganization() != null)
                            ? manual.getOrganization().getOrgName() : orgCode;

                    // 점검결과상태명
                    String inspectionStatusName = getInspectionStatusName(item.getInspectionStatusCd());

                    // 개선이행상태명
                    String improvementStatusName = getImprovementStatusName(item.getImprovementStatusCd());

                    return ActivityInspection.builder()
                            .implInspectionItemId(item.getImplInspectionItemId())
                            .manualCd(item.getManualCd())
                            .activityName(activityName)
                            .respItem(respItem)
                            .obligationCd(oblCd)
                            .obligationInfo(oblInfo)
                            .responsibilityCd(respCd)
                            .responsibilityInfo(respInfo)
                            .inspectionStatusCd(item.getInspectionStatusCd())
                            .inspectionStatusName(inspectionStatusName)
                            .improvementStatusCd(item.getImprovementStatusCd())
                            .improvementStatusName(improvementStatusName)
                            .orgCode(orgCode)
                            .orgName(orgName)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ========================================
    // 헬퍼 메서드들
    // ========================================

    private String getResponsibilityCd(ImplInspectionItem item) {
        try {
            return item.getDeptManagerManual()
                    .getManagementObligation()
                    .getResponsibilityDetail()
                    .getResponsibility()
                    .getResponsibilityCd();
        } catch (NullPointerException e) {
            return null;
        }
    }

    private String getResponsibilityInfo(ImplInspectionItem item) {
        try {
            return item.getDeptManagerManual()
                    .getManagementObligation()
                    .getResponsibilityDetail()
                    .getResponsibility()
                    .getResponsibilityInfo();
        } catch (NullPointerException e) {
            return "";
        }
    }

    private String getObligationCd(ImplInspectionItem item) {
        try {
            return item.getDeptManagerManual()
                    .getManagementObligation()
                    .getObligationCd();
        } catch (NullPointerException e) {
            return null;
        }
    }

    private String getObligationInfo(ImplInspectionItem item) {
        try {
            return item.getDeptManagerManual()
                    .getManagementObligation()
                    .getObligationInfo();
        } catch (NullPointerException e) {
            return "";
        }
    }

    private String getInspectionStatusName(String statusCd) {
        if (statusCd == null) return "";
        switch (statusCd) {
            case "01": return "미점검";
            case "02": return "적정";
            case "03": return "부적정";
            default: return "";
        }
    }

    private String getImprovementStatusName(String statusCd) {
        if (statusCd == null) return "";
        switch (statusCd) {
            case "01": return "개선미이행";
            case "02": return "개선계획";
            case "03": return "승인요청";
            case "04": return "개선이행";
            case "05": return "완료승인요청";
            case "06": return "개선완료";
            default: return "";
        }
    }
}
