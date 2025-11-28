/**
 * 이행점검계획 등록/수정/상세 모달
 * PositionFormModal 표준 템플릿 기반
 *
 * 기능:
 * 1. 이행점검계획 기본 정보 등록 (impl_inspection_plans)
 * 2. 부서장업무메뉴얼 조회 및 선택하여 이행점검항목 생성 (impl_inspection_items)
 * 3. 원장차수 기반 부서장업무메뉴얼 필터링
 */

import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { PeriodSetting, PeriodSettingFormData } from '../../types/implMonitoring.types';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';

// API imports
import { getDeptManagerManualsByLedgerOrderId } from '@/domains/resps/api/deptManagerManualApi';
import { getImplInspectionItems } from '@/domains/compliance/api/implInspectionPlanApi';
import type { DeptManagerManualDto } from '@/domains/resps/types/deptManagerManual.types';

// 공통코드 Hook
import { useCommonCode } from '@/shared/hooks/useCommonCode';

// 부서장업무메뉴얼 타입 정의 (UI용)
interface DeptManagerManual {
  id: string;                    // BaseDataGrid 행 식별용 (manualCd와 동일값)
  manualCd: string;              // manualId -> manualCd로 변경 (PK)
  ledgerOrderId: string;
  obligationCd: string;
  orgCode: string;
  orgName: string;
  respItem: string;              // 책무관리항목
  activityName: string;          // 관리활동명
  execCheckMethod: string;       // 수행점검항목
  execCheckFrequencyCd: string;  // 수행점검주기
  isActive: string;
  status: string;
}

interface ImplMonitoringFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  period: PeriodSetting | null;
  onClose: () => void;
  onSave: (data: PeriodSettingFormData) => Promise<void>;
  onUpdate: (id: string, data: PeriodSettingFormData) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

