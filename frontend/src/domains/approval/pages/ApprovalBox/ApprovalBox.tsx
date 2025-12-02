/**
 * 결재함 관리 페이지
 *
 * @description 결재 문서를 조회하고 처리하는 페이지
 * - PositionMgmt.tsx 표준 템플릿 100% 준수
 * - ApprovalLine 패턴을 따라 컬럼 정의를 별도 파일로 분리
 * - 간소화된 탭 기반 UI (기안함, 결재대기함, 결재완료함)
 * - 8가지 브랜드 테마 지원
 * - 실제 API 연동으로 결재 승인/반려 처리
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from '@/shared/utils/toast';

// API 함수들 import
import {
  getDraftBox,
  getPendingBox,
  getCompletedBox,
  getApprovalBoxCount,
  searchDraftBox,
  searchPendingBox,
  batchApprove,
  batchReject,
  type ApprovalDto,
  type ApprovalSearchRequest
} from '@/domains/approval/api/approvalApi';

// Icons - tree-shaking 최적화
import InboxIcon from '@mui/icons-material/Inbox';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Tabs, Tab, Box, Chip } from '@mui/material';

import styles from './ApprovalBox.module.scss';

// Types
import type { Approval, ApprovalBoxFilters, ApprovalStatus } from './types/approvalBox.types';

// 컬럼 정의 - ApprovalLine 패턴을 따라 별도 파일에서 import
import { createApprovalBoxColumns } from './components/ApprovalBoxDataGrid';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// 결재 상세 모달 (Lazy loading)
const ApprovalDetailModal = React.lazy(() =>
  import('./components/ApprovalDetailModal/ApprovalDetailModal')
);

/**
 * 탭 타입 정의
 * - draft: 기안함 (내가 기안한 문서)
 * - pending: 결재대기함 (내가 결재할 문서)
 * - completed: 결재완료함 (결재 완료된 문서)
 */
type TabType = 'draft' | 'pending' | 'completed';


interface ApprovalBoxProps {
  className?: string;
}

/**
 * 결재함 관리 페이지 컴포넌트
 */
