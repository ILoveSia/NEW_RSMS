# RSMS Frontend 업무화면 목록 및 기능 설명

## 📊 전체 현황

- **총 도메인**: 9개
- **총 업무화면**: 35개
- **개발 완료**: 3개 (UI 완성, Backend 연동 필요)
- **개발 진행률**: 약 20%

---

## 🎯 도메인별 업무화면 목록

### 1. 📋 Resps (책무구조도 관리) - 11개 화면

핵심 도메인으로 책무구조도, 직책, 회의체 등을 관리합니다.

#### 1.1 PositionMgmt (직책관리) ✅ **완성**
- **URL**: `/app/resps/position-mgmt`
- **기능**:
  - 원장차수별 직책 등록/수정/삭제
  - 직책코드, 직책명, 본부명, 사용여부 관리
  - 엑셀 다운로드
  - 통계 카드 (총 직책 수, 활성 직책, 비활성 직책, 최근 등록)
- **주요 컴포넌트**:
  - LedgerOrderComboBox (원장차수 선택)
  - BaseSearchFilter (검색 필터)
  - BaseDataGrid (AG-Grid 기반 데이터 그리드)
  - PositionFormModal (등록/수정 모달)
- **특징**: 모든 페이지의 표준 템플릿으로 사용
- **상태**: UI 완성, Backend API 연동 필요

#### 1.2 PositionDualMgmt (직책겸직관리)
- **URL**: `/app/resps/position-dual-mgmt`
- **기능**:
  - 직책 겸직(중복 직책) 관리
  - 원장차수별 겸직 현황 조회
  - 겸직 등록/해제
  - 엑셀 다운로드
- **주요 컴포넌트**:
  - PositionDualFormModal (겸직 등록 모달)
  - PositionDualDataGrid (겸직 목록 그리드)
- **상태**: UI 기본 구조 완성, Backend 연동 필요

#### 1.3 DeliberativeMgmt (회의체관리)
- **URL**: `/app/resps/deliberative-mgmt`
- **기능**:
  - 회의체 등록/수정/삭제
  - 회의체명, 개최주기, 사용여부 관리
  - 회의체 위원 구성 관리
  - 엑셀 다운로드
- **주요 컴포넌트**:
  - BaseSearchFilter (검색: 원장차수, 회의체명, 사용여부, 개최주기)
  - BaseDataGrid (회의체 목록)
- **최근 수정사항**:
  - "위원장" 검색 필드 삭제
  - 상하이동 버튼 제거
  - LedgerOrderComboBox를 검색 필터 내부로 이동
- **상태**: UI 기본 구조 완성, Backend 연동 필요

#### 1.4 LedgerMgmt (원장차수관리)
- **URL**: `/app/resps/ledger-mgmt`
- **기능**:
  - 책무이행 원장차수 생성/관리
  - 차수별 시작일/종료일 설정
  - 활성 차수 관리 (한 번에 하나만 활성)
  - 차수 복사 기능
- **주요 컴포넌트**:
  - LedgerFormModal (차수 등록/수정)
  - LedgerDataGrid (차수 목록)
- **상태**: UI 기본 구조 완성, Backend 연동 필요

#### 1.5 ResponsibilityMgmt (책무관리)
- **URL**: `/app/resps/responsibility-mgmt`
- **기능**:
  - 책무 항목 등록/수정/삭제
  - 책무 분류 (전략, 운영, 지원 등)
  - 책무 담당자 지정
  - 책무 우선순위 관리
- **주요 컴포넌트**:
  - ResponsibilityFormModal (책무 등록/수정)
  - ResponsibilityDataGrid (책무 목록)
- **상태**: 기본 구조만 생성됨

#### 1.6 ResponsibilityDocMgmt (책무구조도관리)
- **URL**: `/app/resps/responsibility-doc-mgmt`
- **기능**:
  - 책무구조도 문서 관리
  - 책무 계층 구조 시각화
  - 책무 간 관계 설정
  - 문서 버전 관리
- **주요 컴포넌트**:
  - ResponsibilityDocFormModal (문서 등록/수정)
  - ResponsibilityDocDataGrid (문서 목록)
  - ResponsibilityDocSearchFilter (문서 검색)
- **상태**: 기본 구조만 생성됨

#### 1.7 BoardHistoryMgmt (이사회의사록관리)
- **URL**: `/app/resps/board-history-mgmt`
- **기능**:
  - 이사회 의사록 등록/조회
  - 의사록 첨부파일 관리
  - 의결사항 관리
  - 이사회 개최일자별 조회
