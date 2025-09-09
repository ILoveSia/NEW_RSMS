# 🤖 Claude Code 프로젝트 설정

## 📋 세션 시작 필수 참조 문서

### 우선순위 1 (반드시 읽어야 함)
1. **[DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md)** - 핵심 개발 가이드
2. **[CODING_STYLE_GUIDE.md](../CODING_STYLE_GUIDE.md)** - 코딩 스타일 가이드

### 우선순위 2 (문제 발생 시 참조)
3. **[FRONTEND_ANALYSIS_REPORT.md](../FRONTEND_ANALYSIS_REPORT.md)** - Frontend 문제점 분석
4. **[BACKEND_ANALYSIS_REPORT.md](../BACKEND_ANALYSIS_REPORT.md)** - Backend 문제점 분석

---

## ⚡ 세션별 자동 실행 체크리스트

### 🚀 개발 시작 전 체크리스트
```yaml
pre_development:
  reading:
    - [ ] DEVELOPMENT_GUIDE.md 핵심 원칙 확인
    - [ ] 절대 하지 말아야 할 것들 (NEVER DO) 섹션 숙지
    - [ ] 반드시 따라야 할 핵심 원칙 확인
  
  analysis:
    - [ ] 기존 코드 패턴 분석
    - [ ] 유사한 기능 구현 확인
    - [ ] 재사용 가능한 컴포넌트/서비스 확인
```

### 💻 개발 중 체크리스트
```yaml
during_development:
  frontend:
    - [ ] 인라인 스타일 사용하지 않았는가?
    - [ ] any 타입 사용하지 않았는가?
    - [ ] 컴포넌트 500줄 이하인가?
    - [ ] styled-components 또는 CSS Modules 사용했는가?
    - [ ] TypeScript 타입 정의 완료했는가?
    
  backend:
    - [ ] Controller 300줄 이하인가?
    - [ ] Service 계층 중복 제거했는가?
    - [ ] @Transactional 적절히 사용했는가?
    - [ ] 예외 처리 GlobalExceptionHandler 활용했는가?
    - [ ] Entity N+1 문제 체크했는가?
    - [ ] 데이터베이스 기반 세션 관리 사용했는가?
```

### ✅ 개발 완료 후 체크리스트
```yaml
post_development:
  quality:
    - [ ] 코드 스타일 검사 통과
    - [ ] 테스트 코드 작성
    - [ ] 문서화 완료
    
  validation:
    - [ ] npm run lint:check (Frontend)
    - [ ] ./gradlew checkstyleMain (Backend)
    - [ ] 빌드 성공 확인
```

---

## 🎯 프로젝트별 핵심 규칙

### Frontend 핵심 규칙
```typescript
// 1. 폴더 구조 준수
src/
├── shared/     // 공통 컴포넌트만
├── domains/    // 도메인별 기능
└── app/        // 앱 설정만

// 2. 스타일링: styled-components 우선
// 3. 타입: unknown과 타입가드 활용
// 4. UI 라이브러리: Material-UI 통일
```

### Backend 핵심 규칙
```java
// 1. Controller 분리 (Query/Command)
// 2. BaseService 패턴 활용
// 3. @Transactional 명확히 구분
// 4. 환경별 설정 분리
```

---

## 🔍 문제 해결 참조

### 자주 발생하는 문제와 해결법

#### Frontend 문제
| 문제 | 원인 | 해결 | 참조 |
|-----|-----|-----|-----|
| 스타일 충돌 | 인라인 스타일 혼재 | styled-components 통일 | DEVELOPMENT_GUIDE.md #스타일링 |
| 타입 에러 | any 타입 사용 | unknown + 타입가드 | DEVELOPMENT_GUIDE.md #타입시스템 |
| 번들 크기 | 중복 라이브러리 | Material-UI 통일 | FRONTEND_ANALYSIS_REPORT.md |

#### Backend 문제
| 문제 | 원인 | 해결 | 참조 |
|-----|-----|-----|-----|
| N+1 쿼리 | Lazy Loading | @EntityGraph 사용 | DEVELOPMENT_GUIDE.md #성능최적화 |
| 컨트롤러 비대 | 단일 책임 위반 | Query/Command 분리 | BACKEND_ANALYSIS_REPORT.md |
| 트랜잭션 오류 | 잘못된 설정 | readOnly 구분 | DEVELOPMENT_GUIDE.md #API패턴 |

---

## 📊 코드 품질 메트릭

### 목표 지표
```yaml
frontend:
  bundle_size: < 800KB
  component_lines: < 500
  type_coverage: > 95%
  test_coverage: > 80%
  
backend:
  controller_lines: < 300
  service_duplication: < 5%
  test_coverage: > 80%
  response_time: < 200ms
```

---

## 🚨 긴급 알림

### ⚠️ 절대 금지 사항 (다시 한번 강조)
1. **Frontend**: 인라인 스타일, any 타입
2. **Backend**: ddl-auto: update (운영), 300줄 초과 Controller
3. **공통**: 중복 코드, 테스트 없는 커밋

---

## 📝 세션 종료 체크리스트

```yaml
session_end:
  - [ ] 작성한 코드가 가이드라인 준수했는가?
  - [ ] 테스트 코드 작성했는가?
  - [ ] 문서 업데이트 필요한가?
  - [ ] 다음 개발자를 위한 주석 추가했는가?
```

---

**🔔 알림: 이 설정은 Claude Code가 매 세션마다 자동으로 로드합니다**  
**개발 시작 시 이 문서의 체크리스트를 순서대로 확인하세요**

---
*설정 버전: 1.0.0*  
*마지막 업데이트: 2025-09-03*