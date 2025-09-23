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
  Chip
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Rejection, RejectionFormData, CategoryOption } from '../../types/rejection.types';
import { ColDef } from 'ag-grid-community';
import styles from './RejectionFormModal.module.scss';

interface RejectionFormModalProps {
  open: boolean;
  rejection?: Rejection | null;
  onClose: () => void;
  loading?: boolean;
}

// 재처리 요청용 스키마
const schema = yup.object({
  reprocessReason: yup
    .string()
    .required('재처리 사유는 필수입니다')
    .max(500, '재처리 사유는 500자 이내로 입력해주세요'),
  modifiedContent: yup
    .string()
    .max(1000, '수정 내용은 1000자 이내로 입력해주세요')
});

const RejectionFormModal: React.FC<RejectionFormModalProps> = ({
  open,
  rejection,
  onClose,
  loading = false
}) => {
  const { t } = useTranslation('compliance');
  const [relatedHistory, setRelatedHistory] = useState<Rejection[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      reprocessReason: '',
      modifiedContent: ''
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open && rejection) {
      reset({
        reprocessReason: '',
        modifiedContent: ''
      });
      // 관련 이력 로드
      loadRelatedHistory(rejection.id);
    }
  }, [open, rejection, reset]);

  // 관련 이력 로드 함수
  const loadRelatedHistory = useCallback(async (rejectionId: string) => {
    try {
      // TODO: API 호출로 해당 반려 건의 관련 이력 로드
      // const response = await rejectionApi.getRelatedHistory(rejectionId);
      // setRelatedHistory(response.data.history);

      // 임시 데이터
      setRelatedHistory([
        {
          id: 'hist-1',
          sequence: 1,
          category: '책무구조도',
          categoryDetail: '조직체계',
          partName: '경영진단본부',
          content: '책무구조도 승인 요청 (1차)',
          requestDate: '2024-09-10',
          requesterName: '김담당',
          requester: '경영진단본부',
          rejectionDate: '2024-09-12',
          rejectorName: '박승인자',
          rejector: '총합기획부',
          rejectionComment: '양식 오류',
          status: '반려',
          canReprocess: false,
          partCode: 'RSP-001'
        }
      ]);
    } catch (error) {
      console.error('관련 이력 로드 실패:', error);
    }
  }, []);

  // 재처리 요청 제출 처리
  const onSubmit = useCallback(async (data: any) => {
    try {
      // TODO: 재처리 요청 API 호출
      console.log('재처리 요청 데이터:', {
        rejectionId: rejection?.id,
        ...data
      });

      // 성공 후 모달 닫기
      onClose();
    } catch (error) {
      console.error('재처리 요청 실패:', error);
    }
  }, [rejection, onClose]);

  // 관련 이력 테이블 컬럼 정의
  const historyColumns: ColDef<Rejection>[] = [
    {
      field: 'requestDate',
      headerName: '요청일자',
      width: 110,
      sortable: true,
      cellStyle: { textAlign: 'center' },
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return params.value.split('T')[0];
      }
    },
    {
      field: 'content',
      headerName: '내용',
      width: 200,
      sortable: true,
      cellStyle: { textAlign: 'left' },
      tooltipField: 'content'
    },
    {
      field: 'rejectionDate',
      headerName: '반려일자',
      width: 110,
      sortable: true,
      cellStyle: { textAlign: 'center' },
      valueFormatter: (params: any) => {
        if (!params.value) return '';
        return params.value.split('T')[0];
      }
    },
    {
      field: 'rejectionComment',
      headerName: '반려의견',
      width: 180,
      sortable: true,
      cellStyle: { textAlign: 'left' },
      tooltipField: 'rejectionComment'
    },
    {
      field: 'status',
      headerName: '상태',
      width: 80,
      sortable: true,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: any) => {
        const status = params.value;
        let color = 'default';

        switch (status) {
          case '반려':
            color = 'error';
            break;
          case '완료':
            color = 'success';
            break;
          case '처리중':
            color = 'warning';
            break;
          default:
            color = 'default';
        }

        return <Chip label={status} color={color as any} size="small" />;
      }
    }
  ];

  const modalTitle = '반려 상세 정보';

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'close',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading
    }
  ];

  // 재처리 가능한 경우 재처리 요청 버튼 추가
  if (rejection?.canReprocess) {
    modalActions.push({
      key: 'reprocess',
      label: '재처리 요청',
      variant: 'contained',
      color: 'warning',
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading,
      loading: loading
    });
  }

  if (!rejection) {
    return null;
  }

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
      {/* 반려 기본 정보 */}
      <Box className={styles.basicInfo}>
        <Typography variant="h6" className={styles.sectionTitle}>
          📋 반려 기본 정보
        </Typography>

        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>구분</Typography>
              <Typography className={styles.fieldValue}>{rejection.category}</Typography>
            </div>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>구분상세</Typography>
              <Typography className={styles.fieldValue}>{rejection.categoryDetail}</Typography>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>부품코드</Typography>
              <Typography className={styles.fieldValue}>{rejection.partCode}</Typography>
            </div>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>부품명</Typography>
              <Typography className={styles.fieldValue}>{rejection.partName}</Typography>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>요청일자</Typography>
              <Typography className={styles.fieldValue}>
                {rejection.requestDate?.split('T')[0]}
              </Typography>
            </div>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>요청자</Typography>
              <Typography className={styles.fieldValue}>
                {rejection.requesterName} ({rejection.requester})
              </Typography>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>반려일자</Typography>
              <Typography className={styles.fieldValue}>
                {rejection.rejectionDate?.split('T')[0]}
              </Typography>
            </div>
            <div className={styles.infoField}>
              <Typography className={styles.fieldLabel}>반려자</Typography>
              <Typography className={styles.fieldValue}>
                {rejection.rejectorName} ({rejection.rejector})
              </Typography>
            </div>
          </div>

          <div className={styles.fullWidthField}>
            <Typography className={styles.fieldLabel}>내용</Typography>
            <Typography className={styles.fieldValue}>{rejection.content}</Typography>
          </div>

          <div className={styles.fullWidthField}>
            <Typography className={styles.fieldLabel}>반려의견</Typography>
            <Typography className={styles.fieldValue}>{rejection.rejectionComment}</Typography>
          </div>
        </div>
      </Box>

      {/* 재처리 요청 폼 (재처리 가능한 경우에만 표시) */}
      {rejection.canReprocess && (
        <>
          <Divider className={styles.divider} />
          <Box component="form" className={styles.reprocessForm}>
            <Typography variant="h6" className={styles.sectionTitle}>
              🔄 재처리 요청
            </Typography>

            <div className={styles.formRow}>
              <Controller
                name="reprocessReason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="재처리 사유 *"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.reprocessReason}
                    helperText={errors.reprocessReason?.message}
                    className={styles.formField}
                    placeholder="재처리가 필요한 사유를 상세히 입력해주세요"
                  />
                )}
              />
            </div>

            <div className={styles.formRow}>
              <Controller
                name="modifiedContent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="수정 내용"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.modifiedContent}
                    helperText={errors.modifiedContent?.message}
                    className={styles.formField}
                    placeholder="수정된 내용이 있다면 입력해주세요 (선택사항)"
                  />
                )}
              />
            </div>
          </Box>
        </>
      )}

      {/* 관련 이력 테이블 */}
      <Divider className={styles.divider} />
      <Box className={styles.historySection}>
        <div className={styles.tableHeader}>
          <Typography variant="subtitle1" className={styles.tableTitle}>
            📋 관련 이력
          </Typography>
        </div>
        <div className={styles.tableContainer}>
          <BaseDataGrid
            data={relatedHistory}
            columns={historyColumns}
            pagination={false}
            height={200}
            theme="rsms"
            emptyMessage="관련 이력이 없습니다."
          />
        </div>
      </Box>
    </BaseModal>
  );
};

RejectionFormModal.displayName = 'RejectionFormModal';

export default RejectionFormModal;