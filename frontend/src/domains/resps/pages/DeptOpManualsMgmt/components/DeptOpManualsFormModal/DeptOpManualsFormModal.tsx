/**
 * 부서장업무메뉴얼 등록/상세 모달
 * - 기본정보: 원장차수, 부서 선택
 * - 관리활동 정보: Grid로 다중 행 추가/저장
 * - dept_manager_manuals 테이블 구조에 맞게 재설계
 */

import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { getManagementObligationsByOrgCode } from '@/shared/api/organizationApi';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { OrganizationSearchModal, type Organization } from '@/shared/components/organisms/OrganizationSearchModal';
import { useCommonCode } from '@/shared/hooks';
import toast from '@/shared/utils/toast';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useState } from 'react';
import './DeptOpManualsFormModal.module.scss';

/**
 * 관리활동 Grid Row 데이터 타입
 * - dept_manager_manuals 테이블 컬럼 기준
 */
export interface ManagementActivityRow {
  id: string;                         // 임시 ID (Grid 행 구분용)
  obligationCd: string;               // 관리의무코드 (FK)
  obligationInfo: string;             // 관리의무내용 (표시용)
  respItem: string;                   // 책무관리항목
  activityName: string;               // 관리활동명
  execCheckMethod: string;            // 점검항목 (수행점검항목)
  execCheckDetail: string;            // 점검세부내용 (수행점검세부내용)
  execCheckFrequencyCd: string;       // 점검주기 (수행점검주기)
  isActive: 'Y' | 'N';                // 사용여부
  remarks: string;                    // 비고
}

/**
 * 폼 제출 데이터 타입
 */
export interface DeptOpManualFormData {
  ledgerOrderId: string;              // 원장차수ID
  orgCode: string;                    // 조직코드
  activities: ManagementActivityRow[]; // 관리활동 목록
}

interface DeptOpManualsFormModalProps {
  open: boolean;
  mode: 'create' | 'view' | 'edit';
  manual: any | null;
  onClose: () => void;
  onSave: (formData: DeptOpManualFormData) => Promise<void>;
  onUpdate: (id: string, formData: DeptOpManualFormData) => Promise<void>;
  loading?: boolean;
}

/**
 * 부서장업무메뉴얼 등록/상세 모달 컴포넌트
 * - 기본정보 + Grid 기반 관리활동 다중 등록
 */
