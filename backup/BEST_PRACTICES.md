# 🏆 RSMS 프로젝트 베스트 프랙티스

## 📌 개요
이 문서는 기존 프로젝트의 문제점을 분석하여 도출된 베스트 프랙티스를 담고 있습니다.  
모든 개발자는 이 문서의 패턴을 따라 일관되고 품질 높은 코드를 작성해야 합니다.

---

## 🎯 Frontend 베스트 프랙티스

### 1. 컴포넌트 설계 패턴

#### ✅ 컨테이너/프레젠테이셔널 패턴
```tsx
// ❌ Bad: 로직과 뷰가 혼재
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return (
    <div style={{ padding: '20px' }}>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};

// ✅ Good: 관심사 분리
// Container Component
const UserListContainer = () => {
  const { users, loading, error } = useUsers();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <UserListView users={users} />;
};

// Presentational Component
const UserListView = ({ users }: { users: User[] }) => {
  return (
    <UserListWrapper>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </UserListWrapper>
  );
};

const UserListWrapper = styled.div`
  padding: ${props => props.theme.spacing.lg};
  display: grid;
  gap: ${props => props.theme.spacing.md};
`;
```

#### ✅ Custom Hook 패턴
```typescript
// hooks/useUsers.ts
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userApi.getAll();
        setUsers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  return { users, loading, error };
};
```

### 2. 상태 관리 패턴

#### ✅ Redux Toolkit + RTK Query
```typescript
// store/api/userApi.ts
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = selectAuthToken(store.getState());
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (user) => ({
        url: 'users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// 컴포넌트에서 사용
const UserList = () => {
  const { data: users, isLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  
  // ...
};
```

### 3. 타입 안전성 패턴

#### ✅ Type Guard 활용
```typescript
// ❌ Bad: any 타입 사용
const handleResponse = (data: any) => {
  console.log(data.user.name); // 타입 안전성 없음
};

// ✅ Good: Type Guard와 unknown 활용
interface UserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const isUserResponse = (data: unknown): data is UserResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as any).user === 'object' &&
    'id' in (data as any).user &&
    'name' in (data as any).user
  );
};

const handleResponse = (data: unknown) => {
  if (!isUserResponse(data)) {
    throw new Error('Invalid response format');
  }
  
  console.log(data.user.name); // 타입 안전!
};
```

### 4. 성능 최적화 패턴

#### ✅ React.memo와 useMemo
```tsx
// ❌ Bad: 불필요한 리렌더링
const ExpensiveList = ({ items, filter }) => {
  const filteredItems = items.filter(item => 
    item.name.includes(filter)
  );
  
  return (
    <div>
      {filteredItems.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
};

// ✅ Good: 최적화된 렌더링
const ExpensiveList = React.memo(({ items, filter }) => {
  const filteredItems = useMemo(
    () => items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  
  return (
    <div>
      {filteredItems.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
});

const ExpensiveItem = React.memo(({ item }) => {
  return <ItemCard>{item.name}</ItemCard>;
});
```

#### ✅ Code Splitting
```typescript
// 라우트 레벨 코드 분할
const AdminPage = lazy(() => import('./pages/AdminPage'));
const UserPage = lazy(() => import('./pages/UserPage'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/user/*" element={<UserPage />} />
      </Routes>
    </Suspense>
  );
};
```

### 5. 에러 처리 패턴

#### ✅ Error Boundary
```tsx
// components/ErrorBoundary.tsx
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // 에러 로깅 서비스로 전송
    errorReportingService.log({ error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

---

## 🎯 Backend 베스트 프랙티스

### 1. Controller 패턴

#### ✅ CQRS 패턴 적용
```java
// ❌ Bad: 비대한 단일 컨트롤러
@RestController
@RequestMapping("/api/users")
public class UserController {
    // 500줄 이상의 코드...
}

// ✅ Good: Query/Command 분리
// Query Controller
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Query", description = "사용자 조회 API")
public class UserQueryController {
    private final UserQueryService queryService;
    
    @GetMapping("/{id}")
    @Operation(summary = "사용자 상세 조회")
    public ResponseEntity<UserDetailDto> getUser(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(queryService.findById(id));
    }
    
