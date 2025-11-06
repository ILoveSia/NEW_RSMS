# 🌐 API Development Standards

**REST API 설계 및 개발 표준 가이드**

---

## 📋 목차

1. [API 설계 원칙](#api-설계-원칙)
2. [URL 설계 가이드](#url-설계-가이드)
3. [HTTP 메서드 사용법](#http-메서드-사용법)
4. [Status Code 가이드](#status-code-가이드)
5. [Request/Response 설계](#requestresponse-설계)
6. [에러 처리 표준](#에러-처리-표준)
7. [인증/인가 가이드](#인증인가-가이드)
8. [API 버전 관리](#api-버전-관리)
9. [문서화 가이드](#문서화-가이드)
10. [성능 최적화](#성능-최적화)

---

## API 설계 원칙

### 1. RESTful Design Principles

#### Resource-Oriented Design
```http
# ✅ 좋은 예시 - 리소스 중심
GET    /api/v1/entities                 # 엔티티 목록
POST   /api/v1/entities                 # 엔티티 생성
GET    /api/v1/entities/{id}            # 특정 엔티티 조회
PUT    /api/v1/entities/{id}            # 엔티티 전체 수정
PATCH  /api/v1/entities/{id}            # 엔티티 부분 수정
DELETE /api/v1/entities/{id}            # 엔티티 삭제

# ❌ 잘못된 예시 - 동사 중심
POST   /api/v1/createEntity
POST   /api/v1/updateEntity
POST   /api/v1/deleteEntity
```

#### Hierarchical Resource Structure
```http
# 주 리소스와 하위 리소스
GET    /api/v1/entities/{id}/items      # 엔티티의 아이템 목록
POST   /api/v1/entities/{id}/items      # 엔티티 아이템 생성
GET    /api/v1/entities/{id}/items/{itemId}  # 특정 아이템 조회

GET    /api/v1/users/{id}/permissions   # 사용자 권한 목록
POST   /api/v1/users/{id}/roles         # 사용자 역할 할당

GET    /api/v1/reports/{id}/exports     # 보고서 내보내기 목록
POST   /api/v1/reports/{id}/exports     # 보고서 내보내기 생성
```

### 2. Consistency Principles

#### 명명 규칙 일관성
```http
# ✅ 일관된 명명 (복수형 사용)
/api/v1/entities
/api/v1/users  
/api/v1/reports
/api/v1/dashboards

# ❌ 일관성 없는 명명
/api/v1/entity    # 단수형
/api/v1/user      # 단수형
/api/v1/reports   # 복수형
/api/v1/dashboard # 단수형
```

#### URL Case Convention
```http
# ✅ kebab-case 사용
/api/v1/entity-categories
/api/v1/user-profiles
/api/v1/audit-logs

# ❌ 다른 케이스 혼재
/api/v1/entityCategories  # camelCase
/api/v1/user_profiles     # snake_case
```

---

## URL 설계 가이드

### 1. Base URL Structure
```http
# Production
https://api.example.com/v1/

# Staging  
https://staging-api.example.com/v1/

# Development
http://localhost:8090/api/v1/
```

### 2. Resource Naming Guidelines

#### 리소스 계층 구조
```http
# 1차 리소스 (Primary Resources)
/api/v1/entities              # 엔티티 관리
/api/v1/users                 # 사용자 관리
/api/v1/roles                 # 역할 관리
/api/v1/reports               # 보고서 관리
/api/v1/dashboards            # 대시보드 관리
/api/v1/notifications         # 알림 관리

# 2차 리소스 (Sub Resources)
/api/v1/entities/{id}/items        # 엔티티 아이템
/api/v1/entities/{id}/comments     # 엔티티 댓글
/api/v1/entities/{id}/attachments  # 엔티티 첨부파일
/api/v1/users/{id}/permissions     # 사용자 권한
/api/v1/reports/{id}/exports       # 보고서 내보내기
```

#### Query Parameters
```http
# 필터링
GET /api/v1/entities?category=OPERATIONAL&status=ACTIVE
GET /api/v1/users?role=ENTITY_MANAGER&enabled=true

# 정렬
GET /api/v1/entities?sort=createdAt,desc
GET /api/v1/entities?sort=priority,desc&sort=title,asc

# 페이징
GET /api/v1/entities?page=0&size=20
GET /api/v1/entities?offset=0&limit=20

# 검색
GET /api/v1/entities?search=server%20configuration
GET /api/v1/users?q=john.doe

# 필드 선택
GET /api/v1/entities?fields=id,title,category,priority
GET /api/v1/users?fields=id,username,email,enabled

# 관계 포함
GET /api/v1/entities?include=owner,items
GET /api/v1/users?expand=roles,permissions
```

### 3. Special Endpoints

#### Collection Operations
```http
# 대량 작업
POST   /api/v1/entities/bulk                 # 대량 생성
PATCH  /api/v1/entities/bulk                 # 대량 수정
DELETE /api/v1/entities/bulk                 # 대량 삭제

# 검색 엔드포인트
GET    /api/v1/entities/search               # 고급 검색
POST   /api/v1/entities/search               # 복잡한 검색 조건

# 통계/집계
GET    /api/v1/entities/statistics           # 엔티티 통계
GET    /api/v1/entities/summary              # 엔티티 요약
```

#### Custom Actions
```http
# 비즈니스 액션 (동사형 허용)
POST   /api/v1/entities/{id}/approve         # 엔티티 승인
POST   /api/v1/entities/{id}/reject          # 엔티티 거부
POST   /api/v1/entities/{id}/archive         # 엔티티 아카이브
POST   /api/v1/users/{id}/activate           # 사용자 활성화
POST   /api/v1/users/{id}/deactivate         # 사용자 비활성화
POST   /api/v1/reports/{id}/generate         # 보고서 생성
```

---

## HTTP 메서드 사용법

### 1. Standard HTTP Methods

#### GET - 조회
```java
@GetMapping("/api/v1/entities")
public ResponseEntity<Page<EntityResponse>> getEntities(
        @PageableDefault(size = 20) Pageable pageable,
        @RequestParam(required = false) EntityCategory category,
        @RequestParam(required = false) EntityStatus status,
        @RequestParam(required = false) String search) {
    
    EntitySearchCriteria criteria = EntitySearchCriteria.builder()
        .category(category)
        .status(status) 
        .searchKeyword(search)
        .build();
        
    Page<EntityResponse> entities = entityService.searchEntities(criteria, pageable);
    return ResponseEntity.ok(entities);
}

@GetMapping("/api/v1/entities/{id}")
public ResponseEntity<EntityResponse> getEntity(@PathVariable Long id) {
    EntityResponse entity = entityService.getEntity(id);
    return ResponseEntity.ok(entity);
}
```

#### POST - 생성
```java
@PostMapping("/api/v1/entities")
@PreAuthorize("hasRole('ENTITY_MANAGER')")
public ResponseEntity<EntityResponse> createEntity(
        @Valid @RequestBody CreateEntityRequest request,
        Authentication authentication) {
    
    EntityResponse response = entityService.createEntity(request);
    
    URI location = ServletUriComponentsBuilder
        .fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(response.getId())
        .toUri();
        
    return ResponseEntity.created(location).body(response);
}
```

#### PUT - 전체 수정
```java
@PutMapping("/api/v1/entities/{id}")
@PreAuthorize("@entitySecurityService.canModifyEntity(#id, authentication.name)")
public ResponseEntity<EntityResponse> updateEntity(
        @PathVariable Long id,
        @Valid @RequestBody UpdateEntityRequest request) {
    
    EntityResponse response = entityService.updateEntity(id, request);
    return ResponseEntity.ok(response);
}
```

#### PATCH - 부분 수정
```java
@PatchMapping("/api/v1/entities/{id}")
@PreAuthorize("@entitySecurityService.canModifyEntity(#id, authentication.name)")
public ResponseEntity<EntityResponse> partialUpdateEntity(
        @PathVariable Long id,
        @Valid @RequestBody PatchEntityRequest request) {
    
    EntityResponse response = entityService.partialUpdateEntity(id, request);
    return ResponseEntity.ok(response);
}

// PATCH Request DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatchEntityRequest {
    
    @Size(max = 200)
    private Optional<String> title = Optional.empty();
    
    private Optional<String> description = Optional.empty();
    
    private Optional<EntityCategory> category = Optional.empty();
    
    @Range(min = 1, max = 5)
    private Optional<Integer> priority = Optional.empty();
    
    @Range(min = 1, max = 5)
    private Optional<Integer> importance = Optional.empty();
    
    private Optional<EntityStatus> status = Optional.empty();
}
```

#### DELETE - 삭제
```java
@DeleteMapping("/api/v1/entities/{id}")
@PreAuthorize("@entitySecurityService.canDeleteEntity(#id, authentication.name)")
public ResponseEntity<Void> deleteEntity(@PathVariable Long id) {
    entityService.deleteEntity(id);
    return ResponseEntity.noContent().build();
}

// 소프트 삭제의 경우
@DeleteMapping("/api/v1/entities/{id}")
public ResponseEntity<EntityResponse> softDeleteEntity(@PathVariable Long id) {
    EntityResponse response = entityService.softDeleteEntity(id);
    return ResponseEntity.ok(response);  // 삭제된 리소스 정보 반환
}
```

### 2. Idempotency

#### 멱등성 보장
```java
// PUT과 DELETE는 멱등성 보장
@PutMapping("/api/v1/entities/{id}")
public ResponseEntity<EntityResponse> updateEntity(@PathVariable Long id, @RequestBody UpdateEntityRequest request) {
    // 동일한 요청을 여러 번 실행해도 결과가 같음
    EntityResponse response = entityService.updateEntity(id, request);
    return ResponseEntity.ok(response);
}

// POST는 비멱등적 (Idempotency-Key 헤더로 멱등성 보장 가능)
@PostMapping("/api/v1/entities")
public ResponseEntity<EntityResponse> createEntity(
        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
        @RequestBody CreateEntityRequest request) {
    
    if (idempotencyKey != null) {
        // 중복 요청 체크
        Optional<EntityResponse> existing = entityService.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }
    }
    
    EntityResponse response = entityService.createEntity(request, idempotencyKey);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

---

## Status Code 가이드

### 1. Success Codes (2xx)

```java
public class ApiStatusCodes {
    
    // 200 OK - 성공적인 GET, PUT, PATCH 요청
    @GetMapping("/{id}")
    public ResponseEntity<EntityResponse> getEntity(@PathVariable Long id) {
        return ResponseEntity.ok(entityService.getEntity(id));  // 200
    }
    
    // 201 Created - 성공적인 POST 요청 (리소스 생성)
    @PostMapping
    public ResponseEntity<EntityResponse> createEntity(@RequestBody CreateEntityRequest request) {
        EntityResponse response = entityService.createEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);  // 201
    }
    
    // 202 Accepted - 비동기 처리 시작
    @PostMapping("/bulk")
    public ResponseEntity<BulkOperationResponse> bulkCreateEntities(
            @RequestBody List<CreateEntityRequest> requests) {
        
        BulkOperationResponse response = entityService.bulkCreateAsync(requests);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);  // 202
    }
    
    // 204 No Content - 성공적인 DELETE 또는 내용 없는 응답
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable Long id) {
        entityService.deleteEntity(id);
        return ResponseEntity.noContent().build();  // 204
    }
}
```

### 2. Client Error Codes (4xx)

```java
// 400 Bad Request - 잘못된 요청 구문
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
    List<FieldError> fieldErrors = ex.getBindingResult().getFieldErrors();
    
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.BAD_REQUEST.value())
        .error("Validation Failed")
        .message("요청 데이터 검증에 실패했습니다")
        .errors(fieldErrors.stream()
            .map(fe -> ValidationError.of(fe.getField(), fe.getDefaultMessage()))
            .collect(Collectors.toList()))
        .timestamp(LocalDateTime.now())
        .path(request.getRequestURI())
        .build();
        
    return ResponseEntity.badRequest().body(error);  // 400
}

// 401 Unauthorized - 인증 실패
@ExceptionHandler(AuthenticationException.class)
public ResponseEntity<ErrorResponse> handleAuthenticationError(AuthenticationException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.UNAUTHORIZED.value())
        .error("Authentication Failed")
        .message("인증이 필요합니다")
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);  // 401
}

// 403 Forbidden - 인가 실패
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.FORBIDDEN.value())
        .error("Access Denied")
        .message("이 리소스에 접근할 권한이 없습니다")
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);  // 403
}

