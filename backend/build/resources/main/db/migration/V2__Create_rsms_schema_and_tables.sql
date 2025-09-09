-- RSMS Schema and Core Tables Migration
-- V2: RSMS 스키마 생성 및 핵심 테이블 생성

-- RSMS 스키마 생성
CREATE SCHEMA IF NOT EXISTS rsms;

-- 1. 역할(Roles) 테이블
CREATE TABLE IF NOT EXISTS rsms.roles (
  id SERIAL PRIMARY KEY,
  role_id varchar(100) NOT NULL UNIQUE,        -- 'CEO' | 'EXECUTIVE' | 'MANAGER' | 'EMPLOYEE' | 'ADMIN' 등
  role_name varchar(100) NOT NULL,              -- '대표이사' | '임원' | '부서장' | '부서원' | '관리자' 등
  description varchar(500) NULL,
  active BOOLEAN DEFAULT true,
  created_id varchar(100) DEFAULT 'SYSTEM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id varchar(100) DEFAULT 'SYSTEM',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_roles_role_id ON rsms.roles(role_id);

-- 2. 권한(Permissions) 테이블
CREATE TABLE IF NOT EXISTS rsms.permissions (
  id SERIAL PRIMARY KEY,
  permission_id VARCHAR(100) NOT NULL UNIQUE,          -- 'READ_USER' | 'WRITE_USER' | 'DELETE_USER' 등
  permission_name VARCHAR(100) NOT NULL,                -- '사용자 조회' | '사용자 생성' | '사용자 삭제' 등
  category VARCHAR(50) NOT NULL,                        -- 'USER' | 'RISK' | 'REPORT' | 'ADMIN' | 'SYSTEM'
  description VARCHAR(500) NULL,
  display_order INT DEFAULT 0,                          -- 화면 표시 순서
  active BOOLEAN DEFAULT true,
  created_id VARCHAR(100) DEFAULT 'SYSTEM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id VARCHAR(100) DEFAULT 'SYSTEM',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_permissions_permission_id ON rsms.permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON rsms.permissions(category);

-- 3. 역할-권한 매핑 테이블
CREATE TABLE IF NOT EXISTS rsms.role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(100) DEFAULT 'SYSTEM',
  active BOOLEAN DEFAULT true,
  created_id VARCHAR(100) DEFAULT 'SYSTEM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id VARCHAR(100) DEFAULT 'SYSTEM',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES rsms.roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES rsms.permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON rsms.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON rsms.role_permissions(permission_id);

-- 4. 직원(Employee) 테이블
CREATE TABLE IF NOT EXISTS rsms.employee (
	emp_no varchar(20) PRIMARY KEY,
	emp_name varchar(50) NOT NULL,
	dept_cd varchar(20) NULL,
	position_cd varchar(20) NULL,
  job_rank_cd varchar(20) NULL,
	email varchar(100) NULL,
	phone_no varchar(20) NULL,
  address varchar(200) NULL,
	active BOOLEAN DEFAULT true,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) DEFAULT 'SYSTEM' NULL,
	updated_id varchar(100) DEFAULT 'SYSTEM' NULL
);

-- 5. 사용자(Users) 테이블
CREATE TABLE IF NOT EXISTS rsms.users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  emp_no VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'EMPLOYEE',
  active BOOLEAN DEFAULT true,
  created_id varchar(100) DEFAULT 'SYSTEM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id varchar(100) DEFAULT 'SYSTEM',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_users_emp_no FOREIGN KEY (emp_no) REFERENCES rsms.employee(emp_no)
);

CREATE INDEX IF NOT EXISTS idx_users_user_id ON rsms.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_emp_no ON rsms.users(emp_no);

-- 6. 사용자-역할 매핑 테이블
CREATE TABLE IF NOT EXISTS rsms.user_roles (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(100) DEFAULT 'SYSTEM',
  active BOOLEAN DEFAULT true,
  created_id VARCHAR(100) DEFAULT 'SYSTEM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id VARCHAR(100) DEFAULT 'SYSTEM',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES rsms.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES rsms.roles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role_id)
);

-- 7. 사용자 세션 테이블
CREATE TABLE IF NOT EXISTS rsms.user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_at TIMESTAMP NULL,
  active BOOLEAN DEFAULT true,
  
  CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES rsms.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON rsms.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON rsms.user_sessions(session_id);

