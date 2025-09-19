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
const HomeDashboard = React.lazy(() => import('@/domains/dashboard/pages/HomeDashboard/HomeDashboard'));
import { routes } from './routes';
import { 
  RouteGuard,
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
                  <Route path="positions" element={<PositionMgmt />} />
                  <Route path="positions/:id" element={
                    <TemporaryPage
                      title="직책 상세"
                      description="직책의 상세 정보와 관련 조직 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="positions/create" element={
                    <TemporaryPage
                      title="직책 생성"
                      description="새로운 직책을 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="positions/:id/edit" element={
                    <TemporaryPage
                      title="직책 편집"
                      description="기존 직책 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 직책겸직관리 */}
                  <Route path="position-duals" element={<PositionDualMgmt />} />
                  <Route path="position-duals/:id" element={
                    <TemporaryPage
                      title="직책겸직 상세"
                      description="직책겸직의 상세 정보와 겸직 직책 목록을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="position-duals/create" element={
                    <TemporaryPage
                      title="직책겸직 생성"
                      description="새로운 직책겸직을 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="position-duals/:id/edit" element={
                    <TemporaryPage
                      title="직책겸직 편집"
                      description="기존 직책겸직 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 책무관리 */}
                  <Route path="responsibilities" element={<ResponsibilityManagement />} />
                  <Route path="responsibilities/:id" element={
                    <TemporaryPage
                      title="책무 상세"
                      description="개별 책무의 상세 정보와 진행 상황을 관리하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilities/create" element={
                    <TemporaryPage
                      title="책무 생성"
                      description="새로운 책무를 생성하고 할당하는 페이지입니다."
                    />
                  } />
                  <Route path="responsibilities/:id/edit" element={
                    <TemporaryPage
                      title="책무 편집"
                      description="기존 책무 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 책무기술서관리 */}
                  <Route path="specifications" element={<ResponsibilityDocMgmt />} />
                  <Route path="specifications/:id" element={
                    <TemporaryPage
                      title="기술서 상세"
                      description="기술서의 상세 내용과 버전 이력을 관리하는 페이지입니다."
                    />
                  } />
                  <Route path="specifications/create" element={
                    <TemporaryPage
                      title="기술서 작성"
                      description="새로운 기술서를 작성하는 페이지입니다."
                    />
                  } />
                  <Route path="specifications/:id/edit" element={
                    <TemporaryPage
                      title="기술서 편집"
                      description="기존 기술서를 편집하는 페이지입니다."
                    />
                  } />
                  <Route path="specifications/:id/generate" element={
                    <TemporaryPage
                      title="기술서 생성"
                      description="템플릿을 기반으로 기술서를 자동 생성하는 페이지입니다."
                    />
                  } />

                  {/* 회의체관리 */}
                  <Route path="meetings" element={<DeliberativeMgmt />} />
                  <Route path="meetings/:id" element={
                    <TemporaryPage
                      title="회의체 상세"
                      description="회의체의 상세 정보와 위원 정보를 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="meetings/create" element={
                    <TemporaryPage
                      title="회의체 생성"
                      description="새로운 회의체를 생성하는 페이지입니다."
                    />
                  } />
                  <Route path="meetings/:id/edit" element={
                    <TemporaryPage
                      title="회의체 편집"
                      description="기존 회의체 정보를 수정하는 페이지입니다."
                    />
                  } />

                  {/* 부서장업무메뉴얼관리 */}
                  <Route path="department-manuals" element={
                    <TemporaryPage
                      title="부서장업무메뉴얼 관리"
                      description="부서장을 위한 업무 메뉴얼을 관리하는 페이지입니다."
                    />
                  } />
                  <Route path="department-manuals/:id" element={
                    <TemporaryPage
                      title="부서장메뉴얼 상세"
                      description="부서장 업무 메뉴얼의 상세 내용을 확인하는 페이지입니다."
                    />
                  } />
                  <Route path="department-manuals/create" element={
                    <TemporaryPage
                      title="부서장메뉴얼 작성"
                      description="새로운 부서장 업무 메뉴얼을 작성하는 페이지입니다."
                    />
                  } />
                  <Route path="department-manuals/:id/edit" element={
                    <TemporaryPage
                      title="부서장메뉴얼 편집"
                      description="기존 부서장 업무 메뉴얼을 편집하는 페이지입니다."
                    />
                  } />

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
              <Routes>
                <Route index element={
                  <TemporaryPage 
                    title="보고서" 
                    description="리스크 보고서 생성, 스케줄링, 히스토리 관리 등의 기능이 구현될 예정입니다."
                  />
                } />
                <Route path="create" element={
                  <TemporaryPage 
                    title="보고서 생성" 
                    description="새로운 보고서를 생성하고 설정하는 페이지입니다."
                  />
                } />
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
                <Route path=":id/*" element={
                  <TemporaryPage 
                    title="보고서 상세" 
                    description="개별 보고서의 상세 내용과 생성 옵션을 관리하는 페이지입니다."
                  />
                } />
              </Routes>
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