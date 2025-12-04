/**
 * 이사회이력 등록/상세 모달
 * - 이사회결의 등록, 수정, 상세조회
 * - 실제 API 연동 (Mock 데이터 없음)
 * - FileUpload 공통 컴포넌트 적용
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */

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
  Divider
} from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { FileUpload } from '@/shared/components/molecules/FileUpload/FileUpload';
import type { UploadedFile } from '@/shared/components/molecules/FileUpload/types';
import toast from '@/shared/utils/toast';
import {
  BoardHistory,
  BoardHistoryFormData,
  BOARD_HISTORY_CONSTANTS
} from '../../types/boardHistory.types';

// API import
import {
  getBoardResolution,
  createBoardResolution,
  updateBoardResolution,
  type CreateBoardResolutionRequest,
  type UpdateBoardResolutionRequest,
  type AttachmentDto
} from '../../../../api/boardResolutionApi';

// 첨부파일 API import
import { uploadAttachment } from '@/shared/api/attachmentApi';

interface BoardHistoryFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  boardHistory?: BoardHistory | null;
  onClose: () => void;
  onSave: (data: BoardHistoryFormData) => void;
  onUpdate: (id: string, data: BoardHistoryFormData) => void;
  onRefresh?: () => Promise<void>;
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
      today.setHours(23, 59, 59, 999);
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
  onRefresh,
  loading = false
}) => {
  // 첨부파일 목록 상태 (공통 컴포넌트 UploadedFile 형식)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // 저장 중 로딩 상태
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // 파일 로딩 상태
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  // 파일 업로드 에러
  const [fileError, setFileError] = useState<string | undefined>();

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

  /**
   * AttachmentDto를 UploadedFile 형식으로 변환
   * - 서버에서 로드한 파일을 공통 컴포넌트 형식으로 변환
   */
  const convertAttachmentToUploadedFile = useCallback((attachment: AttachmentDto): UploadedFile => {
    // 서버 파일용 빈 File 객체 생성 (placeholder)
    const placeholderFile = new File([], attachment.fileName, {
      type: attachment.contentType
    });
    // File 객체의 size를 실제 크기로 설정할 수 없으므로 Object.defineProperty 사용
    Object.defineProperty(placeholderFile, 'size', { value: attachment.fileSize });

    return {
      file: placeholderFile,
      id: attachment.attachmentId,
      serverId: attachment.attachmentId,
      url: `/api/attachments/${attachment.attachmentId}/download`,
      uploadedAt: attachment.createdAt,
      uploadedBy: attachment.createdBy
    };
  }, []);

  /**
   * 파일목록 로드 함수 (상세 모드용)
   * - 실제 API 호출로 해당 이사회 이력의 파일 정보 로드
   */
  const loadFileList = useCallback(async (boardHistoryId: string) => {
    setIsLoadingFiles(true);
    try {
      const response = await getBoardResolution(boardHistoryId);

      if (response.attachments && response.attachments.length > 0) {
        const convertedFiles = response.attachments.map(convertAttachmentToUploadedFile);
        setUploadedFiles(convertedFiles);
      } else {
        setUploadedFiles([]);
      }
    } catch (error) {
      console.error('파일목록 로드 실패:', error);
      toast.error('파일 목록을 불러오는데 실패했습니다.');
      setUploadedFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [convertAttachmentToUploadedFile]);

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
        setUploadedFiles([]);
      }
      setFileError(undefined);
    }
  }, [open, mode, boardHistory, reset, loadFileList]);

  /**
   * 파일 변경 핸들러
   */
  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
    setFileError(undefined);
  }, []);

  /**
   * 파일 에러 핸들러
   */
  const handleFileError = useCallback((error: string) => {
    setFileError(error);
    toast.error(error);
  }, []);

  /**
   * 첨부파일 업로드 처리
   * - 새로 추가된 파일(serverId가 없는 파일)만 업로드
   *
   * @param entityId 이사회결의 ID (board_resolutions의 PK)
   */
  const uploadFiles = useCallback(async (entityId: string): Promise<void> => {
    // serverId가 없는 파일 = 새로 추가된 파일
    const newFiles = uploadedFiles.filter(f => !f.serverId);

    if (newFiles.length === 0) {
      return;
    }

    console.log(`📎 [BoardHistoryFormModal] 첨부파일 업로드 시작: ${newFiles.length}개`);

    // 각 파일을 순차적으로 업로드
    for (const uploadedFile of newFiles) {
      try {
        await uploadAttachment({
          file: uploadedFile.file,
          entityType: 'board_resolutions',  // 테이블명
          entityId: entityId,               // 이사회결의 ID
          fileCategory: 'ETC'               // 파일 분류
        });
        console.log(`✅ 파일 업로드 성공: ${uploadedFile.file.name}`);
      } catch (error) {
        console.error(`❌ 파일 업로드 실패: ${uploadedFile.file.name}`, error);
        throw error;  // 실패 시 전체 트랜잭션 롤백을 위해 에러 전파
      }
    }

    console.log(`✅ [BoardHistoryFormModal] 첨부파일 업로드 완료`);
  }, [uploadedFiles]);

  /**
   * 폼 제출 처리
   * - 등록 모드: createBoardResolution API 호출 후 파일 업로드
   * - 수정 모드: updateBoardResolution API 호출 후 파일 업로드
   */
  const onSubmit = useCallback(async (data: BoardHistoryFormData) => {
    setIsSaving(true);

    try {
      if (mode === 'create') {
        const request: CreateBoardResolutionRequest = {
          ledgerOrderId: data.ledgerOrderId,
          resolutionName: data.resolutionName,
          summary: data.summary || undefined,
          content: data.content || undefined
        };

        // 1. 이사회결의 생성
        const createdResolution = await createBoardResolution(request);
        console.log('✅ 이사회결의 생성 완료:', createdResolution.resolutionId);

        // 2. 첨부파일 업로드 (생성된 resolutionId 사용)
        await uploadFiles(createdResolution.resolutionId);

        toast.success('이사회 이력이 성공적으로 등록되었습니다.');

        const formDataWithFiles: BoardHistoryFormData = { ...data, files: [] };
        onSave(formDataWithFiles);

      } else if (mode === 'detail' && boardHistory) {
        const request: UpdateBoardResolutionRequest = {
          resolutionName: data.resolutionName,
          summary: data.summary || undefined,
          content: data.content || undefined
        };

        // 1. 이사회결의 수정
        await updateBoardResolution(boardHistory.id, request);
        console.log('✅ 이사회결의 수정 완료:', boardHistory.id);

        // 2. 새로 추가된 첨부파일 업로드
        await uploadFiles(boardHistory.id);

        toast.success('이사회 이력이 성공적으로 수정되었습니다.');

        const formDataWithFiles: BoardHistoryFormData = { ...data, files: [] };
        onUpdate(boardHistory.id, formDataWithFiles);
      }

      if (onRefresh) {
        await onRefresh();
      }

    } catch (error) {
      console.error('이사회 이력 저장 실패:', error);
      toast.error(mode === 'create'
        ? '이사회 이력 등록에 실패했습니다.'
        : '이사회 이력 수정에 실패했습니다.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [mode, boardHistory, onSave, onUpdate, onRefresh, uploadFiles]);

  const modalTitle = mode === 'create' ? '이사회 결의 추가' : '이사회 이력 상세';
  const submitButtonText = mode === 'create' ? '등록' : '저장';

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

          {/* 파일 첨부 섹션 - 공통 컴포넌트 사용 */}
          <Divider sx={{ my: 1.5 }} />

          {isLoadingFiles ? (
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
                파일 목록을 불러오는 중...
              </Typography>
            </Box>
          ) : (
            <FileUpload
              value={uploadedFiles}
              onChange={handleFilesChange}
              disabled={loading || isSaving}
              readOnly={mode === 'detail'}
              maxFiles={BOARD_HISTORY_CONSTANTS.MAX_FILES_PER_HISTORY}
              maxSize={BOARD_HISTORY_CONSTANTS.MAX_FILE_SIZE}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              label="첨부파일"
              placeholder="파일을 드래그하거나 클릭하여 업로드하세요"
              error={fileError}
              onError={handleFileError}
              compact={false}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={loading || isSaving}>
          닫기
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || loading || isSaving}
        >
          {isSaving ? '저장 중...' : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BoardHistoryFormModal.displayName = 'BoardHistoryFormModal';

export default BoardHistoryFormModal;