// 404 Not Found - 리소스 없음
@ExceptionHandler(EntityNotFoundException.class)
public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.NOT_FOUND.value())
        .error("Resource Not Found")
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);  // 404
}

// 409 Conflict - 리소스 충돌
@ExceptionHandler(ConflictException.class)
public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.CONFLICT.value())
        .error("Resource Conflict")
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.CONFLICT).body(error);  // 409
}

// 422 Unprocessable Entity - 비즈니스 규칙 위반
@ExceptionHandler(BusinessRuleException.class)
public ResponseEntity<ErrorResponse> handleBusinessRuleViolation(BusinessRuleException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
        .error("Business Rule Violation")
        .message(ex.getMessage())
        .code(ex.getErrorCode())
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);  // 422
}

// 429 Too Many Requests - 율제한 초과
@ExceptionHandler(RateLimitExceededException.class)
public ResponseEntity<ErrorResponse> handleRateLimit(RateLimitExceededException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.TOO_MANY_REQUESTS.value())
        .error("Rate Limit Exceeded")
        .message("요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요")
        .retryAfter(ex.getRetryAfter())
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header("Retry-After", String.valueOf(ex.getRetryAfter()))
        .body(error);  // 429
}
```

### 3. Server Error Codes (5xx)

```java
// 500 Internal Server Error - 서버 내부 오류
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleInternalError(Exception ex, HttpServletRequest request) {
    String correlationId = UUID.randomUUID().toString();
    
    log.error("Internal server error occurred. CorrelationId: {}", correlationId, ex);
    
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .error("Internal Server Error")
        .message("서버 내부 오류가 발생했습니다")
        .correlationId(correlationId)
        .timestamp(LocalDateTime.now())
        .path(request.getRequestURI())
        .build();
        
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);  // 500
}

// 502 Bad Gateway - 외부 서비스 오류
@ExceptionHandler(ExternalServiceException.class)
public ResponseEntity<ErrorResponse> handleExternalServiceError(ExternalServiceException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.BAD_GATEWAY.value())
        .error("External Service Error")
        .message("외부 서비스 연동 중 오류가 발생했습니다")
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);  // 502
}

