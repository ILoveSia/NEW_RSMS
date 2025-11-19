import React, { useCallback, useMemo, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Button } from '@/shared/components/atoms/Button';
import { useTranslation } from 'react-i18next';
import type {
  Approval,
  ApprovalFormData,
  ApprovalRequestContent,
  ApprovalLineItem,
  ApprovalStatus,
  ApprovalLineStatus,
  APPROVAL_STATUS_COLOR_MAP
} from '../../types/approvalBox.types';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ApprovalDetailModalProps {
  open: boolean;
  mode: 'create' | 'detail' | 'edit';
  itemData: Approval | null;
  onClose: () => void;
  onSave?: (data: ApprovalFormData) => void;
  onUpdate?: (data: ApprovalFormData) => void;
  loading?: boolean;
}

const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  open,
  mode,
  itemData,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const { t } = useTranslation('approval');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  // 상태별 색상 가져오기
  const getStatusColor = useCallback((status: ApprovalStatus): string => {
    return APPROVAL_STATUS_COLOR_MAP[status] || '#6B7280';
  }, []);

  const getLineStatusColor = useCallback((status: ApprovalLineStatus): string => {
    const colorMap: Record<ApprovalLineStatus, string> = {
      WAITING: '#F59E0B',
      APPROVED: '#10B981',
      REJECTED: '#EF4444',
      PENDING: '#6B7280',
      SKIPPED: '#9CA3AF'
    };
    return colorMap[status] || '#6B7280';
  }, []);

  // Mock 결재요청내용 데이터
  const mockApprovalRequestContent: ApprovalRequestContent[] = useMemo(() => [
    {
      id: '1',
      sequence: 1,
      managerName: '김관리',
      internalControl: '리스크관리',
      internalControlManager: '박통제',
      performer: '이수행',
      performanceStatus: 'Y',
      performanceResult: '정상 수행 완료',
      notes: '특이사항 없음'
    },
    {
      id: '2',
      sequence: 2,
      managerName: '최감독',
      internalControl: '준법감시',
      internalControlManager: '정준법',
      performer: '한실행',
      performanceStatus: 'N',
      performanceResult: '미수행',
      notes: '일정 조율 필요'
    }
  ], []);

  // Mock 결재선 데이터
  const mockApprovalLine: ApprovalLineItem[] = useMemo(() => [
    {
      id: '1',
      sequence: 1,
      stepName: '기안',
      type: 'DRAFT',
      department: '0000',
      employeeId: '0000000',
      employeeName: '관리자',
      position: '관리자',
      approveDate: '2025-09-08 15:36',
      status: 'APPROVED',
      comments: '결재를 요청합니다.',
      isRequired: true
    },
    {
      id: '2',
      sequence: 2,
      stepName: '1차 결재',
      type: 'APPROVE',
      department: '1000',
      employeeId: '0000003',
      employeeName: 'FIT 3',
      position: '부장',
      status: 'WAITING',
      comments: '',
      isRequired: true
    },
    {
      id: '3',
      sequence: 3,
      stepName: '최종 결재',
      type: 'FINAL',
      department: '0000',
      employeeId: '0000001',
      employeeName: 'FIT 1',
      position: '본부장',
      status: 'WAITING',
      comments: '',
      isRequired: true
    }
  ], []);

  const modalTitle = useMemo(() => {
    switch (mode) {
      case 'create':
        return '결재 등록';
      case 'edit':
        return '결재 수정';
      default:
        return '결재 상세 정보';
    }
  }, [mode]);

  const handleSave = useCallback(() => {
    if (mode === 'create' && onSave) {
      // TODO: 폼 데이터 수집
      const formData: ApprovalFormData = {
        workType: itemData?.workType || '',
        content: itemData?.content || '',
        department: itemData?.department || '',
        priority: itemData?.priority || 'MEDIUM',
        description: itemData?.description || '',
        dueDate: itemData?.approvalSchedule || '',
        approvalLine: mockApprovalLine,
        attachments: itemData?.attachments || []
      };
      onSave(formData);
    } else if (mode === 'edit' && onUpdate && itemData) {
      // TODO: 폼 데이터 수집
      const formData: ApprovalFormData = {
        workType: itemData.workType,
        content: itemData.content,
        department: itemData.department || '',
        priority: itemData.priority || 'MEDIUM',
        description: itemData.description || '',
        dueDate: itemData.approvalSchedule,
        approvalLine: mockApprovalLine,
        attachments: itemData.attachments || []
      };
      onUpdate(formData);
    }
  }, [mode, itemData, onSave, onUpdate, mockApprovalLine]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      
    >
      <DialogTitle >
        <div >
          <div >
            <InfoIcon  />
            <div>
              <Typography variant="h6" >
                {modalTitle}
              </Typography>
              {itemData && (
                <Typography variant="body2" >
                  결재ID: {itemData.approvalId} | {itemData.workType}
                </Typography>
              )}
            </div>
          </div>
          <IconButton
            onClick={onClose}
            
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent >
        {mode === 'detail' && itemData && (
          <>
            {/* 기본 정보 */}
            <Paper >
              <Typography variant="h6" >
                기본 정보
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box >
                    <Typography variant="body2" >
                      결재ID
                    </Typography>
                    <Typography variant="body1" >
                      {itemData.approvalId}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box >
                    <Typography variant="body2" >
                      업무종류
                    </Typography>
                    <Typography variant="body1" >
                      {itemData.workType}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box >
                    <Typography variant="body2" >
                      내용
                    </Typography>
                    <Typography variant="body1" >
                      {itemData.content}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box >
                    <Typography variant="body2" >
                      결재상태
                    </Typography>
                    <Chip
                      label={itemData.approvalStatus}
                      style={{
                        backgroundColor: getStatusColor(itemData.approvalStatus),
                        color: 'white'
                      }}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box >
                    <Typography variant="body2" >
                      결재일정
                    </Typography>
                    <Typography variant="body1" >
                      {itemData.approvalSchedule}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* 탭 컨테이너 */}
            <Paper >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab
                    label="결재요청내용"
                    icon={<AssignmentIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="결재선"
                    icon={<AccountTreeIcon />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* 결재요청내용 탭 */}
              <TabPanel value={tabValue} index={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>순번</TableCell>
                        <TableCell>관리위원명</TableCell>
                        <TableCell>내부통제</TableCell>
                        <TableCell>내부통제위원명</TableCell>
                        <TableCell>수행자</TableCell>
                        <TableCell>수행여부</TableCell>
                        <TableCell>수행결과</TableCell>
                        <TableCell>비고</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockApprovalRequestContent.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sequence}</TableCell>
                          <TableCell>{item.managerName}</TableCell>
                          <TableCell>{item.internalControl}</TableCell>
                          <TableCell>{item.internalControlManager}</TableCell>
                          <TableCell>{item.performer}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.performanceStatus === 'Y' ? '수행' : '미수행'}
                              color={item.performanceStatus === 'Y' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.performanceResult}</TableCell>
                          <TableCell>{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* 결재선 탭 */}
              <TabPanel value={tabValue} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>순번</TableCell>
                        <TableCell>결재단계명</TableCell>
                        <TableCell>구분</TableCell>
                        <TableCell>결재일시</TableCell>
                        <TableCell>부서</TableCell>
                        <TableCell>직원번호</TableCell>
                        <TableCell>직원명</TableCell>
                        <TableCell>상태</TableCell>
                        <TableCell>의견</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockApprovalLine.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sequence}</TableCell>
                          <TableCell>{item.stepName}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.approveDate || '-'}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>{item.employeeId}</TableCell>
                          <TableCell>
                            {item.employeeName}
                            {item.position && ` (${item.position})`}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              style={{
                                backgroundColor: getLineStatusColor(item.status),
                                color: 'white'
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.comments || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
          </>
        )}

        {(mode === 'create' || mode === 'edit') && (
          <Paper >
            <Typography variant="h6" >
              {mode === 'create' ? '결재 등록' : '결재 수정'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              결재 등록/수정 폼은 추후 구현 예정입니다.
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          {mode === 'detail' ? '닫기' : '취소'}
        </Button>
        {(mode === 'create' || mode === 'edit') && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            loading={loading}
          >
            {mode === 'create' ? '등록' : '수정'}
          </Button>
        )}
        {mode === 'detail' && itemData?.approvalStatus === 'PENDING' && (
          <>
            <Button
              variant="contained"
              color="error"
              disabled={loading}
            >
              반려
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={loading}
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