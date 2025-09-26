// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AccessLog.module.scss';

// Types
import type {
  AccessLog,
  AccessLogFilters,
  AccessLogFormData,
  AccessLogPagination,
  AccessLogStatistics
} from './types/accessLog.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import usePagination from '@/shared/hooks/usePagination';
import useFilters from '@/shared/hooks/useFilters';

// AccessLog specific components
import { accessLogColumns, accessTargetOptions } from './config/accessLogColumns';

// Lazy-loaded components for performance optimization
const AccessLogDetailModal = React.lazy(() =>
  import('./components/AccessLogDetailModal').then(module => ({ default: module.default }))
);

interface AccessLogMgmtProps {
  className?: string;
}

const AccessLog: React.FC<AccessLogMgmtProps> = ({ className }) => {
  const { t } = useTranslation('system');

  // State Management
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<AccessLog[]>([]);

  // Custom Hooks
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: { key: 'accesslog-search' },
    excel: { key: 'accesslog-excel' }
  });

  const { pagination, goToPage, changePageSize, updateTotal } = usePagination({
    initialPage: 1,
    initialSize: 20,
    total: 0
  });

  const {
    filters,
    setFilter,
    clearFilters,
    hasFilters
  } = useFilters<AccessLogFilters>({
    accessTarget: '',
    startDate: '',
    endDate: '',
    employeeNo: '',
    ipAddress: '',
    menuName: '',
    fullName: ''
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<AccessLogFilters>) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      setFilter(key as keyof AccessLogFilters, value);
    });
  }, [setFilter]);

  const handleExcelDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // TODO: 실제 엑셀 다운로드 API 호출
        await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
        console.log('엑셀 다운로드 완료');
      },
      {
        loading: '엑셀 파일을 생성 중입니다...',
        success: '엑셀 파일이 다운로드되었습니다.',
        error: '엑셀 다운로드에 실패했습니다.'
      }
    );
  }, [handlers.excel]);

  const handleLogDetail = useCallback((log: AccessLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedLog(null);
  }, []);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // TODO: 실제 API 호출로 교체
        await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
        console.log('검색 필터:', filters);
      },
      {
        loading: '접근로그 정보를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [filters, handlers.search]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters]);

  // Grid Event Handlers
  const handleRowClick = useCallback((log: AccessLog) => {
    console.log('행 클릭:', log);
  }, []);

  const handleRowDoubleClick = useCallback((log: AccessLog) => {
    handleLogDetail(log);
  }, [handleLogDetail]);

  const handleSelectionChange = useCallback((selected: AccessLog[]) => {
    setSelectedLogs(selected);
    console.log('선택된 행:', selected.length);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const todayLogs = accessLogs.filter(log => {
      const today = new Date().toDateString();
      return new Date(log.logDateTime).toDateString() === today;
    }).length;
    const activeUsers = new Set(accessLogs.map(log => log.userId).filter(Boolean)).size;
    const uniqueIpCount = new Set(accessLogs.map(log => log.ipAddress).filter(Boolean)).size;

    return {
      total,
      todayLogs,
      activeUsers,
      uniqueIpCount
    };
  }, [pagination.total, accessLogs]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 로그',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.todayLogs,
      label: '오늘 로그',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: statistics.activeUsers,
      label: '활성 사용자',
      color: 'warning' as const
    }
  ], [statistics]);

  // Filtered logs for display (성능 최적화)
  const displayLogs = useMemo(() => {
    return accessLogs; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [accessLogs]);

  // BaseSearchFilter용 필드 정의 (한 줄 배치)
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'accessTarget',
      type: 'select',
      label: '접근대상',
      options: accessTargetOptions,
      gridSize: { xs: 6, sm: 4, md: 1.7 }
    },
    {
      key: 'startDate',
      type: 'date',
      label: '시작일',
      gridSize: { xs: 6, sm: 4, md: 1.4 }
    },
    {
      key: 'endDate',
      type: 'date',
      label: '종료일',
      gridSize: { xs: 6, sm: 4, md: 1.4 }
    },
    {
      key: 'employeeNo',
      type: 'text',
      label: '직번',
      placeholder: '직번',
      gridSize: { xs: 6, sm: 3, md: 1.2 }
    },
    {
      key: 'ipAddress',
      type: 'text',
      label: '접근IP',
      placeholder: 'IP 주소',
      gridSize: { xs: 6, sm: 3, md: 1.5 }
    },
    {
      key: 'menuName',
      type: 'text',
      label: '메뉴명',
      placeholder: '메뉴명',
      gridSize: { xs: 6, sm: 3, md: 1.4 }
    },
    {
      key: 'fullName',
      type: 'text',
      label: '성명',
      placeholder: '성명',
      gridSize: { xs: 6, sm: 3, md: 1.2 }
    }
  ], []);

  // BaseActionBar용 액션 버튼 정의
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      type: 'excel',
      onClick: handleExcelDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    }
  ], [handleExcelDownload, loadingStates]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '오늘 로그',
      value: statistics.todayLogs,
      color: 'primary',
      icon: <TrendingUpIcon />
    },
    {
      label: '활성 사용자',
      value: statistics.activeUsers,
      color: 'success',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // 성능 모니터링 함수
  const onRenderProfiler = useCallback((
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 AccessLog Performance Profiler`);
      console.log(`📊 Phase: ${phase}`);
      console.log(`⏱️ Actual Duration: ${actualDuration.toFixed(2)}ms`);
      console.log(`📏 Base Duration: ${baseDuration.toFixed(2)}ms`);
      console.log(`🚀 Start Time: ${startTime.toFixed(2)}ms`);
      console.log(`✅ Commit Time: ${commitTime.toFixed(2)}ms`);

      if (actualDuration > 16) { // 60fps 기준 16ms 초과 시 경고
        console.warn(`⚠️ 성능 주의: 렌더링 시간이 16ms를 초과했습니다 (${actualDuration.toFixed(2)}ms)`);
      }
      console.groupEnd();
    }
  }, []);

  // Web Performance API를 활용한 페이지 로드 성능 측정
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const measurePageLoad = () => {
        if (performance.getEntriesByType) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            console.group(`📊 Page Load Performance`);
            console.log(`🌐 DNS 조회: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
            console.log(`🔗 연결 시간: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
            console.log(`📥 응답 시간: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
            console.log(`🎨 DOM 로딩: ${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`);
            console.log(`🏁 전체 로딩: ${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`);
            console.groupEnd();
          }
        }
      };

      // 페이지 로드 완료 후 측정
      if (document.readyState === 'complete') {
        measurePageLoad();
      } else {
        window.addEventListener('load', measurePageLoad);
        return () => window.removeEventListener('load', measurePageLoad);
      }
    }
  }, []);

  // Mock data loading
  React.useEffect(() => {
    // TODO: Replace with actual API call
    const mockAccessLogs: AccessLog[] = [
      {
        id: '1',
        logDateTime: '2024-09-24T09:15:30.000Z',
        logLevel: 'INFO',
        logCategory: 'USER_ACCESS',
        userId: 'user001',
        sessionId: 'sess_abc123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        employeeNo: 'FIT001',
        fullName: '홍길동',
        deptName: '기획팀',
        actionType: 'LOGIN',
        targetType: 'SYSTEM',
        targetId: 'login_page',
        message: '사용자 로그인 성공',
        details: { loginMethod: 'password' },
        executionTimeMs: 150,
        requestId: 'req_001',
        correlationId: 'corr_001',
        menuName: '로그인',
        accessTarget: '101'
      },
      {
        id: '2',
        logDateTime: '2024-09-24T09:20:15.000Z',
        logLevel: 'INFO',
        logCategory: 'MENU_ACCESS',
        userId: 'user002',
        sessionId: 'sess_def456',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
        employeeNo: 'FIT002',
        fullName: '김철수',
        deptName: '개발팀',
        actionType: 'VIEW',
        targetType: 'MENU',
        targetId: 'user_management',
        message: '사용자 관리 메뉴 접근',
        details: { menuPath: '/system/user-mgmt' },
        executionTimeMs: 85,
        requestId: 'req_002',
        correlationId: 'corr_002',
        menuName: '사용자관리',
        accessTarget: '102'
      },
      {
        id: '3',
        logDateTime: '2024-09-24T09:25:42.000Z',
        logLevel: 'WARN',
        logCategory: 'SECURITY',
        userId: 'user003',
        sessionId: 'sess_ghi789',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0',
        employeeNo: 'FIT003',
        fullName: '박영희',
        deptName: '보안팀',
        actionType: 'UNAUTHORIZED_ACCESS',
        targetType: 'API',
        targetId: 'admin_api',
        message: '권한 없는 API 접근 시도',
        details: { attemptedPath: '/api/admin/users' },
        executionTimeMs: 25,
        requestId: 'req_003',
        correlationId: 'corr_003',
        menuName: '관리자API',
        accessTarget: '103'
      },
      {
        id: '4',
        logDateTime: '2024-09-24T10:30:18.000Z',
        logLevel: 'INFO',
        logCategory: 'DATA_ACCESS',
        userId: 'user004',
        sessionId: 'sess_jkl012',
        ipAddress: '192.168.2.200',
        userAgent: 'Mozilla/5.0',
        employeeNo: 'FIT004',
        fullName: '이민수',
        deptName: '분석팀',
        actionType: 'EXPORT',
        targetType: 'DATA',
        targetId: 'access_log_export',
        message: '접근로그 데이터 엑셀 다운로드',
        details: { exportFormat: 'xlsx', recordCount: 1500 },
        executionTimeMs: 2500,
        requestId: 'req_004',
        correlationId: 'corr_004',
        menuName: '접근로그',
        accessTarget: '101'
      },
      {
        id: '5',
        logDateTime: '2024-09-24T11:15:05.000Z',
        logLevel: 'ERROR',
        logCategory: 'SYSTEM_ERROR',
        userId: 'user005',
        sessionId: 'sess_mno345',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0',
        employeeNo: 'FIT005',
        fullName: '정수진',
        deptName: '운영팀',
        actionType: 'SYSTEM_ACCESS',
        targetType: 'SYSTEM',
        targetId: 'monitoring_dashboard',
        message: '시스템 모니터링 대시보드 접근 오류',
        details: { errorCode: 'DB_CONNECTION_TIMEOUT' },
        executionTimeMs: 30000,
        requestId: 'req_005',
        correlationId: 'corr_005',
        menuName: '시스템모니터링',
        accessTarget: '102'
      }
    ];

    setAccessLogs(mockAccessLogs);
    setPagination(prev => ({
      ...prev,
      total: mockAccessLogs.length,
      totalPages: Math.ceil(mockAccessLogs.length / prev.size)
    }));
  }, []);

  return (
    <React.Profiler id="AccessLog" onRender={onRenderProfiler}>
      <div className={`${styles.container} ${className || ''}`}>
        {/* 🏗️ 공통 페이지 헤더 */}
        <BasePageHeader
          icon={<DashboardIcon />}
          title={t('accessLog.management.title', '접근로그 관리')}
          description={t('accessLog.management.description', '시스템 접근 기록을 모니터링하고 관리합니다')}
          statistics={headerStatistics}
          i18nNamespace="system"
        />

        {/* 🎨 메인 컨텐츠 영역 */}
        <div className={styles.content}>
          {/* 🔍 공통 검색 필터 */}
          <BaseSearchFilter
            fields={searchFields}
            values={filters as unknown as FilterValues}
            onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<AccessLogFilters>)}
            onSearch={handleSearch}
            onClear={handleClearFilters}
            loading={loading}
            searchLoading={loadingStates.search}
            showClearButton={true}
          />

          {/* 💎 공통 액션 바 */}
          <BaseActionBar
            totalCount={statistics.total}
            totalLabel="총 로그 수"
            selectedCount={selectedLogs.length}
            statusInfo={statusInfo}
            actions={actionButtons}
            loading={loading}
          />

          {/* 🎯 공통 데이터 그리드 */}
          <BaseDataGrid
            data={displayLogs}
            columns={accessLogColumns}
            loading={loading}
            theme="alpine"
            onRowClick={(data) => handleRowClick(data)}
            onRowDoubleClick={(data) => handleRowDoubleClick(data)}
            onSelectionChange={handleSelectionChange}
            height="calc(100vh - 370px)"
            pagination={true}
            pageSize={25}
            rowSelection="multiple"
            checkboxSelection={true}
            headerCheckboxSelection={true}
          />
        </div>

        {/* 접근로그 상세 모달 - BaseModalWrapper 적용 */}
        <BaseModalWrapper
          isOpen={detailModalOpen}
          onClose={handleModalClose}
          ariaLabel="접근로그 상세 모달"
          fallbackComponent={<LoadingSpinner text="접근로그 모달을 불러오는 중..." />}
        >
          <AccessLogDetailModal
            open={detailModalOpen}
            log={selectedLog}
            onClose={handleModalClose}
          />
        </BaseModalWrapper>
      </div>
    </React.Profiler>
  );
};

export default AccessLog;