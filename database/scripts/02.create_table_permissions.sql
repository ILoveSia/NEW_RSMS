-- DROP TABLE rsms.permissions CASCADE;

CREATE TABLE rsms.permissions (
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

CREATE INDEX idx_permissions_permission_id ON rsms.permissions(permission_id);
CREATE INDEX idx_permissions_category ON rsms.permissions(category);

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
('MANAGE_ROLES', '역할 관리', 'ADMIN', '역할과 권한을 관리할 수 있는 권한', 403);

COMMENT ON TABLE rsms.permissions IS '권한 관리 테이블';
COMMENT ON COLUMN rsms.permissions.permission_id IS '권한 ID (고유 코드)';
COMMENT ON COLUMN rsms.permissions.permission_name IS '권한 표시명';
COMMENT ON COLUMN rsms.permissions.category IS '권한 카테고리';
COMMENT ON COLUMN rsms.permissions.description IS '권한 설명';
COMMENT ON COLUMN rsms.permissions.display_order IS '화면 표시 순서';