// 503 Service Unavailable - 서비스 이용 불가
@ExceptionHandler(ServiceUnavailableException.class)
public ResponseEntity<ErrorResponse> handleServiceUnavailable(ServiceUnavailableException ex) {
    ErrorResponse error = ErrorResponse.builder()
        .status(HttpStatus.SERVICE_UNAVAILABLE.value())
        .error("Service Unavailable")
        .message("서비스를 일시적으로 이용할 수 없습니다")
        .retryAfter(300)  // 5분 후 재시도
        .timestamp(LocalDateTime.now())
        .build();
        
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .header("Retry-After", "300")
        .body(error);  // 503
}
```

---

## Request/Response 설계

### 1. Request DTO Standards

#### 기본 구조
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateEntityRequest {
    
    @NotBlank(message = "엔티티 제목은 필수입니다")
    @Size(min = 1, max = 200, message = "제목은 1-200자 사이여야 합니다")
    private String title;
    
    @Size(max = 2000, message = "설명은 2000자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "엔티티 카테고리는 필수입니다")
    @Valid
    private EntityCategory category;
    
    @NotNull(message = "우선순위는 필수입니다")
    @Range(min = 1, max = 5, message = "우선순위는 1-5 범위여야 합니다")
    private Integer priority;
    
    @NotNull(message = "중요도는 필수입니다")
    @Range(min = 1, max = 5, message = "중요도는 1-5 범위여야 합니다")
    private Integer importance;
    
    @Valid
    @Size(max = 10, message = "초기 아이템은 최대 10개까지 가능합니다")
    private List<CreateEntityItemRequest> initialItems;
    
    @JsonProperty("due_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    
    // 중첩 객체 검증
    @Valid
    private ContactInfo contactInfo;
}

// 중첩 객체
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInfo {
    
    @Email(message = "올바른 이메일 형식이어야 합니다")
    private String email;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "올바른 전화번호 형식이어야 합니다")
    private String phone;
}
```

#### Search/Filter Request
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EntitySearchRequest {
    
    // 기본 필터
    private EntityCategory category;
    private EntityStatus status;
    private Integer minPriorityScore;
    private Integer maxPriorityScore;
    
    // 날짜 범위 필터
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdFrom;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdTo;
    
    // 텍스트 검색
    @Size(min = 2, max = 100, message = "검색어는 2-100자 사이여야 합니다")
    private String searchKeyword;
    
    // 소유자 필터
    private List<Long> ownerIds;
    
    // 태그 필터
    private List<String> tags;
    
    // 정렬 옵션
    private List<SortOption> sortOptions;
    
    // 고급 필터
    private Map<String, Object> advancedFilters;
}

@Data
@Builder
public class SortOption {
    
    @NotBlank
    private String field;
    
    @Builder.Default
    private SortDirection direction = SortDirection.ASC;
}

public enum SortDirection {
    ASC, DESC
}
```

### 2. Response DTO Standards

#### 기본 구조
```java
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EntityResponse {
    
    private Long id;
    private String title;
    private String description;
    private EntityCategory category;
    private EntityStatus status;
    private Integer priority;
    private Integer importance;
    private Integer totalScore;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    
    // 연관 객체는 Summary 형태로
    private UserSummaryResponse owner;
    private UserSummaryResponse createdBy;
    
    // 컬렉션 연관객체
    private List<EntityItemResponse> items;
    private List<String> tags;
    
    // 계산된 필드
    @JsonProperty("is_high_priority")
    private Boolean isHighPriority;
    
    @JsonProperty("days_since_creation")
    private Long daysSinceCreation;
    
    // 권한 정보
    private PermissionInfo permissions;
    
    public static EntityResponse from(Entity entity) {
        return EntityResponse.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .category(entity.getCategory())
            .status(entity.getStatus())
            .priority(entity.getPriority())
            .importance(entity.getImportance())
            .totalScore(entity.getTotalScore())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .dueDate(entity.getDueDate())
            .owner(entity.getOwner() != null ? UserSummaryResponse.from(entity.getOwner()) : null)
            .createdBy(UserSummaryResponse.from(entity.getCreatedBy()))
            .items(entity.getItems().stream()
                .map(EntityItemResponse::from)
                .collect(Collectors.toList()))
            .tags(new ArrayList<>(entity.getTags()))
            .isHighPriority(entity.isHighPriority())
            .daysSinceCreation(ChronoUnit.DAYS.between(entity.getCreatedAt().toLocalDate(), LocalDate.now()))
            .build();
    }
}

// Summary 응답 (성능 최적화용)
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EntitySummaryResponse {
    private Long id;
    private String title;
    private EntityCategory category;
    private EntityStatus status;
    private Integer totalScore;
    private LocalDateTime createdAt;
    private UserSummaryResponse owner;
}

// 사용자 요약 정보
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class UserSummaryResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    
    public static UserSummaryResponse from(User user) {
        return UserSummaryResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .build();
    }
}

// 권한 정보
@Data
@Builder
public class PermissionInfo {
    private Boolean canEdit;
    private Boolean canDelete;
    private Boolean canApprove;
    private Boolean canComment;
}
```

#### 페이징 응답
```java
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class PageResponse<T> {
    
    private List<T> content;
    private PageInfo page;
    private SortInfo sort;
    
    @Data
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class PageInfo {
        private Integer number;
        private Integer size;
        private Long totalElements;
        private Integer totalPages;
        private Boolean first;
        private Boolean last;
        private Boolean empty;
        private Integer numberOfElements;
    }
    
    @Data
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class SortInfo {
        private Boolean sorted;
        private List<SortDetail> orders;
        
        @Data
        @Builder
        public static class SortDetail {
            private String property;
            private String direction;
        }
    }
    
    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
            .content(page.getContent())
            .page(PageInfo.builder()
                .number(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .numberOfElements(page.getNumberOfElements())
                .build())
            .sort(SortInfo.builder()
                .sorted(page.getSort().isSorted())
                .orders(page.getSort().stream()
                    .map(order -> SortInfo.SortDetail.builder()
                        .property(order.getProperty())
                        .direction(order.getDirection().name())
                        .build())
                    .collect(Collectors.toList()))
                .build())
            .build();
    }
}

// 사용 예시
@GetMapping
public ResponseEntity<PageResponse<EntitySummaryResponse>> getEntities(
        @PageableDefault(size = 20) Pageable pageable,
        EntitySearchRequest searchRequest) {
    
    Page<EntitySummaryResponse> entities = entityService.searchEntities(searchRequest, pageable);
    PageResponse<EntitySummaryResponse> response = PageResponse.from(entities);
    
    return ResponseEntity.ok(response);
}
```

### 3. Response Wrapper Standards

#### API Response 표준 형식
```java
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ApiResponse<T> {
    
    private Boolean success;
    private String message;
    private T data;
    private ApiMeta meta;
    private LocalDateTime timestamp;
    
    @Data
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ApiMeta {
        private String version;
        private String correlationId;
        private Long processingTime;
        private Integer rateLimitRemaining;
        private Long rateLimitReset;
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .message("요청이 성공적으로 처리되었습니다")
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
            .success(false)
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
    }
}

