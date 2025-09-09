/**
 * 애플리케이션 메인 라우터
 * Domain-Driven Design 구조와 권한 기반 라우팅 적용
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from '@/shared/components/templates/Layout';
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
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
          <TemporaryPage 
            title="인증 시스템" 
            description="로그인, 회원가입, 비밀번호 재설정 등의 인증 기능이 구현될 예정입니다."
          />
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

        {/* 메인 애플리케이션 라우트 (레이아웃 포함) */}
        <Route path="/" element={<Layout />}>
          {/* 홈페이지 - 대시보드로 리다이렉트 */}
          <Route index element={<Navigate to={routes.dashboard.main} replace />} />
          
          {/* 대시보드 (인증 필요) */}
          <Route path="/dashboard/*" element={
            <AuthGuard>
              <Routes>
                <Route index element={
                  <TemporaryPage 
                    title="RSMS 대시보드" 
                    description="리스크 관리 현황, 통계, 알림 등을 한눈에 볼 수 있는 대시보드가 구현될 예정입니다."
                  />
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
            </AuthGuard>
          } />

          {/* 리스크 관리 (인증 필요 - 핵심 도메인) */}
          <Route path="/risks/*" element={
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
          <Route path="/users/*" element={
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
          <Route path="/reports/*" element={
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
          <Route path="/settings/*" element={
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

          {/* 404 처리 */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;