- **주요 컴포넌트**:
  - BoardHistoryFormModal (의사록 등록/수정)
  - BoardHistoryDataGrid (의사록 목록)
- **상태**: 기본 구조만 생성됨

#### 1.8 DeptOpManualsMgmt (부서업무매뉴얼관리)
- **URL**: `/app/resps/dept-op-manuals-mgmt`
- **기능**:
  - 부서별 업무 매뉴얼 등록/관리
  - 매뉴얼 문서 첨부
  - 매뉴얼 버전 관리
  - 부서별 조회
- **주요 컴포넌트**:
  - DeptOpManualsFormModal (매뉴얼 등록/수정)
  - DeptOpManualsDataGrid (매뉴얼 목록)
- **상태**: 기본 구조만 생성됨

#### 1.9 CeoMgmtDutySearch (대표이사직무조회)
- **URL**: `/app/resps/ceo-mgmt-duty-search`
- **기능**:
  - 대표이사 직무 조회
  - 직무별 책무 현황
  - 직무 이행 현황 조회
- **상태**: 폴더만 생성됨

#### 1.10 OfficerInfoMgmt (임원정보관리)
- **URL**: `/app/resps/officer-info-mgmt`
- **기능**:
  - 임원 정보 등록/수정/삭제
  - 임원별 담당 책무 조회
  - 임원 재임 기간 관리
- **상태**: 폴더만 생성됨

#### 1.11 RoleHistory (역할이력관리)
- **URL**: `/app/resps/role-history`
- **기능**:
  - 직책별 역할 변경 이력 조회
  - 담당자 변경 이력 추적
  - 시점별 조직도 조회
- **상태**: 폴더만 생성됨

---

### 2. ⚙️ System (시스템 관리) - 5개 화면

시스템 운영을 위한 기본 설정 화면들입니다.

#### 2.1 UserMgmt (사용자관리) ✅ **완성**
- **URL**: `/app/settings/system/user-mgmt`
- **기능**:
  - 시스템 사용자 등록/수정/삭제
  - 사용자 권한 부여
  - 사용자 상태 관리 (활성/비활성)
  - 비밀번호 초기화
  - 엑셀 다운로드
- **주요 컴포넌트**:
  - UserFormModal (사용자 등록/수정)
  - BaseSearchFilter (검색: 사용자ID, 이름, 부서, 권한, 상태)
  - BaseDataGrid (사용자 목록)
- **특징**: PositionMgmt 표준 템플릿 준수
- **상태**: UI 완성, Backend API 연동 필요

#### 2.2 RoleMgmt (권한관리)
- **URL**: `/app/settings/system/role-mgmt`
- **기능**:
  - 권한 그룹 생성/관리
  - 메뉴별 권한 설정 (조회/등록/수정/삭제)
  - 사용자 권한 일괄 부여
  - 권한 매트릭스 조회
- **주요 컴포넌트**:
  - RoleFormModal (권한 등록/수정)
  - PermissionAssignModal (권한 할당)
  - PermissionMatrixModal (권한 매트릭스)
- **상태**: 기본 구조만 생성됨

#### 2.3 MenuMgmt (메뉴관리)
- **URL**: `/app/settings/system/menu-mgmt`
- **기능**:
  - 메뉴 트리 구조 관리
  - 메뉴 등록/수정/삭제
  - 메뉴 순서 변경
  - 메뉴-권한 연결
- **주요 컴포넌트**:
  - MenuTreeComponent (트리 구조 메뉴)
- **상태**: 기본 구조만 생성됨

#### 2.4 CodeMgmt (코드관리)
- **URL**: `/app/settings/system/code-mgmt`
- **기능**:
  - 공통코드 등록/수정/삭제
  - 코드 그룹 관리
  - 코드 순서 관리
  - 코드 사용여부 관리
- **상태**: 기본 구조만 생성됨

#### 2.5 AccessLog (접근로그) ✅ **완성**
- **URL**: `/app/settings/system/access-log`
- **기능**:
  - 시스템 접근 로그 조회
  - 사용자별 접근 이력 추적
  - IP, 접근시간, 메뉴, 작업유형 조회
  - 엑셀 다운로드
- **주요 컴포넌트**:
  - AccessLogDetailModal (로그 상세)
  - BaseSearchFilter (7개 검색필드: 사용자ID, 이름, IP, 메뉴, 작업유형, 시작일, 종료일)
  - BaseDataGrid (로그 목록)
- **특징**: 7개 검색필드를 한 줄에 배치, HTML 태그 제거하여 순수 데이터만 표시
- **상태**: UI 완성, Backend API 연동 필요