// Controller에서 사용
@RestController
@RequestMapping("/api/v1/entities")
public class EntityController {
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EntityResponse>> getEntity(@PathVariable Long id) {
        EntityResponse entity = entityService.getEntity(id);
        ApiResponse<EntityResponse> response = ApiResponse.success(entity, "엔티티 조회 완료");
        
        return ResponseEntity.ok(response);
    }
}
```

---

## 에러 처리 표준

### 1. 에러 응답 구조

#### 표준 에러 응답
```java
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ErrorResponse {
    
    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;
    private String method;
    private String correlationId;
    
    // 비즈니스 에러 코드
    private String code;
    
    // 검증 에러 상세정보
    private List<ValidationError> errors;
    
    // 재시도 정보
    private Integer retryAfter;
    private String retryAdvice;
    
    // 도움말 링크
    private String helpUrl;
    
    @Data
    @Builder
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ValidationError {
        private String field;
        private Object rejectedValue;
        private String message;
        private String code;
        
        public static ValidationError of(String field, String message) {
            return ValidationError.builder()
                .field(field)
                .message(message)
                .build();
        }
        
        public static ValidationError of(FieldError fieldError) {
            return ValidationError.builder()
                .field(fieldError.getField())
                .rejectedValue(fieldError.getRejectedValue())
                .message(fieldError.getDefaultMessage())
                .code(fieldError.getCode())
                .build();
        }
    }
}
```

### 2. Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        
        List<ValidationError> validationErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(ValidationError::of)
            .collect(Collectors.toList());
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Validation Failed")
            .message("입력 데이터 검증에 실패했습니다")
            .path(request.getRequestURI())
            .method(request.getMethod())
            .correlationId(getCorrelationId(request))
            .code("VALIDATION_FAILED")
            .errors(validationErrors)
            .helpUrl("https://api-docs.rsms.com/errors/validation")
            .build();
        
        log.warn("Validation failed for request: {} {}, errors: {}", 
                request.getMethod(), request.getRequestURI(), validationErrors.size());
        
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRuleViolation(
            BusinessRuleException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
            .error("Business Rule Violation")
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .method(request.getMethod())
            .correlationId(getCorrelationId(request))
            .code(ex.getErrorCode())
            .helpUrl("https://api-docs.rsms.com/errors/business-rules")
            .build();
        
        log.warn("Business rule violation: {} - {}", ex.getErrorCode(), ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Resource Not Found")
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .method(request.getMethod())
            .correlationId(getCorrelationId(request))
            .code("RESOURCE_NOT_FOUND")
            .build();
        
        log.info("Resource not found: {}", ex.getMessage());
        
        return ResponseEntity.notFound().build();
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.FORBIDDEN.value())
            .error("Access Denied")
            .message("이 리소스에 접근할 권한이 없습니다")
            .path(request.getRequestURI())
            .method(request.getMethod())
            .correlationId(getCorrelationId(request))
            .code("ACCESS_DENIED")
            .helpUrl("https://api-docs.rsms.com/errors/access-denied")
            .build();
        
        log.warn("Access denied for request: {} {} by user: {}", 
                request.getMethod(), request.getRequestURI(), getCurrentUsername());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimit(
            RateLimitExceededException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.TOO_MANY_REQUESTS.value())
            .error("Rate Limit Exceeded")
            .message("요청 한도를 초과했습니다")
            .path(request.getRequestURI())
            .method(request.getMethod())
            .correlationId(getCorrelationId(request))
            .code("RATE_LIMIT_EXCEEDED")
            .retryAfter(ex.getRetryAfter())
            .retryAdvice("지정된 시간 후 다시 시도해주세요")
            .helpUrl("https://api-docs.rsms.com/errors/rate-limit")
            .build();
        
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .header("Retry-After", String.valueOf(ex.getRetryAfter()))
            .body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleInternalError(
            Exception ex,
            HttpServletRequest request) {
        
        String correlationId = getOrGenerateCorrelationId(request);
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("서버 내부 오류가 발생했습니다")
            .path(request.getRequestURI())
            .method(request.getMethod())
            .correlationId(correlationId)
            .code("INTERNAL_SERVER_ERROR")
            .retryAdvice("잠시 후 다시 시도해주세요")
            .helpUrl("https://api-docs.rsms.com/errors/server-error")
            .build();
        
        log.error("Internal server error occurred. CorrelationId: {}", correlationId, ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    private String getCorrelationId(HttpServletRequest request) {
        return request.getHeader(CORRELATION_ID_HEADER);
    }
    
    private String getOrGenerateCorrelationId(HttpServletRequest request) {
        String correlationId = getCorrelationId(request);
        return correlationId != null ? correlationId : UUID.randomUUID().toString();
    }
    
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "anonymous";
    }
}
```

### 3. Custom Exception Classes

```java
// 비즈니스 규칙 위반 예외
@Getter
public class BusinessRuleException extends RuntimeException {
    
    private final String errorCode;
    private final Map<String, Object> parameters;
    
    public BusinessRuleException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.parameters = Collections.emptyMap();
    }
    
    public BusinessRuleException(String errorCode, String message, Map<String, Object> parameters) {
        super(message);
        this.errorCode = errorCode;
        this.parameters = parameters;
    }
    
    // 정적 팩토리 메서드
    public static BusinessRuleException of(String errorCode, String message) {
        return new BusinessRuleException(errorCode, message);
    }
    
    public static BusinessRuleException scoreTooHigh(int score, int maxScore) {
        return new BusinessRuleException(
            "SCORE_TOO_HIGH",
            String.format("점수가 너무 높습니다. (현재: %d, 최대허용: %d)", score, maxScore),
            Map.of("current_score", score, "max_allowed_score", maxScore)
        );
    }
    
    public static BusinessRuleException duplicateEntityTitle(String title) {
        return new BusinessRuleException(
            "DUPLICATE_ENTITY_TITLE",
            String.format("동일한 제목의 엔티티가 이미 존재합니다: %s", title),
            Map.of("title", title)
        );
    }
}

// 리소스 없음 예외
@Getter
public class EntityNotFoundException extends RuntimeException {
    
    private final String entityType;
    private final Object entityId;
    
    public EntityNotFoundException(String entityType, Object entityId) {
        super(String.format("%s를 찾을 수 없습니다: %s", entityType, entityId));
        this.entityType = entityType;
        this.entityId = entityId;
    }
    
    public static EntityNotFoundException entity(Long id) {
        return new EntityNotFoundException("Entity", id);
    }
    
    public static EntityNotFoundException user(Long id) {
        return new EntityNotFoundException("User", id);
    }
}

// 외부 서비스 연동 예외
@Getter
public class ExternalServiceException extends RuntimeException {
    
    private final String serviceName;
    private final int statusCode;
    private final String serviceResponse;
    
    public ExternalServiceException(String serviceName, int statusCode, String message) {
        super(String.format("외부 서비스 오류 [%s]: %s", serviceName, message));
        this.serviceName = serviceName;
        this.statusCode = statusCode;
        this.serviceResponse = message;
    }
    
    public static ExternalServiceException emailService(int statusCode, String response) {
        return new ExternalServiceException("EmailService", statusCode, response);
    }
}
```

---

## 인증/인가 가이드

### 1. Authentication Standards

#### JWT Token Structure (향후 확장시)
```yaml
# JWT Header
{
  "alg": "HS256",
  "typ": "JWT"
}

# JWT Payload
{
  "sub": "user123",
  "username": "john.doe",
  "roles": ["ENTITY_MANAGER", "USER"],
  "permissions": ["READ_ENTITIES", "CREATE_ENTITIES", "UPDATE_ENTITIES"],
  "iat": 1625097600,
  "exp": 1625184000,
  "iss": "api-server",
  "aud": "frontend-app"
}
```

