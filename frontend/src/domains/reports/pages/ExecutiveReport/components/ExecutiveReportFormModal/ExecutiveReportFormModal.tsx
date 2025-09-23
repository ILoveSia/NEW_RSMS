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
  Chip,
  Button
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import {
  ResponsibilityInspection,
  DutyInspection,
  ExecutiveReportFormData,
  TargetOrganization
} from '../../types/executiveReport.types';
import { ColDef } from 'ag-grid-community';
import styles from './ExecutiveReportFormModal.module.scss';

interface ExecutiveReportFormModalProps {
  open: boolean;
  mode: 'create' | 'edit' | 'detail';
  report?: ResponsibilityInspection | DutyInspection | null;
  onClose: () => void;
  onSave: (data: ExecutiveReportFormData) => void;
  onUpdate: (id: string, data: ExecutiveReportFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  inspectionRound: yup
    .string()
    .required('점검회차는 필수입니다')
    .max(50, '점검회차는 50자 이내로 입력해주세요'),
  inspectionContent: yup
    .string()
    .required('점검내용은 필수입니다')
    .max(1000, '점검내용은 1000자 이내로 입력해주세요'),
  targetOrganization: yup
    .string()
    .required('대상조직은 필수입니다'),
  reportSummary: yup
    .string()
    .required('보고서 요약은 필수입니다')
    .max(500, '보고서 요약은 500자 이내로 입력해주세요'),
  inspectionScope: yup
    .string()
    .required('점검범위는 필수입니다')
    .max(300, '점검범위는 300자 이내로 입력해주세요'),
  keyFindings: yup
    .string()
    .max(1000, '주요 발견사항은 1000자 이내로 입력해주세요'),
  recommendations: yup
    .string()
    .max(1000, '권고사항은 1000자 이내로 입력해주세요'),
  followUpActions: yup
    .string()
    .max(1000, '후속조치 계획은 1000자 이내로 입력해주세요')
});