---

### 3. 📊 Activities (활동 관리) - 5개 화면

내부통제 활동 및 업무 수행자 관리 화면들입니다.

#### 3.1 InternalControlRegister (내부통제등록)
- **URL**: `/app/activities/internal-control-register`
- **기능**:
  - 내부통제 활동 등록
  - 통제 항목 설정
  - 통제 주기 설정
  - 담당자 지정
- **주요 컴포넌트**:
  - InternalControlFormModal (내부통제 등록)
- **상태**: 기본 구조만 생성됨

#### 3.2 InternalControlMgmt (내부통제관리)
- **URL**: `/app/activities/internal-control-mgmt`
- **기능**:
  - 등록된 내부통제 조회/수정/삭제
  - 통제 이행 현황 관리
  - 통제 평가 관리
- **주요 컴포넌트**:
  - InternalControlFormModal (수정)
  - InternalControlMgmtDetailModal (상세)
- **상태**: 기본 구조만 생성됨

#### 3.3 ManualInquiry (매뉴얼조회)
- **URL**: `/app/activities/manual-inquiry`
- **기능**:
  - 업무 매뉴얼 조회
  - 매뉴얼 검색 (키워드, 부서별)
  - 매뉴얼 다운로드
  - 매뉴얼 열람 이력 관리
- **주요 컴포넌트**:
  - ManualDetailModal (매뉴얼 상세)
  - ManualDataGrid (매뉴얼 목록)
- **상태**: 기본 구조만 생성됨

#### 3.4 PerformerAssignment (수행자지정)
- **URL**: `/app/activities/performer-assignment`
- **기능**:
  - 활동별 수행자 지정
  - 수행자 변경 이력 관리
  - 수행자 업무 부하 조회
- **주요 컴포넌트**:
  - PerformerFormModal (수행자 지정)
  - PerformerDataGrid (수행자 목록)
- **상태**: 기본 구조만 생성됨

#### 3.5 ActivityExecution (활동실행)
- **URL**: `/app/activities/activity-execution`
- **기능**:
  - 지정된 활동 실행
  - 활동 결과 등록
  - 증빙 자료 첨부
  - 활동 완료 보고
- **상태**: 폴더만 생성됨

---

### 4. ✅ Compliance (이행점검 관리) - 4개 화면

책무 이행 점검 및 승인 관리 화면들입니다.

#### 4.1 PeriodSetting (점검기간설정)
- **URL**: `/app/compliance/period-setting`
- **기능**:
  - 이행점검 기간 설정
  - 분기별/반기별/연간 점검 기간 관리
  - 점검 일정 알림 설정
- **주요 컴포넌트**:
  - PeriodFormModal (기간 설정)
  - PeriodDataGrid (기간 목록)
- **상태**: 기본 구조만 생성됨

#### 4.2 InspectorAssign (점검자지정)
- **URL**: `/app/compliance/inspector-assign`
- **기능**:
  - 점검자 지정/변경
  - 점검 대상 할당
  - 점검자 업무 부하 조회
- **주요 컴포넌트**:
  - InspectorSelectionModal (점검자 선택)
  - InspectorDataGrid (점검자 목록)
- **상태**: 기본 구조만 생성됨

#### 4.3 ExecutionApproval (이행승인)
- **URL**: `/app/compliance/execution-approval`
- **기능**:
  - 이행 결과 승인/반려
  - 이행 증빙 자료 검토
  - 승인 의견 작성
  - 승인 이력 관리
- **주요 컴포넌트**:
  - ExecutionDetailModal (승인 상세)
  - ExecutionDataGrid (승인 목록)
- **상태**: 기본 구조만 생성됨

#### 4.4 RejectionMgmt (반려관리)
- **URL**: `/app/compliance/rejection-mgmt`
- **기능**:
  - 반려된 이행 건 조회
  - 반려 사유 관리
  - 재제출 관리
  - 반려 통계
- **주요 컴포넌트**:
  - RejectionFormModal (반려 처리)
- **상태**: 기본 구조만 생성됨

---

### 5. 📝 Reports (보고서) - 3개 화면

책무 이행 현황 보고서 생성 및 조회 화면들입니다.

#### 5.1 ReportList (보고서목록)
- **URL**: `/app/reports/report-list`
- **기능**:
  - 생성된 보고서 목록 조회
  - 보고서 검색 (기간, 유형, 작성자)
  - 보고서 다운로드 (PDF, Excel)
  - 보고서 공유
