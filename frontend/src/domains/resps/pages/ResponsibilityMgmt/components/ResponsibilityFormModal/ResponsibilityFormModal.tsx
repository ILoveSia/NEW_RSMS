import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
  Divider
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseSectionTable } from '@/shared/components/organisms/BaseSectionTable';
import { ColDef } from 'ag-grid-community';
import type { ResponsibilityFormData, PositionInfo } from '../../types/responsibility.types';
import styles from './ResponsibilityFormModal.module.scss';

interface ResponsibilityFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  responsibility?: any;
  onClose: () => void;
  onSave: (formData: ResponsibilityFormData) => void;
  onUpdate?: (id: string, data: ResponsibilityFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  positionCode: yup
    .string()
    .required('직책은 필수입니다')
});

// 임시 직책 정보 (실제 환경에서는 API에서 가져옴)
const mockPositions: PositionInfo[] = [
  {
    positionCode: 'CEO001',
    positionName: '리스크관리본부장',
    headquarters: '본부부서',
    departmentName: '리스크관리본부',
    divisionName: '리스크관리부'
  },
  {
    positionCode: 'RM001',
    positionName: '감사본부장',
    headquarters: '본부부서',
    departmentName: '감사본부',
    divisionName: '감사부'
  },
  {
    positionCode: 'GM001',
    positionName: '감사본부장',
    headquarters: '본부부서',
    departmentName: '감사본부',
    divisionName: '감사부'
  }
];

// 직책 정보 테이블 컬럼
const positionColumns: ColDef<PositionInfo>[] = [
  {
    field: 'positionName',
    headerName: '직책',
    width: 150,
    cellStyle: { fontWeight: '500' }
  },
  {
    field: 'headquarters',
    headerName: '본부구분',
    width: 120
  },
  {
    field: 'departmentName',
    headerName: '부서명',
    width: 150
  },
  {
    field: 'divisionName',
    headerName: '부정명',
    width: 120
  }
];

// 책무 테이블 컬럼
const responsibilityColumns: ColDef[] = [
  { field: 'seq', headerName: '순번', width: 80 },
  { field: 'responsibilityCategory', headerName: '책무대분류', width: 120 },
  { field: 'responsibility', headerName: '책무', width: 200 },
  { field: 'relatedBasis', headerName: '관련근거', width: 150 },
  { field: 'lastModificationDate', headerName: '최종변경일자', width: 120 },
  { field: 'isActive', headerName: '사용여부', width: 100 }
];

// 책무세부내용 테이블 컬럼
const responsibilityDetailColumns: ColDef[] = [
  { field: 'seq', headerName: '순번', width: 80 },
  { field: 'linkedResponsibility', headerName: '연결책무', width: 150 },
  { field: 'responsibilityDetailContent', headerName: '책무세부내용', width: 250 },
  { field: 'lastModificationDate', headerName: '최종변경일자', width: 120 },
  { field: 'isActive', headerName: '사용여부', width: 100 }
];

// 관리의무 테이블 컬럼
const managementDutyColumns: ColDef[] = [
  { field: 'seq', headerName: '순번', width: 80 },
  { field: 'managementDutyCategory', headerName: '관리의무대분류구분', width: 140 },
  { field: 'managementDutySubCategory', headerName: '관리의무중분류구분', width: 140 },
  { field: 'managementDutyCode', headerName: '관리의무코드', width: 120 },
  { field: 'managementDuty', headerName: '관리의무', width: 150 },
  { field: 'divisionName', headerName: '부정명', width: 100 },
  { field: 'isActive', headerName: '사용여부', width: 100 }
];

