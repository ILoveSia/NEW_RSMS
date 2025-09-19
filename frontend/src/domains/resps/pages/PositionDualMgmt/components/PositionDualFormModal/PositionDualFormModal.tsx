import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Box,
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Flag as FlagIcon } from '@mui/icons-material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Button } from '@/shared/components/atoms/Button';
import {
  PositionDual,
  PositionDualFormData,
  PositionDualPosition,
  PositionDualFormModalProps
} from '../../types/positionDual.types';
import styles from './PositionDualFormModal.module.scss';

// 폼 유효성 검증 스키마
const schema = yup.object({
  concurrentStatusCode: yup
    .string()
    .required('겸직현황코드는 필수입니다')
    .max(20, '겸직현황코드는 20자 이내로 입력해주세요'),
  positions: yup
    .array()
    .min(1, '최소 1개 이상의 직책을 추가해주세요')
    .test('representative-required', '대표 직책은 필수입니다', function(positions) {
      if (!positions || positions.length === 0) return false;
      return positions.some((pos: any) => pos.isRepresentative);
    })
    .test('representative-unique', '대표 직책은 1개만 설정할 수 있습니다', function(positions) {
      if (!positions) return true;
      const representatives = positions.filter((pos: any) => pos.isRepresentative);
      return representatives.length <= 1;
    })
});

// 직책 테이블 컬럼 정의
const positionColumns = [
  {
    field: 'positionCode',
    headerName: '직책코드',
    width: 120,
    cellStyle: { textAlign: 'center', fontFamily: 'monospace' }
  },
  {
    field: 'positionName',
    headerName: '직책명',
    width: 180,
    cellRenderer: ({ data }: { data: PositionDualPosition }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          fontWeight: data.isRepresentative ? 'bold' : 'normal',
          color: data.isRepresentative ? '#1976d2' : '#333'
        }}>
          {data.positionName}
        </span>
        {data.isRepresentative && (
          <FlagIcon sx={{ fontSize: '16px', color: '#1976d2' }} />
        )}
      </div>
    )
  },
  {
    field: 'departmentName',
    headerName: '부서명',
    width: 150
  },
  {
    field: 'isRepresentative',
    headerName: '대표여부',
    width: 100,
    cellRenderer: ({ data, setValue }: {
      data: PositionDualPosition;
      setValue: (value: boolean) => void;
    }) => (
      <FormControlLabel
        control={
          <Checkbox
            checked={data.isRepresentative}
            onChange={(e) => setValue(e.target.checked)}
            size="small"
          />
        }
        label=""
        sx={{ margin: 0 }}
      />
    ),
    cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
  }
];