- **주요 컴포넌트**:
  - ReportFormModal (보고서 생성)
  - ImprovementActionModal (개선조치)
  - ReportDataGrid (보고서 목록)
- **상태**: 기본 구조만 생성됨

#### 5.2 ExecutiveReport (임원보고서)
- **URL**: `/app/reports/executive-report`
- **기능**:
  - 임원용 요약 보고서 생성
  - 핵심 지표 시각화
  - 이슈 하이라이트
  - 개선 권고사항
- **주요 컴포넌트**:
  - ExecutiveReportFormModal (임원 보고서 생성)
- **상태**: 기본 구조만 생성됨

#### 5.3 CeoReport (대표이사보고서)
- **URL**: `/app/reports/ceo-report`
- **기능**:
  - 대표이사 직무 이행 현황 보고서
  - 경영 책무 이행률
  - 주요 의사결정 이력
  - 리스크 요약
- **주요 컴포넌트**:
  - CeoReportFormModal (CEO 보고서 생성)
- **상태**: 기본 구조만 생성됨

---

### 6. 🔧 Improvement (개선이행 관리) - 2개 화면

개선과제 및 이행점검 화면들입니다.

#### 6.1 ActComplImprovement (조치완료개선)
- **URL**: `/app/improvement/act-compl-improvement`
- **기능**:
  - 개선 조치 완료 등록
  - 조치 결과 증빙
  - 조치 효과성 평가
  - 완료 승인 요청
- **주요 컴포넌트**:
  - ImprovementDetailModal (개선 상세)
- **상태**: 기본 구조만 생성됨

#### 6.2 ReportImprovement (보고개선)
- **URL**: `/app/improvement/report-improvement`
- **기능**:
  - 개선 이행 현황 보고
  - 미완료 개선과제 관리
  - 개선 지연 사유 관리
  - 개선 통계
- **주요 컴포넌트**:
  - ReportImprovementDetailModal (보고 상세)
- **상태**: 기본 구조만 생성됨

---

### 7. ✔️ Approval (결재 관리) - 2개 화면

전자결재 관련 화면들입니다.

#### 7.1 ApprovalBox (결재함)
- **URL**: `/app/approval/approval-box`
- **기능**:
  - 결재 대기 문서 조회
  - 결재 승인/반려
  - 결재 의견 작성
  - 결재 이력 조회
- **주요 컴포넌트**:
  - ApprovalDetailModal (결재 상세)
- **상태**: 기본 구조만 생성됨

#### 7.2 ApprovalLine (결재선관리)
- **URL**: `/app/approval/approval-line`
- **기능**:
  - 결재선 등록/수정/삭제
  - 기본 결재선 설정
  - 문서 유형별 결재선 관리
  - 결재선 템플릿 관리
- **주요 컴포넌트**:
  - ApprovalLineDetailModal (결재선 상세)
- **상태**: 기본 구조만 생성됨

---

### 8. 📊 Dashboard (대시보드) - 1개 화면

전체 현황을 한눈에 볼 수 있는 대시보드입니다.

#### 8.1 HomeDashboard (홈대시보드)
- **URL**: `/app/dashboard`
- **기능**:
  - 책무 이행 현황 요약
  - 주요 지표 시각화 (차트)
  - 최근 활동 내역
  - 알림 및 공지사항
  - 개선과제 현황
  - 승인 대기 문서 수
- **예상 컴포넌트**:
  - 통계 카드 (총 책무 수, 이행률, 개선과제 등)
  - Recharts 차트 (이행률 추이, 부서별 이행 현황 등)
  - 최근 활동 목록
  - 알림 위젯
- **상태**: 폴더만 생성됨

---

### 9. 🔐 Auth (인증) - 1개 화면

사용자 인증 관련 화면입니다.

#### 9.1 LoginPage (로그인)
- **URL**: `/login`
- **기능**:
  - 사용자 로그인
  - 비밀번호 찾기
  - 자동 로그인 (Remember Me)
  - SSO 연동 준비
- **상태**: 기본 구조만 생성됨

---

## 📊 개발 우선순위 권장

### Phase 1: 핵심 관리 화면 (2주)
Backend API 연동 및 CRUD 완성
1. ✅ PositionMgmt (직책관리) - Backend 연동
2. ✅ UserMgmt (사용자관리) - Backend 연동
3. ✅ AccessLog (접근로그) - Backend 연동
4. LedgerMgmt (원장차수관리) - Backend 개발 + 연동
5. DeliberativeMgmt (회의체관리) - Backend 개발 + 연동

