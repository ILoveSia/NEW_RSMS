
-- DROP TABLE rsms.roles CASCADE;

CREATE TABLE rsms.roles (
  id SERIAL PRIMARY KEY,
  role_id varchar(100) NOT NULL,                --'CEO' | 'EXECUTIVE' | 'MANAGER' | 'EMPLOYEE' | 'ADMIN' 등
  role_name varchar(100) NOT NULL,              --'대표이사' | '임원' | '부서장' | '부서원' | '관리자' 등
  description varchar(500) NULL,
  active BOOLEAN DEFAULT true,
  created_id varchar(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_id varchar(100) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_role_id ON rsms.roles(role_id);
