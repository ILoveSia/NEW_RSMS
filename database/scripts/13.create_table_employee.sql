
-- DROP TABLE rsms.employee;

CREATE TABLE rsms.employee (
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
	created_id varchar(100) DEFAULT 'SYSTEM'::character varying NULL,
	updated_id varchar(100) DEFAULT 'SYSTEM'::character varying NULL
);