const ResponsibilityFormModal: React.FC<ResponsibilityFormModalProps> = ({
  open,
  mode,
  responsibility,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<{ positionCode: string }>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      positionCode: ''
    }
  });

  // 임시 데이터
  const [responsibilityData, setResponsibilityData] = useState<any[]>([]);
  const [responsibilityDetailData, setResponsibilityDetailData] = useState<any[]>([]);
  const [managementDutyData, setManagementDutyData] = useState<any[]>([]);

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && responsibility) {
        const positionCode = responsibility.positionCode || 'GM001';
        reset({ positionCode });
        setSelectedPosition(positionCode);

        // 임시 데이터 설정
        setResponsibilityData([
          {
            seq: 1,
            responsibilityCategory: 'C - 공통',
            responsibility: 'CM9002 - (공통) 소관 업무조직의 ...',
            relatedBasis: '내부통제관리규정 제100조 00항',
            lastModificationDate: '2025-08-13',
            isActive: '사용'
          },
          {
            seq: 2,
            responsibilityCategory: 'R - 지정책임자',
            responsibility: 'RM0004 - 내부감사 업무와 관련된 ...',
            relatedBasis: '금융회사의 내부통제 관련 시행령...',
            lastModificationDate: '2025-08-13',
            isActive: '사용'
          }
        ]);

        setResponsibilityDetailData([
          {
            seq: 1,
            linkedResponsibility: '(공통) 소관 업무조직의 내부통제기준 및 위...',
            responsibilityDetailContent: '내부통제기준 및 위험관리기준 수립 책무',
            lastModificationDate: '2025-08-13',
            isActive: '사용'
          }
        ]);

        setManagementDutyData([
          {
            seq: 1,
            managementDutyCategory: '공통',
            managementDutySubCategory: '(공통) 내부...',
            managementDutyCode: 'R000000005',
            managementDuty: '내부통제기준 및 위험관리기준 수립 책무에 대한 관리의무',
            divisionName: '감사부',
            isActive: '사용'
          }
        ]);
      } else {
        reset({ positionCode: '' });
        setSelectedPosition('');
        setResponsibilityData([]);
        setResponsibilityDetailData([]);
        setManagementDutyData([]);
      }
    }
  }, [open, mode, responsibility, reset]);

  const handlePositionChange = useCallback((event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelectedPosition(value);
  }, []);

  // 현재 폼의 positionCode 값 감시
  const watchedPositionCode = watch('positionCode');

  useEffect(() => {
    setSelectedPosition(watchedPositionCode);
  }, [watchedPositionCode]);

  // 폼 제출 처리
  const onSubmit = useCallback((data: { positionCode: string }) => {
    const formData: ResponsibilityFormData = {
      positionCode: data.positionCode,
      responsibilities: responsibilityData,
      responsibilityDetails: responsibilityDetailData,
      managementDuties: managementDutyData
    };

    if (mode === 'create') {
      onSave(formData);
    } else if (mode === 'detail' && responsibility) {
      onUpdate?.(responsibility.id, formData);
    }
  }, [mode, responsibility, responsibilityData, responsibilityDetailData, managementDutyData, onSave, onUpdate]);

  // 선택된 직책 정보
  const selectedPositionInfo = mockPositions.find(p => p.positionCode === selectedPosition);

  const modalTitle = mode === 'create' ? '책무 추가' : '책무 상세';
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
      {/* 직책 선택 */}
      <Box className={styles.section}>
        <Controller
          name="positionCode"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.positionCode}>
              <InputLabel>직책 *</InputLabel>
              <Select
                {...field}
                label="직책 *"
                onChange={(e) => {
                  field.onChange(e);
                  handlePositionChange(e);
                }}
              >
                {mockPositions.map((position) => (
                  <MenuItem key={position.positionCode} value={position.positionCode}>
                    {position.positionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Box>

      {/* 직책 정보 테이블 */}
      {selectedPositionInfo && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.section}>
            <BaseSectionTable
              title="직책"
              data={[selectedPositionInfo]}
              columns={positionColumns}
              height={150}
              emptyMessage="직책을 선택해주세요."
            />
          </Box>
        </>
      )}

      {/* 책무 섹션 */}
      <Divider className={styles.divider} />
      <Box className={styles.section}>
        <BaseSectionTable
          title="책무"
          data={responsibilityData}
          columns={responsibilityColumns}
          height={200}
          showAddButton
          showSaveButton
          emptyMessage="조회 된 정보가 없습니다."
          onAdd={() => console.log('책무 추가')}
          onSave={() => console.log('책무 저장')}
        />
      </Box>

      {/* 책무세부내용 섹션 */}
      <Divider className={styles.divider} />
      <Box className={styles.section}>
        <BaseSectionTable
          title="책무세부내용"
          data={responsibilityDetailData}
          columns={responsibilityDetailColumns}
          height={200}
          showAddButton
          showSaveButton
          emptyMessage="조회 된 정보가 없습니다."
          onAdd={() => console.log('책무세부내용 추가')}
          onSave={() => console.log('책무세부내용 저장')}
        />
      </Box>

      {/* 관리의무 섹션 */}
      <Divider className={styles.divider} />
      <Box className={styles.section}>
        <BaseSectionTable
          title="관리의무"
          data={managementDutyData}
          columns={managementDutyColumns}
          height={200}
          showAddButton
          showSaveButton
          emptyMessage="조회 된 정보가 없습니다."
          onAdd={() => console.log('관리의무 추가')}
          onSave={() => console.log('관리의무 저장')}
        />
      </Box>
    </BaseModal>
  );
};

ResponsibilityFormModal.displayName = 'ResponsibilityFormModal';

export default ResponsibilityFormModal;