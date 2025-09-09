package com.rsms.interfaces.common;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * 기본 DTO 클래스
 * 모든 DTO의 공통 필드를 제공
 * 
 * @author RSMS Development Team
 * @since 1.0
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseDto {
    
    /**
     * 엔티티 ID
     */
    private Long id;
    
    /**
     * 생성 시각
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    /**
     * 수정 시각
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    /**
     * 생성자
     */
    private String createdBy;
    
    /**
     * 최종 수정자
     */
    private String lastModifiedBy;
    
    /**
     * 활성 상태
     */
    private Boolean active;
    
    /**
     * 버전 (낙관적 잠금)
     */
    private Long version;
}