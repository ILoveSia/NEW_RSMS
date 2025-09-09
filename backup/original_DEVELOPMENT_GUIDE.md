# 🎯 RSMS 프로젝트 핵심 개발 가이드 (Redis 제외 버전)

## ⚠️ Claude Code 필수 참조 문서
**이 문서는 모든 개발 세션에서 반드시 참조해야 하는 핵심 가이드입니다**  
**기존 프로젝트의 문제점을 분석하여 작성된 개선 지침을 담고 있습니다**

---

## 📌 세션 시작 체크리스트

### 🔍 매 세션마다 확인해야 할 사항
```yaml
session_start:
  - [ ] DEVELOPMENT_GUIDE.md 읽기 (이 문서)
  - [ ] CODING_STYLE_GUIDE.md 참조
  - [ ] 기존 코드 패턴 분석 후 작업 시작
  - [ ] 아래 핵심 원칙들 숙지
```

---

## 🚨 절대 하지 말아야 할 것들 (NEVER DO)

### Frontend
1. **인라인 스타일 사용 금지**
   ```tsx
   // ❌ 절대 금지
   <div style={{ padding: '10px' }}>
   <Box sx={{ margin: 2 }}>
   
   // ✅ 반드시 이렇게
   const StyledDiv = styled.div`
     padding: 10px;
   `;
   ```

2. **any 타입 사용 금지**
   ```tsx
   // ❌ 절대 금지
   const handleData = (data: any) => {}
   
   // ✅ 반드시 이렇게
   const handleData = (data: UserData | unknown) => {}
   ```

3. **중복 컴포넌트 생성 금지**
   - 기존 컴포넌트 먼저 검색
   - shared/components 확인 필수

### Backend
1. **Controller 300줄 초과 금지**
   ```java
   // ❌ 절대 금지: 단일 컨트롤러에 모든 로직
   
   // ✅ 반드시 분리
   UserQueryController    // 조회 전용
   UserCommandController  // 명령 전용
   ```

2. **운영 환경에서 ddl-auto: update 금지**
   ```yaml
   # ❌ 절대 금지
   spring.jpa.hibernate.ddl-auto: update
   
   # ✅ 운영 환경
   spring.jpa.hibernate.ddl-auto: none
   ```

---

## ✅ 반드시 따라야 할 핵심 원칙

### 1. 폴더 구조 표준

#### Frontend 구조 (Domain-Driven Design)
```
src/
├── domains/          # 도메인별 기능 (핵심 비즈니스 로직)
│   ├── auth/         # 인증/인가
│   │   ├── api/      # API 클라이언트
│   │   ├── components/ # 로그인, 회원가입 등
│   │   ├── pages/    # 로그인 페이지 등
│   │   ├── hooks/    # useAuth 등
│   │   ├── store/    # 인증 상태 관리
│   │   └── types/    # User, Token 등 타입
│   ├── users/        # 사용자 관리
│   ├── resps/        # 책무 관리 (핵심 도메인)
│   ├── reports/      # 보고서
│   ├── dashboard/    # 대시보드
│   └── settings/     # 설정 관리
├── shared/           # 도메인 무관 공통 리소스
│   ├── components/   # 공통 UI 컴포넌트
│   │   ├── atoms/    # Button, Input 등
│   │   ├── molecules/# SearchBar, FormField 등
│   │   ├── organisms/# DataGrid, Navigation 등
│   │   └── templates/# Layout 등
│   ├── hooks/        # 공통 커스텀 훅
│   ├── utils/        # 유틸리티 함수
│   └── types/        # 공통 타입 정의
├── app/              # 앱 전체 설정
│   ├── router/       # 라우팅 설정
│   ├── store/        # 전역 상태 (Zustand)
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── rootStore.ts
│   └── config/       # 앱 설정
│       ├── env.ts    # 환경 변수
│       ├── api.ts    # API 설정
│       └── constants.ts
├── styles/           # 전역 스타일
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _globals.scss
│   ├── _themes.scss
│   └── _ag-grid.scss
├── assets/           # 정적 자원
│   ├── images/
│   ├── icons/
│   └── fonts/
└── test/             # 테스트 유틸리티
    ├── setup.ts
    └── utils.ts
```

