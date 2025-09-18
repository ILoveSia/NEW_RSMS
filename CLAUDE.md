# RSMS 프로젝트 Claude Code 마스터 가이드

이 문서는 Claude Code가 RSMS 프로젝트에서 개발할 때 항상 참조해야 할 핵심 마스터 가이드입니다.
매 세션마다 이 문서와 참조 문서들을 확인하여 일관성 있고 고품질의 코드를 작성해주세요.

---

## 🎯 프로젝트 개요

### 기본 정보
- **프로젝트명**: RSMS (Responsibility Structure Management System)
- **도메인**: 책무구조도 관리 시스템
- **핵심 도메인**: `resps` (Responsibility Management)
- **아키텍처 패턴**: Domain-Driven Design (DDD) + Clean Architecture
- **개발 환경**: Fullstack (React + Spring Boot)

### 프로젝트 구조
```
RSMS/
├── backend/           # Spring Boot 3.3.5 + Java 21
├── frontend/          # React 18 + TypeScript + Vite  
├── database/          # PostgreSQL + Flyway 마이그레이션
├── docs/             # 프로젝트 문서
└── CLAUDE.md         # 이 문서 (마스터 가이드)
```

---

## 🎨 개발 표준 및 템플릿

### 페이지 개발 표준 템플릿
- **기본 템플릿**: `src/domains/resps/pages/PositionMgmt/PositionMgmt.tsx`
- **모든 새로운 페이지는 PositionMgmt.tsx 구조를 참고하여 개발**

**PositionMgmt.tsx 템플릿 구조:**
```tsx
// 1. 페이지 헤더 (통계 카드 포함)
<div className={styles.pageHeader}>
  <div className={styles.headerContent}>
    <div className={styles.titleSection}>...</div>
    <div className={styles.headerStats}>
      <div className={styles.statCard}>...</div>
    </div>
  </div>
</div>

// 2. 검색 필터 섹션
<div className={styles.searchSection}>
  <ComponentSearchFilter ... />
</div>

// 3. 액션 바 (총 개수, 상태 표시, 액션 버튼들)
<div className={styles.actionBar}>
  <div className={styles.actionLeft}>...</div>
  <div className={styles.actionRight}>
    <Button variant="contained">엑셀다운로드</Button>
    <Button variant="contained">등록</Button>
    <Button variant="contained">삭제</Button>
  </div>
</div>

// 4. 데이터 그리드
<div className={styles.gridSection}>
  <ComponentDataGrid ... />
</div>
```

### 테마 시스템 (필수 준수)
- **8가지 브랜드 테마**: 기본, 넷플릭스, 아마존, 인스타그램, 맨하탄, WhatsApp, 애플, 구글
- **테마 적용 영역**: TopHeader, LeftMenu, PageHeader, Button
- **중요**: 모든 Button은 `@/shared/components/atoms/Button` 사용 (Material-UI Button 직접 사용 금지)
- **CSS 변수**: `var(--theme-button-primary)`, `var(--theme-button-primary-text)` 등 사용

**테마 시스템 파일 위치:**
- 테마 스토어: `src/app/store/themeStore.ts`
- 테마 선택: LeftMenu 상단 드롭다운 (RSMS 텍스트를 커스텀 드롭다운으로 교체)