const ImplMonitoringFormModal: React.FC<ImplMonitoringFormModalProps> = ({
  open,
  mode,
  period,
  onClose,
  onSave,
  onUpdate,
  onRefresh: _onRefresh, // 추후 새로고침 기능 사용 예정
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<PeriodSettingFormData>({
    ledgerOrderId: '',
    inspectionName: '',
    inspectionTypeCd: '',
    inspectionStartDate: '',
    inspectionEndDate: '',
    activityStartDate: '',
    activityEndDate: '',
    remarks: '',
    status: 'DRAFT',
    manualCds: []
  });

  // 원장차수 상태
  const [ledgerOrderId, setLedgerOrderId] = useState<string | null>(null);

  // 점검유형코드 상태
  const [inspectionTypeCd, setInspectionTypeCd] = useState<string>('');

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    ledgerOrderId: '',
    inspectionName: '',
    inspectionTypeCd: '',
    inspectionStartDate: '',
    inspectionEndDate: '',
    activityStartDate: '',
    activityEndDate: ''
  });

  // 부서장업무메뉴얼 목록 상태
  const [manuals, setManuals] = useState<DeptManagerManual[]>([]);
  const [selectedManuals, setSelectedManuals] = useState<DeptManagerManual[]>([]);

  // 점검주기 공통코드 (ACVT_FRCD)
  const { getCodeName: getFrequencyName } = useCommonCode('ACVT_FRCD');

  // 부서장업무메뉴얼 컬럼 정의
  const manualColumns = useMemo<ColDef<DeptManagerManual>[]>(() => [
    {
      headerCheckboxSelection: mode === 'create',
      checkboxSelection: mode === 'create',
      width: 50,
      maxWidth: 50,
      headerClass: 'ag-header-center',
      cellClass: 'ag-cell-center'
    },
    {
      field: 'orgName',
      headerName: '부서명',
      width: 120,
      minWidth: 100,
      sortable: true,
      cellClass: 'ag-cell-center'
    },
    {
      field: 'respItem',
      headerName: '책무관리항목',
      width: 200,
      minWidth: 150,
      sortable: true,
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 30 ? `${value.substring(0, 30)}...` : value;
      }
    },
    {
      field: 'activityName',
      headerName: '관리활동명',
      flex: 1,
      minWidth: 200,
      sortable: true,
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 40 ? `${value.substring(0, 40)}...` : value;
      }
    },
    {
      field: 'execCheckFrequencyCd',
      headerName: '점검주기',
      width: 100,
      minWidth: 80,
      sortable: true,
      cellClass: 'ag-cell-center',
      cellRenderer: (params: { value: string }) => {
        // 공통코드(ACVT_FRCD)로 코드명 변환
        return params.value ? getFrequencyName(params.value) : '';
      }
    }
  ], [mode, getFrequencyName]);

  /**
   * 폼 초기화
   * - 등록 모드: 빈 폼으로 초기화
   * - 상세 모드: 기존 데이터로 초기화 및 이행점검항목 로드
   */
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        // 등록 모드: 빈 폼으로 초기화
        setFormData({
          ledgerOrderId: '',
          inspectionName: '',
          inspectionTypeCd: '',
          inspectionStartDate: '',
          inspectionEndDate: '',
          activityStartDate: '',
          activityEndDate: '',
          remarks: '',
          status: 'DRAFT',
          manualCds: []
        });
        setLedgerOrderId(null);
        setInspectionTypeCd('');
        setIsEditing(true);
        setErrors({
          ledgerOrderId: '',
          inspectionName: '',
          inspectionTypeCd: '',
          inspectionStartDate: '',
          inspectionEndDate: '',
          activityStartDate: '',
          activityEndDate: ''
        });
        setManuals([]);
        setSelectedManuals([]);
      } else if (period) {
        // 상세 모드: 기존 데이터로 초기화
        setFormData({
          ledgerOrderId: period.ledgerOrderId,
          inspectionName: period.inspectionName,
          inspectionTypeCd: period.inspectionTypeCd || '',
          inspectionStartDate: period.inspectionStartDate,
          inspectionEndDate: period.inspectionEndDate,
          activityStartDate: period.activityStartDate || '',
          activityEndDate: period.activityEndDate || '',
          remarks: period.remarks || '',
          status: period.status,
          manualCds: []
        });
        setLedgerOrderId(period.ledgerOrderId);
        setInspectionTypeCd(period.inspectionTypeCd || (period.inspectionType === '정기점검' ? '01' : '02'));
        setIsEditing(false);
        setErrors({
          ledgerOrderId: '',
          inspectionName: '',
          inspectionTypeCd: '',
          inspectionStartDate: '',
          inspectionEndDate: '',
          activityStartDate: '',
          activityEndDate: ''
        });

        // 상세 모드에서 관련 이행점검항목 로드
        loadInspectionItems(period.id);
      }
    }
  }, [open, mode, period]);

  // 원장차수 변경 시 부서장업무메뉴얼 조회
  useEffect(() => {
    if (mode === 'create' && ledgerOrderId) {
      loadDeptManagerManuals(ledgerOrderId);
    }
  }, [ledgerOrderId, mode]);

  /**
   * 부서장업무메뉴얼 조회 함수 (API 호출)
   * - 원장차수ID로 dept_manager_manuals 테이블 조회
   * - 점검대상 선택을 위해 사용
   */
  const loadDeptManagerManuals = useCallback(async (ledgerOrderId: string) => {
    try {
      // 실제 API 호출 (dept_manager_manuals 테이블 조회)
      const response = await getDeptManagerManualsByLedgerOrderId(ledgerOrderId);

      // API 응답을 UI 타입으로 변환
      const convertedManuals: DeptManagerManual[] = response.map((dto: DeptManagerManualDto) => ({
        id: dto.manualCd,  // BaseDataGrid 행 식별용
        manualCd: dto.manualCd,
        ledgerOrderId: dto.ledgerOrderId,
        obligationCd: dto.obligationCd || '',
        orgCode: dto.orgCode,
        orgName: dto.orgName || dto.orgCode, // orgName이 없으면 orgCode 사용
        respItem: dto.respItem,
        activityName: dto.activityName,
        execCheckMethod: dto.execCheckMethod || '',
        execCheckFrequencyCd: dto.execCheckFrequencyCd || '',
        isActive: dto.isActive,
        status: dto.status || '' // undefined인 경우 빈 문자열로 처리
      }));

      setManuals(convertedManuals);
      console.log(`부서장업무메뉴얼 ${convertedManuals.length}건 조회 완료`);
    } catch (error) {
      console.error('부서장업무메뉴얼 조회 실패:', error);
      setManuals([]);
    }
  }, []);

  /**
   * 이행점검항목 조회 함수 (상세 모드)
   * - 이행점검계획ID로 impl_inspection_items 테이블 조회
   * - 각 항목의 관련 부서장업무메뉴얼 정보 표시
   */
  const loadInspectionItems = useCallback(async (periodId: string) => {
    try {
      // 실제 API 호출 (impl_inspection_items 테이블 조회)
      const response = await getImplInspectionItems(periodId);

      // API 응답을 UI 타입으로 변환 (deptManagerManual 정보 사용)
      const convertedItems: DeptManagerManual[] = response.map((item) => ({
        id: item.implInspectionItemId || item.manualCd,  // BaseDataGrid 행 식별용
        manualCd: item.manualCd,
        ledgerOrderId: '', // 연관 엔티티에서 가져옴
        obligationCd: item.deptManagerManual?.obligationCd || '',
        orgCode: item.deptManagerManual?.orgCode || '',
        orgName: item.deptManagerManual?.orgName || '',
        respItem: item.deptManagerManual?.respItem || '',
        activityName: item.deptManagerManual?.activityName || '',
        execCheckMethod: '',
        execCheckFrequencyCd: item.deptManagerManual?.execCheckFrequencyCd || '', // 점검주기 추가
        isActive: item.isActive,
        status: item.inspectionStatusCd
      }));

      setSelectedManuals(convertedItems);
      console.log(`이행점검항목 ${convertedItems.length}건 조회 완료`);
      console.log('이행점검항목 데이터:', convertedItems);
    } catch (error) {
      console.error('이행점검항목 조회 실패:', error);
      setSelectedManuals([]);
    }
  }, []);

  // 폼 필드 변경 핸들러
  const handleChange = useCallback((field: keyof PeriodSettingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // 유효성 검증
  const validate = useCallback((): boolean => {
    const newErrors = {
      ledgerOrderId: '',
      inspectionName: '',
      inspectionTypeCd: '',
      inspectionStartDate: '',
      inspectionEndDate: '',
      activityStartDate: '',
      activityEndDate: ''
    };

    if (!ledgerOrderId) {
      newErrors.ledgerOrderId = '원장차수를 선택해주세요';
    }
    if (!formData.inspectionName.trim()) {
      newErrors.inspectionName = '점검명을 입력해주세요';
    }
    if (!inspectionTypeCd) {
      newErrors.inspectionTypeCd = '점검유형을 선택해주세요';
    }
    if (!formData.inspectionStartDate) {
      newErrors.inspectionStartDate = '점검 시작일을 입력해주세요';
    }
    if (!formData.inspectionEndDate) {
      newErrors.inspectionEndDate = '점검 종료일을 입력해주세요';
    }

    // 날짜 유효성 검증
    if (formData.inspectionStartDate && formData.inspectionEndDate) {
      if (new Date(formData.inspectionEndDate) < new Date(formData.inspectionStartDate)) {
        newErrors.inspectionEndDate = '점검 종료일은 시작일 이후여야 합니다';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  }, [formData, ledgerOrderId, inspectionTypeCd]);

  /**
   * 저장 핸들러
   * - 유효성 검증 후 부모 컴포넌트의 onSave 호출
   * - onSave에서 impl_inspection_plans + impl_inspection_items 일괄 생성
   */
  const handleSave = useCallback(async () => {
    if (!validate()) {
      return;
    }

    try {
      if (mode === 'create') {
        // 점검대상 선택 확인
        if (selectedManuals.length === 0) {
          alert('점검할 업무메뉴얼을 선택해주세요');
          return;
        }

        // 원장차수 확인
        if (!ledgerOrderId) {
          alert('원장차수를 선택해주세요');
          return;
        }

        // PeriodSettingFormData 생성 (manualCds 포함)
        const saveData: PeriodSettingFormData = {
          ledgerOrderId: ledgerOrderId,
          inspectionName: formData.inspectionName,
          inspectionTypeCd: inspectionTypeCd,
          inspectionStartDate: formData.inspectionStartDate,
          inspectionEndDate: formData.inspectionEndDate,
          activityStartDate: formData.activityStartDate,
          activityEndDate: formData.activityEndDate,
          remarks: formData.remarks,
          status: formData.status,
          manualCds: selectedManuals.map(m => m.manualCd) // 선택된 점검대상 manualCd 목록
        };

        console.log('이행점검계획 저장 데이터:', saveData);

        // 부모 컴포넌트의 onSave 호출 (실제 API 호출은 ImplMonitoring.tsx에서 수행)
        await onSave(saveData);

        // onClose는 부모에서 성공 시 호출됨
      } else if (mode === 'detail' && period && isEditing) {
        // 수정 모드
        const updateData: PeriodSettingFormData = {
          ledgerOrderId: ledgerOrderId || period.ledgerOrderId,
          inspectionName: formData.inspectionName,
          inspectionTypeCd: inspectionTypeCd,
          inspectionStartDate: formData.inspectionStartDate,
          inspectionEndDate: formData.inspectionEndDate,
          activityStartDate: formData.activityStartDate,
          activityEndDate: formData.activityEndDate,
          remarks: formData.remarks,
          status: formData.status,
          manualCds: [] // 수정 시에는 항목 변경 없음
        };

        await onUpdate(period.id, updateData);
      }
    } catch (error) {
      console.error('이행점검계획 저장 실패:', error);
      alert(error instanceof Error ? error.message : '이행점검계획 저장에 실패했습니다.');
    }
  }, [mode, formData, period, isEditing, validate, ledgerOrderId, inspectionTypeCd, selectedManuals, onSave, onUpdate]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  /**
   * 취소 핸들러
   * - 상세 모드: 수정 취소 시 원래 데이터로 복원
   * - 등록 모드: 모달 닫기
   */
  const handleCancel = useCallback(() => {
    if (mode === 'detail' && period) {
      // 상세 모드에서 수정 취소: 원래 데이터로 복원
      setFormData({
        ledgerOrderId: period.ledgerOrderId,
        inspectionName: period.inspectionName,
        inspectionTypeCd: period.inspectionTypeCd || '',
        inspectionStartDate: period.inspectionStartDate,
        inspectionEndDate: period.inspectionEndDate,
        activityStartDate: period.activityStartDate || '',
        activityEndDate: period.activityEndDate || '',
        remarks: period.remarks || '',
        status: period.status,
        manualCds: []
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, period, onClose]);

  // 부서장업무메뉴얼 선택 핸들러
  const handleSelectionChange = useCallback((selected: DeptManagerManual[]) => {
    setSelectedManuals(selected);
  }, []);

  const title = mode === 'create' ? '이행점검계획 등록' : '이행점검계획 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

  // 수정 모드에서도 원장차수는 항상 비활성화 (수정 불가 필드)
  const isLedgerOrderDisabled = mode === 'detail';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1
        }}
      >
        <span>{title}</span>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'var(--theme-page-header-text)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 기본 정보 섹션 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
              📋 기본 정보
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* 원장차수 + 점검유형 한줄 */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <LedgerOrderComboBox
                  value={ledgerOrderId || undefined}
                  onChange={setLedgerOrderId}
                  label="원장차수"
                  required
                  disabled={isLedgerOrderDisabled}
                  error={!!errors.ledgerOrderId}
                  helperText={errors.ledgerOrderId}
                  fullWidth
                  size="small"
                />
                <FormControl
                  fullWidth
                  size="small"
                  required
                  disabled={isReadOnly}
                  error={!!errors.inspectionTypeCd}
                >
                  <InputLabel>점검유형</InputLabel>
                  <Select
                    value={inspectionTypeCd}
                    onChange={(e) => {
                      setInspectionTypeCd(e.target.value);
                      setErrors(prev => ({ ...prev, inspectionTypeCd: '' }));
                    }}
                    label="점검유형"
                  >
                    <MenuItem value="01">정기점검</MenuItem>
                    <MenuItem value="02">특별점검</MenuItem>
                  </Select>
                  {errors.inspectionTypeCd && (
                    <FormHelperText>{errors.inspectionTypeCd}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* 점검명 */}
              <TextField
                label="점검명"
                value={formData.inspectionName}
                onChange={(e) => handleChange('inspectionName', e.target.value)}
                required
                disabled={isReadOnly}
                error={!!errors.inspectionName}
                helperText={errors.inspectionName}
                fullWidth
                size="small"
                placeholder="예: 2024년 상반기 내부통제 점검"
              />

              {/* 점검 수행기간 */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  label="점검 시작일"
                  type="date"
                  value={formData.inspectionStartDate}
                  onChange={(e) => handleChange('inspectionStartDate', e.target.value)}
                  required
                  disabled={isReadOnly}
                  error={!!errors.inspectionStartDate}
                  helperText={errors.inspectionStartDate}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="점검 종료일"
                  type="date"
                  value={formData.inspectionEndDate}
                  onChange={(e) => handleChange('inspectionEndDate', e.target.value)}
                  required
                  disabled={isReadOnly}
                  error={!!errors.inspectionEndDate}
                  helperText={errors.inspectionEndDate}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              {/* 비고 */}
              <TextField
                label="비고"
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                disabled={isReadOnly}
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="점검에 대한 추가 설명을 입력하세요"
              />
            </Box>
          </Box>

          {/* 부서장업무메뉴얼 선택 섹션 (등록 모드) */}
          {mode === 'create' && manuals.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
                ✅ 점검대상 선택 ({selectedManuals.length}/{manuals.length}개 선택됨)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                점검할 업무메뉴얼을 선택하세요. 선택된 항목은 이행점검항목으로 등록됩니다.
              </Typography>
              <Box sx={{ width: '100%', height: '300px' }}>
                <BaseDataGrid
                  data={manuals}
                  columns={manualColumns}
                  rowSelection="multiple"
                  onSelectionChange={handleSelectionChange}
                  pagination={true}
                  height="300px"
                />
              </Box>
            </Box>
          )}

          {/* 이행점검항목 목록 (상세 모드) */}
          {mode === 'detail' && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
                📊 이행점검항목 목록 ({selectedManuals.length}개)
              </Typography>
              <Box sx={{ width: '100%', height: '300px' }}>
                <BaseDataGrid
                  data={selectedManuals}
                  columns={manualColumns.filter(col => col.field !== undefined)}
                  rowSelection="none"
                  pagination={true}
                  height="300px"
                />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {mode === 'detail' && !isEditing ? (
          <>
            <Button variant="outlined" onClick={onClose}>
              닫기
            </Button>
            <Button variant="contained" onClick={handleEdit}>
              수정
            </Button>
          </>
        ) : (
          <>
            <Button variant="outlined" onClick={handleCancel} disabled={loading}>
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              {mode === 'create' ? '등록' : '저장'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

ImplMonitoringFormModal.displayName = 'ImplMonitoringFormModal';

export default ImplMonitoringFormModal;
