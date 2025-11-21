/**
 * 책무상세관리 페이지
 * - 책무상세 정보 관리
 * - ResponsibilityMgmt 표준 템플릿 100% 준수
 *
 * @author Claude AI
 * @since 2025-01-06
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ResponsibilityDetailMgmt.module.scss'; // 자체 스타일 사용

// API
import {
  bulkCreateResponsibilityDetails,
  createResponsibilityDetail,
  deleteResponsibilityDetail,
  getAllResponsibilityDetails,
  getResponsibilityDetail,
  getResponsibilityDetailsByResponsibilityCd,
  updateResponsibilityDetail,
  type ResponsibilityDetailDto
} from '../../api/responsibilityDetailApi';

// Types
import type {
  ResponsibilityDetailGridRow
} from './components/ResponsibilityDetailDataGrid';
import type { ResponsibilityDetailFormData } from './components/ResponsibilityDetailFormModal/ResponsibilityDetailFormModal';

// Shared Components
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import { BaseSearchFilter, type FilterField } from '@/shared/components/organisms/BaseSearchFilter';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import useFilters from '@/shared/hooks/useFilters';
import usePagination from '@/shared/hooks/usePagination';

// ResponsibilityDetail specific components
import { convertToGridRow, createResponsibilityDetailColumns, isLastRowInGroup } from './components/ResponsibilityDetailDataGrid';
import ResponsibilityDetailExcelUploadModal from './components/ResponsibilityDetailExcelUploadModal/ResponsibilityDetailExcelUploadModal';
import ResponsibilityDetailFormModal from './components/ResponsibilityDetailFormModal/ResponsibilityDetailFormModal';

interface ResponsibilityDetailMgmtProps {
  className?: string;
}

/**
 * 책무상세 필터
 */
interface ResponsibilityDetailFilters {
  responsibilityCd: string;  // 책무코드
  responsibilityDetailInfo: string;  // 책무세부내용
  isActive: string;  // 사용여부
}

/**
 * 모달 상태
 */
interface ResponsibilityDetailModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedResponsibilityDetail: any | null;
}