const ExecutiveReportFormModal: React.FC<ExecutiveReportFormModalProps> = ({
  open,
  mode,
  report,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('reports');
  const [targetOrgList, setTargetOrgList] = useState<TargetOrganization[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // 대상조직 옵션 (실제로는 API에서 가져와야 함)
  const targetOrganizationOptions = [
    { value: 'headquarters', label: '본부' },
    { value: 'regional_branch', label: '지역본부' },
    { value: 'sales_branch', label: '영업점' },
    { value: 'center', label: '센터' }
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ExecutiveReportFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      inspectionRound: '',
      inspectionPeriod: {
        startDate: '',
        endDate: ''
      },
      inspectionContent: '',
      targetOrganization: '',
      reportSummary: '',
      attachmentFiles: [],
      inspectionScope: '',
      keyFindings: '',
      recommendations: '',
      followUpActions: ''
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if ((mode === 'edit' || mode === 'detail') && report) {
        reset({
          inspectionRound: `${report.inspectionYear}년 ${report.inspectionName}`,
          inspectionPeriod: {
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          },
          inspectionContent: mode === 'detail' && 'managementActivity' in report
            ? report.managementActivity : '점검 내용',
          targetOrganization: report.branchName,
          reportSummary: mode === 'detail' && 'resultDetail' in report
            ? report.resultDetail : '보고서 요약',
          inspectionScope: '점검 범위',
          keyFindings: mode === 'detail' && 'resultDetail' in report
            ? report.resultDetail : '',
          recommendations: mode === 'detail' && 'improvementDetail' in report
            ? report.improvementDetail : '',
          followUpActions: '후속조치 계획',
          attachmentFiles: []
        });
        // 상세/수정 모드에서 대상조직 목록 로드
        loadTargetOrgList(report.id);
      } else {
        reset({
          inspectionRound: '',
          inspectionPeriod: {
            startDate: '',
            endDate: ''
          },
          inspectionContent: '',
          targetOrganization: '',
          reportSummary: '',
          attachmentFiles: [],
          inspectionScope: '',
          keyFindings: '',
          recommendations: '',
          followUpActions: ''
        });
        setTargetOrgList([]);
        setAttachedFiles([]);
      }
    }
  }, [open, mode, report, reset]);

  // 대상조직 목록 로드 함수
  const loadTargetOrgList = useCallback(async (reportId: string) => {
    try {
      // TODO: API 호출로 해당 보고서의 대상조직 정보 로드
      // const response = await executiveReportApi.getTargetOrganizations(reportId);
      // setTargetOrgList(response.data.organizations);

      // 임시 데이터
      setTargetOrgList([
        {
          id: '1',
          organizationName: '본부 경영진단팀',
          organizationType: 'HEADQUARTERS',
          parentOrganization: '경영진단본부',
          manager: '홍길동',
          managerPosition: '팀장',
          contactInfo: '02-1234-5678',
          isActive: true,
          authorityLevel: 'ADMIN'
        },
        {
          id: '2',
          organizationName: '서울지역본부',
          organizationType: 'BRANCH',
          parentOrganization: '영업본부',
          manager: '김철수',
          managerPosition: '본부장',
          contactInfo: '02-2345-6789',
          isActive: true,
          authorityLevel: 'WRITE'
        }
      ]);
    } catch (error) {
      console.error('대상조직 목록 로드 실패:', error);
    }
  }, []);

  // 파일 업로드 처리
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  // 파일 삭제 처리
  const handleFileRemove = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 폼 제출 처리
  const onSubmit = useCallback((data: ExecutiveReportFormData) => {
    const submitData: ExecutiveReportFormData = {
      ...data,
      attachmentFiles: attachedFiles
    };

    if (mode === 'create') {
      onSave(submitData);
    } else if ((mode === 'edit' || mode === 'detail') && report) {
      onUpdate(report.id, submitData);
    }
  }, [mode, report, onSave, onUpdate, attachedFiles]);

  // 대상조직 테이블 컬럼 정의
  const orgColumns: ColDef<TargetOrganization>[] = [
    {
      field: 'organizationName',
      headerName: '조직명',
      width: 200,
      sortable: true
    },
    {
      field: 'organizationType',
      headerName: '조직구분',
      width: 120,
      sortable: true,
      valueFormatter: (params) => {
        const typeMap = {
          HEADQUARTERS: '본부',
          BRANCH: '지점',
          CENTER: '센터',
          TEAM: '팀'
        };
        return typeMap[params.value as keyof typeof typeMap] || params.value;
      }
    },
    {
      field: 'manager',
      headerName: '담당자',
      width: 100,
      sortable: true
    },
    {
      field: 'managerPosition',
      headerName: '직책',
      width: 100,
      sortable: true
    },
    {
      field: 'authorityLevel',
      headerName: '권한수준',
      width: 100,
      sortable: true,
      valueFormatter: (params) => {
        const levelMap = {
          READ: '읽기',
          WRITE: '읽기/쓰기',
          ADMIN: '관리자'
        };
        return levelMap[params.value as keyof typeof levelMap] || params.value;
      }
    }
  ];

  const modalTitle = mode === 'create' ? '신규 보고서 작성' :
                     mode === 'edit' ? '보고서 수정' : '보고서 상세';
  const submitButtonText = mode === 'create' ? '저장' :
                           mode === 'edit' ? '수정' : '확인';

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'cancel',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading
    }
  ];

  // 등록/수정 모드에서만 저장 버튼 추가
  if (mode === 'create' || mode === 'edit') {
    modalActions.push({
      key: 'submit',
      label: submitButtonText,
      variant: 'contained',
      color: 'primary',
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading,
      loading: loading
    });
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
      {/* 기본 정보 입력 폼 */}
      <Box component="form" className={styles.form}>
        <Typography variant="h6" className={styles.sectionTitle}>
          📋 보고서 기본정보
        </Typography>

        <div className={styles.formRow}>
          <Controller
            name="inspectionRound"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검회차 *"
                variant="outlined"
                fullWidth
                error={!!errors.inspectionRound}
                helperText={errors.inspectionRound?.message}
                className={styles.formField}
                placeholder="2024년1회차 이행점검"
                disabled={mode === 'detail'}
              />
            )}
          />

          <Controller
            name="targetOrganization"
            control={control}
            render={({ field }) => (
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.targetOrganization}
                className={styles.formField}
              >
                <InputLabel>대상조직 *</InputLabel>
                <Select
                  {...field}
                  label="대상조직 *"
                  disabled={mode === 'detail'}
                >
                  {targetOrganizationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.targetOrganization && (
                  <FormHelperText>{errors.targetOrganization.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="inspectionPeriod.startDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검기간(시작) *"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                className={styles.formField}
                disabled={mode === 'detail'}
              />
            )}
          />

          <Controller
            name="inspectionPeriod.endDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검기간(종료) *"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                className={styles.formField}
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="inspectionScope"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검범위 *"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                error={!!errors.inspectionScope}
                helperText={errors.inspectionScope?.message}
                className={styles.formField}
                placeholder="점검 대상 업무 범위를 입력하세요"
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="inspectionContent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="점검내용 *"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                error={!!errors.inspectionContent}
                helperText={errors.inspectionContent?.message}
                className={styles.formField}
                placeholder="상세한 점검 내용을 입력하세요"
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="reportSummary"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="보고서 요약 *"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.reportSummary}
                helperText={errors.reportSummary?.message}
                className={styles.formField}
                placeholder="보고서 주요 내용 요약"
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="keyFindings"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="주요 발견사항"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.keyFindings}
                helperText={errors.keyFindings?.message}
                className={styles.formField}
                placeholder="점검을 통해 발견된 주요 사항을 기술하세요"
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="recommendations"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="권고사항"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.recommendations}
                helperText={errors.recommendations?.message}
                className={styles.formField}
                placeholder="개선을 위한 권고사항을 입력하세요"
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        <div className={styles.formRow}>
          <Controller
            name="followUpActions"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="후속조치 계획"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                error={!!errors.followUpActions}
                helperText={errors.followUpActions?.message}
                className={styles.formField}
                placeholder="향후 후속조치 계획을 입력하세요"
                disabled={mode === 'detail'}
              />
            )}
          />
        </div>

        {/* 첨부파일 섹션 */}
        <Typography variant="h6" className={styles.sectionTitle}>
          📎 첨부파일
        </Typography>

        <div className={styles.fileUploadSection}>
          {mode !== 'detail' && (
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              className={styles.uploadButton}
            >
              파일 업로드
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
            </Button>
          )}

          <div className={styles.fileList}>
            {attachedFiles.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                icon={<AttachFileIcon />}
                onDelete={mode !== 'detail' ? () => handleFileRemove(index) : undefined}
                variant="outlined"
                className={styles.fileChip}
              />
            ))}
            {attachedFiles.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                첨부된 파일이 없습니다.
              </Typography>
            )}
          </div>
        </div>
      </Box>

      {/* 대상조직 목록 테이블 (상세/수정 모드에서만 표시) */}
      {(mode === 'detail' || mode === 'edit') && (
        <>
          <Divider className={styles.divider} />
          <Box className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <Typography variant="subtitle1" className={styles.tableTitle}>
                🏢 대상조직 목록
              </Typography>
            </div>
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={targetOrgList}
                columns={orgColumns}
                pagination={false}
                height={200}
                theme="rsms"
                emptyMessage="조회된 대상조직이 없습니다."
              />
            </div>
          </Box>
        </>
      )}
    </BaseModal>
  );
};

ExecutiveReportFormModal.displayName = 'ExecutiveReportFormModal';

export default ExecutiveReportFormModal;