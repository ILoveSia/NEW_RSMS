# 🎯 RSMS Backend 개발 가이드 (Claude Code 참조용)

## 📋 개요
이 문서는 Claude Code가 RSMS Backend 개발 시 반드시 참조해야 할 핵심 개발 가이드입니다.

---

## 🚨 절대 하지 말아야 할 것들 (NEVER DO)

### Controller 관련 금지사항
```java
// ❌ 절대 금지 - Controller에서 직접 Entity 반환
@GetMapping("/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.findById(id)); // Entity 직접 반환
}

// ✅ 반드시 이렇게 - DTO 사용
@GetMapping("/{id}")
public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
    UserDto user = userService.findById(id);
    return ResponseEntity.ok(user); // DTO 반환
}
```

### Domain Layer 금지사항
```java
// ❌ 절대 금지 - Domain Layer에서 외부 의존성 참조
@Entity
public class User {
    public void sendEmail() {
        EmailService.send(); // 외부 의존성 직접 참조
    }
}

// ✅ 반드시 이렇게 - Domain Service에서 처리
@Service
public class UserDomainService {
    private final EmailService emailService;
    
    public void sendUserNotification(User user) {
        emailService.send(user.getEmail(), "notification");
    }
}
```

### 트랜잭션 관리 금지사항
```java
// ❌ 절대 금지 - 운영 환경에서 ddl-auto: update
spring.jpa.hibernate.ddl-auto: update  // 운영 환경 금지

// ✅ 반드시 이렇게 - 운영 환경
spring.jpa.hibernate.ddl-auto: none   // 운영 환경
```

---

## ✅ 핵심 개발 원칙

### 1. SOLID 원칙 준수
```java
// Single Responsibility - 단일 책임
@Service
@Transactional(readOnly = true)
public class RespService {
    // 책무 관리에만 집중
}

// Open/Closed - 개방/폐쇄
public interface RespCalculator {
    RespScore calculate(Resp resp);
}

// Dependency Inversion - 의존성 역전
@Service
public class RespService {
    private final RespRepository repository;  // 추상화에 의존
    private final RespCalculator calculator;  // 인터페이스에 의존
}
```

### 2. Domain-Driven Design 구조
```
src/main/java/com/rsms/
├── domain/                 # 도메인 계층
│   ├── auth/              # 인증/인가 도메인
│   ├── user/              # 사용자 관리 도메인
│   ├── resp/              # 책무 관리 도메인 (핵심)
│   ├── report/            # 보고서 도메인
│   ├── dashboard/         # 대시보드 도메인
│   └── settings/          # 설정 도메인
├── application/           # 애플리케이션 계층
├── infrastructure/        # 인프라 계층
├── interfaces/            # 인터페이스 계층
└── global/               # 전역 설정
```

### 3. 레이어별 책임
- **Domain**: 핵심 비즈니스 로직, Entity, Domain Service
- **Application**: Use Cases, Application Service
- **Infrastructure**: Repository 구현, 외부 시스템 연동
- **Interface**: REST Controller, DTO

---

## 🏛️ 도메인 모델 개발 가이드

