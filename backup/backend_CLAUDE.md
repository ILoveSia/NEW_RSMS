# EMS Backend Project Context

**Project-specific context and conventions for Claude Code assistance in EMS Backend development**

---

## 📋 프로젝트 개요

### 기본 정보
- **프로젝트명**: EMS (Entity Management System) Backend
- **기술 스택**: Java 21 + Spring Boot 3.3.5
- **아키텍처**: Domain-Driven Design (DDD) + Clean Architecture
- **데이터베이스**: PostgreSQL 17.6
- **빌드 도구**: Gradle 8.5
- **개발 환경**: WSL2 Ubuntu

### 프로젝트 구조
```
src/main/java/com/rsms/
├── RsmsApplication.java              # Main Application
├── domain/                           # 도메인 계층 (비즈니스 로직)
│   ├── common/BaseEntity.java       # 공통 엔티티
│   ├── auth/                        # 인증/인가
│   ├── user/                        # 사용자 관리
│   ├── entity/                     # 엔티티 관리 (핵심)
│   ├── report/                      # 보고서
│   ├── dashboard/                   # 대시보드
│   └── settings/                    # 설정
├── application/                      # 애플리케이션 계층
├── infrastructure/                   # 인프라 계층
├── interfaces/                       # 인터페이스 계층
└── global/                          # 전역 설정
```

---

## 🔧 개발 컨벤션

### 코딩 스타일
- **언어**: Java 21 (Virtual Threads, Records, Pattern Matching 활용)
- **패키지 네이밍**: `com.rsms.{layer}.{domain}.{component}`
- **클래스 네이밍**: PascalCase (예: `EntityDomainService`)
- **메서드 네이밍**: camelCase, 동사로 시작 (예: `createEntity`, `findEntitiesByCategory`)
- **상수 네이밍**: UPPER_SNAKE_CASE (예: `MAX_ENTITY_SCORE`)

### 어노테이션 사용
```java
// Entity
@Entity
@Table(name = "entities")
@Data @Builder @NoArgsConstructor @AllArgsConstructor

// Service
@Service
@Transactional(readOnly = true)
@Slf4j @RequiredArgsConstructor @Validated

// Controller
@RestController
@RequestMapping("/api/v1/entities")
@Validated @Slf4j @RequiredArgsConstructor
@Tag(name = "Entity Management")
```

### JSON 네이밍
- **전략**: `snake_case` (예: `entity_score`, `created_at`)
- **어노테이션**: `@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)`

---

## 🏗️ 아키텍처 패턴

### Domain-Driven Design
- **Bounded Context**: 도메인별 명확한 경계
- **Aggregate**: Entity, User, Report 등 비즈니스 단위
- **Domain Service**: 복잡한 비즈니스 로직 캡슐화
- **Repository Pattern**: 데이터 접근 추상화

### Clean Architecture 레이어
1. **Interfaces**: REST Controllers, DTO, Web Security
2. **Application**: Use Cases, Application Services, Caching
3. **Domain**: Entities, Domain Services, Repository Interfaces
4. **Infrastructure**: Database, External Services, Configuration

### 의존성 규칙
- 외부 → 내부 의존성만 허용
- Domain 계층은 다른 계층에 의존하지 않음
- Infrastructure는 모든 계층에 의존 가능

---

## 📊 데이터베이스 설계

### 연결 정보 (WSL 환경)
```yaml
Host: 172.21.174.2
Port: 5432
Database: postgres
Username: postgres
Password: 1q2w3e4r!
```

### 주요 테이블
- **entities**: 엔티티 정보 (핵심 테이블)
- **entity_actions**: 엔티티 조치사항
- **users**: 사용자 정보
- **roles**: 역할 관리
- **spring_session**: 세션 관리 (Database 기반)

### 마이그레이션
- **도구**: Flyway
- **위치**: `src/main/resources/db/migration/`
- **명명규칙**: `V{version}__{description}.sql`

---

## 🔐 보안 정책

