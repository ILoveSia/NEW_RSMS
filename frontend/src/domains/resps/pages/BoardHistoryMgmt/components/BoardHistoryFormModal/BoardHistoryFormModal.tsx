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
  IconButton,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Description as FileIcon,
  AttachFile as AttachFileIcon,
  AccountTree as ResponsibilityIcon
} from '@mui/icons-material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Button } from '@/shared/components/atoms/Button';
import {
  BoardHistory,
  BoardHistoryFormData,
  BoardHistoryFile,
  FileUploadData,
  BOARD_HISTORY_CONSTANTS
} from '../../types/boardHistory.types';
import { fileListColumns } from '../BoardHistoryDataGrid/boardHistoryColumns';
import styles from './BoardHistoryFormModal.module.scss';

interface BoardHistoryFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  boardHistory?: BoardHistory | null;
  onClose: () => void;
  onSave: (data: BoardHistoryFormData) => void;
  onUpdate: (id: string, data: BoardHistoryFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  round: yup
    .number()
    .required('이사회 회차는 필수입니다')
    .positive('이사회 회차는 양수여야 합니다')
    .integer('이사회 회차는 정수여야 합니다'),
  resolutionName: yup
    .string()
    .required('이사회 결의명은 필수입니다')
    .max(BOARD_HISTORY_CONSTANTS.MAX_RESOLUTION_NAME_LENGTH, `이사회 결의명은 ${BOARD_HISTORY_CONSTANTS.MAX_RESOLUTION_NAME_LENGTH}자 이내로 입력해주세요`),
  resolutionDate: yup
    .string()
    .required('이사회 결의일자는 필수입니다')
    .test('not-future-date', '미래 날짜는 입력할 수 없습니다', (value) => {
      if (!value) return true;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // 오늘까지 허용
      return selectedDate <= today;
    }),
  authorPosition: yup
    .string()
    .required('작성자 직책은 필수입니다')
    .max(50, '작성자 직책은 50자 이내로 입력해주세요'),
  authorName: yup
    .string()
    .required('작성자는 필수입니다')
    .max(50, '작성자는 50자 이내로 입력해주세요'),
  summary: yup
    .string()
    .max(BOARD_HISTORY_CONSTANTS.MAX_SUMMARY_LENGTH, `요약정보는 ${BOARD_HISTORY_CONSTANTS.MAX_SUMMARY_LENGTH}자 이내로 입력해주세요`),
  content: yup
    .string()
    .max(BOARD_HISTORY_CONSTANTS.MAX_CONTENT_LENGTH, `내용은 ${BOARD_HISTORY_CONSTANTS.MAX_CONTENT_LENGTH}자 이내로 입력해주세요`),
});

