/**
 * 결재 상세 모달
 *
 * @description 결재 문서의 상세 정보를 조회하고 승인/반려 처리하는 모달
 * - PositionFormModal 표준 템플릿 기반 UI
 * - 실제 API 연동 (더미 데이터 제거)
 * - 승인/반려 처리 기능
 *
 * @author Claude AI
 * @since 2025-12-02
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Chip,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import toast from '@/shared/utils/toast';
import type { ColDef } from 'ag-grid-community';

// API
import {
  getApproval,
  processApproval,
  type ApprovalDto,
  type ApprovalHistoryDto,
  type ProcessApprovalRequest
} from '@/domains/approval/api/approvalApi';

// Types
import type { Approval } from '../../types/approvalBox.types';

/**
 * 탭 패널 컴포넌트
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface ApprovalDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail' | 'edit';
  itemData: Approval | null;
  onClose: () => void;
  onSave?: () => void;
  onUpdate?: () => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

/**
 * 결재 상세 모달 컴포넌트
 */
const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  open,
  mode,
  itemData,
  onClose,
  onRefresh,
  loading: externalLoading = false
}) => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [approvalDetail, setApprovalDetail] = useState<ApprovalDto | null>(null);
  const [comment, setComment] = useState('');

  /**
   * 결재 상세 정보 조회
   */
  const fetchApprovalDetail = useCallback(async () => {
    if (!itemData?.id) return;

    setLoading(true);
    try {
      const detail = await getApproval(itemData.id);
      setApprovalDetail(detail);
    } catch (error) {
      console.error('결재 상세 조회 실패:', error);
      toast.error('결재 상세 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemData?.id]);

  /**
   * 모달 열릴 때 데이터 조회
   */
  useEffect(() => {
    if (open && mode === 'detail' && itemData) {
      setComment('');
      setTabValue(0);
      fetchApprovalDetail();
    }
  }, [open, mode, itemData, fetchApprovalDetail]);

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  /**
   * 승인 처리
   */
  const handleApprove = useCallback(async () => {
    if (!itemData?.id) return;

    setLoading(true);
    try {
      const request: ProcessApprovalRequest = {
        resultCd: 'APPROVE',
        comment: comment || '승인합니다.'
      };

      await processApproval(itemData.id, request);
      toast.success('결재가 승인되었습니다.');

      // 목록 새로고침
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error('결재 승인 실패:', error);
      toast.error('결재 승인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemData?.id, comment, onRefresh, onClose]);

  /**
   * 반려 처리
   */
  const handleReject = useCallback(async () => {
    if (!itemData?.id) return;

    if (!comment.trim()) {
      toast.warning('반려 사유를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const request: ProcessApprovalRequest = {
        resultCd: 'REJECT',
        comment: comment
      };

      await processApproval(itemData.id, request);
      toast.success('결재가 반려되었습니다.');

      // 목록 새로고침
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error('결재 반려 실패:', error);
      toast.error('결재 반려에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemData?.id, comment, onRefresh, onClose]);

  /**
   * 결재상태 라벨/색상 매핑
   */
  const getStatusInfo = useCallback((statusCd: string) => {
    const statusMap: Record<string, { label: string; color: 'default' | 'warning' | 'primary' | 'success' | 'error' }> = {
      '01': { label: '기안', color: 'default' },
      '02': { label: '진행중', color: 'primary' },
      '03': { label: '완료', color: 'success' },
      '04': { label: '반려', color: 'error' },
      '05': { label: '회수', color: 'default' },
      'DRAFT': { label: '기안', color: 'default' },
      'PROGRESS': { label: '진행중', color: 'primary' },
      'APPROVED': { label: '완료', color: 'success' },
      'REJECTED': { label: '반려', color: 'error' },
      'PENDING': { label: '대기', color: 'warning' }
    };
    return statusMap[statusCd] || { label: statusCd, color: 'default' as const };
  }, []);

  /**
   * 결재 이력 그리드 컬럼
   * - 백엔드 ApprovalHistoryDto 필드명과 일치시킴
   */
  const historyColumns = useMemo<ColDef<ApprovalHistoryDto>[]>(() => [
    {
      field: 'stepSequence',
      headerName: '순서',
      width: 70,
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'stepName',
      headerName: '단계명',
      width: 100,
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'approverName',
      headerName: '결재자',
      width: 100
    },
    {
      field: 'approverDeptName',
      headerName: '부서',
      width: 120
    },
    {
      field: 'actionCd',
      headerName: '처리',
      width: 80,
      cellRenderer: ({ value }: { value: string }) => {
        const actionLabels: Record<string, string> = {
          'DRAFT': '기안',
          'APPROVE': '승인',
          'REJECT': '반려',
          'WITHDRAW': '회수',
          'FORWARD': '전달'
        };
        const actionColors: Record<string, string> = {
          'DRAFT': '#9e9e9e',
          'APPROVE': '#4caf50',
          'REJECT': '#f44336',
          'WITHDRAW': '#ff9800',
          'FORWARD': '#2196f3'
        };
        return (
          <Chip
            label={actionLabels[value] || value || '-'}
            size="small"
            sx={{
              backgroundColor: `${actionColors[value] || '#9e9e9e'}20`,
              color: actionColors[value] || '#9e9e9e',
              fontWeight: 'bold',
              fontSize: '0.75rem'
            }}
          />
        );
      },
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'actionDate',
      headerName: '처리일시',
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleString('ko-KR');
      },
      cellStyle: { textAlign: 'center', fontSize: '0.875rem' }
    },
    {
      field: 'actionComment',
      headerName: '의견',
      flex: 1,
      minWidth: 150,
      cellStyle: { fontSize: '0.875rem' }
    }
  ], []);

  /**
   * 현재 사용자가 결재 대기 상태인지 확인
   * - approvalStatus가 PENDING이거나, approvalStatusCd가 01 또는 02인 경우
   */
  const canProcess = useMemo(() => {
    if (!itemData) return false;

    // itemData의 상태 확인
    const status = itemData.approvalStatus;
    if (status === 'PENDING' || status === 'PROGRESS' || status === 'DRAFT') {
      return true;
    }

    // approvalDetail의 상태 확인
    if (approvalDetail) {
      const statusCd = approvalDetail.approvalStatusCd;
      return statusCd === '01' || statusCd === '02';
    }

    return false;
  }, [itemData, approvalDetail]);

  /**
   * 표시할 데이터 (API 응답 또는 itemData)
   */
  const displayData = useMemo(() => {
    if (approvalDetail) {
      return {
        approvalId: approvalDetail.approvalId,
        approvalNo: approvalDetail.documentNo || approvalDetail.approvalId,
        workType: approvalDetail.workTypeName || approvalDetail.workTypeCd,
        title: approvalDetail.title,
        content: approvalDetail.content || '',
        statusCd: approvalDetail.approvalStatusCd,
        currentStep: approvalDetail.currentStep,
        totalSteps: approvalDetail.totalSteps,
        requesterName: approvalDetail.requesterName || '',
        requesterDeptName: approvalDetail.requesterDeptName || '',
        requestedAt: approvalDetail.requestedAt,
        completedAt: approvalDetail.completedAt,
        histories: approvalDetail.histories || []
      };
    }

    if (itemData) {
      return {
        approvalId: itemData.id,
        approvalNo: itemData.approvalId,
        workType: itemData.workType,
        title: itemData.content,
        content: '',
        statusCd: itemData.approvalStatus,
        currentStep: itemData.currentStep || 0,
        totalSteps: itemData.totalSteps || 0,
        requesterName: itemData.drafter || '',
        requesterDeptName: itemData.department || '',
        requestedAt: itemData.draftDate,
        completedAt: itemData.approveDate,
        histories: []
      };
    }

    return null;
  }, [approvalDetail, itemData]);

  const isLoading = loading || externalLoading;

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '85vh'
        }
      }}
    >
      {/* 헤더 - PositionFormModal 스타일 */}
      <DialogTitle
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600,
          py: 1.5
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon />
            <span>결재 상세 정보</span>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography>로딩 중...</Typography>
          </Box>
        ) : displayData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 기본 정보 섹션 */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1rem' }}>
                기본 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    결재번호
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {displayData.approvalNo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    업무구분
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {displayData.workType}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    제목
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {displayData.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    결재상태
                  </Typography>
                  <Chip
                    label={getStatusInfo(displayData.statusCd).label}
                    color={getStatusInfo(displayData.statusCd).color}
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    결재진행
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {displayData.currentStep}/{displayData.totalSteps}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    기안자
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {displayData.requesterName}
                    {displayData.requesterDeptName && ` (${displayData.requesterDeptName})`}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    기안일시
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {displayData.requestedAt ? new Date(displayData.requestedAt).toLocaleString('ko-KR') : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* 탭 컨테이너 */}
            <Box>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab
                  label="결재 이력"
                  icon={<AccountTreeIcon />}
                  iconPosition="start"
                  sx={{ fontSize: '0.875rem' }}
                />
                <Tab
                  label="결재 의견"
                  icon={<AssignmentIcon />}
                  iconPosition="start"
                  sx={{ fontSize: '0.875rem' }}
                />
              </Tabs>

              {/* 결재 이력 탭 */}
              <TabPanel value={tabValue} index={0}>
                {displayData.histories.length > 0 ? (
                  <Box sx={{ height: 250 }}>
                    <BaseDataGrid
                      data={displayData.histories}
                      columns={historyColumns}
                      rowSelection="none"
                      pagination={false}
                      height="250px"
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    결재 이력이 없습니다.
                  </Typography>
                )}
              </TabPanel>

              {/* 결재 의견 탭 */}
              <TabPanel value={tabValue} index={1}>
                <TextField
                  label="결재 의견"
                  multiline
                  rows={4}
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={canProcess ? "승인 또는 반려 의견을 입력하세요. (반려 시 필수)" : "결재 의견을 확인합니다."}
                  disabled={!canProcess}
                  size="small"
                />
              </TabPanel>
            </Box>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography color="text.secondary">데이터가 없습니다.</Typography>
          </Box>
        )}
      </DialogContent>

      {/* 액션 버튼 - PositionFormModal 스타일 */}
      <DialogActions sx={{ p: 1.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>
          닫기
        </Button>
        {canProcess && (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={handleReject}
              disabled={isLoading}
              loading={isLoading}
            >
              반려
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApprove}
              disabled={isLoading}
              loading={isLoading}
            >
              승인
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalDetailModal;
