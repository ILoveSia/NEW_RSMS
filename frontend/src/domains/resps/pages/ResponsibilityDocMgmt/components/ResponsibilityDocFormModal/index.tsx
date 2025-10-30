/**
 * 책무기술서 등록/상세 모달
 * PositionFormModal 표준 템플릿 기반
 *
 * 주요 기능:
 * 1. 직책 선택 시 관련 정보 자동 설정 (겸직여부, 현직책부여일, 겸직사항, 소관부점, 주관회의체)
 * 2. 임원 및 직책 정보 입력
 * 3. 책무정보 입력 (책무개요, 책무분배일자)
 * 4. 책무목록 및 관리의무 동적 추가/삭제
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { ColDef } from 'ag-grid-community';
import type {
  ResponsibilityDoc,
  ResponsibilityDocFormData
} from '../../types/responsibilityDoc.types';
import { getPositionsByLedgerOrderId, type PositionDto } from '@/domains/resps/api/positionApi';
import {
  getPositionResponsibilityData,
  type PositionResponsibilityData
} from '@/domains/resps/api/responsibilityDocApi';
import toast from '@/shared/utils/toast';
import LedgerOrderComboBox from '@/domains/resps/components/molecules/LedgerOrderComboBox/LedgerOrderComboBox';
import { useCommonCode } from '@/shared/hooks/useCommonCode';
import { useOrganization } from '@/shared/hooks/useOrganization';

// 직책 선택 모달용 타입
interface PositionSelectData {
  positionId: number;
  positionName: string;
  hqName: string; // 본부명
  isConcurrent: string; // 겸직여부 (Y/N)
  employeeName: string;
  currentPositionDate: string;
  dualPositionDetails: string;
  responsibleDepts: string;
  mainCommittees: CommitteeData[];
}

// 회의체 데이터 타입
interface CommitteeData {
  id: string;
  committeeName: string;
  chairperson: string;
  frequency: string;
  mainAgenda: string;
}

// 책무 데이터 타입
interface ResponsibilityItemData {
  id: string;
  seq: number;
  responsibility: string;
  responsibilityDetail: string;
  relatedBasis: string;
}

// 관리의무 데이터 타입
interface ManagementDutyData {
  id: string;
  seq: number;
  duty: string;
}

// 유효성 검사 스키마
const validationSchema = yup.object({
  positionName: yup.string().required('직책을 선택해주세요'),
  employeeName: yup.string(),
  isDual: yup.boolean().required(),
  currentPositionDate: yup.string(),
  dualPositionDetails: yup.string(),
  responsibleDepts: yup.string(),
  responsibilityOverview: yup.string().required('책무개요를 입력해주세요'),
  responsibilityDistributionDate: yup.string().required('책무 분배일자를 선택해주세요')
});

interface ResponsibilityDocFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  doc?: ResponsibilityDoc | null;
  onClose: () => void;
  onSave: (data: ResponsibilityDocFormData) => Promise<void>;
  onUpdate: (id: string, data: ResponsibilityDocFormData) => Promise<void>;
  loading?: boolean;
}

const ResponsibilityDocFormModal: React.FC<ResponsibilityDocFormModalProps> = ({
  open,
  onClose,
  mode,
  loading = false
}) => {

  // 공통코드 Hook
  const holdingPeriodCode = useCommonCode('CFRN_CYCL_DVCD'); // 개최주기
  const responsibilityCode = useCommonCode('RSBT_OBLG_CD'); // 책무

  // 조직 Hook
  const { getOrgName } = useOrganization();

  // 원장차수 선택 상태
  const [selectedLedgerOrderId, setSelectedLedgerOrderId] = useState<string | null>(null);

  // 직책 선택 모달 상태
  const [positionSelectOpen, setPositionSelectOpen] = useState(false);
  const [positions, setPositions] = useState<PositionSelectData[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // 회의체, 책무, 관리의무 상태 관리
  const [committees, setCommittees] = useState<CommitteeData[]>([]);
  const [responsibilities, setResponsibilities] = useState<ResponsibilityItemData[]>([
    { id: '1', seq: 1, responsibility: '', responsibilityDetail: '', relatedBasis: '' }
  ]);
  const [managementDuties, setManagementDuties] = useState<ManagementDutyData[]>([
    { id: '1', seq: 1, duty: '' }
  ]);
  const [isEditing, setIsEditing] = useState(false);

  // 읽기 전용 모드 계산 (컬럼 정의보다 먼저 선언)
  const isReadOnly = mode === 'detail' && !isEditing;

  // React Hook Form 초기화
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      positionName: '',
      employeeName: '',
      isDual: false,
      currentPositionDate: '',
      dualPositionDetails: '',
      responsibleDepts: '',
      responsibilityOverview: '',
      responsibilityDistributionDate: ''
    }
  });

  // 모드 변경 시 초기화
  useEffect(() => {
    if (mode === 'create') {
      setIsEditing(true);
      setCommittees([]);
      setResponsibilities([
        { id: '1', seq: 1, responsibility: '', responsibilityDetail: '', relatedBasis: '' }
      ]);
      setManagementDuties([
        { id: '1', seq: 1, duty: '' }
      ]);
      reset();
    } else {
      setIsEditing(false);
    }
  }, [mode, open, reset]);

  // 직책 선택 핸들러 - API 호출하여 직책 목록 조회
  const handlePositionSelect = useCallback(async () => {
    // 원장차수가 선택되지 않은 경우
    if (!selectedLedgerOrderId) {
      toast.error('먼저 책무이행차수를 선택해주세요.');
      return;
    }

    setPositionSelectOpen(true);
    setIsLoadingPositions(true);

    try {
      const positionDtos: PositionDto[] = await getPositionsByLedgerOrderId(selectedLedgerOrderId);

      // PositionDto → PositionSelectData 변환
      const positionSelectData: PositionSelectData[] = positionDtos.map(dto => ({
        positionId: dto.positionsId,
        positionName: dto.positionsName,
        hqName: dto.hqName,
        isConcurrent: dto.isConcurrent,
        // TODO: 실제 데이터는 API에서 가져와야 함
        employeeName: '',
        currentPositionDate: '',
        dualPositionDetails: '',
        responsibleDepts: '',
        mainCommittees: []
      }));

      setPositions(positionSelectData);
    } catch (error) {
      console.error('[ResponsibilityDocFormModal] 직책 목록 조회 실패:', error);
      toast.error('직책 목록을 불러오는데 실패했습니다.');
      setPositions([]);
    } finally {
      setIsLoadingPositions(false);
    }
  }, [selectedLedgerOrderId]);

  // 직책 선택 확인 핸들러 (실제 API 호출하여 7개 필드 자동 설정)
  const handlePositionConfirm = useCallback(async (position: PositionSelectData) => {
    try {
      // 백엔드 API 호출하여 직책 관련 데이터 조회
      const data = await getPositionResponsibilityData(position.positionId);

      // 1. 겸직여부 (Y/N → boolean 변환)
      setValue('isDual', data.isConcurrent === 'Y');

      // 2. 현 직책 부여일
      setValue('currentPositionDate', data.positionAssignedDate || '');

      // 3. 겸직사항
      setValue('dualPositionDetails', data.concurrentPosition || '');

      // 4. 소관부점 (comma-separated string)
      setValue('responsibleDepts', data.departments);

      // 5. 주관회의체 (Grid 데이터 변환 - CommitteeData 타입에 맞게)
      const committeeData = data.committees.map((committee, index) => ({
        id: String(committee.committeesId),
        committeeName: committee.committeesTitle,
        chairperson: committee.committeesType === 'chair' ? '의장' : '위원',  // 임시 매핑
        frequency: committee.committeeFrequency,
        mainAgenda: committee.resolutionMatters
      }));
      setCommittees(committeeData);

      // 6. 책무목록 (Grid 데이터 변환 - ResponsibilityItemData 타입에 맞게)
      const responsibilityData = data.responsibilities.map((resp, index) => ({
        id: String(resp.responsibilityId),
        seq: index + 1,
        responsibility: `[${resp.responsibilityCat}] ${resp.responsibilityCd}`,
        responsibilityDetail: resp.responsibilityDetailInfo || '', // responsibility_details 테이블의 responsibility_detail_info
        relatedBasis: resp.responsibilityLegal
      }));
      setResponsibilities(responsibilityData);

      // 7. 관리의무 (Grid 데이터 변환 - ManagementDutyData 타입에 맞게)
      const managementDutyData = data.managementObligations.map((obligation, index) => ({
        id: String(obligation.managementObligationId),
        seq: index + 1,
        duty: `[${obligation.obligationMajorCatCd}-${obligation.obligationMiddleCatCd}] ${obligation.obligationInfo} (${obligation.orgCode})`
      }));
      setManagementDuties(managementDutyData);

      // 직책명과 성명도 설정
      setValue('positionName', position.positionName);
      setValue('employeeName', position.employeeName);

      setPositionSelectOpen(false);
    } catch (error) {
      console.error('[ResponsibilityDocFormModal] 직책 데이터 조회 실패:', error);
      toast.error('직책 데이터를 불러오는데 실패했습니다.');
    }
  }, [setValue]);

  // 직책 선택 모달
  const renderPositionSelectModal = () => {
    const columns: ColDef<PositionSelectData>[] = [
      {
        headerName: '순번',
        width: 80,
        valueGetter: (params) => {
          const index = positions.findIndex(p => p.positionId === params.data?.positionId);
          return index + 1;
        }
      },
      { field: 'positionName', headerName: '직책', flex: 1 },
      { field: 'hqName', headerName: '본부명', flex: 1 },
      {
        field: 'isConcurrent',
        headerName: '겸직여부',
        width: 100
      }
    ];

    return (
      <Dialog
        open={positionSelectOpen}
        onClose={() => setPositionSelectOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontWeight: 600
        }}>
          직책 선택
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: '400px' }}>
            {isLoadingPositions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>직책 목록을 불러오는 중...</Typography>
              </Box>
            ) : (
              <BaseDataGrid
                data={positions}
                columns={columns}
                rowSelection="single"
                onRowDoubleClick={(data) => handlePositionConfirm(data)}
                height="400px"
                emptyMessage="조회된 직책이 없습니다."
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setPositionSelectOpen(false)}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // 회의체 그리드 컬럼
  const committeeColumns = useMemo<ColDef<CommitteeData>[]>(() => [
    { field: 'committeeName', headerName: '회의체명', flex: 1 },
    { field: 'chairperson', headerName: '위원장', width: 120 },
    {
      field: 'frequency',
      headerName: '개최주기',
      width: 150,
      valueFormatter: (params) => {
        // frequency는 공통코드 detailCode이므로 코드명으로 변환
        return params.value ? holdingPeriodCode.getCodeName(params.value) : '';
      }
    },
    { field: 'mainAgenda', headerName: '주요안건의결사항', flex: 1 }
  ], [holdingPeriodCode]);

  // 책무 그리드 컬럼 (삭제 컬럼 제거)
  const responsibilityColumns = useMemo<ColDef<ResponsibilityItemData>[]>(() => [
    { field: 'seq', headerName: '순번', width: 80 },
    {
      field: 'responsibility',
      headerName: '책무',
      flex: 1,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      valueFormatter: (params) => {
        // responsibility는 공통코드 detailCode이므로 코드명으로 변환
        // 형식: "[카테고리] 코드" -> 코드 부분만 추출하여 변환
        if (!params.value) return '';
        const match = params.value.match(/\[(.*?)\]\s*(.+)/);
        if (match) {
          const [, category, code] = match;
          const codeName = responsibilityCode.getCodeName(code);
          return `[${category}] ${codeName}`;
        }
        return params.value;
      }
    },
    {
      field: 'responsibilityDetail',
      headerName: '책무세부내용',
      flex: 1,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
      // responsibility_details 테이블의 responsibility_detail_info 표시
    },
    {
      field: 'relatedBasis',
      headerName: '관련근거',
      flex: 1,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true
    }
  ], [isReadOnly, responsibilityCode]);

  // 관리의무 그리드 컬럼 (삭제 컬럼 제거)
  const managementDutyColumns = useMemo<ColDef<ManagementDutyData>[]>(() => [
    { field: 'seq', headerName: '순번', width: 60 }, // 4. 순번 컬럼 폭 줄임
    {
      field: 'duty',
      headerName: '관리의무',
      flex: 1,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      valueFormatter: (params) => {
        // 5. 관리의무 데이터에서 조직코드를 부점명으로 변환
        // 형식: "[대분류-중분류] 의무내용 (조직코드)" -> 조직코드를 부점명으로 변환
        if (!params.value) return '';
        const match = params.value.match(/^(\[.*?\]\s*.+?)\s*\(([^)]+)\)$/);
        if (match) {
          const [, dutyInfo, orgCode] = match;
          const orgName = getOrgName(orgCode) || orgCode;
          return `${dutyInfo} (${orgName})`;
        }
        return params.value;
      }
    }
  ], [isReadOnly, getOrgName]);

  // 책무 추가/삭제 핸들러
  const addResponsibility = useCallback(() => {
    const newSeq = responsibilities.length + 1;
    const newResponsibility: ResponsibilityItemData = {
      id: String(Date.now()),
      seq: newSeq,
      responsibility: '',
      responsibilityDetail: '',
      relatedBasis: ''
    };
    setResponsibilities([...responsibilities, newResponsibility]);
  }, [responsibilities]);

  const removeResponsibility = useCallback((id: string) => {
    if (responsibilities.length > 1) {
      const filtered = responsibilities.filter((item) => item.id !== id);
      // 순번 재정렬
      const reordered = filtered.map((item, index) => ({
        ...item,
        seq: index + 1
      }));
      setResponsibilities(reordered);
    }
  }, [responsibilities]);

  // 관리의무 추가/삭제 핸들러
  const addManagementDuty = useCallback(() => {
    const newSeq = managementDuties.length + 1;
    const newDuty: ManagementDutyData = {
      id: String(Date.now()),
      seq: newSeq,
      duty: ''
    };
    setManagementDuties([...managementDuties, newDuty]);
  }, [managementDuties]);

  const removeManagementDuty = useCallback((id: string) => {
    if (managementDuties.length > 1) {
      const filtered = managementDuties.filter((item) => item.id !== id);
      // 순번 재정렬
      const reordered = filtered.map((item, index) => ({
        ...item,
        seq: index + 1
      }));
      setManagementDuties(reordered);
    }
  }, [managementDuties]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail') {
      setIsEditing(false);
      reset();
    } else {
      onClose();
    }
  }, [mode, onClose, reset]);

  const onSubmit = useCallback(async (data: any) => {
    try {
      const formData = {
        ...data,
        committees,
        responsibilities,
        managementDuties
      };

      if (mode === 'create') {
        console.log('등록 데이터:', formData);
        alert('책무기술서가 성공적으로 등록되었습니다.');
      } else {
        console.log('수정 데이터:', formData);
        alert('책무기술서가 성공적으로 수정되었습니다.');
      }
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  }, [mode, onClose, committees, responsibilities, managementDuties]);

  const title = mode === 'create' ? '책무기술서 등록' : '책무기술서 상세';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxHeight: '90vh'
          }
        }}
        aria-labelledby="responsibility-doc-modal-title"
      >
        <DialogTitle
          id="responsibility-doc-modal-title"
          sx={{
            background: 'var(--theme-page-header-bg)',
            color: 'var(--theme-page-header-text)',
            fontSize: '1.25rem',
            fontWeight: 600
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
              {title}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={onClose}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* 책무이행차수 선택 섹션 */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  책무이행차수
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <LedgerOrderComboBox
                  value={selectedLedgerOrderId}
                  onChange={setSelectedLedgerOrderId}
                  label="책무이행차수"
                  required
                  disabled={isReadOnly || mode === 'detail'}
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>

            {/* 임원 및 직책 정보 섹션 */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  임원 및 직책 정보
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {/* 첫 번째 행: 직책, 성명 */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="positionName"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="직책 *"
                          required
                          fullWidth
                          size="small"
                          disabled={isReadOnly || mode === 'detail'}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputProps={{
                            endAdornment: mode === 'create' && (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handlePositionSelect}
                                  edge="end"
                                  size="small"
                                >
                                  <SearchIcon />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="employeeName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="성명"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </Grid>

                  {/* 두 번째 행: 현 직책 부여일, 겸직여부 (위치 변경) */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="currentPositionDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="현 직책 부여일"
                          type="date"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                      <FormLabel component="legend" sx={{ mr: 2, minWidth: '80px' }}>겸직여부 *</FormLabel>
                      <Controller
                        name="isDual"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            {...field}
                            value={field.value ? 'Y' : 'N'}
                            onChange={(e) => field.onChange(e.target.value === 'Y')}
                            row
                          >
                            <FormControlLabel value="Y" control={<Radio size="small" />} label="Y" disabled={isReadOnly} />
                            <FormControlLabel value="N" control={<Radio size="small" />} label="N" disabled={isReadOnly} />
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* 세 번째 행: 겸직사항 */}
                  <Grid item xs={12}>
                    <Controller
                      name="dualPositionDetails"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="겸직사항"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          multiline
                          rows={2}
                        />
                      )}
                    />
                  </Grid>

                  {/* 네 번째 행: 소관부점 */}
                  <Grid item xs={12}>
                    <Controller
                      name="responsibleDepts"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="소관부점"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </Grid>

                  {/* 다섯 번째 행: 주관회의체 Grid */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      주관회의체
                    </Typography>
                    <Box sx={{ height: '200px' }}>
                      <BaseDataGrid
                        data={committees}
                        columns={committeeColumns}
                        rowSelection="none"
                        pagination={false}
                        height="200px"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* 책무정보 섹션 */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  책무정보
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Controller
                      name="responsibilityOverview"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="책무개요 *"
                          multiline
                          rows={4}
                          fullWidth
                          disabled={isReadOnly}
                          size="small"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="responsibilityDistributionDate"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="책무 분배일자 *"
                          type="date"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          InputLabelProps={{ shrink: true }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* 책무목록 Grid (추가 버튼 제거) */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  책무목록
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ height: '300px' }}>
                  <BaseDataGrid
                    data={responsibilities}
                    columns={responsibilityColumns}
                    rowSelection="none"
                    pagination={false}
                    height="300px"
                  />
                </Box>
              </Box>
            </Box>

            {/* 관리의무 Grid (추가 버튼 제거) */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  관리의무
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ height: '250px' }}>
                  <BaseDataGrid
                    data={managementDuties}
                    columns={managementDutyColumns}
                    rowSelection="none"
                    pagination={false}
                    height="250px"
                  />
                </Box>
              </Box>
            </Box>

          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 1, gap: 1 }}>
          {mode === 'create' ? (
            <>
              <Button variant="outlined" onClick={onClose} disabled={loading}>
                취소
              </Button>
              <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
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
                  <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" onClick={onClose}>
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

      {/* 직책 선택 모달 */}
      {renderPositionSelectModal()}
    </>
  );
};

export default ResponsibilityDocFormModal;