### 인증/인가
- **방식**: Spring Session (Database 기반)
- **향후**: JWT Token 지원 확장 예정
- **권한**: ROLE 기반 + Method Level Security

### 보안 원칙
- **Input Validation**: 모든 입력 데이터 검증
- **SQL Injection 방지**: Parameterized Query 사용
- **XSS 방지**: HTML Escape 처리
- **데이터 암호화**: 민감 정보 AES 암호화

### API 보안
```java
@PreAuthorize("hasRole('ENTITY_MANAGER')")           // 역할 기반
@PreAuthorize("@entitySecurityService.canModifyEntity(#id, authentication.name)")  // 리소스 기반
```

---

## 🚀 성능 최적화

### 캐싱 전략
- **Local Cache**: Ehcache 3 (현재)
- **Distributed Cache**: Redis 지원 준비
- **Cache Keys**: `{category}_{status}_{params}`
- **TTL**: 통계 1시간, 목록 10분, 상세 5분

### 쿼리 최적화
- **N+1 Problem**: `@EntityGraph`, `Fetch Join` 사용
- **Pagination**: Spring Data 페이징 지원
- **Projection**: 필요한 필드만 조회
- **Batch Processing**: 대량 데이터 처리시 배치 크기 제한

### 연결 풀 설정
```yaml
spring.datasource.hikari:
  maximum-pool-size: 20
  minimum-idle: 5
  connection-timeout: 30000
```

---

## 🧪 테스트 전략

### 테스트 레벨
- **Unit Tests**: 70% (Service, Domain 로직)
- **Integration Tests**: 20% (Repository, API)
- **E2E Tests**: 10% (주요 워크플로우)

### 테스트 도구
- **Framework**: JUnit 5 + Mockito
- **DB**: H2 In-Memory (테스트용)
- **Web**: MockMvc + Spring Boot Test
- **Coverage**: JaCoCo (최소 80%)

### 테스트 네이밍
```java
// Given_When_Then 패턴
void createEntity_WhenValidRequest_ShouldReturnCreatedEntity()
void updateEntity_WhenInvalidId_ShouldThrowNotFoundException()
```

---

## 📝 API 설계 가이드

### REST API 규칙
- **Base URL**: `/api/v1/`
- **HTTP Methods**: GET(조회), POST(생성), PUT(전체수정), PATCH(부분수정), DELETE(삭제)
- **Status Codes**: 200(성공), 201(생성), 400(잘못된요청), 401(인증실패), 403(인가실패), 404(없음), 422(비즈니스규칙위반), 500(서버오류)

### URL 패턴
```http
GET    /api/v1/entities                 # 엔티티 목록
POST   /api/v1/entities                 # 엔티티 생성
GET    /api/v1/entities/{id}            # 엔티티 조회
PUT    /api/v1/entities/{id}            # 엔티티 수정
DELETE /api/v1/entities/{id}            # 엔티티 삭제

GET    /api/v1/entities/{id}/actions    # 하위 리소스
POST   /api/v1/entities/{id}/actions    # 하위 리소스 생성
```

### Request/Response 형식
```java
// Request DTO
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class CreateEntityRequest {
    @NotBlank private String title;
    @Range(min=1, max=5) private Integer priority;
}

// Response DTO
public class EntityResponse {
    public static EntityResponse from(Entity entity) { /* 매핑 */ }
}
```

---

## 🛠️ 개발 도구 및 명령어

### 필수 명령어
```bash
# 애플리케이션 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 테스트 실행
./gradlew test

# 빌드
./gradlew build

# 데이터베이스 마이그레이션
./gradlew flywayMigrate
./gradlew flywayInfo

# 코드 품질 검사
./gradlew check
```

### 개발 환경 설정
- **Profile**: `local` (개발), `prod` (운영)
- **Port**: 8080 (기본)
- **Logging**: DEBUG (개발), INFO (운영)
- **Swagger**: `http://localhost:8080/swagger-ui.html`

---

## ⚠️ 중요 제약사항

