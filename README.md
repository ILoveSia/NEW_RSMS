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
- **Zustand** (테마 상태 관리)
- **동적 테마 시스템** (8가지 브랜드 테마)

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

## 동적 테마 시스템

RSMS는 8가지 브랜드 테마를 지원하는 완전한 동적 테마 시스템을 제공합니다.

### 지원 테마 목록

1. **🎨 기본 스타일**: 차분한 슬레이트 그레이 디자인
2. **🎬 넷플릭스 스타일**: 다크하고 모던한 스타일
3. **📦 아마존 스타일**: 프로페셔널한 오렌지 액센트 (기본값)
4. **📷 인스타그램 스타일**: 밝고 모던한 그라데이션
5. **🏢 맨하탄 금융센터 스타일**: 금융 전문가 느낌의 블루
6. **💬 WhatsApp 스타일**: 친근한 그린 톤
7. **🍎 애플 스타일**: 미니멀하고 깔끔한 디자인
8. **🔍 구글 스타일**: 클린하고 모던한 디자인

### 테마 적용 영역
- 🎯 **TopHeader**: 브랜딩 영역, 탭 네비게이션
- 🎯 **LeftMenu**: 사이드바, 메뉴 항목, 테마 선택 드롭다운
- 🎯 **PageHeader**: 페이지 제목, 통계 카드 영역
- 🎯 **Button**: 모든 액션 버튼 (검색, 등록, 삭제, 엑셀다운로드)

### 기술 특징
- **Zustand**: 테마 상태 관리 및 영속화
- **CSS Variables**: 실시간 색상 변경
- **Custom Dropdown**: LeftMenu의 테마 선택 UI
- **Cross-Component**: 모든 컴포넌트에서 일관된 테마 적용

## 개발 표준 템플릿

### PositionMgmt.tsx 기준 템플릿
모든 새로운 페이지 개발은 `PositionMgmt.tsx`를 표준 템플릿으로 참고하여 개발합니다:

- **구조**: PageHeader + SearchFilter + DataGrid + ActionButtons
- **스타일링**: CSS Modules + 테마 변수 활용
- **컴포넌트**: 공통 컴포넌트 재사용 (Button, BaseDataGrid 등)
- **타입**: 강타입 TypeScript 인터페이스 정의

## 개발 계획
1. ✅ 개발환경 설정 완료
2. ✅ 동적 테마 시스템 구축 완료
3. ✅ 표준 개발 템플릿 (PositionMgmt) 확립 완료
4. 📝 업무화면(Frontend) 개발 진행중
5. 📝 업무서비스(Backend) 개발 예정

# NEW_RSMS
NEW 책무구조도 시스템(Responsibility Structure Management System) 