    @GetMapping
    @Operation(summary = "사용자 목록 조회")
    public ResponseEntity<Page<UserSummaryDto>> getUsers(
        @PageableDefault(size = 20) Pageable pageable,
        @ModelAttribute UserSearchDto searchDto
    ) {
        return ResponseEntity.ok(queryService.findAll(pageable, searchDto));
    }
}

// Command Controller
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Command", description = "사용자 명령 API")
public class UserCommandController {
    private final UserCommandService commandService;
    
    @PostMapping
    @Operation(summary = "사용자 생성")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserDto> createUser(
        @RequestBody @Valid CreateUserDto dto
    ) {
        UserDto created = commandService.create(dto);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "사용자 수정")
    public ResponseEntity<UserDto> updateUser(
        @PathVariable Long id,
        @RequestBody @Valid UpdateUserDto dto
    ) {
        return ResponseEntity.ok(commandService.update(id, dto));
    }
}
```

### 2. Service 패턴

#### ✅ Base Service 활용
```java
// Base Service
@Slf4j
public abstract class BaseService<T, ID> {
    protected abstract JpaRepository<T, ID> getRepository();
    protected abstract String getEntityName();
    
    protected T findEntityById(ID id) {
        return getRepository().findById(id)
            .orElseThrow(() -> new EntityNotFoundException(
                String.format("%s not found with id: %s", getEntityName(), id)
            ));
    }
    
    @Transactional(readOnly = true)
    public Page<T> findAll(Pageable pageable) {
        return getRepository().findAll(pageable);
    }
}

// 구현체
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserService extends BaseService<User, Long> {
    private final UserRepository repository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    protected JpaRepository<User, Long> getRepository() {
        return repository;
    }
    
    @Override
    protected String getEntityName() {
        return "User";
    }
    
    @Transactional
    public UserDto create(CreateUserDto dto) {
        log.info("Creating new user: email={}", dto.getEmail());
        
        // 중복 체크
        if (repository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        
        // 엔티티 생성
        User user = mapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        // 저장
        User saved = repository.save(user);
        log.info("User created successfully: id={}", saved.getId());
        
        return mapper.toDto(saved);
    }
}
```

### 3. Repository 패턴

#### ✅ JPA 최적화
```java
// ❌ Bad: N+1 문제 발생
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findAll(); // Lazy Loading으로 N+1 발생
}

// ✅ Good: 최적화된 쿼리
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    @EntityGraph(attributePaths = {"roles", "department"})
    Optional<User> findWithDetailsById(Long id);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);
    
    @Query("""
        SELECT new com.rsms.dto.UserSummaryDto(
            u.id, u.name, u.email, d.name
        )
        FROM User u
        LEFT JOIN u.department d
        WHERE u.status = :status
        """)
    Page<UserSummaryDto> findSummaryByStatus(
        @Param("status") UserStatus status,
        Pageable pageable
    );
}
```

### 4. 예외 처리 패턴

#### ✅ 전역 예외 처리
```java
// 커스텀 예외
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}

// 에러 코드 정의
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 공통
    INVALID_INPUT("E001", "잘못된 입력값입니다", HttpStatus.BAD_REQUEST),
    ENTITY_NOT_FOUND("E002", "엔티티를 찾을 수 없습니다", HttpStatus.NOT_FOUND),
    
    // 사용자
    USER_NOT_FOUND("U001", "사용자를 찾을 수 없습니다", HttpStatus.NOT_FOUND),
    DUPLICATE_EMAIL("U002", "이미 사용 중인 이메일입니다", HttpStatus.CONFLICT),
    INVALID_PASSWORD("U003", "비밀번호가 일치하지 않습니다", HttpStatus.BAD_REQUEST),
    
    // 권한
    ACCESS_DENIED("A001", "접근 권한이 없습니다", HttpStatus.FORBIDDEN),
    UNAUTHORIZED("A002", "인증이 필요합니다", HttpStatus.UNAUTHORIZED);
    
    private final String code;
    private final String message;
    private final HttpStatus status;
}

