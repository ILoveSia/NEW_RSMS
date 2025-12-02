/**
 * 결재선 관리 페이지
 *
 * @description 결재선을 등록, 수정, 삭제하는 관리 페이지
 * - DeliberativeMgmt 패턴 100% 준수
 * - BasePageHeader 공통 컴포넌트 사용
 * - 컬럼 정의 분리 (components/ApprovalLineDataGrid)
 * - 8가지 브랜드 테마 지원
 * - 백엔드 API 연동
 *
 * @author Claude AI
 * @since 2025-12-02
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from '@/shared/utils/toast';

// Icons - tree-shaking 최적화
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import styles from './ApprovalLine.module.scss';

// Types
import type {
  ApprovalLine as ApprovalLineType,
  ApprovalLineFilters,
  ApprovalLineFormData,
  ApprovalLineModalState,
  ApprovalLineStep,
  ApprovalLineStatistics
} from './types/approvalLine.types';
import { WORK_TYPE_OPTIONS } from './types/approvalLine.types';

// API
import {
  getAllApprovalLines,
  searchApprovalLines,
  getApprovalLine,
  createApprovalLine,
  updateApprovalLine,
  deleteApprovalLines,
  getApprovalLineStatistics,
  type ApprovalLineDto,
  type CreateApprovalLineStepRequest
} from '@/domains/approval/api/approvalLineApi';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';

// 컬럼 정의 - 별도 파일에서 import (DeliberativeMgmt 패턴)
import { createApprovalLineColumns } from './components/ApprovalLineDataGrid/approvalLineColumns';

// 결재선 상세 모달 (Lazy loading)
const ApprovalLineDetailModal = React.lazy(() =>
  import('./components/ApprovalLineDetailModal/ApprovalLineDetailModal')
);

interface ApprovalLineProps {
  className?: string;
}

/**
 * 백엔드 DTO → 프론트엔드 타입 변환
 */
const mapDtoToApprovalLine = (dto: ApprovalLineDto): ApprovalLineType => ({
  id: dto.approvalLineId,
  sequence: dto.sequence || 0,
  name: dto.approvalLineName,
  workType: dto.workTypeCd,
  workTypeName: dto.workTypeName,
  popupTitle: dto.popupTitle || '',
  isEditable: (dto.isEditable as 'Y' | 'N') || 'Y',
  isUsed: (dto.isUsed as 'Y' | 'N') || 'Y',
  remarks: dto.remarks || '',
  steps: dto.steps?.map(step => ({
    id: String(step.approvalLineStepId),
    approvalLineId: step.approvalLineId,
    stepOrder: step.stepOrder,
    stepName: step.stepName,
    approvalTypeCd: step.approvalTypeCd,
    approvalTypeName: step.approvalTypeName,
    approverTypeCd: step.approverTypeCd,
    approverTypeName: step.approverTypeName,
    approverId: step.approverId,
    approverName: step.approverName,
    isRequired: step.isRequired,
    remarks: step.remarks
  })),
  createdAt: dto.createdAt || '',
  updatedAt: dto.updatedAt || '',
  createdBy: dto.createdBy || '',
  updatedBy: dto.updatedBy || ''
});

/**
 * 결재선 관리 페이지 컴포넌트
 */
