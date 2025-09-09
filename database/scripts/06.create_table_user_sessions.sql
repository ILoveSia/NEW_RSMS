-- DROP TABLE rsms.user_sessions;

CREATE TABLE rsms.user_sessions (
	session_id varchar(200) PRIMARY KEY,
	user_id varchar(50) PRIMARY KEY,
  ip_address varchar(50) NOT NULL,
  user_agent varchar(50) NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT true
);