// Global Exception Handler
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        log.error("Business exception: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(
            e.getErrorCode().getCode(),
            e.getMessage()
        );
        return ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        MethodArgumentNotValidException e
    ) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorResponse response = ErrorResponse.of(
            ErrorCode.INVALID_INPUT.getCode(),
            "입력값 검증 실패",
            errors
        );
        return ResponseEntity.badRequest().body(response);
    }
}
```

### 5. 트랜잭션 패턴

#### ✅ 올바른 트랜잭션 관리
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    
    // ✅ Good: 명확한 트랜잭션 경계
    @Transactional
    public OrderDto createOrder(CreateOrderDto dto) {
        // 1. 주문 생성 (트랜잭션 내)
        Order order = Order.builder()
            .userId(dto.getUserId())
            .items(dto.getItems())
            .status(OrderStatus.PENDING)
            .build();
        Order saved = orderRepository.save(order);
        
        // 2. 결제 처리 (트랜잭션 내)
        PaymentResult payment = paymentService.process(saved);
        saved.updatePayment(payment);
        
        // 3. 이벤트 발생 (트랜잭션 커밋 후 실행)
        ApplicationEventPublisher.publishEvent(
            new OrderCreatedEvent(saved.getId())
        );
        
        return orderMapper.toDto(saved);
    }
    
    // 이벤트 리스너 (별도 트랜잭션)
    @EventListener
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        try {
            notificationService.sendOrderConfirmation(event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to send notification for order: {}", event.getOrderId(), e);
            // 실패해도 주문은 유지
        }
    }
}
```

### 6. 성능 최적화 패턴

#### ✅ 캐싱 전략
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ConfigService {
    
    @Cacheable(value = "configs", key = "#key")
    public String getConfig(String key) {
        log.info("Loading config from database: {}", key);
        return configRepository.findByKey(key)
            .map(Config::getValue)
            .orElse(null);
    }
    
    @CacheEvict(value = "configs", key = "#key")
    public void updateConfig(String key, String value) {
        Config config = configRepository.findByKey(key)
            .orElseGet(() -> new Config(key));
        config.setValue(value);
        configRepository.save(config);
    }
    
    @CacheEvict(value = "configs", allEntries = true)
    public void clearCache() {
        log.info("Clearing all config cache");
    }
}
```

---

## 🧪 테스트 베스트 프랙티스

### Frontend 테스트
```typescript
// UserList.test.tsx
describe('UserList', () => {
  it('should render users correctly', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    ];
    
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json(mockUsers));
      })
    );
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});
```

### Backend 테스트
```java
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(locations = "classpath:application-test.yml")
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    @DisplayName("사용자 생성 - 성공")
    void createUser_Success() throws Exception {
        // Given
        CreateUserDto createDto = CreateUserDto.builder()
            .email("test@example.com")
            .name("Test User")
            .password("password123")
            .build();
        
        UserDto userDto = UserDto.builder()
            .id(1L)
            .email("test@example.com")
            .name("Test User")
            .build();
        
        given(userService.create(any(CreateUserDto.class)))
            .willReturn(userDto);
        
        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.email").value("test@example.com"))
            .andExpect(header().exists("Location"));
    }
}
```

---

## 🔐 보안 베스트 프랙티스

### 인증/인가
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
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
}
```

---

## 📈 모니터링 베스트 프랙티스

### 구조화된 로깅
```java
@Slf4j
@Component
public class LoggingAspect {
    
    @Around("@annotation(Loggable)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            
            log.info("Method: {}, Duration: {}ms, Success: true",
                joinPoint.getSignature().toShortString(), duration);
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - start;
            
            log.error("Method: {}, Duration: {}ms, Success: false, Error: {}",
                joinPoint.getSignature().toShortString(), duration, e.getMessage());
            
            throw e;
        }
    }
}
```

---

## 📋 체크리스트

### 코드 리뷰 체크리스트
- [ ] SOLID 원칙 준수
- [ ] DRY 원칙 준수
- [ ] 테스트 커버리지 80% 이상
- [ ] 문서화 완료
- [ ] 보안 취약점 검사
- [ ] 성능 최적화 확인

### 배포 전 체크리스트
- [ ] 모든 테스트 통과
- [ ] 빌드 성공
- [ ] 환경 변수 확인
- [ ] 데이터베이스 마이그레이션
- [ ] 롤백 계획 수립

---

**📌 참고: 이 베스트 프랙티스는 지속적으로 업데이트됩니다.**  
**새로운 패턴이나 개선사항이 있다면 문서를 업데이트해주세요.**

---
*마지막 업데이트: 2025-09-03*  
*버전: 1.0.0*