-- 8. 접근 로그 테이블
CREATE TABLE IF NOT EXISTS rsms.access_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(255) NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url TEXT,
  request_headers TEXT,
  request_body TEXT,
  response_status INT,
  response_time_ms INT,
  access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_access_logs_user FOREIGN KEY (user_id) REFERENCES rsms.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON rsms.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_access_time ON rsms.access_logs(access_time DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON rsms.access_logs(ip_address);

-- 9. 책임(Responsibilities) 테이블
CREATE TABLE IF NOT EXISTS rsms.responsibilities (
  id SERIAL PRIMARY KEY,
  content text NULL,
  ledger_order_id int8 NOT NULL,                      -- 원장차수
  date_expired date DEFAULT '9999-12-31'::date NULL,  -- 만료일
  active BOOLEAN DEFAULT true,
  created_id varchar(100) DEFAULT 'SYSTEM',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id varchar(100) DEFAULT 'SYSTEM',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_responsibilities_id ON rsms.responsibilities(id);
CREATE INDEX IF NOT EXISTS idx_responsibilities_ledger_order_id ON rsms.responsibilities(ledger_order_id);

-- 기본 데이터 삽입

-- 기본 권한 데이터 삽입
INSERT INTO rsms.permissions (permission_id, permission_name, category, description, display_order) VALUES
-- 사용자 관리 권한
('READ_USER', '사용자 조회', 'USER', '사용자 정보를 조회할 수 있는 권한', 100),
('WRITE_USER', '사용자 생성/수정', 'USER', '사용자를 생성하거나 수정할 수 있는 권한', 101),
('DELETE_USER', '사용자 삭제', 'USER', '사용자를 삭제할 수 있는 권한', 102),

-- 리스크 관리 권한
('READ_RISK', '리스크 조회', 'RISK', '리스크 정보를 조회할 수 있는 권한', 200),
('WRITE_RISK', '리스크 생성/수정', 'RISK', '리스크를 생성하거나 수정할 수 있는 권한', 201),
('DELETE_RISK', '리스크 삭제', 'RISK', '리스크를 삭제할 수 있는 권한', 202),
('APPROVE_RISK', '리스크 승인', 'RISK', '리스크를 승인할 수 있는 권한', 203),

-- 보고서 관리 권한
('READ_REPORT', '보고서 조회', 'REPORT', '보고서를 조회할 수 있는 권한', 300),
('WRITE_REPORT', '보고서 생성/수정', 'REPORT', '보고서를 생성하거나 수정할 수 있는 권한', 301),
('DELETE_REPORT', '보고서 삭제', 'REPORT', '보고서를 삭제할 수 있는 권한', 302),
('EXPORT_REPORT', '보고서 내보내기', 'REPORT', '보고서를 엑셀/PDF로 내보낼 수 있는 권한', 303),

-- 시스템 관리 권한
('ADMIN_ACCESS', '관리자 접근', 'ADMIN', '관리자 메뉴에 접근할 수 있는 권한', 400),
('SYSTEM_CONFIG', '시스템 설정', 'SYSTEM', '시스템 설정을 변경할 수 있는 권한', 401),
('VIEW_AUDIT_LOG', '감사 로그 조회', 'SYSTEM', '시스템 감사 로그를 조회할 수 있는 권한', 402),
('MANAGE_ROLES', '역할 관리', 'ADMIN', '역할과 권한을 관리할 수 있는 권한', 403)
ON CONFLICT (permission_id) DO NOTHING;

-- 기본 역할 데이터 삽입
INSERT INTO rsms.roles (role_id, role_name, description) VALUES
('ADMIN', '시스템 관리자', '모든 권한을 가진 시스템 관리자'),
('CEO', '대표이사', '최고 경영자'),
('EXECUTIVE', '임원', '회사 임원'),
('MANAGER', '부서장', '부서 관리자'),
('EMPLOYEE', '직원', '일반 직원')
ON CONFLICT (role_id) DO NOTHING;

-- 샘플 직원 데이터 (테스트용)
INSERT INTO rsms.employee (emp_no, emp_name, dept_cd, position_cd, job_rank_cd, email) VALUES
('EMP001', '관리자', 'IT', 'ADMIN', 'EXECUTIVE', 'admin@rsms.com'),
('EMP002', '홍길동', 'HR', 'MANAGER', 'MANAGER', 'hong@rsms.com')
ON CONFLICT (emp_no) DO NOTHING;

-- 샘플 사용자 데이터 (테스트용)
INSERT INTO rsms.users (user_id, email, emp_no, password, role) VALUES
('admin', 'admin@rsms.com', 'EMP001', '$2a$10$6KHFTUeS.dSgOvKfk1bKUuL8F2kx7JqY7KE8/qVhQZN.Hst8NqK/K', 'ADMIN'),
('hong', 'hong@rsms.com', 'EMP002', '$2a$10$6KHFTUeS.dSgOvKfk1bKUuL8F2kx7JqY7KE8/qVhQZN.Hst8NqK/K', 'MANAGER')
ON CONFLICT (user_id) DO NOTHING;

-- 테이블 코멘트 추가
COMMENT ON SCHEMA rsms IS 'RSMS (Risk/Responsibility Management System) 스키마';
COMMENT ON TABLE rsms.permissions IS '권한 관리 테이블';
COMMENT ON TABLE rsms.roles IS '역할 관리 테이블';
COMMENT ON TABLE rsms.users IS '사용자 관리 테이블';
COMMENT ON TABLE rsms.employee IS '직원 정보 테이블';
COMMENT ON TABLE rsms.responsibilities IS '책임 관리 테이블';