#### Session-based Authentication (현재)
```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(), 
                    request.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 세션 생성
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, 
                                SecurityContextHolder.getContext());
            
            UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
            
            LoginResponse response = LoginResponse.builder()
                .success(true)
                .message("로그인 성공")
                .sessionId(session.getId())
                .user(UserResponse.from(user))
                .permissions(user.getPermissions())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (AuthenticationException e) {
            throw new BusinessRuleException("AUTHENTICATION_FAILED", "사용자명 또는 비밀번호가 올바르지 않습니다");
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        SecurityContextHolder.clearContext();
        
        LogoutResponse response = LogoutResponse.builder()
            .success(true)
            .message("로그아웃 완료")
            .build();
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserPrincipal user = (UserPrincipal) authentication.getPrincipal();
        UserResponse response = UserResponse.from(user);
        
        return ResponseEntity.ok(response);
    }
}

// Login Request/Response DTOs
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "사용자명은 필수입니다")
    private String username;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
    
    @Builder.Default
    private Boolean rememberMe = false;
}

@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class LoginResponse {
    private Boolean success;
    private String message;
    private String sessionId;
    private UserResponse user;
    private Set<String> permissions;
    private LocalDateTime expiresAt;
}
```

### 2. Authorization Standards

#### Method Level Security
```java
@Service
@RequiredArgsConstructor
public class EntityService {
    
    // 역할 기반 접근 제어
    @PreAuthorize("hasRole('ENTITY_MANAGER') or hasRole('ADMIN')")
    public EntityResponse createEntity(CreateEntityRequest request) {
        // 구현
    }
    
    // 리소스 기반 접근 제어
    @PreAuthorize("@entitySecurityService.canViewEntity(#entityId, authentication.name)")
    public EntityResponse getEntity(Long entityId) {
        // 구현
    }
    
    // 복합 조건 접근 제어
    @PreAuthorize("hasRole('ADMIN') or (@entitySecurityService.canModifyEntity(#entityId, authentication.name) and hasAuthority('UPDATE_ENTITIES'))")
    public EntityResponse updateEntity(Long entityId, UpdateEntityRequest request) {
        // 구현
    }
    
    // 결과 필터링
    @PostAuthorize("@entitySecurityService.canViewEntityDetails(returnObject, authentication)")
    public EntityResponse getEntityWithDetails(Long entityId) {
        // 구현
    }
    
    // 컬렉션 필터링
    @PostFilter("@entitySecurityService.canViewEntity(filterObject.id, authentication.name)")
    public List<EntityResponse> getAllEntities() {
        // 구현
    }
}

// Security Service
@Component("entitySecurityService")
@RequiredArgsConstructor
public class EntitySecurityService {
    
    private final EntityRepository entityRepository;
    
    public boolean canViewEntity(Long entityId, String username) {
        return entityRepository.findById(entityId)
            .map(entity -> isOwner(entity, username) || 
                        isPublicEntity(entity) || 
                        hasViewPermission(username))
            .orElse(false);
    }
    
    public boolean canModifyEntity(Long entityId, String username) {
        return entityRepository.findById(entityId)
            .map(entity -> isOwner(entity, username) || 
                        hasModifyPermission(username))
            .orElse(false);
    }
    
    public boolean canDeleteEntity(Long entityId, String username) {
        return entityRepository.findById(entityId)
            .map(entity -> isOwner(entity, username) || 
                        hasRole(username, "ADMIN"))
            .orElse(false);
    }
    
    private boolean isOwner(Entity entity, String username) {
        return entity.getOwner() != null && 
               entity.getOwner().getUsername().equals(username);
    }
    
    private boolean isPublicEntity(Entity entity) {
        return entity.getVisibility() == EntityVisibility.PUBLIC;
    }
    
    private boolean hasViewPermission(String username) {
        // 사용자 권한 확인 로직
        return true; // 구현
    }
    
    private boolean hasModifyPermission(String username) {
        // 사용자 권한 확인 로직
        return true; // 구현
    }
    
    private boolean hasRole(String username, String role) {
        // 사용자 역할 확인 로직
        return true; // 구현
    }
}
```

### 3. API Key Authentication (외부 API용)

```java
@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {
    
    private static final String API_KEY_HEADER = "X-API-Key";
    private final ApiKeyService apiKeyService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String apiKey = request.getHeader(API_KEY_HEADER);
        
        if (apiKey != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            Optional<ApiKeyDetails> keyDetails = apiKeyService.validateApiKey(apiKey);
            
            if (keyDetails.isPresent()) {
                ApiKeyAuthenticationToken authToken = new ApiKeyAuthenticationToken(
                    keyDetails.get().getClientId(),
                    apiKey,
                    keyDetails.get().getAuthorities()
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                // API 사용량 추적
                apiKeyService.recordUsage(keyDetails.get().getClientId());
            }
        }
        
        filterChain.doFilter(request, response);
    }
}

// API Key 인증을 위한 엔드포인트
@RestController
@RequestMapping("/api/v1/external")
@PreAuthorize("hasRole('API_CLIENT')")
public class ExternalApiController {
    
    @GetMapping("/entities")
    @RateLimited(requests = 100, window = 3600) // 시간당 100회 제한
    public ResponseEntity<PageResponse<EntitySummaryResponse>> getPublicEntities(
            @PageableDefault(size = 10) Pageable pageable,
            Authentication authentication) {
        
        ApiKeyAuthenticationToken apiAuth = (ApiKeyAuthenticationToken) authentication;
        String clientId = apiAuth.getClientId();
        
        // 클라이언트별 접근 가능한 엔티티만 조회
        Page<EntitySummaryResponse> entities = entityService.getPublicEntities(clientId, pageable);
        
        return ResponseEntity.ok(PageResponse.from(entities));
    }
}
```

---

## API 버전 관리

### 1. Versioning Strategies

#### URL Path Versioning (권장)
```java
// Version 1 API
@RestController
@RequestMapping("/api/v1/entities")
@Tag(name = "Entity Management V1", description = "엔티티 관리 API v1")
public class EntityV1Controller {
    
    @GetMapping("/{id}")
    @Operation(summary = "엔티티 조회 V1")
    public ResponseEntity<EntityResponseV1> getEntity(@PathVariable Long id) {
        EntityResponseV1 response = entityService.getEntityV1(id);
        return ResponseEntity.ok(response);
    }
}

// Version 2 API (향후 확장)
@RestController
@RequestMapping("/api/v2/entities")
@Tag(name = "Entity Management V2", description = "엔티티 관리 API v2")
public class EntityV2Controller {
    
    @GetMapping("/{id}")
    @Operation(summary = "엔티티 조회 V2", description = "추가 필드 포함")
    public ResponseEntity<EntityResponseV2> getEntity(@PathVariable Long id) {
        EntityResponseV2 response = entityService.getEntityV2(id);
        return ResponseEntity.ok(response);
    }
}
```

#### Header-based Versioning (선택사항)
```java
@RestController
@RequestMapping("/api/entities")
public class EntityController {
    
    @GetMapping(value = "/{id}", headers = "Accept-Version=1.0")
    @Operation(summary = "엔티티 조회 V1.0")
    public ResponseEntity<EntityResponseV1> getEntityV1(@PathVariable Long id) {
        // V1 구현
    }
    
    @GetMapping(value = "/{id}", headers = "Accept-Version=2.0")
    @Operation(summary = "엔티티 조회 V2.0")
    public ResponseEntity<EntityResponseV2> getEntityV2(@PathVariable Long id) {
        // V2 구현
    }
    
    @GetMapping("/{id}")  // 기본 버전
    @Operation(summary = "엔티티 조회 (최신 버전)")
    public ResponseEntity<EntityResponseV2> getEntityLatest(@PathVariable Long id) {
        return getEntityV2(id);
    }
}
```

### 2. Backward Compatibility