const PositionDualFormModal: React.FC<PositionDualFormModalProps> = ({
  open,
  mode,
  positionDual,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('resps');
  const [positions, setPositions] = useState<PositionDualPosition[]>([]);
  const [positionFormData, setPositionFormData] = useState({
    positionCode: '',
    positionName: '',
    departmentName: '',
    isRepresentative: false,
    isActive: true
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<PositionDualFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      concurrentStatusCode: '',
      positions: []
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && positionDual) {
        reset({
          concurrentStatusCode: positionDual.concurrentStatusCode,
          positions: []
        });
        // 상세 모드에서 해당 겸직현황코드의 모든 직책 로드
        loadPositionsByCode(positionDual.concurrentStatusCode);
      } else {
        reset({
          concurrentStatusCode: '',
          positions: []
        });
        setPositions([]);
      }
    }
  }, [open, mode, positionDual, reset]);

  // 겸직현황코드별 직책 목록 로드
  const loadPositionsByCode = useCallback(async (code: string) => {
    try {
      // TODO: API 호출로 해당 겸직현황코드의 직책들 로드
      // const response = await positionDualApi.getPositionsByCode(code);
      // setPositions(response.data);

      // 임시 데이터 (같은 겸직현황코드를 가진 직책들)
      const mockPositions: PositionDualPosition[] = [
        {
          id: '1',
          positionCode: 'R106',
          positionName: '오토금융본부장',
          departmentName: '오토금융본부',
          isRepresentative: true,
          isActive: true
        },
        {
          id: '2',
          positionCode: 'R107',
          positionName: '오토채널본부장',
          departmentName: '오토채널본부',
          isRepresentative: false,
          isActive: true
        }
      ];
      setPositions(mockPositions);
    } catch (error) {
      console.error('직책 목록 로드 실패:', error);
    }
  }, []);

  // 직책 추가 핸들러
  const handleAddPosition = useCallback(() => {
    if (!positionFormData.positionCode || !positionFormData.positionName) {
      alert('직책코드와 직책명은 필수입력 항목입니다.');
      return;
    }

    // 중복 직책 체크
    const duplicatePosition = positions.find(p => p.positionCode === positionFormData.positionCode);
    if (duplicatePosition) {
      alert('이미 등록된 직책입니다.');
      return;
    }

    // 대표직책 중복 체크
    if (positionFormData.isRepresentative) {
      const existingRepresentative = positions.find(p => p.isRepresentative);
      if (existingRepresentative) {
        alert('대표직책은 1개만 설정할 수 있습니다.');
        return;
      }
    }

    const newPosition: PositionDualPosition = {
      id: Date.now().toString(),
      positionCode: positionFormData.positionCode,
      positionName: positionFormData.positionName,
      departmentName: positionFormData.departmentName,
      isRepresentative: positionFormData.isRepresentative,
      isActive: positionFormData.isActive
    };

    setPositions(prev => [...prev, newPosition]);

    // 폼 초기화
    setPositionFormData({
      positionCode: '',
      positionName: '',
      departmentName: '',
      isRepresentative: false,
      isActive: true
    });
  }, [positionFormData, positions]);

  // 직책 삭제 핸들러
  const handleRemovePosition = useCallback((positionId: string) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  }, []);

  // 대표여부 변경 핸들러
  const handleRepresentativeChange = useCallback((positionId: string, isRepresentative: boolean) => {
    if (isRepresentative) {
      // 다른 대표직책을 일반으로 변경
      setPositions(prev => prev.map(p => ({
        ...p,
        isRepresentative: p.id === positionId
      })));
    } else {
      setPositions(prev => prev.map(p =>
        p.id === positionId ? { ...p, isRepresentative: false } : p
      ));
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: PositionDualFormData) => {
    // 비즈니스 규칙 검증
    const representative = positions.find(p => p.isRepresentative);
    if (!representative) {
      alert('대표직책은 필수입니다.');
      return;
    }

    if (positions.length === 0) {
      alert('최소 1개 이상의 직책을 추가해주세요.');
      return;
    }

    const formDataWithPositions = {
      ...data,
      positions
    };

    if (mode === 'create') {
      onSave(formDataWithPositions);
    } else if (mode === 'detail' && positionDual) {
      onUpdate(positionDual.id, formDataWithPositions);
    }
  }, [mode, positionDual, onSave, onUpdate, positions]);

  const modalTitle = mode === 'create' ? '직책 겸직 추가' : '직책 겸직 수정';
  const submitButtonText = mode === 'create' ? '저장' : '수정';

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'cancel',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading
    },
    {
      key: 'submit',
      label: submitButtonText,
      variant: 'contained',
      color: 'primary',
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading || positions.length === 0,
      loading: loading
    }
  ];

  // 직책 테이블용 액션 컬럼 추가
  const enhancedPositionColumns = [
    ...positionColumns,
    {
      field: 'actions',
      headerName: '작업',
      width: 80,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: PositionDualPosition }) => (
        <IconButton
          size="small"
          onClick={() => handleRemovePosition(data.id!)}
          color="error"
          title="삭제"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
      cellStyle: { textAlign: 'center' }
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      actions={modalActions}
      loading={loading}
      className={styles.modal}
      contentClassName={styles.modalContent}
    >
      {/* 기본 정보 입력 폼 */}
      <Box component="form" className={styles.form}>
        <div className={styles.formSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            📋 기본정보
          </Typography>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Controller
                name="concurrentStatusCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="겸직현황코드 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.concurrentStatusCode}
                    helperText={errors.concurrentStatusCode?.message}
                    placeholder="G001"
                    disabled={mode === 'detail'}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* 직책 정보 관리 섹션 */}
        <Divider className={styles.divider} />

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              👥 겸직 직책 정보
            </Typography>
          </div>

          {/* 직책 추가 폼 */}
          <div className={styles.positionForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <TextField
                  label="직책코드 *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={positionFormData.positionCode}
                  onChange={(e) => setPositionFormData(prev => ({
                    ...prev,
                    positionCode: e.target.value
                  }))}
                  placeholder="R106"
                />
              </div>

              <div className={styles.formGroup}>
                <TextField
                  label="직책명 *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={positionFormData.positionName}
                  onChange={(e) => setPositionFormData(prev => ({
                    ...prev,
                    positionName: e.target.value
                  }))}
                  placeholder="오토금융본부장"
                />
              </div>

              <div className={styles.formGroup}>
                <TextField
                  label="부서명"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={positionFormData.departmentName}
                  onChange={(e) => setPositionFormData(prev => ({
                    ...prev,
                    departmentName: e.target.value
                  }))}
                  placeholder="오토금융본부"
                />
              </div>

              <div className={styles.formGroup}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={positionFormData.isRepresentative}
                      onChange={(e) => setPositionFormData(prev => ({
                        ...prev,
                        isRepresentative: e.target.checked
                      }))}
                      size="small"
                    />
                  }
                  label="대표직책"
                />
              </div>

              <div className={styles.formGroup}>
                <Button
                  variant="contained"
                  onClick={handleAddPosition}
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  추가
                </Button>
              </div>
            </div>
          </div>

          {/* 직책 목록 테이블 */}
          <div className={styles.positionList}>
            <BaseDataGrid
              data={positions}
              columns={enhancedPositionColumns}
              pagination={false}
              height={250}
              theme="rsms"
              emptyMessage="등록된 직책이 없습니다."
            />
          </div>

          {/* 비즈니스 규칙 안내 */}
          <div className={styles.ruleInfo}>
            <Typography variant="body2" color="textSecondary">
              ✅ 대표직책은 반드시 1개 설정해야 합니다<br />
              ✅ 동일한 직책코드는 중복 등록할 수 없습니다<br />
              ✅ 최소 1개 이상의 직책을 등록해야 합니다
            </Typography>
          </div>
        </div>
      </Box>
    </BaseModal>
  );
};

PositionDualFormModal.displayName = 'PositionDualFormModal';

export default PositionDualFormModal;