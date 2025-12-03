/**
 * 제출보고서 등록/수정/상세 모달
 * PositionFormModal 표준 템플릿 기반
 * - API 연동 CRUD 구현 완료
 *
 * 주요 기능:
 * 1. 등록 모드: 새로운 제출보고서 작성 및 첨부파일 업로드
 * 2. 상세 모드: 기존 제출보고서 조회, 수정, 첨부파일 다운로드/삭제
 * 3. submit_reports 테이블 구조 기반
 */

import { Button } from '@/shared/components/atoms/Button';
import { FileUpload, type UploadedFile } from '@/shared/components/molecules/FileUpload';
import toast from '@/shared/utils/toast';
// 첨부파일 API
import {
  deleteAttachment,
  getAttachmentsByEntity,
  toUploadedFile,
  uploadAttachment
} from '@/shared/api/attachmentApi';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import type { SubmitReport, SubmitReportFormData } from '../../types/submitReportList.types';

// Domain Components
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { SubmittingAgencyComboBox } from '@/domains/submitreport/components/molecules/SubmittingAgencyComboBox';
import { ReportTypeComboBox } from '@/domains/submitreport/components/molecules/ReportTypeComboBox';

interface SubmitReportFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  report: SubmitReport | null;
  onClose: () => void;
  onSave: (formData: SubmitReportFormData) => Promise<void>;
  onUpdate: (id: string, formData: SubmitReportFormData) => Promise<void>;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

/**
 * 제출보고서 등록/상세 모달 컴포넌트
 * - 등록 모드: 신규 제출보고서 작성
 * - 상세 모드: 기존 제출보고서 조회 및 수정
 */