#### Response DTO 호환성 관리
```java
// V1 Response (기본)
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EntityResponseV1 {
    private Long id;
    private String title;
    private String description;
    private String category;  // String으로 제공
    private String status;    // String으로 제공
    private Integer priority;
    private Integer importance;
    private Integer totalScore;
    private LocalDateTime createdAt;
    
    public static EntityResponseV1 from(Entity entity) {
        return EntityResponseV1.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .category(entity.getCategory().name())
            .status(entity.getStatus().name())
            .priority(entity.getPriority())
            .importance(entity.getImportance())
            .totalScore(entity.getTotalScore())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}

// V2 Response (확장)
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EntityResponseV2 {
    private Long id;
    private String title;
    private String description;
    private EntityCategoryInfo category;  // 객체로 확장
    private EntityStatusInfo status;      // 객체로 확장
    private Integer priority;
    private Integer importance;
    private Integer totalScore;
    private String priorityLevel;           // 새 필드 추가
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;    // 새 필드 추가
    private UserSummaryResponse owner;  // 새 필드 추가
    private List<String> tags;          // 새 필드 추가
    
    @Data
    @Builder
    public static class EntityCategoryInfo {
        private String code;
        private String name;
        private String description;
        private String color;
    }
    
    @Data
    @Builder
    public static class EntityStatusInfo {
        private String code;
        private String name;
        private String description;
        private Boolean isActive;
    }
    
    public static EntityResponseV2 from(Entity entity) {
        return EntityResponseV2.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .category(EntityCategoryInfo.builder()
                .code(entity.getCategory().name())
                .name(entity.getCategory().getDisplayName())
                .description(entity.getCategory().getDescription())
                .color(entity.getCategory().getColor())
                .build())
            .status(EntityStatusInfo.builder()
                .code(entity.getStatus().name())
                .name(entity.getStatus().getDisplayName())
                .description(entity.getStatus().getDescription())
                .isActive(entity.getStatus().isActive())
                .build())
            .priority(entity.getPriority())
            .importance(entity.getImportance())
            .totalScore(entity.getTotalScore())
            .priorityLevel(entity.getPriorityLevel().name())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .owner(entity.getOwner() != null ? UserSummaryResponse.from(entity.getOwner()) : null)
            .tags(new ArrayList<>(entity.getTags()))
            .build();
    }
}
```

### 3. API Deprecation Strategy

#### 버전 종료 안내
```java
@RestController
@RequestMapping("/api/v1/entities")
@Deprecated
public class EntityV1Controller {
    
    @GetMapping("/{id}")
    @Operation(
        summary = "엔티티 조회 V1", 
        description = "⚠️ DEPRECATED: 이 API는 2025-12-31에 지원이 종료됩니다. V2 API를 사용해주세요.",
        deprecated = true
    )
    public ResponseEntity<EntityResponseV1> getEntity(@PathVariable Long id, HttpServletResponse response) {
        
        // Deprecation 헤더 추가
        response.setHeader("X-API-Deprecated", "true");
        response.setHeader("X-API-Deprecation-Date", "2025-12-31");
        response.setHeader("X-API-Sunset-Date", "2025-12-31");
        response.setHeader("Link", "</api/v2/entities>; rel=\"successor-version\"");
        
        EntityResponseV1 entityResponse = entityService.getEntityV1(id);
        return ResponseEntity.ok(entityResponse);
    }
}
```

#### Migration Guide 제공
```java
@RestController
@RequestMapping("/api/migration")
public class MigrationController {
    
    @GetMapping("/v1-to-v2")
    @Operation(summary = "V1에서 V2로 마이그레이션 가이드")
    public ResponseEntity<MigrationGuide> getV1ToV2Guide() {
        
        MigrationGuide guide = MigrationGuide.builder()
            .version("1.0 to 2.0")
            .migrationDate("2025-12-31")
            .breakingChanges(Arrays.asList(
                BreakingChange.of("category", "string", "object", "카테고리 필드가 문자열에서 객체로 변경"),
                BreakingChange.of("status", "string", "object", "상태 필드가 문자열에서 객체로 변경")
            ))
            .newFeatures(Arrays.asList(
                "respLevel 필드 추가",
                "owner 정보 포함",
                "tags 지원",
                "updatedAt 타임스탬프 추가"
            ))
            .migrationSteps(Arrays.asList(
                "1. V2 엔드포인트로 요청 URL 변경 (/api/v1/entities -> /api/v2/entities)",
                "2. 응답 데이터의 category 및 status 필드 파싱 로직 수정",
                "3. 새로 추가된 필드 활용 로직 구현",
                "4. 테스트 및 검증 완료"
            ))
            .supportContact("api-support@example.com")
            .build();
        
        return ResponseEntity.ok(guide);
    }
}

@Data
@Builder
public class MigrationGuide {
    private String version;
    private String migrationDate;
    private List<BreakingChange> breakingChanges;
    private List<String> newFeatures;
    private List<String> migrationSteps;
    private String supportContact;
}

@Data
@Builder
public class BreakingChange {
    private String field;
    private String oldType;
    private String newType;
    private String description;
    
    public static BreakingChange of(String field, String oldType, String newType, String description) {
        return BreakingChange.builder()
            .field(field)
            .oldType(oldType)
            .newType(newType)
            .description(description)
            .build();
    }
}
```

---

## 문서화 가이드

### 1. OpenAPI 3 Configuration

#### Swagger 설정
```java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Backend API",
        version = "1.0",
        description = "Backend API Documentation",
        termsOfService = "https://example.com/terms",
        contact = @Contact(
            name = "API Team",
            email = "api-support@example.com",
            url = "https://example.com/support"
        ),
        license = @License(
            name = "MIT License",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    servers = {
        @Server(url = "http://localhost:8090", description = "Development Server"),
        @Server(url = "https://staging-api.example.com", description = "Staging Server"),
        @Server(url = "https://api.example.com", description = "Production Server")
    },
    security = @SecurityRequirement(name = "Session Authentication")
)
@SecurityScheme(
    name = "Session Authentication",
    type = SecuritySchemeType.APIKEY,
    in = SecuritySchemeIn.COOKIE,
    paramName = "JSESSIONID"
)
public class OpenApiConfig {
    
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public")
            .pathsToMatch("/api/v1/**")
            .pathsToExclude("/api/v1/admin/**")
            .build();
    }
    
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin")
            .pathsToMatch("/api/v1/admin/**")
            .build();
    }
    
    @Bean
    public GroupedOpenApi externalApi() {
        return GroupedOpenApi.builder()
            .group("external")
            .pathsToMatch("/api/v1/external/**")
            .build();
    }
}
```

### 2. API Documentation Annotations

