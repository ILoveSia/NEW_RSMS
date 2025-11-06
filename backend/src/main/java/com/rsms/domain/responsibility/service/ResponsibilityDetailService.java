package com.rsms.domain.responsibility.service;

import com.rsms.domain.responsibility.dto.CreateResponsibilityDetailRequest;
import com.rsms.domain.responsibility.dto.ResponsibilityDetailDto;
import com.rsms.domain.responsibility.dto.UpdateResponsibilityDetailRequest;
import com.rsms.domain.responsibility.entity.ResponsibilityDetail;
import com.rsms.domain.responsibility.repository.ResponsibilityDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 책무세부 서비스
 * - 책무세부 CRUD 비즈니스 로직 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponsibilityDetailService {

    private final ResponsibilityDetailRepository responsibilityDetailRepository;
    private final com.rsms.domain.responsibility.repository.ResponsibilityRepository responsibilityRepository;

    // ===============================
    // 코드 자동 생성 로직
    // ===============================

    /**
     * 책무세부코드 자동 생성
     * - 코드 생성 규칙: 책무코드 전체 + "D" + 순번(4자리)
     * - 예시: "20250001M0001D0001" = "20250001M0001"(책무코드 전체) + "D" + "0001"(순번)
     *
     * @param responsibilityCd 책무코드 (예: "20250001M0001")
     * @return 생성된 책무세부코드 (예: "20250001M0001D0001")
     */
    private String generateDetailCode(String responsibilityCd) {
        log.debug("[ResponsibilityDetailService] 책무세부코드 생성 시작 - responsibilityCd: {}", responsibilityCd);

        // 1. prefix 길이 계산 (책무코드 전체 + "D" = prefixLength)
        int prefixLength = responsibilityCd.length() + 1;  // "20250001M0001D"의 길이 = 14

        // 2. 최대 순번 조회
        Integer maxSeq = responsibilityDetailRepository.findMaxSequenceByResponsibilityCd(
            responsibilityCd, prefixLength);

        // 3. 다음 순번 계산
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;

        // 4. 4자리 순번으로 포맷팅
        String formattedSeq = String.format("%04d", nextSeq);

        // 5. 코드 조합: 책무코드 전체 + "D" + 순번
        String code = responsibilityCd + "D" + formattedSeq;

        log.debug("[ResponsibilityDetailService] 책무세부코드 생성 완료 - responsibilityCd: {}, seq: {} -> code: {}",
                  responsibilityCd, nextSeq, code);

        return code;
    }

    /**
     * 책무세부 생성
     * - 책무세부코드는 자동 생성됨
     *
     * @param request 책무세부 생성 요청 DTO
     * @param username 생성자 사용자명
     * @return 생성된 책무세부 DTO
     */
    @Transactional
    public ResponsibilityDetailDto createDetail(CreateResponsibilityDetailRequest request, String username) {
        log.debug("[ResponsibilityDetailService] 책무세부 생성 요청 - responsibilityCd: {}, username: {}",
            request.getResponsibilityCd(), username);

        // 1. 책무 엔티티 조회
        com.rsms.domain.responsibility.entity.Responsibility responsibility =
            responsibilityRepository.findById(request.getResponsibilityCd())
                .orElseThrow(() -> new IllegalArgumentException(
                    "책무를 찾을 수 없습니다. CODE: " + request.getResponsibilityCd()));

        // 2. 책무세부코드 자동 생성
        String generatedCode = generateDetailCode(request.getResponsibilityCd());

        // 3. 책무세부 엔티티 생성
        ResponsibilityDetail detail = ResponsibilityDetail.builder()
            .responsibilityDetailCd(generatedCode)  // 자동 생성된 코드 사용
            .responsibility(responsibility)         // Responsibility 객체 설정
            .responsibilityDetailInfo(request.getResponsibilityDetailInfo())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        // 4. 저장
        ResponsibilityDetail saved = responsibilityDetailRepository.save(detail);
        log.info("[ResponsibilityDetailService] 책무세부 생성 완료 - responsibilityDetailCd: {}", saved.getResponsibilityDetailCd());

        // 5. DTO 변환 후 반환
        return convertToDto(saved);
    }

    /**
     * 책무세부 일괄 생성 (엑셀 업로드용)
     * - 여러 책무세부를 한번에 생성
     * - 각 책무세부코드는 자동 생성됨
     *
     * @param requests 책무세부 생성 요청 리스트
     * @param username 생성자 사용자명
     * @return 생성된 책무세부 DTO 리스트
     */
    @Transactional
    public List<ResponsibilityDetailDto> createDetailsBulk(List<CreateResponsibilityDetailRequest> requests, String username) {
        log.info("[ResponsibilityDetailService] 책무세부 일괄 생성 시작 - count: {}, username: {}", requests.size(), username);

        // 각 요청에 대해 개별 생성 처리
        List<ResponsibilityDetailDto> createdDetails = requests.stream()
            .map(request -> {
                try {
                    return createDetail(request, username);
                } catch (Exception e) {
                    log.error("[ResponsibilityDetailService] 책무세부 생성 실패 - responsibilityCd: {}, error: {}",
                        request.getResponsibilityCd(), e.getMessage());
                    throw new RuntimeException("책무세부 생성 실패: " + request.getResponsibilityCd(), e);
                }
            })
            .collect(Collectors.toList());

        log.info("[ResponsibilityDetailService] 책무세부 일괄 생성 완료 - 성공: {}개", createdDetails.size());

        return createdDetails;
    }

    /**
     * 전체 책무세부 목록 조회
     *
     * @return 전체 책무세부 DTO 리스트
     */
    public List<ResponsibilityDetailDto> findAll() {
        log.debug("[ResponsibilityDetailService] 전체 책무세부 목록 조회");

        List<ResponsibilityDetail> details = responsibilityDetailRepository.findAll();

        return details.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 책무세부 단건 조회
     *
     * @param responsibilityDetailCd 책무세부코드
     * @return 책무세부 DTO
     */
    public ResponsibilityDetailDto getDetail(String responsibilityDetailCd) {
        log.debug("[ResponsibilityDetailService] 책무세부 단건 조회 - responsibilityDetailCd: {}", responsibilityDetailCd);

        ResponsibilityDetail detail = responsibilityDetailRepository.findById(responsibilityDetailCd)
            .orElseThrow(() -> new IllegalArgumentException("책무세부를 찾을 수 없습니다. CODE: " + responsibilityDetailCd));

        return convertToDto(detail);
    }

    /**
     * 책무코드로 책무세부 목록 조회
     *
     * @param responsibilityCd 책무코드
     * @return 책무세부 DTO 리스트
     */
    public List<ResponsibilityDetailDto> findByResponsibilityCd(String responsibilityCd) {
        log.debug("[ResponsibilityDetailService] 책무세부 조회 - responsibilityCd: {}", responsibilityCd);

        List<ResponsibilityDetail> details = responsibilityDetailRepository.findByResponsibility_ResponsibilityCd(responsibilityCd);

        return details.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 책무세부 수정
     *
     * @param responsibilityDetailCd 책무세부코드
     * @param request 수정 요청 DTO
     * @param username 수정자 사용자명
     * @return 수정된 책무세부 DTO
     */
    @Transactional
    public ResponsibilityDetailDto updateDetail(String responsibilityDetailCd, UpdateResponsibilityDetailRequest request, String username) {
        log.debug("[ResponsibilityDetailService] 책무세부 수정 요청 - responsibilityDetailCd: {}, username: {}",
            responsibilityDetailCd, username);

        // 기존 책무세부 조회
        ResponsibilityDetail detail = responsibilityDetailRepository.findById(responsibilityDetailCd)
            .orElseThrow(() -> new IllegalArgumentException("책무세부를 찾을 수 없습니다. CODE: " + responsibilityDetailCd));

        // 수정 가능한 필드 업데이트
        detail.setResponsibilityDetailInfo(request.getResponsibilityDetailInfo());
        detail.setIsActive(request.getIsActive());
        detail.setUpdatedBy(username);

        // 저장
        ResponsibilityDetail updated = responsibilityDetailRepository.save(detail);
        log.info("[ResponsibilityDetailService] 책무세부 수정 완료 - responsibilityDetailCd: {}", updated.getResponsibilityDetailCd());

        // DTO 변환 후 반환
        return convertToDto(updated);
    }

    /**
     * 책무세부 삭제
     *
     * @param responsibilityDetailCd 책무세부코드
     */
    @Transactional
    public void deleteDetail(String responsibilityDetailCd) {
        log.debug("[ResponsibilityDetailService] 책무세부 삭제 요청 - responsibilityDetailCd: {}", responsibilityDetailCd);

        if (!responsibilityDetailRepository.existsById(responsibilityDetailCd)) {
            throw new IllegalArgumentException("책무세부를 찾을 수 없습니다. CODE: " + responsibilityDetailCd);
        }

        responsibilityDetailRepository.deleteById(responsibilityDetailCd);
        log.info("[ResponsibilityDetailService] 책무세부 삭제 완료 - responsibilityDetailCd: {}", responsibilityDetailCd);
    }

    /**
     * 책무코드로 모든 책무세부 삭제
     *
     * @param responsibilityCd 책무코드
     */
    @Transactional
    public void deleteByResponsibilityCd(String responsibilityCd) {
        log.debug("[ResponsibilityDetailService] 책무의 모든 세부 삭제 - responsibilityCd: {}", responsibilityCd);

        responsibilityDetailRepository.deleteByResponsibility_ResponsibilityCd(responsibilityCd);
        log.info("[ResponsibilityDetailService] 책무의 모든 세부 삭제 완료 - responsibilityCd: {}", responsibilityCd);
    }

    /**
     * Entity → DTO 변환
     * - 책무내용(responsibilityInfo) 포함
     *
     * @param detail 책무세부 엔티티
     * @return 책무세부 DTO
     */
    private ResponsibilityDetailDto convertToDto(ResponsibilityDetail detail) {
        // 책무내용 조회
        String responsibilityInfo = "";
        if (detail.getResponsibility() != null) {
            responsibilityInfo = detail.getResponsibility().getResponsibilityInfo();
        }

        return ResponsibilityDetailDto.builder()
            .responsibilityDetailCd(detail.getResponsibilityDetailCd())
            .responsibilityCd(detail.getResponsibilityCd())
            .responsibilityInfo(responsibilityInfo)
            .responsibilityDetailInfo(detail.getResponsibilityDetailInfo())
            .isActive(detail.getIsActive())
            .createdAt(detail.getCreatedAt())
            .createdBy(detail.getCreatedBy())
            .updatedAt(detail.getUpdatedAt())
            .updatedBy(detail.getUpdatedBy())
            .build();
    }
}
