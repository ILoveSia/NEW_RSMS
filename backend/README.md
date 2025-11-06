# 🚀 RSMS Backend

RSMS (Resp Management System) Backend API Server

**Java 21 + Spring Boot 3.3.5** 기반의 현대적이고 확장 가능한 백엔드 시스템입니다.

---

## 🎯 주요 특징

- ✅ **Java 21**: 최신 LTS, Virtual Threads 지원
- ✅ **Spring Boot 3.3.5**: 최신 프레임워크
- ✅ **Domain-Driven Design**: 도메인 중심 아키텍처
- ✅ **Database 세션**: Redis 없이도 완전 동작
- ✅ **확장 가능**: Redis 추후 추가 용이
- ✅ **캐싱 지원**: Ehcache → Redis 전환 가능
- ✅ **API 문서화**: OpenAPI 3 / Swagger UI

---

## 🔧 기술 스택

```yaml
Core:
  - Java 21 (LTS)
  - Spring Boot 3.3.5
  - Spring Security 6
  - Spring Data JPA
  - Gradle 8.5+

Database:
  - PostgreSQL 15+
  - Flyway (Migration)
  - HikariCP (Connection Pool)

Session & Cache:
  - Spring Session JDBC (Database 기반)
  - Ehcache 3 (로컬 캐시)
  - Redis 추후 지원

Documentation:
  - SpringDoc OpenAPI 3
  - Swagger UI

Testing:
  - JUnit 5
  - Mockito
  - H2 (Test DB)
```

---

## 🏗️ 프로젝트 구조

```
src/main/java/com/rsms/
├── domain/                 # 도메인 계층
│   ├── auth/              # 인증/인가
│   ├── user/              # 사용자 관리  
│   ├── resp/              # 책무 관리 (핵심)
│   ├── report/            # 보고서
│   ├── dashboard/         # 대시보드
│   └── settings/          # 설정
├── application/           # 애플리케이션 계층
├── infrastructure/        # 인프라 계층
├── interfaces/           # 인터페이스 계층
└── global/               # 전역 설정
```

---

## 🚀 시작하기

### 1. 사전 요구사항

```bash
# Java 21 설치 확인
java -version
# openjdk version "21.0.1" 2023-10-17 LTS

# PostgreSQL 설치 (로컬 또는 클라우드)
# 데이터베이스 생성
createdb rsms_dev
```

### 2. 프로젝트 클론 및 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd rsms-backend

# 환경 설정 (필요 시 application-local.yml 수정)
# PostgreSQL 연결 정보 확인
```

### 3. 애플리케이션 실행

```bash
# Gradle Wrapper 권한 설정
chmod +x gradlew

# 개발 환경 실행
./gradlew bootRun

# 또는 특정 프로필로 실행
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 4. 확인

```bash
# 헬스체크
curl http://localhost:8090/actuator/health

# API 문서
http://localhost:8090/swagger-ui.html

# API 문서 JSON
http://localhost:8090/v3/api-docs
```

---

## 🗃️ 데이터베이스 설정

### PostgreSQL WSL 설정

**WSL 환경에서 PostgreSQL 사용**

```yaml
WSL PostgreSQL 연결 정보:
  Host: 172.21.174.2
  Database: postgres
  Username: postgres
  Password: 1q2w3e4r!
  Port: 5432
```

**연결 테스트**
```bash
# PostgreSQL 연결 테스트
psql -h 172.21.174.2 -U postgres -d postgres

# 또는 pgAdmin 등 GUI 도구로 연결 확인
```

### Flyway 마이그레이션

```bash
# 마이그레이션 실행
./gradlew flywayMigrate

# 마이그레이션 정보 확인
./gradlew flywayInfo

# 마이그레이션 정리 (개발 시에만)
./gradlew flywayClean
```

---

## 🔧 개발 환경

### 프로필 설정

```yaml
개발환경: --spring.profiles.active=local
운영환경: --spring.profiles.active=prod
테스트환경: --spring.profiles.active=test
```

### 환경 변수