**8가지 테마 상세:**
1. 🎨 **기본 스타일**: 차분한 슬레이트 그레이 (#64748b header, #f1f5f9 menu)
2. 🎬 **넷플릭스 스타일**: 다크 테마 (#141414 + #e50914 액센트)
3. 📦 **아마존 스타일**: 오렌지 액센트 (#232f3e + #ff9900 그라데이션) - 기본값
4. 📷 **인스타그램 스타일**: 그라데이션 컨셉 (밝은 배경 + 컬러풀 그라데이션)
5. 🏢 **맨하탄 금융센터 스타일**: 금융 느낌 블루 (#0a1428 + #3b82f6)
6. 💬 **WhatsApp 스타일**: 그린 테마 (#075e54 + #128c7e)
7. 🍎 **애플 스타일**: 미니멀 그레이/블루 (#f6f6f6 + #007aff) - 유튜브 대체
8. 🔍 **구글 스타일**: 클린 모던 (흰색 + 구글 컬러 그라데이션)

**테마 시스템 구현 완료 사항:**
- ✅ 동적 테마 변경 시스템 구축
- ✅ LeftMenu 커스텀 드롭다운 구현 (Material-UI Select 문제 해결)
- ✅ 모든 UI 영역 테마 적용 (TopHeader, LeftMenu, PageHeader, Button)
- ✅ 스마트 텍스트 컬러링 (배경에 따른 자동 텍스트 색상 조정)
- ✅ PositionMgmt 페이지 Button 테마 통합 완료
- ✅ TopHeader 로고 이미지 자연스럽게 개선 (크기, 그림자, 호버 효과)

### 🚀 오늘의 주요 개발 성과 (2025-09-17)

**1. 동적 테마 시스템 완성**
- 8가지 브랜드 테마 구현 (기본, 넷플릭스, 아마존, 인스타그램, 맨하탄, WhatsApp, 애플, 구글)
- LeftMenu 상단 RSMS 텍스트 → 테마 선택 커스텀 드롭다운으로 교체
- Material-UI Select 텍스트 표시 문제 해결 (커스텀 HTML/CSS 드롭다운으로 대체)
- TopHeader, LeftMenu, PageHeader, Button 전 영역 테마 적용

**2. Button 테마 통합 완료**
- PositionMgmt 페이지 모든 버튼 테마 시스템 적용
- PositionSearchFilter Material-UI Button → 테마 적용 Button 교체
- CSS `!important` 고정 색상 → 테마 변수 사용으로 변경
- 검색버튼, 엑셀다운로드, 등록, 삭제 버튼 모두 테마 색상 적용

**3. 테마 추가/변경 이력**
- "유튜브 스타일" 삭제 → "애플 스타일" 추가
- "기본 스타일" 신규 추가 (차분한 슬레이트 그레이)
- 기본 스타일 LeftMenu 색상 미세 조정 (#f1f5f9)

**4. UI/UX 개선**
- TopHeader 로고 이미지 자연스럽게 개선 (크기 38px, 둥근 모서리, 그림자, 호버 효과)
- 모든 테마에서 일관된 사용자 경험 제공

**5. 개발 표준 확립**
- PositionMgmt.tsx를 표준 페이지 템플릿으로 확정
- 모든 신규 페이지는 이 구조를 따라 개발하도록 가이드 수립

---

## 📚 필수 참조 문서 체계 (5개 핵심 문서)

### 1. **FRONTEND_ARCHITECTURE.md** 📱
**프론트엔드 아키텍처 완전 가이드**
- Domain-Driven Design 폴더 구조
- CSS Modules + SCSS 스타일링 시스템
- Atomic Design Pattern (atoms/molecules/organisms/templates)
- 기술 스택: React 18, TypeScript, Vite, Material-UI, AG-Grid, Recharts, i18next
- 상태 관리: Zustand + TanStack Query

### 2. **BACKEND_ARCHITECTURE.md** 🏗️
**백엔드 아키텍처 완전 가이드**
- Domain-Driven Design + Clean Architecture
- 기술 스택: Java 21, Spring Boot 3.3.5, PostgreSQL, Flyway
- 보안: Database 기반 세션 관리 (Spring Session JDBC)
- 캐싱: Ehcache 3 (로컬), Redis 확장 준비
- 성능 최적화 및 테스트 전략

### 3. **FRONTEND_DEVELOPMENT_GUIDE.md** 💻
**프론트엔드 개발 실무 가이드**
- **절대 금지사항**: 인라인 스타일, any 타입, 중복 컴포넌트 생성
- **반드시 지켜야 할 사항**: CSS Modules, TypeScript 타입 안전성, 공통 컴포넌트 활용
- 컴포넌트 작성 패턴 및 실제 코드 예시
- AG-Grid, 차트(Recharts), 국제화(i18next) 사용법
- 성능 최적화 및 테스트 패턴

### 4. **BACKEND_DEVELOPMENT_GUIDE.md** ⚙️
**백엔드 개발 실무 가이드**
- **절대 금지사항**: 300줄 초과 컨트롤러, any 타입 사용, DDL auto update in production
- **반드시 지켜야 할 사항**: SOLID 원칙, DDD 패턴, 트랜잭션 관리
- Entity, Service, Controller 패턴 및 실제 코드 예시
- API 설계 규칙, 보안 체크리스트
- 성능 최적화 및 테스트 전략

### 5. **CLAUDE.md** 🤖
**이 문서 - Claude Code 마스터 가이드**
- 전체 프로젝트 컨텍스트 및 개발 원칙
- 4개 참조 문서 활용법
- 세션별 체크리스트 및 워크플로우

---

## 🚨 세션 시작 시 필수 체크리스트

매 개발 세션마다 반드시 확인하세요:

### Phase 1: 문서 확인 (필수)
- [ ] **CLAUDE.md** (이 문서) 읽기
- [ ] 개발할 기능에 맞는 참조 문서 확인:
  - Frontend 작업 시: **FRONTEND_ARCHITECTURE.md** + **FRONTEND_DEVELOPMENT_GUIDE.md**
  - Backend 작업 시: **BACKEND_ARCHITECTURE.md** + **BACKEND_DEVELOPMENT_GUIDE.md**
  - 전체 아키텍처 작업 시: 모든 문서

### Phase 2: 기존 코드 분석
- [ ] **PositionMgmt.tsx 템플릿 구조 확인** (새 페이지 개발 시 필수)
- [ ] **테마 시스템 적용 확인** (Button 컴포넌트, CSS 변수 사용)
- [ ] 기존 코드 패턴 분석 후 작업 시작
- [ ] 중복 컴포넌트/기능 존재 여부 확인
- [ ] shared/components, domain 구조 파악

### Phase 3: 개발 원칙 숙지
- [ ] 아래 핵심 원칙들 숙지 후 개발 시작

---

## ⚡ 핵심 개발 원칙 (NEVER & ALWAYS)

### 🚫 NEVER (절대 금지사항)

#### Frontend
```tsx
// ❌ 절대 금지
<div style={{ padding: '10px' }}>           // 인라인 스타일
<Box sx={{ margin: 2 }}>                    // MUI sx prop
const handleData = (data: any) => {}        // any 타입
```

#### Backend
```java
// ❌ 절대 금지  
public class UserController {               // 300줄 초과 컨트롤러
    // 모든 CRUD 로직을 한 클래스에...
}

spring.jpa.hibernate.ddl-auto: update       // 운영 환경
```

### ✅ ALWAYS (반드시 준수사항)

#### Frontend
```tsx
// ✅ 반드시 이렇게
import styles from './Component.module.scss';  // CSS Modules
const Component: React.FC<Props> = ({ ... }) => {
  return <div className={styles.container}>...</div>;
};

interface ComponentProps {                   // 명확한 타입 정의
  id: string;
  onUpdate: (data: UpdateData) => void;
}
```

#### Backend  
```java
// ✅ 반드시 이렇게
@RestController
@RequestMapping("/api/resps")               // 도메인별 분리
@RequiredArgsConstructor
public class RespQueryController {          // 명령/조회 분리
    private final RespQueryService queryService;
}

@Entity
@Table(name = "resps")                      // Snake case 테이블명
public class Resp extends BaseEntity {      // BaseEntity 상속
    // 비즈니스 로직 포함
}
```

---

## 🏗️ 아키텍처 패턴 가이드

### Frontend: Domain-Driven + Atomic Design
```
src/
├── domains/          # 비즈니스 도메인
│   ├── auth/         # 인증/인가
│   ├── users/        # 사용자 관리  
│   ├── resps/        # 책무구조도 관리 (핵심 도메인)
│   ├── reports/      # 보고서
│   ├── dashboard/    # 대시보드
│   └── settings/     # 설정
├── shared/           # 공통 컴포넌트
│   ├── atoms/        # 기본 요소
│   ├── molecules/    # 조합 요소
│   ├── organisms/    # 복합 요소
│   └── templates/    # 레이아웃
├── app/              # 전역 설정
└── styles/           # SCSS 변수 및 믹스인
```

### Backend: Domain-Driven + Clean Architecture
```
src/main/java/com/rsms/
├── domain/           # 도메인 계층 (핵심)
│   ├── resp/         # 책무구조도 도메인 (핵심)
│   ├── user/         # 사용자 도메인
│   ├── report/       # 보고서 도메인
│   └── common/       # 공통 도메인
├── application/      # 애플리케이션 계층
├── infrastructure/   # 인프라 계층
├── interfaces/       # 인터페이스 계층
└── global/          # 전역 설정
```

---

## 🔧 기술 스택 가이드

### Frontend 핵심 스택
```yaml
core_framework:
  - React: 18.3.1 (hooks, functional components)
  - TypeScript: 5.5.2 (강타입 시스템)
  - Vite: 5.3.1 (빠른 개발 서버)

ui_components:
  - Material-UI: 5.16.0 (기본 UI 컴포넌트)
  - AG-Grid: 32.0.0 (엔터프라이즈 데이터 그리드)
  - Recharts: 2.12.7 (차트 및 시각화)

styling:
  - CSS Modules + SCSS (완전 분리된 스타일 시스템)
  - 절대 인라인 스타일 금지

state_management:
  - Zustand: 4.5.2 (전역 상태)
  - TanStack Query: 5.45.1 (서버 상태)
  - React Hook Form: 7.52.0 (폼 상태)

additional:
  - React i18next: 23.11.5 (다국어)
  - React Router: 6.24.1 (라우팅)
```

### Backend 핵심 스택
```yaml
core_framework:
  - Java: 21 (LTS, Virtual Threads, Records)
  - Spring Boot: 3.3.5
  - Spring Security: 6+ (Database Session)

database:
  - PostgreSQL: 15+ (메인 데이터베이스)
  - Flyway: 마이그레이션 도구
  - Spring Data JPA (ORM)

session_management:
  - Spring Session JDBC (데이터베이스 기반)
  - Redis 확장 준비 (프로필 전환 가능)

caching:
  - Ehcache 3 (로컬 캐시)
  - Redis 지원 준비

testing:
  - JUnit 5 + Mockito (단위 테스트)
  - Spring Boot Test (통합 테스트)
```

---

## 🎨 스타일링 시스템 (Frontend)

### SCSS 변수 시스템
```scss
// styles/_variables.scss - 반드시 활용
$color-primary: #1976d2;
$color-secondary: #dc004e;
$spacing-xs: 4px;
$spacing-md: 16px;
$spacing-lg: 24px;

// AG-Grid 테마 통합
$ag-foreground-color: $color-text-primary;
$ag-background-color: $color-background-default;
```

### 컴포넌트 스타일 패턴
```tsx
// ComponentName/ComponentName.tsx
import React from 'react';
import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  title: string;
  onAction: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ title, onAction }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <button className={styles.actionButton} onClick={onAction}>
        Action
      </button>
    </div>
  );
};

export default ComponentName;
```

```scss
// ComponentName/ComponentName.module.scss  
@import '@/styles/variables';
@import '@/styles/mixins';

.container {
  padding: $spacing-md;
  background: $color-background-paper;
  
  @include card-shadow;
  @include responsive-breakpoint($breakpoint-tablet) {
    padding: $spacing-lg;
  }
}

.title {
  color: $color-text-primary;
  font-size: 1.5rem;
  margin-bottom: $spacing-sm;
}

.actionButton {
  background: $color-primary;
  color: white;
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius-md;
  
  &:hover {
    background: darken($color-primary, 10%);
  }
}
```

---

## 📊 데이터 그리드 및 차트 가이드

### AG-Grid 사용 패턴
```tsx
// BaseDataGrid 컴포넌트 활용 (직접 AgGridReact 사용 금지)
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';

interface RespData {
  id: string;
  title: string;
  priority: number;
  status: string;
}

const RespList: React.FC = () => {
  const columns: ColDef<RespData>[] = [
    { field: 'title', headerName: '제목', sortable: true },
    { field: 'priority', headerName: '우선순위', sortable: true },
    { field: 'status', headerName: '상태', sortable: true }
  ];

  return (
    <BaseDataGrid
      data={respData}
      columns={columns}
      pagination={true}
      theme="rsms"
    />
  );
};
```

### Recharts 차트 패턴
```tsx
// Chart 공통 컴포넌트 활용
import { Chart } from '@/shared/components/organisms/Chart';

const RespDashboard: React.FC = () => {
  const chartData = [
    { month: 'Jan', completed: 10, pending: 5 },
    { month: 'Feb', completed: 15, pending: 3 },
  ];

  return (
    <Chart
      type="line"
      data={chartData}
      xAxis="month"
      yAxis="completed"
      title="책무 완료 현황"
    />
  );
};
```

---

## 🌐 다국어(i18n) 가이드

### 번역 파일 구조
```
public/locales/
├── ko/
│   ├── common.json          # 공통 번역
│   ├── resps.json           # 책무구조도 도메인
│   ├── users.json           # 사용자 도메인
│   └── dashboard.json       # 대시보드
└── en/
    ├── common.json
    ├── resps.json
    ├── users.json
    └── dashboard.json
```

### 컴포넌트에서 사용
```tsx
import { useTranslation } from 'react-i18next';

const RespForm: React.FC = () => {
  const { t } = useTranslation('resps');  // 네임스페이스 지정
  
  return (
    <form>
      <h2>{t('form.title')}</h2>
      <label>{t('form.priority')}</label>
      <button>{t('form.submit')}</button>
    </form>
  );
};
```

---

## 🔐 보안 및 인증 가이드

### Frontend 보안 패턴
```tsx
// 인증 상태 관리
import { useAuth } from '@/domains/auth/hooks/useAuth';

const ProtectedComponent: React.FC = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasRole('RESP_MANAGER')) {
    return <div>권한이 없습니다.</div>;
  }
  
  return <div>보호된 컨텐츠</div>;
};
```

### Backend 보안 패턴 (Database Session)
```java
// Spring Security 설정 (Database 기반 세션)
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .sessionRegistry(sessionRegistry()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .build();
    }
}

// 메서드 레벨 보안
@PreAuthorize("hasRole('RESP_MANAGER')")
public RespDto createResp(CreateRespDto dto) {
    // 구현
}

@PreAuthorize("@respSecurityService.canModifyResp(#id, authentication.name)")
public RespDto updateResp(Long id, UpdateRespDto dto) {
    // 구현  
}
```

---

## 🧪 테스트 작성 가이드

### Frontend 테스트 패턴
```tsx
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RespForm } from './RespForm';

describe('RespForm', () => {
  it('should submit form with valid data', () => {
    const onSubmit = vi.fn();
    render(<RespForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '테스트 책무' }
    });
    
    fireEvent.click(screen.getByText('제출'));
    
    expect(onSubmit).toHaveBeenCalledWith({
      title: '테스트 책무'
    });
  });
});
```

### Backend 테스트 패턴
```java
// Service 단위 테스트
@ExtendWith(MockitoExtension.class)
class RespServiceTest {
    
    @Mock
    private RespRepository respRepository;
    
    @InjectMocks
    private RespService respService;
    
    @Test
    void createResp_WhenValidData_ShouldReturnRespDto() {
        // Given
        CreateRespDto dto = new CreateRespDto("테스트 책무", 3);
        Resp savedResp = Resp.builder()
            .title("테스트 책무")
            .priority(3)
            .build();
        
        when(respRepository.save(any(Resp.class))).thenReturn(savedResp);
        
        // When
        RespDto result = respService.create(dto);
        
        // Then
        assertThat(result.getTitle()).isEqualTo("테스트 책무");
        verify(respRepository).save(any(Resp.class));
    }
}

// 통합 테스트
@SpringBootTest
@AutoConfigureMockMvc
class RespControllerIntegrationTest {
    
    @Test
    void createResp_ShouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/resps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("테스트 책무"));
    }
}
```

---

## 📝 개발 워크플로우

### 1. 기능 구현 전 체크리스트
```bash
# Phase 1: 문서 확인
- [ ] 이 CLAUDE.md 문서 확인
- [ ] 해당 기능 관련 참조 문서 확인
- [ ] 기존 코드 패턴 분석

# Phase 2: 아키텍처 확인  
- [ ] 도메인 구조 확인 (resps가 핵심)
- [ ] 기존 컴포넌트/서비스 재사용 가능성 확인
- [ ] API 설계 일관성 확인

# Phase 3: 구현 준비
- [ ] 금지사항 숙지 (인라인 스타일, any 타입 등)
- [ ] 필수사항 숙지 (CSS Modules, 타입 정의 등)
```

### 2. 컴포넌트 개발 플로우 (Frontend)
```bash
1. 도메인 결정 (resps, users, reports, dashboard 등)
2. Atomic Design 레벨 결정 (atoms/molecules/organisms/templates)  
3. 기존 shared/components 재사용 가능성 확인
4. TypeScript 인터페이스 정의
5. 컴포넌트 로직 구현 (.tsx)
6. SCSS 모듈 스타일 구현 (.module.scss)  
7. 테스트 구현 (.test.tsx)
8. 스토리북 구현 (.stories.tsx)
```

### 3. API 개발 플로우 (Backend)
```bash
1. 도메인 결정 (resp가 핵심)
2. Entity 정의 (BaseEntity 상속)
3. Repository 인터페이스 작성
4. Domain Service 구현 (비즈니스 로직)
5. Application Service 구현 (유스케이스)
6. Controller 구현 (Query/Command 분리)
7. DTO 정의 (Request/Response)
8. 테스트 구현 (단위/통합)
```

---

## 🔄 코드 리뷰 체크리스트

### Frontend 체크리스트
- [ ] 인라인 스타일 사용하지 않았는가? (`style={}`, `sx={}`)
- [ ] any 타입 사용하지 않았는가?
- [ ] CSS Modules 방식으로 스타일링했는가?
- [ ] 기존 공통 컴포넌트를 최대한 활용했는가?
- [ ] TypeScript 인터페이스가 명확히 정의되어 있는가?
- [ ] AG-Grid는 BaseDataGrid로 래핑해서 사용했는가?

### Backend 체크리스트  
- [ ] 컨트롤러가 300줄을 초과하지 않았는가?
- [ ] Query/Command 컨트롤러를 분리했는가?
- [ ] Entity에 비즈니스 로직이 포함되어 있는가?
- [ ] BaseEntity를 상속했는가?
- [ ] DTO 매핑이 명확히 구현되어 있는가?
- [ ] 트랜잭션 어노테이션이 적절히 적용되어 있는가?

---

## 🚀 성능 최적화 가이드

### Frontend 최적화
```tsx
// 1. React.memo 활용
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// 2. useMemo, useCallback 활용  
const memoizedData = useMemo(() => 
  processLargeDataset(rawData), [rawData]
);

const handleClick = useCallback(() => {
  onAction(selectedId);
}, [onAction, selectedId]);

// 3. 지연 로딩
const LazyRespChart = React.lazy(() => 
  import('@/domains/resps/components/RespChart')
);
```

### Backend 최적화
```java
// 1. N+1 문제 해결
@EntityGraph(attributePaths = {"actions", "category"})
Optional<Resp> findWithDetailsById(Long id);

// 2. 페이징 처리
@GetMapping("/api/resps")
public Page<RespDto> getResps(
    @PageableDefault(size = 20) Pageable pageable) {
    return respService.findAll(pageable);
}

// 3. 캐싱 활용
@Cacheable(value = "resps", key = "#id")
public RespDto findById(Long id) {
    // 구현
}
```

---

## 📋 문제 해결 가이드

### 자주 발생하는 문제

#### 1. 스타일이 적용되지 않을 때
```bash
# 원인: CSS Modules import 누락
# 해결: .module.scss 파일 생성 및 import 확인
import styles from './Component.module.scss';
```

#### 2. AG-Grid가 렌더링되지 않을 때  
```bash
# 원인: BaseDataGrid 대신 직접 AgGridReact 사용
# 해결: BaseDataGrid 컴포넌트 활용
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
```

#### 3. 타입 에러가 발생할 때
```bash
# 원인: any 타입 사용 또는 인터페이스 정의 누락
# 해결: 명확한 TypeScript 인터페이스 정의
interface ComponentProps {
  data: DataType[];
  onAction: (item: DataType) => void;
}
```

---

## 📚 추가 학습 자료

### 공식 문서
- [React 18 공식 문서](https://react.dev/)
- [Material-UI 문서](https://mui.com/)  
- [AG-Grid React 문서](https://ag-grid.com/react-data-grid/)
- [Spring Boot 3.3.5 문서](https://docs.spring.io/spring-boot/docs/3.3.5/reference/)
- [Spring Security 6 문서](https://docs.spring.io/spring-security/reference/)

### 프로젝트 문서
- **FRONTEND_ARCHITECTURE.md**: 프론트엔드 전체 아키텍처 설계
- **BACKEND_ARCHITECTURE.md**: 백엔드 전체 아키텍처 설계  
- **FRONTEND_DEVELOPMENT_GUIDE.md**: 프론트엔드 개발 실무 가이드
- **BACKEND_DEVELOPMENT_GUIDE.md**: 백엔드 개발 실무 가이드

---

## ⚡ 긴급 대응 가이드

### 빌드 오류 발생 시
```bash
# Frontend
npm run type-check    # 타입 에러 확인
npm run lint         # 린트 에러 확인  
npm run build        # 빌드 테스트

# Backend  
./gradlew clean build    # 전체 빌드
./gradlew test          # 테스트 실행
./gradlew checkstyleMain # 스타일 검사
```

### 성능 문제 발생 시
```bash
# Frontend: Chrome DevTools Performance 탭 확인
# Backend: Spring Actuator 메트릭 확인
# Database: 슬로우 쿼리 로그 확인
```

---

## 🎯 결론

이 CLAUDE.md 문서는 RSMS 프로젝트의 마스터 가이드입니다. 

**매 개발 세션마다:**
1. 이 문서를 먼저 확인하고
2. 해당 기능에 맞는 참조 문서를 확인한 후  
3. 핵심 원칙들을 숙지하고 개발을 시작하세요

**일관성 있고 고품질의 코드 작성을 위해 이 가이드를 반드시 따라주세요!**

---

**📅 마지막 업데이트**: 2025-09-17
**🎯 프로젝트 상태**: 동적 테마 시스템 완성, 개발 표준 템플릿 확립
**🚀 주요 성과**: 8가지 브랜드 테마, Button 테마 통합, PositionMgmt 표준 템플릿
**📝 작성자**: Claude AI (RSMS 마스터 가이드)