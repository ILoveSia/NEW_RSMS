# RSMS Frontend 보안 가이드

## 🔒 보안 아키텍처 개요

RSMS 프론트엔드는 **레벨 2 보안 정책**을 적용하여 민감한 데이터를 최소화하고, 실제 인증은 서버 측에서 관리합니다.

---

## 🛡️ 핵심 보안 원칙

### 1. **실제 인증 메커니즘**
```yaml
인증 방식: HttpOnly 쿠키 기반 세션 관리
세션 저장소: PostgreSQL Database (Spring Session JDBC)
쿠키 설정:
  - HttpOnly: true (JavaScript 접근 불가)
  - Secure: true (HTTPS only in production)
  - SameSite: Strict (CSRF 방지)
```

**중요**: 실제 인증은 서버의 `SESSIONID` 쿠키로만 관리되며, localStorage의 데이터는 **UI 표시 용도**입니다.

### 2. **클라이언트 저장소 정책**

#### ✅ localStorage에 저장하는 데이터 (최소화)
```typescript
// authStore (rsms-auth-store)
{
  user: {
    userId: number,         // 사용자 ID
    username: string,       // 사용자 아이디 (UI 표시용)
    isAdmin: boolean,       // 관리자 여부 (UI 제어용)
    isExecutive: boolean,   // 임원 여부 (UI 제어용)
    authLevel: number       // 권한 레벨 1~10 (UI 제어용)
  },
  isAuthenticated: boolean,
  permissions: string[],  // UI 권한 체크용 (실제 검증은 서버)
  roleCodes: string[]     // UI 역할 체크용 (실제 검증은 서버)
}

// menuStore (rsms-menu-store)
{
  menus: MenuItem[]       // 메뉴 구조 (공개 정보)
}

// codeStore (rsms-code-store)
{
  codeGroups: CodeGroup[] // 공통코드 (공개 정보)
}
```

#### ❌ localStorage에 저장하지 않는 민감 데이터
- `sessionId` - 서버 HttpOnly 쿠키로 관리
- `passwordHash` - 절대 클라이언트에 저장 안 함
- `empNo` - 사원번호 (민감 정보)
- `accountStatus` - 계정 상태 세부 정보
- `failedLoginCount` - 보안 정보
- `lockedUntil` - 보안 정보

---

## 🔐 보안 구현 상세

### 1. **Zustand Store 보안 설정**

#### authStore.ts
```typescript
persist(
  (set, get) => ({ /* store logic */ }),
  {
    name: 'rsms-auth-store',
    // partialize: 저장할 데이터 선택 (보안 핵심)
    partialize: (state) => ({
      user: state.user ? {
        userId: state.user.userId,      // 사용자 ID
        username: state.user.username,  // 사용자 아이디 (UI 표시용)
        isAdmin: state.user.isAdmin,    // 관리자 여부 (UI 제어용)
        isExecutive: state.user.isExecutive, // 임원 여부 (UI 제어용)
        authLevel: state.user.authLevel, // 권한 레벨 (UI 제어용)
        // 민감 정보 제외: empNo, accountStatus, failedLoginCount 등
      } as Partial<User> : null,

      // sessionId 제외 - HttpOnly 쿠키로 관리
      isAuthenticated: state.isAuthenticated,
      permissions: state.permissions,  // UI용 캐시
      roleCodes: state.roleCodes,      // UI용 캐시
    }),
  }
)
```

**핵심 포인트**:
- `partialize` 함수로 저장할 데이터를 명시적으로 선택
- 민감한 정보는 제외하고 최소한만 저장
- `sessionId`는 localStorage에 저장하지 않음

### 2. **Axios 인증 설정**

모든 API 클라이언트는 `withCredentials: true` 설정:

```typescript
// authApi.ts, menuApi.ts, codeApi.ts 등
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,  // 쿠키 자동 포함
  timeout: 10000,
});
```

**동작 원리**:
1. 로그인 성공 시 서버가 `Set-Cookie: SESSIONID=xxx; HttpOnly; Secure` 응답
2. 브라우저가 쿠키 자동 저장 (JavaScript 접근 불가)
3. 이후 모든 API 요청에 쿠키 자동 포함
4. 서버가 쿠키의 SESSIONID로 세션 검증

### 3. **서버 권한 검증 (필수)**

클라이언트의 권한 정보는 **UI 제어 용도**이며, 실제 권한은 서버에서 매번 검증합니다.