const SubmitReportFormModal: React.FC<SubmitReportFormModalProps> = ({
  open,
  mode,
  report,
  onClose,
  onSave,
  onUpdate,
  onRefresh,
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<SubmitReportFormData>({
    ledgerOrderId: '',
    submittingAgencyCd: '',
    reportTypeCd: '',
    subReportTitle: '',
    targetExecutiveEmpNo: '',
    positionId: '',
    submissionDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
    remarks: ''
  });

  // 첨부파일 상태
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileError, setFileError] = useState<string>('');

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 에러 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * 서버에서 첨부파일 목록 조회
   * - submit_reports 테이블의 reportId로 첨부파일 조회
   * @param reportId 제출보고서 ID
   */
  const loadAttachments = useCallback(async (reportId: string) => {
    console.log('[SubmitReportFormModal] 첨부파일 조회 시작:', reportId);
    try {
      const files = await getAttachmentsByEntity('submit_reports', reportId);
      console.log('[SubmitReportFormModal] 첨부파일 조회 결과:', files);
      setUploadedFiles(files.map(toUploadedFile));
    } catch (error) {
      console.error('[SubmitReportFormModal] 첨부파일 조회 실패:', error);
      setUploadedFiles([]);
    }
  }, []);

  /**
   * 첨부파일 서버 동기화 처리
   * - 저장 버튼 클릭 시 호출됨
   * - 새로 추가된 파일 업로드, 삭제된 파일 삭제
   * @param reportId 제출보고서 ID (submit_reports.report_id)
   * @param currentFiles 현재 로컬 상태의 파일 목록
   */
  const syncAttachmentsToServer = useCallback(async (
    reportId: string,
    currentFiles: UploadedFile[]
  ) => {
    // 서버에서 원본 파일 목록 다시 조회 (삭제 비교용)
    const serverFiles = await getAttachmentsByEntity('submit_reports', reportId);
    const serverFileIds = serverFiles.map(f => f.attachmentId);

    // 새로 추가된 파일 찾기 (serverId가 없는 파일)
    const newFiles = currentFiles.filter(f => !f.serverId);
    // 삭제된 파일 찾기 (서버에 있었으나 현재 목록에 없는 파일)
    const deletedFileIds = serverFileIds.filter(
      serverId => !currentFiles.find(f => f.serverId === serverId)
    );

    console.log('[SubmitReportFormModal] 첨부파일 동기화:', {
      newFiles: newFiles.length,
      deletedFiles: deletedFileIds.length
    });

    // 새 파일 업로드
    for (const newFile of newFiles) {
      try {
        await uploadAttachment({
          file: newFile.file,
          entityType: 'submit_reports',
          entityId: reportId,
          fileCategory: 'REPORT'
        });
        console.log('[SubmitReportFormModal] 파일 업로드 성공:', newFile.file.name);
      } catch (error) {
        console.error('[SubmitReportFormModal] 파일 업로드 실패:', error);
        throw error;
      }
    }

    // 삭제된 파일 처리
    for (const fileId of deletedFileIds) {
      try {
        await deleteAttachment(fileId);
        console.log('[SubmitReportFormModal] 파일 삭제 성공:', fileId);
      } catch (error) {
        console.error('[SubmitReportFormModal] 파일 삭제 실패:', error);
      }
    }
  }, []);

  /**
   * 모달 열릴 때 초기화
   */
  useEffect(() => {
    if (mode === 'create') {
      // 등록 모드: 폼 초기화
      setFormData({
        ledgerOrderId: '',
        submittingAgencyCd: '',
        reportTypeCd: '',
        subReportTitle: '',
        targetExecutiveEmpNo: '',
        positionId: '',
        submissionDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setUploadedFiles([]);
      setIsEditing(true);
      setErrors({});
      setFileError('');
    } else if (report) {
      // 상세 모드: 기존 데이터 로드
      setFormData({
        ledgerOrderId: report.ledgerOrderId,
        submittingAgencyCd: report.submittingAgencyCd,
        reportTypeCd: report.reportTypeCd,
        subReportTitle: report.subReportTitle || '',
        targetExecutiveEmpNo: report.targetExecutiveEmpNo || '',
        positionId: report.positionId || '',
        submissionDate: report.submissionDate,
        remarks: report.remarks || ''
      });

      // 서버에서 첨부파일 목록 조회
      setUploadedFiles([]); // 먼저 초기화
      loadAttachments(report.reportId);

      setIsEditing(false);
      setErrors({});
      setFileError('');
    }
  }, [mode, report, loadAttachments]);

  /**
   * 폼 필드 값 변경 핸들러
   */
  const handleChange = useCallback((field: keyof SubmitReportFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * 첨부파일 변경 핸들러
   */
  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
    setFileError('');
  }, []);

  /**
   * 첨부파일 에러 핸들러
   */
  const handleFileError = useCallback((error: string) => {
    setFileError(error);
  }, []);

  /**
   * 폼 유효성 검증
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ledgerOrderId?.trim()) {
      newErrors.ledgerOrderId = '원장차수를 선택해주세요.';
    }
    if (!formData.submittingAgencyCd?.trim()) {
      newErrors.submittingAgencyCd = '제출기관코드를 입력해주세요.';
    }
    if (!formData.reportTypeCd?.trim()) {
      newErrors.reportTypeCd = '제출보고서구분코드를 입력해주세요.';
    }
    if (!formData.submissionDate?.trim()) {
      newErrors.submissionDate = '제출일을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * 등록/수정 제출 핸들러
   * - API를 통한 CRUD 처리
   * - 수정 모드에서 첨부파일 서버 동기화 처리
   */
  const handleSubmit = useCallback(async () => {
    // 폼 검증
    if (!validateForm()) {
      toast.warning('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        // 등록 모드 - 폼 데이터 저장
        // 주의: 신규 등록 시에는 reportId가 없으므로 먼저 보고서를 생성한 후
        // 반환된 reportId로 첨부파일을 업로드해야 함
        // 이 로직은 상위 컴포넌트(SubmitReportList.tsx)의 handleSave에서 처리
        await onSave({
          ...formData,
          attachments: uploadedFiles.map(f => f.file) // File 객체 배열 전달
        });

        // 목록 새로고침
        if (onRefresh) {
          onRefresh();
        }

        onClose();
      } else if (report && isEditing) {
        // 수정 모드 - 첨부파일 서버 동기화 후 폼 데이터 저장
        try {
          // 1. 첨부파일 서버 동기화 (새 파일 업로드, 삭제된 파일 삭제)
          await syncAttachmentsToServer(report.reportId, uploadedFiles);
          console.log('[SubmitReportFormModal] 첨부파일 동기화 완료');
        } catch (error) {
          console.error('[SubmitReportFormModal] 첨부파일 동기화 실패:', error);
          toast.error('첨부파일 업로드에 실패했습니다.');
          return;
        }

        // 2. 폼 데이터 저장 (첨부파일 제외 - 이미 동기화됨)
        await onUpdate(report.reportId, {
          ...formData,
          attachments: [] // 이미 동기화됨
        });

        // 목록 새로고침
        if (onRefresh) {
          onRefresh();
        }

        onClose();
      }
    } catch (error) {
      console.error('제출보고서 저장 실패:', error);
      // 에러 토스트는 상위 컴포넌트에서 처리됨
    }
  }, [mode, formData, uploadedFiles, report, isEditing, onClose, onSave, onUpdate, onRefresh, validateForm, syncAttachmentsToServer]);

  /**
   * 수정 모드 전환 핸들러
   */
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  /**
   * 취소 핸들러
   */
  const handleCancel = useCallback(() => {
    if (mode === 'detail' && report) {
      // 상세 모드에서 수정 취소: 원래 데이터로 복원
      setFormData({
        ledgerOrderId: report.ledgerOrderId,
        submittingAgencyCd: report.submittingAgencyCd,
        reportTypeCd: report.reportTypeCd,
        subReportTitle: report.subReportTitle || '',
        targetExecutiveEmpNo: report.targetExecutiveEmpNo || '',
        positionId: report.positionId || '',
        submissionDate: report.submissionDate,
        remarks: report.remarks || ''
      });
      setIsEditing(false);
      setErrors({});
      setFileError('');
    } else {
      // 등록 모드: 모달 닫기
      onClose();
    }
  }, [mode, report, onClose]);

  const title = mode === 'create' ? '제출보고서 등록' : '제출보고서 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

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
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 기본 정보 섹션 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
              기본 정보
            </Typography>
            <Grid container spacing={2}>
              {/* 원장차수 + 제출기관 (한 줄) */}
              <Grid item xs={12} sm={6}>
                <LedgerOrderComboBox
                  value={formData.ledgerOrderId || undefined}
                  onChange={(value: string | null) => handleChange('ledgerOrderId', value || '')}
                  label="원장차수"
                  required
                  disabled={isReadOnly}
                  error={!!errors.ledgerOrderId}
                  helperText={errors.ledgerOrderId}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SubmittingAgencyComboBox
                  value={formData.submittingAgencyCd || undefined}
                  onChange={(value: string | null) => handleChange('submittingAgencyCd', value || '')}
                  label="제출기관"
                  required
                  disabled={isReadOnly}
                  error={!!errors.submittingAgencyCd}
                  helperText={errors.submittingAgencyCd}
                  fullWidth
                  size="small"
                />
              </Grid>

              {/* 제출보고서구분 + 제출일 (한 줄) */}
              <Grid item xs={12} sm={6}>
                <ReportTypeComboBox
                  value={formData.reportTypeCd || undefined}
                  onChange={(value: string | null) => handleChange('reportTypeCd', value || '')}
                  label="제출보고서구분"
                  required
                  disabled={isReadOnly}
                  error={!!errors.reportTypeCd}
                  helperText={errors.reportTypeCd}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="제출일"
                  type="date"
                  value={formData.submissionDate}
                  onChange={(e) => handleChange('submissionDate', e.target.value)}
                  required
                  disabled={isReadOnly}
                  error={!!errors.submissionDate}
                  helperText={errors.submissionDate}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* 제출보고서 제목 (전체 너비) */}
              <Grid item xs={12}>
                <TextField
                  label="제출보고서 제목"
                  value={formData.subReportTitle}
                  onChange={(e) => handleChange('subReportTitle', e.target.value)}
                  placeholder="제출보고서의 제목을 입력하세요"
                  disabled={isReadOnly}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>

          {/* 대상 임원 정보 섹션 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
              대상 임원 정보 (선택)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* 제출 대상 임원 사번 */}
              <TextField
                label="제출 대상 임원 사번"
                value={formData.targetExecutiveEmpNo}
                onChange={(e) => handleChange('targetExecutiveEmpNo', e.target.value)}
                placeholder="임원 사번을 입력하세요"
                disabled={isReadOnly}
                fullWidth
                size="small"
              />

              {/* 직책ID */}
              <TextField
                label="직책ID"
                value={formData.positionId}
                onChange={(e) => handleChange('positionId', e.target.value)}
                placeholder="직책ID를 입력하세요"
                disabled={isReadOnly}
                fullWidth
                size="small"
                helperText="positions 테이블의 positions_id 참조"
              />
            </Box>
          </Box>

          {/* 비고 섹션 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.95rem' }}>
              비고
            </Typography>
            <TextField
              label="비고"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              placeholder="특이사항이나 추가 설명을 입력하세요"
              disabled={isReadOnly}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
          </Box>

          {/* 첨부파일 섹션 */}
          <Box>
            <FileUpload
              value={uploadedFiles}
              onChange={handleFilesChange}
              onError={handleFileError}
              label="첨부파일"
              placeholder="제출보고서 관련 파일을 드래그하거나 클릭하여 업로드하세요"
              maxFiles={10}
              maxSize={20 * 1024 * 1024} // 20MB
              accept=".pdf,.doc,.docx,.xlsx,.xls,.hwp,.txt"
              disabled={isReadOnly}
              readOnly={isReadOnly}
              error={fileError}
              showFileList={true}
            />
            {!isReadOnly && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                * PDF, Word, Excel, 한글, 텍스트 파일만 업로드 가능합니다. (최대 10개, 파일당 20MB)
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? '등록 중...' : '등록'}
            </Button>
          </>
        ) : (
          <>
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={onClose}>
                  닫기
                </Button>
                <Button variant="contained" onClick={handleEdit}>
                  수정
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReportFormModal;
