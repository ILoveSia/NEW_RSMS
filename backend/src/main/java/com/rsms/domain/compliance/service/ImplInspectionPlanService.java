package com.rsms.domain.compliance.service;

import com.rsms.domain.compliance.dto.CreateImplInspectionPlanRequest;
import com.rsms.domain.compliance.dto.ImplInspectionItemDto;
import com.rsms.domain.compliance.dto.ImplInspectionPlanDto;
import com.rsms.domain.compliance.entity.ImplInspectionItem;
import com.rsms.domain.compliance.entity.ImplInspectionPlan;
import com.rsms.domain.compliance.repository.ImplInspectionItemRepository;
import com.rsms.domain.compliance.repository.ImplInspectionPlanRepository;
import com.rsms.domain.employee.entity.Employee;
import com.rsms.domain.employee.repository.EmployeeRepository;
import com.rsms.domain.responsibility.entity.DeptManagerManual;
import com.rsms.domain.responsibility.repository.DeptManagerManualRepository;
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
 * 이행점검계획 서비스
 * - 이행점검계획 CRUD 및 비즈니스 로직
 *
 * @author Claude AI
 * @since 2025-11-27
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImplInspectionPlanService {

    private final ImplInspectionPlanRepository planRepository;
    private final ImplInspectionItemRepository itemRepository;
    private final DeptManagerManualRepository manualRepository;
    private final EmployeeRepository employeeRepository;
    private final CommonCodeDetailRepository codeDetailRepository;

    /**
     * 이행점검계획 전체 목록 조회
     */
    public List<ImplInspectionPlanDto> findAll() {
        log.info("✅ [ImplInspectionPlanService] 전체 이행점검계획 조회");
        return planRepository.findByIsActiveOrderByCreatedAtDesc("Y")
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 원장차수ID로 이행점검계획 목록 조회
     */
    public List<ImplInspectionPlanDto> findByLedgerOrderId(String ledgerOrderId) {
        log.info("✅ [ImplInspectionPlanService] 원장차수ID별 이행점검계획 조회: {}", ledgerOrderId);
        return planRepository.findByLedgerOrderIdAndIsActiveOrderByCreatedAtDesc(ledgerOrderId, "Y")
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 이행점검계획 단건 조회
     */
    public ImplInspectionPlanDto findById(String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검계획 단건 조회: {}", implInspectionPlanId);
        return planRepository.findById(implInspectionPlanId)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("이행점검계획을 찾을 수 없습니다: " + implInspectionPlanId));
    }

    /**
     * 이행점검계획 생성 (점검항목 일괄 생성 포함)
     * 1. impl_inspection_plans 테이블에 계획 저장
     * 2. impl_inspection_items 테이블에 선택된 manualCd별로 항목 저장
     */
    @Transactional
    public ImplInspectionPlanDto create(CreateImplInspectionPlanRequest request, String userId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검계획 생성 시작");
        log.info("  - 원장차수ID: {}", request.getLedgerOrderId());
        log.info("  - 점검명: {}", request.getImplInspectionName());
        log.info("  - 선택된 manualCd 수: {}", request.getManualCds().size());

        // 1. 이행점검계획ID 생성
        String planId = planRepository.generateImplInspectionPlanId(request.getLedgerOrderId());
        log.info("  - 생성된 이행점검계획ID: {}", planId);

        // 2. 이행점검계획 엔티티 생성
        ImplInspectionPlan plan = ImplInspectionPlan.builder()
                .implInspectionPlanId(planId)
                .ledgerOrderId(request.getLedgerOrderId())
                .implInspectionName(request.getImplInspectionName())
                .inspectionTypeCd(request.getInspectionTypeCd())
                .implInspectionStartDate(request.getImplInspectionStartDate())
                .implInspectionEndDate(request.getImplInspectionEndDate())
                .implInspectionStatusCd("01") // 계획
                .remarks(request.getRemarks())
                .isActive("Y")
                .createdBy(userId)
                .updatedBy(userId)
                .build();

        // 3. 이행점검계획 저장
        ImplInspectionPlan savedPlan = planRepository.save(plan);
        log.info("✅ [ImplInspectionPlanService] 이행점검계획 저장 완료: {}", savedPlan.getImplInspectionPlanId());

        // 4. 선택된 manualCd로 이행점검항목 일괄 생성
        for (String manualCd : request.getManualCds()) {
            // 부서장업무메뉴얼 조회
            DeptManagerManual manual = manualRepository.findById(manualCd)
                    .orElseThrow(() -> new IllegalArgumentException("부서장업무메뉴얼을 찾을 수 없습니다: " + manualCd));

            // 이행점검항목ID 생성
            String itemId = itemRepository.generateImplInspectionItemId(planId);

            // 이행점검항목 엔티티 생성
            // - improvementManagerId: 부서장업무메뉴얼의 수행자ID(executor_id)를 개선담당자로 지정
            ImplInspectionItem item = ImplInspectionItem.builder()
                    .implInspectionItemId(itemId)
                    .implInspectionPlan(savedPlan)
                    .deptManagerManual(manual)
                    .inspectionStatusCd("01") // 미점검
                    .improvementStatusCd("01") // 개선미이행
                    .improvementManagerId(manual.getExecutorId()) // 수행자ID를 개선담당자로 설정
                    .isActive("Y")
                    .createdBy(userId)
                    .updatedBy(userId)
                    .build();

            itemRepository.save(item);
            log.info("  - 이행점검항목 생성: {} (manualCd: {})", itemId, manualCd);
        }

        log.info("✅ [ImplInspectionPlanService] 이행점검계획 및 항목 생성 완료");
        log.info("  - 생성된 항목 수: {}", request.getManualCds().size());

        return toDto(savedPlan);
    }

    /**
     * 이행점검계획 수정
     */
    @Transactional
    public ImplInspectionPlanDto update(String implInspectionPlanId, CreateImplInspectionPlanRequest request, String userId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검계획 수정: {}", implInspectionPlanId);

        ImplInspectionPlan plan = planRepository.findById(implInspectionPlanId)
                .orElseThrow(() -> new IllegalArgumentException("이행점검계획을 찾을 수 없습니다: " + implInspectionPlanId));

        // 기본 정보 수정
        plan.setImplInspectionName(request.getImplInspectionName());
        plan.setInspectionTypeCd(request.getInspectionTypeCd());
        plan.setImplInspectionStartDate(request.getImplInspectionStartDate());
        plan.setImplInspectionEndDate(request.getImplInspectionEndDate());
        plan.setRemarks(request.getRemarks());
        plan.setUpdatedBy(userId);

        ImplInspectionPlan savedPlan = planRepository.save(plan);

        return toDto(savedPlan);
    }

    /**
     * 이행점검계획 삭제 (비활성화)
     */
    @Transactional
    public void delete(String implInspectionPlanId, String userId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검계획 삭제: {}", implInspectionPlanId);

        ImplInspectionPlan plan = planRepository.findById(implInspectionPlanId)
                .orElseThrow(() -> new IllegalArgumentException("이행점검계획을 찾을 수 없습니다: " + implInspectionPlanId));

        plan.deactivate();
        plan.setUpdatedBy(userId);
        planRepository.save(plan);

        // 관련 점검항목도 비활성화
        itemRepository.deactivateByImplInspectionPlanId(implInspectionPlanId);
    }

    /**
     * 이행점검계획 일괄 삭제
     */
    @Transactional
    public void deleteAll(List<String> implInspectionPlanIds, String userId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검계획 일괄 삭제: {}건", implInspectionPlanIds.size());

        for (String planId : implInspectionPlanIds) {
            delete(planId, userId);
        }
    }

    /**
     * 이행점검계획의 점검항목 목록 조회
     * - JOIN FETCH로 부서장업무메뉴얼 정보 함께 조회
     */
    public List<ImplInspectionItemDto> findItemsByPlanId(String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검항목 조회: {}", implInspectionPlanId);
        return itemRepository.findByImplInspectionPlanIdWithManual(implInspectionPlanId, "Y")
                .stream()
                .map(ImplInspectionItemDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 전체 이행점검항목 조회 (점검자지정 페이지용)
     * - impl_inspection_items 테이블 기준
     * - dept_manager_manuals, impl_inspection_plans JOIN
     * - 점검자명 (inspectorName) Transient 필드 포함
     */
    public List<ImplInspectionItemDto> findAllItems() {
        log.info("✅ [ImplInspectionPlanService] 전체 이행점검항목 조회 (점검자지정용)");
        List<ImplInspectionItem> items = itemRepository.findAllWithManualAndPlan("Y");

        // 점검자명 등 Transient 필드 설정
        populateTransientFields(items);

        return items.stream()
                .map(ImplInspectionItemDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 원장차수ID로 이행점검항목 조회 (점검자지정 페이지용)
     * - impl_inspection_items 테이블 기준
     * - dept_manager_manuals, impl_inspection_plans JOIN
     * - 점검자명 (inspectorName) Transient 필드 포함
     */
    public List<ImplInspectionItemDto> findItemsByLedgerOrderId(String ledgerOrderId) {
        log.info("✅ [ImplInspectionPlanService] 원장차수ID별 이행점검항목 조회 (점검자지정용): {}", ledgerOrderId);
        List<ImplInspectionItem> items = itemRepository.findByLedgerOrderIdWithManualAndPlan(ledgerOrderId, "Y");

        // 점검자명 등 Transient 필드 설정
        populateTransientFields(items);

        return items.stream()
                .map(ImplInspectionItemDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 전체 이행점검항목 조회 (이행점검수행 페이지용)
     * - 책무/책무상세/관리의무 정보 포함
     * - dept_manager_manuals → management_obligations → responsibility_details → responsibilities JOIN
     * - 수행자명/점검자명/상태명 등 Transient 필드 조회
     */
    public List<ImplInspectionItemDto> findAllItemsWithFullHierarchy() {
        log.info("✅ [ImplInspectionPlanService] 전체 이행점검항목 조회 (이행점검수행용 - Full Hierarchy)");
        List<ImplInspectionItem> items = itemRepository.findAllWithFullHierarchy("Y");

        // Transient 필드 설정 (수행자명, 점검자명, 상태명 등)
        populateTransientFields(items);

        return items.stream()
                .map(ImplInspectionItemDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 원장차수ID로 이행점검항목 조회 (이행점검수행 페이지용)
     * - 책무/책무상세/관리의무 정보 포함
     * - dept_manager_manuals → management_obligations → responsibility_details → responsibilities JOIN
     * - 수행자명/점검자명/상태명 등 Transient 필드 조회
     */
    public List<ImplInspectionItemDto> findItemsByLedgerOrderIdWithFullHierarchy(String ledgerOrderId) {
        log.info("✅ [ImplInspectionPlanService] 원장차수ID별 이행점검항목 조회 (이행점검수행용 - Full Hierarchy): {}", ledgerOrderId);
        List<ImplInspectionItem> items = itemRepository.findByLedgerOrderIdWithFullHierarchy(ledgerOrderId, "Y");

        // Transient 필드 설정 (수행자명, 점검자명, 상태명 등)
        populateTransientFields(items);

        return items.stream()
                .map(ImplInspectionItemDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 이행점검계획ID로 이행점검항목 조회 (이행점검수행 페이지용)
     * - 책무/책무상세/관리의무 정보 포함
     * - dept_manager_manuals → management_obligations → responsibility_details → responsibilities JOIN
     * - 수행자명/점검자명/상태명 등 Transient 필드 조회
     */
    public List<ImplInspectionItemDto> findItemsByPlanIdWithFullHierarchy(String implInspectionPlanId) {
        log.info("✅ [ImplInspectionPlanService] 이행점검계획ID별 이행점검항목 조회 (이행점검수행용 - Full Hierarchy): {}", implInspectionPlanId);
        List<ImplInspectionItem> items = itemRepository.findByImplInspectionPlanIdWithFullHierarchy(implInspectionPlanId, "Y");

        // Transient 필드 설정 (수행자명, 점검자명, 상태명 등)
        populateTransientFields(items);

        return items.stream()
                .map(ImplInspectionItemDto::from)
                .collect(Collectors.toList());
    }

    /**
     * Transient 필드 설정
     * - 수행자명 (executorName), 점검자명 (inspectorName)
     * - 수행상태명 (executionStatusName), 수행결과명 (executionResultName)
     * @param items 이행점검항목 목록
     */
    private void populateTransientFields(List<ImplInspectionItem> items) {
        if (items == null || items.isEmpty()) {
            return;
        }

        // 1. 수행자ID, 점검자ID 수집
        List<String> employeeIds = items.stream()
                .flatMap(item -> {
                    java.util.stream.Stream.Builder<String> builder = java.util.stream.Stream.builder();
                    // 점검자ID
                    if (item.getInspectorId() != null && !item.getInspectorId().isEmpty()) {
                        builder.add(item.getInspectorId());
                    }
                    // 수행자ID (부서장업무메뉴얼)
                    if (item.getDeptManagerManual() != null &&
                        item.getDeptManagerManual().getExecutorId() != null &&
                        !item.getDeptManagerManual().getExecutorId().isEmpty()) {
                        builder.add(item.getDeptManagerManual().getExecutorId());
                    }
                    return builder.build();
                })
                .distinct()
                .collect(Collectors.toList());

        // 2. 직원 정보 조회 (삭제되지 않은 직원만, 한번에 조회하여 성능 최적화)
        log.info("  - 조회할 직원ID 목록: {}", employeeIds);
        Map<String, String> employeeNameMap = employeeIds.isEmpty() ?
                Map.of() :
                employeeRepository.findByEmpNoInAndNotDeleted(employeeIds).stream()
                        .collect(Collectors.toMap(Employee::getEmpNo, Employee::getEmpName));
        log.info("  - 조회된 직원명 맵: {}", employeeNameMap);

        // 3. 공통코드 조회 (수행상태, 수행결과)
        Map<String, String> executionStatusMap = getCodeNameMap("EXEC_STTS_CD");  // 수행상태
        Map<String, String> executionResultMap = getCodeNameMap("EXEC_RSLT_CD");  // 수행결과

        // 4. 각 항목에 Transient 필드 설정
        for (ImplInspectionItem item : items) {
            // 점검자명 설정
            if (item.getInspectorId() != null && !item.getInspectorId().isEmpty()) {
                String inspectorName = employeeNameMap.get(item.getInspectorId());
                log.info("  - 점검자ID: {}, 조회된 점검자명: {}", item.getInspectorId(), inspectorName);
                item.setInspectorName(inspectorName != null ? inspectorName : item.getInspectorId());
            }

            // 부서장업무메뉴얼 Transient 필드 설정
            DeptManagerManual manual = item.getDeptManagerManual();
            if (manual != null) {
                // 수행자명 설정
                if (manual.getExecutorId() != null && !manual.getExecutorId().isEmpty()) {
                    String executorName = employeeNameMap.get(manual.getExecutorId());
                    manual.setExecutorName(executorName != null ? executorName : manual.getExecutorId());
                }

                // 수행상태명 설정
                if (manual.getExecutionStatus() != null && !manual.getExecutionStatus().isEmpty()) {
                    String statusName = executionStatusMap.get(manual.getExecutionStatus());
                    manual.setExecutionStatusName(statusName != null ? statusName : manual.getExecutionStatus());
                }

                // 수행결과명 설정
                if (manual.getExecutionResultCd() != null && !manual.getExecutionResultCd().isEmpty()) {
                    String resultName = executionResultMap.get(manual.getExecutionResultCd());
                    manual.setExecutionResultName(resultName != null ? resultName : manual.getExecutionResultCd());
                }
            }
        }

        log.debug("  - Transient 필드 설정 완료: {}건", items.size());
    }

    /**
     * 공통코드 그룹에서 코드명 맵 조회
     * @param groupCode 공통코드 그룹코드
     * @return 코드 -> 코드명 맵
     */
    private Map<String, String> getCodeNameMap(String groupCode) {
        try {
            return codeDetailRepository.findByGroupCodeAndIsActiveOrderBySortOrderAsc(groupCode, "Y")
                    .stream()
                    .collect(Collectors.toMap(
                            CommonCodeDetail::getDetailCode,
                            CommonCodeDetail::getDetailName,
                            (existing, replacement) -> existing  // 중복 시 기존 값 유지
                    ));
        } catch (Exception e) {
            log.warn("공통코드 조회 실패 - groupCode: {}, error: {}", groupCode, e.getMessage());
            return Map.of();
        }
    }

    /**
     * 점검결과 업데이트
     * - 점검결과상태코드, 점검결과내용, 점검일자 업데이트
     * - 부적정(03) 선택 시: improvement_status_cd = '01' (개선미이행), improvement_manager_id = executorId
     * @param itemId 점검항목ID
     * @param inspectionStatusCd 점검결과상태코드 (01:미점검, 02:적정, 03:부적정)
     * @param inspectionResultContent 점검결과내용
     * @param executorId 수행자ID (부적정 시 개선담당자로 설정)
     * @param userId 수정자ID
     * @return 업데이트된 항목 DTO
     */
    @Transactional
    public ImplInspectionItemDto updateInspectionResult(String itemId, String inspectionStatusCd,
                                                         String inspectionResultContent, String executorId, String userId) {
        log.info("✅ [ImplInspectionPlanService] 점검결과 업데이트 시작");
        log.info("  - 점검항목ID: {}", itemId);
        log.info("  - 점검결과상태코드: {}", inspectionStatusCd);
        log.info("  - 수행자ID (개선담당자용): {}", executorId);

        ImplInspectionItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("점검항목을 찾을 수 없습니다: " + itemId));

        // 점검결과 업데이트
        item.setInspectionStatusCd(inspectionStatusCd);
        item.setInspectionResultContent(inspectionResultContent);
        item.setInspectionDate(java.time.LocalDate.now());
        item.setUpdatedBy(userId);

        // 부적정(03) 선택 시 개선이행 관련 필드 설정
        if ("03".equals(inspectionStatusCd)) {
            log.info("  - 부적정 선택: 개선이행상태코드=01(개선미이행), 개선담당자ID={}", executorId);
            item.setImprovementStatusCd("01");  // 개선미이행
            if (executorId != null && !executorId.isEmpty()) {
                item.setImprovementManagerId(executorId);  // 수행자를 개선담당자로 설정
            }
        }

        ImplInspectionItem savedItem = itemRepository.save(item);
        log.info("✅ [ImplInspectionPlanService] 점검결과 업데이트 완료: {}", itemId);

        return ImplInspectionItemDto.from(savedItem);
    }

    /**
     * 점검자 일괄 지정
     * - impl_inspection_items 테이블의 inspector_id 업데이트
     * @param itemIds 점검항목ID 목록
     * @param inspectorId 점검자ID (employees.emp_no)
     * @param userId 수정자ID
     * @return 업데이트된 항목 수
     */
    @Transactional
    public int assignInspectorBatch(List<String> itemIds, String inspectorId, String userId) {
        log.info("✅ [ImplInspectionPlanService] 점검자 일괄 지정 시작");
        log.info("  - 대상 항목 수: {}", itemIds.size());
        log.info("  - 점검자ID: {}", inspectorId);

        int updatedCount = 0;

        for (String itemId : itemIds) {
            ImplInspectionItem item = itemRepository.findById(itemId)
                    .orElse(null);

            if (item != null) {
                item.setInspectorId(inspectorId);
                item.setUpdatedBy(userId);
                itemRepository.save(item);
                updatedCount++;
                log.info("  - 점검자 지정 완료: {} -> {}", itemId, inspectorId);
            } else {
                log.warn("  - 점검항목을 찾을 수 없습니다: {}", itemId);
            }
        }

        log.info("✅ [ImplInspectionPlanService] 점검자 일괄 지정 완료: {}건", updatedCount);
        return updatedCount;
    }

    /**
     * Entity → DTO 변환 (통계 정보 포함)
     */
    private ImplInspectionPlanDto toDto(ImplInspectionPlan entity) {
        ImplInspectionPlanDto dto = ImplInspectionPlanDto.from(entity);

        // 통계 정보 추가
        String planId = entity.getImplInspectionPlanId();
        dto.setTotalItemCount(itemRepository.countByImplInspectionPlanIdAndIsActive(planId, "Y"));
        dto.setCompletedItemCount(itemRepository.countByImplInspectionPlanIdAndInspectionStatusCdAndIsActive(planId, "02", "Y"));
        dto.setInProgressItemCount(itemRepository.countByImplInspectionPlanIdAndInspectionStatusCdAndIsActive(planId, "03", "Y"));

        return dto;
    }
}