### Phase 2: 책무 관리 화면 (2주)
책무 핵심 업무 화면
6. ResponsibilityMgmt (책무관리)
7. ResponsibilityDocMgmt (책무구조도관리)
8. PositionDualMgmt (직책겸직관리)

### Phase 3: 이행점검 화면 (2주)
이행점검 워크플로우
9. PeriodSetting (점검기간설정)
10. InspectorAssign (점검자지정)
11. ExecutionApproval (이행승인)
12. RejectionMgmt (반려관리)

### Phase 4: 활동 관리 화면 (2주)
내부통제 활동
13. InternalControlRegister (내부통제등록)
14. InternalControlMgmt (내부통제관리)
15. ManualInquiry (매뉴얼조회)
16. PerformerAssignment (수행자지정)
17. ActivityExecution (활동실행)

### Phase 5: 보고서 및 대시보드 (2주)
시각화 및 보고
18. HomeDashboard (홈대시보드)
19. ReportList (보고서목록)
20. ExecutiveReport (임원보고서)
21. CeoReport (대표이사보고서)

### Phase 6: 개선 및 결재 (1주)
개선과제 및 전자결재
22. ActComplImprovement (조치완료개선)
23. ReportImprovement (보고개선)
24. ApprovalBox (결재함)
25. ApprovalLine (결재선관리)

### Phase 7: 시스템 설정 (1주)
시스템 관리 화면
26. RoleMgmt (권한관리)
27. MenuMgmt (메뉴관리)
28. CodeMgmt (코드관리)

### Phase 8: 추가 기능 (1주)
나머지 화면들
29. BoardHistoryMgmt (이사회의사록관리)
30. DeptOpManualsMgmt (부서업무매뉴얼관리)
31. CeoMgmtDutySearch (대표이사직무조회)
32. OfficerInfoMgmt (임원정보관리)
33. RoleHistory (역할이력관리)
34. LoginPage (로그인) - SSO 연동

---

## 🎨 공통 컴포넌트 활용

모든 화면은 다음 공통 컴포넌트를 활용하여 일관성을 유지합니다:

### Atoms (기본 요소)
- Button (테마 적용 버튼)
- LoadingSpinner (로딩 표시)
- Input, Select, Checkbox 등

### Molecules (조합 요소)
- LedgerOrderComboBox (원장차수 선택)
- SearchField (검색 입력 필드)
- ActionButtons (액션 버튼 그룹)

### Organisms (복합 요소)
- BasePageHeader (페이지 헤더 + 통계 카드)
- BaseSearchFilter (검색 필터 영역)
- BaseActionBar (액션 바 + 상태 표시)
- BaseDataGrid (AG-Grid 기반 데이터 그리드)
- BaseModalWrapper (모달 래퍼)

### Templates (레이아웃)
- MainLayout (TopHeader + LeftMenu + Content)
- PageLayout (PageHeader + Search + ActionBar + Grid)

---

## 🎯 표준 페이지 템플릿

**PositionMgmt.tsx**를 표준 템플릿으로 사용:

```
1. PageHeader (통계 카드 포함)
   - 타이틀, 설명
   - 통계 카드 4개 (총 개수, 활성, 비활성, 최근 등록)

2. SearchFilter
   - 검색 조건 입력 (LedgerOrderComboBox 포함)
   - 검색/초기화 버튼

3. ActionBar
   - 좌측: 총 개수, 선택 개수, 상태 표시
   - 우측: 엑셀다운로드, 등록, 삭제 버튼

4. DataGrid
   - AG-Grid 기반 데이터 그리드
   - 페이징, 정렬, 필터링
   - 체크박스 선택

5. Modal
   - 등록/수정 모달
   - 상세보기 모달
```

---

## 📈 예상 개발 일정

- **전체 기간**: 12~14주 (약 3개월)
- **Phase 1 (핵심)**: 2주
- **Phase 2-4 (주요)**: 6주
- **Phase 5-8 (부가)**: 4주
- **통합 테스트**: 2주

**총 개발 예상 일수**: 60~70 영업일

---

## 🚀 성공 요인

1. **표준 템플릿 준수**: PositionMgmt.tsx 구조 100% 따르기
2. **공통 컴포넌트 활용**: 중복 개발 최소화
3. **Backend API 우선**: Frontend 연동 전 API 완성
4. **테마 시스템 적용**: 8가지 테마 일관성 유지
5. **테스트 작성**: 단위/통합 테스트 병행

---

**마지막 업데이트**: 2025-09-24
**작성자**: Claude AI
**문서 버전**: 1.0
