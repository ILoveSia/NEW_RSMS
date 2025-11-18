/**
 * 관리의무관리 페이지
 * - 관리의무 정보 관리
 * - ResponsibilityDetailMgmt 표준 템플릿 100% 준수
 * - 책무세부(1) : 관리의무(N) 관계
 *
 * @author Claude AI
 * @since 2025-01-06
 */

// 번들 크기 최적화를 위한 개별 import (tree-shaking)
import toast from '@/shared/utils/toast';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ManagementObligationMgmt.module.scss'; // 자체 스타일 사용

// API
import {
  createManagementObligation,
  deleteManagementObligation,
  getAllManagementObligations,
  getManagementObligation,
  getManagementObligationsByDetailCd,
  updateManagementObligation
} from '../../api/managementObligationApi';

// Types
import type { ManagementObligationDto } from '../../types/managementObligation.types';
import type {
  ManagementObligationGridRow
} from './components/ManagementObligationDataGrid/managementObligationColumns';
import type { ManagementObligationFormData } from './components/ManagementObligationFormModal/ManagementObligationFormModal';

// Shared Components
import { LoadingSpinner } from '@/shared/components/atoms/LoadingSpinner';
import { BaseActionBar, type ActionButton, type StatusInfo } from '@/shared/components/organisms/BaseActionBar';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import BaseModalWrapper from '@/shared/components/organisms/BaseModalWrapper';
import BasePageHeader from '@/shared/components/organisms/BasePageHeader';
import { BaseSearchFilter, type FilterField } from '@/shared/components/organisms/BaseSearchFilter';

// Custom Hooks
import { useAsyncHandlers } from '@/shared/hooks/useAsyncHandler';
import useFilters from '@/shared/hooks/useFilters';
import usePagination from '@/shared/hooks/usePagination';

// ManagementObligation specific components
import { convertToGridRow, createManagementObligationColumns, isLastRowInGroup } from './components/ManagementObligationDataGrid/managementObligationColumns';

// Lazy-loaded components for performance optimization
const ManagementObligationFormModal = React.lazy(() =>
  import('./components/ManagementObligationFormModal/ManagementObligationFormModal').then(module => ({ default: module.default }))
);

const ManagementObligationExcelUploadModal = React.lazy(() =>
  import('./components/ManagementObligationExcelUploadModal/ManagementObligationExcelUploadModal').then(module => ({ default: module.default }))
);

interface ManagementObligationMgmtProps {
  className?: string;
}

/**
 * 관리의무 필터
 */
interface ManagementObligationFilters {
  responsibilityDetailCd: string;  // 책무세부코드 (필수)
  obligationInfo: string;  // 관리의무 내용
  orgCode: string;  // 조직코드
  isActive: string;  // 사용여부
}

/**
 * 모달 상태
 */
interface ManagementObligationModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedManagementObligation: any | null;
}