const ApprovalLine: React.FC<ApprovalLineProps> = ({ className }) => {
  const { t } = useTranslation('approval');

  // AG-Grid 컬럼 정의 (DeliberativeMgmt 패턴 - 함수 형태로 생성)
  const approvalLineColumns = useMemo(() =>
    createApprovalLineColumns(),
    []
  );

  // State
  const [approvalLines, setApprovalLines] = useState<ApprovalLineType[]>([]);
  const [selectedApprovalLines, setSelectedApprovalLines] = useState<ApprovalLineType[]>([]);
  const [loading, setLoading] = useState(false);

  // 통계 상태
  const [statistics, setStatistics] = useState<ApprovalLineStatistics>({
    total: 0,
    used: 0,
    unused: 0
  });

  // 개별 로딩 상태 (DeliberativeMgmt 패턴)
  const [loadingStates, setLoadingStates] = useState({
    search: false,
    excel: false,
    delete: false
  });

  // 필터 상태
  const [filters, setFilters] = useState<ApprovalLineFilters>({
    workType: '',
    searchKeyword: '',
    isUsed: ''
  });

  // 모달 상태
  const [modalState, setModalState] = useState<ApprovalLineModalState>({
    open: false,
    mode: 'create',
    itemData: null
  });

  /**
   * 결재선 목록 조회 (초기 로드 및 새로고침)
   */
  const fetchApprovalLines = useCallback(async () => {
    setLoading(true);
    try {
      const [linesData, statsData] = await Promise.all([
        getAllApprovalLines(),
        getApprovalLineStatistics()
      ]);

      setApprovalLines(linesData.map(mapDtoToApprovalLine));
      setStatistics(statsData);
    } catch (error) {
      console.error('결재선 목록 조회 실패:', error);
      toast.error('결재선 목록 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchApprovalLines();
  }, [fetchApprovalLines]);

  // BasePageHeader용 통계 데이터 (DeliberativeMgmt 패턴)
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '전체 결재선',
      color: 'primary' as const
    },
    {
      icon: <CheckCircleIcon />,
      value: statistics.used,
      label: '사용중',
      color: 'success' as const
    },
    {
      icon: <CancelIcon />,
      value: statistics.unused,
      label: '미사용',
      color: 'default' as const
    }
  ], [statistics]);

  /**
   * 검색 핸들러
   */
  const handleSearch = useCallback(async () => {
    setLoading(true);
    setLoadingStates(prev => ({ ...prev, search: true }));

    const loadingToastId = toast.loading('결재선 정보를 검색 중입니다...');

    try {
      const searchData = await searchApprovalLines({
        workTypeCd: filters.workType || undefined,
        isUsed: filters.isUsed || undefined,
        keyword: filters.searchKeyword || undefined
      });

      setApprovalLines(searchData.map(mapDtoToApprovalLine));

      // 통계 갱신
      const statsData = await getApprovalLineStatistics();
      setStatistics(statsData);

      toast.update(loadingToastId, 'success', `${searchData.length}건의 결재선을 조회했습니다.`);
    } catch (error) {
      toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
      setLoadingStates(prev => ({ ...prev, search: false }));
    }
  }, [filters]);

  /**
   * 필터 초기화 핸들러
   */
  const handleClearFilters = useCallback(() => {
    setFilters({
      workType: '',
      searchKeyword: '',
      isUsed: ''
    });
    fetchApprovalLines();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [fetchApprovalLines]);

  /**
   * 등록 버튼 핸들러
   */
  const handleAdd = useCallback(() => {
    setModalState({
      open: true,
      mode: 'create',
      itemData: null
    });
  }, []);

  /**
   * 엑셀 다운로드 핸들러
   */
  const handleExcelDownload = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, excel: true }));

    const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

    try {
      // TODO: 실제 엑셀 다운로드 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
      console.log('결재선 엑셀 다운로드 완료');
    } catch (error) {
      toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
      console.error('엑셀 다운로드 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, excel: false }));
    }
  }, []);

  /**
   * 행 클릭 핸들러 (상세 모달 열기)
   */
  const handleRowClick = useCallback(async (approvalLine: ApprovalLineType) => {
    try {
      // 상세 조회 API 호출 (단계 포함)
      const detailData = await getApprovalLine(approvalLine.id);
      const mappedData = mapDtoToApprovalLine(detailData);

      setModalState({
        open: true,
        mode: 'detail',
        itemData: mappedData
      });
    } catch (error) {
      console.error('결재선 상세 조회 실패:', error);
      toast.error('결재선 상세 조회에 실패했습니다.');
    }
  }, []);

  /**
   * 행 더블클릭 핸들러
   */
  const handleRowDoubleClick = useCallback((approvalLine: ApprovalLineType) => {
    handleRowClick(approvalLine);
  }, [handleRowClick]);

  /**
   * 선택 변경 핸들러
   */
  const handleSelectionChange = useCallback((selected: ApprovalLineType[]) => {
    setSelectedApprovalLines(selected);
  }, []);

  /**
   * 삭제 핸들러
   */
  const handleDelete = useCallback(async () => {
    if (selectedApprovalLines.length === 0) {
      toast.warning('삭제할 결재선을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택된 ${selectedApprovalLines.length}개의 결재선을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, delete: true }));

    const loadingToastId = toast.loading(`${selectedApprovalLines.length}개 결재선을 삭제 중입니다...`);

    try {
      const deleteIds = selectedApprovalLines.map(line => line.id);
      await deleteApprovalLines(deleteIds);

      setSelectedApprovalLines([]);

      // 목록 및 통계 새로고침
      await fetchApprovalLines();

      toast.update(loadingToastId, 'success', `${selectedApprovalLines.length}개 결재선이 삭제되었습니다.`);
    } catch (error) {
      toast.update(loadingToastId, 'error', '결재선 삭제에 실패했습니다.');
      console.error('결재선 삭제 실패:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  }, [selectedApprovalLines, fetchApprovalLines]);

  /**
   * 모달 닫기 핸들러
   */
  const handleModalClose = useCallback(() => {
    setModalState({
      open: false,
      mode: 'create',
      itemData: null
    });
  }, []);

  /**
   * 저장 핸들러
   * - 결재선 기본 정보와 결재 단계(steps)를 함께 저장
   */
  const handleSave = useCallback(async (formData: ApprovalLineFormData, steps: ApprovalLineStep[]) => {
    const loadingToastId = toast.loading(
      modalState.mode === 'create' ? '결재선을 등록 중입니다...' : '결재선을 수정 중입니다...'
    );

    try {
      // 단계 데이터 변환
      const stepsRequest: CreateApprovalLineStepRequest[] = steps.map((step, index) => ({
        stepOrder: index + 1,
        stepName: step.stepName,
        approvalTypeCd: step.approvalTypeCd,
        approverTypeCd: step.approverTypeCd,
        approverId: step.approverId,
        approverName: step.approverName,
        isRequired: step.isRequired as string,
        remarks: step.remarks
      }));

      if (modalState.mode === 'create') {
        // 결재선 생성 API 호출
        await createApprovalLine({
          approvalLineName: formData.name,
          workTypeCd: formData.workType,
          popupTitle: formData.popupTitle,
          isEditable: formData.isEditable,
          remarks: formData.remarks,
          steps: stepsRequest
        });

        toast.update(loadingToastId, 'success', `결재선이 등록되었습니다. (${steps.length}개 단계)`);
      } else {
        // 결재선 수정 API 호출
        await updateApprovalLine(modalState.itemData!.id, {
          approvalLineName: formData.name,
          popupTitle: formData.popupTitle,
          isEditable: formData.isEditable,
          remarks: formData.remarks,
          steps: stepsRequest
        });

        toast.update(loadingToastId, 'success', `결재선이 수정되었습니다. (${steps.length}개 단계)`);
      }

      handleModalClose();

      // 목록 새로고침
      await fetchApprovalLines();
    } catch (error) {
      toast.update(loadingToastId, 'error', '저장 중 오류가 발생했습니다.');
      console.error('저장 실패:', error);
    }
  }, [modalState, handleModalClose, fetchApprovalLines]);

  // 검색 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'searchKeyword',
      type: 'text',
      label: '검색어',
      placeholder: '결재선명, Popup 제목 검색',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'workType',
      type: 'select',
      label: '업무구분',
      options: WORK_TYPE_OPTIONS,
      gridSize: { xs: 12, sm: 6, md: 2 }
    },
    {
      key: 'isUsed',
      type: 'select',
      label: '사용여부',
      options: [
        { value: '', label: '전체' },
        { value: 'Y', label: '사용' },
        { value: 'N', label: '미사용' }
      ],
      gridSize: { xs: 12, sm: 6, md: 2 }
    }
  ], []);

  // 액션 버튼 정의 (DeliberativeMgmt 패턴)
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excel',
      type: 'excel',
      onClick: handleExcelDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    },
    {
      key: 'add',
      type: 'add',
      label: '등록',
      onClick: handleAdd
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDelete,
      disabled: selectedApprovalLines.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelDownload, handleAdd, handleDelete, selectedApprovalLines.length, loadingStates]);

  // 상태 정보 정의 (DeliberativeMgmt 패턴)
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '사용',
      value: statistics.used,
      color: 'success',
      icon: <CheckCircleIcon />
    },
    {
      label: '미사용',
      value: statistics.unused,
      color: 'default',
      icon: <CancelIcon />
    }
  ], [statistics]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 공통 페이지 헤더 (DeliberativeMgmt 패턴) */}
      <BasePageHeader
        icon={<AccountTreeIcon />}
        title={t('approvalLine.management.title', '결재선 관리')}
        description={t('approvalLine.management.description', '시스템에서 사용할 결재선을 등록하고 관리합니다')}
        statistics={headerStatistics}
        i18nNamespace="approval"
      />

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 공통 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => setFilters(values as unknown as ApprovalLineFilters)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={loading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 결재선 수"
          selectedCount={selectedApprovalLines.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={loading}
        />

        {/* 공통 데이터 그리드 */}
        <BaseDataGrid
          data={approvalLines}
          columns={approvalLineColumns}
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
          suppressHorizontalScroll={false}
          suppressColumnVirtualisation={false}
        />
      </div>

      {/* 결재선 등록/상세 모달 - BaseModalWrapper 적용 (DeliberativeMgmt 패턴) */}
      <BaseModalWrapper
        isOpen={modalState.open}
        onClose={handleModalClose}
        ariaLabel="결재선 관리 모달"
        fallbackComponent={<LoadingSpinner text="결재선 모달을 불러오는 중..." />}
      >
        <ApprovalLineDetailModal
          open={modalState.open}
          mode={modalState.mode}
          itemData={modalState.itemData}
          onClose={handleModalClose}
          onSave={handleSave}
          onUpdate={handleSave}
          onRefresh={fetchApprovalLines}
          loading={loading}
        />
      </BaseModalWrapper>
    </div>
  );
};

export default React.memo(ApprovalLine);
