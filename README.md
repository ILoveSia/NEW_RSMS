# RSMS (책무구조도 시스템) 프로젝트

## 프로젝트 개요
기존 Windows C:\CursorProject\itcenSolution1 프로젝트를 WSL 환경에서 재구축 및 고도화

## 기술 스택

### Frontend
- React 18
- TypeScript
- Vite
- Material-UI (MUI)
- AG-Grid
- Axios
- React Query
- React Router DOM

### Backend
- Spring Boot 3.4.0
- Java 21
- Spring Data JPA
- Spring Security
- PostgreSQL Driver
- Lombok
- Validation

### Database
- PostgreSQL 17.6

## 프로젝트 구조
```
RSMS/
├── frontend/          # React + TypeScript + Vite 프론트엔드
├── backend/           # Spring Boot 백엔드
├── database/          # 데이터베이스 스크립트
│   ├── migrations/    # 마이그레이션 파일
│   └── scripts/       # 초기화 및 유틸리티 스크립트
├── docs/              # 프로젝트 문서
└── start-dev.sh       # 개발 환경 실행 스크립트
```

## 개발 환경 설정

### 1. PostgreSQL 데이터베이스 설정
```bash
# 데이터베이스 생성
sudo -u postgres psql < database/scripts/init_database.sql
```

### 2. Backend 설정
- application.yml에서 데이터베이스 접속 정보 확인
- 기본 포트: 8080
- Context Path: /api

### 3. Frontend 설정
- 기본 포트: 5173
- API Proxy: http://localhost:8080

## 실행 방법

### 통합 실행 (추천)
```bash
./start-dev.sh
```

### 개별 실행

#### Backend
```bash
cd backend
./gradlew bootRun
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 접속 정보

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api
- PostgreSQL: localhost:5432/rsms_db

## 주의 사항
- Docker 사용하지 않음
- Redis 사용하지 않음
- WSL 환경에서 개발

## 개발 계획
1. ✅ 개발환경 설정 완료
2. 📝 업무화면(Frontend) 개발 예정
3. 📝 업무서비스(Backend) 개발 예정
# NEW_RSMS
NEW 책무구조도 시스템(Responsibility Structure Management System) 