const ManagementObligationMgmt: React.FC<ManagementObligationMgmtProps> = ({ className }) => {
  const { t } = useTranslation('resps');

  // State Management
  const [managementObligations, setManagementObligations] = useState<ManagementObligationGridRow[]>([]);
  const [selectedManagementObligations, setSelectedManagementObligations] = useState<ManagementObligationGridRow[]>([]);

  // 커스텀 훅 사용
  const { handlers, loadingStates, loading: anyLoading } = useAsyncHandlers({
    search: {
      key: 'management-obligation-search',
      messages: { cancel: '' } // 취소 메시지 비활성화
    },
    detail: {
      key: 'management-obligation-detail',
      messages: { cancel: '' }
    },
    excel: {
      key: 'management-obligation-excel',
      messages: { cancel: '' }
    },
    delete: {
      key: 'management-obligation-delete',
      messages: { cancel: '' }
    },
    create: {
      key: 'management-obligation-create',
      messages: { cancel: '' }
    },
    update: {
      key: 'management-obligation-update',
      messages: { cancel: '' }
    }
  });

  const {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    hasFilters
  } = useFilters<ManagementObligationFilters>({
    responsibilityDetailCd: '',
    obligationInfo: '',
    orgCode: '',
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

  const [modalState, setModalState] = useState<ManagementObligationModalState>({
    addModal: false,
    detailModal: false,
    selectedManagementObligation: null
  });

  // 엑셀 업로드 모달 상태
  const [excelUploadModalOpen, setExcelUploadModalOpen] = useState(false);

  // Event Handlers
  const handleFiltersChange = useCallback((newFilters: Partial<ManagementObligationFilters>) => {
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
        console.log('관리의무 엑셀 다운로드 완료');
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
        link.href = '/templates/ManagementObligationMgmtExcel.xlsx';
        link.download = '관리의무관리_업로드양식.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('관리의무 엑셀 업로드 양식 다운로드 완료');
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
   * - 책무세부코드 필터 체크 없이 바로 모달 열기
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
   * - 파싱된 엑셀 데이터를 CreateManagementObligationRequest 배열로 변환
   * - 개별 createManagementObligation API 호출하여 DB에 저장
   */
  const handleExcelUploadSubmit = useCallback(async (excelData: Array<{
    책무세부코드: string;
    관리의무대분류코드: string;
    관리의무내용: string;
    조직코드: string;
    사용여부: string;
  }>) => {
    await handlers.excel.execute(
      async () => {
        console.log(`📤 ${excelData.length}개의 관리의무를 DB에 저장 중...`, excelData);

        // 각 행을 개별 생성 API로 처리
        for (const row of excelData) {
          try {
            await createManagementObligation({
              responsibilityDetailCd: row.책무세부코드,
              obligationMajorCatCd: row.관리의무대분류코드,
              obligationInfo: row.관리의무내용,
              orgCode: row.조직코드,
              isActive: row.사용여부 || 'Y'
            });
          } catch (error) {
            console.error(`❌ 관리의무 생성 실패 (책무세부코드: ${row.책무세부코드}):`, error);
            throw error; // 에러 발생 시 전체 업로드 중단
          }
        }

        console.log(`✅ ${excelData.length}개의 관리의무가 성공적으로 저장되었습니다.`);

        // 업로드 후 모달 닫기
        handleExcelUploadModalClose();

        // 업로드 후 필터 초기화
        setFilters({});
      },
      {
        loading: '엑셀 데이터를 DB에 저장 중입니다...',
        success: `${excelData.length}개의 관리의무가 성공적으로 저장되었습니다. 검색 버튼을 클릭하여 확인하세요.`,
        error: '엑셀 업로드에 실패했습니다.'
      }
    );
  }, [handlers.excel, handleExcelUploadModalClose, setFilters]);

  const handleAddManagementObligation = useCallback(() => {
    // 책무세부코드 필터 체크 제거 - 모달에서 직접 입력 가능
    setModalState(prev => ({
      ...prev,
      addModal: true,
      selectedManagementObligation: null
    }));
    toast.info('새 관리의무를 등록해주세요.', { autoClose: 2000 });
  }, []);

  const handleDeleteManagementObligations = useCallback(async () => {
    if (selectedManagementObligations.length === 0) {
      toast.warning('삭제할 관리의무를 선택해주세요.');
      return;
    }

    // 확인 메시지
    const confirmMessage = `선택된 ${selectedManagementObligations.length}개의 관리의무를 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    await handlers.delete.execute(
      async () => {
        // 삭제 API 호출
        const deletePromises = selectedManagementObligations.map(obligation =>
          deleteManagementObligation(obligation.관리의무코드)
        );
        await Promise.all(deletePromises);

        // 삭제 후 목록 다시 조회
        await handleSearch();
        updateTotal(pagination.total - selectedManagementObligations.length);
        setSelectedManagementObligations([]);
      },
      {
        loading: `${selectedManagementObligations.length}개 관리의무를 삭제 중입니다...`,
        success: `${selectedManagementObligations.length}개 관리의무가 삭제되었습니다.`,
        error: '관리의무 삭제에 실패했습니다.'
      }
    );
  }, [selectedManagementObligations, handlers.delete, updateTotal, pagination.total]);

  const handleModalClose = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      addModal: false,
      detailModal: false,
      selectedManagementObligation: null
    }));
  }, []);

  // 폼 모달 핸들러들
  const handleManagementObligationSave = useCallback(async (formData: ManagementObligationFormData) => {
    await handlers.create.execute(
      async () => {
        await createManagementObligation({
          responsibilityDetailCd: formData.responsibilityDetailCd,
          obligationMajorCatCd: formData.obligationMajorCatCd,
          obligationInfo: formData.obligationInfo,
          orgCode: formData.orgCode,
          isActive: formData.isActive
        });

        await handleSearch();
        updateTotal(pagination.total + 1);
        handleModalClose();
      },
      {
        loading: '관리의무를 등록 중입니다...',
        success: '관리의무가 성공적으로 등록되었습니다.',
        error: '관리의무 등록에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.create, updateTotal, pagination.total]);

  const handleManagementObligationUpdate = useCallback(async (cd: string, formData: Omit<ManagementObligationFormData, 'responsibilityDetailCd'>) => {
    await handlers.update.execute(
      async () => {
        await updateManagementObligation(cd, {
          obligationMajorCatCd: formData.obligationMajorCatCd,
          obligationInfo: formData.obligationInfo,
          orgCode: formData.orgCode,
          isActive: formData.isActive
        });

        await handleSearch();
        handleModalClose();
      },
      {
        loading: '관리의무를 수정 중입니다...',
        success: '관리의무가 성공적으로 수정되었습니다.',
        error: '관리의무 수정에 실패했습니다.'
      }
    );
  }, [handleModalClose, handlers.update]);

  const handleManagementObligationDetail = useCallback(async (managementObligation: ManagementObligationGridRow) => {
    console.log('🔍 상세 모달 열기 - 관리의무코드:', managementObligation.관리의무코드);

    // 상세조회 API 호출
    await handlers.detail.execute(
      async () => {
        const data = await getManagementObligation(managementObligation.관리의무코드);
        console.log('🔍 상세조회 API Response:', data);

        // Grid row 데이터에 API 응답 데이터를 _original로 저장
        const updatedRow = {
          ...managementObligation,
          _original: data
        };

        console.log('🔍 상세 모달 상태 업데이트 전 - updatedRow:', updatedRow);

        setModalState(prev => {
          console.log('🔍 이전 modalState:', prev);
          const newState = {
            ...prev,
            detailModal: true,
            selectedManagementObligation: updatedRow
          };
          console.log('🔍 새로운 modalState:', newState);
          return newState;
        });
      },
      {
        loading: '',
        success: '',
        error: '관리의무 조회에 실패했습니다.'
      }
    );
  }, [handlers.detail]);

  const handleSearch = useCallback(async () => {
    await handlers.search.execute(
      async () => {
        // 책무세부코드 필터가 있으면 필터링 조회, 없으면 전체 조회
        const data = filters.responsibilityDetailCd
          ? await getManagementObligationsByDetailCd(filters.responsibilityDetailCd)
          : await getAllManagementObligations();

        console.log('🔍 관리의무 목록 조회 API Response:', data);

        // ManagementObligationDto -> ManagementObligationGridRow 타입으로 변환
        const gridData: ManagementObligationGridRow[] = data.map((dto: ManagementObligationDto, index: number) =>
          convertToGridRow(dto, index)
        );

        console.log('🔍 Mapped ManagementObligations:', gridData);
        setManagementObligations(gridData);
        updateTotal(gridData.length);
      },
      {
        loading: '관리의무 정보를 검색 중입니다...',
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
  const handleSelectionChange = useCallback((selected: ManagementObligationGridRow[]) => {
    setSelectedManagementObligations(selected);
  }, []);

  // Memoized computed values (성능 최적화)
  const statistics = useMemo(() => {
    const total = pagination.total;
    const activeCount = managementObligations.filter(r => r.사용여부 === '사용').length;
    const inactiveCount = managementObligations.filter(r => r.사용여부 === '미사용').length;

    return {
      total,
      activeCount,
      inactiveCount
    };
  }, [pagination.total, managementObligations]);

  // BasePageHeader용 통계 데이터
  const headerStatistics = useMemo(() => [
    {
      icon: <TrendingUpIcon />,
      value: statistics.total,
      label: '총 관리의무',
      color: 'primary' as const
    },
    {
      icon: <SecurityIcon />,
      value: statistics.activeCount,
      label: '활성 관리의무',
      color: 'success' as const
    },
    {
      icon: <AnalyticsIcon />,
      value: statistics.inactiveCount,
      label: '비활성 관리의무',
      color: 'default' as const
    }
  ], [statistics]);

  // Filtered management obligations for display (성능 최적화)
  const displayManagementObligations = useMemo(() => {
    return managementObligations; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
  }, [managementObligations]);

  // BaseSearchFilter용 필드 정의
  const searchFields = useMemo<FilterField[]>(() => [
    {
      key: 'responsibilityDetailCd',
      type: 'text',
      label: '책무세부코드',
      placeholder: '책무세부코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'obligationInfo',
      type: 'text',
      label: '관리의무내용',
      placeholder: '관리의무내용을 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 3 }
    },
    {
      key: 'orgCode',
      type: 'text',
      label: '조직코드',
      placeholder: '조직코드를 입력하세요',
      gridSize: { xs: 12, sm: 6, md: 2 }
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
      disabled: loadingStates.excel, // 책무세부코드 체크 제거
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
      onClick: handleAddManagementObligation
    },
    {
      key: 'delete',
      type: 'delete',
      onClick: handleDeleteManagementObligations,
      disabled: selectedManagementObligations.length === 0 || loadingStates.delete,
      loading: loadingStates.delete,
      confirmationRequired: true
    }
  ], [
    handleExcelTemplateDownload,
    handleExcelUpload,
    handleExcelDownload,
    handleAddManagementObligation,
    handleDeleteManagementObligations,
    selectedManagementObligations.length,
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

  // 페이지 로드 시 초기 데이터 조회
  useEffect(() => {
    const fetchInitialData = async () => {
      await handlers.search.execute(
        async () => {
          const data = await getAllManagementObligations();
          const gridData: ManagementObligationGridRow[] = data.map((dto: ManagementObligationDto, index: number) =>
            convertToGridRow(dto, index)
          );
          setManagementObligations(gridData);
          updateTotal(gridData.length);
        },
        {
          loading: '관리의무 정보를 불러오는 중입니다...',
          success: '', // 페이지 로드 시 성공 메시지 비활성화
          error: '관리의무 정보를 불러오는데 실패했습니다.'
        }
      );
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 페이지 로드 시 한 번만 실행

  // AG-Grid 컬럼 정의
  const columns = useMemo(() => createManagementObligationColumns(handleManagementObligationDetail), [handleManagementObligationDetail]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {/* 페이지 헤더 */}
      <BasePageHeader
        icon={<GavelIcon />}
        title="관리의무관리"
        description="관리의무 정보 조회 및 관리 (책무상세와 1:N 관계입니다)"
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
          totalLabel="총 관리의무 수"
          selectedCount={selectedManagementObligations.length}
          statusInfo={statusInfo}
          actions={actionButtons}
          loading={anyLoading}
        />

        {/* 데이터 그리드 */}
        <BaseDataGrid
          data={displayManagementObligations}
          columns={columns}
          loading={anyLoading}
          theme="alpine"
          onSelectionChange={handleSelectionChange}
          onRowClick={handleManagementObligationDetail}
          getRowId={(params) => params.data.관리의무코드}
          height="calc(100vh - 370px)"
          pagination={true}
          pageSize={25}
          rowSelection="multiple"
          checkboxSelection={true}
          headerCheckboxSelection={true}
          rowClassRules={{
            'management-obligation-group-separator': isLastRowInGroup
          }}
        />
      </div>

      {/* 모달들 */}
      {(() => {
        console.log('🔍 모달 렌더링 체크 - modalState:', modalState);
        return null;
      })()}

      {modalState.addModal && (
        <React.Suspense fallback={<LoadingSpinner />}>
          <BaseModalWrapper isOpen={modalState.addModal} onClose={handleModalClose}>
            <ManagementObligationFormModal
              open={modalState.addModal}
              mode="create"
              managementObligation={null}
              onClose={handleModalClose}
              onSave={handleManagementObligationSave}
              onUpdate={handleManagementObligationUpdate}
              loading={loadingStates.create}
              defaultResponsibilityDetailCd={filters.responsibilityDetailCd}
            />
          </BaseModalWrapper>
        </React.Suspense>
      )}

      {modalState.detailModal && (
        <>
          {console.log('🔍 상세 모달 렌더링됨 - selectedManagementObligation:', modalState.selectedManagementObligation)}
          <React.Suspense fallback={<LoadingSpinner />}>
            <BaseModalWrapper isOpen={modalState.detailModal} onClose={handleModalClose}>
              <ManagementObligationFormModal
                open={modalState.detailModal}
                mode="detail"
                managementObligation={modalState.selectedManagementObligation}
                onClose={handleModalClose}
                onSave={handleManagementObligationSave}
                onUpdate={handleManagementObligationUpdate}
                loading={loadingStates.update}
              />
            </BaseModalWrapper>
          </React.Suspense>
        </>
      )}

      {/* 엑셀 업로드 모달 */}
      {excelUploadModalOpen && (
        <React.Suspense fallback={<LoadingSpinner />}>
          <ManagementObligationExcelUploadModal
            open={excelUploadModalOpen}
            onClose={handleExcelUploadModalClose}
            onUpload={handleExcelUploadSubmit}
            loading={loadingStates.excel}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default ManagementObligationMgmt;
