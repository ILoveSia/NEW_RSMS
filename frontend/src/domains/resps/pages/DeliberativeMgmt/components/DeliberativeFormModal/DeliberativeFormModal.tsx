import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Button } from '@/shared/components/atoms/Button';
import {
  Deliberative,
  DeliberativeFormData,
  DeliberativeMember,
  HoldingPeriodOption,
  MemberFormData
} from '../../types/deliberative.types';
import { memberColumns } from '../DeliberativeDataGrid/deliberativeColumns';
import styles from './DeliberativeFormModal.module.scss';

interface DeliberativeFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  deliberative?: Deliberative | null;
  onClose: () => void;
  onSave: (data: DeliberativeFormData) => void;
  onUpdate: (id: string, data: DeliberativeFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  name: yup
    .string()
    .required('회의체명은 필수입니다')
    .max(100, '회의체명은 100자 이내로 입력해주세요'),
  holdingPeriod: yup
    .string()
    .required('개최주기는 필수입니다'),
  mainAgenda: yup
    .string()
    .required('주요심의사항은 필수입니다')
    .max(1000, '주요심의사항은 1000자 이내로 입력해주세요'),
  isActive: yup
    .boolean()
    .required('사용여부는 필수입니다'),
  members: yup
    .array()
    .of(yup.object({
      id: yup.string().required(),
      deliberativeId: yup.string().required(),
      seq: yup.number().required(),
      type: yup.string().oneOf(['chairman', 'member']).required(),
      name: yup.string().required(),
      position: yup.string().required(),
      organization: yup.string().optional()
    }))
    .default([])
});