const BoardHistoryFormModal: React.FC<BoardHistoryFormModalProps> = ({
  open,
  mode,
  boardHistory,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const [files, setFiles] = useState<BoardHistoryFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<BoardHistoryFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      round: 0,
      resolutionName: '',
      resolutionDate: '',
      authorPosition: '',
      authorName: '',
      summary: '',
      content: '',
      files: []
    }
  });

  // 폼 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'detail' && boardHistory) {
        reset({
          round: boardHistory.round,
          resolutionName: boardHistory.resolutionName,
          resolutionDate: boardHistory.resolutionDate,
          authorPosition: boardHistory.authorPosition,
          authorName: boardHistory.authorName,
          summary: boardHistory.summary || '',
          content: boardHistory.content || '',
          files: []
        });
        // 상세 모드에서 파일목록 로드 (실제로는 API 호출)
        loadFileList(boardHistory.id);
      } else {
        const currentYear = new Date().getFullYear();
        reset({
          round: 0,
          resolutionName: '',
          resolutionDate: '',
          authorPosition: '관리자',
          authorName: '관리자',
          summary: '',
          content: '',
          files: []
        });
        setFiles([]);
      }
    }
  }, [open, mode, boardHistory, reset]);

  // 파일목록 로드 함수 (상세 모드용)
  const loadFileList = useCallback(async (boardHistoryId: string) => {
    try {
      // TODO: API 호출로 해당 이사회 이력의 파일 정보 로드
      // const response = await boardHistoryApi.getFiles(boardHistoryId);
      // setFiles(response.data);

      // 임시 데이터
      const mockFiles: BoardHistoryFile[] = [
        {
          id: '1',
          boardHistoryId,
          seq: 1,
          fileName: '이사회결의록_2025_1차.pdf',
          originalFileName: '이사회결의록_2025_1차.pdf',
          fileSize: 2048576, // 2MB
          fileType: 'application/pdf',
          fileCategory: 'responsibility',
          filePath: '/files/board/2025/01/',
          uploadDate: '2025-08-13',
          uploadBy: '관리자',
          isActive: true
        },
        {
          id: '2',
          boardHistoryId,
          seq: 2,
          fileName: '회의자료_2025_1차.docx',
          originalFileName: '회의자료_2025_1차.docx',
          fileSize: 1024000, // 1MB
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileCategory: 'general',
          filePath: '/files/board/2025/01/',
          uploadDate: '2025-08-13',
          uploadBy: '관리자',
          isActive: true
        }
      ];
      setFiles(mockFiles);
    } catch (error) {
      console.error('파일목록 로드 실패:', error);
    }
  }, []);

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(async (uploadFiles: File[], category: 'responsibility' | 'general') => {
    if (files.length + uploadFiles.length > BOARD_HISTORY_CONSTANTS.MAX_FILES_PER_HISTORY) {
      alert(`최대 ${BOARD_HISTORY_CONSTANTS.MAX_FILES_PER_HISTORY}개까지 업로드 가능합니다.`);
      return;
    }

    // 파일 크기 검증
    for (const file of uploadFiles) {
      if (file.size > BOARD_HISTORY_CONSTANTS.MAX_FILE_SIZE) {
        alert(`파일 크기는 ${BOARD_HISTORY_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`);
        return;
      }

      if (!BOARD_HISTORY_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(`지원되지 않는 파일 형식입니다: ${file.name}`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // TODO: 실제 파일 업로드 API 호출
      // const uploadPromises = uploadFiles.map(file => boardHistoryApi.uploadFile(file, category));
      // const responses = await Promise.all(uploadPromises);

      // 시뮬레이션
      for (let i = 0; i < uploadFiles.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(((i + 1) / uploadFiles.length) * 100);
      }

      // 임시로 새 파일 객체들 생성
      const newFiles: BoardHistoryFile[] = uploadFiles.map((file, index) => ({
        id: (Date.now() + index).toString(),
        boardHistoryId: boardHistory?.id || '',
        seq: files.length + index + 1,
        fileName: file.name,
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileCategory: category,
        filePath: `/files/board/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadBy: '현재사용자',
        isActive: true
      }));

      setFiles(prev => [...prev, ...newFiles]);
      alert(`${uploadFiles.length}개 파일이 업로드되었습니다.`);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [files.length, boardHistory?.id]);

  // 파일 삭제 핸들러
  const handleFileDelete = useCallback((fileId: string) => {
    if (!window.confirm('파일을 삭제하시겠습니까?')) {
      return;
    }

    setFiles(prev => prev.filter(f => f.id !== fileId));
    alert('파일이 삭제되었습니다.');
  }, []);

  // 파일 다운로드 핸들러
  const handleFileDownload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // TODO: 실제 파일 다운로드 API 호출
    console.log('파일 다운로드:', file.fileName);
    alert(`${file.fileName} 다운로드를 시작합니다.`);
  }, [files]);

  // 책무구조도 파일 추가 핸들러
  const handleResponsibilityFileAdd = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const filesArray = Array.from(target.files);
        handleFileUpload(filesArray, 'responsibility');
      }
    };
    input.click();
  }, [handleFileUpload]);

  // 기타 파일 추가 핸들러
  const handleGeneralFileAdd = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const filesArray = Array.from(target.files);
        handleFileUpload(filesArray, 'general');
      }
    };
    input.click();
  }, [handleFileUpload]);

  // 폼 제출 처리
  const onSubmit = useCallback((data: BoardHistoryFormData) => {
    const formDataWithFiles = {
      ...data,
      files: files.map(f => ({
        file: new File([], f.fileName),
        category: f.fileCategory,
        description: f.fileName
      }))
    };

    if (mode === 'create') {
      onSave(formDataWithFiles);
    } else if (mode === 'detail' && boardHistory) {
      onUpdate(boardHistory.id, formDataWithFiles);
    }
  }, [mode, boardHistory, onSave, onUpdate, files]);

  const modalTitle = mode === 'create' ? '이사회 결의 추가' : '이사회 이력 상세';
  const submitButtonText = mode === 'create' ? '저장' : '수정';

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'cancel',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading || uploading
    },
    {
      key: 'submit',
      label: submitButtonText,
      variant: 'contained',
      color: 'primary',
      onClick: handleSubmit(onSubmit),
      disabled: !isValid || loading || uploading,
      loading: loading
    }
  ];

  // 파일 테이블용 액션 컬럼 추가
  const enhancedFileColumns = [
    ...fileListColumns,
    {
      field: 'actions',
      headerName: '작업',
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data: BoardHistoryFile }) => (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '100%' }}>
          <IconButton
            size="small"
            onClick={() => handleFileDownload(data.id)}
            color="primary"
            title="다운로드"
          >
            <FileIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleFileDelete(data.id)}
            color="error"
            title="삭제"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      ),
      cellStyle: { textAlign: 'center' }
    }
  ];

  // 파일 통계
  const fileStats = {
    total: files.length,
    responsibility: files.filter(f => f.fileCategory === 'responsibility').length,
    general: files.filter(f => f.fileCategory === 'general').length
  };

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
                name="round"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="이사회 회차 *"
                    variant="outlined"
                    fullWidth
                    type="number"
                    error={!!errors.round}
                    helperText={errors.round?.message}
                    placeholder="1"
                  />
                )}
              />
            </div>

            <div className={styles.formGroup}>
              <Controller
                name="resolutionDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="이사회 결의일자 *"
                    variant="outlined"
                    fullWidth
                    type="date"
                    error={!!errors.resolutionDate}
                    helperText={errors.resolutionDate?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </div>

            <div className={styles.formGroup}>
              <Controller
                name="authorPosition"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="작성자 직책 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.authorPosition}
                    helperText={errors.authorPosition?.message}
                    placeholder="관리자"
                  />
                )}
              />
            </div>

            <div className={styles.formGroup}>
              <Controller
                name="authorName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="작성자 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.authorName}
                    helperText={errors.authorName?.message}
                    placeholder="관리자"
                  />
                )}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Controller
                name="resolutionName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="이사회 결의명 *"
                    variant="outlined"
                    fullWidth
                    error={!!errors.resolutionName}
                    helperText={errors.resolutionName?.message}
                    placeholder="2025년 1차 이사회결의"
                  />
                )}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="요약정보"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.summary}
                    helperText={errors.summary?.message}
                    placeholder="신규 임원 선임 및 조직 개편에 관한 이사회 결의"
                  />
                )}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="내용"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={6}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    placeholder="대상 임원: ○○○&#10;대상 민원: ○○○"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* 파일 관리 섹션 */}
        <Divider className={styles.divider} />

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              📎 파일 첨부
            </Typography>
            <div className={styles.fileStats}>
              <Chip
                icon={<AttachFileIcon />}
                label={`총 ${fileStats.total}개`}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<ResponsibilityIcon />}
                label={`책무구조도 ${fileStats.responsibility}개`}
                color="info"
                size="small"
                variant="outlined"
              />
            </div>
          </div>

          {/* 파일 업로드 버튼들 */}
          <div className={styles.fileActions}>
            <Button
              variant="contained"
              startIcon={<ResponsibilityIcon />}
              onClick={handleResponsibilityFileAdd}
              disabled={uploading}
              color="primary"
            >
              책무구조도 파일 추가
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={handleGeneralFileAdd}
              disabled={uploading}
            >
              기타 파일 추가
            </Button>
          </div>

          {/* 업로드 진행률 */}
          {uploading && (
            <div className={styles.uploadProgress}>
              <Typography variant="body2" color="textSecondary">
                파일 업로드 중... {Math.round(uploadProgress)}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </div>
          )}

          {/* 파일 목록 테이블 */}
          <div className={styles.fileList}>
            <BaseDataGrid
              data={files}
              columns={enhancedFileColumns}
              pagination={false}
              height={files.length > 0 ? Math.min(300, files.length * 50 + 50) : 100}
              theme="rsms"
              emptyMessage="조회된 정보가 없습니다."
            />
          </div>
        </div>
      </Box>
    </BaseModal>
  );
};

BoardHistoryFormModal.displayName = 'BoardHistoryFormModal';

export default BoardHistoryFormModal;