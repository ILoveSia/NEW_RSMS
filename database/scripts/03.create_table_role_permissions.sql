
-- DROP TABLE rsms.role_permissions CASCADE;

CREATE TABLE rsms.role_permissions (
  role_id VARCHAR(100) NOT NULL,
  permission_id VARCHAR(100) NOT NULL,
  granted BOOLEAN DEFAULT true,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(100) DEFAULT 'SYSTEM',
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) 
    REFERENCES rsms.roles(role_id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) 
    REFERENCES rsms.permissions(permission_id) ON DELETE CASCADE
);

CREATE INDEX idx_role_permissions_role_id ON rsms.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON rsms.role_permissions(permission_id);

-- 기본 역할-권한 매핑 데이터 삽입
-- CEO: 모든 권한
INSERT INTO rsms.role_permissions (role_id, permission_id) 
SELECT 'CEO', permission_id FROM rsms.permissions WHERE active = true;

-- EXECUTIVE: 승인 및 조회 권한
INSERT INTO rsms.role_permissions (role_id, permission_id) VALUES
('EXECUTIVE', 'READ_USER'),
('EXECUTIVE', 'READ_RISK'),
('EXECUTIVE', 'WRITE_RISK'),
('EXECUTIVE', 'APPROVE_RISK'),
('EXECUTIVE', 'READ_REPORT'),
('EXECUTIVE', 'WRITE_REPORT'),
('EXECUTIVE', 'EXPORT_REPORT');

-- MANAGER: 부서 관리 권한
INSERT INTO rsms.role_permissions (role_id, permission_id) VALUES
('MANAGER', 'READ_USER'),
('MANAGER', 'READ_RISK'),
('MANAGER', 'WRITE_RISK'),
('MANAGER', 'READ_REPORT'),
('MANAGER', 'WRITE_REPORT'),
('MANAGER', 'EXPORT_REPORT');

-- EMPLOYEE: 기본 조회 및 작성 권한
INSERT INTO rsms.role_permissions (role_id, permission_id) VALUES
('EMPLOYEE', 'READ_RISK'),
('EMPLOYEE', 'WRITE_RISK'),
('EMPLOYEE', 'READ_REPORT');

-- ADMIN: 시스템 관리 권한
INSERT INTO rsms.role_permissions (role_id, permission_id) 
SELECT 'ADMIN', permission_id FROM rsms.permissions WHERE active = true;

COMMENT ON TABLE rsms.role_permissions IS '역할-권한 매핑 테이블';
COMMENT ON COLUMN rsms.role_permissions.role_id IS '역할 ID';
COMMENT ON COLUMN rsms.role_permissions.permission_id IS '권한 ID';
COMMENT ON COLUMN rsms.role_permissions.granted IS '권한 부여 여부';
COMMENT ON COLUMN rsms.role_permissions.granted_at IS '권한 부여 일시';
COMMENT ON COLUMN rsms.role_permissions.granted_by IS '권한 부여자';