#### Backend 권한 검증 예시
```java
// Controller에서 권한 검증
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/api/admin/users")
public ResponseEntity<List<User>> getUsers() {
    // 실제 권한 검증은 Spring Security가 수행
    return ResponseEntity.ok(userService.getAllUsers());
}

// 동적 권한 검증
@PreAuthorize("@userSecurityService.canModifyUser(#userId, authentication.name)")
@PutMapping("/api/users/{userId}")
public ResponseEntity<User> updateUser(
    @PathVariable String userId,
    @RequestBody UpdateUserRequest request
) {
    return ResponseEntity.ok(userService.updateUser(userId, request));
}
```

#### Frontend 권한 체크 (UI 편의성)
```typescript
import { useAuthStore } from '@/app/store/authStore';

const MyComponent: React.FC = () => {
  const { hasPermission, hasRole } = useAuthStore();

  // UI 표시 제어 (실제 검증은 서버)
  const canCreateUser = hasPermission('USER_CREATE');
  const isAdmin = hasRole('ADMIN');

  return (
    <div>
      {canCreateUser && <Button>사용자 생성</Button>}
      {isAdmin && <AdminPanel />}
    </div>
  );
};
```

**중요**: 클라이언트 권한 체크는 **UX 개선**을 위한 것이며, 실제 보안은 서버 검증에 의존합니다.

---

## 🚨 XSS (Cross-Site Scripting) 방어

### 1. **Content Security Policy (CSP)**

`index.html`에 CSP 메타 태그 추가 권장:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' http://localhost:8080;
  "
>
```

### 2. **입력 Sanitization**

사용자 입력 데이터를 렌더링할 때 항상 sanitize:

```typescript
import DOMPurify from 'dompurify';

// 위험한 HTML 렌더링 방지
const SafeHtmlComponent: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### 3. **React의 기본 XSS 방어**

React는 기본적으로 XSS를 방어하지만 주의사항:

```typescript
// ✅ 안전 - React가 자동 이스케이프
<div>{userInput}</div>

// ⚠️ 위험 - dangerouslySetInnerHTML 사용 시 sanitize 필수
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ❌ 위험 - eval 사용 금지
eval(userInput); // 절대 사용 금지
```

---

## 🔒 CSRF (Cross-Site Request Forgery) 방어

### 1. **SameSite 쿠키 설정**

Backend SecurityConfig에서 설정:

```java
@Bean
public CookieSerializer cookieSerializer() {
    DefaultCookieSerializer serializer = new DefaultCookieSerializer();
    serializer.setCookieName("SESSIONID");
    serializer.setHttpOnly(true);
    serializer.setSecure(true);  // HTTPS only in production
    serializer.setSameSite("Strict"); // CSRF 방지
    return serializer;
}
```

### 2. **Axios CSRF 토큰 설정 (선택)**

필요 시 CSRF 토큰 자동 포함:

```typescript
// axiosConfig.ts
apiClient.interceptors.request.use((config) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }

  return config;
});
```

---

## 🔄 세션 관리

### 1. **세션 타임아웃**

```typescript
// useSessionCheck.ts
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5분

export const useSessionCheck = (checkInterval = SESSION_CHECK_INTERVAL) => {
  useEffect(() => {
    if (!isAuthenticated) return;

    const intervalId = setInterval(async () => {
      try {
        await getCurrentUserApi();
      } catch (error: any) {
        if (error.response?.status === 401) {
          logout(); // 세션 만료 시 로그아웃
        }
      }
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);
};
```

### 2. **자동 로그아웃**

```typescript
// App.tsx - 페이지 로드 시 세션 검증
useEffect(() => {
  const validateSession = async () => {
    if (isAuthenticated && !isLoginPage) {
      try {
        const response = await getCurrentUserApi();
        if (!response.success) {
          logout(); // 세션 무효 시 로그아웃
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
  };

  validateSession();
}, [isAuthenticated]);
```

---

## 📊 보안 모니터링

### 1. **접근 로그**

모든 API 호출은 서버에서 `access_logs` 테이블에 기록:

```sql
-- rsms.access_logs 테이블
CREATE TABLE access_logs (
  log_id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  session_id VARCHAR(255),
  action VARCHAR(100),
  resource VARCHAR(500),
  method VARCHAR(10),
  ip_address VARCHAR(50),
  user_agent TEXT,
  status_code INTEGER,
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **비정상 접근 탐지**

Backend에서 비정상 패턴 모니터링:
- 짧은 시간 내 반복 로그인 시도 (Brute Force)
- 권한 없는 리소스 접근 시도
- 비정상적인 API 호출 패턴

---

## 🎯 보안 체크리스트

### Frontend 개발 시

- [ ] 민감한 데이터는 localStorage에 저장하지 않음
- [ ] 모든 API 클라이언트에 `withCredentials: true` 설정
- [ ] 사용자 입력은 항상 sanitize (DOMPurify)
- [ ] `dangerouslySetInnerHTML` 사용 시 반드시 sanitize
- [ ] `eval()` 절대 사용 금지
- [ ] 권한 체크는 UI 편의성용, 실제 검증은 서버
- [ ] 세션 타임아웃 처리 구현
- [ ] 403/401 에러 시 적절한 로그아웃 처리

### Backend 개발 시

- [ ] 모든 API 엔드포인트에 권한 검증 (`@PreAuthorize`)
- [ ] HttpOnly, Secure, SameSite 쿠키 설정
- [ ] CORS 설정 (`withCredentials` 지원)
- [ ] 비밀번호 평문 저장 금지 (BCrypt 해싱)
- [ ] 접근 로그 기록
- [ ] 세션 타임아웃 설정 (30분 권장)
- [ ] SQL Injection 방어 (JPA/Prepared Statement)

---

## 🚀 보안 업그레이드 옵션

현재는 **레벨 2 (민감 데이터 제외)** 방식이지만, 보안 요구사항에 따라 업그레이드 가능:

### 레벨 3: sessionStorage 사용
```typescript
// authStore.ts
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'rsms-auth-store',
    storage: createJSONStorage(() => sessionStorage), // 탭 닫으면 삭제
  }
)
```

**장점**: 탭 닫으면 자동 삭제
**단점**: 탭 닫고 다시 열면 재로그인 필요

### 레벨 4: 암호화 저장
```typescript
import CryptoJS from 'crypto-js';

const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;

// 커스텀 storage 구현
const encryptedStorage = {
  getItem: (name: string) => {
    const encrypted = localStorage.getItem(name);
    if (!encrypted) return null;

    const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
  setItem: (name: string, value: string) => {
    const encrypted = CryptoJS.AES.encrypt(value, encryptionKey).toString();
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  }
};
```

**장점**: 평문 노출 방지
**단점**: 완벽한 보안 아님 (키 노출 가능), 성능 저하

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [React Security Best Practices](https://react.dev/learn/security)

---

## 📊 저장 데이터 비교 (Before/After)

### ❌ 변경 전 (보안 위험)
```typescript
localStorage: {
  user: {
    userId: 1,
    username: 'admin',
    empNo: 'EMP001',           // ⚠️ 사원번호 (민감정보)
    accountStatus: 'ACTIVE',   // ⚠️ 계정 상태
    failedLoginCount: 0,       // ⚠️ 보안 정보
    lockedUntil: null,         // ⚠️ 보안 정보
    passwordHash: '...',       // ⚠️ 비밀번호 해시
    ...
  },
  sessionId: 'session-xxx',    // ⚠️ 불필요
  isAuthenticated: true,
  permissions: [...],
  roleCodes: [...]
}
```

### ✅ 변경 후 (보안 강화 - 레벨 2)
```typescript
localStorage: {
  user: {
    userId: 1,          // ✓ 사용자 ID
    username: 'admin',  // ✓ 사용자 아이디 (UI 표시용)
    isAdmin: true,      // ✓ 관리자 여부 (UI 제어용)
    isExecutive: false, // ✓ 임원 여부 (UI 제어용)
    authLevel: 10       // ✓ 권한 레벨 (UI 제어용)
    // empNo, accountStatus, failedLoginCount 등 제외
  },
  // sessionId 제외 - HttpOnly 쿠키로 관리
  isAuthenticated: true,
  permissions: [...],  // UI용 캐시
  roleCodes: [...]     // UI용 캐시
}
```

**개선 사항**:
- 민감한 개인정보 (empNo) 제외
- 보안 관련 정보 (accountStatus, failedLoginCount, lockedUntil) 제외
- sessionId 제거 - 실제 인증은 HttpOnly 쿠키로 관리
- UI 제어에 필요한 최소 정보만 저장

---

**마지막 업데이트**: 2025-09-24
**보안 레벨**: Level 2 (민감 데이터 제외)
**검토자**: Claude AI
