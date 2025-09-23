/**
 * 애플리케이션 메인 라우터
 * Domain-Driven Design 구조와 권한 기반 라우팅 적용
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from '@/shared/components/templates/Layout';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
// Lazy-loaded pages for better performance
const LoginPage = React.lazy(() => import('@/domains/auth/pages/LoginPage/LoginPage').then(module => ({ default: module.LoginPage })));
const LedgerOrderManagement = React.lazy(() => import('@/domains/resps/pages/LedgerOrderManagement/LedgerOrderManagement'));
const ResponsibilityManagement = React.lazy(() => import('@/domains/resps/pages/ResponsibilityMgmt'));
const ResponsibilityDocMgmt = React.lazy(() => import('@/domains/resps/pages/ResponsibilityDocMgmt'));
const PositionMgmt = React.lazy(() => import('@/domains/resps/pages/PositionMgmt/PositionMgmt'));
const PositionDualMgmt = React.lazy(() => import('@/domains/resps/pages/PositionDualMgmt/PositionDualMgmt'));
const DeliberativeMgmt = React.lazy(() => import('@/domains/resps/pages/DeliberativeMgmt/DeliberativeMgmt'));
const BoardHistoryMgmt = React.lazy(() => import('@/domains/resps/pages/BoardHistoryMgmt/BoardHistoryMgmt'));
const OfficerInfoMgmt = React.lazy(() => import('@/domains/resps/pages/OfficerInfoMgmt/OfficerInfoMgmt'));
const DeptOpManualsMgmt = React.lazy(() => import('@/domains/resps/pages/DeptOpManualsMgmt/DeptOpManualsMgmt'));
const CeoMgmtDutySearch = React.lazy(() => import('@/domains/resps/pages/CeoMgmtDutySearch/CeoMgmtDutySearch'));
const RoleHistory = React.lazy(() => import('@/domains/resps/pages/RoleHistory/RoleHistory'));
const HomeDashboard = React.lazy(() => import('@/domains/dashboard/pages/HomeDashboard/HomeDashboard'));

// Activities (책무구조도 관리 활동) 도메인
const PerformerAssignment = React.lazy(() => import('@/domains/activities/pages/PerformerAssignment/PerformerAssignment'));
const ActivityExecution = React.lazy(() => import('@/domains/activities/pages/ActivityExecution/ActivityExecution'));
const ManualInquiry = React.lazy(() => import('@/domains/activities/pages/ManualInquiry/ManualInquiry'));
const InternalControlRegister = React.lazy(() => import('@/domains/activities/pages/InternalControlRegister/InternalControlRegister'));
const InternalControlMgmt = React.lazy(() => import('@/domains/activities/pages/InternalControlMgmt/InternalControlMgmt'));

// Compliance (이행점검 관리) 도메인
const PeriodSetting = React.lazy(() => import('@/domains/compliance/pages/PeriodSetting/PeriodSetting'));
const InspectorAssign = React.lazy(() => import('@/domains/compliance/pages/InspectorAssign'));
const ExecutionApproval = React.lazy(() => import('@/domains/compliance/pages/ExecutionApproval'));
const RejectionMgmt = React.lazy(() => import('@/domains/compliance/pages/RejectionMgmt'));

// Reports (보고서) 도메인
const ExecutiveReport = React.lazy(() => import('@/domains/reports/pages/ExecutiveReport'));
const CeoReport = React.lazy(() => import('@/domains/reports/pages/CeoReport'));
const ReportList = React.lazy(() => import('@/domains/reports/pages/ReportList'));
import {
  AuthGuard,
  ManagerGuard,
  AdminGuard
} from './guards';

// 임시 페이지 컴포넌트들 (디자인 완료 후 실제 컴포넌트로 교체)
const TemporaryPage: React.FC<{ title: string; description?: string }> = ({ 
  title, 
  description 
}) => (
  <div style={{ 
    padding: '48px 24px', 
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  }}>
    <h1 style={{ 
      fontSize: '2.5rem', 
      marginBottom: '16px',
      color: '#1976d2'
    }}>
      {title}
    </h1>
    <p style={{ 
      fontSize: '1.1rem',
      color: '#666',
      lineHeight: '1.6'
    }}>
      {description || '디자인 완료 후 구현 예정입니다.'}
    </p>
    <div style={{
      marginTop: '32px',
      padding: '24px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      fontSize: '0.9rem',
      color: '#555'
    }}>
      <strong>개발 진행 상황:</strong><br />
      ✅ 폴더 구조 생성<br />
      ✅ TypeScript 타입 시스템<br />
      ✅ 라우터 및 권한 시스템<br />
      ⏳ API 클라이언트 (백엔드 준비 대기)<br />
      ⏳ UI 컴포넌트 (디자인 완료 대기)
    </div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* 인증 라우트 (Public) */}
        <Route path="/auth/*" element={
          <Suspense fallback={<LoadingSpinner text="로그인 페이지 로딩 중..." />}>
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Suspense>
        } />

        {/* 에러 페이지들 (Public) */}
        <Route path="/404" element={
          <TemporaryPage 
            title="404 - 페이지를 찾을 수 없습니다" 
            description="요청하신 페이지가 존재하지 않습니다."
          />
        } />
        
        <Route path="/403" element={
          <TemporaryPage 
            title="403 - 접근 권한이 없습니다" 
            description="이 페이지에 접근할 권한이 없습니다."
          />
        } />

        <Route path="/500" element={
          <TemporaryPage 
            title="500 - 서버 오류" 
            description="서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          />
        } />

        {/* 홈페이지 - 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* 레거시 라우트 리다이렉션 (이전 경로 호환성) */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/resps/*" element={<Navigate to="/app/resps/ledger-orders" replace />} />
        <Route path="/risks/*" element={<Navigate to="/app/risks" replace />} />
        <Route path="/users/*" element={<Navigate to="/app/users" replace />} />
        <Route path="/reports/*" element={<Navigate to="/app/reports" replace />} />
        <Route path="/settings/*" element={<Navigate to="/app/settings" replace />} />

        {/* 메인 애플리케이션 라우트 (레이아웃 포함) */}
        <Route path="/app" element={<Layout />}>
          
          {/* 대시보드 (인증 필요) */}
          <Route path="dashboard/*" element={
            <AuthGuard>
              <Suspense fallback={<LoadingSpinner text="대시보드 로딩 중..." />}>
                <Routes>
                  <Route index element={
                    <HomeDashboard />
                  } />
                  <Route path="analytics" element={
                    <TemporaryPage
                      title="분석 대시보드"
                      description="리스크 분석, 트렌드, 예측 등의 고급 분석 기능이 제공될 예정입니다."
                    />
                  } />
                  <Route path="reports" element={
                    <TemporaryPage
                      title="보고서 대시보드"
                      description="주요 보고서들을 요약하여 보여주는 대시보드입니다."
                    />
                  } />
                  <Route path="alerts" element={
                    <TemporaryPage
                      title="알림 센터"
                      description="시스템 알림, 리스크 경고, 승인 요청 등을 관리하는 페이지입니다."
                    />
                  } />
                </Routes>
              </Suspense>
            </AuthGuard>
          } />

          {/* 책무 관리 (인증 필요 - 핵심 도메인) */}
          <Route path="resps/*" element={
            <AuthGuard>
              <Suspense fallback={<LoadingSpinner text="책무 관리 로딩 중..." />}>
                <Routes>
                  {/* 원장관리 */}
                  <Route path="ledger-orders" element={<LedgerOrderManagement />} />
                  <Route path="ledger-orders/:id" element={
                    <TemporaryPage
                      title="원장차수 상세"
                      description="원장차수의 상세 정보와 관련 책무들을 관리하는 페이지입니다."
                    />
                  } />
                  <Route path="ledger-orders/create" element={
                    <TemporaryPage
                      title="원장차수 생성"
                      description="새로운 원장차수를 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="ledger-orders/:id/edit" element={
                    <TemporaryPage
                      title="원장차수 편집"
                      description="기존 원장차수 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 직책관리 */}
                  <Route path="positionmgmt" element={<PositionMgmt />} />
                  <Route path="positionmgmt/:id" element={
                    <TemporaryPage
                      title="직책 상세"
                      description="직책의 상세 정보와 관련 조직 정보를 확인하는 페이지입니다."
                    />
                  } />

                  {/* 기존 URL 호환성 - 직책관리 */}
                  <Route path="positions" element={<Navigate to="/app/resps/positionmgmt" replace />} />
                  <Route path="positions/:id" element={<Navigate to="/app/resps/positionmgmt" replace />} />
                  <Route path="positions/create" element={<Navigate to="/app/resps/positionmgmt" replace />} />
                  <Route path="positions/:id/edit" element={<Navigate to="/app/resps/positionmgmt" replace />} />

                  {/* 직책겸직관리 */}
                  <Route path="positiondualmgmt" element={<PositionDualMgmt />} />
                  <Route path="positiondualmgmt/:id" element={
                    <TemporaryPage
                      title="직책겸직 상세"
                      description="직책겸직의 상세 정보와 겸직 직책 목록을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="positiondualmgmt/create" element={
                    <TemporaryPage
                      title="직책겸직 생성"
                      description="새로운 직책겸직을 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="positiondualmgmt/:id/edit" element={
                    <TemporaryPage
                      title="직책겸직 편집"
                      description="기존 직책겸직 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 기존 URL 호환성 - 직책겸직관리 */}
                  <Route path="position-duals" element={<Navigate to="/app/resps/positiondualmgmt" replace />} />
                  <Route path="position-duals/:id" element={<Navigate to="/app/resps/positiondualmgmt" replace />} />
                  <Route path="position-duals/create" element={<Navigate to="/app/resps/positiondualmgmt" replace />} />
                  <Route path="position-duals/:id/edit" element={<Navigate to="/app/resps/positiondualmgmt" replace />} />

                  {/* 회의체관리 */}
                  <Route path="deliberativemgmt" element={<DeliberativeMgmt />} />
                  <Route path="deliberativemgmt/:id" element={
                    <TemporaryPage
                      title="회의체 상세"
                      description="회의체의 상세 정보와 위원 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="deliberativemgmt/create" element={
                    <TemporaryPage
                      title="회의체 생성"
                      description="새로운 회의체를 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="deliberativemgmt/:id/edit" element={
                    <TemporaryPage
                      title="회의체 편집"
                      description="기존 회의체 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 책무관리 */}
                  <Route path="responsibilitymgmt" element={<ResponsibilityManagement />} />
                  <Route path="responsibilitymgmt/:id" element={
                    <TemporaryPage
                      title="책무 상세"
                      description="개별 책무의 상세 정보와 진행 상황을 관리하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilitymgmt/create" element={
                    <TemporaryPage
                      title="책무 생성"
                      description="새로운 책무를 생성하고 할당하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilitymgmt/:id/edit" element={
                    <TemporaryPage
                      title="책무 편집"
                      description="기존 책무 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 기존 URL 호환성 - 책무관리 */}
                  <Route path="responsibilities" element={<Navigate to="/app/resps/responsibilitymgmt" replace />} />
                  <Route path="responsibilities/:id" element={<Navigate to="/app/resps/responsibilitymgmt" replace />} />
                  <Route path="responsibilities/create" element={<Navigate to="/app/resps/responsibilitymgmt" replace />} />
                  <Route path="responsibilities/:id/edit" element={<Navigate to="/app/resps/responsibilitymgmt" replace />} />

                  {/* 책무기술서관리 */}
                  <Route path="responsibilitydocmgmt" element={<ResponsibilityDocMgmt />} />
                  <Route path="responsibilitydocmgmt/:id" element={
                    <TemporaryPage
                      title="기술서 상세"
                      description="기술서의 상세 내용과 버전 이력을 관리하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilitydocmgmt/create" element={
                    <TemporaryPage
                      title="기술서 작성"
                      description="새로운 기술서를 작성하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilitydocmgmt/:id/edit" element={
                    <TemporaryPage
                      title="기술서 편집"
                      description="기존 기술서를 편집하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilitydocmgmt/:id/generate" element={
                    <TemporaryPage
                      title="기술서 생성"
                      description="템플릿을 기반으로 기술서를 자동 생성하는 페이지입니다."
                    />
                  } />

                  {/* 기존 URL 호환성 - 책무기술서관리 */}
                  <Route path="specifications" element={<Navigate to="/app/resps/responsibilitydocmgmt" replace />} />
                  <Route path="specifications/:id" element={<Navigate to="/app/resps/responsibilitydocmgmt" replace />} />
                  <Route path="specifications/create" element={<Navigate to="/app/resps/responsibilitydocmgmt" replace />} />
                  <Route path="specifications/:id/edit" element={<Navigate to="/app/resps/responsibilitydocmgmt" replace />} />
                  <Route path="specifications/:id/generate" element={<Navigate to="/app/resps/responsibilitydocmgmt" replace />} />

                  {/* 기존 URL 호환성 - 회의체관리 */}
                  <Route path="meetings" element={<Navigate to="/app/resps/deliberativemgmt" replace />} />
                  <Route path="meetings/:id" element={<Navigate to="/app/resps/deliberativemgmt" replace />} />
                  <Route path="meetings/create" element={<Navigate to="/app/resps/deliberativemgmt" replace />} />
                  <Route path="meetings/:id/edit" element={<Navigate to="/app/resps/deliberativemgmt" replace />} />

                  {/* 이사회이력관리 */}
                  <Route path="boardhistorymgmt" element={<BoardHistoryMgmt />} />
                  <Route path="boardhistorymgmt/:id" element={
                    <TemporaryPage
                      title="이사회 이력 상세"
                      description="이사회 이력의 상세 정보와 첨부파일을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="boardhistorymgmt/create" element={
                    <TemporaryPage
                      title="이사회 이력 등록"
                      description="새로운 이사회 이력을 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="boardhistorymgmt/:id/edit" element={
                    <TemporaryPage
                      title="이사회 이력 편집"
                      description="기존 이사회 이력 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 기존 URL 호환성 - 이사회이력관리 */}
                  <Route path="board-history" element={<Navigate to="/app/resps/boardhistorymgmt" replace />} />
                  <Route path="board-history/:id" element={<Navigate to="/app/resps/boardhistorymgmt" replace />} />
                  <Route path="board-history/create" element={<Navigate to="/app/resps/boardhistorymgmt" replace />} />
                  <Route path="board-history/:id/edit" element={<Navigate to="/app/resps/boardhistorymgmt" replace />} />

                  {/* 임원정보관리 */}
                  <Route path="officerinfomgmt" element={<OfficerInfoMgmt />} />
                  <Route path="officerinfomgmt/:id" element={<OfficerInfoMgmt />} />
                  <Route path="officerinfomgmt/create" element={<OfficerInfoMgmt />} />
                  <Route path="officerinfomgmt/:id/edit" element={<OfficerInfoMgmt />} />

                  {/* 기존 URL 호환성 - 임원정보관리 */}
                  <Route path="executive-info" element={<Navigate to="/app/resps/officerinfomgmt" replace />} />
                  <Route path="executive-info/:id" element={<Navigate to="/app/resps/officerinfomgmt" replace />} />
                  <Route path="executive-info/create" element={<Navigate to="/app/resps/officerinfomgmt" replace />} />
                  <Route path="executive-info/:id/edit" element={<Navigate to="/app/resps/officerinfomgmt" replace />} />

                  {/* 부서장업무메뉴얼관리 */}
                  <Route path="deptopmanualsmgmt" element={<DeptOpManualsMgmt />} />
                  <Route path="deptopmanualsmgmt/:id" element={<DeptOpManualsMgmt />} />
                  <Route path="deptopmanualsmgmt/create" element={<DeptOpManualsMgmt />} />
                  <Route path="deptopmanualsmgmt/:id/edit" element={<DeptOpManualsMgmt />} />

                  {/* 기존 URL 호환성 - 부서장업무메뉴얼관리 */}
                  <Route path="department-manuals" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="department-manuals/:id" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="department-manuals/create" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="department-manuals/:id/edit" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="dept-op-manuals" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="dept-op-manuals/:id" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="dept-op-manuals/create" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />
                  <Route path="dept-op-manuals/:id/edit" element={<Navigate to="/app/resps/deptopmanualsmgmt" replace />} />


                  {/* CEO총괄관리의무조회 */}
                  <Route path="ceomgmtdutysearch" element={<CeoMgmtDutySearch />} />

                  {/* 직책/책무이력 */}
                  <Route path="rolehistory" element={<RoleHistory />} />

                  {/* 기존 URL 호환성 - CEO총괄관리의무조회 */}
                  <Route path="ceo-management" element={<Navigate to="/app/resps/ceomgmtdutysearch" replace />} />

                  {/* 기본 리다이렉트 */}
                  <Route index element={<Navigate to="/app/resps/ledger-orders" replace />} />
                </Routes>
              </Suspense>
            </AuthGuard>
          } />

          {/* 리스크 관리 (인증 필요) */}
          <Route path="risks/*" element={
            <AuthGuard>
              <Routes>
                <Route index element={
                  <TemporaryPage 
                    title="리스크 관리" 
                    description="리스크 등록, 평가, 모니터링, 대응 등의 핵심 리스크 관리 기능이 구현될 예정입니다."
                  />
                } />
                <Route path="create" element={
                  <TemporaryPage 
                    title="리스크 등록" 
                    description="새로운 리스크를 등록하고 초기 평가를 수행하는 페이지입니다."
                  />
                } />
                <Route path="templates" element={
                  <TemporaryPage 
                    title="리스크 템플릿" 
                    description="리스크 등록을 위한 템플릿을 관리하는 페이지입니다."
                  />
                } />
                <Route path="categories" element={
                  <TemporaryPage 
                    title="리스크 카테고리" 
                    description="리스크 분류 및 카테고리를 관리하는 페이지입니다."
                  />
                } />
                <Route path=":id/*" element={
                  <TemporaryPage 
                    title="리스크 상세" 
                    description="개별 리스크의 상세 정보, 평가, 대응 현황 등을 관리하는 페이지입니다."
                  />
                } />
              </Routes>
            </AuthGuard>
          } />

          {/* 사용자 관리 (매니저 이상) */}
          <Route path="users/*" element={
            <ManagerGuard>
              <Routes>
                <Route index element={
                  <TemporaryPage 
                    title="사용자 관리" 
                    description="사용자 목록, 권한 관리, 역할 할당 등의 사용자 관리 기능이 구현될 예정입니다."
                  />
                } />
                <Route path="create" element={
                  <TemporaryPage 
                    title="사용자 생성" 
                    description="새로운 사용자를 시스템에 등록하는 페이지입니다."
                  />
                } />
                <Route path=":id/*" element={
                  <TemporaryPage 
                    title="사용자 상세" 
                    description="사용자의 상세 정보, 권한, 활동 이력 등을 관리하는 페이지입니다."
                  />
                } />
              </Routes>
            </ManagerGuard>
          } />

          {/* 보고서 (인증 필요) */}
          <Route path="reports/*" element={
            <AuthGuard>
              <Suspense fallback={<LoadingSpinner text="보고서 로딩 중..." />}>
                <Routes>
                  {/* 임원이행점검보고서 */}
                  <Route path="executive-report" element={<ExecutiveReport />} />
                  <Route path="executive-report/:id" element={
                    <TemporaryPage
                      title="임원이행점검보고서 상세"
                      description="임원이행점검보고서의 상세 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="executive-report/create" element={
                    <TemporaryPage
                      title="임원이행점검보고서 생성"
                      description="새로운 임원이행점검보고서를 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="executive-report/:id/edit" element={
                    <TemporaryPage
                      title="임원이행점검보고서 편집"
                      description="기존 임원이행점검보고서 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* CEO이행점검보고서 */}
                  <Route path="ceo-report" element={<CeoReport />} />
                  <Route path="ceo-report/:id" element={
                    <TemporaryPage
                      title="CEO이행점검보고서 상세"
                      description="CEO이행점검보고서의 상세 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="ceo-report/create" element={
                    <TemporaryPage
                      title="CEO이행점검보고서 생성"
                      description="새로운 CEO이행점검보고서를 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="ceo-report/:id/edit" element={
                    <TemporaryPage
                      title="CEO이행점검보고서 편집"
                      description="기존 CEO이행점검보고서 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 보고서목록 */}
                  <Route path="report-list" element={<ReportList />} />
                  <Route path="report-list/:id" element={
                    <TemporaryPage
                      title="보고서 상세"
                      description="보고서의 상세 정보를 확인하는 페이지입니다."
                    />
                  } />

                  {/* 보고서 공통 기능 */}
                  <Route path="templates" element={
                    <TemporaryPage
                      title="보고서 템플릿"
                      description="보고서 템플릿을 관리하고 편집하는 페이지입니다."
                    />
                  } />
                  <Route path="history" element={
                    <TemporaryPage
                      title="보고서 히스토리"
                      description="과거 생성된 보고서들의 이력을 조회하는 페이지입니다."
                    />
                  } />

                  {/* 기본 리다이렉트 */}
                  <Route index element={<Navigate to="/app/reports/executive-report" replace />} />
                </Routes>
              </Suspense>
            </AuthGuard>
          } />

          {/* 설정 */}
          <Route path="settings/*" element={
            <Routes>
              {/* 개인 설정 (인증 필요) */}
              <Route path="profile" element={
                <AuthGuard>
                  <TemporaryPage 
                    title="프로필 설정" 
                    description="개인 프로필 정보를 수정하는 페이지입니다."
                  />
                </AuthGuard>
              } />
              
              <Route path="preferences" element={
                <AuthGuard>
                  <TemporaryPage 
                    title="환경 설정" 
                    description="언어, 테마, 알림 등 개인 환경 설정을 관리하는 페이지입니다."
                  />
                </AuthGuard>
              } />

              <Route path="security" element={
                <AuthGuard>
                  <TemporaryPage 
                    title="보안 설정" 
                    description="비밀번호 변경, 2단계 인증 등 보안 관련 설정을 관리하는 페이지입니다."
                  />
                </AuthGuard>
              } />

              {/* 시스템 설정 (관리자만) */}
              <Route path="system/*" element={
                <AdminGuard>
                  <TemporaryPage 
                    title="시스템 설정" 
                    description="전체 시스템 설정, 사용자 관리, 역할 권한, 감사 로그 등을 관리하는 관리자 전용 페이지입니다."
                  />
                </AdminGuard>
              } />

              {/* 리스크 설정 (매니저 이상) */}
              <Route path="risks/*" element={
                <ManagerGuard>
                  <TemporaryPage 
                    title="리스크 설정" 
                    description="리스크 카테고리, 템플릿, 워크플로우, 임계값 등을 설정하는 페이지입니다."
                  />
                </ManagerGuard>
              } />

              {/* 설정 메인 페이지 */}
              <Route index element={
                <AuthGuard>
                  <TemporaryPage 
                    title="설정" 
                    description="시스템 설정 메뉴입니다. 개인 설정부터 시스템 관리까지 다양한 설정 옵션을 제공합니다."
                  />
                </AuthGuard>
              } />
            </Routes>
          } />

          {/* 책무구조도 관리 활동 (인증 필요) */}
          <Route path="activity/*" element={
            <AuthGuard>
              <Suspense fallback={<LoadingSpinner text="관리활동 로딩 중..." />}>
                <Routes>
                  {/* 수행자지정 */}
                  <Route path="performer-assignment" element={<PerformerAssignment />} />
                  <Route path="performer-assignment/:id" element={
                    <TemporaryPage
                      title="수행자 상세"
                      description="수행자의 상세 정보와 지정 이력을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="performer-assignment/create" element={
                    <TemporaryPage
                      title="수행자 지정"
                      description="새로운 수행자를 지정하는 페이지입니다."
                    />
                  } />
                  <Route path="performer-assignment/:id/edit" element={
                    <TemporaryPage
                      title="수행자 변경"
                      description="기존 수행자 정보를 변경하는 페이지입니다."
                    />
                  } />

                  {/* 관리활동 수행 */}
                  <Route path="execution" element={<ActivityExecution />} />
                  <Route path="execution/:id" element={
                    <TemporaryPage
                      title="관리활동 상세"
                      description="관리활동의 상세 정보와 수행 결과를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="execution/create" element={
                    <TemporaryPage
                      title="관리활동 등록"
                      description="새로운 관리활동을 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="execution/:id/edit" element={
                    <TemporaryPage
                      title="관리활동 편집"
                      description="기존 관리활동 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 업무메뉴얼조회 */}
                  <Route path="manual-inquiry" element={<ManualInquiry />} />
                  <Route path="manual-inquiry/:id" element={
                    <TemporaryPage
                      title="메뉴얼 상세"
                      description="업무 메뉴얼의 상세 내용을 확인하는 페이지입니다."
                    />
                  } />

                  {/* 내부통제장치등록 */}
                  <Route path="internal-control-register" element={
                    <Suspense fallback={<LoadingSpinner text="내부통제장치등록 로딩 중..." />}>
                      <InternalControlRegister />
                    </Suspense>
                  } />
                  <Route path="internal-control-register/:id" element={
                    <TemporaryPage
                      title="내부통제장치 상세"
                      description="내부통제장치의 상세 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="internal-control-register/create" element={
                    <TemporaryPage
                      title="내부통제장치 등록"
                      description="새로운 내부통제장치를 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="internal-control-register/:id/edit" element={
                    <TemporaryPage
                      title="내부통제장치 편집"
                      description="기존 내부통제장치 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 내부통제장치관리 */}
                  <Route path="internal-control-management" element={
                    <Suspense fallback={<LoadingSpinner text="내부통제장치관리 로딩 중..." />}>
                      <InternalControlMgmt />
                    </Suspense>
                  } />
                  <Route path="internal-control-management/:id" element={
                    <TemporaryPage
                      title="내부통제장치 관리 상세"
                      description="내부통제장치 관리의 상세 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="internal-control-management/create" element={
                    <TemporaryPage
                      title="내부통제장치 관리 등록"
                      description="새로운 내부통제장치 관리를 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="internal-control-management/:id/edit" element={
                    <TemporaryPage
                      title="내부통제장치 관리 편집"
                      description="기존 내부통제장치 관리 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 기본 리다이렉트 */}
                  <Route index element={<Navigate to="/app/activity/performer-assignment" replace />} />
                </Routes>
              </Suspense>
            </AuthGuard>
          } />

          {/* 이행점검 관리 (매니저 이상) */}
          <Route path="compliance/*" element={
            <ManagerGuard>
              <Suspense fallback={<LoadingSpinner text="이행점검 관리 로딩 중..." />}>
                <Routes>
                  {/* 기간설정 */}
                  <Route path="period-setting" element={<PeriodSetting />} />
                  <Route path="period-setting/:id" element={
                    <TemporaryPage
                      title="기간설정 상세"
                      description="기간설정의 상세 정보와 관련 항목을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="period-setting/create" element={
                    <TemporaryPage
                      title="기간설정 등록"
                      description="새로운 기간설정을 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="period-setting/:id/edit" element={
                    <TemporaryPage
                      title="기간설정 편집"
                      description="기존 기간설정 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 점검자지정 */}
                  <Route path="inspector-assignment" element={<InspectorAssign />} />
                  <Route path="inspector-assignment/:id" element={
                    <TemporaryPage
                      title="점검자 상세"
                      description="점검자의 상세 정보와 지정 이력을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="inspector-assignment/create" element={
                    <TemporaryPage
                      title="점검자 지정"
                      description="새로운 점검자를 지정하는 페이지입니다."
                    />
                  } />
                  <Route path="inspector-assignment/:id/edit" element={
                    <TemporaryPage
                      title="점검자 변경"
                      description="기존 점검자 정보를 변경하는 페이지입니다."
                    />
                  } />

                  {/* 점검수행 및 결재 */}
                  <Route path="execution-approval" element={<ExecutionApproval />} />
                  <Route path="execution-approval/:id" element={
                    <TemporaryPage
                      title="점검수행 상세"
                      description="점검수행의 상세 정보와 결재 상태를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="execution-approval/create" element={
                    <TemporaryPage
                      title="점검수행 등록"
                      description="새로운 점검수행을 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="execution-approval/:id/edit" element={
                    <TemporaryPage
                      title="점검수행 편집"
                      description="기존 점검수행 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 반려관리 */}
                  <Route path="rejection-management" element={<RejectionMgmt />} />
                  <Route path="rejection-management/:id" element={
                    <TemporaryPage
                      title="반려항목 상세"
                      description="반려항목의 상세 정보와 처리 이력을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="rejection-management/create" element={
                    <TemporaryPage
                      title="반려항목 등록"
                      description="새로운 반려항목을 등록하는 페이지입니다."
                    />
                  } />
                  <Route path="rejection-management/:id/edit" element={
                    <TemporaryPage
                      title="반려항목 편집"
                      description="기존 반려항목 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 기본 리다이렉트 */}
                  <Route index element={<Navigate to="/app/compliance/period-setting" replace />} />
                </Routes>
              </Suspense>
            </ManagerGuard>
          } />

          {/* 앱 기본 경로 - 대시보드로 리다이렉트 */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />

          {/* 404 처리 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;