#### Controller 문서화
```java
@RestController
@RequestMapping("/api/v1/entities")
@Tag(name = "Entity Management", description = "엔티티 관리 API")
@Validated
@RequiredArgsConstructor
public class EntityController {
    
    @Operation(
        summary = "엔티티 생성",
        description = "새로운 엔티티를 등록합니다. 엔티티 점수는 우선순위와 중요도를 곱하여 자동 계산됩니다.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "생성할 엔티티 정보",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CreateEntityRequest.class),
                examples = @ExampleObject(
                    name = "고우선순위 엔티티 예시",
                    value = """
                        {
                            "title": "데이터베이스 서버 구성",
                            "description": "메인 데이터베이스 서버의 구성 개선",
                            "category": "TECHNICAL",
                            "priority": 4,
                            "importance": 5,
                            "due_date": "2025-12-31"
                        }
                        """
                )
            )
        )
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "엔티티 생성 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = EntityResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 데이터",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                            "timestamp": "2025-09-05T14:30:00",
                            "status": 400,
                            "error": "Validation Failed",
                            "message": "입력 데이터 검증에 실패했습니다",
                            "errors": [
                                {
                                    "field": "title",
                                    "message": "엔티티 제목은 필수입니다"
                                }
                            ]
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "권한 없음 - ENTITY_MANAGER 역할 필요"
        ),
        @ApiResponse(
            responseCode = "422",
            description = "비즈니스 규칙 위반",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    @PostMapping
    @PreAuthorize("hasRole('ENTITY_MANAGER')")
    public ResponseEntity<EntityResponse> createEntity(
            @Parameter(description = "생성할 엔티티 정보", required = true)
            @Valid @RequestBody CreateEntityRequest request,
            
            @Parameter(hidden = true) 
            Authentication authentication) {
        
        EntityResponse response = entityApplicationService.createEntity(request);
        
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(response.getId())
            .toUri();
        
        return ResponseEntity.created(location).body(response);
    }
    
    @Operation(
        summary = "엔티티 목록 조회",
        description = "페이징 및 필터링을 지원하는 엔티티 목록을 조회합니다.",
        parameters = {
            @Parameter(
                name = "page", 
                description = "페이지 번호 (0부터 시작)", 
                example = "0",
                schema = @Schema(type = "integer", minimum = "0")
            ),
            @Parameter(
                name = "size", 
                description = "페이지 크기", 
                example = "20",
                schema = @Schema(type = "integer", minimum = "1", maximum = "100")
            ),
            @Parameter(
                name = "sort", 
                description = "정렬 기준 (field,direction 형식)", 
                example = "createdAt,desc",
                array = @ArraySchema(schema = @Schema(type = "string"))
            ),
            @Parameter(
                name = "category", 
                description = "엔티티 카테고리 필터",
                schema = @Schema(implementation = EntityCategory.class)
            ),
            @Parameter(
                name = "status", 
                description = "엔티티 상태 필터",
                schema = @Schema(implementation = EntityStatus.class)
            ),
            @Parameter(
                name = "search", 
                description = "제목 또는 설명에서 검색할 키워드",
                example = "서버"
            )
        }
    )
    @GetMapping
    public ResponseEntity<PageResponse<EntitySummaryResponse>> getEntities(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable,
            
            @RequestParam(required = false) EntityCategory category,
            @RequestParam(required = false) EntityStatus status,
            @RequestParam(required = false) String search) {
        
        EntitySearchCriteria criteria = EntitySearchCriteria.builder()
            .category(category)
            .status(status)
            .searchKeyword(search)
            .build();
        
        Page<EntitySummaryResponse> entities = entityQueryService.searchEntities(criteria, pageable);
        PageResponse<EntitySummaryResponse> response = PageResponse.from(entities);
        
        return ResponseEntity.ok(response);
    }
}
```

#### DTO Schema Documentation
```java
@Schema(
    name = "CreateEntityRequest",
    description = "엔티티 생성 요청 데이터",
    example = """
        {
            "title": "시스템 구성 개선",
            "description": "웹 애플리케이션의 배치 설정 최적화",
            "category": "OPERATIONAL",
            "priority": 3,
            "importance": 4,
            "due_date": "2025-12-31"
        }
        """
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateEntityRequest {
    
    @Schema(
        description = "엔티티 제목",
        example = "데이터베이스 구성 개선",
        minLength = 1,
        maxLength = 200,
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "엔티티 제목은 필수입니다")
    @Size(min = 1, max = 200, message = "제목은 1-200자 사이여야 합니다")
    private String title;
    
    @Schema(
        description = "엔티티 상세 설명",
        example = "메인 데이터베이스 서버의 성능 개선 및 최적화",
        maxLength = 2000,
        requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    @Size(max = 2000, message = "설명은 2000자를 초과할 수 없습니다")
    private String description;
    
    @Schema(
        description = "엔티티 카테고리",
        example = "OPERATIONAL",
        requiredMode = Schema.RequiredMode.REQUIRED,
        allowableValues = {"OPERATIONAL", "TECHNICAL", "FINANCIAL", "STRATEGIC", "COMPLIANCE", "SECURITY"}
    )
    @NotNull(message = "엔티티 카테고리는 필수입니다")
    private EntityCategory category;
    
    @Schema(
        description = "우선순위 (1-5 척도)",
        example = "4",
        minimum = "1",
        maximum = "5",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "우선순위는 필수입니다")
    @Range(min = 1, max = 5, message = "우선순위는 1-5 범위여야 합니다")
    private Integer priority;
    
    @Schema(
        description = "중요도 (1-5 척도)",
        example = "5",
        minimum = "1",
        maximum = "5",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "중요도는 필수입니다")
    @Range(min = 1, max = 5, message = "중요도는 1-5 범위여야 합니다")
    private Integer importance;
    
    @Schema(
        description = "완료 목표일",
        example = "2025-12-31",
        type = "string",
        format = "date",
        requiredMode = Schema.RequiredMode.NOT_REQUIRED
    )
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
}
```

### 3. API Usage Examples

#### Example Documentation
```java
@Component
public class ApiExampleProvider {
    
    @Bean
    public OpenApiCustomizer openApiCustomizer() {
        return openApi -> {
            // Common Response Examples
            openApi.getComponents().addExamples("SuccessfulRespResponse", 
                new Example()
                    .summary("성공적인 리스크 응답")
                    .description("리스크가 성공적으로 생성된 경우의 응답")
                    .value(createSuccessRespExample()));
            
            openApi.getComponents().addExamples("ValidationErrorResponse",
                new Example()
                    .summary("검증 오류 응답")
                    .description("입력 데이터 검증 실패 시 응답")
                    .value(createValidationErrorExample()));
            
            openApi.getComponents().addExamples("BusinessRuleErrorResponse",
                new Example()
                    .summary("비즈니스 규칙 위반 응답")
                    .description("비즈니스 규칙 위반 시 응답")
                    .value(createBusinessRuleErrorExample()));
        };
    }
    
    private Object createSuccessRespExample() {
        return Map.of(
            "id", 123L,
            "title", "데이터베이스 구성 개선",
            "description", "메인 데이터베이스 서버의 성능 최적화",
            "category", "OPERATIONAL",
            "status", "ACTIVE",
            "priority", 4,
            "importance", 5,
            "total_score", 20,
            "is_high_priority", true,
            "created_at", "2025-09-05T14:30:00",
            "updated_at", "2025-09-05T14:30:00",
            "owner", Map.of(
                "id", 1L,
                "username", "john.doe",
                "full_name", "John Doe",
                "email", "john.doe@rsms.com"
            )
        );
    }
    
    private Object createValidationErrorExample() {
        return Map.of(
            "timestamp", "2025-09-05T14:30:00",
            "status", 400,
            "error", "Validation Failed",
            "message", "입력 데이터 검증에 실패했습니다",
            "path", "/api/v1/resps",
            "method", "POST",
            "errors", Arrays.asList(
                Map.of(
                    "field", "title",
                    "rejected_value", "",
                    "message", "엔티티 제목은 필수입니다"
                ),
                Map.of(
                    "field", "probability",
                    "rejected_value", 0,
                    "message", "우선순위는 1-5 범위여야 합니다"
                )
            )
        );
    }
    
    private Object createBusinessRuleErrorExample() {
        return Map.of(
            "timestamp", "2025-09-05T14:30:00",
            "status", 422,
            "error", "Business Rule Violation",
            "message", "동일한 제목의 활성 엔티티가 이미 존재합니다",
            "code", "DUPLICATE_ACTIVE_ENTITY",
            "path", "/api/v1/entities",
            "method", "POST"
        );
    }
}
```