```bash
# WSL 개발 환경
export DB_URL=jdbc:postgresql://172.21.174.2:5432/postgres
export DB_USERNAME=postgres
export DB_PASSWORD=1q2w3e4r!

# 운영 환경
export DB_URL=jdbc:postgresql://prod-server:5432/rsms
export DB_USERNAME=${DB_USER}
export DB_PASSWORD=${DB_PASS}
export JWT_SECRET=${JWT_SECRET}
```

---

## 🧪 테스트

### 테스트 실행

```bash
# 전체 테스트
./gradlew test

# 특정 클래스 테스트
./gradlew test --tests UserServiceTest

# 테스트 커버리지 (JaCoCo)
./gradlew test jacocoTestReport
open build/reports/jacoco/test/html/index.html
```

### 테스트 환경

- **Unit Tests**: JUnit 5 + Mockito
- **Integration Tests**: H2 In-Memory Database  
- **API Tests**: MockMvc + Spring Boot Test

---

## 📊 모니터링

### Actuator 엔드포인트

```bash
# 헬스체크
GET /actuator/health

# 애플리케이션 정보
GET /actuator/info

# 메트릭
GET /actuator/metrics

# JVM 메모리
GET /actuator/metrics/jvm.memory.used
```

### 로깅

```yaml
로그 레벨:
  - 개발: DEBUG (상세 로그)
  - 운영: INFO (필요한 로그만)
  
로그 파일:
  - 위치: logs/rsms-backend.log
  - 로테이션: 10MB, 30일 보관
```

---

## 🔄 배포

### JAR 빌드

```bash
# 빌드
./gradlew build

# JAR 파일 실행
java -jar build/libs/rsms-backend-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod
```

### Docker 배포 (선택사항)

```dockerfile
FROM openjdk:21-jdk-slim

COPY build/libs/rsms-backend-*.jar app.jar

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

---

## 🔧 Redis 추가 (향후)

### 1. 의존성 추가

```gradle
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
  redis:
    host: localhost
    port: 6379
  session:
    store-type: redis
```

### 3. 전환 실행

```bash
# Redis 프로필로 실행
./gradlew bootRun --args='--spring.profiles.active=redis'
```

---

## 🚨 문제 해결

### 자주 발생하는 문제

**1. PostgreSQL 연결 실패**
```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# PostgreSQL 시작
sudo systemctl start postgresql
```

**2. 포트 충돌 (8090)**
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti:8090

# 프로세스 종료
kill -9 $(lsof -ti:8090)

# 또는 다른 포트 사용
./gradlew bootRun --args='--server.port=8081'
```

**3. Flyway 마이그레이션 실패**
```bash
# 마이그레이션 상태 확인
./gradlew flywayInfo

# 문제가 있는 경우 정리 (개발 시에만)
./gradlew flywayClean
./gradlew flywayMigrate
```

---

## 📚 추가 자료

### 문서
- [백엔드 아키텍처 문서](../BACKEND_ARCHITECTURE.md)
- [전체 개발 가이드](../DEVELOPMENT_GUIDE.md)
- [API 문서](http://localhost:8090/swagger-ui.html) (실행 후 접속)

### 외부 링크
- [Spring Boot 3.3.5 Reference](https://docs.spring.io/spring-boot/docs/3.3.5/reference/)
- [Java 21 Documentation](https://docs.oracle.com/en/java/javase/21/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 👥 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

---

---

## ✅ 설정 완료 상태

**Spring Boot 애플리케이션 성공적으로 설정 및 실행 완료!**

- ✅ Java 21 + Spring Boot 3.3.5 프로젝트 생성 완료
- ✅ WSL PostgreSQL 연결 성공 (172.21.174.2:5432)
- ✅ Flyway 마이그레이션 실행 완료 (V1__Initial_schema.sql)
- ✅ Spring Security + Session Management 설정 완료
- ✅ Actuator Health Check 정상 동작 확인
- ✅ Swagger UI 활성화 완료
- ✅ Domain-Driven Design 패키지 구조 완성

**접속 URL**:
- Health Check: http://localhost:8090/actuator/health
- Swagger UI: http://localhost:8090/swagger-ui.html
- API Docs JSON: http://localhost:8090/v3/api-docs

**현재 상태**: 개발 준비 완료, 프론트엔드 연동 대기 중

---

**📅 마지막 업데이트**: 2025-09-05  
**✍️ RSMS Backend Team**
