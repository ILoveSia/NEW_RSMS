/**
 * 공통 결재요청 모달
 * - 다양한 업무에서 결재선 선택 및 결재 요청에 사용
 * - 업무구분코드(workTypeCd)에 따라 결재선 목록 조회
 * - 결재선 선택 후 결재 요청 처리
 *
 * @author Claude AI
 * @since 2025-12-02
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { ColDef } from 'ag-grid-community';
import {
  ApprovalLineDto,
  getActiveApprovalLinesByWorkType,
  getApprovalLine
} from '@/domains/approval/api/approvalLineApi';

/**
 * 결재요청 대상 문서 정보 타입
 * - 각 업무에서 필요한 정보를 전달
 */
export interface ApprovalDocumentInfo {
  /** 문서 ID */
  id: string;
  /** 문서 제목 (결재 요청 시 표시) */
  title?: string;
  /** 문서 상세 내용 */
  content?: string;
  /** 추가 표시 정보 (key-value 형태) */
  displayFields?: Array<{
    label: string;
    value: string;
  }>;
}

/**
 * 결재요청 모달 Props
 */
export interface ApprovalRequestModalProps {
  /** 모달 열림 여부 */
  open: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 결재 요청 제출 핸들러 */
  onSubmit: (approvalLineId: string, opinion: string) => Promise<void>;
  /** 결재 대상 문서 정보 */
  document: ApprovalDocumentInfo | null;
  /** 업무구분코드 (결재선 조회용) */
  workTypeCd: string;
  /** 결재유형코드 (PLAN_APPROVAL: 계획승인, COMPLETE_APPROVAL: 완료승인, RESULT_APPROVAL: 결과승인) */
  approvalTypeCd?: string;
  /** 모달 제목 */
  modalTitle?: string;
  /** 요청 안내 메시지 */
  requestDescription?: string;
  /** 외부 로딩 상태 */
  loading?: boolean;
}

/**
 * 결재선 단계 표시용 타입
 */
interface ApprovalStepDisplay {
  sequence: number;
  stepName: string;
  approverName: string;
  approverTypeName: string;
  isRequired: string;
}

/**
 * 결재자유형코드 → 명칭 변환
 */
const getApproverTypeName = (code: string | undefined): string => {
  switch (code) {
    case 'POSITION': return '직책 지정';
    case 'DEPT': return '부서장';
    case 'USER': return '사용자 지정';
    default: return code || '-';
  }
};

