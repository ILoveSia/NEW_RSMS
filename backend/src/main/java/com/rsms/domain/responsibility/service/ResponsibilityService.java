package com.rsms.domain.responsibility.service;

import com.rsms.domain.ledger.repository.LedgerOrderRepository;
import com.rsms.domain.position.entity.Position;
import com.rsms.domain.position.repository.PositionRepository;
import com.rsms.domain.responsibility.dto.*;
import com.rsms.domain.responsibility.entity.ManagementObligation;
import com.rsms.domain.responsibility.entity.Responsibility;
import com.rsms.domain.responsibility.entity.ResponsibilityDetail;
import com.rsms.domain.responsibility.repository.ManagementObligationRepository;
import com.rsms.domain.responsibility.repository.ResponsibilityDetailRepository;
import com.rsms.domain.responsibility.repository.ResponsibilityRepository;
import com.rsms.domain.system.code.entity.CommonCodeDetail;
import com.rsms.domain.system.code.repository.CommonCodeDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
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
    private final ResponsibilityDetailRepository responsibilityDetailRepository;
    private final ManagementObligationRepository managementObligationRepository;
    private final CommonCodeDetailRepository commonCodeDetailRepository;
    private final PositionRepository positionRepository;
    private final LedgerOrderRepository ledgerOrderRepository;

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
     * 2개 테이블 조인 책무 목록 조회
     * - responsibilities(마스터), positions
     * - responsibilities를 마스터로 positions LEFT JOIN
     * - 책무와 직책 정보만 조회
     */
    public List<ResponsibilityListDto> getAllResponsibilitiesWithJoin(String ledgerOrderId, String responsibilityInfo, String responsibilityCd) {
        log.debug("2테이블 조인 책무 목록 조회 - ledgerOrderId: {}, responsibilityInfo: {}, responsibilityCd: {}",
                  ledgerOrderId, responsibilityInfo, responsibilityCd);

        List<Map<String, Object>> results = responsibilityRepository.findAllResponsibilitiesWithJoin(
            ledgerOrderId, responsibilityInfo, responsibilityCd);

        // 공통코드 조회 (책무카테고리만)
        Map<String, String> responsibilityCatMap = getCommonCodeMap("RSBT_OBLG_CLCD");

        List<ResponsibilityListDto> dtoList = results.stream()
            .map(row -> convertMapToListDto(row, responsibilityCatMap))
            .collect(Collectors.toList());

        log.debug("2테이블 조인 책무 목록 조회 완료 - 결과 수: {}", dtoList.size());
        return dtoList;
    }

    /**
     * 책무 단건 조회
     * - 책무코드로 조회
     */
    public ResponsibilityDto getResponsibility(String responsibilityCd) {
        log.debug("책무 단건 조회 - responsibilityCd: {}", responsibilityCd);

        Responsibility responsibility = responsibilityRepository.findById(responsibilityCd)
            .orElseThrow(() -> new RuntimeException("책무를 찾을 수 없습니다. CODE: " + responsibilityCd));

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(responsibility, categoryMap, codeMap);
    }

    // ===============================
    // 코드 자동 생성 로직
    // ===============================

    /**
     * 책무코드 자동 생성
     * - 코드 생성 규칙: ledger_order_id + responsibility_cat + 순번(4자리)
     * - 예시: "20250001C0001" = "20250001"(원장차수) + "C"(카테고리) + "0001"(순번)
     * - 코드 형식: 13자리 (원장차수 8자리 + 카테고리 1자리 + 순번 4자리)
     *
     * @param ledgerOrderId 원장차수ID (8자리)
     * @param responsibilityCat 책무카테고리 (1자리: M, I, C, B, R 등)
     * @return 생성된 책무코드 (예: "20250001C0001")
     */
    private String generateResponsibilityCode(String ledgerOrderId, String responsibilityCat) {
        log.debug("책무코드 생성 시작 - ledgerOrderId: {}, responsibilityCat: {}", ledgerOrderId, responsibilityCat);

        // 1. 최대 순번 조회 (SUBSTRING으로 9번째 자리부터 4자리 추출)
        Integer maxSeq = responsibilityRepository.findMaxSequenceByLedgerOrderIdAndCategory(
            ledgerOrderId, responsibilityCat);

        // 2. 다음 순번 계산
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;

        // 3. 4자리 순번으로 포맷팅 (0001, 0002, ...)
        String formattedSeq = String.format("%04d", nextSeq);

        // 4. 코드 조합: ledgerOrderId + responsibilityCat + 순번
        String code = ledgerOrderId + responsibilityCat + formattedSeq;

        log.debug("책무코드 생성 완료 - ledgerOrderId: {}, cat: {}, seq: {} -> code: {}",
                  ledgerOrderId, responsibilityCat, nextSeq, code);

        return code;
    }

    /**
     * 책무 생성
     * - 책무코드는 자동 생성됨
     * - positions_id는 insertable=false이므로 positions 엔티티를 설정해야 함
     */
    @Transactional
    public ResponsibilityDto createResponsibility(CreateResponsibilityRequest request, String username) {
        log.debug("책무 생성 요청 - request: {}, username: {}", request, username);

        // 직책 엔티티 조회 (ManyToOne 관계 설정을 위해 필요)
        Position position = positionRepository.findById(request.getPositionsId())
            .orElseThrow(() -> new RuntimeException("직책을 찾을 수 없습니다. ID: " + request.getPositionsId()));

        // 책무코드 자동 생성
        String generatedCode = generateResponsibilityCode(
            request.getLedgerOrderId(),
            request.getResponsibilityCat()
        );

        // 책무 엔티티 생성
        Responsibility responsibility = Responsibility.builder()
            .responsibilityCd(generatedCode)  // 자동 생성된 코드 사용
            .ledgerOrderId(request.getLedgerOrderId())
            .positions(position)  // positionsId 대신 positions 엔티티 설정
            .responsibilityCat(request.getResponsibilityCat())
            .responsibilityInfo(request.getResponsibilityInfo())
            .responsibilityLegal(request.getResponsibilityLegal())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        Responsibility saved = responsibilityRepository.save(responsibility);
        log.info("책무 생성 완료 - responsibilityCd: {}", saved.getResponsibilityCd());

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(saved, categoryMap, codeMap);
    }

    /**
     * 책무 수정
     * - 책무코드로 조회 후 수정
     */
    @Transactional
    public ResponsibilityDto updateResponsibility(String responsibilityCd, UpdateResponsibilityRequest request, String username) {
        log.debug("책무 수정 요청 - responsibilityCd: {}, request: {}, username: {}", responsibilityCd, request, username);

        Responsibility responsibility = responsibilityRepository.findById(responsibilityCd)
            .orElseThrow(() -> new RuntimeException("책무를 찾을 수 없습니다. CODE: " + responsibilityCd));

        responsibility.update(
            request.getResponsibilityInfo(),
            request.getResponsibilityLegal(),
            request.getIsActive(),
            username
        );

        Responsibility updated = responsibilityRepository.save(responsibility);
        log.info("책무 수정 완료 - responsibilityCd: {}", updated.getResponsibilityCd());

        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(updated, categoryMap, codeMap);
    }

    /**
     * 책무 삭제
     * - 책무코드로 삭제
     */
    @Transactional
    public void deleteResponsibility(String responsibilityCd) {
        log.debug("책무 삭제 요청 - responsibilityCd: {}", responsibilityCd);

        if (!responsibilityRepository.existsById(responsibilityCd)) {
            throw new RuntimeException("책무를 찾을 수 없습니다. CODE: " + responsibilityCd);
        }

        responsibilityRepository.deleteById(responsibilityCd);
        log.info("책무 삭제 완료 - responsibilityCd: {}", responsibilityCd);
    }

    /**
     * 원장차수ID와 직책ID로 모든 책무 삭제 후 새로 저장
     * - 각 책무의 코드는 자동 생성됨
     * - positions_id는 insertable=false이므로 positions 엔티티를 설정해야 함
     */
    @Transactional
    public List<ResponsibilityDto> saveAllResponsibilities(String ledgerOrderId, Long positionsId,
                                                           List<CreateResponsibilityRequest> requests, String username) {
        log.debug("책무 전체 저장 - ledgerOrderId: {}, positionsId: {}, count: {}", ledgerOrderId, positionsId, requests.size());

        // 직책 엔티티 조회
        Position position = positionRepository.findById(positionsId)
            .orElseThrow(() -> new RuntimeException("직책을 찾을 수 없습니다. ID: " + positionsId));

        // 기존 책무 전체 삭제
        responsibilityRepository.deleteByLedgerOrderIdAndPositionsId(ledgerOrderId, positionsId);
        log.debug("기존 책무 전체 삭제 완료");

        // 새로운 책무 저장 (코드 자동 생성)
        List<Responsibility> responsibilities = requests.stream()
            .map(req -> {
                // 책무코드 자동 생성
                String generatedCode = generateResponsibilityCode(
                    ledgerOrderId,
                    req.getResponsibilityCat()
                );

                return Responsibility.builder()
                    .responsibilityCd(generatedCode)  // 자동 생성된 코드 사용
                    .ledgerOrderId(ledgerOrderId)
                    .positions(position)  // positionsId 대신 positions 엔티티 설정
                    .responsibilityCat(req.getResponsibilityCat())
                    .responsibilityInfo(req.getResponsibilityInfo())
                    .responsibilityLegal(req.getResponsibilityLegal())
                    .isActive(req.getIsActive() != null ? req.getIsActive() : "Y")
                    .createdBy(username)
                    .updatedBy(username)
                    .build();
            })
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
     * 책무, 책무세부, 관리의무를 한 번에 생성
     * - responsibilities, responsibility_details, management_obligations 3개 테이블 저장
     * - 트랜잭션으로 전체 성공 또는 전체 실패 보장
     * - 모든 코드는 자동 생성됨
     * - positions_id는 insertable=false이므로 positions 엔티티를 설정해야 함
     */
    @Transactional
    public ResponsibilityDto createResponsibilityWithDetails(CreateResponsibilityWithDetailsRequest request, String username) {
        log.debug("책무 전체 생성 요청 - username: {}", username);

        // 직책 엔티티 조회
        Position position = positionRepository.findById(request.getPositionsId())
            .orElseThrow(() -> new RuntimeException("직책을 찾을 수 없습니다. ID: " + request.getPositionsId()));

        // 1. 책무(responsibilities) 저장 - 코드 자동 생성
        String generatedRespCode = generateResponsibilityCode(
            request.getLedgerOrderId(),
            request.getResponsibilityCat()
        );

        Responsibility responsibility = Responsibility.builder()
            .responsibilityCd(generatedRespCode)  // 자동 생성된 코드 사용
            .ledgerOrderId(request.getLedgerOrderId())
            .positions(position)  // positionsId 대신 positions 엔티티 설정
            .responsibilityCat(request.getResponsibilityCat())
            .responsibilityInfo(request.getResponsibilityInfo())
            .responsibilityLegal(request.getResponsibilityLegal())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        Responsibility savedResponsibility = responsibilityRepository.save(responsibility);
        log.info("책무 생성 완료 - responsibilityCd: {}", savedResponsibility.getResponsibilityCd());

        // 2. 책무세부(responsibility_details) 저장 - 코드 자동 생성
        if (request.getDetails() != null && !request.getDetails().isEmpty()) {
            for (CreateResponsibilityWithDetailsRequest.ResponsibilityDetailDto detailDto : request.getDetails()) {
                // 책무세부 코드 자동 생성 (ResponsibilityDetailService 로직 복사)
                String suffix = savedResponsibility.getResponsibilityCd().length() >= 9
                    ? savedResponsibility.getResponsibilityCd().substring(savedResponsibility.getResponsibilityCd().length() - 9)
                    : savedResponsibility.getResponsibilityCd();

                int prefixLength = suffix.length() + 1;
                Integer maxSeq = responsibilityDetailRepository.findMaxSequenceByResponsibilityCd(
                    savedResponsibility.getResponsibilityCd(), prefixLength);
                int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;
                String formattedSeq = String.format("%04d", nextSeq);
                String generatedDetailCode = suffix + "D" + formattedSeq;

                ResponsibilityDetail detail = ResponsibilityDetail.builder()
                    .responsibilityDetailCd(generatedDetailCode)  // 자동 생성된 코드 사용
                    .responsibility(savedResponsibility)  // Responsibility 객체 설정
                    .responsibilityDetailInfo(detailDto.getResponsibilityDetailInfo())
                    .isActive(detailDto.getIsActive() != null ? detailDto.getIsActive() : "Y")
                    .createdBy(username)
                    .updatedBy(username)
                    .build();

                ResponsibilityDetail savedDetail = responsibilityDetailRepository.save(detail);
                log.debug("책무세부 생성 완료 - responsibilityDetailCd: {}", savedDetail.getResponsibilityDetailCd());

                // 3. 관리의무(management_obligations) 저장 - 코드 자동 생성
                if (detailDto.getObligations() != null && !detailDto.getObligations().isEmpty()) {
                    for (CreateResponsibilityWithDetailsRequest.ManagementObligationDto obligationDto : detailDto.getObligations()) {
                        // 관리의무 코드 자동 생성 (ManagementObligationService 로직 복사)
                        int obligPrefixLength = savedDetail.getResponsibilityDetailCd().length() + 2;
                        Integer maxObligSeq = managementObligationRepository.findMaxSequenceByResponsibilityDetailCd(
                            savedDetail.getResponsibilityDetailCd(), obligPrefixLength);
                        int nextObligSeq = (maxObligSeq != null ? maxObligSeq : 0) + 1;
                        String formattedObligSeq = String.format("%04d", nextObligSeq);
                        String generatedObligationCode = savedDetail.getResponsibilityDetailCd() + "MO" + formattedObligSeq;

                        ManagementObligation obligation = ManagementObligation.builder()
                            .obligationCd(generatedObligationCode)  // 자동 생성된 코드 사용
                            .responsibilityDetailCd(savedDetail.getResponsibilityDetailCd())
                            .obligationMajorCatCd(obligationDto.getObligationMajorCatCd())
                            .obligationInfo(obligationDto.getObligationInfo())
                            .orgCode(obligationDto.getOrgCode())
                            .isActive(obligationDto.getIsActive() != null ? obligationDto.getIsActive() : "Y")
                            .createdBy(username)
                            .updatedBy(username)
                            .build();

                        ManagementObligation savedObligation = managementObligationRepository.save(obligation);
                        log.debug("관리의무 생성 완료 - obligationCd: {}", savedObligation.getObligationCd());
                    }
                }
            }
        }

        log.info("책무 전체 생성 완료 - responsibilityCd: {}, details: {}",
                 savedResponsibility.getResponsibilityCd(),
                 request.getDetails() != null ? request.getDetails().size() : 0);

        // 공통코드 조회하여 DTO 변환
        Map<String, String> categoryMap = getCommonCodeMap("RSBT_OBLG_CLCD");
        Map<String, String> codeMap = getCommonCodeMap("RSBT_OBLG_CD");

        return convertToDto(savedResponsibility, categoryMap, codeMap);
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
            .responsibilityCd(entity.getResponsibilityCd())  // PK는 이제 code
            .ledgerOrderId(entity.getLedgerOrderId())
            .positionsId(entity.getPositionsId())
            .responsibilityCat(entity.getResponsibilityCat())
            .responsibilityCatName(categoryMap.get(entity.getResponsibilityCat()))
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
     * - responsibilities, positions 테이블만 조인
     */
    private ResponsibilityListDto convertMapToListDto(Map<String, Object> row,
                                                      Map<String, String> responsibilityCatMap) {
        return ResponsibilityListDto.builder()
            // responsibilities 테이블
            .ledgerOrderId(getStringValue(row, "ledger_order_id"))
            .positionsId(getLongValue(row, "positions_id"))
            .responsibilityCat(getStringValue(row, "responsibility_cat"))
            .responsibilityCatName(responsibilityCatMap.get(getStringValue(row, "responsibility_cat")))
            .responsibilityCd(getStringValue(row, "responsibility_cd"))
            .responsibilityInfo(getStringValue(row, "responsibility_info"))
            .responsibilityLegal(getStringValue(row, "responsibility_legal"))
            .expirationDate(getStringValue(row, "expiration_date"))
            .responsibilityStatus(getStringValue(row, "responsibility_status"))
            .responsibilityIsActive(getStringValue(row, "responsibility_is_active"))
            .createdBy(getStringValue(row, "created_by"))
            .createdAt(getStringValue(row, "created_at"))
            .updatedBy(getStringValue(row, "updated_by"))
            .updatedAt(getStringValue(row, "updated_at"))
            // positions 테이블
            .positionsCd(getStringValue(row, "positions_cd"))
            .positionsName(getStringValue(row, "positions_name"))
            .hqCode(getStringValue(row, "hq_code"))
            .hqName(getStringValue(row, "hq_name"))
            // responsibility_details, management_obligations 제거
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

    /**
     * 책무 엑셀 업로드
     * - 엑셀 파일을 파싱하여 책무 데이터를 일괄 등록
     * - 엑셀 양식: 원장차수, 직책코드, 책무카테고리코드, 책무내용, 책무관련근거, 사용여부
     * - 직책코드로 positions_id 조회 후 책무 생성
     *
     * @param file 업로드할 엑셀 파일
     * @param username 등록자 ID
     * @return 업로드 결과 (성공/실패 건수, 에러 메시지)
     */
    @Transactional
    public ExcelUploadResponse uploadExcel(MultipartFile file, String username) {
        log.info("엑셀 업로드 시작 - 파일명: {}, 사용자: {}", file.getOriginalFilename(), username);

        ExcelUploadResponse response = ExcelUploadResponse.builder()
            .successCount(0)
            .failCount(0)
            .totalCount(0)
            .errors(new ArrayList<>())
            .build();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // 헤더 행 검증 (첫 번째 행)
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                response.addError("엑셀 파일에 헤더가 없습니다.");
                return response;
            }

            // 헤더 컬럼 검증
            String[] expectedHeaders = {"원장차수", "직책코드", "책무카테고리코드", "책무내용", "책무관련근거", "사용여부"};
            for (int i = 0; i < expectedHeaders.length; i++) {
                Cell cell = headerRow.getCell(i);
                String headerValue = cell != null ? cell.getStringCellValue() : "";
                if (!expectedHeaders[i].equals(headerValue)) {
                    response.addError("헤더가 올바르지 않습니다. 예상: " + expectedHeaders[i] + ", 실제: " + headerValue);
                    return response;
                }
            }

            // 데이터 행 처리 (2번째 행부터)
            int totalRows = sheet.getPhysicalNumberOfRows();
            response.setTotalCount(totalRows - 1); // 헤더 제외

            for (int rowIndex = 1; rowIndex < totalRows; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isEmptyRow(row)) {
                    continue; // 빈 행 건너뛰기
                }

                try {
                    // 엑셀 데이터 읽기
                    String ledgerOrderId = getCellValue(row.getCell(0));
                    String positionsCd = getCellValue(row.getCell(1));
                    String responsibilityCat = getCellValue(row.getCell(2));
                    String responsibilityInfo = getCellValue(row.getCell(3));
                    String responsibilityLegal = getCellValue(row.getCell(4));
                    String isActive = getCellValue(row.getCell(5));

                    // 필수 필드 검증
                    if (ledgerOrderId == null || ledgerOrderId.isEmpty()) {
                        response.addError((rowIndex + 1) + "행: 원장차수는 필수입니다.");
                        response.setFailCount(response.getFailCount() + 1);
                        continue;
                    }
                    if (positionsCd == null || positionsCd.isEmpty()) {
                        response.addError((rowIndex + 1) + "행: 직책코드는 필수입니다.");
                        response.setFailCount(response.getFailCount() + 1);
                        continue;
                    }
                    if (responsibilityInfo == null || responsibilityInfo.isEmpty()) {
                        response.addError((rowIndex + 1) + "행: 책무내용은 필수입니다.");
                        response.setFailCount(response.getFailCount() + 1);
                        continue;
                    }

                    // 사용여부 검증 (Y 또는 N)
                    if (isActive != null && !isActive.isEmpty() && !isActive.equals("Y") && !isActive.equals("N")) {
                        response.addError((rowIndex + 1) + "행: 사용여부는 Y 또는 N만 가능합니다.");
                        response.setFailCount(response.getFailCount() + 1);
                        continue;
                    }

                    // 원장차수 존재 여부 검증
                    if (!ledgerOrderRepository.existsById(ledgerOrderId)) {
                        response.addError((rowIndex + 1) + "행: 원장차수 '" + ledgerOrderId + "'가 존재하지 않습니다.");
                        response.setFailCount(response.getFailCount() + 1);
                        continue;
                    }

                    // 원장차수ID + 직책코드로 Position 조회
                    // - 동일한 직책코드가 여러 원장차수에 존재할 수 있으므로 두 조건으로 조회
                    final int currentRow = rowIndex + 1;
                    final String currentLedgerOrderId = ledgerOrderId;
                    final String currentPositionsCd = positionsCd;
                    Position position = positionRepository.findByLedgerOrderIdAndPositionsCd(ledgerOrderId, positionsCd)
                        .orElseThrow(() -> new IllegalArgumentException(
                            currentRow + "행: 원장차수 '" + currentLedgerOrderId + "', 직책코드 '" + currentPositionsCd + "'에 해당하는 직책을 찾을 수 없습니다."
                        ));

                    // 책무 생성 요청 DTO 구성
                    CreateResponsibilityRequest request = CreateResponsibilityRequest.builder()
                        .ledgerOrderId(ledgerOrderId)
                        .positionsId(position.getPositionsId())
                        .responsibilityCat(responsibilityCat)
                        .responsibilityInfo(responsibilityInfo)
                        .responsibilityLegal(responsibilityLegal)
                        .isActive(isActive != null && !isActive.isEmpty() ? isActive : "Y")
                        .build();

                    // 책무 생성
                    createResponsibility(request, username);
                    response.setSuccessCount(response.getSuccessCount() + 1);

                } catch (Exception e) {
                    log.error("{}행 처리 실패: {}", rowIndex + 1, e.getMessage(), e);
                    response.addError((rowIndex + 1) + "행: " + e.getMessage());
                    response.setFailCount(response.getFailCount() + 1);
                }
            }

            log.info("엑셀 업로드 완료 - 총: {}, 성공: {}, 실패: {}",
                response.getTotalCount(), response.getSuccessCount(), response.getFailCount());

        } catch (IOException e) {
            log.error("엑셀 파일 읽기 실패", e);
            response.addError("엑셀 파일 읽기에 실패했습니다: " + e.getMessage());
        }

        return response;
    }

    /**
     * 셀 값 추출 (문자열)
     */
    private String getCellValue(Cell cell) {
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // 숫자를 문자열로 변환 (소수점 제거)
                double numericValue = cell.getNumericCellValue();
                if (numericValue == (long) numericValue) {
                    return String.valueOf((long) numericValue);
                }
                return String.valueOf(numericValue);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return null;
            default:
                return null;
        }
    }

    /**
     * 빈 행 체크
     */
    private boolean isEmptyRow(Row row) {
        if (row == null) {
            return true;
        }

        for (int cellNum = 0; cellNum < row.getLastCellNum(); cellNum++) {
            Cell cell = row.getCell(cellNum);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellValue(cell);
                if (value != null && !value.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
}