const DeliberativeFormModal: React.FC<DeliberativeFormModalProps> = ({
  open,
  mode,
  deliberative,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const [members, setMembers] = useState<DeliberativeMember[]>([]);
  const [memberFormData, setMemberFormData] = useState<MemberFormData>({
    type: 'member',
    name: '',
    position: '',
    organization: ''
  });

  // 개최주기 옵션
  const holdingPeriodOptions: HoldingPeriodOption[] = [
    { value: 'monthly', label: '월' },
    { value: 'quarterly', label: '분기' },
    { value: 'semiannually', label: '반기' },
    { value: 'annually', label: '년' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<DeliberativeFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      holdingPeriod: '',
      mainAgenda: '',
      isActive: true,
      members: []
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && deliberative) {
        reset({
          name: deliberative.name,
          holdingPeriod: deliberative.holdingPeriod,
          mainAgenda: deliberative.mainAgenda,
          isActive: deliberative.isActive,
          members: []
        });
        // 상세 모드에서 위원목록 로드 (실제로는 API 호출)
        loadMemberList(deliberative.id);
      } else {
        reset({
          name: '',
          holdingPeriod: '',
          mainAgenda: '',
          isActive: true,
          members: []
        });
        setMembers([]);
      }
    }
  }, [open, mode, deliberative, reset]);

  // 위원목록 로드 함수 (상세 모드용)
  const loadMemberList = useCallback(async (deliberativeId: string) => {
    try {
      // TODO: API 호출로 해당 회의체의 위원 정보 로드
      // const response = await deliberativeApi.getMembers(deliberativeId);
      // setMembers(response.data);

      // 임시 데이터
      const mockMembers: DeliberativeMember[] = [
        {
          id: '1',
          deliberativeId,
          seq: 1,
          type: 'chairman',
          name: '김위원장',
          position: '대표이사',
          organization: '본사'
        },
        {
          id: '2',
          deliberativeId,
          seq: 2,
          type: 'member',
          name: '박이사',
          position: '이사',
          organization: '본사'
        },
        {
          id: '3',
          deliberativeId,
          seq: 3,
          type: 'member',
          name: '이상무',
          position: '상무',
          organization: '본사'
        }
      ];
      setMembers(mockMembers);
    } catch (error) {
      console.error('위원목록 로드 실패:', error);
    }
  }, []);

  // 위원 추가 핸들러
  const handleAddMember = useCallback(() => {
    if (!memberFormData.name || !memberFormData.position) {
      alert('성명과 직책은 필수입력 항목입니다.');
      return;
    }

    // 위원장 중복 체크
    if (memberFormData.type === 'chairman') {
      const existingChairman = members.find(m => m.type === 'chairman');
      if (existingChairman) {
        alert('위원장은 1명만 설정할 수 있습니다.');
        return;
      }
    }

    // 동일인 중복 체크
    const duplicateMember = members.find(m => m.name === memberFormData.name);
    if (duplicateMember) {
      alert('이미 등록된 위원입니다.');
      return;
    }

    const newMember: DeliberativeMember = {
      id: Date.now().toString(),
      deliberativeId: deliberative?.id || '',
      seq: members.length + 1,
      type: memberFormData.type,
      name: memberFormData.name,
      position: memberFormData.position,
      organization: memberFormData.organization
    };

    setMembers(prev => [...prev, newMember]);

    // 폼 초기화
    setMemberFormData({
      type: 'member',
      name: '',
      position: '',
      organization: ''
    });
  }, [memberFormData, members, deliberative?.id]);

  // 위원 삭제 핸들러
  const handleRemoveMember = useCallback((memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }, []);

  // 위원장 추가 핸들러
  const handleAddChairman = useCallback(() => {
    setMemberFormData(prev => ({ ...prev, type: 'chairman' }));
  }, []);

  // 위원 추가 핸들러 (일반 위원)
  const handleAddRegularMember = useCallback(() => {
    setMemberFormData(prev => ({ ...prev, type: 'member' }));
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: DeliberativeFormData) => {
    // 비즈니스 규칙 검증
    const chairman = members.find(m => m.type === 'chairman');
    if (!chairman) {
      alert('위원장은 필수입니다.');
      return;
    }

    if (members.length < 3) {
      alert('회의체는 위원장 포함 최소 3명 이상이어야 합니다.');
      return;
    }

    const formDataWithMembers = {
      ...data,
      members
    };

    if (mode === 'create') {
      onSave(formDataWithMembers);
    } else if (mode === 'detail' && deliberative) {
      onUpdate(deliberative.id, formDataWithMembers);
    }
  }, [mode, deliberative, onSave, onUpdate, members]);

  const modalTitle = mode === 'create' ? '회의체 추가' : '회의체 상세';
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
      disabled: !isValid || loading,
      loading: loading
    }
  ];

  // 위원 테이블용 액션 컬럼 추가
  const enhancedMemberColumns = [
    ...memberColumns,
    {
      field: 'actions',
      headerName: '작업',
      width: 80,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: DeliberativeMember }) => (
        <IconButton
          size="small"
          onClick={() => handleRemoveMember(data.id)}
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
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="회의체명 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="리스크관리위원회"
                  />
                )}
              />
            </div>

            <div className={styles.formGroup}>
              <Controller
                name="holdingPeriod"
                control={control}
                render={({ field }) => (
                  <FormControl
                    variant="outlined"
                    fullWidth
                    error={!!errors.holdingPeriod}
                  >
                    <InputLabel>개최주기 *</InputLabel>
                    <Select
                      {...field}
                      label="개최주기 *"
                    >
                      {holdingPeriodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.holdingPeriod && (
                      <FormHelperText>{errors.holdingPeriod.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </div>

            <div className={styles.formGroup}>
              <Controller
                name="isActive"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>사용여부 *</InputLabel>
                    <Select
                      value={value ? 'Y' : 'N'}
                      onChange={(e) => onChange(e.target.value === 'Y')}
                      label="사용여부 *"
                    >
                      <MenuItem value="Y">사용</MenuItem>
                      <MenuItem value="N">미사용</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Controller
                name="mainAgenda"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="주요 심의사항 *"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.mainAgenda}
                    helperText={errors.mainAgenda?.message}
                    placeholder="의결 사항"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* 위원 정보 관리 섹션 */}
        <Divider className={styles.divider} />

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              👥 위원정보
            </Typography>
            <div className={styles.memberActions}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddChairman}
                disabled={members.some(m => m.type === 'chairman')}
              >
                위원장 추가
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddRegularMember}
              >
                위원 추가
              </Button>
            </div>
          </div>

          {/* 위원 추가 폼 */}
          <div className={styles.memberForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel>구분</InputLabel>
                  <Select
                    value={memberFormData.type}
                    onChange={(e) => setMemberFormData(prev => ({
                      ...prev,
                      type: e.target.value as 'chairman' | 'member'
                    }))}
                    label="구분"
                  >
                    <MenuItem value="chairman">위원장</MenuItem>
                    <MenuItem value="member">위원</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className={styles.formGroup}>
                <TextField
                  label="성명 *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="홍길동"
                />
              </div>

              <div className={styles.formGroup}>
                <TextField
                  label="직책 *"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={memberFormData.position}
                  onChange={(e) => setMemberFormData(prev => ({
                    ...prev,
                    position: e.target.value
                  }))}
                  placeholder="대표이사"
                />
              </div>

              <div className={styles.formGroup}>
                <TextField
                  label="소속"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={memberFormData.organization}
                  onChange={(e) => setMemberFormData(prev => ({
                    ...prev,
                    organization: e.target.value
                  }))}
                  placeholder="본사"
                />
              </div>

              <div className={styles.formGroup}>
                <Button
                  variant="contained"
                  onClick={handleAddMember}
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  추가
                </Button>
              </div>
            </div>
          </div>

          {/* 위원 목록 테이블 */}
          <div className={styles.memberList}>
            <BaseDataGrid
              data={members}
              columns={enhancedMemberColumns}
              pagination={false}
              height={200}
              theme="rsms"
              emptyMessage="등록된 위원이 없습니다."
            />
          </div>
        </div>
      </Box>
    </BaseModal>
  );
};

DeliberativeFormModal.displayName = 'DeliberativeFormModal';

export default DeliberativeFormModal;