/**
 * 책무 등록/수정/상세 모달
 * DeliberativeFormModal 스타일 패턴 준수 (테마 적용, sx prop 사용)
 *
 * 주요 기능:
 * - 책무 기본 정보 입력 (직책 섹션, 책무 섹션, 책무세부내용 섹션, 관리의무 섹션)
 * - Accordion 구조 유지
 * - 등록/수정/상세조회 모드 지원
 */

import { getPositionDepartments, getPositionsByLedgerOrderId, type PositionDto } from '@/domains/resps/api/positionApi';
import { saveAllResponsibilities, type CreateResponsibilityRequest } from '@/domains/resps/api/responsibilityApi';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { getActiveCodeDetailsByGroup } from '@/domains/system/pages/CodeMgmt/api/codeMgmtApi';
import type { CodeDetail } from '@/domains/system/pages/CodeMgmt/types/codeMgmt.types';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import toast from '@/shared/utils/toast';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Responsibility, ResponsibilityFormData } from '../../types/responsibility.types';

interface ResponsibilityFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  responsibility: Responsibility | null;
  onClose: () => void;
  onSave: (data: ResponsibilityFormData) => Promise<void>;
  onUpdate: (id: string, data: ResponsibilityFormData) => Promise<void>;
  loading?: boolean;
}

