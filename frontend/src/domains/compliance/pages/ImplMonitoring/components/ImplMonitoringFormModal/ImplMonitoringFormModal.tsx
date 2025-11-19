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
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
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

// 부서장업무메뉴얼 타입 정의
interface DeptManagerManual {
  manualId: number;
  ledgerOrderId: string;
  obligationCd: string;
  orgCode: string;
  orgName: string;
  activityTypeCd: string;
  activityName: string;
  activityDetail: string;
  riskAssessmentLevelCd: string;
  activityFrequencyCd: string;
  evidenceTypeCd: string;
  implCheckFrequencyCd: string;
  isConditionalCheck: 'Y' | 'N';
  implCheckMethod: string;
  isActive: 'Y' | 'N';
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
  onRefresh,
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<PeriodSettingFormData>({
    inspectionName: '',
    inspectionStartDate: '',
    inspectionEndDate: '',
    activityStartDate: '',
    activityEndDate: '',
    description: '',
    status: 'DRAFT'
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

  // 부서장업무메뉴얼 컬럼 정의
  const manualColumns = useMemo<ColDef<DeptManagerManual>[]>(() => [
    {
      headerCheckboxSelection: mode === 'create',
      checkboxSelection: mode === 'create',
      width: 10,
      headerClass: 'ag-header-center',
      cellClass: 'ag-cell-center'
    },
    {
      field: 'orgName',
      headerName: '부서명',
      width: 60,
      sortable: true
    },
    {
      field: 'activityName',
      headerName: '관리활동명',
      flex: 1,
      sortable: true,
      cellRenderer: (params: any) => {
        const value = params.value;
        return value && value.length > 40 ? `${value.substring(0, 40)}...` : value;
      }
    },
    {
      field: 'implCheckFrequencyCd',
      headerName: '점검주기',
      width: 50,
      sortable: true,
      cellClass: 'ag-cell-center'
    }
  ], [mode]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        setFormData({
          inspectionName: '',
          inspectionStartDate: '',
          inspectionEndDate: '',
          description: '',
          status: 'DRAFT'
        });
        setLedgerOrderId(null);
        setInspectionTypeCd('');
        setIsEditing(true);
        setErrors({
          ledgerOrderId: '',
          inspectionName: '',
          inspectionTypeCd: '',
          inspectionStartDate: '',
          inspectionEndDate: ''
        });
        setManuals([]);
        setSelectedManuals([]);
      } else if (period) {
        // 상세 모드
        setFormData({
          inspectionName: period.inspectionName,
          inspectionStartDate: period.inspectionStartDate,
          inspectionEndDate: period.inspectionEndDate,
          description: '',
          status: period.status
        });
        setLedgerOrderId(period.ledgerOrderId);
        setInspectionTypeCd(period.inspectionType === '정기점검' ? '01' : '02');
        setIsEditing(false);
        setErrors({
          ledgerOrderId: '',
          inspectionName: '',
          inspectionTypeCd: '',
          inspectionStartDate: '',
          inspectionEndDate: ''
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

  // 부서장업무메뉴얼 조회 함수
  const loadDeptManagerManuals = useCallback(async (ledgerOrderId: string) => {
    try {
      // TODO: 실제 API 호출
      // const response = await deptManagerManualsApi.getByLedgerOrderId(ledgerOrderId);
      // setManuals(response.data);

      // 임시 데이터
      const mockManuals: DeptManagerManual[] = [
        {
          manualId: 1,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL001',
          orgCode: 'ORG001',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '중요계약서 서식 및 내용의 적정성 검토에 대한 점검',
          activityDetail: '분기별 내부통제 시스템 점검 및 보고',
          riskAssessmentLevelCd: '01',
          activityFrequencyCd: '03',
          evidenceTypeCd: '01',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'N',
          implCheckMethod: '문서검토 및 담당자 인터뷰',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 2,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL002',
          orgCode: 'ORG002',
          orgName: '준법지원팀',
          activityTypeCd: '02',
          activityName: '법률 관련 질의회신 내용의 적정성 검토에 대한 점검',
          activityDetail: '월별 리스크 평가 및 경영진 보고',
          riskAssessmentLevelCd: '01',
          activityFrequencyCd: '02',
          evidenceTypeCd: '02',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'N',
          implCheckMethod: '리스크 평가 보고서 검토',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 3,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL003',
          orgCode: 'ORG003',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '소송관련 업무 전반에 대한 지원 점검',
          activityDetail: '전 직원 대상 분기별 컴플라이언스 교육',
          riskAssessmentLevelCd: '02',
          activityFrequencyCd: '03',
          evidenceTypeCd: '03',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'Y',
          implCheckMethod: '교육 이수 현황 및 평가 결과 확인',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 4,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL003',
          orgCode: 'ORG003',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '외부위임 소송사건의 업무 처리 적정성 점검',
          activityDetail: '전 직원 대상 분기별 컴플라이언스 교육',
          riskAssessmentLevelCd: '02',
          activityFrequencyCd: '03',
          evidenceTypeCd: '03',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'Y',
          implCheckMethod: '교육 이수 현황 및 평가 결과 확인',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 5,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL003',
          orgCode: 'ORG003',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '정관 변경 및 내규 제·개정·폐지 시 사전심의 및 협의 절차 점검',
          activityDetail: '전 직원 대상 분기별 컴플라이언스 교육',
          riskAssessmentLevelCd: '02',
          activityFrequencyCd: '03',
          evidenceTypeCd: '03',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'Y',
          implCheckMethod: '교육 이수 현황 및 평가 결과 확인',
          isActive: 'Y',
          status: 'active'
        }
      ];
      setManuals(mockManuals);
    } catch (error) {
      console.error('부서장업무메뉴얼 조회 실패:', error);
      setManuals([]);
    }
  }, []);

  // 이행점검항목 조회 함수 (상세 모드)
  const loadInspectionItems = useCallback(async (_periodId: string) => {
    try {
      // TODO: 실제 API 호출
      // const response = await implInspectionItemsApi.getByPlanId(periodId);
      // setSelectedManuals(response.data.map(item => item.manual));

      // 임시 데이터
      const mockItems: DeptManagerManual[] = [
        {
          manualId: 1,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL001',
          orgCode: 'ORG001',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '중요계약서 서식 및 내용의 적정성 검토에 대한 점검',
          activityDetail: '분기별 내부통제 시스템 점검 및 보고',
          riskAssessmentLevelCd: '01',
          activityFrequencyCd: '03',
          evidenceTypeCd: '01',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'N',
          implCheckMethod: '문서검토 및 담당자 인터뷰',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 2,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL002',
          orgCode: 'ORG002',
          orgName: '준법지원팀',
          activityTypeCd: '02',
          activityName: '법률 관련 질의회신 내용의 적정성 검토에 대한 점검',
          activityDetail: '월별 리스크 평가 및 경영진 보고',
          riskAssessmentLevelCd: '01',
          activityFrequencyCd: '02',
          evidenceTypeCd: '02',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'N',
          implCheckMethod: '리스크 평가 보고서 검토',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 3,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL003',
          orgCode: 'ORG003',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '소송관련 업무 전반에 대한 지원 점검',
          activityDetail: '전 직원 대상 분기별 컴플라이언스 교육',
          riskAssessmentLevelCd: '02',
          activityFrequencyCd: '03',
          evidenceTypeCd: '03',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'Y',
          implCheckMethod: '교육 이수 현황 및 평가 결과 확인',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 4,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL003',
          orgCode: 'ORG003',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '외부위임 소송사건의 업무 처리 적정성 점검',
          activityDetail: '전 직원 대상 분기별 컴플라이언스 교육',
          riskAssessmentLevelCd: '02',
          activityFrequencyCd: '03',
          evidenceTypeCd: '03',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'Y',
          implCheckMethod: '교육 이수 현황 및 평가 결과 확인',
          isActive: 'Y',
          status: 'active'
        },
        {
          manualId: 5,
          ledgerOrderId: ledgerOrderId,
          obligationCd: 'OBL003',
          orgCode: 'ORG003',
          orgName: '준법지원팀',
          activityTypeCd: '01',
          activityName: '정관 변경 및 내규 제·개정·폐지 시 사전심의 및 협의 절차 점검',
          activityDetail: '전 직원 대상 분기별 컴플라이언스 교육',
          riskAssessmentLevelCd: '02',
          activityFrequencyCd: '03',
          evidenceTypeCd: '03',
          implCheckFrequencyCd: '월간',
          isConditionalCheck: 'Y',
          implCheckMethod: '교육 이수 현황 및 평가 결과 확인',
          isActive: 'Y',
          status: 'active'
        }
      ];
      setSelectedManuals(mockItems);
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

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!validate()) {
      return;
    }

    try {
      if (mode === 'create') {
        // TODO: 실제 API 호출
        // 1. impl_inspection_plans 생성
        // 2. 선택된 부서장업무메뉴얼로 impl_inspection_items 생성

        if (selectedManuals.length === 0) {
          alert('점검할 업무메뉴얼을 선택해주세요');
          return;
        }

        console.log('이행점검계획 생성:', {
          ledgerOrderId,
          inspectionName: formData.inspectionName,
          inspectionTypeCd,
          inspectionStartDate: formData.inspectionStartDate,
          inspectionEndDate: formData.inspectionEndDate,
          activityStartDate: formData.activityStartDate,
          activityEndDate: formData.activityEndDate,
          status: formData.status,
          selectedManualIds: selectedManuals.map(m => m.manualId)
        });

        alert('이행점검계획이 성공적으로 등록되었습니다.');

        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      } else if (mode === 'detail' && period && isEditing) {
        // 수정 모드
        // TODO: 실제 API 호출
        console.log('이행점검계획 수정:', {
          id: period.id,
          formData
        });

        alert('이행점검계획이 성공적으로 수정되었습니다.');

        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      }
    } catch (error) {
      console.error('이행점검계획 저장 실패:', error);
      alert(error instanceof Error ? error.message : '이행점검계획 저장에 실패했습니다.');
    }
  }, [mode, formData, period, isEditing, validate, ledgerOrderId, inspectionTypeCd, selectedManuals, onRefresh, onClose]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && period) {
      setFormData({
        inspectionName: period.inspectionName,
        inspectionStartDate: period.inspectionStartDate,
        inspectionEndDate: period.inspectionEndDate,
        activityStartDate: period.activityStartDate,
        activityEndDate: period.activityEndDate,
        description: '',
        status: period.status
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
          fontWeight: 600
        }}
      >
        {title}
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
                  disabled={isReadOnly}
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

              {/* 설명 */}
              <TextField
                label="설명"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
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
          {mode === 'detail' && selectedManuals.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
                📊 이행점검항목 목록 ({selectedManuals.length}개)
              </Typography>
              <Box sx={{ width: '100%', height: '300px' }}>
                <BaseDataGrid
                  data={selectedManuals}
                  columns={manualColumns.filter(col => !col.checkboxSelection)}
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