### BaseEntity 패턴
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
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
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof BaseEntity)) return false;
        return getId() != null && getId().equals(((BaseEntity) obj).getId());
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
```

### Entity 개발 패턴
```java
@Entity
@Table(name = "resps")
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class Resp extends BaseEntity {
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    @Range(min = 1, max = 5)
    private Integer priority;
    
    @Column(nullable = false)  
    @Range(min = 1, max = 5)
    private Integer complexity;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RespStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RespCategory category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;
    
    @OneToMany(mappedBy = "resp", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RespAction> actions = new ArrayList<>();
    
    // 비즈니스 로직 (Domain Logic)
    public RespScore calculateScore() {
        return RespScore.of(priority * complexity);
    }
    
    public boolean canBeAssignedTo(User user) {
        return user.hasRole(UserRole.RESP_MANAGER) || 
               user.hasRole(UserRole.ADMIN);
    }
    
    public void assignTo(User user) {
        if (!canBeAssignedTo(user)) {
            throw new RespAssignmentNotAllowedException();
        }
        this.assignedUser = user;
        this.status = RespStatus.ASSIGNED;
    }
    
    public void complete() {
        if (status != RespStatus.IN_PROGRESS) {
            throw new InvalidRespStatusException("Only IN_PROGRESS resp can be completed");
        }
        this.status = RespStatus.COMPLETED;
    }
}
```

### Value Object 패턴
```java
@Embeddable
@Getter @NoArgsConstructor @AllArgsConstructor
public class RespScore {
    
    @Column(name = "resp_score")
    private Integer value;
    
    public static RespScore of(Integer score) {
        if (score < 1 || score > 25) {
            throw new IllegalArgumentException("Resp score must be between 1 and 25");
        }
        return new RespScore(score);
    }
    
    public RespPriority getPriority() {
        if (value >= 20) return RespPriority.CRITICAL;
        if (value >= 15) return RespPriority.HIGH;
        if (value >= 10) return RespPriority.MEDIUM;
        return RespPriority.LOW;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof RespScore)) return false;
        return Objects.equals(value, ((RespScore) obj).value);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
```

---

## 🏗️ Service 계층 개발 가이드

### BaseService 패턴
```java
@Transactional(readOnly = true)
public abstract class BaseService<T extends BaseEntity, ID> {
    
    protected abstract JpaRepository<T, ID> getRepository();
    protected abstract String getEntityName();
    
    public T findEntityById(ID id, String entityName) {
        return getRepository().findById(id)
            .orElseThrow(() -> new NotFoundException(entityName + " not found: " + id));
    }
    
    @Transactional
    public T save(T entity) {
        return getRepository().save(entity);
    }
    
    @Transactional
    public void deleteById(ID id) {
        if (!getRepository().existsById(id)) {
            throw new NotFoundException(getEntityName() + " not found: " + id);
        }
        getRepository().deleteById(id);
    }
}
```

### Domain Service 패턴
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RespDomainService {
    
    private final RespRepository respRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Resp assignResp(Long respId, Long userId) {
        Resp resp = respRepository.findById(respId)
            .orElseThrow(() -> new NotFoundException("Resp not found: " + respId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
            
        // Domain Logic
        resp.assignTo(user);
        
        return respRepository.save(resp);
    }
    
    @Transactional
    public void bulkAssignResps(List<Long> respIds, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found: " + userId));
            
        List<Resp> resps = respRepository.findAllById(respIds);
        
        for (Resp resp : resps) {
            resp.assignTo(user);
        }
        
        respRepository.saveAll(resps);
    }
}
```

### Application Service 패턴
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RespService extends BaseService<Resp, Long> {
    
    private final RespRepository respRepository;
    private final RespDomainService respDomainService;
    private final RespMapper respMapper;
    
    @Override
    protected JpaRepository<Resp, Long> getRepository() {
        return respRepository;
    }
    
    @Override
    protected String getEntityName() {
        return "Resp";
    }
    
    public Page<RespDto> findAll(RespSearchDto searchDto, Pageable pageable) {
        Page<Resp> resps = respRepository.findByConditions(searchDto, pageable);
        return resps.map(respMapper::toDto);
    }
    
    public RespDto findById(Long id) {
        Resp resp = findEntityById(id, "Resp");
        return respMapper.toDto(resp);
    }
    
    @Transactional
    public RespDto create(CreateRespDto dto) {
        Resp resp = respMapper.toEntity(dto);
        Resp saved = respRepository.save(resp);
        return respMapper.toDto(saved);
    }
    
    @Transactional
    public RespDto update(Long id, UpdateRespDto dto) {
        Resp resp = findEntityById(id, "Resp");
        respMapper.updateEntity(dto, resp);
        return respMapper.toDto(resp);
    }
    
    @Transactional
    public RespDto assignResp(Long respId, Long userId) {
        Resp assigned = respDomainService.assignResp(respId, userId);
        return respMapper.toDto(assigned);
    }
}
```

---

## 🌐 REST API 개발 가이드

### Controller 패턴
```java
@RestController
@RequestMapping("/api/v1/resps")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Resp Management", description = "책무 관리 API")
public class RespController {
    
    private final RespService respService;
    
    @GetMapping
    @Operation(summary = "책무 목록 조회", description = "검색 조건에 따른 책무 목록을 페이징하여 조회합니다")
    public ResponseEntity<Page<RespDto>> getResps(
            @Valid @ModelAttribute RespSearchDto searchDto,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("Fetching resps with search: {}, pageable: {}", searchDto, pageable);
        
        Page<RespDto> resps = respService.findAll(searchDto, pageable);
        
        log.info("Found {} resps", resps.getTotalElements());
        return ResponseEntity.ok(resps);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "책무 상세 조회")
    public ResponseEntity<RespDto> getResp(@PathVariable Long id) {
        log.info("Fetching resp: {}", id);
        
        RespDto resp = respService.findById(id);
        return ResponseEntity.ok(resp);
    }
    
    @PostMapping
    @Operation(summary = "책무 생성")
    @PreAuthorize("hasRole('RESP_MANAGER')")
    public ResponseEntity<RespDto> createResp(
            @Valid @RequestBody CreateRespDto dto,
            Authentication authentication) {
        
        log.info("Creating resp: {} by user: {}", dto.getTitle(), authentication.getName());
        
        RespDto created = respService.create(dto);
        
        log.info("Created resp: {} with id: {}", created.getTitle(), created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "책무 수정")
    @PreAuthorize("@respSecurityService.canModifyResp(#id, authentication.name)")
    public ResponseEntity<RespDto> updateResp(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRespDto dto,
            Authentication authentication) {
        
        log.info("Updating resp: {} by user: {}", id, authentication.getName());
        
        RespDto updated = respService.update(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @PostMapping("/{id}/assign")
    @Operation(summary = "책무 담당자 할당")
    @PreAuthorize("hasRole('RESP_MANAGER')")
    public ResponseEntity<RespDto> assignResp(
            @PathVariable Long id,
            @Valid @RequestBody AssignRespDto dto) {
        
        log.info("Assigning resp: {} to user: {}", id, dto.getUserId());
        
        RespDto assigned = respService.assignResp(id, dto.getUserId());
        return ResponseEntity.ok(assigned);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "책무 삭제")
    @PreAuthorize("hasRole('ADMIN') or @respSecurityService.canModifyResp(#id, authentication.name)")
    public ResponseEntity<Void> deleteResp(@PathVariable Long id) {
        log.info("Deleting resp: {}", id);
        
        respService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

### DTO 패턴
```java
// Request DTO
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateRespDto {
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 255, message = "제목은 255자를 초과할 수 없습니다")
    private String title;
    
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "우선순위는 필수입니다")
    @Range(min = 1, max = 5, message = "우선순위는 1-5 사이여야 합니다")
    private Integer priority;
    
    @NotNull(message = "복잡도는 필수입니다")
    @Range(min = 1, max = 5, message = "복잡도는 1-5 사이여야 합니다")
    private Integer complexity;
    
    @NotNull(message = "카테고리는 필수입니다")
    private RespCategory category;
    
    private Long assignedUserId;
}

// Response DTO
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Getter @Builder
public class RespDto {
    
    private Long id;
    private String title;
    private String description;
    private Integer priority;
    private Integer complexity;
    private RespStatus status;
    private RespCategory category;
    private UserDto assignedUser;
    private Integer respScore;
    private List<RespActionDto> actions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Static Factory Method
    public static RespDto from(Resp resp) {
        return RespDto.builder()
            .id(resp.getId())
            .title(resp.getTitle())
            .description(resp.getDescription())
            .priority(resp.getPriority())
            .complexity(resp.getComplexity())
            .status(resp.getStatus())
            .category(resp.getCategory())
            .assignedUser(resp.getAssignedUser() != null ? 
                UserDto.from(resp.getAssignedUser()) : null)
            .respScore(resp.calculateScore().getValue())
            .actions(resp.getActions().stream()
                .map(RespActionDto::from)
                .collect(Collectors.toList()))
            .createdAt(resp.getCreatedAt())
            .updatedAt(resp.getUpdatedAt())
            .build();
    }
}

// Search DTO
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RespSearchDto {
    
    @Size(max = 100)
    private String keyword;
    
    private RespStatus status;
    
    private RespCategory category;
    
    @Range(min = 1, max = 5)
    private Integer minPriority;
    
    @Range(min = 1, max = 5)
    private Integer maxPriority;
    
    private Long assignedUserId;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}
```

---

## 🗃️ Repository 개발 가이드

### Repository 인터페이스
```java
public interface RespRepository extends JpaRepository<Resp, Long>, RespRepositoryCustom {
    
    // 기본 쿼리 메서드
    List<Resp> findByStatus(RespStatus status);
    
    List<Resp> findByAssignedUserId(Long userId);
    
    List<Resp> findByCategoryAndStatus(RespCategory category, RespStatus status);
    
    // @Query 사용
    @Query("SELECT r FROM Resp r WHERE r.priority >= :priority ORDER BY r.createdAt DESC")
    List<Resp> findByMinPriority(@Param("priority") Integer priority);
    
    // N+1 문제 해결
    @EntityGraph(attributePaths = {"assignedUser", "actions"})
    Optional<Resp> findWithDetailsById(Long id);
    
    // 네이티브 쿼리
    @Query(value = """
        SELECT r.*, u.username as assigned_user_name
        FROM resps r
        LEFT JOIN users u ON r.assigned_user_id = u.id
        WHERE r.status = :status
        """, nativeQuery = true)
    List<RespProjection> findRespProjectionsByStatus(@Param("status") String status);
    
    // 배치 업데이트
    @Modifying
    @Query("UPDATE Resp r SET r.status = :status WHERE r.id IN :ids")
    int updateStatusBatch(@Param("status") RespStatus status, @Param("ids") List<Long> ids);
}
```

### Custom Repository 구현
```java
public interface RespRepositoryCustom {
    Page<Resp> findByConditions(RespSearchDto searchDto, Pageable pageable);
    List<RespStatistics> getStatisticsByCategory();
}

@Repository
public class RespRepositoryImpl implements RespRepositoryCustom {
    
    private final JPAQueryFactory queryFactory;
    
    public RespRepositoryImpl(EntityManager em) {
        this.queryFactory = new JPAQueryFactory(em);
    }
    
    @Override
    public Page<Resp> findByConditions(RespSearchDto searchDto, Pageable pageable) {
        QResp resp = QResp.resp;
        QUser user = QUser.user;
        
        BooleanBuilder builder = new BooleanBuilder();
        
        // 동적 조건 생성
        if (StringUtils.hasText(searchDto.getKeyword())) {
            builder.and(resp.title.containsIgnoreCase(searchDto.getKeyword())
                .or(resp.description.containsIgnoreCase(searchDto.getKeyword())));
        }
        
        if (searchDto.getStatus() != null) {
            builder.and(resp.status.eq(searchDto.getStatus()));
        }
        
        if (searchDto.getCategory() != null) {
            builder.and(resp.category.eq(searchDto.getCategory()));
        }
        
        if (searchDto.getMinPriority() != null) {
            builder.and(resp.priority.goe(searchDto.getMinPriority()));
        }
        
        if (searchDto.getMaxPriority() != null) {
            builder.and(resp.priority.loe(searchDto.getMaxPriority()));
        }
        
        if (searchDto.getAssignedUserId() != null) {
            builder.and(resp.assignedUser.id.eq(searchDto.getAssignedUserId()));
        }
        
        if (searchDto.getStartDate() != null) {
            builder.and(resp.createdAt.goe(searchDto.getStartDate().atStartOfDay()));
        }
        
        if (searchDto.getEndDate() != null) {
            builder.and(resp.createdAt.loe(searchDto.getEndDate().atTime(23, 59, 59)));
        }
        
        // 쿼리 실행
        List<Resp> content = queryFactory
            .selectFrom(resp)
            .leftJoin(resp.assignedUser, user).fetchJoin()
            .where(builder)
            .orderBy(getOrderSpecifier(pageable))
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();
        
        // 전체 개수 조회
        Long total = queryFactory
            .select(resp.count())
            .from(resp)
            .where(builder)
            .fetchOne();
        
        return new PageImpl<>(content, pageable, total != null ? total : 0);
    }
    
    private OrderSpecifier<?> getOrderSpecifier(Pageable pageable) {
        QResp resp = QResp.resp;
        
        if (pageable.getSort().isEmpty()) {
            return resp.createdAt.desc();
        }
        
        Sort.Order order = pageable.getSort().iterator().next();
        String property = order.getProperty();
        
        return switch (property) {
            case "title" -> order.isAscending() ? resp.title.asc() : resp.title.desc();
            case "priority" -> order.isAscending() ? resp.priority.asc() : resp.priority.desc();
            case "createdAt" -> order.isAscending() ? resp.createdAt.asc() : resp.createdAt.desc();
            default -> resp.createdAt.desc();
        };
    }
}
```

---

## 🔒 보안 개발 가이드

### Spring Security 설정
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/resps").hasRole("RESP_MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/resps/**").hasAnyRole("RESP_MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resps/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
                .maxSessionsPreventsLogin(true)
                .sessionRegistry(sessionRegistry()))
                
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/public/**"))
                
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            .build();
    }
    
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 메서드 레벨 보안
```java
@Service
@RequiredArgsConstructor
public class RespSecurityService {
    
    private final RespRepository respRepository;
    
    public boolean canModifyResp(Long respId, String username) {
        return respRepository.findById(respId)
            .map(resp -> resp.getAssignedUser() != null && 
                        resp.getAssignedUser().getUsername().equals(username))
            .orElse(false);
    }
    
    public boolean canViewResp(Long respId, String username) {
        // 더 복잡한 권한 로직 가능
        return true; // 모든 사용자가 조회 가능
    }
}
```

### 입력 검증
```java
@RestController
@Validated  // 클래스 레벨 검증 활성화
public class RespController {
    
    @PostMapping
    public ResponseEntity<RespDto> createResp(
            @Valid @RequestBody CreateRespDto dto) {  // DTO 필드 검증
        // ...
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RespDto> getResp(
            @PathVariable @Positive Long id) {  // 경로 변수 검증
        // ...
    }
}

// 커스텀 검증 어노테이션
@Constraint(validatedBy = RespCategoryValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRespCategory {
    String message() default "Invalid resp category";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

---

## 🧪 테스트 개발 가이드

### 단위 테스트 (Service Layer)
```java
@ExtendWith(MockitoExtension.class)
class RespServiceTest {
    
    @Mock private RespRepository respRepository;
    @Mock private RespDomainService respDomainService;
    @Mock private RespMapper respMapper;
    
    @InjectMocks private RespService respService;
    
    @Test
    @DisplayName("책무 생성 시 정상적으로 생성되어야 한다")
    void createResp_WhenValidRequest_ShouldReturnCreatedResp() {
        // Given
        CreateRespDto dto = CreateRespDto.builder()
            .title("테스트 책무")
            .priority(3)
            .complexity(2)
            .category(RespCategory.OPERATIONAL)
            .build();
        
        Resp entity = Resp.builder()
            .title(dto.getTitle())
            .priority(dto.getPriority())
            .complexity(dto.getComplexity())
            .category(dto.getCategory())
            .build();
            
        Resp savedEntity = Resp.builder()
            .id(1L)
            .title(dto.getTitle())
            .priority(dto.getPriority())
            .complexity(dto.getComplexity())
            .category(dto.getCategory())
            .build();
            
        RespDto expectedDto = RespDto.builder()
            .id(1L)
            .title(dto.getTitle())
            .respScore(6)  // 3 * 2
            .build();
        
        when(respMapper.toEntity(dto)).thenReturn(entity);
        when(respRepository.save(entity)).thenReturn(savedEntity);
        when(respMapper.toDto(savedEntity)).thenReturn(expectedDto);
        
        // When
        RespDto result = respService.create(dto);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("테스트 책무");
        assertThat(result.getRespScore()).isEqualTo(6);
        
        verify(respRepository).save(entity);
        verify(respMapper).toEntity(dto);
        verify(respMapper).toDto(savedEntity);
    }
    
    @Test
    @DisplayName("존재하지 않는 책무 조회 시 예외가 발생해야 한다")
    void findById_WhenRespNotExists_ShouldThrowNotFoundException() {
        // Given
        Long nonExistentId = 999L;
        when(respRepository.findById(nonExistentId)).thenReturn(Optional.empty());
        
        // When & Then
        assertThatThrownBy(() -> respService.findById(nonExistentId))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Resp not found: " + nonExistentId);
    }
}
```

### 통합 테스트 (Repository Layer)
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(locations = "classpath:application-test.yml")
class RespRepositoryTest {
    
    @Autowired private TestEntityManager entityManager;
    @Autowired private RespRepository respRepository;
    
    @Test
    @DisplayName("상태별 책무 조회가 정상 작동해야 한다")
    void findByStatus_ShouldReturnRespsWithGivenStatus() {
        // Given
        Resp activeResp = Resp.builder()
            .title("활성 책무")
            .priority(3)
            .complexity(2)
            .status(RespStatus.ACTIVE)
            .category(RespCategory.OPERATIONAL)
            .build();
            
        Resp completedResp = Resp.builder()
            .title("완료된 책무")
            .priority(2)
            .complexity(1)
            .status(RespStatus.COMPLETED)
            .category(RespCategory.TECHNICAL)
            .build();
        
        entityManager.persistAndFlush(activeResp);
        entityManager.persistAndFlush(completedResp);
        entityManager.clear();
        
        // When
        List<Resp> activeResps = respRepository.findByStatus(RespStatus.ACTIVE);
        List<Resp> completedResps = respRepository.findByStatus(RespStatus.COMPLETED);
        
        // Then
        assertThat(activeResps).hasSize(1);
        assertThat(activeResps.get(0).getTitle()).isEqualTo("활성 책무");
        
        assertThat(completedResps).hasSize(1);
        assertThat(completedResps.get(0).getTitle()).isEqualTo("완료된 책무");
    }
}
```

### 컨트롤러 테스트 (MockMvc)
```java
@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "RESP_MANAGER")
class RespControllerIntegrationTest {
    
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    
    @MockBean private RespService respService;
    
    @Test
    @DisplayName("책무 생성 API 호출 시 정상 응답해야 한다")
    void createResp_ShouldReturnCreated() throws Exception {
        // Given
        CreateRespDto dto = CreateRespDto.builder()
            .title("통합 테스트 책무")
            .priority(3)
            .complexity(2)
            .category(RespCategory.OPERATIONAL)
            .build();
            
        RespDto createdDto = RespDto.builder()
            .id(1L)
            .title(dto.getTitle())
            .priority(dto.getPriority())
            .complexity(dto.getComplexity())
            .category(dto.getCategory())
            .respScore(6)
            .status(RespStatus.DRAFT)
            .build();
        
        when(respService.create(any(CreateRespDto.class))).thenReturn(createdDto);
        
        // When & Then
        mockMvc.perform(post("/api/v1/resps")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
            
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("통합 테스트 책무"))
            .andExpect(jsonPath("$.priority").value(3))
            .andExpect(jsonPath("$.complexity").value(2))
            .andExpect(jsonPath("$.resp_score").value(6))
            .andExpect(jsonPath("$.status").value("DRAFT"));
        
        verify(respService).create(any(CreateRespDto.class));
    }
}
```

---

## ⚡ 성능 최적화 가이드

### JPA 성능 최적화
```java
// N+1 문제 해결
public interface RespRepository extends JpaRepository<Resp, Long> {
    
    @EntityGraph(attributePaths = {"assignedUser", "actions"})
    Page<Resp> findWithDetails(Pageable pageable);
    
    @Query("SELECT r FROM Resp r " +
           "LEFT JOIN FETCH r.assignedUser " +
           "LEFT JOIN FETCH r.actions " +
           "WHERE r.status = :status")
    List<Resp> findByStatusWithDetails(@Param("status") RespStatus status);
}

// 배치 처리
@Service
public class RespBatchService {
    
    @Transactional
    @BatchSize(size = 100)  // Hibernate 배치 크기 설정
    public void bulkUpdateStatus(List<Long> respIds, RespStatus status) {
        List<Resp> resps = respRepository.findAllById(respIds);
        
        for (Resp resp : resps) {
            resp.updateStatus(status);
        }
        
        // 배치로 저장
        respRepository.saveAll(resps);
    }
}
```

### 캐싱 전략
```java
@Service
@CacheConfig(cacheNames = "resps")
public class RespService {
    
    @Cacheable(key = "#id")
    public RespDto findById(Long id) {
        // DB 조회
    }
    
    @Cacheable(key = "#searchDto.hashCode() + '_' + #pageable.pageNumber")
    public Page<RespDto> findAll(RespSearchDto searchDto, Pageable pageable) {
        // DB 조회
    }
    
    @CacheEvict(key = "#result.id")
    public RespDto update(Long id, UpdateRespDto dto) {
        // 업데이트 로직
    }
    
    @CacheEvict(allEntries = true)
    public void clearAllCache() {
        // 전체 캐시 삭제
    }
}
```

### 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_resp_status_created ON resps(status, created_at);
CREATE INDEX idx_resp_category_priority ON resps(category, priority);
CREATE INDEX idx_resp_assigned_user ON resps(assigned_user_id);

-- 복합 인덱스
CREATE INDEX idx_resp_search ON resps(status, category, priority, created_at);

-- 부분 인덱스
CREATE INDEX idx_resp_active ON resps(created_at) WHERE status = 'ACTIVE';
```

---

## 📋 코딩 컨벤션

### 네이밍 규칙
```java
// 클래스명: PascalCase
public class RespDomainService {}

// 메서드명: camelCase, 동사로 시작
public RespDto createResp() {}
public boolean canAssignResp() {}
public void validateRespData() {}

// 변수명: camelCase
private RespRepository respRepository;
private final String errorMessage = "Invalid data";

// 상수명: UPPER_SNAKE_CASE
private static final int MAX_RETRY_COUNT = 3;
private static final String DEFAULT_STATUS = "DRAFT";
```

### 어노테이션 사용 패턴
```java
// Entity
@Entity
@Table(name = "resps")
@Getter @Builder @NoArgsConstructor @AllArgsConstructor

// Service
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j

// Controller
@RestController
@RequestMapping("/api/v1/resps")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "Resp Management")
```

### 예외 처리 패턴
```java
// 비즈니스 예외
public class RespNotFoundException extends BusinessException {
    public RespNotFoundException(Long id) {
        super(ErrorCode.RESP_NOT_FOUND, "Resp not found: " + id);
    }
}

// Global Exception Handler
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        log.warn("Business exception: {}", e.getMessage());
        return ResponseEntity
            .status(e.getErrorCode().getStatus())
            .body(ErrorResponse.of(e.getErrorCode(), e.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        log.warn("Validation exception: {}", e.getMessage());
        return ResponseEntity
            .badRequest()
            .body(ErrorResponse.of(ErrorCode.VALIDATION_ERROR, extractErrorMessages(e)));
    }
}
```

---

## 🔧 개발 도구 및 명령어

### 필수 개발 명령어
```bash
# 개발 환경 실행
./gradlew bootRun --args='--spring.profiles.active=local'

# 테스트 실행
./gradlew test                    # 전체 테스트
./gradlew test --tests="*Service*" # Service 테스트만
./gradlew test --continuous       # 지속적 테스트

# 코드 품질 검사
./gradlew checkstyleMain checkstyleTest
./gradlew build                   # 전체 빌드 및 검사

# 데이터베이스 마이그레이션
./gradlew flywayMigrate          # 마이그레이션 실행
./gradlew flywayInfo             # 마이그레이션 정보
./gradlew flywayClean            # 스키마 정리 (개발환경만)
```

### 환경 설정
```yaml
# application-local.yml (개발)
spring:
  profiles:
    active: local
  datasource:
    url: jdbc:postgresql://172.21.174.2:5432/postgres
    username: postgres
    password: 1q2w3e4r!
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

# application-test.yml (테스트)  
spring:
  datasource:
    url: jdbc:h2:mem:testdb
  jpa:
    hibernate:
      ddl-auto: create-drop
```

---

**📅 작성일**: 2025-09-08  
**✍️ 작성자**: Claude AI (Claude Code 참조용 통합 문서)  
**🔄 버전**: 1.0.0