const ResponsibilityFormModal: React.FC<ResponsibilityFormModalProps> = ({
  open,
  mode,
  responsibility,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 상태 관리
  const [ledgerOrderId, setLedgerOrderId] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<PositionDto | null>(null);
  const [availablePositions, setAvailablePositions] = useState<PositionDto[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // 직책별 부점 목록
  const [positionDepartments, setPositionDepartments] = useState<Array<{org_code: string; org_name: string}>>([]);

  // 책무 섹션 - 공통코드 및 행 데이터
  const [categoryOptions, setCategoryOptions] = useState<CodeDetail[]>([]); // 책무카테고리 옵션
  const [responsibilityOptions, setResponsibilityOptions] = useState<CodeDetail[]>([]); // 책무 옵션
  const [responsibilityRows, setResponsibilityRows] = useState<Array<{
    id: string;
    category: string;
    content: string;
    legal: string;
    isActive: string;
  }>>([]);

  // 책무 세부내용 섹션 - 행 데이터
  const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<string | null>(null); // 선택된 책무 ID
  const [detailRows, setDetailRows] = useState<Array<{
    id: string;
    responsibilityId: string;
    detailInfo: string;
    isActive: string;
  }>>([]);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<ResponsibilityFormData>({
    직책: responsibility?.직책 || '',
    본부구분: responsibility?.본부구분 || '',
    부서명: responsibility?.부서명 || '',
    부점명: responsibility?.부점명 || '',
    책무테고리: responsibility?.책무테고리 || '',
    책무: responsibility?.책무 || '',
    책무세부내용: responsibility?.책무세부내용 || '',
    관리의무: responsibility?.관리의무 || '',
    사용여부: responsibility?.사용여부 ?? true
  });

  const [isEditing, setIsEditing] = useState(false);

  // 모달 제목
  const modalTitle = useMemo(() => {
    if (mode === 'create') return '책무 등록';
    if (isEditing) return '책무 수정';
    return '책무 상세';
  }, [mode, isEditing]);

  // 읽기 전용 모드
  const isReadOnly = mode === 'detail' && !isEditing;

  /**
   * 공통코드 조회 (책무카테고리, 책무)
   */
  useEffect(() => {
    const fetchCommonCodes = async () => {
      try {
        // 책무카테고리 조회 (RSBT_OBLG_CLCD)
        const categories = await getActiveCodeDetailsByGroup('RSBT_OBLG_CLCD');
        setCategoryOptions(categories);

        // 책무 조회 (RSBT_OBLG_CD)
        const responsibilities = await getActiveCodeDetailsByGroup('RSBT_OBLG_CD');
        setResponsibilityOptions(responsibilities);
      } catch (error) {
        console.error('[ResponsibilityFormModal] 공통코드 조회 실패:', error);
        toast.error('공통코드를 불러오는데 실패했습니다.');
      }
    };

    if (open) {
      fetchCommonCodes();
    }
  }, [open]);

  /**
   * 원장차수 변경 시 직책 목록 조회
   */
  useEffect(() => {
    const fetchPositionsByLedger = async () => {
      if (!ledgerOrderId) {
        console.log('[ResponsibilityFormModal] 원장차수가 선택되지 않음. 직책 목록 초기화');
        setAvailablePositions([]);
        setSelectedPosition(null);
        return;
      }

      console.log('[ResponsibilityFormModal] 원장차수:', ledgerOrderId, '로 직책 목록 조회 시작');
      setIsLoadingPositions(true);
      try {
        const positionDtos = await getPositionsByLedgerOrderId(ledgerOrderId);
        console.log('[ResponsibilityFormModal] 직책 목록 조회 성공:', positionDtos.length, '개');
        setAvailablePositions(positionDtos);
      } catch (error) {
        console.error('[ResponsibilityFormModal] 직책 목록 조회 실패:', error);
        toast.error('직책 목록을 불러오는데 실패했습니다.');
        setAvailablePositions([]);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchPositionsByLedger();
  }, [ledgerOrderId]);

  /**
   * 폼 초기화
   */
  useEffect(() => {
    if (mode === 'create') {
      setLedgerOrderId('');
      setFormData({
        직책: '',
        본부구분: '',
        부서명: '',
        부점명: '',
        책무테고리: '',
        책무: '',
        책무세부내용: '',
        관리의무: '',
        사용여부: true
      });
      setIsEditing(true);
    } else if (mode === 'detail' && responsibility && open) {
      // TODO: responsibility에서 ledgerOrderId 가져오기 (현재는 없음)
      setLedgerOrderId('');
      setFormData({
        직책: responsibility.직책 || '',
        본부구분: responsibility.본부구분 || '',
        부서명: responsibility.부서명 || '',
        부점명: responsibility.부점명 || '',
        책무테고리: responsibility.책무테고리 || '',
        책무: responsibility.책무 || '',
        책무세부내용: responsibility.책무세부내용 || '',
        관리의무: responsibility.관리의무 || '',
        사용여부: responsibility.사용여부 ?? true
      });
      setIsEditing(false);
    }
  }, [mode, responsibility, open]);

  // 입력 필드 변경 핸들러
  const handleChange = useCallback((field: keyof ResponsibilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 수정 모드로 전환
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 수정 취소
  const handleCancel = useCallback(() => {
    if (responsibility) {
      setFormData({
        직책: responsibility.직책 || '',
        본부구분: responsibility.본부구분 || '',
        부서명: responsibility.부서명 || '',
        부점명: responsibility.부점명 || '',
        책무테고리: responsibility.책무테고리 || '',
        책무: responsibility.책무 || '',
        책무세부내용: responsibility.책무세부내용 || '',
        관리의무: responsibility.관리의무 || '',
        사용여부: responsibility.사용여부 ?? true
      });
    }
    setIsEditing(false);
  }, [responsibility]);

  // 저장 핸들러
  const handleSubmit = useCallback(async () => {
    if (mode === 'create') {
      await onSave(formData);
    } else if (responsibility) {
      await onUpdate(responsibility.id, formData);
    }
  }, [mode, formData, responsibility, onSave, onUpdate]);

  // 닫기 시 폼 리셋
  const handleClose = useCallback(() => {
    setLedgerOrderId('');
    setSelectedPosition(null);
    setPositionDepartments([]);
    setFormData({
      직책: '',
      본부구분: '',
      부서명: '',
      부점명: '',
      책무테고리: '',
      책무: '',
      책무세부내용: '',
      관리의무: '',
      사용여부: true
    });
    onClose();
  }, [onClose]);

  /**
   * 직책 콤보박스 변경 핸들러 - 부점 목록도 함께 조회
   */
  const handlePositionChange = useCallback(async (positionsId: number) => {
    const position = availablePositions.find(p => p.positionsId === positionsId);
    if (position) {
      console.log('[ResponsibilityFormModal] 직책 선택:', position);
      setSelectedPosition(position);
      handleChange('직책', position.positionsName);

      // 직책별 부점 목록 조회
      try {
        const departments = await getPositionDepartments(positionsId);
        console.log('[ResponsibilityFormModal] 부점 목록 조회 성공:', departments);
        setPositionDepartments(departments);
      } catch (error) {
        console.error('[ResponsibilityFormModal] 부점 목록 조회 실패:', error);
        toast.error('부점 목록을 불러오는데 실패했습니다.');
        setPositionDepartments([]);
      }
    }
  }, [availablePositions, handleChange]);

  /**
   * 책무 섹션 - "추가" 버튼 클릭 핸들러 (빈 행 추가)
   */
  const handleAddResponsibility = useCallback(() => {
    // 원장차수와 직책이 선택되어 있는지 확인
    if (!ledgerOrderId) {
      toast.warning('먼저 책무이행차수를 선택해주세요.');
      return;
    }
    if (!selectedPosition) {
      toast.warning('먼저 직책을 선택해주세요.');
      return;
    }

    // 빈 행 추가
    const newRow = {
      id: `temp-${Date.now()}`,
      category: '',
      content: '',
      legal: '',
      isActive: 'Y'
    };

    setResponsibilityRows(prev => [...prev, newRow]);
    toast.success('책무 행이 추가되었습니다. 셀을 클릭하여 편집하세요.', { autoClose: 2000 });
  }, [ledgerOrderId, selectedPosition]);

  /**
   * 책무 섹션 - 책무 행 삭제
   */
  const handleDeleteResponsibility = useCallback((id: string) => {
    setResponsibilityRows(prev => prev.filter(row => row.id !== id));
    toast.success('책무가 삭제되었습니다.');
  }, []);

  /**
   * 책무 섹션 - "저장" 버튼 클릭 핸들러
   * - 원장차수ID와 직책ID로 기존 책무를 삭제하고 새로운 책무를 저장
   */
  const handleSaveResponsibility = useCallback(async () => {
    // 유효성 검사
    if (!ledgerOrderId) {
      toast.warning('먼저 책무이행차수를 선택해주세요.');
      return;
    }
    if (!selectedPosition) {
      toast.warning('먼저 직책을 선택해주세요.');
      return;
    }
    if (responsibilityRows.length === 0) {
      toast.warning('저장할 책무가 없습니다. 먼저 책무를 추가해주세요.');
      return;
    }

    // 모든 행의 필수 필드 검증
    const invalidRows = responsibilityRows.filter(row =>
      !row.category || !row.content || !row.legal
    );
    if (invalidRows.length > 0) {
      toast.warning('책무카테고리, 책무, 관련근거는 필수 입력 항목입니다.');
      return;
    }

    try {
      // CreateResponsibilityRequest 배열로 변환
      const requests: CreateResponsibilityRequest[] = responsibilityRows.map(row => ({
        ledgerOrderId,
        positionsId: selectedPosition.positionsId,
        responsibilityCat: row.category,
        responsibilityCd: row.content,
        responsibilityInfo: row.content, // 책무코드를 책무정보로도 사용
        responsibilityLegal: row.legal,
        isActive: row.isActive
      }));

      // API 호출
      await saveAllResponsibilities(ledgerOrderId, selectedPosition.positionsId, requests);
      toast.success('책무가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('[ResponsibilityFormModal] 책무 저장 실패:', error);
      toast.error('책무 저장에 실패했습니다.');
    }
  }, [ledgerOrderId, selectedPosition, responsibilityRows]);

  /**
   * 책무 세부내용 섹션 - "추가" 버튼 클릭 핸들러
   */
  const handleAddDetail = useCallback(() => {
    if (!selectedResponsibilityId) {
      toast.warning('먼저 책무 섹션에서 책무를 선택해주세요.');
      return;
    }

    const newDetail = {
      id: `detail-temp-${Date.now()}`,
      responsibilityId: selectedResponsibilityId,
      detailInfo: '',
      isActive: 'Y'
    };

    setDetailRows(prev => [...prev, newDetail]);
    toast.success('책무 세부내용 행이 추가되었습니다. 셀을 클릭하여 편집하세요.', { autoClose: 2000 });
  }, [selectedResponsibilityId]);

  /**
   * 책무 세부내용 섹션 - 행 삭제
   */
  const handleDeleteDetail = useCallback((id: string) => {
    setDetailRows(prev => prev.filter(row => row.id !== id));
    toast.success('책무 세부내용이 삭제되었습니다.');
  }, []);

  /**
   * 직책 정보 DataGrid에 표시할 데이터 (직책 + 부점명 조합)
   */
  const positionGridData = useMemo(() => {
    if (!selectedPosition) return [];

    // 부점 목록이 있으면 각 부점마다 행 생성
    if (positionDepartments.length > 0) {
      return positionDepartments.map(dept => ({
        positionsName: selectedPosition.positionsName,
        hqName: selectedPosition.hqName,
        orgName: dept.org_name
      }));
    }

    // 부점 목록이 없으면 직책 정보만 표시
    return [{
      positionsName: selectedPosition.positionsName,
      hqName: selectedPosition.hqName,
      orgName: '-'
    }];
  }, [selectedPosition, positionDepartments]);

  /**
   * 직책 정보 DataGrid 컬럼 정의
   */
  const positionColumns = useMemo<ColDef<any>[]>(() => [
    {
      field: 'positionsName',
      headerName: '직책',
      flex: 1,
      sortable: false
    },
    {
      field: 'hqName',
      headerName: '본부명',
      flex: 1,
      sortable: false
    },
    {
      field: 'orgName',
      headerName: '부점명',
      flex: 1,
      sortable: false
    }
  ], []);

  /**
   * 책무 DataGrid 컬럼 정의
   */
  const responsibilityColumns = useMemo<ColDef<any>[]>(() => {
    // 책무카테고리 옵션 (코드명)
    const categoryNames = categoryOptions.map(c => c.detailName);
    // 책무 옵션 (코드명)
    const contentNames = responsibilityOptions.map(r => r.detailName);

    return [
      {
        field: 'category',
        headerName: '책무카테고리',
        width: 180,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: categoryNames
        },
        valueGetter: (params) => {
          if (!params.data?.category) return '';
          return categoryOptions.find(c => c.detailCode === params.data.category)?.detailName || '';
        },
        valueSetter: (params) => {
          const selected = categoryOptions.find(c => c.detailName === params.newValue);
          if (selected && params.data) {
            params.data.category = selected.detailCode;
            return true;
          }
          return false;
        }
      },
      {
        field: 'content',
        headerName: '책무',
        width: 300,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: contentNames
        },
        valueGetter: (params) => {
          if (!params.data?.content) return '';
          return responsibilityOptions.find(r => r.detailCode === params.data.content)?.detailName || '';
        },
        valueSetter: (params) => {
          const selected = responsibilityOptions.find(r => r.detailName === params.newValue);
          if (selected && params.data) {
            params.data.content = selected.detailCode;
            return true;
          }
          return false;
        }
      },
      {
        field: 'legal',
        headerName: '관련근거',
        flex: 1,
        sortable: false,
        editable: !isReadOnly
      },
      {
        field: 'isActive',
        headerName: '사용여부',
        width: 100,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Y', 'N']
        }
      },
      {
        field: 'actions',
        headerName: '작업',
        width: 80,
        sortable: false,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteResponsibility(params.data.id)}
                disabled={isReadOnly}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
      }
    ];
  }, [categoryOptions, responsibilityOptions, isReadOnly, handleDeleteResponsibility]);

  /**
   * 책무 세부내용 DataGrid 컬럼 정의
   */
  const detailColumns = useMemo<ColDef<any>[]>(() => [
    {
      field: 'responsibilityId',
      headerName: '연결된 책무',
      width: 200,
      sortable: false,
      valueGetter: (params) => {
        if (!params.data?.responsibilityId) return '';
        // responsibilityRows에서 해당 ID의 책무명 찾기
        const resp = responsibilityRows.find(r => r.id === params.data.responsibilityId);
        if (!resp?.content) return '';
        return responsibilityOptions.find(r => r.detailCode === resp.content)?.detailName || '';
      }
    },
    {
      field: 'detailInfo',
      headerName: '책무 세부내용',
      flex: 1,
      sortable: false,
      editable: !isReadOnly
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: false,
      editable: !isReadOnly,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Y', 'N']
      }
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 80,
      sortable: false,
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteDetail(params.data.id)}
              disabled={isReadOnly}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    }
  ], [responsibilityRows, responsibilityOptions, isReadOnly, handleDeleteDetail]);

  /**
   * 관리의무 DataGrid 컬럼 정의
   */
  const obligationColumns = useMemo<ColDef<any>[]>(() => [
    { field: 'linkedResp', headerName: '연결 책무', width: 200, sortable: false },
    { field: 'obligationContent', headerName: '관리의무', flex: 1, sortable: false },
    { field: 'updatedDate', headerName: '최종변경일자', width: 130, sortable: false },
    { field: 'isActive', headerName: '사용여부', width: 100, sortable: false }
  ], []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '600px'
        }
      }}
      aria-labelledby="responsibility-modal-title"
    >
      <DialogTitle
        id="responsibility-modal-title"
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="span" fontWeight={600}>
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

      <DialogContent dividers sx={{ p: 3 }}>
        {/* 직책 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="position-section-content"
            id="position-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>📋 직책</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* 책무이행차수와 직책을 한 줄에 배치 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {/* 책무이행차수 (왼쪽) */}
                <LedgerOrderComboBox
                  value={ledgerOrderId}
                  onChange={(value) => setLedgerOrderId(value || '')}
                  label="책무이행차수"
                  required
                  disabled={isReadOnly || mode === 'detail'}
                  size="small"
                />

                {/* 직책 (오른쪽) */}
                <FormControl fullWidth size="small">
                  <InputLabel>직책 *</InputLabel>
                  <Select
                    value={selectedPosition?.positionsId || ''}
                    onChange={(e) => handlePositionChange(Number(e.target.value))}
                    label="직책 *"
                    disabled={isReadOnly || loading || isLoadingPositions || availablePositions.length === 0}
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {availablePositions.map((position) => (
                      <MenuItem key={position.positionsId} value={position.positionsId}>
                        {position.positionsName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 직책 정보 DataGrid (부점명 포함) */}
              <Box sx={{ width: '100%', height: '180px' }}>
                <BaseDataGrid
                  data={positionGridData}
                  columns={positionColumns}
                  rowSelection="none"
                  pagination={false}
                  height="180px"
                  emptyMessage="직책을 선택하면 상세 정보가 표시됩니다."
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 책무 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="responsibility-section-content"
            id="responsibility-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>📌 책무</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {!isReadOnly && (
              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddResponsibility}
                  startIcon={<AddIcon />}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handleSaveResponsibility}
                  startIcon={<CheckIcon />}
                >
                  저장
                </Button>
              </Box>
            )}

            {/* 책무 목록 DataGrid - 셀 편집 가능, 행 선택 가능 */}
            <Box sx={{ width: '100%', height: '220px' }}>
              <BaseDataGrid
                data={responsibilityRows}
                columns={responsibilityColumns}
                rowSelection="single"
                pagination={false}
                height="220px"
                emptyMessage="등록된 책무가 없습니다. 추가 버튼을 눌러 책무를 등록하세요."
                onRowClicked={(event) => {
                  if (event.data?.id) {
                    setSelectedResponsibilityId(event.data.id);
                    toast.info(`책무가 선택되었습니다. 책무 세부내용을 추가할 수 있습니다.`, { autoClose: 1500 });
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 책무 세부내용 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="detail-section-content"
            id="detail-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>📝 책무 세부내용</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {!isReadOnly && (
              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddDetail}
                  startIcon={<AddIcon />}
                  disabled={!selectedResponsibilityId}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<CheckIcon />}
                >
                  저장
                </Button>
              </Box>
            )}
            {/* 책무 세부내용 목록 DataGrid - 셀 편집 가능 */}
            <Box sx={{ width: '100%', height: '220px' }}>
              <BaseDataGrid
                data={detailRows}
                columns={detailColumns}
                rowSelection="none"
                pagination={false}
                height="220px"
                emptyMessage="등록된 책무 세부내용이 없습니다. 책무를 선택 후 추가 버튼을 눌러 세부내용을 등록하세요."
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 관리의무 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="management-section-content"
            id="management-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>🔍 관리의무</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {!isReadOnly && (
              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                <Button variant="contained" size="small" startIcon={<AddIcon />}>
                  추가
                </Button>
                <Button variant="contained" size="small" color="success" startIcon={<CheckIcon />}>
                  저장
                </Button>
              </Box>
            )}
            {/* 관리의무 목록 DataGrid */}
            <Box sx={{ width: '100%', height: '220px' }}>
              <BaseDataGrid
                data={[]}
                columns={obligationColumns}
                rowSelection="none"
                pagination={false}
                height="220px"
                emptyMessage="등록된 관리의무가 없습니다."
              />
            </Box>
          </AccordionDetails>
        </Accordion>
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
        ) : (
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
                <Button variant="outlined" onClick={handleClose}>
                  닫기
                </Button>
                <Button variant="contained" onClick={handleEdit}>
                  수정
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilityFormModal;