const ApprovalBox: React.FC<ApprovalBoxProps> = ({ className }) => {
  // 다국어 지원을 위한 hook (추후 활용)
  useTranslation('approval');

  // State
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [selectedApprovals, setSelectedApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState<ApprovalBoxFilters>({
    startDate: '',
    endDate: '',
    workType: '',
    department: '',
    approvalStatus: '',
    keyword: ''
  });

  // 모달 상태
  const [modalState, setModalState] = useState({
    open: false,
    mode: 'detail' as 'create' | 'detail',
    selectedItem: null as Approval | null
  });

  // 탭별 카운트 (API에서 조회)
  const [tabCounts, setTabCounts] = useState({
    draft: 0,
    pending: 0,
    completed: 0
  });

  /**
   * ApprovalDto를 Approval 타입으로 변환
   * - API 응답 데이터를 UI에서 사용하는 형태로 매핑
   * - 백엔드 ApprovalDto 필드명에 맞게 매핑
   */
  const mapApprovalDtoToApproval = useCallback((dto: any, index: number): Approval => {
    // 업무구분 코드를 한글 라벨로 변환
    const workTypeMap: Record<string, string> = {
      'WRS': '책무구조도',
      'RESP': '책무구조',
      'IMPL': '이행점검',
      'IMPROVE': '개선이행'
    };

    // 결재상태 코드 매핑 (백엔드: 01~05)
    const statusMap: Record<string, ApprovalStatus> = {
      '01': 'DRAFT',      // 기안
      '02': 'PROGRESS',   // 진행중
      '03': 'APPROVED',   // 완료
      '04': 'REJECTED',   // 반려
      '05': 'DRAFT',      // 회수
      'DRAFT': 'DRAFT',
      'PENDING': 'PENDING',
      'PROGRESS': 'PROGRESS',
      'APPROVED': 'APPROVED',
      'REJECTED': 'REJECTED'
    };

    // 날짜 포맷팅 헬퍼 함수
    const formatDate = (dateValue: string | null | undefined): string => {
      if (!dateValue) return '';
      // LocalDateTime 형식 (2025-12-02T10:30:00) 또는 날짜 형식 처리
      if (typeof dateValue === 'string') {
        return dateValue.substring(0, 10);
      }
      return '';
    };

    return {
      id: dto.approvalId,
      sequence: index + 1,
      approvalId: dto.approvalNo || dto.approvalId,
      workType: workTypeMap[dto.workTypeCd] || dto.workTypeName || dto.workTypeCd || '',
      content: dto.title || '',
      approvalStatus: statusMap[dto.approvalStatusCd] || 'PENDING',
      approvalSchedule: `${dto.currentStep || 0}/${dto.totalSteps || 0}`,
      drafter: dto.drafterName || '',
      draftDate: formatDate(dto.draftDate),
      approver: dto.currentApproverName || '',
      approveDate: formatDate(dto.completedDate),
      currentStep: dto.currentStep,
      totalSteps: dto.totalSteps,
      department: dto.drafterDeptName || ''
    };
  }, []);

  /**
   * 결재함 데이터 조회
   * - 탭에 따라 다른 API 호출
   */
  const fetchApprovals = useCallback(async (tab: TabType) => {
    setLoading(true);
    try {
      let data: ApprovalDto[] = [];

      switch (tab) {
        case 'draft':
          data = await getDraftBox();
          break;
        case 'pending':
          data = await getPendingBox();
          break;
        case 'completed':
          data = await getCompletedBox();
          break;
      }

      console.log(`[결재함] ${tab} 탭 API 응답:`, data); // 디버그 로그

      // API 응답을 UI 형태로 변환
      const mappedData = data.map((dto, index) => mapApprovalDtoToApproval(dto, index));
      console.log(`[결재함] 변환된 데이터:`, mappedData); // 디버그 로그
      setApprovals(mappedData);
    } catch (error) {
      console.error('결재함 조회 실패:', error);
      toast.error('결재함 조회에 실패했습니다.');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [mapApprovalDtoToApproval]);

  /**
   * 결재함 건수 조회
   */
  const fetchTabCounts = useCallback(async () => {
    try {
      const counts = await getApprovalBoxCount();
      setTabCounts({
        draft: counts.draft,
        pending: counts.pending,
        completed: counts.completed
      });
    } catch (error) {
      console.error('결재함 건수 조회 실패:', error);
    }
  }, []);

  /**
   * 초기 데이터 로딩
   */
  useEffect(() => {
    fetchApprovals(activeTab);
    fetchTabCounts();
  }, [activeTab, fetchApprovals, fetchTabCounts]);

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
    setSelectedApprovals([]);
  }, []);

  /**
   * 검색 핸들러
   * - 탭에 따라 기안함/결재대기함 검색 API 호출
   */
  const handleSearch = useCallback(async () => {
    setSearchLoading(true);
    try {
      // 검색 요청 파라미터 생성
      const searchRequest: ApprovalSearchRequest = {
        workTypeCd: filters.workType || undefined,
        keyword: filters.keyword || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };

      let data: ApprovalDto[] = [];

      // 탭에 따라 검색 API 호출
      switch (activeTab) {
        case 'draft':
          data = await searchDraftBox(searchRequest);
          break;
        case 'pending':
          data = await searchPendingBox(searchRequest);
          break;
        case 'completed':
          // 완료함은 별도 검색 API가 없으므로 전체 조회 후 클라이언트 필터링
          data = await getCompletedBox();
          if (filters.keyword) {
            const keyword = filters.keyword;
            data = data.filter((item: any) =>
              item.title?.includes(keyword) ||
              item.drafterName?.includes(keyword)
            );
          }
          if (filters.workType) {
            const workType = filters.workType;
            data = data.filter((item: any) => item.workTypeCd === workType);
          }
          break;
      }

      console.log(`[결재함] ${activeTab} 검색 결과:`, data);

      // API 응답을 UI 형태로 변환
      const mappedData = data.map((dto, index) => mapApprovalDtoToApproval(dto, index));
      setApprovals(mappedData);
      toast.success(`${mappedData.length}건이 검색되었습니다.`);
    } catch (error) {
      console.error('검색 실패:', error);
      toast.error('검색 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  }, [filters, activeTab, mapApprovalDtoToApproval]);

  /**
   * 필터 초기화 핸들러
   */
  const handleClearFilters = useCallback(() => {
    setFilters({
      startDate: '',
      endDate: '',
      workType: '',
      department: '',
      approvalStatus: '',
      keyword: ''
    });
    toast.info('검색 조건이 초기화되었습니다.');
  }, []);

  /**
   * 행 더블클릭 핸들러
   */
  const handleRowDoubleClick = useCallback((approval: Approval) => {
    setModalState({
      open: true,
      mode: 'detail',
      selectedItem: approval
    });
  }, []);

  /**
   * 결재처리 핸들러 (일괄 승인)
   * - 선택된 문서들을 일괄 승인 처리
   */
  const handleApprove = useCallback(async () => {
    if (selectedApprovals.length === 0) {
      toast.warning('결재할 문서를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const approvalIds = selectedApprovals.map(a => a.id);
      const result = await batchApprove(approvalIds, '일괄 승인');

      if (result.success > 0) {
        toast.success(`${result.success}건이 승인되었습니다.`);
      }
      if (result.fail > 0) {
        toast.warning(`${result.fail}건 처리 실패`);
      }

      // 데이터 새로고침
      setSelectedApprovals([]);
      await fetchApprovals(activeTab);
      await fetchTabCounts();
    } catch (error) {
      console.error('결재 승인 실패:', error);
      toast.error('결재 승인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedApprovals, activeTab, fetchApprovals, fetchTabCounts]);

  /**
   * 반려 핸들러 (일괄 반려)
   * - 선택된 문서들을 일괄 반려 처리
   */
  const handleReject = useCallback(async () => {
    if (selectedApprovals.length === 0) {
      toast.warning('반려할 문서를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const approvalIds = selectedApprovals.map(a => a.id);
      const result = await batchReject(approvalIds, '일괄 반려');

      if (result.success > 0) {
        toast.success(`${result.success}건이 반려되었습니다.`);
      }
      if (result.fail > 0) {
        toast.warning(`${result.fail}건 처리 실패`);
      }

      // 데이터 새로고침
      setSelectedApprovals([]);
      await fetchApprovals(activeTab);
      await fetchTabCounts();
    } catch (error) {
      console.error('결재 반려 실패:', error);
      toast.error('결재 반려에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedApprovals, activeTab, fetchApprovals, fetchTabCounts]);

  /**
   * 모달에서 결재 처리 후 데이터 새로고침
   * - ApprovalDetailModal에서 승인/반려 처리 후 호출
   */
  const handleRefresh = useCallback(async () => {
    await fetchApprovals(activeTab);
    await fetchTabCounts();
  }, [activeTab, fetchApprovals, fetchTabCounts]);

  // 검색 필드 정의 (간소화)
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'keyword',
      type: 'text',
      label: '검색어',
      placeholder: '제목, 기안자, 결재자 검색',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'workType',
      type: 'select',
      label: '업무구분',
      options: [
        { value: '', label: '전체' },
        { value: 'RESP', label: '책무구조' },
        { value: 'IMPL', label: '이행점검' },
        { value: 'IMPROVE', label: '개선이행' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'startDate',
      type: 'date',
      label: '시작일',
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'endDate',
      type: 'date',
      label: '종료일',
      gridSize: { xs: 12, sm: 6, md: 2 }
    }
  ], []);

  // 액션 버튼 정의 (탭에 따라 다름)
  const actionButtons = useMemo<ActionButton[]>(() => {
    const baseButtons: ActionButton[] = [
      {
        key: 'excel',
        type: 'excel',
        label: '엑셀다운로드',
        variant: 'contained',
        color: 'primary',
        onClick: () => toast.info('엑셀 다운로드'),
        disabled: loading
      }
    ];

    // 결재대기함일 때만 결재/반려 버튼 추가
    if (activeTab === 'pending') {
      const pendingButtons: ActionButton[] = [
        ...baseButtons,
        {
          key: 'approve',
          type: 'custom',
          label: '결재',
          variant: 'contained',
          color: 'success',
          onClick: handleApprove,
          disabled: loading || selectedApprovals.length === 0
        },
        {
          key: 'reject',
          type: 'custom',
          label: '반려',
          variant: 'contained',
          color: 'error',
          onClick: handleReject,
          disabled: loading || selectedApprovals.length === 0
        }
      ];
      return pendingButtons;
    }

    return baseButtons;
  }, [activeTab, loading, selectedApprovals.length, handleApprove, handleReject]);

  // 상태 정보
  const statusInfo = useMemo<StatusInfo[]>(() => [
    { label: '기안', value: tabCounts.draft.toString(), color: 'default' },
    { label: '대기', value: tabCounts.pending.toString(), color: 'warning' },
    { label: '완료', value: tabCounts.completed.toString(), color: 'success' }
  ], [tabCounts]);

  /**
   * 그리드 컬럼 정의
   * - ApprovalLine 패턴을 따라 별도 파일에서 생성 함수 호출
   * - useMemo로 메모이제이션하여 불필요한 리렌더링 방지
   */
  const approvalColumns = useMemo(() =>
    createApprovalBoxColumns(undefined, handleRowDoubleClick),
    [handleRowDoubleClick]
  );

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 - PositionMgmt 표준 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <InboxIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>결재함 관리</h1>
              <p className={styles.pageDescription}>
                결재 문서를 조회하고 처리합니다
              </p>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><SendIcon /></div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{tabCounts.draft}</div>
                <div className={styles.statLabel}>기안함</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><HourglassEmptyIcon /></div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{tabCounts.pending}</div>
                <div className={styles.statLabel}>결재대기</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><DoneAllIcon /></div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{tabCounts.completed}</div>
                <div className={styles.statLabel}>완료</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        {/* 탭 메뉴 */}
        <Box className={styles.tabContainer}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="standard"
            className={styles.tabs}
          >
            <Tab
              value="draft"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SendIcon fontSize="small" />
                  <span>기안함</span>
                  <Chip label={tabCounts.draft} size="small" color="default" />
                </Box>
              }
            />
            <Tab
              value="pending"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HourglassEmptyIcon fontSize="small" />
                  <span>결재대기함</span>
                  <Chip label={tabCounts.pending} size="small" color="warning" />
                </Box>
              }
            />
            <Tab
              value="completed"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DoneAllIcon fontSize="small" />
                  <span>결재완료함</span>
                  <Chip label={tabCounts.completed} size="small" color="success" />
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => setFilters(values as unknown as ApprovalBoxFilters)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={searchLoading}
          showClearButton={true}
        />

        {/* 액션 바 */}
        <BaseActionBar
          totalCount={approvals.length}
          totalLabel="총 결재 수"
          selectedCount={selectedApprovals.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 데이터 그리드 */}
        <BaseDataGrid
          data={approvals}
          columns={approvalColumns}
          loading={loading}
          theme="alpine"
          onRowDoubleClick={handleRowDoubleClick}
          onSelectionChange={setSelectedApprovals}
          height="calc(100vh - 450px)"
          pagination={true}
          pageSize={20}
          rowSelection="multiple"
          checkboxSelection={true}
          headerCheckboxSelection={true}
        />
      </div>

      {/* 상세 모달 */}
      <React.Suspense fallback={<LoadingSpinner />}>
        {modalState.open && (
          <ApprovalDetailModal
            open={modalState.open}
            mode={modalState.mode}
            itemData={modalState.selectedItem}
            onClose={() => setModalState(prev => ({ ...prev, open: false }))}
            onSave={() => {}}
            onUpdate={() => {}}
            onRefresh={handleRefresh}
            loading={loading}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export default React.memo(ApprovalBox);