const DeptOpManualsFormModal: React.FC<DeptOpManualsFormModalProps> = ({
  open,
  mode,
  manual,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 공통코드 조회
  const execCheckFrequencyCode = useCommonCode('FLFL_ISPC_FRCD');    // 점검주기 (수행점검주기)

  // 관리의무 목록 (조직 선택 시 API로 조회)
  const [obligationOptions, setObligationOptions] = useState<Array<{
    value: string;
    label: string;
  }>>([]);

  // 기본 정보 상태
  const [ledgerOrderId, setLedgerOrderId] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // 관리활동 Grid 데이터
  const [activities, setActivities] = useState<ManagementActivityRow[]>([]);

  // 선택된 Grid 행
  const [selectedRows, setSelectedRows] = useState<ManagementActivityRow[]>([]);

  // 부서 조회 팝업 상태
  const [isOrgSearchModalOpen, setIsOrgSearchModalOpen] = useState(false);

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 모달 제목
  const modalTitle = mode === 'create' ? '업무메뉴얼 등록' : '업무메뉴얼 상세';

  // 읽기 전용 모드
  const isReadOnly = mode === 'view' && !isEditing;

  // 상세 모드일 때 기존 데이터 로드
  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && manual && open) {
      console.log('🔍 [DeptOpManualsFormModal] 상세 데이터 로드:', manual);

      // 기본 정보 복원
      setLedgerOrderId(manual.ledgerOrderId || '');
      setOrgCode(manual.orgCode || '');

      if (manual.orgCode && manual.orgName) {
        setSelectedOrganization({
          orgCode: manual.orgCode,
          orgName: manual.orgName
        });
      }

      // 관리활동 데이터 복원
      // manual 객체에서 실제 데이터를 Grid 형태로 변환
      const activityData: ManagementActivityRow = {
        id: manual.manualCd || manual.id || `temp_${Date.now()}`,
        obligationCd: manual.obligationCd || '',
        obligationInfo: manual.obligationInfo || '',
        respItem: manual.respItem || '',
        activityName: manual.activityName || '',
        execCheckMethod: manual.execCheckMethod || '',
        execCheckDetail: manual.execCheckDetail || '',
        execCheckFrequencyCd: manual.execCheckFrequencyCd || '',
        isActive: manual.isActive === true || manual.isActive === 'Y' ? 'Y' : 'N',
        remarks: manual.remarks || ''
      };

      setActivities([activityData]);
    }
  }, [mode, manual, open]);

  // 폼 리셋
  const handleReset = useCallback(() => {
    setLedgerOrderId('');
    setOrgCode('');
    setSelectedOrganization(null);
    setActivities([]);
    setSelectedRows([]);
    setIsEditing(false);
  }, []);

  // 닫기
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // 수정 버튼 클릭
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 취소 버튼 클릭
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // 기존 데이터 복원 로직
  }, []);

  // 부서 조회 팝업 열기
  const handleOpenOrgSearch = useCallback(() => {
    if (!isReadOnly && mode !== 'view') {
      setIsOrgSearchModalOpen(true);
    }
  }, [isReadOnly, mode]);

  // 부서 조회 팝업 닫기
  const handleCloseOrgSearch = useCallback(() => {
    setIsOrgSearchModalOpen(false);
  }, []);

  // 부서 선택
  const handleSelectOrganization = useCallback((organization: Organization) => {
    setSelectedOrganization(organization);
    setOrgCode(organization.orgCode);
    setIsOrgSearchModalOpen(false);
    toast.success(`부서 "${organization.orgName}" 선택되었습니다.`);
  }, []);

  // 조직 선택 시 관리의무 목록 조회
  useEffect(() => {
    const fetchObligations = async () => {
      if (orgCode) {
        try {
          const obligations = await getManagementObligationsByOrgCode(orgCode);
          setObligationOptions(
            obligations.map(obl => ({
              value: obl.obligationCd,
              label: obl.obligationInfo
            }))
          );
        } catch (error) {
          console.error('[DeptOpManualsFormModal] 관리의무 조회 실패:', error);
          toast.error('관리의무 목록을 불러오는데 실패했습니다.');
          setObligationOptions([]);
        }
      } else {
        setObligationOptions([]);
      }
    };

    fetchObligations();
  }, [orgCode]);

  // Grid 행 추가
  const handleAddRow = useCallback(() => {
    if (!orgCode) {
      toast.warning('먼저 부서을 선택해주세요.');
      return;
    }

    const newRow: ManagementActivityRow = {
      id: `new_${Date.now()}`,
      obligationCd: '',
      obligationInfo: '',
      respItem: '',
      activityName: '',
      execCheckMethod: '',
      execCheckDetail: '',
      execCheckFrequencyCd: '',
      isActive: 'Y',
      remarks: ''
    };

    setActivities(prev => [...prev, newRow]);
    toast.success('새로운 행이 추가되었습니다.');
  }, [orgCode]);

  // Grid 선택 행 삭제
  const handleDeleteSelectedRows = useCallback(() => {
    if (selectedRows.length === 0) {
      toast.warning('삭제할 행을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedRows.length}개의 행을 삭제하시겠습니까?`)) {
      return;
    }

    const selectedIds = selectedRows.map(row => row.id);
    setActivities(prev => prev.filter(row => !selectedIds.includes(row.id)));
    setSelectedRows([]);
    toast.success(`${selectedIds.length}개의 행이 삭제되었습니다.`);
  }, [selectedRows]);

  // Grid 선택 변경
  const handleSelectionChange = useCallback((selected: ManagementActivityRow[]) => {
    setSelectedRows(selected);
  }, []);

  // Grid 셀 값 변경
  const handleCellValueChanged = useCallback((params: any) => {
    const { data, colDef, newValue } = params;

    setActivities(prev => prev.map(row => {
      if (row.id === data.id) {
        return {
          ...row,
          [colDef.field]: newValue
        };
      }
      return row;
    }));
  }, []);

  // Grid 컬럼 정의 (고정 너비로 가로 스크롤 지원)
  const columns: ColDef<ManagementActivityRow>[] = [
    {
      field: 'obligationInfo',
      headerName: '관리의무',
      width: 400,
      minWidth: 400,
      maxWidth: 400,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: obligationOptions.map(opt => opt.label)
      },
      onCellValueChanged: (params) => {
        // 관리의무 선택 시 obligationCd도 함께 업데이트
        const selected = obligationOptions.find(opt => opt.label === params.newValue);
        if (selected) {
          setActivities(prev => prev.map(row => {
            if (row.id === params.data.id) {
              return {
                ...row,
                obligationInfo: params.newValue,
                obligationCd: selected.value
              };
            }
            return row;
          }));
        }
      }
    },
    {
      field: 'respItem',
      headerName: '책무관리항목',
      width: 350,
      minWidth: 350,
      maxWidth: 350,
      editable: !isReadOnly,
      cellEditor: 'agTextCellEditor'
    },
    {
      field: 'activityName',
      headerName: '관리활동명',
      width: 300,
      minWidth: 300,
      maxWidth: 300,
      editable: !isReadOnly,
      cellEditor: 'agTextCellEditor',
      cellClass: 'clickable-cell',
      onCellClicked: (params) => {
        console.log('관리활동명 클릭:', params.data);
        // 여기에 클릭 시 동작 추가 가능
      }
    },
    {
      field: 'execCheckMethod',
      headerName: '점검항목',
      width: 300,
      minWidth: 300,
      maxWidth: 300,
      editable: !isReadOnly,
      cellEditor: 'agTextCellEditor'
    },
    {
      field: 'execCheckDetail',
      headerName: '점검세부내용',
      width: 400,
      minWidth: 400,
      maxWidth: 400,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    },
    {
      field: 'execCheckFrequencyCd',
      headerName: '점검주기',
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      editable: !isReadOnly,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: execCheckFrequencyCode.options.map(opt => opt.value)
      },
      valueFormatter: (params) => {
        const found = execCheckFrequencyCode.options.find(opt => opt.value === params.value);
        return found ? found.label : params.value;
      }
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      editable: !isReadOnly,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Y', 'N']
      },
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center'
    },
    {
      field: 'remarks',
      headerName: '비고',
      width: 350,
      minWidth: 350,
      maxWidth: 350,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    }
  ];

  // 저장/제출 핸들러
  const handleSubmit = useCallback(async () => {
    // 필수 필드 유효성 검사
    if (!ledgerOrderId) {
      toast.warning('책무이행차수를 선택해주세요.');
      return;
    }
    if (!orgCode) {
      toast.warning('부서을 선택해주세요.');
      return;
    }
    if (activities.length === 0) {
      toast.warning('최소 1개 이상의 관리활동을 추가해주세요.');
      return;
    }

    // 각 행의 필수 필드 검사
    const invalidRows = activities.filter(row =>
      !row.obligationCd || !row.respItem || !row.activityName
    );

    if (invalidRows.length > 0) {
      toast.warning('관리의무, 책무관리항목, 관리활동명은 필수 입력 항목입니다.');
      return;
    }

    const formData: DeptOpManualFormData = {
      ledgerOrderId,
      orgCode,
      activities
    };

    try {
      if (mode === 'create') {
        await onSave(formData);
      } else {
        await onUpdate(manual.id, formData);
        setIsEditing(false);
      }
      handleClose();
    } catch (error) {
      console.error('[DeptOpManualsFormModal] 저장 실패:', error);
    }
  }, [mode, ledgerOrderId, orgCode, activities, manual, onSave, onUpdate, handleClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '80vh',
          maxHeight: '90vh',
          width: '95vw',
          maxWidth: '1600px'
        }
      }}
      aria-labelledby="dept-op-manuals-modal-title"
    >
      <DialogTitle
        id="dept-op-manuals-modal-title"
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
            {modalTitle}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ p: 3, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 기본 정보 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              기본 정보
            </Typography>

            {/* 책무이행차수, 부서 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 책무이행차수 */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <LedgerOrderComboBox
                  value={ledgerOrderId}
                  onChange={(value) => setLedgerOrderId(value || '')}
                  label="책무이행차수"
                  required
                  disabled={isReadOnly || mode === 'view'}
                  size="small"
                />
              </Box>

              {/* 부서 */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="부서"
                  required
                  disabled={isReadOnly || mode === 'view'}
                  value={selectedOrganization ? `${selectedOrganization.orgName} (${selectedOrganization.orgCode})` : ''}
                  placeholder="돋보기 버튼을 클릭하여 부서을 선택하세요"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleOpenOrgSearch}
                          disabled={isReadOnly || mode === 'view'}
                          size="small"
                          edge="end"
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* 관리활동 정보 섹션 (Grid) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                관리활동 정보
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddRow}
                  disabled={isReadOnly || !orgCode}
                >
                  행 추가
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelectedRows}
                  disabled={isReadOnly || selectedRows.length === 0}
                  color="error"
                >
                  선택 삭제
                </Button>
              </Box>
            </Box>

            {/* Grid (가로 스크롤 지원) */}
            <Box sx={{
              width: '100%',
              height: '400px',
              overflowX: 'auto'
            }}>
              <BaseDataGrid
                data={activities}
                columns={columns}
                loading={false}
                theme="alpine"
                onSelectionChange={handleSelectionChange}
                onCellValueChanged={handleCellValueChanged}
                height="100%"
                pagination={false}
                rowSelection="multiple"
                checkboxSelection={true}
                headerCheckboxSelection={true}
                suppressHorizontalScroll={false}
                getRowId={(params) => params.data.id}
              />
            </Box>

            <Typography variant="caption" color="text.secondary">
              * 관리의무, 책무관리항목, 관리활동명은 필수 입력 항목입니다.
              <br />
              * 셀을 더블클릭하여 값을 입력하세요. 점검세부내용과 비고는 팝업 에디터가 열립니다.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </>
        ) : mode === 'view' ? (
          <>
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={handleClose} disabled={loading}>
                  닫기
                </Button>
                <Button variant="contained" onClick={handleEdit} disabled={loading}>
                  수정
                </Button>
              </>
            )}
          </>
        ) : (
          // mode === 'edit'
          <>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </>
        )}
      </DialogActions>

      {/* 부서 조회 팝업 */}
      <OrganizationSearchModal
        open={isOrgSearchModalOpen}
        onClose={handleCloseOrgSearch}
        onSelect={handleSelectOrganization}
        title="부서 조회"
        selectedOrgCode={orgCode}
      />
    </Dialog>
  );
};

export default DeptOpManualsFormModal;
