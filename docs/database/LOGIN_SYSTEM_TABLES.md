# RSMS 로그인 및 권한 시스템 데이터베이스 설계

**작성일**: 2025-09-24
**작성자**: Claude AI
**버전**: 2.0.0
**기반**: 실제 UI (MenuMgmt, RoleMgmt, UserMgmt) 분석 결과

---

## 📋 목차

1. [개요](#개요)
2. [전체 ERD 구조](#전체-erd-구조)
3. [테이블 상세 설계](#테이블-상세-설계)
4. [인덱스 전략](#인덱스-전략)
5. [보안 고려사항](#보안-고려사항)
6. [마이그레이션 계획](#마이그레이션-계획)

---

## 개요

### 설계 목표
- ✅ 현재 UI (MenuMgmt, RoleMgmt, UserMgmt)와 100% 호환
- ✅ Spring Security 6 + Spring Session JDBC 통합
- ✅ 메뉴 기반 계층적 권한 관리
- ✅ 역할(Role) - 상세역할(Permission) 2단계 구조
- ✅ 확장 가능한 권한 체계 (CRUD + 확장 권한)

### 핵심 특징
- **세션 관리**: Spring Session JDBC (PostgreSQL)
- **권한 체계**: 메뉴별 세밀한 CRUD 권한 제어
- **역할 구조**: 역할(Role) → 상세역할(Permission) 계층
- **감사 추적**: 로그인 이력, 접근 로그, 변경 이력 완벽 추적

---

## 전체 ERD 구조

```
┌─────────────────┐
│    employees    │  ← 직원 마스터 (기존 테이블)
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐       ┌──────────────────┐
│      users      │──────▶│  login_history   │  로그인 이력
└────────┬────────┘  1:N  └──────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌──────────────────┐
│   user_roles    │──────▶│      roles       │  역할 (Role)
└─────────────────┘  N:1  └────────┬─────────┘
                                   │
                                   │ 1:N
                                   ▼
                          ┌──────────────────┐
                          │  role_permissions│  역할-권한 매핑
                          └────────┬─────────┘
                                   │ N:1
                                   ▼
                          ┌──────────────────┐
                          │   permissions    │  상세역할 (Permission)
                          └────────┬─────────┘
                                   │ N:1
                                   ▼
                          ┌──────────────────┐
                          │   menu_items     │  메뉴 (계층 구조)
                          └────────┬─────────┘
                                   │ 1:N
                                   ▼
                          ┌──────────────────┐
                          │ menu_permissions │  메뉴-권한 매핑
                          └──────────────────┘

┌──────────────────┐
│ spring_session   │  ← Spring Session JDBC
└──────────────────┘

┌──────────────────┐
│   access_logs    │  ← 접근 로그
└──────────────────┘
```

---

## 테이블 상세 설계

### 1. users (사용자 테이블)

**설명**: 시스템 사용자 계정 정보 (employees와 1:1 관계)

```sql
CREATE TABLE users (
    -- PK
    user_id BIGSERIAL PRIMARY KEY,

    -- 기본 정보
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '사용자 아이디 (로그인 ID)',
    password_hash VARCHAR(255) NOT NULL COMMENT 'BCrypt 해시 (강도 12)',
    emp_no VARCHAR(20) NOT NULL UNIQUE COMMENT '직원번호 (employees FK)',

    -- 계정 보안
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '계정상태: ACTIVE, LOCKED, SUSPENDED, RESIGNED',
    password_change_required BOOLEAN NOT NULL DEFAULT TRUE COMMENT '비밀번호 변경 필요 여부',
    password_last_changed_at TIMESTAMP COMMENT '비밀번호 마지막 변경일시',
    last_login_at TIMESTAMP COMMENT '마지막 로그인 일시',
    failed_login_count INTEGER NOT NULL DEFAULT 0 COMMENT '연속 로그인 실패 횟수',
    locked_until TIMESTAMP COMMENT '계정 잠금 해제 일시',

    -- 권한 레벨
    is_admin BOOLEAN NOT NULL DEFAULT FALSE COMMENT '관리자 여부',
    is_executive BOOLEAN NOT NULL DEFAULT FALSE COMMENT '임원 여부',
    auth_level INTEGER NOT NULL DEFAULT 1 COMMENT '권한 레벨 (1~10)',

    -- 로그인 차단 및 활성화
    is_login_blocked BOOLEAN NOT NULL DEFAULT FALSE COMMENT '로그인 차단 여부',

    -- 시스템 정보
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul' COMMENT '타임존',
    language VARCHAR(10) NOT NULL DEFAULT 'ko' COMMENT '언어 (ko, en)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_users_emp_no FOREIGN KEY (emp_no)
        REFERENCES employees(emp_no) ON DELETE CASCADE,
    CONSTRAINT chk_account_status CHECK (account_status IN ('ACTIVE', 'LOCKED', 'SUSPENDED', 'RESIGNED')),
    CONSTRAINT chk_auth_level CHECK (auth_level BETWEEN 1 AND 10),
    CONSTRAINT chk_failed_login_count CHECK (failed_login_count >= 0)
);

-- 인덱스
CREATE INDEX idx_users_username ON users(username) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_emp_no ON users(emp_no) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_account_status ON users(account_status) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_last_login_at ON users(last_login_at DESC);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_deleted = FALSE;

-- 주석
COMMENT ON TABLE users IS '사용자 계정 정보 (Spring Security + employees 연동)';
COMMENT ON COLUMN users.password_hash IS 'BCrypt 해시 (강도 12) - Spring Security 표준';
COMMENT ON COLUMN users.account_status IS 'ACTIVE: 재직, LOCKED: 잠김, SUSPENDED: 정지, RESIGNED: 퇴직';
COMMENT ON COLUMN users.is_login_blocked IS 'UserMgmt UI의 "로그인차단" 체크박스';
```

---

### 2. roles (역할 테이블)

**설명**: 사용자에게 할당되는 역할 (RoleMgmt UI 왼쪽 그리드)

```sql
CREATE TABLE roles (
    -- PK
    role_id BIGSERIAL PRIMARY KEY,

    -- 기본 정보
    role_code VARCHAR(50) NOT NULL UNIQUE COMMENT '역할 코드 (예: Administrator, Manager, User)',
    role_name VARCHAR(100) NOT NULL COMMENT '역할명 (예: 최고관리자, 관리자, 사용자)',
    description TEXT COMMENT '역할 설명',

    -- 역할 분류
    role_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM' COMMENT '역할 타입: SYSTEM, CUSTOM',
    role_category VARCHAR(20) COMMENT '역할 카테고리: 최고관리자, 관리자, 사용자',

    -- 계층 구조
    parent_role_id BIGINT COMMENT '상위 역할 ID (계층 구조)',
    sort_order INTEGER NOT NULL DEFAULT 0 COMMENT '정렬 순서',

    -- 상태 관리
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '상태: ACTIVE, INACTIVE, ARCHIVED',
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE COMMENT '시스템 역할 여부 (삭제 불가)',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_roles_parent FOREIGN KEY (parent_role_id)
        REFERENCES roles(role_id) ON DELETE SET NULL,
    CONSTRAINT chk_role_type CHECK (role_type IN ('SYSTEM', 'CUSTOM')),
    CONSTRAINT chk_role_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    CONSTRAINT chk_role_category CHECK (role_category IN ('최고관리자', '관리자', '사용자'))
);

-- 인덱스
CREATE INDEX idx_roles_role_code ON roles(role_code) WHERE is_deleted = FALSE;
CREATE INDEX idx_roles_role_name ON roles(role_name) WHERE is_deleted = FALSE;
CREATE INDEX idx_roles_parent_role_id ON roles(parent_role_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_roles_status ON roles(status) WHERE is_deleted = FALSE;
CREATE INDEX idx_roles_is_system_role ON roles(is_system_role) WHERE is_deleted = FALSE;

-- 주석
COMMENT ON TABLE roles IS '역할 정의 (RoleMgmt UI 왼쪽 그리드)';
COMMENT ON COLUMN roles.role_code IS '역할 코드 (예: Administrator, Manager, User, Any)';
COMMENT ON COLUMN roles.role_type IS 'SYSTEM: 시스템 기본 역할, CUSTOM: 사용자 정의 역할';
COMMENT ON COLUMN roles.is_system_role IS 'TRUE면 삭제 불가능한 시스템 역할';
```

---

### 3. permissions (상세역할/권한 테이블)

**설명**: 메뉴별 세밀한 권한 정의 (RoleMgmt UI 오른쪽 그리드 - 상세역할)

```sql
CREATE TABLE permissions (
    -- PK
    permission_id BIGSERIAL PRIMARY KEY,

    -- 기본 정보
    permission_code VARCHAR(50) NOT NULL UNIQUE COMMENT '권한 코드 (예: A01, A99, U01)',
    permission_name VARCHAR(100) NOT NULL COMMENT '권한명 (예: 운영관리자, 시스템관리자)',
    description TEXT COMMENT '권한 설명',

    -- 메뉴 연결
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID (menu_items FK)',

    -- 권한 유형 (RoleMgmt UI 오른쪽 그리드 컬럼)
    business_permission BOOLEAN NOT NULL DEFAULT FALSE COMMENT '역활유형 (업무/일반)',
    main_business_permission BOOLEAN NOT NULL DEFAULT FALSE COMMENT '본점기본',
    execution_permission BOOLEAN NOT NULL DEFAULT FALSE COMMENT '영업점기본',

    -- CRUD 권한
    can_view BOOLEAN NOT NULL DEFAULT FALSE COMMENT '조회 권한',
    can_create BOOLEAN NOT NULL DEFAULT FALSE COMMENT '생성 권한',
    can_update BOOLEAN NOT NULL DEFAULT FALSE COMMENT '수정 권한',
    can_delete BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 권한',
    can_select BOOLEAN NOT NULL DEFAULT FALSE COMMENT '선택 권한',

    -- 확장 권한
    extended_permission_type VARCHAR(50) COMMENT '확장 권한 유형 (전체권한, 제한권한, 조회권한)',
    extended_permission_name VARCHAR(100) COMMENT '확장 권한명',

    -- 정렬 및 상태
    sort_order INTEGER NOT NULL DEFAULT 0 COMMENT '정렬 순서',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '사용여부',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_permissions_menu_id FOREIGN KEY (menu_id)
        REFERENCES menu_items(menu_id) ON DELETE CASCADE,
    CONSTRAINT chk_extended_permission_type CHECK (
        extended_permission_type IN ('전체권한', '제한권한', '조회권한')
    )
);

-- 인덱스
CREATE INDEX idx_permissions_code ON permissions(permission_code) WHERE is_deleted = FALSE;
CREATE INDEX idx_permissions_menu_id ON permissions(menu_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_permissions_is_active ON permissions(is_active) WHERE is_deleted = FALSE;
CREATE INDEX idx_permissions_sort_order ON permissions(sort_order);

-- 주석
COMMENT ON TABLE permissions IS '상세역할/권한 정의 (RoleMgmt UI 오른쪽 그리드)';
COMMENT ON COLUMN permissions.business_permission IS 'RoleMgmt UI "역활유형" 컬럼 (TRUE: 업무, FALSE: 일반)';
COMMENT ON COLUMN permissions.main_business_permission IS 'RoleMgmt UI "본점기본" 체크박스';
COMMENT ON COLUMN permissions.execution_permission IS 'RoleMgmt UI "영업점기본" 체크박스';
COMMENT ON COLUMN permissions.is_active IS 'RoleMgmt UI "사용여부" 체크박스';
```

---

### 4. role_permissions (역할-권한 매핑 테이블)

**설명**: 역할에 상세역할(권한)을 할당하는 매핑 테이블

```sql
CREATE TABLE role_permissions (
    -- PK
    role_permission_id BIGSERIAL PRIMARY KEY,

    -- FK
    role_id BIGINT NOT NULL COMMENT '역할 ID (roles FK)',
    permission_id BIGINT NOT NULL COMMENT '권한 ID (permissions FK)',

    -- 할당 정보
    granted BOOLEAN NOT NULL DEFAULT TRUE COMMENT '권한 부여 여부',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '할당 일시',
    assigned_by VARCHAR(50) COMMENT '할당자',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id)
        REFERENCES roles(role_id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id)
        REFERENCES permissions(permission_id) ON DELETE CASCADE,
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
);

-- 인덱스
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_role_permissions_granted ON role_permissions(granted) WHERE is_deleted = FALSE;

-- 주석
COMMENT ON TABLE role_permissions IS '역할-권한 매핑 (역할에 상세역할 할당)';
COMMENT ON COLUMN role_permissions.granted IS 'TRUE: 권한 부여, FALSE: 권한 제거';
```

---

### 5. user_roles (사용자-역할 매핑 테이블)

**설명**: 사용자에게 역할을 할당하는 매핑 테이블

```sql
CREATE TABLE user_roles (
    -- PK
    user_role_id BIGSERIAL PRIMARY KEY,

    -- FK
    user_id BIGINT NOT NULL COMMENT '사용자 ID (users FK)',
    role_id BIGINT NOT NULL COMMENT '역할 ID (roles FK)',

    -- 할당 정보
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '할당 일시',
    assigned_by VARCHAR(50) COMMENT '할당자',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES roles(role_id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- 인덱스
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active) WHERE is_deleted = FALSE;

-- 주석
COMMENT ON TABLE user_roles IS '사용자-역할 매핑 (UserMgmt UI "역할(MenuID)" 컬럼)';
COMMENT ON COLUMN user_roles.is_active IS '역할 활성화 여부 (비활성화 시 권한 무효)';
```

---

### 6. menu_items (메뉴 테이블)

**설명**: 시스템 메뉴 계층 구조 (MenuMgmt UI 트리)

```sql
CREATE TABLE menu_items (
    -- PK
    menu_id BIGSERIAL PRIMARY KEY,

    -- 메뉴 기본 정보
    menu_code VARCHAR(20) NOT NULL UNIQUE COMMENT '메뉴 코드 (예: 01, 0101, 0802)',
    menu_name VARCHAR(100) NOT NULL COMMENT '메뉴명',
    description TEXT COMMENT '메뉴 설명',

    -- URL 및 라우팅
    url VARCHAR(255) COMMENT '메뉴 URL (예: /app/dashboard)',
    parameters TEXT COMMENT 'URL 파라미터',

    -- 계층 구조
    parent_id BIGINT COMMENT '상위 메뉴 ID (self-reference)',
    depth INTEGER NOT NULL DEFAULT 1 COMMENT '메뉴 깊이 (1, 2, 3)',
    sort_order INTEGER NOT NULL DEFAULT 0 COMMENT '정렬 순서',

    -- 메뉴 속성
    system_code VARCHAR(50) NOT NULL COMMENT '시스템 코드 (예: DASHBOARD_MAIN)',
    menu_type VARCHAR(20) NOT NULL DEFAULT 'page' COMMENT '메뉴 타입: folder, page, link',
    icon VARCHAR(50) COMMENT '아이콘 이름 (Material-UI)',

    -- 메뉴 설정
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    is_test_page BOOLEAN NOT NULL DEFAULT FALSE COMMENT '테스트 페이지 여부',
    requires_auth BOOLEAN NOT NULL DEFAULT TRUE COMMENT '인증 필요 여부',
    open_in_new_window BOOLEAN NOT NULL DEFAULT FALSE COMMENT '새 창 열기 여부',
    dashboard_layout BOOLEAN NOT NULL DEFAULT FALSE COMMENT '대시보드 레이아웃 사용',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_menu_items_parent FOREIGN KEY (parent_id)
        REFERENCES menu_items(menu_id) ON DELETE CASCADE,
    CONSTRAINT chk_menu_type CHECK (menu_type IN ('folder', 'page', 'link')),
    CONSTRAINT chk_menu_depth CHECK (depth BETWEEN 1 AND 3)
);

-- 인덱스
CREATE INDEX idx_menu_items_menu_code ON menu_items(menu_code) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_items_system_code ON menu_items(system_code) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_items_depth ON menu_items(depth) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_items_is_active ON menu_items(is_active) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_items_requires_auth ON menu_items(requires_auth) WHERE is_deleted = FALSE;

-- 주석
COMMENT ON TABLE menu_items IS '시스템 메뉴 계층 구조 (MenuMgmt UI 트리)';
COMMENT ON COLUMN menu_items.menu_code IS '메뉴 코드: 01(1depth), 0101(2depth), 0802(3depth)';
COMMENT ON COLUMN menu_items.menu_type IS 'folder: 폴더, page: 페이지, link: 외부 링크';
COMMENT ON COLUMN menu_items.requires_auth IS 'TRUE면 로그인 필요, FALSE면 익명 접근 가능';
```

---

### 7. menu_permissions (메뉴-권한 매핑 테이블)

**설명**: MenuMgmt UI 오른쪽 그리드의 권한 데이터

```sql
CREATE TABLE menu_permissions (
    -- PK
    menu_permission_id BIGSERIAL PRIMARY KEY,

    -- FK
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID (menu_items FK)',
    role_id BIGINT NOT NULL COMMENT '역할 ID (roles FK)',

    -- CRUD 권한 (MenuMgmt UI 오른쪽 그리드 컬럼)
    can_view BOOLEAN NOT NULL DEFAULT FALSE COMMENT '조회 권한',
    can_create BOOLEAN NOT NULL DEFAULT FALSE COMMENT '생성 권한',
    can_update BOOLEAN NOT NULL DEFAULT FALSE COMMENT '수정 권한',
    can_delete BOOLEAN NOT NULL DEFAULT FALSE COMMENT '삭제 권한',
    can_select BOOLEAN NOT NULL DEFAULT FALSE COMMENT '선택 권한',

    -- 권한 부여 정보
    granted BOOLEAN NOT NULL DEFAULT TRUE COMMENT '권한 부여 여부',

    -- 확장 권한
    extended_permission_type VARCHAR(50) COMMENT '확장 권한 유형',
    extended_permission_name VARCHAR(100) COMMENT '확장 권한명',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- 제약조건
    CONSTRAINT fk_menu_permissions_menu FOREIGN KEY (menu_id)
        REFERENCES menu_items(menu_id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_permissions_role FOREIGN KEY (role_id)
        REFERENCES roles(role_id) ON DELETE CASCADE,
    CONSTRAINT uk_menu_role_permission UNIQUE (menu_id, role_id)
);

-- 인덱스
CREATE INDEX idx_menu_permissions_menu_id ON menu_permissions(menu_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_permissions_role_id ON menu_permissions(role_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_menu_permissions_granted ON menu_permissions(granted) WHERE is_deleted = FALSE;

-- 주석
COMMENT ON TABLE menu_permissions IS '메뉴-역할 권한 매핑 (MenuMgmt UI 오른쪽 그리드)';
COMMENT ON COLUMN menu_permissions.can_view IS 'MenuMgmt UI "조회" 체크박스';
COMMENT ON COLUMN menu_permissions.can_create IS 'MenuMgmt UI "생성" 체크박스';
COMMENT ON COLUMN menu_permissions.can_update IS 'MenuMgmt UI "수정" 체크박스';
COMMENT ON COLUMN menu_permissions.can_delete IS 'MenuMgmt UI "삭제" 체크박스';
COMMENT ON COLUMN menu_permissions.can_select IS 'MenuMgmt UI "선택" 체크박스';
```

---

### 8. login_history (로그인 이력 테이블)

**설명**: 사용자 로그인 시도 및 성공/실패 이력

```sql
CREATE TABLE login_history (
    -- PK
    login_history_id BIGSERIAL PRIMARY KEY,

    -- FK
    user_id BIGINT COMMENT '사용자 ID (성공 시에만)',
    username VARCHAR(50) NOT NULL COMMENT '로그인 시도 아이디',

    -- 로그인 정보
    login_type VARCHAR(20) NOT NULL DEFAULT 'WEB' COMMENT '로그인 타입: WEB, API, MOBILE',
    login_status VARCHAR(20) NOT NULL COMMENT '상태: SUCCESS, FAILED, LOCKED, BLOCKED',
    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '로그인 시도 시각',
    logout_time TIMESTAMP COMMENT '로그아웃 시각',

    -- 접속 정보
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP 주소 (IPv6 지원)',
    user_agent TEXT COMMENT 'User-Agent 정보',
    device_type VARCHAR(20) COMMENT '디바이스 타입: DESKTOP, MOBILE, TABLET',
    browser VARCHAR(50) COMMENT '브라우저',
    os VARCHAR(50) COMMENT '운영체제',

    -- 실패 정보
    failure_reason VARCHAR(255) COMMENT '실패 사유',

    -- 세션 정보
    session_id VARCHAR(255) COMMENT 'Spring Session ID',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT fk_login_history_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_login_type CHECK (login_type IN ('WEB', 'API', 'MOBILE')),
    CONSTRAINT chk_login_status CHECK (login_status IN ('SUCCESS', 'FAILED', 'LOCKED', 'BLOCKED')),
    CONSTRAINT chk_device_type CHECK (device_type IN ('DESKTOP', 'MOBILE', 'TABLET'))
);

-- 인덱스
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_username ON login_history(username);
CREATE INDEX idx_login_history_login_time ON login_history(login_time DESC);
CREATE INDEX idx_login_history_login_status ON login_history(login_status);
CREATE INDEX idx_login_history_ip_address ON login_history(ip_address);
CREATE INDEX idx_login_history_session_id ON login_history(session_id);

-- 주석
COMMENT ON TABLE login_history IS '로그인 이력 추적 (성공/실패 모두 기록)';
COMMENT ON COLUMN login_history.login_status IS 'SUCCESS: 성공, FAILED: 실패, LOCKED: 계정 잠김, BLOCKED: 차단됨';
```

---

### 9. access_logs (접근 로그 테이블)

**설명**: 사용자의 메뉴/API 접근 로그 (AccessLog UI)

```sql
CREATE TABLE access_logs (
    -- PK
    access_log_id BIGSERIAL PRIMARY KEY,

    -- FK
    user_id BIGINT COMMENT '사용자 ID (users FK)',
    username VARCHAR(50) COMMENT '사용자명',
    menu_id BIGINT COMMENT '메뉴 ID (menu_items FK)',

    -- 접근 정보
    access_type VARCHAR(20) NOT NULL COMMENT '접근 타입: PAGE, API, DOWNLOAD, UPLOAD',
    access_url VARCHAR(500) NOT NULL COMMENT '접근 URL',
    http_method VARCHAR(10) NOT NULL COMMENT 'HTTP 메소드: GET, POST, PUT, DELETE',
    access_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '접근 시각',

    -- 요청 정보
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP 주소',
    user_agent TEXT COMMENT 'User-Agent',
    referer TEXT COMMENT 'Referer URL',

    -- 응답 정보
    response_status INTEGER COMMENT 'HTTP 상태 코드',
    response_time_ms INTEGER COMMENT '응답 시간 (밀리초)',

    -- 추가 정보
    request_parameters TEXT COMMENT '요청 파라미터 (JSON)',
    error_message TEXT COMMENT '에러 메시지',

    -- BaseEntity 필드
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT fk_access_logs_user FOREIGN KEY (user_id)
        REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_access_logs_menu FOREIGN KEY (menu_id)
        REFERENCES menu_items(menu_id) ON DELETE SET NULL,
    CONSTRAINT chk_access_type CHECK (access_type IN ('PAGE', 'API', 'DOWNLOAD', 'UPLOAD')),
    CONSTRAINT chk_http_method CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH'))
);

-- 인덱스
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_username ON access_logs(username);
CREATE INDEX idx_access_logs_menu_id ON access_logs(menu_id);
CREATE INDEX idx_access_logs_access_time ON access_logs(access_time DESC);
CREATE INDEX idx_access_logs_access_type ON access_logs(access_type);
CREATE INDEX idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX idx_access_logs_response_status ON access_logs(response_status);

-- 주석
COMMENT ON TABLE access_logs IS '사용자 접근 로그 (AccessLog UI 데이터)';
COMMENT ON COLUMN access_logs.access_type IS 'PAGE: 페이지 접근, API: API 호출, DOWNLOAD: 다운로드, UPLOAD: 업로드';
```

---

### 10. Spring Session 테이블

**설명**: Spring Session JDBC가 자동 생성하는 테이블

```sql
-- Spring Session JDBC가 자동 생성
-- application.yml 설정:
-- spring.session.store-type: jdbc
-- spring.session.jdbc.initialize-schema: always

CREATE TABLE spring_session (
    primary_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INT NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(100),
    CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

CREATE UNIQUE INDEX spring_session_ix1 ON spring_session (session_id);
CREATE INDEX spring_session_ix2 ON spring_session (expiry_time);
CREATE INDEX spring_session_ix3 ON spring_session (principal_name);

CREATE TABLE spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BYTEA NOT NULL,
    CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),
    CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id)
        REFERENCES spring_session(primary_id) ON DELETE CASCADE
);

-- 주석
COMMENT ON TABLE spring_session IS 'Spring Session JDBC 세션 저장소';
COMMENT ON TABLE spring_session_attributes IS 'Spring Session 속성 저장소';
```

---

## 인덱스 전략

### 1. 복합 인덱스

```sql
-- 사용자 로그인 조회 최적화
CREATE INDEX idx_users_login ON users(username, password_hash, account_status)
    WHERE is_deleted = FALSE AND is_active = TRUE;

-- 사용자-역할 조회 최적화
CREATE INDEX idx_user_roles_lookup ON user_roles(user_id, role_id, is_active)
    WHERE is_deleted = FALSE;

-- 역할-권한 조회 최적화
CREATE INDEX idx_role_permissions_lookup ON role_permissions(role_id, permission_id, granted)
    WHERE is_deleted = FALSE;

-- 메뉴-권한 조회 최적화
CREATE INDEX idx_menu_permissions_lookup ON menu_permissions(menu_id, role_id, granted)
    WHERE is_deleted = FALSE;

-- 메뉴 트리 조회 최적화
CREATE INDEX idx_menu_items_tree ON menu_items(parent_id, sort_order)
    WHERE is_deleted = FALSE AND is_active = TRUE;
```

### 2. 부분 인덱스 (Partial Index)

```sql
-- 활성 사용자만 인덱싱
CREATE INDEX idx_users_active ON users(user_id)
    WHERE is_deleted = FALSE AND is_active = TRUE AND account_status = 'ACTIVE';

-- 시스템 역할만 인덱싱
CREATE INDEX idx_roles_system ON roles(role_id)
    WHERE is_deleted = FALSE AND is_system_role = TRUE;

-- 활성 메뉴만 인덱싱
CREATE INDEX idx_menu_items_active ON menu_items(menu_id)
    WHERE is_deleted = FALSE AND is_active = TRUE;
```

### 3. 전문 검색 인덱스

```sql
-- 메뉴명 전문 검색 (한글 지원)
CREATE INDEX idx_menu_items_fulltext ON menu_items
    USING gin(to_tsvector('korean', menu_name))
    WHERE is_deleted = FALSE;

-- 역할명 전문 검색
CREATE INDEX idx_roles_fulltext ON roles
    USING gin(to_tsvector('korean', role_name))
    WHERE is_deleted = FALSE;
```

---

## 보안 고려사항

### 1. 비밀번호 보안

```java
// Spring Security BCrypt (강도 12)
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

### 2. 계정 잠금 정책

```sql
-- 5회 연속 실패 시 30분 잠금
UPDATE users
SET account_status = 'LOCKED',
    locked_until = CURRENT_TIMESTAMP + INTERVAL '30 minutes',
    failed_login_count = failed_login_count + 1
WHERE username = ? AND failed_login_count >= 4;
```

### 3. 세션 보안

```yaml
# application.yml
spring:
  session:
    store-type: jdbc
    timeout: 30m  # 30분 세션 타임아웃
    jdbc:
      cleanup-cron: "0 */15 * * * *"  # 15분마다 만료 세션 정리
```

### 4. 로그 보안

```sql
-- 민감 정보 마스킹
-- password_hash는 절대 로그에 기록하지 않음
-- IP 주소는 마지막 옥텟 마스킹 (예: 192.168.0.xxx)
```

---

## 마이그레이션 계획

### Phase 1: 기본 테이블 생성

```sql
-- 1. users 테이블
-- 2. roles 테이블
-- 3. menu_items 테이블
-- 4. Spring Session 테이블
```

### Phase 2: 권한 관련 테이블

```sql
-- 5. permissions 테이블
-- 6. role_permissions 테이블
-- 7. user_roles 테이블
-- 8. menu_permissions 테이블
```

### Phase 3: 감사 추적 테이블

```sql
-- 9. login_history 테이블
-- 10. access_logs 테이블
```

### Phase 4: 초기 데이터 삽입

```sql
-- 1. 기본 역할 데이터 (Administrator, Manager, User, Any)
-- 2. 기본 메뉴 데이터 (MOCK_MENU_TREE 기반)
-- 3. 기본 권한 데이터
-- 4. 관리자 계정 생성
```

---

## UI 매핑 정리

### MenuMgmt.tsx UI ↔ DB 테이블

| UI 영역 | 테이블 | 설명 |
|---------|--------|------|
| 왼쪽 트리 | `menu_items` | 메뉴 계층 구조 |
| 오른쪽 그리드 | `menu_permissions` | 메뉴별 역할 권한 |
| 역활 카테고리 | `roles.role_category` | 최고관리자/관리자/사용자 |
| 조회/생성/수정/삭제/선택 | `menu_permissions.can_*` | CRUD 권한 체크박스 |

### RoleMgmt.tsx UI ↔ DB 테이블

| UI 영역 | 테이블 | 설명 |
|---------|--------|------|
| 왼쪽 그리드 | `roles` | 역할 목록 |
| 오른쪽 그리드 | `permissions` | 상세역할 목록 |
| 역활유형 | `permissions.business_permission` | 업무/일반 |
| 본점기본 | `permissions.main_business_permission` | 체크박스 |
| 영업점기본 | `permissions.execution_permission` | 체크박스 |
| 사용여부 | `permissions.is_active` | 체크박스 |
| 상세역활수 | `COUNT(permissions)` | 역할별 권한 개수 |

### UserMgmt.tsx UI ↔ DB 테이블

| UI 영역 | 테이블 | 설명 |
|---------|--------|------|
| 사용자 목록 | `users` | 전체 사용자 |
| 사용자 ID | `users.emp_no` | 직원번호 |
| 부점명 | `users.dept_name` (JOIN) | 부서명 |
| 근무상태 | `users.account_status` | ACTIVE, LOCKED, SUSPENDED, RESIGNED |
| 역할(MenuID) | `user_roles` | 사용자 역할 할당 |
| 상세역할 | `COUNT(role_permissions)` | 역할의 상세역할 개수 |
| 로그인차단 | `users.is_login_blocked` | 체크박스 |
| 활성화 | `users.is_active` | 체크박스 |

---

## 주요 쿼리 예시

### 1. 사용자 로그인 + 권한 조회

```sql
-- Spring Security UserDetailsService 구현
SELECT
    u.user_id,
    u.username,
    u.password_hash,
    u.account_status,
    u.is_active,
    u.is_login_blocked,
    r.role_code,
    r.role_name
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_deleted = FALSE AND ur.is_active = TRUE
LEFT JOIN roles r ON ur.role_id = r.role_id AND r.is_deleted = FALSE AND r.status = 'ACTIVE'
WHERE u.username = ?
  AND u.is_deleted = FALSE
  AND u.is_active = TRUE
  AND u.account_status = 'ACTIVE'
  AND u.is_login_blocked = FALSE;
```

### 2. 사용자 메뉴 권한 조회

```sql
-- 사용자가 접근 가능한 메뉴 목록
SELECT DISTINCT
    m.menu_id,
    m.menu_code,
    m.menu_name,
    m.url,
    m.parent_id,
    m.depth,
    m.sort_order,
    m.icon,
    mp.can_view,
    mp.can_create,
    mp.can_update,
    mp.can_delete
FROM menu_items m
INNER JOIN menu_permissions mp ON m.menu_id = mp.menu_id AND mp.is_deleted = FALSE AND mp.granted = TRUE
INNER JOIN user_roles ur ON mp.role_id = ur.role_id AND ur.is_deleted = FALSE AND ur.is_active = TRUE
WHERE ur.user_id = ?
  AND m.is_deleted = FALSE
  AND m.is_active = TRUE
  AND m.requires_auth = TRUE
  AND mp.can_view = TRUE
ORDER BY m.depth, m.sort_order;
```

### 3. 역할별 상세역할 조회 (RoleMgmt 오른쪽 그리드)

```sql
-- 특정 역할의 상세역할(권한) 목록
SELECT
    p.permission_id,
    p.permission_code,
    p.permission_name,
    p.business_permission,
    p.main_business_permission,
    p.execution_permission,
    p.description,
    p.is_active,
    p.sort_order,
    m.menu_name
FROM permissions p
INNER JOIN role_permissions rp ON p.permission_id = rp.permission_id
    AND rp.is_deleted = FALSE
    AND rp.granted = TRUE
INNER JOIN menu_items m ON p.menu_id = m.menu_id
    AND m.is_deleted = FALSE
WHERE rp.role_id = ?
  AND p.is_deleted = FALSE
ORDER BY p.sort_order;
```

### 4. UserMgmt 목록 조회

```sql
-- 사용자 목록 + 역할 정보
SELECT
    u.user_id,
    u.username,
    u.emp_no AS "employeeNo",
    e.emp_name AS "fullName",
    d.dept_name AS "deptName",
    p.position_name AS "positionName",
    u.account_status AS "accountStatus",
    u.is_login_blocked AS "isLoginBlocked",
    u.is_active AS "isActive",
    u.language,
    u.timezone,
    COUNT(DISTINCT ur.role_id) AS "roleCount",
    COALESCE(SUM(role_detail_counts.detail_count), 0) AS "detailRoleCount"
FROM users u
LEFT JOIN employees e ON u.emp_no = e.emp_no
LEFT JOIN departments d ON e.dept_code = d.dept_code
LEFT JOIN positions p ON e.position_code = p.position_code
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    AND ur.is_deleted = FALSE
    AND ur.is_active = TRUE
LEFT JOIN (
    SELECT ur2.role_id, COUNT(rp.permission_id) AS detail_count
    FROM user_roles ur2
    INNER JOIN role_permissions rp ON ur2.role_id = rp.role_id
        AND rp.is_deleted = FALSE
        AND rp.granted = TRUE
    WHERE ur2.is_deleted = FALSE AND ur2.is_active = TRUE
    GROUP BY ur2.role_id
) AS role_detail_counts ON ur.role_id = role_detail_counts.role_id
WHERE u.is_deleted = FALSE
GROUP BY u.user_id, e.emp_name, d.dept_name, p.position_name
ORDER BY u.created_at DESC;
```

---

## 다음 단계

1. ✅ 테이블 설계 완료 (이 문서)
2. ⏳ Flyway 마이그레이션 스크립트 작성
3. ⏳ JPA Entity 클래스 작성
4. ⏳ Spring Security 설정
5. ⏳ Repository + Service 계층 구현
6. ⏳ REST API 개발
7. ⏳ Frontend 연동

---

**문서 종료**
