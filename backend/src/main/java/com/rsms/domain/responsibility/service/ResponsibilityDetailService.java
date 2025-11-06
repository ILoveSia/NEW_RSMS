package com.rsms.domain.responsibility.service;

import com.rsms.domain.responsibility.dto.CreateResponsibilityDetailRequest;
import com.rsms.domain.responsibility.dto.ResponsibilityDetailDto;
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

    // ===============================
    // 코드 자동 생성 로직
    // ===============================

    /**
     * 책무세부코드 자동 생성
     * - 코드 생성 규칙: 책무코드 뒷 9자리 + "D" + 순번(4자리)
     * - 예시: "RM0001D0001" = "RM0001"(책무코드 suffix) + "D" + "0001"(순번)
     *
     * @param responsibilityCd 책무코드 (예: "20250001RM0001")
     * @return 생성된 책무세부코드 (예: "RM0001D0001")
     */
    private String generateDetailCode(String responsibilityCd) {
        log.debug("[ResponsibilityDetailService] 책무세부코드 생성 시작 - responsibilityCd: {}", responsibilityCd);

        // 1. 책무코드에서 suffix 추출 (뒷 9자리)
        // 예: "20250001RM0001" → "RM0001" (9자리가 아닐 수도 있으므로 실제 코드 길이 확인)
        String suffix = responsibilityCd.length() >= 9
            ? responsibilityCd.substring(responsibilityCd.length() - 9)
            : responsibilityCd;

        // 2. prefix 길이 계산 (suffix + "D" = prefixLength)
        int prefixLength = suffix.length() + 1;  // "RM0001D"의 길이 = 7

        // 3. 최대 순번 조회
        Integer maxSeq = responsibilityDetailRepository.findMaxSequenceByResponsibilityCd(
            responsibilityCd, prefixLength);

        // 4. 다음 순번 계산
        int nextSeq = (maxSeq != null ? maxSeq : 0) + 1;

        // 5. 4자리 순번으로 포맷팅
        String formattedSeq = String.format("%04d", nextSeq);

        // 6. 코드 조합: suffix + "D" + 순번
        String code = suffix + "D" + formattedSeq;

        log.debug("[ResponsibilityDetailService] 책무세부코드 생성 완료 - responsibilityCd: {}, suffix: {}, seq: {} -> code: {}",
                  responsibilityCd, suffix, nextSeq, code);

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

        // 책무세부코드 자동 생성
        String generatedCode = generateDetailCode(request.getResponsibilityCd());

        // 책무세부 엔티티 생성
        ResponsibilityDetail detail = ResponsibilityDetail.builder()
            .responsibilityDetailCd(generatedCode)  // 자동 생성된 코드 사용
            .responsibilityCd(request.getResponsibilityCd())
            .responsibilityDetailInfo(request.getResponsibilityDetailInfo())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        // 저장
        ResponsibilityDetail saved = responsibilityDetailRepository.save(detail);
        log.info("[ResponsibilityDetailService] 책무세부 생성 완료 - responsibilityDetailCd: {}", saved.getResponsibilityDetailCd());

        // DTO 변환 후 반환
        return convertToDto(saved);
    }

    /**
     * 책무코드로 책무세부 목록 조회
     *
     * @param responsibilityCd 책무코드
     * @return 책무세부 DTO 리스트
     */
    public List<ResponsibilityDetailDto> findByResponsibilityCd(String responsibilityCd) {
        log.debug("[ResponsibilityDetailService] 책무세부 조회 - responsibilityCd: {}", responsibilityCd);

        List<ResponsibilityDetail> details = responsibilityDetailRepository.findByResponsibilityCd(responsibilityCd);

        return details.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
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

        responsibilityDetailRepository.deleteByResponsibilityCd(responsibilityCd);
        log.info("[ResponsibilityDetailService] 책무의 모든 세부 삭제 완료 - responsibilityCd: {}", responsibilityCd);
    }

    /**
     * Entity → DTO 변환
     *
     * @param detail 책무세부 엔티티
     * @return 책무세부 DTO
     */
    private ResponsibilityDetailDto convertToDto(ResponsibilityDetail detail) {
        return ResponsibilityDetailDto.builder()
            .responsibilityDetailCd(detail.getResponsibilityDetailCd())
            .responsibilityCd(detail.getResponsibilityCd())
            .responsibilityDetailInfo(detail.getResponsibilityDetailInfo())
            .isActive(detail.getIsActive())
            .createdAt(detail.getCreatedAt())
            .createdBy(detail.getCreatedBy())
            .updatedAt(detail.getUpdatedAt())
            .updatedBy(detail.getUpdatedBy())
            .build();
    }
}
