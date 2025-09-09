# 🏗️ Entity Management System Backend Architecture

**Java 21 + Spring Boot 3.3.5 기반 엔터프라이즈급 백엔드 시스템**

---

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [아키텍처 원칙](#아키텍처-원칙)  
3. [레이어 구조](#레이어-구조)
4. [도메인 설계](#도메인-설계)
5. [데이터 아키텍처](#데이터-아키텍처)
6. [보안 아키텍처](#보안-아키텍처)
7. [성능 아키텍처](#성능-아키텍처)
8. [확장성 설계](#확장성-설계)

---

## 시스템 개요

### 핵심 기술 스택
```yaml
Runtime:
  - Java 21 (OpenJDK LTS)
  - Spring Boot 3.3.5
  - Spring Framework 6.1.14
  
Data Layer:
  - PostgreSQL 17.6 (Primary Database)
  - Flyway (Database Migration)
  - Spring Data JPA + Hibernate ORM
  - HikariCP (Connection Pooling)
  
Security:
  - Spring Security 6.3.4
  - Database Session Storage
  - BCrypt Password Encoding
  - CORS Configuration
  
Caching:
  - Ehcache 3 (Local Cache)
  - Redis 지원 준비 (향후 확장)
  
Monitoring:
  - Spring Boot Actuator
  - Micrometer Metrics
  - Health Checks
  
Documentation:
  - SpringDoc OpenAPI 3
  - Swagger UI Integration
```

### 시스템 특징
- **모던 Java**: Java 21 Virtual Threads와 최신 언어 기능 활용
- **클린 아키텍처**: DDD와 Hexagonal Architecture 혼합 적용
- **확장 가능**: Redis 추가, 마이크로서비스 전환 용이
- **보안 우선**: Defense-in-Depth 보안 전략
- **성능 최적화**: 커넥션 풀링, 캐싱, 쿼리 최적화

---

## 아키텍처 원칙

### SOLID 원칙 적용
```java
// Single Responsibility - 단일 책임 원칙
@Service
public class EntityAnalysisService {
    // 엔티티 분석에만 집중
}

// Open/Closed - 개방/폐쇄 원칙  
public interface ItemCalculator {
    ItemScore calculate(Entity entity);
}

// Dependency Inversion - 의존성 역전
@Service
public class EntityService {
    private final EntityRepository repository; // 추상화에 의존
    private final ItemCalculator calculator;
}
```

### Domain-Driven Design (DDD)
- **Bounded Context**: 각 도메인의 경계 명확화
- **Aggregate**: 데이터 일관성 보장
- **Domain Service**: 핵심 비즈니스 로직 캡슐화
- **Repository Pattern**: 데이터 접근 추상화

### Clean Architecture 레이어링
```
┌─────────────────────────┐
│     Interfaces          │ ← REST Controllers, Web Layer
├─────────────────────────┤
│     Application         │ ← Use Cases, Application Services  
├─────────────────────────┤
│     Domain              │ ← Business Logic, Entities
├─────────────────────────┤
│     Infrastructure      │ ← Database, External Services
└─────────────────────────┘
```

---

## 레이어 구조

### 1. Interfaces Layer (인터페이스 계층)
**경로**: `src/main/java/com/ems/interfaces/`

```java
// REST API Controllers
@RestController
@RequestMapping("/api/v1/entities")
@Validated
public class EntityController {
    
    private final EntityApplicationService entityService;
    
    @PostMapping
    @PreAuthorize("hasRole('ENTITY_MANAGER')")
    public ResponseEntity<EntityResponse> createEntity(
            @Valid @RequestBody CreateEntityRequest request) {
        return ResponseEntity.ok(entityService.createEntity(request));
    }
}

// Request/Response DTOs
@Data
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateEntityRequest {
    @NotBlank @Size(max = 200)
    private String title;
    
    @NotNull
    private EntityCategory category;
    
    @Range(min = 1, max = 5)
    private Integer priority;
}
```

**책임**:
- HTTP 요청/응답 처리
- 인증/인가 적용
- 입력 데이터 검증
- DTO 변환

### 2. Application Layer (애플리케이션 계층)  
**경로**: `src/main/java/com/ems/application/`

```java
// Use Case 구현
@Service
@Transactional
public class EntityApplicationService {
    
    private final EntityDomainService entityDomainService;
    private final EntityRepository entityRepository;
    private final NotificationService notificationService;
    
    public EntityResponse createEntity(CreateEntityRequest request) {
        // 1. 도메인 객체 생성
        Entity entity = Entity.builder()
            .title(request.getTitle())
            .category(request.getCategory())
            .priority(request.getPriority())
            .value(request.getValue())
            .build();
            
        // 2. 도메인 서비스 호출
        Entity savedEntity = entityDomainService.createEntity(entity);
        
        // 3. 부가 작업 (알림, 로깅 등)
        notificationService.notifyEntityCreated(savedEntity);
        
        return EntityResponse.from(savedEntity);
    }
}

// 캐싱 서비스
@Service
public class CacheService {
    
    @Cacheable("entities")
    public List<Entity> getCachedEntities(EntityFilter filter) {
        return entityRepository.findByFilter(filter);
    }
    
    @CacheEvict(value = "entities", allEntries = true)
    public void invalidateEntityCache() {
        // 캐시 무효화
    }
}
```

**책임**:
- Use Case 오케스트레이션
- 트랜잭션 관리
- 도메인 서비스 조합
- 캐싱 전략
- 이벤트 발행

### 3. Domain Layer (도메인 계층)
**경로**: `src/main/java/com/ems/domain/`

```java
// Domain Entity
@Entity
@Table(name = "entities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Entity extends BaseEntity {
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityCategory category;
    
    @Enumerated(EnumType.STRING)  
    @Builder.Default
    private EntityStatus status = EntityStatus.ACTIVE;
    
    @Range(min = 1, max = 5)
    private Integer priority;
    
    @Range(min = 1, max = 5)
    private Integer value;
    
    // Business Logic Methods
    public ItemScore calculateItemScore() {
        return ItemScore.of(priority * value);
    }
    
    public boolean isHighPriority() {
        return calculateItemScore().getValue() >= 15;
    }
    
    public void process(String processingPlan) {
        validateProcessingAllowed();
        this.status = EntityStatus.PROCESSING;
        // 도메인 이벤트 발행
        registerEvent(new EntityProcessingStartedEvent(this.getId()));
    }
    
    private void validateProcessingAllowed() {
        if (this.status == EntityStatus.COMPLETED) {
            throw new BusinessRuleException("이미 완료된 엔티티는 처리할 수 없습니다.");
        }
    }
}

// Domain Service
@Service
public class EntityDomainService {
    
    public Entity createEntity(Entity entity) {
        // 비즈니스 규칙 검증
        validateEntityCreation(entity);
        
        // 엔티티 점수 자동 계산
        entity.calculateItemScore();
        
        return entityRepository.save(entity);
    }
    
    public List<Entity> getHighPriorityEntities() {
        return entityRepository.findAll()
            .stream()
            .filter(Entity::isHighPriority)
            .collect(Collectors.toList());
    }
}

// Repository Interface
public interface EntityRepository extends JpaRepository<Entity, Long> {
    List<Entity> findByStatusAndCategoryOrderByCreatedAtDesc(
        EntityStatus status, EntityCategory category);
    
    @Query("SELECT e FROM Entity e WHERE e.priority * e.value >= :threshold")
    List<Entity> findHighPriorityItems(@Param("threshold") int threshold);
}
```

**책임**:
- 핵심 비즈니스 로직
- 도메인 규칙 검증
- 엔티티 라이프사이클 관리
- 도메인 이벤트 처리

### 4. Infrastructure Layer (인프라 계층)
**경로**: `src/main/java/com/ems/infrastructure/`

```java
// Database Configuration
@Configuration
@EnableJpaRepositories(basePackages = "com.ems.domain")
@EnableJpaAuditing
public class DatabaseConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariConfig hikariConfig() {
        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        return config;
    }
}

// Security Configuration  
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/entities").hasRole("ENTITY_MANAGER")
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .build();
    }
}
```

---

## 도메인 설계

### Core Domains (핵심 도메인)

#### 1. Entity Management (엔티티 관리)
```
Entity Aggregate:
├── Entity (Root Entity)
├── EntityAction (Entity) 
├── EntityAttachment (Entity)
└── EntityComment (Value Object)

Bounded Context: 엔티티 생성, 평가, 처리, 모니터링
```

#### 2. User Management (사용자 관리)  
```
User Aggregate:
├── User (Root Entity)
├── Role (Entity)
├── Permission (Entity)
└── UserSession (Value Object)

Bounded Context: 인증, 인가, 사용자 프로필
```

#### 3. Report & Analytics (보고서 & 분석)
```
Report Aggregate:
├── Report (Root Entity)
├── ReportTemplate (Entity)
└── ReportData (Value Object)

Dashboard Aggregate:
├── Dashboard (Root Entity)
├── Widget (Entity)
└── ChartConfig (Value Object)

Bounded Context: 데이터 분석, 시각화, 보고서 생성
```

### Supporting Domains (지원 도메인)

#### Notification (알림)
```java
@Entity
public class Notification extends BaseEntity {
    private NotificationType type;
    private String recipient;
    private String subject;
    private String content;
    private NotificationStatus status;
    
    public void markAsRead() {
        this.status = NotificationStatus.READ;
        this.readAt = LocalDateTime.now();
    }
}
```

#### Audit (감사)
```java  
@Entity
@EntityListeners(AuditingEntityListener.class)
public class AuditLog extends BaseEntity {
    private String entityType;
    private Long entityId;
    private AuditAction action;
    private String oldValues;
    private String newValues;
    private String userId;
    
    @CreatedDate
    private LocalDateTime performedAt;
}
```

---

## 데이터 아키텍처

### Database Schema Design

```sql
-- 핵심 테이블 구조
CREATE TABLE entities (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    priority INTEGER CHECK (priority >= 1 AND priority <= 5),
    value INTEGER CHECK (value >= 1 AND value <= 5),
    item_score INTEGER GENERATED ALWAYS AS (priority * value) STORED,
    owner_id BIGINT REFERENCES users(id),
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- 인덱스 전략
CREATE INDEX idx_entities_status ON entities(status);
CREATE INDEX idx_entities_category ON entities(category);
CREATE INDEX idx_entities_score ON entities(item_score DESC);
CREATE INDEX idx_entities_created_at ON entities(created_at DESC);
CREATE INDEX idx_entities_owner ON entities(owner_id);
```

### Connection Pool Configuration
```yaml
spring:
  datasource:
    hikari:
      pool-name: EMS-HikariPool
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

### Query Optimization Strategy
```java
// N+1 문제 해결
@Query("SELECT e FROM Entity e JOIN FETCH e.actions WHERE e.status = :status")
List<Entity> findByStatusWithActions(@Param("status") EntityStatus status);

// Projection 활용
public interface EntitySummary {
    Long getId();
    String getTitle();
    EntityStatus getStatus();
    Integer getItemScore();
}

@Query("SELECT e.id as id, e.title as title, e.status as status, " +
       "(e.priority * e.value) as itemScore FROM Entity e")
List<EntitySummary> findEntitySummaries();
```

---

## 보안 아키텍처

### Defense-in-Depth Strategy

#### 1. 인증 (Authentication)
```java
@Component
public class DatabaseUserDetailsService implements UserDetailsService {
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword()) // BCrypt 암호화됨
            .authorities(getAuthorities(user.getRoles()))
            .accountExpired(!user.isEnabled())
            .accountLocked(user.isLocked())
            .build();
    }
}
```

#### 2. 인가 (Authorization)
```java
// Method Level Security
@PreAuthorize("hasRole('ENTITY_MANAGER') or @entityService.isEntityOwner(#entityId, authentication.name)")
public EntityResponse updateEntity(Long entityId, UpdateEntityRequest request) {
    // ...
}

// Domain Level Security
@Component("entitySecurity") 
public class EntitySecurityService {
    
    public boolean canViewEntity(Long entityId, String username) {
        Entity entity = entityRepository.findById(entityId).orElse(null);
        return entity != null && (entity.isPublic() || entity.getOwner().getUsername().equals(username));
    }
}
```

#### 3. 데이터 보호
```java
// 민감 정보 암호화
@Entity
public class UserProfile {
    
    @Column(name = "email")
    @Convert(converter = StringCryptoConverter.class)
    private String email;
    
    @Column(name = "phone")  
    @Convert(converter = StringCryptoConverter.class)
    private String phone;
}

// SQL Injection 방지
@Query("SELECT u FROM User u WHERE u.email = :email AND u.status = 'ACTIVE'")
Optional<User> findActiveUserByEmail(@Param("email") String email);
```

#### 4. 세션 관리
```java
// Database Session Configuration
@Configuration
@EnableSpringHttpSession  
public class SessionConfig {
    
    @Bean
    public JdbcIndexedSessionRepository sessionRepository(
            JdbcOperations jdbcOperations,
            TransactionOperations transactionOperations) {
        return new JdbcIndexedSessionRepository(jdbcOperations, transactionOperations);
    }
}
```

### Security Headers
```java
@Configuration
public class SecurityHeadersConfig {
    
    @Bean
    public SecurityFilterChain securityHeaders(HttpSecurity http) throws Exception {
        return http
            .headers(headers -> headers
                .frameOptions().deny()
                .contentTypeOptions().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubdomains(true))
                .and())
            .build();
    }
}
```

---

## 성능 아키텍처

### 1. 캐싱 전략

#### Local Caching (Ehcache)
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        EhCacheCacheManager cacheManager = new EhCacheCacheManager();
        cacheManager.setCacheManager(ehCacheManager().getObject());
        return cacheManager;
    }
    
    @Bean
    public EhCacheManagerFactoryBean ehCacheManager() {
        EhCacheManagerFactoryBean factory = new EhCacheManagerFactoryBean();
        factory.setConfigLocation(new ClassPathResource("ehcache.xml"));
        factory.setShared(true);
        return factory;
    }
}

// Cache Usage
@Service
public class EntityQueryService {
    
    @Cacheable(value = "entitySummaries", key = "#filter.hashCode()")
    public List<EntitySummary> getEntitySummaries(EntityFilter filter) {
        return entityRepository.findSummariesByFilter(filter);
    }
    
    @CacheEvict(value = "entitySummaries", allEntries = true)
    public void invalidateEntityCache() {
        // 캐시 무효화
    }
}
```

#### Redis Integration (향후 확장)
```yaml
# application-redis.yml
spring:
  redis:
    host: localhost
    port: 6379
    timeout: 2000ms
    connection-pool:
      max-active: 8
      max-idle: 8
      min-idle: 0
  cache:
    type: redis
    redis:
      time-to-live: 600000
```

### 2. Database Optimization

#### Connection Pool Tuning
```properties
# HikariCP 최적화
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.connection-timeout=30000
```

#### Query Performance
```java
// Batch Operations
@Repository
public class EntityRepositoryImpl {
    
    @BatchSize(50)
    public void batchUpdateItemScores(List<Entity> entities) {
        entities.forEach(entity -> {
            entity.setItemScore(entity.calculateItemScore());
            entityManager.merge(entity);
        });
        entityManager.flush();
    }
}

// Pagination
@RestController
public class RespController {
    
    @GetMapping
    public Page<EntityResponse> getEntities(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) 
            Pageable pageable) {
        return entityService.getEntities(pageable);
    }
}
```

### 3. Async Processing
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
        executor.setThreadNamePrefix("EMS-Async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class NotificationService {
    
    @Async
    public CompletableFuture<Void> sendEntityAlert(Entity entity) {
        // 비동기 알림 발송
        return CompletableFuture.completedFuture(null);
    }
}
```

---

## 확장성 설계

### 1. Microservices 전환 준비
```java
// Domain 경계를 명확히 하여 향후 분리 용이
public interface EntityService {
    EntityResponse createEntity(CreateEntityRequest request);
    EntityResponse getEntity(Long id);
    Page<EntityResponse> searchEntities(EntitySearchCriteria criteria, Pageable pageable);
}

// Event-Driven Architecture 준비
@Component
public class EntityEventPublisher {
    
    @EventListener
    public void handleEntityCreated(EntityCreatedEvent event) {
        // 외부 서비스 통지 (향후 Message Queue로 전환)
        notificationService.notifyEntityCreated(event.getEntity());
    }
}
```

### 2. Redis 확장 준비
```java
// Cache Abstraction으로 Redis 전환 용이
@Configuration
@ConditionalOnProperty(name = "app.cache.type", havingValue = "redis")
public class RedisCacheConfig {
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setDefaultSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

### 3. API Versioning Strategy
```java
// URL Path Versioning
@RestController
@RequestMapping("/api/v1/entities")
public class EntityV1Controller {
    // V1 API
}

@RestController  
@RequestMapping("/api/v2/entities")
public class EntityV2Controller {
    // V2 API with enhanced features
}

// Header Versioning 지원
@RestController
@RequestMapping("/api/entities")
public class EntityController {
    
    @GetMapping(headers = "API-Version=1.0")
    public ResponseEntity<EntityResponseV1> getEntityV1(@PathVariable Long id) {
        // V1 응답
    }
    
    @GetMapping(headers = "API-Version=2.0") 
    public ResponseEntity<EntityResponseV2> getEntityV2(@PathVariable Long id) {
        // V2 응답
    }
}
```

---

## 🔧 설정 및 환경

### Profile 기반 Configuration
```yaml
# application.yml (공통 설정)
spring:
  application:
    name: entity-management-backend
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:local}

---
# application-local.yml (개발 환경)
spring:
  config:
    activate:
      on-profile: local
  datasource:
    url: jdbc:postgresql://172.21.174.2:5432/postgres
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

---  
# application-prod.yml (운영 환경)
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
```

### Monitoring & Observability
```yaml
# Actuator Configuration
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
```

---

## 📊 성능 지표 및 모니터링

### Key Performance Indicators (KPI)
```yaml
Performance Targets:
  - API Response Time: < 200ms (95th percentile)
  - Database Connection Pool: < 80% utilization
  - Memory Usage: < 70% heap
  - Cache Hit Rate: > 80%
  - Error Rate: < 0.1%

Monitoring Stack:
  - Application: Spring Boot Actuator + Micrometer
  - Database: PostgreSQL slow query log + pg_stat_statements  
  - JVM: JVM Metrics via Micrometer
  - Custom: Business metrics via @Timed, @Counted
```

### Health Check Implementation
```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Health.up()
                .withDetail("database", "PostgreSQL")
                .withDetail("status", "Connected")
                .build();
        } catch (Exception e) {
            return Health.down(e)
                .withDetail("database", "PostgreSQL") 
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

---

**📅 마지막 업데이트**: 2025-09-05  
**🏗️ Architecture Version**: 1.0  
**📝 작성자**: Backend Development Team