const ResponsibilityDetailMgmt: React.FC<ResponsibilityDetailMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [responsibilityDetails, setResponsibilityDetails] = useState<ResponsibilityDetailGridRow[]>([]);
  const [selectedResponsibilityDetails, setSelectedResponsibilityDetails] = useState<ResponsibilityDetailGridRow[]>([]);

  // 커스텀 훅 사용
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: {
      key: 'responsibility-detail-search',
      messages: { cancel: '' } // 취소 메시지 비활성화
    },
    detail: {
      key: 'responsibility-detail-detail',
      messages: { cancel: '' }
    },
    delete: {
      key: 'responsibility-detail-delete',
      messages: { cancel: '' }
    },
    create: {
      key: 'responsibility-detail-create',
      messages: { cancel: '' }
    },
    update: {
      key: 'responsibility-detail-update',
      messages: { cancel: '' }
    },
    excel: {
      key: 'responsibility-detail-excel',
      messages: { cancel: '' }
    }
  });

  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters
  } = useFilters<ResponsibilityDetailFilters>({
    responsibilityCd: '',
    responsibilityDetailInfo: '',
    isActive: ''
  });

  const {
    pagination,
    updateTotal,
    info: paginationInfo
  } = usePagination({
    initialPage: 1,
    initialSize: 20,
    total: 0
  });

  const [modalState, setModalState] = useState<ResponsibilityDetailModalState>({
    addModal: false,
    detailModal: false,
    selectedResponsibilityDetail: null
  });

  const [excelUploadModalOpen, setExcelUploadModalOpen] = useState(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ResponsibilityDetailFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  /**
   * 엑셀 다운로드 - 현재 그리드 데이터를 엑셀 파일로 다운로드
   */
  const handleExcelDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // TODO: 실제 엑셀 다운로드 API 호출
        await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
        console.log('책무상세 엑셀 다운로드 완료');
      },
      {
        loading: '엑셀 파일을 생성 중입니다...',
        success: '엑셀 파일이 다운로드되었습니다.',
        error: '엑셀 다운로드에 실패했습니다.'
      }
    );
  }, [handlers.excel]);

  /**
   * 엑셀 업로드 양식 다운로드 - public/templates/ 폴더의 템플릿 파일 다운로드
   */
  const handleExcelTemplateDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // public/templates/ 폴더의 Excel 템플릿 파일 다운로드
        const link = document.createElement('a');
        link.href = '/templates/ResponsibilityDetailMgmtExcel.xlsx';
        link.download = '책무상세관리_업로드양식.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('책무상세 엑셀 업로드 양식 다운로드 완료');
      },
      {
        loading: '엑셀 업로드 양식을 다운로드 중입니다...',
        success: '엑셀 업로드 양식이 다운로드되었습니다.',
        error: '엑셀 업로드 양식 다운로드에 실패했습니다.'
      }
    );
  }, [handlers.excel]);

  /**
   * 엑셀 업로드 버튼 클릭 - 모달 열기
   */
  const handleExcelUpload = useCallback(() => {
    setExcelUploadModalOpen(true);
  }, []);

  /**
   * 엑셀 업로드 모달 닫기
   */
  const handleExcelUploadModalClose = useCallback(() => {
    setExcelUploadModalOpen(false);
  }, []);

  /**
   * 엑셀 파일 업로드 제출 처리
   * - 파싱된 엑셀 데이터를 CreateResponsibilityDetailRequest 배열로 변환
   * - bulkCreateResponsibilityDetails API 호출하여 DB에 일괄 저장
   */
  const handleExcelUploadSubmit = useCallback(async (excelData: Array<{
    책무코드: string;
    책무세부내용: string;
    사용여부: string;
  }>) => {
    await handlers.excel.execute(
      async () => {
        // 엑셀 데이터를 CreateResponsibilityDetailRequest 배열로 변환
        const createRequests = excelData.map(row => ({
          responsibilityCd: row.책무코드,
          responsibilityDetailInfo: row.책무세부내용,
          isActive: row.사용여부 || 'Y' // 기본값 'Y'
        }));

        console.log(`📤 ${createRequests.length}개의 책무상세를 DB에 저장 중...`, createRequests);

        // 일괄 생성 API 호출
        const createdDetails = await bulkCreateResponsibilityDetails(createRequests);

        console.log(`✅ ${createdDetails.length}개의 책무상세가 성공적으로 저장되었습니다.`, createdDetails);

        // 업로드 후 목록 다시 조회 - 직접 API 호출
        const data = filters.responsibilityCd
          ? await getResponsibilityDetailsByResponsibilityCd(filters.responsibilityCd)
          : await getAllResponsibilityDetails();

        const gridData: ResponsibilityDetailGridRow[] = data.map((dto: ResponsibilityDetailDto, index: number) =>
          convertToGridRow(dto, index)
        );
        setResponsibilityDetails(gridData);
        updateTotal(gridData.length);

        handleExcelUploadModalClose();
      },
      {
        loading: '엑셀 데이터를 DB에 저장 중입니다...',
        success: `${excelData.length}개의 책무상세가 성공적으로 저장되었습니다.`,
        error: '엑셀 업로드에 실패했습니다.'
      }
    );
  }, [handlers.excel, filters.responsibilityCd, handleExcelUploadModalClose, updateTotal]);

  const handleAddResponsibilityDetail = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedResponsibilityDetail: null
    }));
    toast.info('새 책무상세를 등록해주세요.', { autoClose: 2000 });
  }, []);

  const handleDeleteResponsibilityDetails = useCallback(async () => {
    if (selectedResponsibilityDetails.length === 0) {
      toast.warning('삭제할 책무상세를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedResponsibilityDetails.length}개의 책무상세를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    await handlers.delete.execute(
      async () => {
        // 삭제 API 호출
        const deletePromises = selectedResponsibilityDetails.map(detail =>
          deleteResponsibilityDetail(detail.책무세부코드)
        );
        await Promise.all(deletePromises);

        // 삭제 후 목록 다시 조회
        await handleSearch();
        updateTotal(pagination.total - selectedResponsibilityDetails.length);
        setSelectedResponsibilityDetails([]);
      },
      {
        loading: `${selectedResponsibilityDetails.length}개 책무상세를 삭제 중입니다...`,
        success: `${selectedResponsibilityDetails.length}개 책무상세가 삭제되었습니다.`,
        error: '책무상세 삭제에 실패했습니다.'
      }
    );
  }, [selectedResponsibilityDetails, handlers.delete, updateTotal, pagination.total]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedResponsibilityDetail: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleResponsibilityDetailSave = useCallback(async (formData: ResponsibilityDetailFormData) => {
    await handlers.create.execute(
      async () => {
        await createResponsibilityDetail({
          responsibilityCd: formData.responsibilityCd,
          responsibilityDetailInfo: formData.responsibilityDetailInfo,
          isActive: formData.isActive
        });

        await handleSearch();
        updateTotal(pagination.total + 1);
        handleModalClose();
      },
      {
        loading: '책무상세를 등록 중입니다...',
        success: '책무상세가 성공적으로 등록되었습니다.',
        error: '책무상세 등록에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.create, updateTotal, pagination.total]);

  const handleResponsibilityDetailUpdate = useCallback(async (cd: string, formData: Omit<ResponsibilityDetailFormData, 'responsibilityCd'>) => {
    await handlers.update.execute(
      async () => {
        await updateResponsibilityDetail(cd, {
          responsibilityDetailInfo: formData.responsibilityDetailInfo,
          isActive: formData.isActive
        });

        await handleSearch();
        handleModalClose();
      },
      {
        loading: '책무상세를 수정 중입니다...',
        success: '책무상세가 성공적으로 수정되었습니다.',
        error: '책무상세 수정에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.update]);

  const handleResponsibilityDetailDetail = useCallback(async (responsibilityDetail: ResponsibilityDetailGridRow) => {
    console.log('🔍 상세 모달 열기 - 책무세부코드:', responsibilityDetail.책무세부코드);

    // 상세조회 API 호출
    await handlers.detail.execute(
      async () => {
        const data = await getResponsibilityDetail(responsibilityDetail.책무세부코드);
        console.log('🔍 상세조회 API Response:', data);

        setModalState(prev => ({
          ...prev,
          detailModal: true,
          selectedResponsibilityDetail: responsibilityDetail
        }));
      },
      {
        errorMessage: '책무상세 조회에 실패했습니다.'
      }
    );
  }, [handlers.detail]);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // 책무코드가 있으면 필터링 조회, 없으면 전체 조회
        const data = filters.responsibilityCd
          ? await getResponsibilityDetailsByResponsibilityCd(filters.responsibilityCd)
          : await getAllResponsibilityDetails();

        console.log('🔍 책무상세 목록 조회 API Response:', data);

        // ResponsibilityDetailDto -> ResponsibilityDetailGridRow 타입으로 변환
        const gridData: ResponsibilityDetailGridRow[] = data.map((dto: ResponsibilityDetailDto, index: number) =>
          convertToGridRow(dto, index)
        );

        console.log('🔍 Mapped ResponsibilityDetails:', gridData);
        setResponsibilityDetails(gridData);
        updateTotal(gridData.length);
      },
      {
        loading: '책무상세 정보를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [filters, handlers.search, updateTotal]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters]);

  // Grid Event Handlers
  const handleSelectionChange = useCallback((selected: ResponsibilityDetailGridRow[]) => {
    setSelectedResponsibilityDetails(selected);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = responsibilityDetails.filter(r => r.사용여부 === '사용').length;
    const inactiveCount = responsibilityDetails.filter(r => r.사용여부 === '미사용').length;

    return {
      total,
      activeCount,
      inactiveCount
    };
  }, [pagination.total, responsibilityDetails]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 책무상세',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.activeCount,
      label: '활성 책무상세',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: statistics.inactiveCount,
      label: '비활성 책무상세',
      color: 'default' as const
    }
  ], [statistics]);

  // Filtered responsibility details for display (성능 최적화)
  const displayResponsibilityDetails = useMemo(() => {
    return responsibilityDetails; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [responsibilityDetails]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'responsibilityCd',
      type: 'text',
      label: '책무코드',
      placeholder: '책무코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'responsibilityDetailInfo',
      type: 'text',
      label: '책무세부내용',
      placeholder: '책무세부내용을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 4 }
    },
    {
      key: 'isActive',
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

  // BaseActionBar용 액션 버튼 정의
  const actionButtons = useMemo<ActionButton[]>(() => [
    {
      key: 'excelTemplateDownload',
      type: 'excelTemplateDownload',
      onClick: handleExcelTemplateDownload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    },
    {
      key: 'excelUpload',
      type: 'excelUpload',
      onClick: handleExcelUpload,
      disabled: loadingStates.excel,
      loading: loadingStates.excel
    },
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
      onClick: handleAddResponsibilityDetail
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteResponsibilityDetails,
      disabled: selectedResponsibilityDetails.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [
    handleExcelTemplateDownload,
    handleExcelUpload,
    handleExcelDownload,
    handleAddResponsibilityDetail,
    handleDeleteResponsibilityDetails,
    selectedResponsibilityDetails.length,
    loadingStates
  ]);

  // BaseActionBar용 상태 정보 정의
  const statusInfo = useMemo<StatusInfo[]>(() => [
    {
      label: '활성',
      value: statistics.activeCount,
      color: 'success',
      icon: <SecurityIcon />
    },
    {
      label: '비활성',
      value: statistics.inactiveCount,
      color: 'default',
      icon: <SecurityIcon />
    }
  ], [statistics]);

  // AG-Grid 컬럼 정의
  const columns = useMemo(() => createResponsibilityDetailColumns(handleResponsibilityDetailDetail), [handleResponsibilityDetailDetail]);

  // 페이지 로드 시 초기 데이터 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      await handlers.search.execute(
        async () => {
          const data = await getAllResponsibilityDetails();

          const gridData: ResponsibilityDetailGridRow[] = data.map((dto: ResponsibilityDetailDto, index: number) =>
            convertToGridRow(dto, index)
          );

          setResponsibilityDetails(gridData);
          updateTotal(gridData.length);
        },
        {
          loading: '책무상세 정보를 불러오는 중입니다...',
          success: '', // 페이지 로드 시 성공 메시지 비활성화
          error: '책무상세 정보를 불러오는데 실패했습니다.'
        }
      );
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 페이지 로드 시 한 번만 실행

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 */}
      <BasePageHeader
        icon={<AssignmentIcon />}
        title="책무상세관리 시스템"
        description="책무상세 정보 조회 및 관리 (책무와 1:N 관계입니다.)"
        statistics={headerStatistics}
      />

      {/* 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters}
          onValuesChange={handleFiltersChange}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={anyLoading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 책무상세 수"
          selectedCount={selectedResponsibilityDetails.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={anyLoading}
        />

        {/* 데이터 그리드 */}
        <BaseDataGrid
          data={displayResponsibilityDetails}
          columns={columns}
          loading={anyLoading}
          theme="alpine"
          onSelectionChange={handleSelectionChange}
          getRowId={(params) => params.data.책무세부코드}
          height="calc(100vh - 370px)"
          pagination={true}
          pageSize={25}
          rowSelection="multiple"
          checkboxSelection={true}
          headerCheckboxSelection={true}
          suppressHorizontalScroll={false}
          suppressColumnVirtualisation={false}
          rowClassRules={{
            'responsibility-detail-group-separator': isLastRowInGroup
          }}
        />
      </div>

      {/* 모달들 */}
      {modalState.addModal && (
        <ResponsibilityDetailFormModal
          open={modalState.addModal}
          mode="create"
          responsibilityDetail={null}
          onClose={handleModalClose}
          onSave={handleResponsibilityDetailSave}
          onUpdate={handleResponsibilityDetailUpdate}
          loading={loadingStates.create}
        />
      )}

      {modalState.detailModal && (
        <ResponsibilityDetailFormModal
          open={modalState.detailModal}
          mode="detail"
          responsibilityDetail={modalState.selectedResponsibilityDetail}
          onClose={handleModalClose}
          onSave={handleResponsibilityDetailSave}
          onUpdate={handleResponsibilityDetailUpdate}
          loading={loadingStates.update}
        />
      )}

      {/* 엑셀 업로드 모달 */}
      {excelUploadModalOpen && (
        <ResponsibilityDetailExcelUploadModal
          open={excelUploadModalOpen}
          onClose={handleExcelUploadModalClose}
          onUpload={handleExcelUploadSubmit}
          loading={loadingStates.excel}
        />
      )}
    </div>
  );
};

export default ResponsibilityDetailMgmt;
