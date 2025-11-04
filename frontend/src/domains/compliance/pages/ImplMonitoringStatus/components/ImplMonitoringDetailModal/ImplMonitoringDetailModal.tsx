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
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Paper
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { InspectionExecution, ManagementActivityDetail, InspectionPerformanceFormData, InspectionResult } from '../../types/implMonitoringStatus.types';
import styles from './ImplMonitoringDetailModal.module.scss';

interface ImplMonitoringDetailModalProps {
  open: boolean;
  execution?: InspectionExecution | null;
  onClose: () => void;
  loading?: boolean;
}

const schema = yup.object({
  managementActivityWritten: yup
    .boolean()
    .required('수행자의 관리활동 작성여부는 필수입니다'),
  inspectionOpinion: yup
    .string()
    .required('점검 의견은 필수입니다')
    .max(1000, '점검 의견은 1000자 이내로 입력해주세요'),
  inspectionResult: yup
    .string()
    .required('점검 결과는 필수입니다')
});

const ImplMonitoringDetailModal: React.FC<ImplMonitoringDetailModalProps> = ({
  open,
  execution,
  onClose,
  loading = false
}) => {
  const { t } = useTranslation('compliance');
  const [managementActivity, setManagementActivity] = useState<ManagementActivityDetail | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InspectionPerformanceFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      managementActivityWritten: false,
      inspectionOpinion: '',
      inspectionResult: '',
      attachments: []
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open && execution) {
      // TODO: API 호출로 관리활동 상세 정보 로드
      loadManagementActivityDetail(execution.id);

      reset({
        managementActivityWritten: false,
        inspectionOpinion: '',
        inspectionResult: '',
        attachments: []
      });
    }
  }, [open, execution, reset]);

  // 관리활동 상세 정보 로드
  const loadManagementActivityDetail = useCallback(async (executionId: string) => {
    try {
      // TODO: 실제 API 호출로 교체
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션

      // 임시 데이터
      const mockActivityDetail: ManagementActivityDetail = {
        activityCode: 'M000000001',
        activityName: '역량 산업',
        method1: '교육수행내과',
        method2: '',
        inspectionRelated: '이행점검 관련 정보',
        internalExternalClassification: '근거1\n증빙자료1',
        relatedRegulations: '관련 내규 정보',
        keyGuide: '중점 가이드라인 내용',
        keyPrinciple: '중점 원칙 내용'
      };

      setManagementActivity(mockActivityDetail);
    } catch (error) {
      console.error('관리활동 상세 정보 로드 실패:', error);
    }
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback(async (data: InspectionPerformanceFormData) => {
    try {
      // TODO: 점검 수행 API 호출
      console.log('점검 수행 데이터:', data);

      // 성공 후 모달 닫기
      onClose();
    } catch (error) {
      console.error('점검 수행 실패:', error);
    }
  }, [onClose]);

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
      label: '저장',
      variant: 'contained',
      color: 'primary',
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading,
      loading: loading
    }
  ];

  if (!execution) {
    return null;
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="이행점검 대상 상세"
      size="xl"
      actions={modalActions}
      loading={loading}
      className={styles.modal}
      contentClassName={styles.modalContent}
    >
      <div className={styles.container}>
        <Grid container spacing={2}>
          {/* 좌측: 관리활동 패널 */}
          <Grid item xs={12} md={1}>
            <div className={styles.leftPanel}>
              <div className={styles.leftPanelHeader}>
                <Typography className={styles.leftPanelTitle}>
                  관리활동
                </Typography>
              </div>
            </div>
          </Grid>

          {/* 중앙: 입력 필드들 */}
          <Grid item xs={12} md={8}>
            <div className={styles.centerPanel}>
              {/* 관리위원수 수지 상세 */}
              <div className={styles.headerSection}>
                <Typography className={styles.headerLabel}>
                  의 관리위원수 수지 상세
                </Typography>
              </div>

              {/* 활동코드 */}
              <div className={styles.fieldRow}>
                <Typography className={styles.fieldLabel}>
                  활동코드 •
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  defaultValue="M000000001"
                  className={styles.inputField}
                />
              </div>

              {/* 방법1 */}
              <div className={styles.fieldRow}>
                <Typography className={styles.fieldLabel}>
                  방법1 •
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  defaultValue="교육수행내과"
                  className={styles.inputField}
                />
              </div>

              {/* 관리활동명 */}
              <div className={styles.fieldRow}>
                <Typography className={styles.fieldLabel}>
                  관리활동명 •
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  defaultValue="역량 산업"
                  className={styles.inputField}
                />
              </div>

              {/* 방법1 텍스트에리어 */}
              <div className={styles.textAreaRow}>
                <Typography className={styles.fieldLabel}>
                  방법1
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={4}
                  size="small"
                  className={styles.textAreaField}
                />
              </div>

              {/* 이행점검관련 */}
              <div className={styles.fieldRow}>
                <Typography className={styles.fieldLabel}>
                  이행점검관련 •
                </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  className={styles.inputField}
                />
              </div>

              {/* 내부통제장치 구분 + 관련 내규 */}
              <div className={styles.doubleFieldRow}>
                <div className={styles.halfField}>
                  <Typography className={styles.fieldLabel}>
                    내부통제장치 구분 •
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.halfField}>
                  <Typography className={styles.fieldLabel}>
                    관련 내규 •
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    className={styles.inputField}
                  />
                </div>
              </div>

              {/* 관련 내규 텍스트에리어 */}
              <div className={styles.textAreaRow}>
                <Typography className={styles.fieldLabel}>
                  관련 내규 •
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                  defaultValue="근거1\n증빙자료1"
                  className={styles.textAreaField}
                />
              </div>

              {/* 증빙 가이드 */}
              <div className={styles.textAreaRow}>
                <Typography className={styles.fieldLabel}>
                  증빙 가이드 •
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                  defaultValue="고객수행내과"
                  className={styles.textAreaField}
                />
              </div>

              {/* 증빙 원천 */}
              <div className={styles.textAreaRow}>
                <Typography className={styles.fieldLabel}>
                  증빙 원천 •
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={2}
                  size="small"
                  className={styles.textAreaField}
                />
              </div>

              {/* 증빙 자료 */}
              <div className={styles.textAreaRow}>
                <Typography className={styles.fieldLabel}>
                  증빙 자료 •
                </Typography>
                <div className={styles.attachmentList}>
                  <div className={styles.attachmentItem}>
                    <span className={styles.attachmentIcon}>📎</span>
                    <span className={styles.attachmentName}>증빙서류_001.pdf</span>
                    <span className={styles.attachmentSize}>(2.5MB)</span>
                  </div>
                  <div className={styles.attachmentItem}>
                    <span className={styles.attachmentIcon}>📎</span>
                    <span className={styles.attachmentName}>관련자료_002.xlsx</span>
                    <span className={styles.attachmentSize}>(1.2MB)</span>
                  </div>
                  <div className={styles.attachmentItem}>
                    <span className={styles.attachmentIcon}>📎</span>
                    <span className={styles.attachmentName}>첨부파일_003.docx</span>
                    <span className={styles.attachmentSize}>(890KB)</span>
                  </div>
                </div>
              </div>
            </div>
          </Grid>

          {/* 우측: 점검 수행 폼들 */}
          <Grid item xs={12} md={3}>
            <div className={styles.rightPanel}>
              {/* 관리활동 본격 작성 */}
              <div className={styles.rightSection}>
                <div className={styles.rightSectionHeader}>
                  <Typography className={styles.rightSectionTitle}>
                    • 관리활동 본격 작성(검사활동결과) •
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    defaultValue="00000000-라..."
                    className={styles.rightHeaderInput}
                  />
                </div>

                <div className={styles.rightFieldRow}>
                  <Typography className={styles.questionText}>
                    • 수행자의 관리활동 작성여부 수행되었습니까?
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    defaultValue="작성"
                    className={styles.rightFieldInput}
                  />
                </div>

                <Typography className={styles.fieldLabel}>
                  점검 의견 •
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                  className={styles.rightTextArea}
                />
              </div>

              {/* 이행점검 결과 작성 */}
              <div className={styles.rightSection}>
                <div className={styles.rightSectionHeader}>
                  <Typography className={styles.rightSectionTitle}>
                    • 이행점검 결과 작성(검사활동결과) •
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    className={styles.rightHeaderInput}
                  />
                </div>

                <div className={styles.rightFieldRow}>
                  <Typography className={styles.questionText}>
                    • 수행자의 관리활동 작성여부 수행되었습니까?
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    defaultValue="작성"
                    className={styles.rightFieldInput}
                  />
                </div>

                <Typography className={styles.fieldLabel}>
                  점검 의견 •
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={3}
                  size="small"
                  className={styles.rightTextArea}
                />
              </div>

              {/* 이행점검 결과 확인 */}
              <div className={styles.rightSection}>
                <div className={styles.rightSectionHeader}>
                  <Typography className={styles.rightSectionTitle}>
                    • 이행점검 결과 확인(검사활동결과) •
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    className={styles.rightHeaderInput}
                  />
                </div>

                <div className={styles.rightFieldRow}>
                  <Typography className={styles.questionText}>
                    • 점검자의 이행점검 작성여부 수행되었습니까?
                  </Typography>
                  <TextField
                    variant="outlined"
                    size="small"
                    defaultValue="작성"
                    className={styles.rightFieldInput}
                  />
                </div>

                <Typography className={styles.fieldLabel}>
                  최종 의견 •
                </Typography>
                <TextField
                  variant="outlined"
                  multiline
                  rows={4}
                  size="small"
                  className={styles.rightTextArea}
                />
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </BaseModal>
  );
};

ImplMonitoringDetailModal.displayName = 'ImplMonitoringDetailModal';

export default ImplMonitoringDetailModal;