#### Backend 구조
```
src/main/java/com/rsms/
├── global/           # 전역 설정
│   ├── config/       # 설정 클래스
│   ├── exception/    # 예외 처리
│   ├── security/     # 보안 설정 (데이터베이스 세션 기반)
│   └── common/       # 공통 기능
└── domain/           # 도메인별 기능
    └── [domain]/
        ├── controller/
        ├── service/
        ├── repository/
        ├── entity/
        └── dto/
```

### 2. 스타일링 규칙 (Frontend)

#### CSS Modules + SCSS 접근법
```scss
// styles/_variables.scss
$color-primary: #1976d2;
$color-secondary: #dc004e;
$spacing-xs: 4px;
$spacing-md: 16px;
$spacing-lg: 24px;

// AG-Grid 테마 변수
$ag-foreground-color: $color-text-primary;
$ag-background-color: $color-background-default;
$ag-header-foreground-color: $color-text-secondary;
```

#### 컴포넌트별 스타일 모듈
```tsx
// Component.module.scss
@import '@/styles/variables';
@import '@/styles/mixins';

.container {
  padding: $spacing-md;
  background: $color-primary;
  
  @include flex-center;
  @include responsive-breakpoint(tablet) {
    padding: $spacing-lg;
  }
}

// Component.tsx
import styles from './Component.module.scss';

const Component: React.FC = () => {
  return <div className={styles.container}>Content</div>;
};
```

#### Material-UI + SCSS 통합
```tsx
// MUI 컴포넌트에 커스텀 클래스 적용
import { Button } from '@mui/material';
import styles from './CustomButton.module.scss';

const CustomButton: React.FC = () => {
  return (
    <Button className={styles.customButton}>
      Custom Styled Button
    </Button>
  );
};
```

#### ❌ 절대 사용 금지
```tsx
// 인라인 스타일 금지 (ESLint 규칙으로 방지)
<div style={{ padding: '10px' }} />        // ❌
<Box sx={{ margin: 2 }} />                 // ❌
```

### 3. 타입 시스템 (Frontend)

#### 타입 정의 규칙
```typescript
// 1. 모든 API 응답 타입 정의
interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

// 2. Props 타입 명시
interface ComponentProps {
  id: string;
  name: string;
  onUpdate: (data: UpdateData) => void;
}

// 3. unknown 타입과 타입 가드 활용
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}
```

### 4. API 패턴 (Backend)

#### Controller 분리 패턴
```java
// 조회 전용 컨트롤러
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserQueryController {
    private final UserQueryService queryService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.findById(id));
    }
}

// 명령 전용 컨트롤러
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserCommandController {
    private final UserCommandService commandService;
    
    @PostMapping
    @Transactional
    public ResponseEntity<UserDto> createUser(@RequestBody @Valid CreateUserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(commandService.create(dto));
    }
}
```

#### Service 계층 패턴
```java
// BaseService 상속 활용
@Service
@Transactional(readOnly = true)
public class UserService extends BaseService<User, Long> {
    
    // 조회 메서드: readOnly = true (기본값)
    public UserDto findById(Long id) {
        User user = findEntityById(id, "User");
        return userMapper.toDto(user);
    }
    
    // 수정 메서드: @Transactional 명시
    @Transactional
    public UserDto update(Long id, UpdateUserDto dto) {
        User user = findEntityById(id, "User");
        userMapper.updateEntity(dto, user);
        return userMapper.toDto(user);
    }
}
```

### 5. 예외 처리 표준

#### Frontend 에러 처리
```typescript
// API 에러 처리
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

// 에러 바운더리
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
    // 에러 로깅 서비스로 전송
  }
}
```

