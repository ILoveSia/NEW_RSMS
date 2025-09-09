package com.rsms.interfaces.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 공통 API 응답 DTO
 * 모든 REST API 응답의 표준 형식을 제공
 * 
 * @param <T> 응답 데이터 타입
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    /**
     * 응답 성공 여부
     */
    private final boolean success;
    
    /**
     * 응답 메시지
     */
    private final String message;
    
    /**
     * 응답 데이터
     */
    private final T data;
    
    /**
     * 에러 정보 (실패 시에만 포함)
     */
    private final ErrorInfo error;
    
    /**
     * 응답 생성 시각
     */
    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();
    
    /**
     * 성공 응답 생성 (데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message("Success")
            .data(data)
            .build();
    }
    
    /**
     * 성공 응답 생성 (메시지와 데이터 포함)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .build();
    }
    
    /**
     * 성공 응답 생성 (메시지만)
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .build();
    }
    
    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> fail(String message) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .build();
    }
    
    /**
     * 실패 응답 생성 (에러 정보 포함)
     */
    public static <T> ApiResponse<T> fail(String message, ErrorInfo error) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .error(error)
            .build();
    }
    
    /**
     * 에러 정보 내부 클래스
     */
    @Getter
    @Builder
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorInfo {
        
        /**
         * 에러 코드
         */
        private final String code;
        
        /**
         * 에러 세부 메시지
         */
        private final String details;
        
        /**
         * 유효성 검사 에러 목록
         */
        private final List<ValidationError> validationErrors;
        
        /**
         * 유효성 검사 에러 내부 클래스
         */
        @Getter
        @Builder
        @AllArgsConstructor
        public static class ValidationError {
            /**
             * 필드명
             */
            private final String field;
            
            /**
             * 거부된 값
             */
            private final Object rejectedValue;
            
            /**
             * 에러 메시지
             */
            private final String message;
        }
    }
}