### 개발 원칙
- **SOLID 원칙 준수**: 단일책임, 개방폐쇄, 리스코프치환, 인터페이스분리, 의존성역전
- **DRY 원칙**: 중복 코드 최소화
- **YAGNI 원칙**: 필요한 것만 구현
- **비즈니스 로직은 Domain Layer에**: Service가 아닌 Entity나 Domain Service에 구현

### 금지사항
- **Domain Layer에서 외부 의존성 참조 금지**
- **Controller에서 직접 Entity 반환 금지** (DTO 사용 필수)
- **Service Layer에서 복잡한 비즈니스 로직 구현 금지** (Domain에 위임)
- **Magic Number 사용 금지** (상수 정의 필수)

### 필수 사항
- **모든 Public Method에 검증 로직**: `@Valid`, `@Validated` 사용
- **Exception Handling**: GlobalExceptionHandler를 통한 통일된 에러 처리
- **Transaction 관리**: `@Transactional` 적절한 사용
- **Logging**: 적절한 레벨과 구조화된 로그

---

## 🎯 비즈니스 도메인 지식

### 엔티티 관리 핵심 개념
- **Entity**: 우선순위(1-5) × 복잡도(1-5) = 엔티티 점수(1-25)
- **Entity Categories**: OPERATIONAL, TECHNICAL, FINANCIAL, STRATEGIC, COMPLIANCE, SECURITY
- **Entity Status**: DRAFT, ACTIVE, IN_PROGRESS, COMPLETED, ARCHIVED, DELETED
- **Entity Actions**: 엔티티 처리를 위한 조치사항

### 사용자 역할
- **ADMIN**: 시스템 관리자 (모든 권한)
- **ENTITY_MANAGER**: 엔티티 관리자 (엔티티 CRUD)
- **USER**: 일반 사용자 (조회만)

### 워크플로우
1. **Entity Creation**: 엔티티 생성 및 등록
2. **Entity Review**: 우선순위와 복잡도 평가
3. **Entity Processing**: 처리 계획 수립
4. **Entity Monitoring**: 진행상황 모니터링
5. **Entity Completion**: 엔티티 완료 및 보관

---

## 📚 참고 문서

### 프로젝트 문서
- **Architecture**: `/docs/BACKEND_ARCHITECTURE.md`
- **Development Guide**: `/docs/DEVELOPMENT_GUIDE.md`
- **API Standards**: `/docs/API_STANDARDS.md`
- **README**: `/README.md`

### 외부 참조
- [Spring Boot 3.3.5 Reference](https://docs.spring.io/spring-boot/docs/3.3.5/reference/)
- [Spring Security 6 Reference](https://docs.spring.io/spring-security/reference/)
- [Java 21 Documentation](https://docs.oracle.com/en/java/javase/21/)

---

## 🚀 Claude Code 사용 가이드

### 자주 사용하는 작업
1. **새 기능 구현시**: Domain Entity → Repository → Domain Service → Application Service → Controller 순서로 구현
2. **API 추가시**: Controller → DTO → Service → 테스트 순서로 개발
3. **데이터베이스 변경시**: Migration 파일 작성 → Entity 수정 → Repository 업데이트

### 코드 생성 요청 팁
- "RSMS 프로젝트의 DDD 패턴을 따라서..."
- "Spring Boot 3.3.5와 Java 21을 활용해서..."
- "기존 Entity 도메인과 같은 구조로..."
- "Snake case JSON 응답으로..."

### 검증 요청 팁
- "SOLID 원칙을 준수하는지 확인해주세요"
- "DDD 아키텍처에 맞는지 검토해주세요"
- "Spring Security 6 best practice를 적용했는지 확인해주세요"
- "성능상 문제가 없는지 검토해주세요"

---

**📅 마지막 업데이트**: 2025-09-05  
**🎯 프로젝트 상태**: 개발 환경 구성 완료, 기본 구조 생성 완료  
**📝 작성자**: RSMS Backend Development Team