#### Backend 예외 처리
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        return ResponseEntity
            .status(e.getStatus())
            .body(ErrorResponse.of(e.getCode(), e.getMessage()));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        return ResponseEntity
            .badRequest()
            .body(ErrorResponse.of("VALIDATION_ERROR", e.getMessage()));
    }
}
```

---

## 🎨 UI/UX 표준 (Frontend)

### 기술 스택 및 도구
```yaml
core_stack:
  - React: 18.3.1
  - TypeScript: 5.5.2
  - Vite: 5.3.1

ui_framework:
  - Material-UI: 5.16.0 (기본 컴포넌트)
  - AG-Grid: 32.0.0 (데이터 그리드)
  - CSS Modules + SCSS (스타일링)

state_management:
  - Zustand: 4.5.2 (상태 관리)
  - TanStack Query: 5.45.1 (서버 상태)

additional_features:
  - React Hook Form: 7.52.0 (폼 관리)
  - Recharts: 2.12.7 (차트 시각화)
  - i18next: 23.11.5 (다국어 지원)
  - React Router: 6.24.1 (라우팅)
  - Axios: 1.7.2 (HTTP 클라이언트)
```

### Material-UI 테마 설정 (SCSS 통합)
```typescript
// app/config/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  spacing: 8,
  typography: {
    fontFamily: '"Pretendard", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
  },
  components: {
    // SCSS 모듈과 통합 가능하도록 설정
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

### 국제화(i18n) 설정
```typescript
// app/config/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ko',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
```

### 컴포넌트 작성 패턴
```tsx
// ✅ CSS Modules + 커스텀 훅 패턴
// UserProfile/UserProfile.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUser, useUserMutation } from '@/domains/users/hooks';
import { LoadingSpinner, ErrorMessage } from '@/shared/components';
import styles from './UserProfile.module.scss';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { t } = useTranslation('users');
  const { user, loading, error } = useUser(userId);
  const { updateUser } = useUserMutation();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{t('profile.title', { name: user.name })}</h1>
      </header>
      <main className={styles.content}>
        <UserProfileForm user={user} onUpdate={updateUser} />
      </main>
    </div>
  );
};

export default UserProfile;
```

### 차트 컴포넌트 패턴
```tsx
// shared/components/organisms/Chart/Chart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import styles from './Chart.module.scss';

interface ChartProps {
  data: Array<Record<string, any>>;
  xAxis: string;
  yAxis: string;
  title?: string;
}

const Chart: React.FC<ChartProps> = ({ data, xAxis, yAxis, title }) => {
  return (
    <div className={styles.chartContainer}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxis} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={yAxis} stroke="#1976d2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
```

---

## 🔒 보안 체크리스트

### Frontend 보안
```typescript
// 1. XSS 방지
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html);
};

// 2. 민감 정보 노출 방지
// ❌ 금지
console.log(userData.password);
localStorage.setItem('token', token); // 평문 저장

// ✅ 올바른 방법
// 토큰은 httpOnly 쿠키 사용
```

### Backend 보안 (데이터베이스 세션 기반)
```java
// 1. SQL Injection 방지 (JPA 사용)
// 2. 권한 검증
@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
public void updateUser(Long userId, UpdateDto dto) {
    // ...
}

// 3. 비밀번호 암호화
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}

// 4. 데이터베이스 기반 세션 관리
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(true)
                .sessionRegistry(sessionRegistry()))
            .build();
    }
    
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
    
    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }
}
```

---

## 📊 성능 최적화 체크리스트

### Frontend 최적화
```typescript
// 1. React.memo 활용
const ExpensiveComponent = React.memo(({ data }) => {
  // 복잡한 렌더링 로직
});

// 2. useMemo, useCallback 활용
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 3. 코드 분할
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 4. 이미지 최적화
<img src={image} loading="lazy" alt="description" />
```

### Backend 최적화
```java
// 1. N+1 문제 해결
@EntityGraph(attributePaths = {"roles", "department"})
Optional<User> findWithDetailsById(Long id);

// 2. 페이징 처리
@GetMapping
public Page<UserDto> getUsers(Pageable pageable) {
    return userService.findAll(pageable);
}

// 3. 캐싱 활용 (Application Level)
@Cacheable(value = "users", key = "#id")
public UserDto findById(Long id) {
    // DB 세션을 통한 캐싱
}
```

---

## 🧪 테스트 작성 규칙

### Frontend 테스트
```typescript
// 컴포넌트 테스트
describe('UserProfile', () => {
  it('should render user information', () => {
    const { getByText } = render(<UserProfile userId="1" />);
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Backend 테스트
```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    
    @Test
    void createUser_ShouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists());
    }
}
```

---

## 📝 커밋 메시지 템플릿

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입 종류
- **feat**: 새로운 기능
- **fix**: 버그 수정
- **refactor**: 리팩토링 (기능 변경 없음)
- **style**: 코드 포맷팅
- **test**: 테스트 추가/수정
- **docs**: 문서 수정
- **chore**: 빌드, 설정 변경

### 예시
```
feat(user): 사용자 프로필 수정 기능 추가

