package com.rsms.interfaces.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 페이징 응답 DTO
 * Spring Data Page를 래핑하여 일관된 페이징 응답 형식 제공
 * 
 * @param <T> 페이징 데이터 타입
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Builder
@AllArgsConstructor
public class PageResponse<T> {
    
    /**
     * 페이징 데이터 목록
     */
    private final List<T> content;
    
    /**
     * 페이징 메타데이터
     */
    private final PageInfo pageInfo;
    
    /**
     * Spring Data Page로부터 PageResponse 생성
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
            .content(page.getContent())
            .pageInfo(PageInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .numberOfElements(page.getNumberOfElements())
                .empty(page.isEmpty())
                .build())
            .build();
    }
    
    /**
     * 페이징 메타데이터 내부 클래스
     */
    @Getter
    @Builder
    @AllArgsConstructor
    public static class PageInfo {
        
        /**
         * 현재 페이지 번호 (0부터 시작)
         */
        private final int page;
        
        /**
         * 페이지 크기
         */
        private final int size;
        
        /**
         * 전체 요소 개수
         */
        private final long totalElements;
        
        /**
         * 전체 페이지 개수
         */
        private final int totalPages;
        
        /**
         * 첫 번째 페이지 여부
         */
        private final boolean first;
        
        /**
         * 마지막 페이지 여부
         */
        private final boolean last;
        
        /**
         * 현재 페이지 요소 개수
         */
        private final int numberOfElements;
        
        /**
         * 빈 페이지 여부
         */
        private final boolean empty;
    }
}