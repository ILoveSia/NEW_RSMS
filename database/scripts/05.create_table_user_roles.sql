
-- DROP TABLE rsms.user_roles;

CREATE TABLE rsms.user_roles (
	role_id varchar(20) PRIMARY KEY,
	user_id varchar(50) PRIMARY KEY,
	assigned_at timestamp(6) NOT NULL,
	assigned_by varchar(50) NULL,
	active BOOLEAN DEFAULT true,
	CONSTRAINT user_roles_role_id FOREIGN KEY (role_id) REFERENCES rsms.roles(role_id)
);
