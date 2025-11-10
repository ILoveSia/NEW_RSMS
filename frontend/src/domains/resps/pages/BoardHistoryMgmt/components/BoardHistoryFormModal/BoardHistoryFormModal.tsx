import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileDefaultIcon
} from '@mui/icons-material';
import { Button } from '@/shared/components/atoms/Button';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import {
  BoardHistory,
  BoardHistoryFormData,
  BoardHistoryFile,
  BOARD_HISTORY_CONSTANTS
} from '../../types/boardHistory.types';

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
  ledgerOrderId: yup
    .string()
    .required('책무이행차수는 필수입니다'),
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<BoardHistoryFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange',
    defaultValues: {
      ledgerOrderId: '',
      resolutionName: '',
      resolutionDate: '',
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
          ledgerOrderId: boardHistory.ledgerOrderId || '',
          resolutionName: boardHistory.resolutionName,
          resolutionDate: boardHistory.resolutionDate,
          summary: boardHistory.summary || '',
          content: boardHistory.content || '',
          files: []
        });
        // 상세 모드에서 파일목록 로드 (실제로는 API 호출)
        loadFileList(boardHistory.id);
      } else {
        reset({
          ledgerOrderId: '',
          resolutionName: '',
          resolutionDate: '',
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

  // 폼 제출 처리
  const onSubmit = useCallback((data: BoardHistoryFormData) => {
    const formDataWithFiles: BoardHistoryFormData = {
      ...data,
      files: files
    };

    if (mode === 'create') {
      onSave(formDataWithFiles);
    } else if (mode === 'detail' && boardHistory) {
      onUpdate(boardHistory.id, formDataWithFiles);
    }
  }, [mode, boardHistory, onSave, onUpdate, files]);

  const modalTitle = mode === 'create' ? '이사회 결의 추가' : '이사회 이력 상세';
  const submitButtonText = mode === 'create' ? '등록' : '저장';

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 파일 통계
  const fileStats = {
    total: files.length,
    responsibility: files.filter(f => f.fileCategory === 'responsibility').length,
    general: files.filter(f => f.fileCategory === 'general').length
  };

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
        {modalTitle}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
      {/* 기본 정보 입력 폼 */}
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 기본정보 섹션 */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          기본정보
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <Controller
            name="ledgerOrderId"
            control={control}
            render={({ field }) => (
              <LedgerOrderComboBox
                value={field.value || undefined}
                onChange={(value) => field.onChange(value || '')}
                label="책무이행차수"
                size="small"
                fullWidth
                required
                error={!!errors.ledgerOrderId}
                helperText={errors.ledgerOrderId?.message}
              />
            )}
          />

          <Controller
            name="resolutionDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="이사회 결의일자"
                size="small"
                fullWidth
                type="date"
                required
                error={!!errors.resolutionDate}
                helperText={errors.resolutionDate?.message}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Box>

        <Controller
          name="resolutionName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="이사회 결의명"
              size="small"
              fullWidth
              required
              error={!!errors.resolutionName}
              helperText={errors.resolutionName?.message}
              placeholder="2025년 1차 이사회결의"
            />
          )}
        />

        <Controller
          name="summary"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="요약정보"
              size="small"
              fullWidth
              multiline
              rows={3}
              error={!!errors.summary}
              helperText={errors.summary?.message}
              placeholder="신규 임원 선임 및 조직 개편에 관한 이사회 결의"
            />
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="내용"
              size="small"
              fullWidth
              multiline
              rows={6}
              error={!!errors.content}
              helperText={errors.content?.message}
              placeholder="대상 임원: ○○○&#10;대상 민원: ○○○"
            />
          )}
        />

        {/* 파일 첨부 섹션 */}
        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            파일 첨부 ({fileStats.total}개)
          </Typography>
        </Box>

        {/* 파일 목록 리스트 */}
        {files.length > 0 ? (
          <List
            sx={{
              width: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto'
            }}
          >
            {files.map((file, index) => (
              <React.Fragment key={file.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 1,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleFileDownload(file.id)}
                        color="primary"
                        title="다운로드"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleFileDelete(file.id)}
                        color="error"
                        title="삭제"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FileDefaultIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {file.fileName}
                        </Typography>
                        {file.fileCategory === 'responsibility' && (
                          <Chip
                            label="책무구조도"
                            size="small"
                            color="info"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.fileSize)} · {file.uploadDate} · {file.uploadBy}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 100,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              첨부된 파일이 없습니다
            </Typography>
          </Box>
        )}
      </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          닫기
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || loading}
        >
          {loading ? '저장 중...' : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BoardHistoryFormModal.displayName = 'BoardHistoryFormModal';

export default BoardHistoryFormModal;