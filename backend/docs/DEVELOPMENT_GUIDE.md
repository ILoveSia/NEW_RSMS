# 🚀 Backend Development Guide

**Java 21 + Spring Boot 3.3.5 개발 가이드 및 Best Practices**

---

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조](#프로젝트-구조)  
3. [개발 워크플로우](#개발-워크플로우)
4. [코딩 컨벤션](#코딩-컨벤션)
5. [API 개발 가이드](#api-개발-가이드)
6. [데이터베이스 가이드](#데이터베이스-가이드)
7. [테스트 가이드](#테스트-가이드)
8. [성능 최적화](#성능-최적화)
9. [보안 가이드](#보안-가이드)
10. [문제 해결](#문제-해결)

---

## 개발 환경 설정

### 필수 도구 설치

#### 1. Java 21 Development Kit
```bash
# OpenJDK 21 설치 확인
java -version
# openjdk version "21.0.1" 2023-10-17 LTS

# JAVA_HOME 설정
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$PATH
```

#### 2. 개발 도구
```bash
# IDE 권장사항
- IntelliJ IDEA Ultimate (권장)
- Visual Studio Code + Java Extension Pack
- Eclipse 2023-12 이상

# 필수 플러그인/확장
- Lombok Plugin
- Spring Boot Tools
- Database Navigator
- SonarLint (코드 품질)
```

#### 3. 데이터베이스 도구
```bash
# PostgreSQL 클라이언트 
- pgAdmin 4 (GUI)
- DBeaver (Universal DB Tool)
- psql (CLI)

# 연결 정보 (WSL 환경)
Host: 172.21.174.2
Port: 5432
Database: postgres
Username: postgres
Password: 1q2w3e4r!
```

### 프로젝트 초기 설정

#### 1. 프로젝트 클론 및 빌드
```bash
git clone <repository-url>
cd rsms-backend

# Gradle Wrapper 권한 설정
chmod +x gradlew

# 의존성 다운로드 및 빌드
./gradlew build

# 테스트 실행
./gradlew test
```

#### 2. 데이터베이스 마이그레이션
```bash
# Flyway 마이그레이션 실행
./gradlew flywayMigrate

# 마이그레이션 상태 확인
./gradlew flywayInfo

# 개발 중 스키마 초기화 (개발환경만!)
./gradlew flywayClean flywayMigrate
```

#### 3. 애플리케이션 실행
```bash
# 로컬 환경으로 실행
./gradlew bootRun

# 특정 프로필로 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 디버그 모드로 실행  
./gradlew bootRun --debug-jvm
```

---

## 프로젝트 구조

### 디렉토리 구조
```
src/main/java/com/rsms/
├── RsmsApplication.java              # Main Application Class
├── domain/                           # 도메인 계층 (비즈니스 로직)
│   ├── common/                       # 공통 도메인 컴포넌트
│   │   ├── BaseEntity.java          # 공통 엔티티 Base Class
│   │   ├── BaseRepository.java      # 공통 Repository Interface
│   │   └── DomainEvent.java         # 도메인 이벤트 Base
│   ├── auth/                        # 인증/인가 도메인
│   │   ├── entity/User.java         # 사용자 엔티티
│   │   ├── repository/UserRepository.java
│   │   ├── service/UserDomainService.java
│   │   └── event/UserCreatedEvent.java
│   ├── user/                        # 사용자 관리 도메인
│   ├── entity/                        # 엔티티 관리 도메인 (핵심)
│   │   ├── entity/
│   │   │   ├── Item.java            # 아이템 엔티티
│   │   │   └── ItemAction.java      # 아이템 액션 엔티티
│   │   ├── repository/
│   │   │   ├── ItemRepository.java
│   │   │   └── ItemActionRepository.java
│   │   ├── service/
│   │   │   ├── ItemDomainService.java
│   │   │   └── ItemCalculationService.java
│   │   ├── dto/                     # Domain DTOs
│   │   └── event/                   # Domain Events
│   ├── report/                      # 보고서 도메인
│   ├── dashboard/                   # 대시보드 도메인
│   └── settings/                    # 설정 도메인
├── application/                      # 애플리케이션 계층 (Use Cases)
│   ├── config/                      # 애플리케이션 설정
│   ├── service/                     # 애플리케이션 서비스
│   │   ├── ItemApplicationService.java
│   │   ├── UserApplicationService.java
│   │   └── NotificationService.java
│   ├── dto/                         # 애플리케이션 DTOs
│   │   ├── request/                 # Request DTOs
│   │   └── response/                # Response DTOs
│   └── event/                       # 애플리케이션 이벤트 핸들러
├── infrastructure/                   # 인프라 계층 (외부 의존성)
│   ├── config/                      # 인프라 설정
│   │   ├── DatabaseConfig.java      # 데이터베이스 설정
│   │   ├── SecurityConfig.java      # 보안 설정
│   │   ├── CacheConfig.java         # 캐시 설정
│   │   └── AsyncConfig.java         # 비동기 처리 설정
│   ├── persistence/                 # 데이터 접근 구현
│   │   └── ItemRepositoryImpl.java  # Custom Repository 구현
│   └── external/                    # 외부 서비스 연동
│       ├── EmailService.java        # 이메일 서비스
│       └── FileStorageService.java  # 파일 저장 서비스
├── interfaces/                       # 인터페이스 계층 (Web Layer)
│   ├── rest/                        # REST API Controllers
│   │   ├── v1/                      # API Version 1
│   │   │   ├── ItemController.java
│   │   │   ├── UserController.java
│   │   │   └── AuthController.java
│   │   └── v2/                      # API Version 2 (향후 확장)
│   ├── dto/                         # Interface DTOs
│   │   ├── request/
│   │   └── response/
│   └── security/                    # 웹 보안 컴포넌트
└── global/                          # 전역 컴포넌트
    ├── exception/                   # 전역 예외 처리
    │   ├── GlobalExceptionHandler.java
    │   ├── BusinessException.java
    │   └── ErrorCode.java
    ├── config/                      # 전역 설정
    │   ├── WebConfig.java
    │   └── JacksonConfig.java
    └── util/                        # 유틸리티 클래스

src/main/resources/
├── application.yml                   # 메인 설정
├── application-local.yml            # 로컬 환경 설정
├── application-prod.yml             # 운영 환경 설정
├── db/migration/                    # Flyway 마이그레이션
│   ├── V1__Initial_schema.sql
│   └── V2__Add_entity_categories.sql
├── static/                          # 정적 리소스
├── templates/                       # 템플릿 (필요 시)
└── ehcache.xml                      # EhCache 설정
```

### 패키지 명명 규칙
```java
// 도메인별 패키지 구조
com.backend.domain.{domain}.{component}

// 예시
com.backend.domain.entity.entity.Item
com.backend.domain.entity.repository.ItemRepository  
com.backend.domain.entity.service.ItemDomainService

// 애플리케이션 계층
com.backend.application.{domain}.{component}

// 예시  
com.backend.application.entity.ItemApplicationService
com.backend.application.entity.dto.CreateItemRequest

// 인터페이스 계층
com.backend.interfaces.rest.{version}.{domain}Controller

// 예시
com.backend.interfaces.rest.v1.ItemController
```

---

## 개발 워크플로우

### 1. Feature Development Workflow

#### Git Branch Strategy
```bash
# Feature 브랜치 생성
git checkout -b feature/entity-management
git checkout -b feature/user-authentication
git checkout -b bugfix/session-timeout

# 브랜치 명명 규칙
feature/{feature-name}        # 새로운 기능
bugfix/{bug-description}      # 버그 수정  
hotfix/{critical-fix}         # 긴급 수정
refactor/{refactor-scope}     # 리팩토링
```

#### Development Process
```bash
# 1. 요구사항 분석 및 설계
- 도메인 모델링
- API 설계 (OpenAPI Spec)
- 데이터베이스 스키마 설계

# 2. TDD 개발 사이클
./gradlew test --continuous    # 테스트 자동 실행
# Red -> Green -> Refactor

# 3. 코드 품질 검사
./gradlew check               # 정적 분석
./gradlew jacocoTestReport   # 테스트 커버리지

# 4. 통합 테스트
./gradlew integrationTest    # 통합 테스트 실행

# 5. 문서화 업데이트
./gradlew generateOpenApiDocs # API 문서 생성
```

### 2. Code Review Guidelines

#### Pull Request 체크리스트
```markdown
## PR Checklist
- [ ] 기능 요구사항 구현 완료
- [ ] Unit Test 작성 및 통과 (커버리지 ≥ 80%)
- [ ] Integration Test 통과
- [ ] API 문서 업데이트
- [ ] 보안 취약점 검토 완료
- [ ] 성능 영향 분석 완료
- [ ] 데이터베이스 마이그레이션 검증
- [ ] Code Style Guide 준수
- [ ] 로그 및 에러 처리 적절함

## 변경사항
- 새로운 기능: 엔티티 관리 CRUD API
- 수정된 기능: 사용자 인증 로직 개선
- 삭제된 기능: 없음

## 테스트 시나리오
1. 엔티티 생성 시 권한 검증
2. 엔티티 점수 자동 계산 검증
3. 대량 데이터 처리 성능 검증
```

#### Code Review 기준
```java
// 좋은 예시
@Service
@Transactional
@Slf4j
public class RespApplicationService {
    
    private final RespDomainService domainService;
    private final NotificationService notificationService;
    
    public RespApplicationService(RespDomainService domainService,
                                NotificationService notificationService) {
        this.domainService = domainService;
        this.notificationService = notificationService;
    }
    
    public RespResponse createItem(CreateItemRequest request) {
        log.info("Creating new resp: title={}", request.getTitle());
        
        try {
            Resp resp = Resp.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getProbability())
                .importance(request.getImpact())
                .build();
                
            Resp savedResp = domainService.createItem(resp);
            
            // 비동기 알림 발송
            notificationService.notifyRespCreated(savedResp);
            
            log.info("Resp created successfully: id={}", savedResp.getId());
            return RespResponse.from(savedResp);
            
        } catch (BusinessException e) {
            log.warn("Business rule violation while creating resp: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating resp", e);
            throw new SystemException("리스크 생성 중 시스템 오류가 발생했습니다.", e);
        }
    }
}
```

---

## 코딩 컨벤션

### 1. Java 코딩 스타일

#### 클래스 및 메서드 작성
```java
/**
 * 엔티티 도메인 서비스
 * 엔티티 생명주기 관리 및 비즈니스 규칙 검증 담당
 * 
 * @author Backend Team
 * @since 1.0
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ItemDomainService {
    
    private final ItemRepository itemRepository;
    private final ItemValidator itemValidator;
    
    /**
     * 새로운 엔티티를 생성합니다.
     * 
     * @param item 생성할 엔티티 정보
     * @return 저장된 엔티티 엔티티
     * @throws BusinessException 비즈니스 규칙 위반 시
     */
    public Item createItem(Item item) {
        log.debug("Creating item: title={}, category={}", item.getTitle(), item.getCategory());
        
        // 비즈니스 규칙 검증
        itemValidator.validateForCreation(item);
        
        // 엔티티 점수 계산
        item.calculateScore();
        
        // 도메인 이벤트 등록
        item.registerEvent(new ItemCreatedEvent(item));
        
        Item savedItem = itemRepository.save(item);
        
        log.info("Item created: id={}, score={}", savedItem.getId(), savedItem.getScore());
        return savedItem;
    }
    
    /**
     * 고우선순위 엔티티 목록을 조회합니다.
     * 
     * @param threshold 우선순위 임계값 (기본값: 15)
     * @return 고우선순위 엔티티 목록
     */
    public List<Item> findHighPriorityItems(int threshold) {
        Preconditions.checkArgument(threshold > 0, "Threshold must be positive");
        
        return itemRepository.findByScoreGreaterThanEqual(threshold);
    }
}
```

#### 네이밍 컨벤션
```java
// 클래스명: PascalCase
public class ItemManagementService { }

// 메서드명: camelCase, 동사로 시작
public Item createItem(Item item) { }
public List<Item> findItemsByCategory(ItemCategory category) { }
public boolean isHighPriority() { }

// 변수명: camelCase
private String title;
private LocalDateTime createdAt;
private List<ItemAction> itemActions;

// 상수명: UPPER_SNAKE_CASE
public static final String DEFAULT_ITEM_CATEGORY = "GENERAL";
public static final int MAX_SCORE = 25;

// 패키지명: lowercase
package com.backend.domain.entity.service;
```

### 2. Annotation 사용 가이드

#### Entity 클래스
```java
@Entity
@Table(name = "items", 
       indexes = {
           @Index(name = "idx_item_status", columnList = "status"),
           @Index(name = "idx_item_score", columnList = "score DESC")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Item extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "엔티티 제목은 필수입니다")
    @Size(max = 200, message = "엔티티 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "엔티티 카테고리는 필수입니다")
    private ItemCategory category;
    
    @Range(min = 1, max = 5, message = "우선순위는 1-5 범위여야 합니다")
    @Column(name = "priority")
    private Integer priority;
}
```

#### Service 클래스
```java
@Service
@Transactional(readOnly = true)  // 기본적으로 읽기 전용
@Slf4j
@RequiredArgsConstructor
@Validated
public class ItemQueryService {
    
    @Transactional  // 쓰기 작업에만 적용
    public Item updateItem(Long id, UpdateItemRequest request) {
        // 구현
    }
    
    @Cacheable(value = "items", key = "#category.name()")
    public List<Item> findItemsByCategory(ItemCategory category) {
        // 구현
    }
}
```

#### Controller 클래스
```java
@RestController
@RequestMapping("/api/v1/items")
@Validated
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Item Management", description = "엔티티 관리 API")
public class ItemController {
    
    @PostMapping
    @PreAuthorize("hasRole('ITEM_MANAGER')")
    @Operation(summary = "엔티티 생성", description = "새로운 엔티티를 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "엔티티 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    public ResponseEntity<ItemResponse> createItem(
            @Valid @RequestBody CreateItemRequest request,
            Authentication authentication) {
        
        log.info("Creating item request from user: {}", authentication.getName());
        
        ItemResponse response = itemApplicationService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

---

## API 개발 가이드

### 1. REST API 설계 원칙

#### URL 설계 규칙
```http
# 리소스 기반 URL 설계
GET    /api/v1/items                    # 엔티티 목록 조회
POST   /api/v1/items                    # 엔티티 생성
GET    /api/v1/items/{id}               # 특정 엔티티 조회
PUT    /api/v1/items/{id}               # 엔티티 전체 수정
PATCH  /api/v1/items/{id}               # 엔티티 부분 수정
DELETE /api/v1/items/{id}               # 엔티티 삭제

# 하위 리소스
GET    /api/v1/items/{id}/actions       # 엔티티의 액션 목록
POST   /api/v1/items/{id}/actions       # 엔티티 액션 생성

# 검색 및 필터링
GET    /api/v1/items?category=GENERAL&status=ACTIVE
GET    /api/v1/items?page=0&size=20&sort=createdAt,desc
```

#### HTTP 상태 코드 사용
```java
@RestController
public class ItemController {
    
    @PostMapping
    public ResponseEntity<ItemResponse> createItem(@Valid @RequestBody CreateItemRequest request) {
        ItemResponse response = itemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);  // 201
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItem(@PathVariable Long id) {
        try {
            ItemResponse response = itemService.getItem(id);
            return ResponseEntity.ok(response);  // 200
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();  // 404
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateItemRequest request) {
        
        if (!itemService.existsById(id)) {
            return ResponseEntity.notFound().build();  // 404
        }
        
        ItemResponse response = itemService.updateItem(id, request);
        return ResponseEntity.ok(response);  // 200
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();  // 204
    }
}
```

### 2. Request/Response DTO 설계

#### Request DTO
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateItemRequest {
    
    @NotBlank(message = "엔티티 제목은 필수입니다")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @Size(max = 2000, message = "설명은 2000자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "엔티티 카테고리는 필수입니다")
    private ItemCategory category;
    
    @NotNull(message = "우선순위는 필수입니다")
    @Range(min = 1, max = 5, message = "우선순위는 1-5 범위여야 합니다")
    private Integer priority;
    
    @NotNull(message = "중요도는 필수입니다")
    @Range(min = 1, max = 5, message = "중요도는 1-5 범위여야 합니다")
    private Integer importance;
    
    @Valid
    private List<CreateItemActionRequest> actions;
}
```

#### Response DTO
```java
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ItemResponse {
    
    private Long id;
    private String title;
    private String description;
    private ItemCategory category;
    private ItemStatus status;
    private Integer priority;
    private Integer importance;
    private Integer score;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private UserSummaryResponse owner;
    private List<ItemActionResponse> actions;
    
    public static ItemResponse from(Item item) {
        return ItemResponse.builder()
            .id(item.getId())
            .title(item.getTitle())
            .description(item.getDescription())
            .category(item.getCategory())
            .status(item.getStatus())
            .priority(item.getPriority())
            .importance(item.getImportance())
            .score(item.getScore())
            .createdAt(item.getCreatedAt())
            .updatedAt(item.getUpdatedAt())
            .owner(item.getOwner() != null ? UserSummaryResponse.from(item.getOwner()) : null)
            .actions(item.getActions().stream()
                .map(ItemActionResponse::from)
                .collect(Collectors.toList()))
            .build();
    }
}
```

### 3. 페이징 및 정렬

#### 페이징 구현
```java
@GetMapping
public ResponseEntity<Page<ItemResponse>> getItems(
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
        Pageable pageable,
        
        @RequestParam(required = false) ItemCategory category,
        @RequestParam(required = false) ItemStatus status,
        @RequestParam(required = false) String search) {
    
    ItemSearchCriteria criteria = ItemSearchCriteria.builder()
        .category(category)
        .status(status)
        .searchKeyword(search)
        .build();
    
    Page<ItemResponse> items = itemService.searchItems(criteria, pageable);
    return ResponseEntity.ok(items);
}

// 커스텀 페이징 응답
@Data
@Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;
    private boolean empty;
    
    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .empty(page.isEmpty())
            .build();
    }
}
```

### 4. API 버전 관리

#### URL 기반 버전 관리
```java
// Version 1 API
@RestController
@RequestMapping("/api/v1/items")
public class ItemV1Controller {
    
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseV1> getItem(@PathVariable Long id) {
        // V1 응답 형식
    }
}

// Version 2 API  
@RestController
@RequestMapping("/api/v2/items")
public class ItemV2Controller {
    
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseV2> getItem(@PathVariable Long id) {
        // V2 응답 형식 (추가 필드 포함)
    }
}
```

#### Header 기반 버전 관리
```java
@RestController
@RequestMapping("/api/items")
public class ItemController {
    
    @GetMapping(value = "/{id}", headers = "API-Version=1.0")
    public ResponseEntity<ItemResponseV1> getItemV1(@PathVariable Long id) {
        // V1 처리
    }
    
    @GetMapping(value = "/{id}", headers = "API-Version=2.0")
    public ResponseEntity<ItemResponseV2> getItemV2(@PathVariable Long id) {
        // V2 처리
    }
}
```

---

## 데이터베이스 가이드

### 1. Flyway Migration 관리

#### Migration 파일 명명 규칙
```sql
-- V{version}__{description}.sql
V1__Initial_schema.sql                    -- 초기 스키마
V1.1__Add_resp_table_indexes.sql        -- 인덱스 추가
V2__Add_notification_table.sql          -- 새 테이블 추가
V2.1__Update_user_table_constraints.sql -- 제약조건 수정
V3__Migrate_legacy_resp_data.sql        -- 데이터 마이그레이션
```

#### Migration 작성 가이드
```sql
-- V2__Add_notification_system.sql

-- 알림 테이블 생성
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 기본 데이터 삽입
INSERT INTO notification_templates (type, subject_template, content_template) VALUES 
    ('RESP_CREATED', '새로운 리스크가 등록되었습니다', '리스크 "{title}"이(가) 등록되었습니다.'),
    ('RESP_HIGH_SCORE', '고위험 리스크 알림', '리스크 "{title}"의 위험도가 높습니다. (점수: {score})');

-- 제약조건 추가
ALTER TABLE notifications ADD CONSTRAINT chk_notification_type 
    CHECK (type IN ('RESP_CREATED', 'RESP_UPDATED', 'RESP_HIGH_SCORE', 'SYSTEM_NOTICE'));
```

### 2. JPA Entity 설계

#### Base Entity
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
    
    @Version
    private Long version;
    
    // Domain Event 지원
    @Transient
    private List<DomainEvent> domainEvents = new ArrayList<>();
    
    public void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }
    
    public void clearEvents() {
        domainEvents.clear();
    }
    
    public List<DomainEvent> getEvents() {
        return Collections.unmodifiableList(domainEvents);
    }
}
```

#### 연관관계 매핑 가이드
```java
@Entity
@Table(name = "items")
public class Item extends BaseEntity {
    
    // Many-to-One: 즉시 로딩 (단일 참조)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;
    
    // One-to-Many: 지연 로딩 (컬렉션)
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemAction> actions = new ArrayList<>();
    
    // Many-to-Many: 지연 로딩 + JoinTable
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "item_tags",
        joinColumns = @JoinColumn(name = "item_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
    
    // 연관관계 편의 메서드
    public void addAction(ItemAction action) {
        actions.add(action);
        action.setItem(this);
    }
    
    public void removeAction(ItemAction action) {
        actions.remove(action);
        action.setItem(null);
    }
}
```

### 3. Repository 패턴 구현

#### Basic Repository
```java
public interface ItemRepository extends JpaRepository<Item, Long> {
    
    // Query Methods (Spring Data JPA 자동 생성)
    List<Item> findByStatus(ItemStatus status);
    List<Item> findByCategoryAndStatusOrderByCreatedAtDesc(ItemCategory category, ItemStatus status);
    
    // Custom Queries
    @Query("SELECT i FROM Item i WHERE i.priority * i.importance >= :threshold")
    List<Item> findHighPriorityItems(@Param("threshold") int threshold);
    
    @Query(value = "SELECT * FROM items WHERE score > :score AND created_at > :date", 
           nativeQuery = true)
    List<Item> findRecentHighScoreItems(@Param("score") int score, @Param("date") LocalDateTime date);
    
    // Projection
    @Query("SELECT i.id as id, i.title as title, i.score as score FROM Item i")
    List<ItemSummaryProjection> findItemSummaries();
    
    // Modifying Queries
    @Modifying
    @Query("UPDATE Item i SET i.status = :status WHERE i.id IN :ids")
    int updateItemStatus(@Param("ids") List<Long> ids, @Param("status") ItemStatus status);
}

// Projection Interface
public interface ItemSummaryProjection {
    Long getId();
    String getTitle();
    Integer getScore();
}
```

#### Custom Repository Implementation
```java
// Interface 정의
public interface ItemRepositoryCustom {
    Page<Item> findItemsWithComplexCriteria(ItemSearchCriteria criteria, Pageable pageable);
    List<ItemStatistic> getItemStatistics(LocalDateTime from, LocalDateTime to);
}

// 구현 클래스
@Repository
@RequiredArgsConstructor
public class ItemRepositoryImpl implements ItemRepositoryCustom {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public Page<Item> findItemsWithComplexCriteria(ItemSearchCriteria criteria, Pageable pageable) {
        QItem item = QItem.item;
        QUser user = QUser.user;
        
        BooleanBuilder builder = new BooleanBuilder();
        
        // 동적 쿼리 조건 추가
        if (criteria.getCategory() != null) {
            builder.and(item.category.eq(criteria.getCategory()));
        }
        
        if (criteria.getStatus() != null) {
            builder.and(item.status.eq(criteria.getStatus()));
        }
        
        if (StringUtils.hasText(criteria.getSearchKeyword())) {
            builder.and(item.title.containsIgnoreCase(criteria.getSearchKeyword())
                .or(item.description.containsIgnoreCase(criteria.getSearchKeyword())));
        }
        
        if (criteria.getMinScore() != null) {
            builder.and(item.priority.multiply(item.importance).goe(criteria.getMinScore()));
        }
        
        // 쿼리 실행
        List<Item> content = queryFactory
            .selectFrom(item)
            .leftJoin(item.owner, user).fetchJoin()
            .where(builder)
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .orderBy(getOrderSpecifier(pageable.getSort()))
            .fetch();
        
        // 전체 카운트
        Long totalCount = queryFactory
            .select(item.count())
            .from(item)
            .where(builder)
            .fetchOne();
        
        return new PageImpl<>(content, pageable, totalCount != null ? totalCount : 0L);
    }
    
    private OrderSpecifier<?>[] getOrderSpecifier(Sort sort) {
        List<OrderSpecifier<?>> orders = new ArrayList<>();
        
        for (Sort.Order order : sort) {
            Order direction = order.isAscending() ? Order.ASC : Order.DESC;
            
            switch (order.getProperty()) {
                case "title":
                    orders.add(new OrderSpecifier<>(direction, QItem.item.title));
                    break;
                case "createdAt":
                    orders.add(new OrderSpecifier<>(direction, QItem.item.createdAt));
                    break;
                case "score":
                    orders.add(new OrderSpecifier<>(direction, 
                        QItem.item.priority.multiply(QItem.item.importance)));
                    break;
                default:
                    orders.add(new OrderSpecifier<>(Order.DESC, QItem.item.createdAt));
            }
        }
        
        return orders.toArray(new OrderSpecifier[0]);
    }
}
```

---

## 테스트 가이드

### 1. 테스트 전략

#### 테스트 피라미드
```yaml
테스트 레벨:
  - Unit Tests: 70% (빠른 피드백, 높은 커버리지)
  - Integration Tests: 20% (컴포넌트 간 상호작용)
  - E2E Tests: 10% (전체 워크플로우)

테스트 도구:
  - JUnit 5: 테스트 프레임워크
  - Mockito: Mock 객체 생성
  - TestContainers: 통합테스트용 컨테이너
  - Spring Boot Test: 스프링 컨텍스트 테스트
  - WireMock: 외부 API Mock
```

### 2. Unit Test 작성

#### Service Layer Test
```java
@ExtendWith(MockitoExtension.class)
class ItemDomainServiceTest {
    
    @Mock
    private ItemRepository itemRepository;
    
    @Mock
    private ItemValidator itemValidator;
    
    @InjectMocks
    private ItemDomainService itemDomainService;
    
    @Test
    @DisplayName("엔티티 생성 시 비즈니스 규칙 검증 후 저장")
    void createItem_WhenValidItem_ShouldSaveSuccessfully() {
        // Given
        Item item = Item.builder()
            .title("테스트 엔티티")
            .category(ItemCategory.GENERAL)
            .priority(3)
            .importance(4)
            .build();
        
        Item savedItem = item.toBuilder()
            .id(1L)
            .score(12)
            .build();
        
        when(itemRepository.save(any(Item.class))).thenReturn(savedItem);
        
        // When
        Item result = itemDomainService.createItem(item);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getScore()).isEqualTo(12);
        
        verify(itemValidator).validateForCreation(item);
        verify(itemRepository).save(item);
    }
    
    @Test
    @DisplayName("잘못된 엔티티 생성 시 예외 발생")
    void createItem_WhenInvalidItem_ShouldThrowException() {
        // Given
        Item invalidItem = Item.builder().title("").build();
        
        doThrow(new BusinessException("제목은 필수입니다"))
            .when(itemValidator).validateForCreation(invalidItem);
        
        // When & Then
        assertThatThrownBy(() -> itemDomainService.createItem(invalidItem))
            .isInstanceOf(BusinessException.class)
            .hasMessage("제목은 필수입니다");
        
        verify(itemRepository, never()).save(any(Item.class));
    }
    
    @ParameterizedTest
    @ValueSource(ints = {15, 20, 25})
    @DisplayName("임계값 이상의 고우선순위 엔티티 조회")
    void findHighPriorityItems_WhenThresholdGiven_ShouldReturnHighPriorityItems(int threshold) {
        // Given
        List<Item> highPriorityItems = Arrays.asList(
            createItemWithScore(15),
            createItemWithScore(20),
            createItemWithScore(25)
        );
        
        when(itemRepository.findByScoreGreaterThanEqual(threshold))
            .thenReturn(highPriorityItems.stream()
                .filter(i -> i.getScore() >= threshold)
                .collect(Collectors.toList()));
        
        // When
        List<Item> result = itemDomainService.findHighPriorityItems(threshold);
        
        // Then
        assertThat(result).allMatch(item -> item.getScore() >= threshold);
    }
    
    private Item createItemWithScore(int score) {
        return Item.builder()
            .id((long) score)
            .title("Item " + score)
            .priority(score / 5)
            .importance(score % 5 + 1)
            .score(score)
            .build();
    }
}
```

### 3. Integration Test

#### Repository Integration Test
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ItemRepositoryIntegrationTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Test
    @DisplayName("카테고리별 엔티티 조회 테스트")
    void findByCategoryAndStatus_ShouldReturnMatchingItems() {
        // Given
        User owner = createAndSaveUser("testuser", "test@example.com");
        
        Item generalItem = Item.builder()
            .title("일반 엔티티")
            .category(ItemCategory.GENERAL)
            .status(ItemStatus.ACTIVE)
            .priority(3)
            .importance(4)
            .owner(owner)
            .build();
        
        Item specialItem = Item.builder()
            .title("특별 엔티티")
            .category(ItemCategory.SPECIAL)
            .status(ItemStatus.ACTIVE)
            .priority(2)
            .importance(3)
            .owner(owner)
            .build();
        
        entityManager.persistAndFlush(generalItem);
        entityManager.persistAndFlush(specialItem);
        
        // When
        List<Item> result = itemRepository.findByCategoryAndStatusOrderByCreatedAtDesc(
            ItemCategory.GENERAL, ItemStatus.ACTIVE);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory()).isEqualTo(ItemCategory.GENERAL);
        assertThat(result.get(0).getTitle()).isEqualTo("일반 엔티티");
    }
    
    @Test
    @DisplayName("고우선순위 엔티티 조회 쿼리 테스트")
    void findHighPriorityItems_ShouldReturnItemsAboveThreshold() {
        // Given
        User owner = createAndSaveUser("testuser", "test@example.com");
        
        Item lowPriorityItem = createItem("낮은 우선순위", 2, 2, owner);    // score = 4
        Item mediumPriorityItem = createItem("중간 우선순위", 3, 4, owner);  // score = 12
        Item highPriorityItem = createItem("높은 우선순위", 5, 5, owner);   // score = 25
        
        entityManager.persistAndFlush(lowPriorityItem);
        entityManager.persistAndFlush(mediumPriorityItem);
        entityManager.persistAndFlush(highPriorityItem);
        
        // When
        List<Item> result = itemRepository.findHighPriorityItems(15);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("높은 우선순위");
        assertThat(result.get(0).getPriority() * result.get(0).getImportance()).isGreaterThanOrEqualTo(15);
    }
    
    private User createAndSaveUser(String username, String email) {
        User user = User.builder()
            .username(username)
            .email(email)
            .password("encoded-password")
            .enabled(true)
            .build();
        return entityManager.persistAndFlush(user);
    }
    
    private Item createItem(String title, int priority, int importance, User owner) {
        return Item.builder()
            .title(title)
            .category(ItemCategory.GENERAL)
            .status(ItemStatus.ACTIVE)
            .priority(priority)
            .importance(importance)
            .owner(owner)
            .build();
    }
}
```

#### Web Layer Integration Test
```java
@WebMvcTest(ItemController.class)
@AutoConfigureMockMvc
class ItemControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private ItemApplicationService itemApplicationService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Test
    @DisplayName("엔티티 생성 API 테스트")
    @WithMockUser(roles = "ITEM_MANAGER")
    void createItem_WhenValidRequest_ShouldReturnCreated() throws Exception {
        // Given
        CreateItemRequest request = CreateItemRequest.builder()
            .title("테스트 엔티티")
            .description("테스트용 엔티티입니다")
            .category(ItemCategory.GENERAL)
            .priority(3)
            .importance(4)
            .build();
        
        ItemResponse response = ItemResponse.builder()
            .id(1L)
            .title("테스트 엔티티")
            .category(ItemCategory.GENERAL)
            .status(ItemStatus.ACTIVE)
            .priority(3)
            .importance(4)
            .score(12)
            .createdAt(LocalDateTime.now())
            .build();
        
        when(itemApplicationService.createItem(any(CreateItemRequest.class)))
            .thenReturn(response);
        
        // When & Then
        mockMvc.perform(post("/api/v1/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.title").value("테스트 엔티티"))
            .andExpect(jsonPath("$.category").value("GENERAL"))
            .andExpect(jsonPath("$.score").value(12))
            .andDo(print());
        
        verify(itemApplicationService).createItem(any(CreateItemRequest.class));
    }
    
    @Test
    @DisplayName("잘못된 요청으로 리스크 생성 시 400 에러")
    @WithMockUser(roles = "ITEM_MANAGER")
    void createItem_WhenInvalidRequest_ShouldReturnBadRequest() throws Exception {
        // Given
        CreateItemRequest invalidRequest = CreateItemRequest.builder()
            .title("")  // 빈 제목
            .category(null)  // null 카테고리
            .priority(0)  // 범위 벗어남
            .importance(6)       // 범위 벗어남
            .build();
        
        // When & Then
        mockMvc.perform(post("/api/v1/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Validation Failed"))
            .andExpect(jsonPath("$.errors").isArray())
            .andExpected(jsonPath("$.errors", hasSize(greaterThan(0))))
            .andDo(print());
        
        verify(itemApplicationService, never()).createItem(any());
    }
    
    @Test
    @DisplayName("권한 없는 사용자의 리스크 생성 시도")
    @WithMockUser(roles = "USER")  // ITEM_MANAGER 권한 없음
    void createItem_WhenUnauthorized_ShouldReturnForbidden() throws Exception {
        // Given
        CreateItemRequest request = CreateItemRequest.builder()
            .title("테스트 엔티티")
            .category(ItemCategory.GENERAL)
            .priority(3)
            .importance(4)
            .build();
        
        // When & Then
        mockMvc.perform(post("/api/v1/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
        
        verify(itemApplicationService, never()).createItem(any());
    }
}
```

### 4. Test Configuration

#### Test Profile 설정
```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driver-class-name: org.h2.Driver
    username: sa
    password:
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
        format_sql: true
    show-sql: true
  
  flyway:
    enabled: false  # 테스트에서는 DDL auto로 스키마 생성
    
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
    com.rsms: DEBUG
```

#### Test Data Builder
```java
// Test용 Builder Pattern
public class RespTestDataBuilder {
    
    private String title = "Default Resp";
    private String description = "Default Description";
    private RespCategory category = ItemCategory.GENERAL;
    private RespStatus status = RespStatus.ACTIVE;
    private Integer priority = 3;
    private Integer importance = 3;
    private User owner;
    
    public static RespTestDataBuilder aResp() {
        return new RespTestDataBuilder();
    }
    
    public RespTestDataBuilder withTitle(String title) {
        this.title = title;
        return this;
    }
    
    public RespTestDataBuilder withCategory(RespCategory category) {
        this.category = category;
        return this;
    }
    
    public RespTestDataBuilder withHighRespScore() {
        this.priority = 5;
        this.importance = 5;
        return this;
    }
    
    public RespTestDataBuilder withOwner(User owner) {
        this.owner = owner;
        return this;
    }
    
    public Resp build() {
        return Resp.builder()
            .title(title)
            .description(description)
            .category(category)
            .status(status)
            .priority(priority)
            .importance(importance)
            .owner(owner)
            .build();
    }
    
    public CreateItemRequest buildRequest() {
        return CreateItemRequest.builder()
            .title(title)
            .description(description)
            .category(category)
            .priority(priority)
            .importance(importance)
            .build();
    }
}

// 사용 예시
@Test
void testHighRespCreation() {
    Resp highResp = RespTestDataBuilder.aResp()
        .withTitle("High Priority Resp")
        .withCategory(RespCategory.FINANCIAL)
        .withHighRespScore()
        .withOwner(testUser)
        .build();
    
    // 테스트 로직
}
```

---

## 성능 최적화

### 1. Database Query 최적화

#### N+1 Problem 해결
```java
// 문제가 있는 코드 (N+1 쿼리 발생)
@Service
public class RespQueryService {
    
    public List<RespResponse> getAllResps() {
        List<Resp> resp = respRepository.findAll();
        
        return resp.stream()
            .map(resp -> {
                // 각 Resp마다 추가 쿼리 발생 (N+1 Problem)
                User owner = resp.getOwner();  // Lazy Loading
                List<RespAction> actions = resp.getActions();  // Lazy Loading
                
                return RespResponse.from(resp);
            })
            .collect(Collectors.toList());
    }
}

// 해결방법 1: Fetch Join 사용
@Repository
public interface RespRepository extends JpaRepository<Resp, Long> {
    
    @Query("SELECT DISTINCT r FROM Resp r " +
           "LEFT JOIN FETCH r.owner " +
           "LEFT JOIN FETCH r.actions")
    List<Resp> findAllWithOwnerAndActions();
}

// 해결방법 2: EntityGraph 사용
@Repository
public interface RespRepository extends JpaRepository<Resp, Long> {
    
    @EntityGraph(attributePaths = {"owner", "actions"})
    List<Resp> findAll();
}

// 해결방법 3: Projection 사용
public interface RespSummaryProjection {
    Long getId();
    String getTitle();
    RespCategory getCategory();
    Integer getRespScore();
    String getOwnerName();
}

@Query("SELECT r.id as id, r.title as title, r.category as category, " +
       "(r.priority * r.importance) as score, r.owner.username as ownerName " +
       "FROM Resp r LEFT JOIN r.owner")
List<RespSummaryProjection> findRespSummaries();
```

#### Batch Processing
```java
@Service
@Transactional
public class RespBatchService {
    
    private static final int BATCH_SIZE = 100;
    
    @Autowired
    private EntityManager entityManager;
    
    public void batchCreateResps(List<CreateItemRequest> requests) {
        for (int i = 0; i < requests.size(); i++) {
            Resp resp = createItemFromRequest(requests.get(i));
            entityManager.persist(resp);
            
            // 배치 크기마다 플러시 및 클리어
            if (i % BATCH_SIZE == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
    }
    
    @BatchSize(50)  // Hibernate Batch Size
    public void batchUpdateRespScores(List<Long> respIds) {
        List<Resp> resps = respRepository.findAllById(respIds);
        
        resps.forEach(resp -> {
            resp.calculateRespScore();
            entityManager.merge(resp);
        });
        
        entityManager.flush();
    }
}
```

### 2. Caching Strategy

#### Query Result Caching
```java
@Service
@CacheConfig(cacheNames = "resps")
public class RespQueryService {
    
    @Cacheable(key = "#category.name() + '_' + #status.name()")
    public List<RespSummary> getRespsByCategory(RespCategory category, RespStatus status) {
        return respRepository.findByCategoryAndStatus(category, status)
            .stream()
            .map(RespSummary::from)
            .collect(Collectors.toList());
    }
    
    @Cacheable(key = "'statistics_' + #from.toString() + '_' + #to.toString()")
    public RespStatistics getRespStatistics(LocalDateTime from, LocalDateTime to) {
        // 복잡한 통계 계산
        return calculateStatistics(from, to);
    }
    
    @CacheEvict(allEntries = true)
    public void invalidateAllCache() {
        // 캐시 전체 무효화
    }
    
    @CacheEvict(key = "#resp.category.name() + '_*'")
    public void invalidateCategoryCache(Resp resp) {
        // 특정 카테고리 캐시만 무효화
    }
}
```

#### Cache Configuration
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }
    
    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
            .initialCapacity(100)
            .maximumSize(1000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .recordStats();
    }
    
    // 캐시별 상세 설정
    @Bean
    public CacheManager customCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        
        // 리스크 목록 캐시: 10분 TTL
        manager.registerCustomCache("resp-list", 
            Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500)
                .build());
        
        // 통계 캐시: 1시간 TTL
        manager.registerCustomCache("resp-statistics",
            Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .maximumSize(100)
                .build());
        
        return manager;
    }
}
```

### 3. Async Processing

#### Async Service
```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("RSMS-Async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new SimpleAsyncUncaughtExceptionHandler();
    }
}

@Service
@Slf4j
public class NotificationService {
    
    @Async
    @Retryable(value = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public CompletableFuture<Void> sendRespCreatedNotification(Resp resp) {
        log.info("Sending resp created notification asynchronously for resp: {}", resp.getId());
        
        try {
            // 이메일 발송 로직
            emailService.sendRespAlert(resp);
            
            // 슬랙 알림 발송
            slackService.sendRespNotification(resp);
            
            log.info("Notifications sent successfully for resp: {}", resp.getId());
            return CompletableFuture.completedFuture(null);
            
        } catch (Exception e) {
            log.error("Failed to send notifications for resp: {}", resp.getId(), e);
            throw e;
        }
    }
    
    @Recover
    public CompletableFuture<Void> recover(Exception ex, Resp resp) {
        log.error("All retry attempts failed for resp notification: {}", resp.getId(), ex);
        // 실패 처리 로직 (예: 실패 로그 저장)
        return CompletableFuture.completedFuture(null);
    }
}
```

---

## 보안 가이드

### 1. Input Validation

#### DTO Validation
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateItemRequest {
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(min = 1, max = 200, message = "제목은 1-200자 사이여야 합니다")
    @Pattern(regexp = "^[\\w\\s\\-_.가-힣]+$", message = "제목에 허용되지 않은 문자가 포함되어 있습니다")
    private String title;
    
    @Size(max = 2000, message = "설명은 2000자를 초과할 수 없습니다")
    @SafeHtml(whitelistType = SafeHtml.WhiteListType.NONE)
    private String description;
    
    @NotNull(message = "카테고리는 필수입니다")
    @Valid
    private RespCategory category;
    
    @NotNull(message = "확률은 필수입니다")
    @Range(min = 1, max = 5, message = "확률은 1-5 범위여야 합니다")
    private Integer priority;
    
    @Email(message = "올바른 이메일 형식이어야 합니다")
    private String contactEmail;
}

// Custom Validator
@Component
public class RespValidator {
    
    public void validateForCreation(@Valid Resp resp) {
        // 비즈니스 규칙 검증
        if (resp.getProbability() * resp.getImpact() >= 20) {
            if (StringUtils.isEmpty(resp.getDescription())) {
                throw new BusinessException("고위험 리스크는 상세 설명이 필수입니다");
            }
        }
        
        // XSS 방지
        resp.setTitle(HtmlUtils.htmlEscape(resp.getTitle()));
        if (resp.getDescription() != null) {
            resp.setDescription(HtmlUtils.htmlEscape(resp.getDescription()));
        }
    }
}
```

### 2. SQL Injection 방지

#### Parameterized Queries
```java
// 안전한 쿼리 (Parameterized)
@Query("SELECT r FROM Resp r WHERE r.title LIKE %:keyword% AND r.category = :category")
List<Resp> findByTitleContainingAndCategory(@Param("keyword") String keyword, 
                                           @Param("category") RespCategory category);

// QueryDSL 사용 (타입 세이프)
public List<Resp> findRespsWithDynamicFilter(RespSearchCriteria criteria) {
    QResp resp = QResp.resp;
    BooleanBuilder builder = new BooleanBuilder();
    
    if (StringUtils.hasText(criteria.getTitle())) {
        builder.and(resp.title.containsIgnoreCase(criteria.getTitle()));
    }
    
    if (criteria.getCategory() != null) {
        builder.and(resp.category.eq(criteria.getCategory()));
    }
    
    return queryFactory
        .selectFrom(resp)
        .where(builder)
        .fetch();
}

// 위험한 예시 (사용 금지)
// String query = "SELECT * FROM resps WHERE title = '" + userInput + "'";
```

### 3. Authentication & Authorization

#### Method Level Security
```java
@Service
@PreAuthorize("hasRole('ADMIN') or hasRole('ITEM_MANAGER')")
public class RespManagementService {
    
    @PreAuthorize("hasRole('ITEM_MANAGER') or @RespSecurityService.canModifyResp(#respId, authentication.name)")
    public RespResponse updateResp(Long respId, UpdateRespRequest request) {
        // 구현
    }
    
    @PreAuthorize("@RespSecurityService.canViewResp(#respId, authentication.name)")
    public RespResponse getResp(Long respId) {
        // 구현
    }
    
    @PostAuthorize("@respSecurityService.filterSensitiveData(returnObject, authentication)")
    public List<RespResponse> searchResps(RespSearchCriteria criteria) {
        // 구현
    }
}

@Component("respSecurityService")
@RequiredArgsConstructor
public class RespSecurityService {
    
    private final RespRepository respRepository;
    
    public boolean canViewResp(Long respId, String username) {
        return respRepository.findById(respId)
            .map(resp -> resp.getOwner().getUsername().equals(username) || 
                        resp.getVisibility() == Visibility.PUBLIC)
            .orElse(false);
    }
    
    public boolean canModifyResp(Long respId, String username) {
        return respRepository.findById(respId)
            .map(resp -> resp.getOwner().getUsername().equals(username))
            .orElse(false);
    }
    
    public List<RespResponse> filterSensitiveData(List<RespResponse> resps, Authentication auth) {
        if (hasRole(auth, "ADMIN")) {
            return resps; // 관리자는 모든 데이터 볼 수 있음
        }
        
        return resps.stream()
            .map(resp -> resp.toBuilder()
                .confidentialInfo(null) // 민감 정보 제거
                .build())
            .collect(Collectors.toList());
    }
}
```

### 4. Data Encryption

#### Sensitive Data Encryption
```java
@Component
public class AESEncryptor {
    
    @Value("${app.encryption.key}")
    private String encryptionKey;
    
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 16;
    
    public String encrypt(String plainText) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), "AES");
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            byte[] iv = new byte[IV_LENGTH];
            SecureRandom.getInstanceStrong().nextBytes(iv);
            
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, parameterSpec);
            
            byte[] encryptedData = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            ByteBuffer byteBuffer = ByteBuffer.allocate(IV_LENGTH + encryptedData.length);
            byteBuffer.put(iv);
            byteBuffer.put(encryptedData);
            
            return Base64.getEncoder().encodeToString(byteBuffer.array());
            
        } catch (Exception e) {
            throw new SecurityException("암호화 실패", e);
        }
    }
    
    public String decrypt(String encryptedText) {
        try {
            byte[] decodedData = Base64.getDecoder().decode(encryptedText);
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
            
            byte[] iv = new byte[IV_LENGTH];
            byteBuffer.get(iv);
            
            byte[] encryptedBytes = new byte[byteBuffer.remaining()];
            byteBuffer.get(encryptedBytes);
            
            SecretKeySpec keySpec = new SecretKeySpec(encryptionKey.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, parameterSpec);
            
            byte[] decryptedData = cipher.doFinal(encryptedBytes);
            return new String(decryptedData, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            throw new SecurityException("복호화 실패", e);
        }
    }
}

// JPA Converter로 자동 암/복호화
@Converter
@Component
@RequiredArgsConstructor
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    
    private final AESEncryptor encryptor;
    
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute != null ? encryptor.encrypt(attribute) : null;
    }
    
    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData != null ? encryptor.decrypt(dbData) : null;
    }
}

// 사용 예시
@Entity
public class UserProfile {
    
    @Column(name = "email")
    @Convert(converter = EncryptedStringConverter.class)
    private String email;
    
    @Column(name = "phone")
    @Convert(converter = EncryptedStringConverter.class)
    private String phoneNumber;
}
```

---

## 문제 해결

### 1. 일반적인 문제들

#### Database Connection Issues
```bash
# 문제: 데이터베이스 연결 실패
# 해결방법:
1. PostgreSQL 서비스 상태 확인
   sudo systemctl status postgresql
   sudo systemctl start postgresql

2. 연결 정보 확인 (WSL 환경)
   psql -h 172.21.174.2 -U postgres -d postgres
   
3. 방화벽 설정 확인
   sudo ufw status
   
4. PostgreSQL 설정 확인
   # postgresql.conf: listen_addresses
   # pg_hba.conf: 인증 방식
```

#### Memory Issues
```yaml
# 문제: OutOfMemoryError
# 해결방법:
# 1. JVM 메모리 설정
JAVA_OPTS: -Xms512m -Xmx2g -XX:NewRatio=2 -XX:+UseG1GC

# 2. HikariCP 설정 최적화
spring.datasource.hikari.maximum-pool-size: 10
spring.datasource.hikari.minimum-idle: 2

# 3. JPA 배치 설정
spring.jpa.properties.hibernate.jdbc.batch_size: 25
spring.jpa.properties.hibernate.order_inserts: true
spring.jpa.properties.hibernate.order_updates: true
```

#### Performance Issues
```java
// 문제: 느린 쿼리 성능
// 해결방법:
1. 쿼리 실행 계획 분석
   @Query(value = "EXPLAIN ANALYZE SELECT * FROM items WHERE ...", nativeQuery = true)
   
2. 인덱스 추가
   CREATE INDEX CONCURRENTLY idx_items_category_status ON items(category, status);
   
3. N+1 문제 해결
   @EntityGraph(attributePaths = {"owner", "actions"})
   
4. Projection 사용
   public interface ItemSummaryProjection {
       Long getId();
       String getTitle();
       Integer getScore();
   }
```

### 2. 로깅 및 모니터링

#### Application Logging
```java
@RestController
@Slf4j
public class RespController {
    
    @PostMapping
    public ResponseEntity<RespResponse> createItem(@RequestBody CreateItemRequest request) {
        String correlationId = UUID.randomUUID().toString();
        MDC.put("correlationId", correlationId);
        
        try {
            log.info("Creating resp request started: title={}, category={}", 
                    request.getTitle(), request.getCategory());
            
            RespResponse response = respService.createItem(request);
            
            log.info("Resp created successfully: id={}, score={}", 
                    response.getId(), response.getRespScore());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (BusinessException e) {
            log.warn("Business rule violation: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error occurred while creating resp", e);
            throw new SystemException("시스템 오류가 발생했습니다", e);
        } finally {
            MDC.clear();
        }
    }
}
```

#### Custom Health Indicators
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    private final JdbcTemplate jdbcTemplate;
    
    @Override
    public Health health() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            
            long activeConnections = getActiveConnections();
            long totalConnections = getTotalConnections();
            
            if (activeConnections > totalConnections * 0.8) {
                return Health.down()
                    .withDetail("reason", "Connection pool nearly exhausted")
                    .withDetail("active", activeConnections)
                    .withDetail("total", totalConnections)
                    .build();
            }
            
            return Health.up()
                .withDetail("database", "PostgreSQL")
                .withDetail("active_connections", activeConnections)
                .withDetail("total_connections", totalConnections)
                .build();
                
        } catch (Exception e) {
            return Health.down(e).build();
        }
    }
}
```

### 3. 디버깅 가이드

#### Common Debug Scenarios
```java
// 1. JPA 쿼리 디버깅
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

// 2. Spring Security 디버깅
logging.level.org.springframework.security=DEBUG

// 3. Transaction 디버깅
logging.level.org.springframework.transaction=DEBUG

// 4. Cache 디버깅
logging.level.org.springframework.cache=DEBUG
```

#### Debug Annotations
```java
@RestController
@Slf4j
public class DebugController {
    
    @GetMapping("/debug/resp/{id}")
    public ResponseEntity<?> debugResp(@PathVariable Long id) {
        Map<String, Object> debug = new HashMap<>();
        
        try {
            Resp resp = respRepository.findById(id).orElse(null);
            debug.put("resp", resp != null);
            
            if (resp != null) {
                debug.put("resp_id", resp.getId());
                debug.put("lazy_loaded_owner", resp.getOwner() != null);
                debug.put("actions_count", resp.getActions().size());
            }
            
            debug.put("current_user", SecurityContextHolder.getContext().getAuthentication().getName());
            debug.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            debug.put("stack_trace", Arrays.toString(e.getStackTrace()));
        }
        
        return ResponseEntity.ok(debug);
    }
}
```

---

## 📚 참고 자료

### Official Documentation
- [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/3.3.5/reference/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Java 21 Documentation](https://docs.oracle.com/en/java/javase/21/)

### Best Practices
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://domainlanguage.com/ddd/)
- [Spring Boot Best Practices](https://springframework.guru/spring-boot-best-practices/)

### Performance & Security
- [JVM Performance Tuning](https://docs.oracle.com/en/java/javase/21/vm/)
- [Spring Security Best Practices](https://docs.spring.io/spring-security/reference/features/exploits/index.html)
- [Database Performance Optimization](https://www.postgresql.org/docs/current/performance-tips.html)

---

**📅 마지막 업데이트**: 2025-09-05  
**🚀 Version**: 1.0  
**📝 작성자**: Backend Development Team