const ApprovalRequestModal: React.FC<ApprovalRequestModalProps> = ({
  open,
  onClose,
  onSubmit,
  document,
  workTypeCd,
  modalTitle = '결재요청',
  requestDescription = '결재를 요청합니다.',
  loading = false
}) => {
  // 결재선 목록
  const [approvalLines, setApprovalLines] = useState<ApprovalLineDto[]>([]);
  // 선택된 결재선 ID
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  // 선택된 결재선 상세 (단계 포함)
  const [selectedLineDetail, setSelectedLineDetail] = useState<ApprovalLineDto | null>(null);
  // 결재 의견
  const [opinion, setOpinion] = useState<string>('');
  // 로딩 상태
  const [loadingLines, setLoadingLines] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  // 에러 메시지
  const [error, setError] = useState<string | null>(null);
  // 제출 중 상태
  const [submitting, setSubmitting] = useState(false);

  /**
   * 결재선 목록 조회
   * - 업무구분코드에 해당하는 결재선 조회
   */
  const loadApprovalLines = useCallback(async () => {
    if (!workTypeCd) return;

    setLoadingLines(true);
    setError(null);
    try {
      const lines = await getActiveApprovalLinesByWorkType(workTypeCd);
      setApprovalLines(lines);

      // 결재선이 1개만 있으면 자동 선택
      if (lines.length === 1) {
        setSelectedLineId(lines[0].approvalLineId);
      }
    } catch (err) {
      console.error('결재선 목록 조회 실패:', err);
      setError('결재선 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingLines(false);
    }
  }, [workTypeCd]);

  /**
   * 선택된 결재선 상세 조회
   */
  const loadApprovalLineDetail = useCallback(async (lineId: string) => {
    if (!lineId) {
      setSelectedLineDetail(null);
      return;
    }

    setLoadingDetail(true);
    try {
      const detail = await getApprovalLine(lineId);
      setSelectedLineDetail(detail);
    } catch (err) {
      console.error('결재선 상세 조회 실패:', err);
      setError('결재선 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  /**
   * 모달 열릴 때 결재선 목록 조회 및 초기화
   */
  useEffect(() => {
    if (open) {
      loadApprovalLines();
      // 초기화
      setSelectedLineId('');
      setSelectedLineDetail(null);
      setOpinion('');
      setError(null);
    }
  }, [open, loadApprovalLines]);

  /**
   * 결재선 선택 시 상세 조회
   */
  useEffect(() => {
    if (selectedLineId) {
      loadApprovalLineDetail(selectedLineId);
    }
  }, [selectedLineId, loadApprovalLineDetail]);

  /**
   * 결재선 단계 그리드 컬럼
   */
  const stepColumns = useMemo<ColDef<ApprovalStepDisplay>[]>(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 70,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'stepName',
      headerName: '단계명',
      width: 100,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'approverTypeName',
      headerName: '결재자유형',
      width: 100,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'approverName',
      headerName: '결재자',
      flex: 1,
      minWidth: 120,
      cellStyle: { textAlign: 'left' }
    },
    {
      field: 'isRequired',
      headerName: '필수',
      width: 70,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (params: { value: string }) => (
        <span style={{ color: params.value === 'Y' ? '#2e7d32' : '#666' }}>
          {params.value === 'Y' ? '필수' : '선택'}
        </span>
      )
    }
  ], []);

  /**
   * 결재선 단계 데이터 변환
   */
  const stepData = useMemo<ApprovalStepDisplay[]>(() => {
    if (!selectedLineDetail?.steps) return [];

    return selectedLineDetail.steps.map((step, index) => ({
      sequence: index + 1,
      stepName: step.stepName || '-',
      approverName: step.approverName || '-',
      approverTypeName: getApproverTypeName(step.approverTypeCd),
      isRequired: step.isRequired || 'Y'
    }));
  }, [selectedLineDetail]);

  /**
   * 결재요청 제출
   */
  const handleSubmit = useCallback(async () => {
    if (!selectedLineId) {
      setError('결재선을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedLineId, opinion);
      onClose();
    } catch (err: unknown) {
      console.error('결재요청 실패:', err);
      const errorMessage = err instanceof Error ? err.message : '결재요청에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [selectedLineId, opinion, onSubmit, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1
        }}
      >
        <span>{modalTitle}</span>
        <IconButton
          onClick={onClose}
          disabled={loading || submitting}
          sx={{
            color: 'var(--theme-page-header-text)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 요청 내용 안내 */}
        <Alert severity="info" sx={{ mb: 3 }}>
          {requestDescription}
        </Alert>

        {/* 결재 대상 문서 정보 */}
        {document && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              결재요청내용
            </Typography>
            <Box sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              {/* 문서 제목 */}
              {document.title && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>제목:</strong> {document.title}
                </Typography>
              )}
              {/* 문서 내용 */}
              {document.content && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>내용:</strong> {document.content}
                </Typography>
              )}
              {/* 추가 표시 필드 */}
              {document.displayFields?.map((field, index) => (
                <Typography key={index} variant="body2" sx={{ mb: index < document.displayFields!.length - 1 ? 1 : 0 }}>
                  <strong>{field.label}:</strong> {field.value || '-'}
                </Typography>
              ))}
            </Box>
          </Box>
        )}

        {/* 결재선 선택 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            결재선 선택
          </Typography>

          {loadingLines ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel>결재선</InputLabel>
              <Select
                value={selectedLineId}
                onChange={(e) => setSelectedLineId(e.target.value)}
                label="결재선"
                disabled={submitting}
              >
                {approvalLines.length === 0 ? (
                  <MenuItem value="" disabled>
                    사용 가능한 결재선이 없습니다
                  </MenuItem>
                ) : (
                  approvalLines.map((line) => (
                    <MenuItem key={line.approvalLineId} value={line.approvalLineId}>
                      {line.approvalLineName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* 선택된 결재선 단계 표시 */}
        {selectedLineId && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              결재선 단계
            </Typography>

            {loadingDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Box sx={{ height: 200 }}>
                <BaseDataGrid
                  data={stepData}
                  columns={stepColumns}
                  loading={loadingDetail}
                  theme="alpine"
                  height="100%"
                  pagination={false}
                  rowSelection="none"
                  checkboxSelection={false}
                />
              </Box>
            )}
          </Box>
        )}

        {/* 결재 의견 입력 */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            결재 의견
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="결재 요청 시 전달할 의견을 입력하세요 (선택사항)"
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            disabled={submitting}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading || submitting}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || submitting || !selectedLineId || loadingLines || loadingDetail}
        >
          {submitting ? '요청 중...' : '결재요청'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalRequestModal;
