# 🏗️ RSMS Backend 아키텍처 (Claude Code 참조용)

## 📋 개요
RSMS(Resp Management System) Backend는 Java 21 + Spring Boot 3.3.5 기반의 엔터프라이즈급 백엔드 시스템입니다.

---

## 🎯 핵심 설계 원칙

### 1. Domain-Driven Design (DDD)
- 비즈니스 도메인 중심의 아키텍처
- 각 도메인은 독립적이며 응집도 높은 모듈
- 도메인간 의존성 최소화
- 비즈니스 규칙과 로직의 명확한 분리

### 2. 계층형 아키텍처 (Layered Architecture)
- Domain Layer: 핵심 비즈니스 로직
- Application Layer: 애플리케이션 서비스
- Infrastructure Layer: 기술적 구현
- Interface Layer: API 및 외부 인터페이스

### 3. 확장성 및 유연성
- 인터페이스 기반 설계로 Redis 추후 통합 가능
- 프로필 기반 환경별 설정 분리
- 캐싱 전략의 유연한 전환 가능

---

## 🏢 프로젝트 구조

```
src/main/java/com/rsms/
├── RsmsApplication.java           # 메인 애플리케이션 클래스
├── domain/                        # 도메인 계층
│   ├── common/                    # 공통 도메인 요소
│   │   ├── BaseEntity.java       # 기본 엔티티 클래스
│   │   └── BaseService.java      # 기본 서비스 클래스
│   ├── auth/                      # 인증/인가 도메인
│   │   ├── entity/               # 엔티티
│   │   ├── repository/           # 저장소 인터페이스
│   │   ├── service/              # 도메인 서비스
│   │   ├── dto/                  # 데이터 전송 객체
│   │   └── event/                # 도메인 이벤트
│   ├── user/                      # 사용자 관리 도메인
│   ├── report/                    # 보고서 도메인
│   ├── dashboard/                 # 대시보드 도메인
│   └── settings/                  # 설정 관리 도메인
├── application/                   # 애플리케이션 계층
│   ├── cache/                     # 캐싱 서비스
│   ├── session/                   # 세션 관리
│   └── notification/              # 알림 서비스
├── infrastructure/                # 인프라스트럭처 계층
│   ├── config/                    # 설정 클래스들
│   │   ├── JpaConfig.java        # JPA 설정
│   │   ├── CacheConfig.java      # 캐시 설정
│   │   └── SecurityConfig.java   # 보안 설정
│   ├── persistence/               # 데이터베이스 구현
│   └── external/                  # 외부 시스템 연동
├── interfaces/                    # 인터페이스 계층
│   ├── rest/                      # REST API 컨트롤러
│   └── dto/                       # API DTO
└── global/                        # 전역 설정
    ├── exception/                 # 예외 처리
    │   ├── GlobalExceptionHandler.java
    │   ├── BusinessException.java
    │   ├── NotFoundException.java
    │   └── ErrorResponse.java
    └── util/                      # 유틸리티
```

---

## 🔧 기술 스택

### 핵심 프레임워크
```yaml
foundation:
  language: "Java 21 (LTS)"
  framework: "Spring Boot 3.3.5"
  build_tool: "Gradle 8.5+"
  
persistence:
  database: "PostgreSQL 15+"
  connection_pool: "HikariCP"
  jpa: "Spring Data JPA"
  migration: "Flyway"
  
session_management:
  type: "Database Session (Spring Session JDBC)"
  table: "SPRING_SESSION"
  cleanup: "Scheduled Task"
  
caching:
  current: "Ehcache 3 (Local Cache)"
  future: "Redis (Profile 전환 가능)"
  
security:
  framework: "Spring Security 6+"
  password: "BCrypt"
  session: "Database-based"
```

### 개발 도구
```yaml
development:
  api_docs: "SpringDoc OpenAPI 3"
  monitoring: "Spring Boot Actuator"
  hot_reload: "Spring Boot DevTools"
  
testing:
  unit: "JUnit 5 + Mockito"
  integration: "H2 In-Memory DB"
  api: "MockMvc + RestAssured"
```

---

## 💾 데이터베이스 아키텍처

