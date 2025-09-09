# ⚡ Claude Code 빠른 참조 가이드

## 🚨 즉시 확인 사항 (MUST CHECK IMMEDIATELY)

### ❌ 절대 금지 (NEVER DO THIS)
```yaml
frontend:
  - 인라인 스타일: style={{}} 또는 sx={{}}
  - any 타입 사용
  - 500줄 초과 컴포넌트
  - 중복 컴포넌트 생성

backend:
  - 300줄 초과 Controller
  - ddl-auto: update (운영환경)
  - Service 중복 패턴
  - @Transactional 없는 수정 메서드
  - Redis 의존성 사용 (데이터베이스 세션 사용)
```

### ✅ 반드시 실행 (ALWAYS DO THIS)
```yaml
frontend:
  - styled-components 사용
  - unknown + 타입가드
  - Material-UI 통일
  - domains/ 구조 준수

backend:
  - Query/Command Controller 분리
  - BaseService 상속
  - GlobalExceptionHandler 활용
  - @EntityGraph로 N+1 해결
  - 데이터베이스 기반 세션 관리
```

---

## 📁 프로젝트 구조 (10초 확인)

### Frontend
```
src/
├── shared/     → 공통 컴포넌트만
├── domains/    → 도메인별 기능
│   └── [name]/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── types/
└── app/        → 앱 설정만
```

### Backend
```
com.rsms/
├── global/     → 전역 설정
└── domain/     → 도메인별
    └── [name]/
        ├── controller/ (Query/Command 분리)
        ├── service/
        ├── repository/
        └── dto/
```

---

## 💻 즉시 사용 코드 템플릿

### Frontend Component
```tsx
// ✅ 복사해서 바로 사용
import React from 'react';
import styled from '@emotion/styled';

interface Props {
  // props 정의
}

export const ComponentName: React.FC<Props> = ({ }) => {
  // hooks
  
  // handlers
  
  return (
    <Container>
      {/* content */}
    </Container>
  );
};

const Container = styled.div`
  // styles
`;
```

### Backend Controller
```java
// ✅ Query Controller
@RestController
@RequestMapping("/api/resource")
@RequiredArgsConstructor
public class ResourceQueryController {
    private final ResourceQueryService service;
    
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
```

### Backend Service
```java
// ✅ Service with BaseService
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ResourceService extends BaseService<Resource, Long> {
    private final ResourceRepository repository;
    private final ResourceMapper mapper;
    
    @Transactional
    public ResourceDto create(CreateDto dto) {
        // implementation
    }
}
```

---

## 🔍 문제 발생 시 즉시 참조

| 증상 | 원인 | 해결 | 
|-----|------|-----|
| 스타일 충돌 | 인라인 스타일 | styled-components |
| 타입 에러 | any 사용 | unknown + guard |
| N+1 쿼리 | Lazy Loading | @EntityGraph |
| 컨트롤러 비대 | 단일 책임 위반 | Query/Command 분리 |

---

## 📝 커밋 전 체크 (30초)

```bash
# Frontend
cd frontend && npm run lint:check && npm run type-check

# Backend  
cd backend && ./gradlew checkstyleMain checkstyleTest

# 커밋 메시지
git commit -m "feat(domain): 기능 설명"
```

---

## 🎯 핵심 원칙 한 줄 요약

1. **스타일**: styled-components만 사용
2. **타입**: any 금지, unknown 사용
3. **구조**: domains/ 폴더 구조 준수
4. **Controller**: 300줄 이하, Query/Command 분리
5. **Service**: BaseService 상속, 중복 제거
6. **트랜잭션**: readOnly 구분 명확히
7. **예외**: GlobalExceptionHandler 활용
8. **성능**: N+1 문제 항상 체크

---

## 📊 목표 지표

```yaml
quality_metrics:
  frontend:
    component_lines: < 500
    type_coverage: > 95%
  backend:
    controller_lines: < 300
    service_duplication: < 5%
  common:
    test_coverage: > 80%
    build_time: < 30s
```

---

**⏱️ 이 문서는 1분 안에 읽을 수 있도록 설계되었습니다**  
**개발 시작 전 반드시 확인하세요!**