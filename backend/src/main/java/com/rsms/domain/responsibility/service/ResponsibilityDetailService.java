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

    /**
     * 책무세부 생성
     * - 책무에 대한 세부내용을 개별 저장
     *
     * @param request 책무세부 생성 요청 DTO
     * @param username 생성자 사용자명
     * @return 생성된 책무세부 DTO
     */
    @Transactional
    public ResponsibilityDetailDto createDetail(CreateResponsibilityDetailRequest request, String username) {
        log.debug("[ResponsibilityDetailService] 책무세부 생성 요청 - responsibilityId: {}, username: {}",
            request.getResponsibilityId(), username);

        // 책무세부 엔티티 생성
        ResponsibilityDetail detail = ResponsibilityDetail.builder()
            .responsibilityId(request.getResponsibilityId())
            .responsibilityDetailInfo(request.getResponsibilityDetailInfo())
            .isActive(request.getIsActive() != null ? request.getIsActive() : "Y")
            .createdBy(username)
            .updatedBy(username)
            .build();

        // 저장
        ResponsibilityDetail saved = responsibilityDetailRepository.save(detail);
        log.info("[ResponsibilityDetailService] 책무세부 생성 완료 - responsibilityDetailId: {}", saved.getResponsibilityDetailId());

        // DTO 변환 후 반환
        return convertToDto(saved);
    }

    /**
     * 책무ID로 책무세부 목록 조회
     *
     * @param responsibilityId 책무ID
     * @return 책무세부 DTO 리스트
     */
    public List<ResponsibilityDetailDto> findByResponsibilityId(Long responsibilityId) {
        log.debug("[ResponsibilityDetailService] 책무세부 조회 - responsibilityId: {}", responsibilityId);

        List<ResponsibilityDetail> details = responsibilityDetailRepository.findByResponsibilityId(responsibilityId);

        return details.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * 책무세부 삭제
     *
     * @param responsibilityDetailId 책무세부ID
     */
    @Transactional
    public void deleteDetail(Long responsibilityDetailId) {
        log.debug("[ResponsibilityDetailService] 책무세부 삭제 요청 - responsibilityDetailId: {}", responsibilityDetailId);

        if (!responsibilityDetailRepository.existsById(responsibilityDetailId)) {
            throw new IllegalArgumentException("책무세부를 찾을 수 없습니다. ID: " + responsibilityDetailId);
        }

        responsibilityDetailRepository.deleteById(responsibilityDetailId);
        log.info("[ResponsibilityDetailService] 책무세부 삭제 완료 - responsibilityDetailId: {}", responsibilityDetailId);
    }

    /**
     * 책무ID로 모든 책무세부 삭제
     *
     * @param responsibilityId 책무ID
     */
    @Transactional
    public void deleteByResponsibilityId(Long responsibilityId) {
        log.debug("[ResponsibilityDetailService] 책무의 모든 세부 삭제 - responsibilityId: {}", responsibilityId);

        responsibilityDetailRepository.deleteByResponsibilityId(responsibilityId);
        log.info("[ResponsibilityDetailService] 책무의 모든 세부 삭제 완료 - responsibilityId: {}", responsibilityId);
    }

    /**
     * Entity → DTO 변환
     *
     * @param detail 책무세부 엔티티
     * @return 책무세부 DTO
     */
    private ResponsibilityDetailDto convertToDto(ResponsibilityDetail detail) {
        return ResponsibilityDetailDto.builder()
            .responsibilityDetailId(detail.getResponsibilityDetailId())
            .responsibilityId(detail.getResponsibilityId())
            .responsibilityDetailInfo(detail.getResponsibilityDetailInfo())
            .isActive(detail.getIsActive())
            .createdAt(detail.getCreatedAt())
            .createdBy(detail.getCreatedBy())
            .updatedAt(detail.getUpdatedAt())
            .updatedBy(detail.getUpdatedBy())
            .build();
    }
}