### 세션 관리 (Database 기반)
```sql
-- Spring Session 테이블
CREATE TABLE SPRING_SESSION (
    PRIMARY_ID CHAR(36) NOT NULL,
    SESSION_ID CHAR(36) NOT NULL,
    CREATION_TIME BIGINT NOT NULL,
    LAST_ACCESS_TIME BIGINT NOT NULL,
    MAX_INACTIVE_INTERVAL INT NOT NULL,
    EXPIRY_TIME BIGINT NOT NULL,
    PRINCIPAL_NAME VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36) NOT NULL,
    ATTRIBUTE_NAME VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES BYTEA NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK 
        PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME)
);
```

### Flyway 마이그레이션 구조
```
src/main/resources/db/migration/
├── V1__Create_Session_Tables.sql
├── V2__Create_User_Tables.sql
├── V3__Create_Resp_Tables.sql
├── V4__Create_Report_Tables.sql
└── V5__Create_Indexes.sql
```

---

## 🚀 캐싱 전략

### 현재: Ehcache 기반
```xml
<!-- ehcache.xml -->
<cache alias="users">
    <key-type>java.lang.Long</key-type>
    <value-type>com.rsms.domain.user.entity.User</value-type>
    <expiry>
        <ttl unit="minutes">15</ttl>
    </expiry>
    <resources>
        <heap unit="entries">5000</heap>
        <offheap unit="MB">20</offheap>
    </resources>
</cache>
```

### 캐싱 인터페이스 (Redis 전환 대비)
```java
public interface CacheService {
    void put(String key, Object value, long ttl);
    Optional<Object> get(String key);
    void evict(String key);
    void clear();
}

// 현재: Ehcache 구현
@Service
@Profile("!redis")
public class EhcacheCacheService implements CacheService {
    // Ehcache 구현
}

// 미래: Redis 구현
@Service
@Profile("redis")
public class RedisCacheService implements CacheService {
    // Redis 구현 (나중에 추가)
}
```

---

## 🔒 보안 아키텍처

### Spring Security 설정
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .build();
    }
}
```

### 권한 관리 전략
- **세션 기반 인증**: Database에 세션 정보 저장
- **역할 기반 접근제어**: USER, ADMIN, MANAGER 등
- **메서드 레벨 보안**: @PreAuthorize 애노테이션 활용
- **CORS 설정**: Frontend와의 통신을 위한 CORS 허용

---

## 📊 도메인 모델 설계

### Base Entity 패턴
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
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
    
    @Version
    private Long version;  // 낙관적 락
}
```

### Base Service 패턴
```java
@Transactional(readOnly = true)
public abstract class BaseService<T extends BaseEntity, ID> {
    
    protected abstract JpaRepository<T, ID> getRepository();
    protected abstract String getEntityName();
    
    public T findEntityById(ID id) {
        return getRepository().findById(id)
            .orElseThrow(() -> new NotFoundException(getEntityName() + " not found"));
    }
    
    @Transactional
    public T save(T entity) {
        return getRepository().save(entity);
    }
}
```

---

## 🌐 API 설계 원칙

### RESTful API 설계
```yaml
endpoint_patterns:
  collection: "GET /api/users"           # 목록 조회
  resource: "GET /api/users/{id}"        # 단일 조회
  create: "POST /api/users"              # 생성
  update: "PUT /api/users/{id}"          # 전체 수정
  partial: "PATCH /api/users/{id}"       # 부분 수정
  delete: "DELETE /api/users/{id}"       # 삭제

response_format:
  success: 
    - data: 실제 데이터
    - message: 성공 메시지
  error:
    - timestamp: 오류 발생 시간
    - status: HTTP 상태코드
    - error: 오류 유형
    - code: 애플리케이션 오류 코드
    - message: 사용자 친화적 메시지
    - path: 요청 경로
```

### OpenAPI 3 문서화
```yaml
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
```

---

## 🧪 테스트 전략

### 테스트 피라미드
```yaml
unit_tests:
  tool: "JUnit 5 + Mockito"
  coverage: "> 80%"
  focus: "비즈니스 로직, 도메인 서비스"

integration_tests:
  tool: "Spring Boot Test + H2"
  coverage: "> 70%"
  focus: "Repository, API 엔드포인트"

e2e_tests:
  tool: "MockMvc + TestContainers"
  coverage: "주요 시나리오"
  focus: "사용자 워크플로우"
```

