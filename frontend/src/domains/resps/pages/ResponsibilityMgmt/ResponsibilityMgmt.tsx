/**
 * 책무관리 페이지
 * - 책무 정보만 관리 (세부/의무는 별도 페이지)
 * - PositionMgmt 표준 템플릿 준수
 *
 * @author Claude AI
 * @since 2025-11-05
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ResponsibilityMgmt.module.scss';

// API
import {
  createResponsibility,
  deleteResponsibility,
  getAllResponsibilitiesWithJoin,
  getResponsibility,
  updateResponsibility,
  uploadResponsibilityExcel,
  type ResponsibilityListDto
} from '../../api/responsibilityApi';

// Types
import type {
  ResponsibilityFilters,
  ResponsibilityFormData,
  ResponsibilityGridRow,
  ResponsibilityModalState
} from './types/responsibility.types';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import { BaseSearchFilter, type FilterField, type FilterValues } from '@/shared/components/organisms/BaseSearchFilter';

// Domain Components
import { LedgerOrderComboBox } from '../../components/molecules/LedgerOrderComboBox';

// Custom Hooks
import { useCommonCode } from '@/shared/hooks';
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import useFilters from '@/shared/hooks/useFilters';
import usePagination from '@/shared/hooks/usePagination';

// Responsibility specific components
import { createResponsibilityColumns, isLastRowInGroup } from './components/ResponsibilityDataGrid/responsibilityColumns';

// Lazy-loaded components for performance optimization
const ResponsibilityFormModal = React.lazy(() =>
  import('./components/ResponsibilityFormModal/ResponsibilityFormModal').then(module => ({ default: module.default }))
);

const ResponsibilityExcelUploadModal = React.lazy(() =>
  import('./components/ResponsibilityExcelUploadModal/ResponsibilityExcelUploadModal').then(module => ({ default: module.default }))
);

interface ResponsibilityMgmtProps {
  className?: string;
}

const ResponsibilityMgmt: React.FC<ResponsibilityMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // 공통코드에서 책무카테고리 조회 (RSBT_OBLG_CLCD)
  const responsibilityCategoryCode = useCommonCode('RSBT_OBLG_CLCD');

  // State Management
  const [responsibilities, setResponsibilities] = useState<ResponsibilityGridRow[]>([]);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<ResponsibilityGridRow[]>([]);

  // 책무이행차수 상태 (LedgerOrderComboBox용)
  const [ledgerOrderId, setLedgerOrderId] = useState<string | null>(null);

  // 커스텀 훅 사용
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: {
      key: 'responsibility-search',
      messages: { cancel: '' } // 취소 메시지 비활성화
    },
    detail: {
      key: 'responsibility-detail',
      messages: { cancel: '' }
    },
    excel: {
      key: 'responsibility-excel',
      messages: { cancel: '' }
    },
    delete: {
      key: 'responsibility-delete',
      messages: { cancel: '' }
    },
    create: {
      key: 'responsibility-create',
      messages: { cancel: '' }
    },
    update: {
      key: 'responsibility-update',
      messages: { cancel: '' }
    }
  });

  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters
  } = useFilters<ResponsibilityFilters>({
    ledgerOrderId: '',
    positionsId: '',
    responsibilityCat: '',
    responsibilityInfo: '',
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

  const [modalState, setModalState] = useState<ResponsibilityModalState>({
    addModal: false,
    detailModal: false,
    selectedResponsibility: null
  });

  // 엑셀 업로드 모달 상태
  const [excelUploadModalOpen, setExcelUploadModalOpen] = useState(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ResponsibilityFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleAddResponsibility = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedResponsibility: null
    }));
    toast.info('새 책무를 등록해주세요.', { autoClose: 2000 });
  }, []);

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

  const handleExcelTemplateDownload = useCallback(async () => {
    await handlers.excel.execute(
      async () => {
        // public/templates/ 폴더의 Excel 템플릿 파일 다운로드
        const link = document.createElement('a');
        link.href = '/templates/ResponsibilityMgmtExcel.xlsx';
        link.download = '책무관리_업로드양식.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('엑셀 업로드 양식 다운로드 완료');
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

  const handleDeleteResponsibilities = useCallback(async () => {
    if (selectedResponsibilities.length === 0) {
      toast.warning('삭제할 책무를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedResponsibilities.length}개의 책무를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    await handlers.delete.execute(
      async () => {
        // 삭제 API 호출
        const deletePromises = selectedResponsibilities.map(resp =>
          deleteResponsibility(resp.책무코드)
        );
        await Promise.all(deletePromises);

        // 삭제 후 목록 다시 조회
        await handleSearch();
        updateTotal(pagination.total - selectedResponsibilities.length);
        setSelectedResponsibilities([]);
      },
      {
        loading: `${selectedResponsibilities.length}개 책무를 삭제 중입니다...`,
        success: `${selectedResponsibilities.length}개 책무가 삭제되었습니다.`,
        error: '책무 삭제에 실패했습니다.'
      }
    );
  }, [selectedResponsibilities, handlers.delete, updateTotal, pagination.total]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedResponsibility: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleResponsibilitySave = useCallback(async (formData: ResponsibilityFormData) => {
    await handlers.create.execute(
      async () => {
        await createResponsibility({
          ledgerOrderId: formData.ledgerOrderId,
          positionsId: formData.positionsId!,
          responsibilityCat: formData.responsibilityCat,
          responsibilityInfo: formData.responsibilityInfo,
          responsibilityLegal: formData.responsibilityLegal,
          expirationDate: formData.expirationDate,
          responsibilityStatus: formData.responsibilityStatus,
          isActive: formData.isActive
        });

        await handleSearch();
        updateTotal(pagination.total + 1);
        handleModalClose();
      },
      {
        loading: '책무를 등록 중입니다...',
        success: '책무가 성공적으로 등록되었습니다.',
        error: '책무 등록에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.create, updateTotal, pagination.total]);

  const handleResponsibilityUpdate = useCallback(async (cd: string, formData: ResponsibilityFormData) => {
    await handlers.update.execute(
      async () => {
        await updateResponsibility(cd, {
          ledgerOrderId: formData.ledgerOrderId,
          positionsId: formData.positionsId!,
          responsibilityCat: formData.responsibilityCat,
          responsibilityInfo: formData.responsibilityInfo,
          responsibilityLegal: formData.responsibilityLegal,
          expirationDate: formData.expirationDate,
          responsibilityStatus: formData.responsibilityStatus,
          isActive: formData.isActive
        });

        await handleSearch();
        handleModalClose();
      },
      {
        loading: '책무를 수정 중입니다...',
        success: '책무가 성공적으로 수정되었습니다.',
        error: '책무 수정에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.update]);

  const handleResponsibilityDetail = useCallback(async (responsibility: ResponsibilityGridRow) => {
    console.log('🔍 상세 모달 열기 - 책무코드:', responsibility.책무코드);

    // 상세조회 API 호출
    await handlers.detail.execute(
      async () => {
        const data = await getResponsibility(responsibility.책무코드);
        console.log('🔍 상세조회 API Response:', data);

        setModalState(prev => ({
          ...prev,
          detailModal: true,
          selectedResponsibility: {
            responsibilityCd: data.responsibilityCd || '',
            ledgerOrderId: data.ledgerOrderId || '',
            positionsId: data.positionsId || null,
            responsibilityCat: data.responsibilityCat || '',
            responsibilityCatName: data.responsibilityCatName || '',
            responsibilityInfo: data.responsibilityInfo || '',
            responsibilityLegal: data.responsibilityLegal || '',
            isActive: data.isActive || 'Y',
            createdBy: data.createdBy || '',
            createdAt: data.createdAt || '',
            updatedBy: data.updatedBy || '',
            updatedAt: data.updatedAt || ''
          }
        }));
      },
      {
        errorMessage: '책무 상세 조회에 실패했습니다.'
      }
    );
  }, [handlers.detail]);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // API 호출
        const data = await getAllResponsibilitiesWithJoin({
          ledgerOrderId: filters.ledgerOrderId || undefined,
          responsibilityInfo: filters.responsibilityInfo || undefined
        });

        console.log('🔍 책무 목록 조회 API Response:', data);

        // ResponsibilityListDto -> ResponsibilityGridRow 타입으로 변환
        const gridData: ResponsibilityGridRow[] = data.map((dto: ResponsibilityListDto, index: number) => ({
          id: dto.responsibilityCd || '',
          순번: index + 1,
          책무코드: dto.responsibilityCd || '',
          책무이행차수: dto.ledgerOrderId || '',
          직책명: dto.positionsName || '',
          책무카테고리: dto.responsibilityCatName || dto.responsibilityCat || '',
          책무내용: dto.responsibilityInfo || '',
          책무관련근거: dto.responsibilityLegal || '',
          사용여부: dto.responsibilityIsActive === 'Y' ? 'Y' : 'N',  // string으로 변환 (Y/N 텍스트 표시)
          등록일자: dto.createdAt || '',  // valueFormatter에서 처리
          등록자: dto.createdBy || '',
          _rawData: {
            // ResponsibilityDto 형식으로 변환
            responsibilityCd: dto.responsibilityCd || '',
            ledgerOrderId: dto.ledgerOrderId || '',
            positionsId: dto.positionsId || 0,
            positionsName: dto.positionsName || '',
            responsibilityCat: dto.responsibilityCat || '',
            responsibilityCatName: dto.responsibilityCatName || '',
            responsibilityInfo: dto.responsibilityInfo || '',
            responsibilityLegal: dto.responsibilityLegal || '',
            isActive: dto.responsibilityIsActive || 'Y',
            createdBy: dto.createdBy || '',
            createdAt: dto.createdAt || '',
            updatedBy: dto.updatedBy || '',
            updatedAt: dto.updatedAt || ''
          }
        }));

        console.log('🔍 Mapped Responsibilities:', gridData);
        setResponsibilities(gridData);
        updateTotal(gridData.length);
      },
      {
        loading: '책무 정보를 검색 중입니다...',
        success: '검색이 완료되었습니다.',
        error: '검색에 실패했습니다.'
      }
    );
  }, [filters, handlers.search, updateTotal]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    toast.info('검색 조건이 초기화되었습니다.', { autoClose: 2000 });
  }, [clearFilters]);

  /**
   * 엑셀 파일 업로드 실행
   */
  const handleExcelUploadSubmit = useCallback(async (file: File) => {
    const result = await uploadResponsibilityExcel(file);

    // 업로드 성공 시 목록 새로고침
    if (result.successCount > 0) {
      await handleSearch();
    }

    return result;
  }, [handleSearch]);

  // Grid Event Handlers
  const handleSelectionChange = useCallback((selected: ResponsibilityGridRow[]) => {
    setSelectedResponsibilities(selected);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = responsibilities.filter(r => r.사용여부).length;
    const inactiveCount = responsibilities.filter(r => !r.사용여부).length;

    return {
      total,
      activeCount,
      inactiveCount
    };
  }, [pagination.total, responsibilities]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 책무',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.activeCount,
      label: '활성 책무',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: statistics.inactiveCount,
      label: '비활성 책무',
      color: 'default' as const
    }
  ], [statistics]);

  // Filtered responsibilities for display (성능 최적화)
  // 직책명으로 정렬하여 같은 직책명이 연속되도록 함 (그룹 구분선을 위해 필수)
  const displayResponsibilities = useMemo(() => {
    return [...responsibilities].sort((a, b) => {
      // 직책명으로 1차 정렬
      const positionCompare = a.직책명.localeCompare(b.직책명, 'ko-KR');
      if (positionCompare !== 0) return positionCompare;

      // 같은 직책명일 경우 책무코드로 2차 정렬
      return a.책무코드.localeCompare(b.책무코드, 'ko-KR');
    });
  }, [responsibilities]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'ledgerOrderId',
      type: 'custom',
      label: '책무이행차수',
      gridSize: { xs: 12, sm: 6, md: 2.5 },
      customComponent: (
        <LedgerOrderComboBox
          value={ledgerOrderId || undefined}
          onChange={setLedgerOrderId}
          label="책무이행차수"
          fullWidth
          size="small"
        />
      )
    },
    {
      key: 'responsibilityCat',
      type: 'select',
      label: '책무카테고리',
      options: responsibilityCategoryCode.optionsWithAll,  // useCommonCode hook 사용
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'responsibilityInfo',
      type: 'text',
      label: '책무내용',
      placeholder: '책무내용을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
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
  ], [ledgerOrderId, responsibilityCategoryCode.optionsWithAll]);

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
      onClick: handleAddResponsibility
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteResponsibilities,
      disabled: selectedResponsibilities.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [handleExcelTemplateDownload, handleExcelUpload, handleExcelDownload, handleAddResponsibility, handleDeleteResponsibilities, selectedResponsibilities.length, loadingStates]);

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
  const responsibilityColumns = useMemo(() =>
    createResponsibilityColumns(handleResponsibilityDetail),
    [handleResponsibilityDetail]
  );

  // 페이지 로드 시 초기 데이터 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      await handlers.search.execute(
        async () => {
          const data = await getAllResponsibilitiesWithJoin();

          // ResponsibilityGridRow 타입으로 변환
          const gridData: ResponsibilityGridRow[] = data.map((dto, index) => ({
            id: dto.responsibilityCd,
            순번: index + 1,
            직책명: dto.positionsName || '',
            책무코드: dto.responsibilityCd,
            책무카테고리: dto.responsibilityCatName || dto.responsibilityCat,
            책무내용: dto.responsibilityInfo,
            책무관련근거: dto.responsibilityLegal,
            사용여부: dto.responsibilityIsActive === 'Y' ? 'Y' : 'N',  // string으로 변환 (Y/N 텍스트 표시)
            등록일자: dto.createdAt ? dto.createdAt.split('T')[0] : '',
            등록자: dto.createdBy || '',
            _rawData: dto
          }));

          setResponsibilities(gridData);
          updateTotal(gridData.length);
        },
        {
          loading: '책무 정보를 불러오는 중입니다...',
          success: '', // 페이지 로드 시 성공 메시지 비활성화
          error: '책무 정보를 불러오는데 실패했습니다.'
        }
      );
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 페이지 로드 시 한 번만 실행

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 🏗️ 공통 페이지 헤더 */}
      <BasePageHeader
        icon={<DashboardIcon />}
        title={t('responsibility.management.title', '책무관리 시스템')}
        description={t('responsibility.management.description', '책무 정보를 관리합니다 (세부/의무는 별도 페이지)')}
        statistics={headerStatistics}
        i18nNamespace="resps"
      />

      {/* 🎨 메인 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 🔍 공통 검색 필터 */}
        <BaseSearchFilter
          fields={searchFields}
          values={filters as unknown as FilterValues}
          onValuesChange={(values) => handleFiltersChange(values as unknown as Partial<ResponsibilityFilters>)}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          loading={anyLoading}
          searchLoading={loadingStates.search}
          showClearButton={true}
        />

        {/* 💎 공통 액션 바 */}
        <BaseActionBar
          totalCount={statistics.total}
          totalLabel="총 책무 수"
          selectedCount={selectedResponsibilities.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={anyLoading}
        />

        {/* 🎯 공통 데이터 그리드 */}
        <BaseDataGrid
          data={displayResponsibilities}
          columns={responsibilityColumns}
          loading={anyLoading}
          theme="alpine"
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

      {/* 책무 등록/상세 모달 - BaseModalWrapper 적용 */}
      <BaseModalWrapper
        isOpen={modalState.addModal || modalState.detailModal}
        onClose={handleModalClose}
        ariaLabel="책무 관리 모달"
        fallbackComponent={<LoadingSpinner text="책무 모달을 불러오는 중..." />}
      >
        <ResponsibilityFormModal
          open={modalState.addModal || modalState.detailModal}
          mode={modalState.addModal ? 'create' : 'detail'}
          responsibility={modalState.selectedResponsibility}
          onClose={handleModalClose}
          onSave={handleResponsibilitySave}
          onUpdate={handleResponsibilityUpdate}
          loading={loadingStates.create || loadingStates.update}
        />
      </BaseModalWrapper>

      {/* 엑셀 업로드 모달 - BaseModalWrapper 적용 */}
      <BaseModalWrapper
        isOpen={excelUploadModalOpen}
        onClose={handleExcelUploadModalClose}
        ariaLabel="엑셀 업로드 모달"
        fallbackComponent={<LoadingSpinner text="엑셀 업로드 모달을 불러오는 중..." />}
      >
        <ResponsibilityExcelUploadModal
          open={excelUploadModalOpen}
          onClose={handleExcelUploadModalClose}
          onUpload={handleExcelUploadSubmit}
          loading={loadingStates.excel}
        />
      </BaseModalWrapper>
    </div>
  );
};

export default ResponsibilityMgmt;
