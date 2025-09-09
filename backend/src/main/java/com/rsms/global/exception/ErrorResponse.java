package com.rsms.global.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 에러 응답 DTO
 * API 에러 발생 시 클라이언트에게 반환되는 표준 에러 형식
 */
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String code,
    String message,
    String path,
    Map<String, String> validationErrors
) {
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private LocalDateTime timestamp;
        private int status;
        private String error;
        private String code;
        private String message;
        private String path;
        private Map<String, String> validationErrors;
        
        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public Builder status(int status) {
            this.status = status;
            return this;
        }
        
        public Builder error(String error) {
            this.error = error;
            return this;
        }
        
        public Builder code(String code) {
            this.code = code;
            return this;
        }
        
        public Builder message(String message) {
            this.message = message;
            return this;
        }
        
        public Builder path(String path) {
            this.path = path;
            return this;
        }
        
        public Builder validationErrors(Map<String, String> validationErrors) {
            this.validationErrors = validationErrors;
            return this;
        }
        
        public ErrorResponse build() {
            return new ErrorResponse(timestamp, status, error, code, message, path, validationErrors);
        }
    }
}