- 프로필 이미지 업로드 기능 구현
- 닉네임 중복 검사 추가
- 유효성 검사 강화

Closes #123
```

---

## 🔄 코드 리뷰 체크리스트

### 반드시 확인해야 할 사항
- [ ] 인라인 스타일 사용 여부
- [ ] any 타입 사용 여부
- [ ] 컴포넌트/컨트롤러 크기 (500줄/300줄 이하)
- [ ] 중복 코드 존재 여부
- [ ] 테스트 코드 작성 여부
- [ ] 보안 취약점 여부
- [ ] 성능 최적화 필요성

---

## 🚀 개발 워크플로

### 1. 기능 구현 전
```bash
# 1. 기존 코드 분석
grep -r "비슷한기능" .

# 2. 스타일 가이드 확인
cat CODING_STYLE_GUIDE.md

# 3. 이 가이드 참조
cat DEVELOPMENT_GUIDE.md
```

### 2. 구현 중
- 위 체크리스트 지속 참조
- 테스트 주도 개발(TDD) 권장

### 3. 구현 후
```bash
# 1. 린트 검사
npm run lint:check      # Frontend
./gradlew checkstyleMain # Backend

# 2. 테스트 실행
npm run test            # Frontend
./gradlew test          # Backend

# 3. 빌드 확인
npm run build           # Frontend
./gradlew build         # Backend
```

---

## ⚡ 긴급 대응 가이드

### 성능 문제 발생 시
1. Chrome DevTools Performance 탭 확인
2. Spring Actuator 메트릭 확인
3. 데이터베이스 슬로우 쿼리 확인

### 버그 발생 시
1. 에러 로그 확인
2. 재현 경로 파악
3. 테스트 케이스 작성
4. 수정 후 회귀 테스트

---

## 📚 참고 문서

- [FRONTEND_ANALYSIS_REPORT.md](./FRONTEND_ANALYSIS_REPORT.md) - Frontend 문제점 상세 분석
- [BACKEND_ANALYSIS_REPORT.md](./BACKEND_ANALYSIS_REPORT.md) - Backend 문제점 상세 분석
- [CODING_STYLE_GUIDE.md](./CODING_STYLE_GUIDE.md) - 코딩 스타일 가이드

---

**⚠️ 중요: 이 문서는 Claude Code가 매 세션마다 참조해야 하는 핵심 가이드입니다.**  
**개발 시작 전 반드시 이 문서를 읽고 체크리스트를 확인하세요.**

**🔄 업데이트: Redis 제거, 데이터베이스 기반 세션 관리로 변경**

---
*마지막 업데이트: 2025-09-03*  
*작성자: Claude AI (기존 프로젝트 분석 기반, Redis 제외 버전)*
