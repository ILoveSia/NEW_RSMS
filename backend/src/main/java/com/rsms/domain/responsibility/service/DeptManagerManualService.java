package com.rsms.domain.responsibility.service;

import com.rsms.domain.responsibility.dto.CreateDeptManagerManualRequest;
import com.rsms.domain.responsibility.dto.DeptManagerManualDto;
import com.rsms.domain.responsibility.dto.UpdateDeptManagerManualRequest;
import com.rsms.domain.responsibility.entity.DeptManagerManual;
import com.rsms.domain.responsibility.entity.ManagementObligation;
import com.rsms.domain.responsibility.repository.DeptManagerManualRepository;
import com.rsms.domain.responsibility.repository.ManagementObligationRepository;
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
 * 부서장업무메뉴얼 서비스
 * - 부서장업무메뉴얼 CRUD 비즈니스 로직 처리
 * - 원장차수별, 조직별 관리활동 정보 관리
 *
 * @author Claude AI
 * @since 2025-01-18
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeptManagerManualService {

    private final DeptManagerManualRepository deptManagerManualRepository;
    private final ManagementObligationRepository managementObligationRepository;
    private final OrganizationRepository organizationRepository;
    private final CommonCodeService commonCodeService;

    // ===============================
    // 코드 자동 생성 로직
    // ===============================

    /**
     * 부서장업무메뉴얼 코드 자동 생성
     * - 코드 생성 규칙: 관리의무코드 + "A" + 순번(4자리)
     * - 예시: "20250001M0002D0001O0001A0001" = "20250001M0002D0001O0001"(관리의무코드) + "A" + "0001"(순번)
     *
     * @param obligationCd 관리의무코드 (예: "20250001M0002D0001O0001")
     * @return 생성된 메뉴얼코드 (예: "20250001M0002D0001O0001A0001")
     */
    private String generateManualCode(String obligationCd) {
        log.debug("[DeptManagerManualService] 메뉴얼코드 생성 시작 - obligationCd: {}", obligationCd);

        // 1. 최대 순번 조회
        Integer maxSeq = deptManagerManualRepository.findMaxSequenceByObligationCd(obligationCd);

        // 2. 다음 순번 계산
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;

        // 3. 4자리 순번으로 포맷팅
        String formattedSeq = String.format("%04d", nextSeq);

        // 4. 코드 조합: obligationCd + "A" + 순번
        String code = obligationCd + "A" + formattedSeq;

        log.debug("[DeptManagerManualService] 메뉴얼코드 생성 완료 - obligationCd: {}, seq: {} -> code: {}",
                  obligationCd, nextSeq, code);

        return code;
    }

    // ===============================
    // CRUD 메서드
    // ===============================

    /**
     * 부서장업무메뉴얼 생성
     * - 메뉴얼코드는 자동 생성됨
     *
     * @param request 메뉴얼 생성 요청 DTO
     * @param username 생성자 사용자명
     * @return 생성된 메뉴얼 DTO
     */
    @Transactional
    public DeptManagerManualDto createManual(CreateDeptManagerManualRequest request, String username) {
        log.debug("[DeptManagerManualService] 메뉴얼 생성 요청 - ledgerOrderId: {}, obligationCd: {}, orgCode: {}, username: {}",
            request.getLedgerOrderId(), request.getObligationCd(), request.getOrgCode(), username);

        // 관리의무 엔티티 조회 (FK 연관관계 설정을 위해 필수)
        ManagementObligation managementObligation = managementObligationRepository.findById(request.getObligationCd())
            .orElseThrow(() -> new IllegalArgumentException("관리의무를 찾을 수 없습니다. CODE: " + request.getObligationCd()));

        // 메뉴얼코드 자동 생성
        String generatedCode = generateManualCode(request.getObligationCd());

        // 메뉴얼 엔티티 생성
        DeptManagerManual manual = DeptManagerManual.builder()
            .manualCd(generatedCode)  // 자동 생성된 코드 사용
            .ledgerOrderId(request.getLedgerOrderId())
            .managementObligation(managementObligation)  // 연관관계 설정 (obligationCd는 여기서 자동 설정됨)
            .orgCode(request.getOrgCode())
            .respItem(request.getRespItem())
            .activityName(request.getActivityName())
            .executorId(request.getExecutorId())
            .executionDate(request.getExecutionDate())
            .executionStatus(request.getExecutionStatus() != null ? request.getExecutionStatus() : "01")  // 기본값: 미수행
            .executionResultCd(request.getExecutionResultCd())
            .executionResultContent(request.getExecutionResultContent())
            .execCheckMethod(request.getExecCheckMethod())
            .execCheckDetail(request.getExecCheckDetail())
            .execCheckFrequencyCd(request.getExecCheckFrequencyCd())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")  // 기본값: Y
            .status(request.getStatus() != null ? request.getStatus() : "active")  // 기본값: active
            .remarks(request.getRemarks())
            .createdBy(username)
            .updatedBy(username)
            .build();

        // 저장
        DeptManagerManual saved = deptManagerManualRepository.save(manual);
        log.info("[DeptManagerManualService] 메뉴얼 생성 완료 - manualCd: {}", saved.getManualCd());

        // DTO 변환 후 반환
        return convertToDto(saved);
    }

    /**
     * 전체 메뉴얼 목록 조회
     *
     * @return 전체 메뉴얼 DTO 리스트
     */
    public List<DeptManagerManualDto> findAll() {
        log.debug("[DeptManagerManualService] 전체 메뉴얼 조회");

        List<DeptManagerManual> manuals = deptManagerManualRepository.findAll();

        return manuals.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 전체 메뉴얼 목록 조회 (employees 테이블 조인 포함)
     * - executor_id로 employees 테이블 조인하여 수행자 이름 조회
     * - org_code로 organizations 테이블 조인하여 조직명 조회
     *
     * @return 전체 메뉴얼 DTO 리스트 (수행자명, 조직명 포함)
     */
    public List<DeptManagerManualDto> findAllWithEmployees() {
        log.debug("[DeptManagerManualService] 전체 메뉴얼 조회 (employees 조인)");

        List<Object[]> results = deptManagerManualRepository.findAllWithEmployeesNative();

        return results.stream()
            .map(this::convertFromNativeQuery)
            .collect(Collectors.toList());
    }

    /**
     * 원장차수ID로 메뉴얼 목록 조회
     *
     * @param ledgerOrderId 원장차수ID
     * @return 메뉴얼 DTO 리스트
     */
    public List<DeptManagerManualDto> findByLedgerOrderId(String ledgerOrderId) {
        log.debug("[DeptManagerManualService] 메뉴얼 조회 - ledgerOrderId: {}", ledgerOrderId);

        List<DeptManagerManual> manuals = deptManagerManualRepository.findByLedgerOrderId(ledgerOrderId);

        return manuals.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 조직코드로 메뉴얼 목록 조회
     *
     * @param orgCode 조직코드
     * @return 메뉴얼 DTO 리스트
     */
    public List<DeptManagerManualDto> findByOrgCode(String orgCode) {
        log.debug("[DeptManagerManualService] 메뉴얼 조회 - orgCode: {}", orgCode);

        List<DeptManagerManual> manuals = deptManagerManualRepository.findByOrgCode(orgCode);

        return manuals.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 원장차수ID와 조직코드로 메뉴얼 목록 조회 (관계 테이블 JOIN 포함)
     * - 가장 자주 사용될 조회 메서드
     *
     * @param ledgerOrderId 원장차수ID
     * @param orgCode 조직코드
     * @return 메뉴얼 DTO 리스트 (관계 테이블 정보 포함)
     */
    public List<DeptManagerManualDto> findByLedgerOrderIdAndOrgCode(String ledgerOrderId, String orgCode) {
        log.debug("[DeptManagerManualService] 메뉴얼 조회 - ledgerOrderId: {}, orgCode: {}", ledgerOrderId, orgCode);

        List<DeptManagerManual> manuals = deptManagerManualRepository
            .findByLedgerOrderIdAndOrgCodeWithDetails(ledgerOrderId, orgCode);

        return manuals.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 메뉴얼 단일 조회
     *
     * @param manualCd 메뉴얼코드
     * @return 메뉴얼 DTO
     */
    public DeptManagerManualDto getManual(String manualCd) {
        log.debug("[DeptManagerManualService] 메뉴얼 단일 조회 - manualCd: {}", manualCd);

        DeptManagerManual manual = deptManagerManualRepository.findById(manualCd)
            .orElseThrow(() -> new IllegalArgumentException("메뉴얼을 찾을 수 없습니다. CODE: " + manualCd));

        return convertToDto(manual);
    }

    /**
     * 메뉴얼 수정
     *
     * @param manualCd 메뉴얼코드
     * @param request 메뉴얼 수정 요청 DTO
     * @param username 수정자 사용자명
     * @return 수정된 메뉴얼 DTO
     */
    @Transactional
    public DeptManagerManualDto updateManual(String manualCd, UpdateDeptManagerManualRequest request, String username) {
        log.debug("[DeptManagerManualService] 메뉴얼 수정 요청 - manualCd: {}, username: {}", manualCd, username);

        DeptManagerManual manual = deptManagerManualRepository.findById(manualCd)
            .orElseThrow(() -> new IllegalArgumentException("메뉴얼을 찾을 수 없습니다. CODE: " + manualCd));

        // 수정 가능한 필드만 업데이트
        manual.setRespItem(request.getRespItem());
        manual.setActivityName(request.getActivityName());
        manual.setExecutorId(request.getExecutorId());
        manual.setExecutionDate(request.getExecutionDate());
        manual.setExecutionStatus(request.getExecutionStatus());
        manual.setExecutionResultCd(request.getExecutionResultCd());
        manual.setExecutionResultContent(request.getExecutionResultContent());
        manual.setExecCheckMethod(request.getExecCheckMethod());
        manual.setExecCheckDetail(request.getExecCheckDetail());
        manual.setExecCheckFrequencyCd(request.getExecCheckFrequencyCd());
        manual.setIsActive(request.getIsActive());
        manual.setStatus(request.getStatus());
        manual.setRemarks(request.getRemarks());
        manual.setUpdatedBy(username);

        DeptManagerManual updated = deptManagerManualRepository.save(manual);
        log.info("[DeptManagerManualService] 메뉴얼 수정 완료 - manualCd: {}", updated.getManualCd());

        return convertToDto(updated);
    }

    /**
     * 메뉴얼 삭제
     *
     * @param manualCd 메뉴얼코드
     */
    @Transactional
    public void deleteManual(String manualCd) {
        log.debug("[DeptManagerManualService] 메뉴얼 삭제 요청 - manualCd: {}", manualCd);

        if (!deptManagerManualRepository.existsById(manualCd)) {
            throw new IllegalArgumentException("메뉴얼을 찾을 수 없습니다. CODE: " + manualCd);
        }

        deptManagerManualRepository.deleteById(manualCd);
        log.info("[DeptManagerManualService] 메뉴얼 삭제 완료 - manualCd: {}", manualCd);
    }

    /**
     * 메뉴얼 일괄 삭제
     *
     * @param manualCds 메뉴얼코드 리스트
     */
    @Transactional
    public void deleteManuals(List<String> manualCds) {
        log.debug("[DeptManagerManualService] 메뉴얼 일괄 삭제 요청 - count: {}", manualCds.size());

        for (String manualCd : manualCds) {
            deleteManual(manualCd);
        }

        log.info("[DeptManagerManualService] 메뉴얼 일괄 삭제 완료 - count: {}", manualCds.size());
    }

    // ===============================
    // DTO 변환 메서드
    // ===============================

    /**
     * Native Query 결과 → DTO 변환
     * - Object[] 배열을 DeptManagerManualDto로 변환
     *
     * @param row Native Query 결과 행 (Object[])
     * @return 메뉴얼 DTO
     */
    private DeptManagerManualDto convertFromNativeQuery(Object[] row) {
        int i = 0;

        return DeptManagerManualDto.builder()
            .manualCd(safeToString(row[i++]))
            .ledgerOrderId(safeToString(row[i++]))
            .obligationCd(safeToString(row[i++]))
            .orgCode(safeToString(row[i++]))
            .orgName(safeToString(row[i++]))
            .respItem(safeToString(row[i++]))
            .activityName(safeToString(row[i++]))
            .executorId(safeToString(row[i++]))
            .executorName(safeToString(row[i++]))  // employees 테이블 조인 결과
            .executionDate(row[i++] != null ? ((java.sql.Date) row[i - 1]).toLocalDate() : null)
            .executionStatus(safeToString(row[i++]))
            .executionResultCd(safeToString(row[i++]))
            .executionResultContent(safeToString(row[i++]))
            .execCheckMethod(safeToString(row[i++]))
            .execCheckDetail(safeToString(row[i++]))
            .execCheckFrequencyCd(safeToString(row[i++]))
            .isActive(safeToString(row[i++]))  // CHAR(1) → String 변환
            .status(safeToString(row[i++]))
            .createdAt(row[i++] != null ? ((java.sql.Timestamp) row[i - 1]).toLocalDateTime() : null)
            .createdBy(safeToString(row[i++]))
            .updatedAt(row[i++] != null ? ((java.sql.Timestamp) row[i - 1]).toLocalDateTime() : null)
            .updatedBy(safeToString(row[i++]))
            .approvedAt(row[i++] != null ? ((java.sql.Timestamp) row[i - 1]).toLocalDateTime() : null)
            .approvedBy(safeToString(row[i++]))
            .remarks(safeToString(row[i++]))
            .build();
    }

    /**
     * Object를 안전하게 String으로 변환
     * - Character 타입도 처리 (PostgreSQL CHAR(1) 컬럼 대응)
     *
     * @param obj 변환할 객체
     * @return String 또는 null
     */
    private String safeToString(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Character) return String.valueOf(obj);
        return (String) obj;
    }

    /**
     * Entity → DTO 변환 (관계 테이블 정보 포함)
     * - responsibilities, responsibility_details, management_obligations, organizations 정보 포함
     *
     * @param manual 메뉴얼 엔티티
     * @return 메뉴얼 DTO (모든 관계 테이블 정보 포함)
     */
    private DeptManagerManualDto convertToDto(DeptManagerManual manual) {
        // 기본 DTO 빌더
        DeptManagerManualDto.DeptManagerManualDtoBuilder builder = DeptManagerManualDto.builder()
            .manualCd(manual.getManualCd())
            .ledgerOrderId(manual.getLedgerOrderId())
            .obligationCd(manual.getObligationCd())
            .orgCode(manual.getOrgCode())
            .respItem(manual.getRespItem())
            .activityName(manual.getActivityName())
            .executorId(manual.getExecutorId())
            .executionDate(manual.getExecutionDate())
            .executionStatus(manual.getExecutionStatus())
            .executionResultCd(manual.getExecutionResultCd())
            .executionResultContent(manual.getExecutionResultContent())
            .execCheckMethod(manual.getExecCheckMethod())
            .execCheckDetail(manual.getExecCheckDetail())
            .execCheckFrequencyCd(manual.getExecCheckFrequencyCd())
            .isActive(manual.getIsActive())
            .status(manual.getStatus())
            .createdAt(manual.getCreatedAt())
            .createdBy(manual.getCreatedBy())
            .updatedAt(manual.getUpdatedAt())
            .updatedBy(manual.getUpdatedBy())
            .approvedAt(manual.getApprovedAt())
            .approvedBy(manual.getApprovedBy())
            .remarks(manual.getRemarks());

        // ManagementObligation 정보 추가
        if (manual.getManagementObligation() != null) {
            builder.obligationInfo(manual.getManagementObligation().getObligationInfo());

            // ResponsibilityDetail 정보 추가
            if (manual.getManagementObligation().getResponsibilityDetail() != null) {
                builder.responsibilityDetailInfo(
                    manual.getManagementObligation().getResponsibilityDetail().getResponsibilityDetailInfo()
                );

                // Responsibility 정보 추가
                if (manual.getManagementObligation().getResponsibilityDetail().getResponsibility() != null) {
                    builder.responsibilityCat(
                        manual.getManagementObligation().getResponsibilityDetail().getResponsibility().getResponsibilityCat()
                    );
                    builder.responsibilityInfo(
                        manual.getManagementObligation().getResponsibilityDetail().getResponsibility().getResponsibilityInfo()
                    );
                }
            }
        }

        // Organization 정보 추가 (orgCode로 조회)
        if (manual.getOrgCode() != null && !manual.getOrgCode().isEmpty()) {
            organizationRepository.findById(manual.getOrgCode())
                .ifPresent(org -> builder.orgName(org.getOrgName()));
        }

        // 공통코드명 조회 (점검주기, 수행상태, 수행결과)
        try {
            // 점검주기명 조회
            if (manual.getExecCheckFrequencyCd() != null && !manual.getExecCheckFrequencyCd().isEmpty()) {
                CommonCodeDetailDto frequencyCode = commonCodeService.getCodeDetail(
                    "FLFL_ISPC_FRCD", manual.getExecCheckFrequencyCd());
                builder.execCheckFrequencyName(frequencyCode.getDetailName());
            }

            // 수행상태명 조회 (예: 01=미수행, 02=수행완료)
            if (manual.getExecutionStatus() != null && !manual.getExecutionStatus().isEmpty()) {
                // 수행상태 코드그룹이 있다면 조회
                // 없다면 하드코딩으로 처리 가능
                String executionStatusName = switch (manual.getExecutionStatus()) {
                    case "01" -> "미수행";
                    case "02" -> "수행완료";
                    default -> manual.getExecutionStatus();
                };
                builder.executionStatusName(executionStatusName);
            }

            // 수행결과명 조회 (예: 01=적정, 02=부적정)
            if (manual.getExecutionResultCd() != null && !manual.getExecutionResultCd().isEmpty()) {
                String executionResultName = switch (manual.getExecutionResultCd()) {
                    case "01" -> "적정";
                    case "02" -> "부적정";
                    default -> manual.getExecutionResultCd();
                };
                builder.executionResultName(executionResultName);
            }
        } catch (Exception e) {
            log.warn("공통코드명 조회 실패 - manualCd: {}", manual.getManualCd(), e);
        }

        return builder.build();
    }
}