### 테스트 설정
```java
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.yml")
class IntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void shouldCreateUser() {
        // 통합 테스트 예제
    }
}
```

---

## 📈 성능 최적화 전략

### 1. 데이터베이스 최적화
```sql
-- 인덱스 전략
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_resp_status_created ON resp(status, created_at);
CREATE INDEX idx_session_expiry ON spring_session(expiry_time);
```

### 2. 캐싱 전략
```java
@Service
public class UserService extends BaseService<User, Long> {
    
    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) {
        return super.findEntityById(id);
    }
    
    @CacheEvict(value = "users", key = "#user.id")
    public User update(User user) {
        return super.update(user);
    }
}
```

### 3. JPA 최적화
```java
// N+1 문제 해결
@EntityGraph(attributePaths = {"roles", "department"})
Optional<User> findWithDetailsById(Long id);

// 배치 처리
@Modifying
@Query("UPDATE User u SET u.lastLoginAt = :now WHERE u.id IN :ids")
int updateLastLoginBatch(@Param("ids") List<Long> ids, @Param("now") LocalDateTime now);
```

---

## 🔄 Redis 전환 시나리오

### 1. Redis 추가 준비
```gradle
// build.gradle에 의존성 추가
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.session:spring-session-data-redis'
}
```

### 2. 프로필 전환
```yaml
# application-redis.yml
spring:
  profiles:
    active: redis
  session:
    store-type: redis
  cache:
    type: redis
```

### 3. 단계적 전환 과정
```yaml
phase_1: "Redis 서버 설치 및 설정"
phase_2: "캐시만 Redis로 전환 (세션은 DB 유지)"
phase_3: "세션도 Redis로 전환"
phase_4: "성능 테스트 및 모니터링"
phase_5: "점진적 롤아웃"
```

---

## 🚀 배포 및 운영

### 1. 애플리케이션 빌드
```bash
# 개발 환경
./gradlew bootRun --args='--spring.profiles.active=local'

# 프로덕션 빌드
./gradlew build
java -jar build/libs/rsms-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### 2. 환경 설정
```yaml
# local: 개발환경
spring.profiles.active=local

# prod: 운영환경  
spring.profiles.active=prod
DB_URL=jdbc:postgresql://prod-db:5432/rsms
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
```

### 3. 모니터링
```yaml
actuator_endpoints:
  - /actuator/health      # 헬스체크
  - /actuator/metrics     # 메트릭
  - /actuator/info        # 애플리케이션 정보
  - /actuator/prometheus  # 프로메테우스 메트릭
```

---

## 📋 개발 가이드라인

### 1. 코딩 컨벤션
- **Package 명명**: 도메인 > 계층 > 기능 순서
- **Class 명명**: 역할과 책임을 명확히 표현
- **Method 명명**: 동사 + 명사 형태 사용
- **Exception**: 비즈니스 예외는 BusinessException 상속

### 2. 의존성 관리
```java
// 생성자 주입 사용
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
}
```

### 3. 트랜잭션 관리
```java
@Service
@Transactional(readOnly = true)  // 기본 읽기 전용
public class UserService {
    
    @Transactional  // 쓰기 작업만 별도 지정
    public User createUser(CreateUserDto dto) {
        // 생성 로직
    }
}
```

---

---

**📅 작성일**: 2025-09-08  
**✍️ 작성자**: Claude AI (Claude Code 참조용 통합 문서)  
**🔄 버전**: 1.0.0

### 개발 도구
- **IDE**: IntelliJ IDEA Ultimate (권장)
- **Database**: pgAdmin, DBeaver
- **API Testing**: Postman, Swagger UI
- **Version Control**: Git

### Gradle 플러그인
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.5'
    id 'io.spring.dependency-management' version '1.1.6'
}
```

---

## 📚 참고 문서

- [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) - 전체 개발 가이드
- [Spring Boot 3.3.5 Documentation](https://docs.spring.io/spring-boot/docs/3.3.5/reference/)
- [Spring Security 6 Documentation](https://docs.spring.io/spring-security/reference/)
- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)

---

**📅 작성일**: 2025-09-05  
**✍️ 작성자**: Claude AI (RSMS Backend 아키텍처 문서)  
**🔄 업데이트**: Java 21 + Spring Boot 3.3.5, DDD 구조, Redis 확장 대비
