# 📋 RSMS 프로젝트 코딩 스타일 가이드

## 🎯 목적
이 문서는 RSMS 프로젝트에서 일관된 코딩 스타일을 유지하여 코드의 가독성, 유지보수성, 그리고 팀 협업 효율성을 높이기 위해 작성되었습니다.

## 🏗️ 프로젝트 구조
```
RSMS/
├── backend/           # Spring Boot (Java 21)
├── frontend/          # React + TypeScript
├── database/          # PostgreSQL 스크립트
├── docs/             # 문서
├── .editorconfig     # 에디터 설정
├── .vscode/          # VS Code 설정
└── package.json      # 루트 패키지 설정
```

## ⚙️ 개발 환경 설정

### 1. 필수 설치 도구
- **Node.js** 18+
- **Java** 21
- **PostgreSQL** 15+
- **Git** 2.30+
- **VS Code** (권장) 또는 IntelliJ IDEA

### 2. VS Code 필수 확장
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "redhat.java",
    "vscjava.vscode-java-pack"
  ]
}
```

### 3. 프로젝트 초기 설정
```bash
# 1. 저장소 클론
git clone <repository-url>
cd RSMS

# 2. 의존성 설치
npm install
npm run install:all

# 3. Git hooks 설정
npm run prepare

# 4. 개발 서버 실행
npm run dev
```

## 🎨 코딩 스타일 규칙

### Backend (Java/Spring Boot)

#### 네이밍 컨벤션
- **클래스**: PascalCase `UserController`, `OrderService`
- **메서드/변수**: camelCase `getUserInfo()`, `userName`
- **상수**: UPPER_SNAKE_CASE `MAX_RETRY_COUNT`
- **패키지**: lowercase.dot.notation `com.rsms.user.service`

#### 코드 구조
```java
// ✅ 좋은 예시
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        UserResponse user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
}
```

#### 주요 규칙
- **들여쓰기**: 4칸 스페이스
- **최대 줄 길이**: 120자
- **메서드 길이**: 50줄 이내
- **파라미터 개수**: 7개 이내
- **Import 순서**: java → javax → org → com
- **어노테이션**: 별도 줄에 작성

### Frontend (React/TypeScript)

#### 네이밍 컨벤션
- **컴포넌트**: PascalCase `UserProfile`, `OrderList`
- **함수/변수**: camelCase `getUserData()`, `isLoading`
- **상수**: UPPER_SNAKE_CASE `API_BASE_URL`
- **파일명**: PascalCase for components, camelCase for utilities

#### 컴포넌트 구조
```tsx
// ✅ 좋은 예시
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUser(userId);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <div>사용자를 찾을 수 없습니다.</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};

export default UserProfile;
```

#### 주요 규칙
- **들여쓰기**: 2칸 스페이스
- **최대 줄 길이**: 100자
- **따옴표**: 싱글 쿼트 `'`
- **세미콜론**: 항상 사용
- **JSX**: 싱글 쿼트 `'`
- **객체 리터럴**: trailing comma 사용

## 🔧 도구 설정

### 자동 포맷팅 명령어
```bash
# Frontend 스타일 검사 및 수정
cd frontend
npm run lint          # ESLint 검사 및 자동 수정
npm run format        # Prettier 포맷팅
npm run type-check    # TypeScript 타입 검사

# Backend 스타일 검사
cd backend
./gradlew checkstyleMain checkstyleTest  # Checkstyle 검사
./gradlew build                          # 전체 빌드 및 검사

# 전체 프로젝트 (루트에서)
npm run style:fix     # 모든 스타일 자동 수정
npm run style:check   # 모든 스타일 검사
```

### Git Hooks
- **Pre-commit**: 코드 스타일, 타입 검사, 컴파일 검사
- **Pre-push**: 전체 테스트 실행

## 📝 커밋 메시지 규칙

### 커밋 메시지 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입
- **feat**: 새로운 기능
- **fix**: 버그 수정
- **docs**: 문서 변경
- **style**: 코드 포맷팅 (기능 변경 없음)
- **refactor**: 리팩토링
- **test**: 테스트 추가/수정
- **chore**: 빌드 프로세스, 도구 설정 변경

### 예시
```
feat(user): 사용자 프로필 조회 API 추가

사용자 ID를 통해 프로필 정보를 조회하는 REST API를 구현했습니다.
- GET /api/users/{id} 엔드포인트 추가
- UserService, UserRepository 구현
- 예외 처리 및 로깅 추가

Closes #123
```

## 🚨 코드 품질 기준

### 필수 검사 항목
- [ ] 컴파일 에러 없음
- [ ] 린트 에러 없음
- [ ] 타입 에러 없음 (TypeScript)
- [ ] 테스트 통과
- [ ] 코드 리뷰 완료

### 권장 사항
- **단위 테스트** 커버리지 80% 이상
- **함수/메서드** 복잡도 15 이하
- **파일 크기** 500줄 이하
- **성능** 최적화 고려

## 🔍 문제 해결

### 자주 발생하는 문제

#### 1. ESLint 오류
```bash
# 자동 수정
npm run lint

# 특정 규칙 비활성화 (최후의 수단)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

#### 2. Prettier 충돌
```bash
# 설정 확인
npm run format:check

# 자동 포맷팅
npm run format
```

#### 3. Checkstyle 오류
```bash
# 검사 실행
./gradlew checkstyleMain

# 리포트 확인
open backend/build/reports/checkstyle/main.html
```

### 도움말
- **Slack**: #dev-help 채널
- **Wiki**: 프로젝트 위키 참조
- **Code Review**: PR 템플릿 활용

## 📚 참고 자료

### 공식 가이드
- [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### 도구 문서
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Checkstyle Checks](https://checkstyle.sourceforge.io/checks.html)

---

**📅 마지막 업데이트**: 2024-09-03  
**📝 문서 버전**: 1.0.0  
**👥 관리자**: 개발팀