---

## 성능 최적화

### 1. Database Query Optimization

#### Query Performance Analysis
```java
@Component
@Profile("dev")
public class QueryPerformanceInterceptor implements Interceptor {
    
    private static final Logger log = LoggerFactory.getLogger(QueryPerformanceInterceptor.class);
    private static final long SLOW_QUERY_THRESHOLD = 1000; // 1초
    
    @Override
    public boolean onLoad(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        return false;
    }
    
    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        return false;
    }
    
    @Override
    public void onDelete(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        // 구현 필요 시
    }
    
    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, 
                               Object[] previousState, String[] propertyNames, Type[] types) {
        return false;
    }
    
    @Override
    public Boolean isTransient(Object entity) {
        return null;
    }
    
    @Override
    public int[] findDirty(Object entity, Serializable id, Object[] currentState, 
                          Object[] previousState, String[] propertyNames, Type[] types) {
        return null;
    }
    
    @Override
    public Object instantiate(String entityName, EntityMode entityMode, Serializable id) {
        return null;
    }
    
    @Override
    public String getEntityName(Object object) {
        return null;
    }
    
    @Override
    public Object getEntity(String entityName, Serializable id) {
        return null;
    }
    
    @Override
    public void afterTransactionBegin(Transaction tx) {
        // 구현 필요 시
    }
    
    @Override
    public void afterTransactionCompletion(Transaction tx) {
        // 구현 필요 시  
    }
    
    @Override
    public void beforeTransactionCompletion(Transaction tx) {
        // 구현 필요 시
    }
    
    @Override
    public String onPrepareStatement(String sql) {
        long startTime = System.currentTimeMillis();
        
        return sql;
    }
}

// 쿼리 성능 모니터링
@Component
@ConditionalOnProperty(value = "app.monitoring.query-performance.enabled", havingValue = "true")
public class QueryPerformanceMonitor {
    
    private final MeterRegistry meterRegistry;
    private final Timer.Sample sample;
    
    @EventListener
    public void handleQueryExecution(QueryExecutionEvent event) {
        long executionTime = event.getExecutionTime();
        
        Timer.builder("database.query.execution.time")
            .description("Database query execution time")
            .tag("query_type", event.getQueryType())
            .tag("entity", event.getEntityName())
            .register(meterRegistry)
            .record(executionTime, TimeUnit.MILLISECONDS);
        
        if (executionTime > 1000) {
            log.warn("Slow query detected: {} ms - Query: {}", 
                    executionTime, event.getQuery());
        }
    }
}
```

### 2. Caching Strategies

#### Multi-level Caching
```java
@Configuration
@EnableCaching
public class CacheConfiguration {
    
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CompositeCacheManager cacheManager = new CompositeCacheManager();
        
        // L1 Cache: Caffeine (Local)
        CaffeineCacheManager caffeineCache = new CaffeineCacheManager();
        caffeineCache.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(5, TimeUnit.MINUTES));
        
        // L2 Cache: Redis (향후 추가)
        // RedisCacheManager redisCache = ...;
        
        cacheManager.setCacheManagers(Arrays.asList(caffeineCache));
        cacheManager.setFallbackToNoOpCache(false);
        
        return cacheManager;
    }
    
    @Bean
    public CacheManager statisticsCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(1, TimeUnit.HOURS)
            .recordStats());
        return manager;
    }
}

// 캐시 사용 예시
@Service
@CacheConfig(cacheNames = "entities")
public class EntityCacheService {
    
    @Cacheable(key = "'summary:' + #category.name() + ':' + #status.name()")
    public List<EntitySummary> getCachedEntitySummary(EntityCategory category, EntityStatus status) {
        return entityRepository.findSummaryByCategoryAndStatus(category, status);
    }
    
    @Cacheable(value = "entity-statistics", key = "'daily:' + #date.toString()")
    public DailyEntityStatistics getDailyStatistics(LocalDate date) {
        return statisticsService.calculateDailyStats(date);
    }
    
    @CacheEvict(allEntries = true)
    public void invalidateAllEntityCache() {
        log.info("All entity caches invalidated");
    }
    
    @Caching(evict = {
        @CacheEvict(value = "entities", key = "'summary:' + #entity.category.name() + ':*'"),
        @CacheEvict(value = "entity-statistics", allEntries = true)
    })
    public void invalidateRelatedCaches(Entity entity) {
        log.info("Invalidated caches related to entity: {}", entity.getId());
    }
}
```

### 3. API Response Optimization

#### Response Compression
```java
@Configuration
public class CompressionConfig {
    
    @Bean
    public FilterRegistrationBean<CompressionFilter> compressionFilter() {
        FilterRegistrationBean<CompressionFilter> registration = new FilterRegistrationBean<>();
        
        CompressionFilter filter = new CompressionFilter();
        registration.setFilter(filter);
        registration.addUrlPatterns("/api/*");
        registration.setName("compressionFilter");
        registration.setOrder(1);
        
        return registration;
    }
}

// 압축 필터 구현
@Component
public class CompressionFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String acceptEncoding = httpRequest.getHeader("Accept-Encoding");
        
        if (acceptEncoding != null && acceptEncoding.contains("gzip")) {
            httpResponse.setHeader("Content-Encoding", "gzip");
            
            GZIPResponseWrapper wrapper = new GZIPResponseWrapper(httpResponse);
            chain.doFilter(request, wrapper);
            wrapper.close();
        } else {
            chain.doFilter(request, response);
        }
    }
}
```

#### Selective Field Response
```java
@GetMapping("/{id}")
public ResponseEntity<EntityResponse> getEntity(
        @PathVariable Long id,
        @RequestParam(required = false) Set<String> fields,
        @RequestParam(required = false) Set<String> expand) {
    
    Entity entity = entityService.getEntity(id);
    
    // 선택적 필드 응답
    EntityResponse response = EntityResponse.from(entity);
    
    if (fields != null && !fields.isEmpty()) {
        response = filterFields(response, fields);
    }
    
    // 관계 데이터 포함
    if (expand != null && !expand.isEmpty()) {
        response = expandRelations(response, expand, entity);
    }
    
    return ResponseEntity.ok(response);
}

private EntityResponse filterFields(EntityResponse response, Set<String> fields) {
    EntityResponse.EntityResponseBuilder builder = response.toBuilder();
    
    if (!fields.contains("description")) builder.description(null);
    if (!fields.contains("items")) builder.items(null);
    if (!fields.contains("owner")) builder.owner(null);
    
    return builder.build();
}

private EntityResponse expandRelations(EntityResponse response, Set<String> expand, Entity entity) {
    EntityResponse.EntityResponseBuilder builder = response.toBuilder();
    
    if (expand.contains("items")) {
        List<EntityItemResponse> items = entity.getItems().stream()
            .map(EntityItemResponse::from)
            .collect(Collectors.toList());
        builder.items(items);
    }
    
    if (expand.contains("owner") && entity.getOwner() != null) {
        UserSummaryResponse owner = UserSummaryResponse.from(entity.getOwner());
        builder.owner(owner);
    }
    
    return builder.build();
}
```

---

**📅 마지막 업데이트**: 2025-09-05  
**🌐 API Version**: 1.0  
**📝 작성자**: Backend Development Team
