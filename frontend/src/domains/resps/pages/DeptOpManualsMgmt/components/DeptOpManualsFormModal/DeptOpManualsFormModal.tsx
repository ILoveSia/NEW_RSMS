/**
 * 부서장업무메뉴얼관리 폼 모달 컴포넌트
 * @description PositionFormModal 표준을 따라 부서장업무메뉴얼관리 등록/수정/상세 모달 구현
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from '@/shared/utils/toast';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { ColDef } from 'ag-grid-community';

import type {
  DeptOpManual,
  DeptOpManualsFormData,
  DeptOpManualsModalMode,
  ManagementActivityType,
  RiskAssessmentLevel,
  ApprovalStatus
} from '../../types/deptOpManuals.types';

import styles from './DeptOpManualsFormModal.module.scss';

// 📋 폼 검증 스키마
const validationSchema = yup.object({
  managementObligation: yup
    .string()
    .required('관리의무는 필수 입력 항목입니다')
    .max(200, '관리의무는 200자 이내로 입력해주세요'),
  irregularityName: yup
    .string()
    .required('부정명은 필수 입력 항목입니다')
    .max(100, '부정명은 100자 이내로 입력해주세요'),
  managementActivityCode: yup
    .string()
    .required('관리활동코드는 필수 입력 항목입니다')
    .matches(/^M\d{9}$/, '관리활동코드는 M으로 시작하는 10자리 형식이어야 합니다'),
  managementActivity: yup
    .string()
    .required('관리활동은 필수 입력 항목입니다')
    .max(150, '관리활동은 150자 이내로 입력해주세요'),
  managementActivityName: yup
    .string()
    .required('관리활동명은 필수 입력 항목입니다')
    .max(100, '관리활동명은 100자 이내로 입력해주세요'),
  managementActivityDetail: yup
    .string()
    .required('관리활동상세는 필수 입력 항목입니다')
    .max(500, '관리활동상세는 500자 이내로 입력해주세요'),
  managementActivityType: yup
    .string()
    .required('관리활동구분은 필수 선택 항목입니다'),
  riskAssessmentLevel: yup
    .string()
    .required('위험평가등급은 필수 선택 항목입니다'),
  implementationManager: yup
    .string()
    .required('이행주관담당은 필수 입력 항목입니다')
    .max(50, '이행주관담당은 50자 이내로 입력해주세요'),
  implementationDepartment: yup
    .string()
    .max(50, '이행주관담당부서는 50자 이내로 입력해주세요'),
  isActive: yup.boolean(),
  remarks: yup
    .string()
    .max(1000, '비고는 1000자 이내로 입력해주세요')
});

// 🏷️ 옵션 데이터
const MANAGEMENT_ACTIVITY_TYPE_OPTIONS = [
  { value: 'compliance', label: '준법' },
  { value: 'risk', label: '리스크' },
  { value: 'internal_audit', label: '내부감사' },
  { value: 'operation', label: '운영' },
  { value: 'finance', label: '재무' },
  { value: 'hr', label: '인사' }
];

const RISK_ASSESSMENT_LEVEL_OPTIONS = [
  { value: 'very_high', label: '매우높음', color: 'error' },
  { value: 'high', label: '높음', color: 'error' },
  { value: 'medium', label: '보통', color: 'warning' },
  { value: 'low', label: '낮음', color: 'info' },
  { value: 'very_low', label: '매우낮음', color: 'success' }
];

const MANAGEMENT_OBLIGATION_OPTIONS = [
  '준법감시 업무와 관련된 책무 세부내용에 대한 관리의무',
  '리스크관리 업무와 관련된 책무',
  '내부감사 업무 관련 관리의무',
  '재무관리 업무 관련 책무',
  '인사관리 업무 관련 책무',
  '운영관리 업무 관련 책무'
];

// 📊 관리활동 목록 테이블 컬럼 정의 (화면 이미지 참고)
interface ManagementActivityItem {
  id: string;
  seq: number;
  activityCode: string;
  activityName: string;
  activityDetail: string;
  riskLevel: RiskAssessmentLevel;
  implementationManager: string;
  isSelected?: boolean;
}

const activityListColumns: ColDef<ManagementActivityItem>[] = [
  {
    field: 'seq',
    headerName: '순번',
    width: 80,
    cellStyle: { textAlign: 'center' }
  },
  {
    field: 'activityCode',
    headerName: '관리활동코드',
    width: 130,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' }
  },
  {
    field: 'activityName',
    headerName: '관리활동명',
    width: 150
  },
  {
    field: 'activityDetail',
    headerName: '관리활동상세',
    width: 200,
    tooltipField: 'activityDetail'
  },
  {
    field: 'riskLevel',
    headerName: '위험평가등급',
    width: 120,
    cellRenderer: (params: any) => {
      const option = RISK_ASSESSMENT_LEVEL_OPTIONS.find(opt => opt.value === params.value);
      return option ? (
        <Chip
          label={option.label}
          color={option.color as any}
          size="small"
          variant="filled"
        />
      ) : params.value;
    }
  },
  {
    field: 'implementationManager',
    headerName: '이행주관담당',
    width: 120
  }
];

interface DeptOpManualsFormModalProps {
  open: boolean;
  mode: DeptOpManualsModalMode;
  deptOpManual?: DeptOpManual;
  onClose: () => void;
  onSubmit: (data: DeptOpManualsFormData) => Promise<void>;
  loading?: boolean;
}

const DeptOpManualsFormModal: React.FC<DeptOpManualsFormModalProps> = ({
  open,
  mode,
  deptOpManual,
  onClose,
  onSubmit,
  loading = false
}) => {
  // 📊 관리활동 목록 상태
  const [activityList, setActivityList] = useState<ManagementActivityItem[]>([]);
  const [selectedActivityItems, setSelectedActivityItems] = useState<ManagementActivityItem[]>([]);

  // React Hook Form 설정
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<DeptOpManualsFormData>({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      managementObligation: '',
      irregularityName: '',
      managementActivityCode: '',
      managementActivity: '',
      managementActivityName: '',
      managementActivityDetail: '',
      managementActivityType: 'compliance',
      riskAssessmentLevel: 'medium',
      implementationManager: '',
      implementationDepartment: '',
      isActive: true,
      remarks: ''
    }
  });

  // 폼 제목
  const modalTitle = useMemo(() => {
    switch (mode) {
      case 'create':
        return '관리활동 정보 추가';
      case 'edit':
        return '관리활동 정보 수정';
      case 'view':
        return '관리활동 정보 상세';
      default:
        return '관리활동 정보';
    }
  }, [mode]);

  // 읽기 전용 여부
  const isReadOnly = mode === 'view';

  // 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (deptOpManual && (mode === 'edit' || mode === 'view')) {
        // 수정/상세 모드: 기존 데이터로 초기화
        reset({
          managementObligation: deptOpManual.managementObligation,
          irregularityName: deptOpManual.irregularityName,
          managementActivityCode: deptOpManual.managementActivityCode,
          managementActivity: deptOpManual.managementActivity,
          managementActivityName: deptOpManual.managementActivityName,
          managementActivityDetail: deptOpManual.managementActivityDetail,
          managementActivityType: deptOpManual.managementActivityType,
          riskAssessmentLevel: deptOpManual.riskAssessmentLevel,
          implementationManager: deptOpManual.implementationManager,
          implementationDepartment: deptOpManual.implementationDepartment || '',
          isActive: deptOpManual.isActive,
          remarks: deptOpManual.remarks || ''
        });

        // 관리활동 목록 초기화 (실제로는 API에서 가져와야 함)
        const mockActivityList: ManagementActivityItem[] = [
          {
            id: '1',
            seq: 1,
            activityCode: deptOpManual.managementActivityCode,
            activityName: deptOpManual.managementActivityName,
            activityDetail: deptOpManual.managementActivityDetail,
            riskLevel: deptOpManual.riskAssessmentLevel,
            implementationManager: deptOpManual.implementationManager
          }
        ];
        setActivityList(mockActivityList);
      } else {
        // 생성 모드: 기본값으로 초기화
        reset({
          managementObligation: '',
          irregularityName: '',
          managementActivityCode: '',
          managementActivity: '',
          managementActivityName: '',
          managementActivityDetail: '',
          managementActivityType: 'compliance',
          riskAssessmentLevel: 'medium',
          implementationManager: '',
          implementationDepartment: '',
          isActive: true,
          remarks: ''
        });
        setActivityList([]);
      }
      setSelectedActivityItems([]);
    }
  }, [open, mode, deptOpManual, reset]);

  // 관리활동코드 자동 생성
  const generateActivityCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-9);
    const code = `M${timestamp}`;
    setValue('managementActivityCode', code);
    toast.info('관리활동코드가 자동 생성되었습니다.');
  }, [setValue]);

  // 관리활동 목록에 추가
  const handleAddActivity = useCallback(() => {
    const formValues = watch();

    if (!formValues.managementActivityCode || !formValues.managementActivityName) {
      toast.warning('관리활동코드와 관리활동명을 입력해주세요.');
      return;
    }

    const newActivity: ManagementActivityItem = {
      id: Date.now().toString(),
      seq: activityList.length + 1,
      activityCode: formValues.managementActivityCode,
      activityName: formValues.managementActivityName,
      activityDetail: formValues.managementActivityDetail,
      riskLevel: formValues.riskAssessmentLevel,
      implementationManager: formValues.implementationManager
    };

    setActivityList(prev => [...prev, newActivity]);
    toast.success('관리활동이 목록에 추가되었습니다.');
  }, [watch, activityList.length]);

  // 선택된 관리활동 삭제
  const handleDeleteSelectedActivities = useCallback(() => {
    if (selectedActivityItems.length === 0) {
      toast.warning('삭제할 관리활동을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedActivityItems.length}개의 관리활동을 삭제하시겠습니까?`)) {
      return;
    }

    const selectedIds = selectedActivityItems.map(item => item.id);
    setActivityList(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setSelectedActivityItems([]);
    toast.success('선택한 관리활동이 삭제되었습니다.');
  }, [selectedActivityItems]);

  // 관리활동 목록 선택 변경
  const handleActivitySelectionChange = useCallback((selectedRows: ManagementActivityItem[]) => {
    setSelectedActivityItems(selectedRows);
  }, []);

  // 폼 제출
  const handleFormSubmit = useCallback(async (data: DeptOpManualsFormData) => {
    try {
      if (activityList.length === 0 && mode === 'create') {
        toast.warning('최소 하나 이상의 관리활동을 추가해주세요.');
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [onSubmit, activityList.length, mode]);

  // 모달 닫기
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      className={styles.modal}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          width: '90vw',
          maxWidth: '1200px'
        }
      }}
    >
      {/* 📋 모달 헤더 */}
      <DialogTitle className={styles.modalTitle}>
        <div className={styles.titleContent}>
          <AssignmentIcon className={styles.titleIcon} />
          <Typography variant="h6" component="h2">
            {modalTitle}
          </Typography>
        </div>
        <IconButton
          onClick={handleClose}
          className={styles.closeButton}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 📝 모달 내용 */}
      <DialogContent className={styles.modalContent}>
        <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
          {/* 📋 기본 정보 섹션 */}
          <div className={styles.formSection}>
            <Typography variant="h6" className={styles.sectionTitle}>
              <AssignmentIcon />
              기본 정보
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="managementObligation"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.managementObligation}>
                      <InputLabel>관리의무 *</InputLabel>
                      <Select
                        {...field}
                        label="관리의무 *"
                        disabled={isReadOnly || loading}
                      >
                        {MANAGEMENT_OBLIGATION_OPTIONS.map((option, index) => (
                          <MenuItem key={index} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.managementObligation && (
                        <Typography variant="caption" color="error">
                          {errors.managementObligation.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="irregularityName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="부정명 *"
                      placeholder="부정명을 입력하세요"
                      fullWidth
                      disabled={isReadOnly || loading}
                      error={!!errors.irregularityName}
                      helperText={errors.irregularityName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value}
                          disabled={isReadOnly || loading}
                        />
                      )}
                    />
                  }
                  label="사용여부"
                />
              </Grid>
            </Grid>
          </div>

          <Divider className={styles.divider} />

          {/* 📊 관리활동목록 섹션 */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <AssignmentIcon />
                관리활동목록
              </Typography>

              {!isReadOnly && (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddActivity}
                    disabled={loading}
                  >
                    추가
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteSelectedActivities}
                    disabled={selectedActivityItems.length === 0 || loading}
                  >
                    삭제
                  </Button>
                </Box>
              )}
            </div>

            {/* 관리활동 입력 필드들 */}
            {!isReadOnly && (
              <Grid container spacing={2} style={{ marginBottom: '16px' }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="managementActivityCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="관리활동코드 *"
                        placeholder="M으로 시작하는 10자리"
                        fullWidth
                        disabled={loading}
                        error={!!errors.managementActivityCode}
                        helperText={errors.managementActivityCode?.message}
                        InputProps={{
                          endAdornment: (
                            <Button
                              variant="text"
                              size="small"
                              onClick={generateActivityCode}
                              disabled={loading}
                            >
                              자동생성
                            </Button>
                          )
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="managementActivityName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="관리활동명 *"
                        placeholder="관리활동명을 입력하세요"
                        fullWidth
                        disabled={loading}
                        error={!!errors.managementActivityName}
                        helperText={errors.managementActivityName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="managementActivityType"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.managementActivityType}>
                        <InputLabel>관리활동구분 *</InputLabel>
                        <Select
                          {...field}
                          label="관리활동구분 *"
                          disabled={loading}
                        >
                          {MANAGEMENT_ACTIVITY_TYPE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.managementActivityType && (
                          <Typography variant="caption" color="error">
                            {errors.managementActivityType.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Controller
                    name="riskAssessmentLevel"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.riskAssessmentLevel}>
                        <InputLabel>위험평가등급 *</InputLabel>
                        <Select
                          {...field}
                          label="위험평가등급 *"
                          disabled={loading}
                        >
                          {RISK_ASSESSMENT_LEVEL_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Chip
                                label={option.label}
                                color={option.color as any}
                                size="small"
                                variant="outlined"
                              />
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.riskAssessmentLevel && (
                          <Typography variant="caption" color="error">
                            {errors.riskAssessmentLevel.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="managementActivityDetail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="관리활동상세 *"
                        placeholder="관리활동 상세 내용을 입력하세요"
                        fullWidth
                        multiline
                        rows={2}
                        disabled={loading}
                        error={!!errors.managementActivityDetail}
                        helperText={errors.managementActivityDetail?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="implementationManager"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="이행주관담당 *"
                        placeholder="이행주관담당을 입력하세요"
                        fullWidth
                        disabled={loading}
                        error={!!errors.implementationManager}
                        helperText={errors.implementationManager?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* 관리활동 목록 테이블 */}
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={activityList}
                columns={activityListColumns}
                loading={loading}
                theme="alpine"
                onSelectionChange={handleActivitySelectionChange}
                height="300px"
                pagination={false}
                rowSelection="multiple"
                checkboxSelection={!isReadOnly}
                headerCheckboxSelection={!isReadOnly}
              />
            </div>
          </div>

          {/* 📝 기타 정보 섹션 */}
          <Divider className={styles.divider} />

          <div className={styles.formSection}>
            <Typography variant="h6" className={styles.sectionTitle}>
              기타 정보
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="implementationDepartment"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="이행주관담당부서"
                      placeholder="담당부서를 입력하세요"
                      fullWidth
                      disabled={isReadOnly || loading}
                      error={!!errors.implementationDepartment}
                      helperText={errors.implementationDepartment?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="비고"
                      placeholder="기타 비고사항을 입력하세요"
                      fullWidth
                      multiline
                      rows={3}
                      disabled={isReadOnly || loading}
                      error={!!errors.remarks}
                      helperText={errors.remarks?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </div>
        </form>
      </DialogContent>

      {/* 🎯 모달 액션 */}
      <DialogActions className={styles.modalActions}>
        {mode === 'view' ? (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              닫기
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // 상세에서 수정 모드로 전환하는 로직 (부모에서 처리)
                // 현재는 단순히 재조회 버튼으로 동작
                toast.info('재조회를 실행합니다.');
              }}
              disabled={loading}
            >
              재조회
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              variant="contained"
              type="submit"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={!isValid || loading}
              loading={loading}
            >
              {mode === 'create' ? '저장' : '수정'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeptOpManualsFormModal;