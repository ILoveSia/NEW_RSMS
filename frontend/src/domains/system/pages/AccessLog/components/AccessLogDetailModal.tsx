/**
 * 접근로그 상세보기 모달 컴포넌트
 *
 * @description 접근로그의 상세 정보를 표시하는 모달
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';

import { AccessLog } from '../types/accessLog.types';

interface AccessLogDetailModalProps {
  open: boolean;
  log: AccessLog | null;
  onClose: () => void;
}

const AccessLogDetailModal: React.FC<AccessLogDetailModalProps> = ({
  open,
  log,
  onClose
}) => {
  const { t } = useTranslation('system');

  if (!log) {
    return null;
  }

  // 로그 레벨에 따른 색상 반환
  const getLogLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'debug': return 'default';
      case 'info': return 'primary';
      case 'warn': return 'warning';
      case 'error': return 'error';
      case 'fatal': return 'error';
      default: return 'default';
    }
  };

  // 액션 타입에 따른 색상 반환
  const getActionTypeColor = (actionType: string) => {
    switch (actionType?.toLowerCase()) {
      case 'login': return 'success';
      case 'logout': return 'error';
      case 'view': return 'info';
      case 'create': return 'primary';
      case 'update': return 'warning';
      case 'delete': return 'error';
      case 'export': return 'success';
      case 'unauthorized_access': return 'error';
      default: return 'default';
    }
  };

  // 날짜 시간 포맷팅
  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return {
        date: date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        time: date.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      };
    } catch (error) {
      return { date: dateTime, time: '' };
    }
  };

  const { date, time } = formatDateTime(log.logDateTime);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <InfoIcon color="primary" />
        <Typography variant="h6" component="span">
          {t('accessLog.detail.title', '접근로그 상세정보')}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            onClick={onClose}
            size="small"
            color="inherit"
            startIcon={<CloseIcon />}
          >
            닫기
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* 기본 정보 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="primary" fontSize="small" />
                  시간 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    접근일시
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {date} {time}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    로그 레벨
                  </Typography>
                  <Chip
                    label={log.logLevel}
                    color={getLogLevelColor(log.logLevel) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    실행 시간
                  </Typography>
                  <Typography variant="body1">
                    {log.executionTimeMs ? `${log.executionTimeMs}ms` : '-'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 사용자 정보 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  사용자 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    직번
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {log.employeeNo || '-'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    성명
                  </Typography>
                  <Typography variant="body1">
                    {log.fullName || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    부서
                  </Typography>
                  <Typography variant="body1">
                    {log.deptName || '-'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 접근 정보 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ComputerIcon color="primary" fontSize="small" />
                  접근 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    접근 대상
                  </Typography>
                  <Chip
                    label={log.accessTarget || '-'}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    메뉴명
                  </Typography>
                  <Typography variant="body1">
                    {log.menuName || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    IP 주소
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'Courier New, monospace',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      fontSize: '0.875rem'
                    }}
                  >
                    {log.ipAddress || '-'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 액션 정보 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" fontSize="small" />
                  액션 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    액션 유형
                  </Typography>
                  <Chip
                    label={log.actionType}
                    color={getActionTypeColor(log.actionType) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    대상 유형
                  </Typography>
                  <Typography variant="body1">
                    {log.targetType || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    대상 ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                    {log.targetId || '-'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 메시지 및 상세 정보 */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  메시지 및 상세 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    메시지
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      padding: 2,
                      borderRadius: 1,
                      borderLeft: '4px solid',
                      borderLeftColor: 'primary.main'
                    }}
                  >
                    {log.message}
                  </Typography>
                </Box>

                {log.details && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      상세 정보
                    </Typography>
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        padding: 2,
                        borderRadius: 1,
                        fontFamily: 'Courier New, monospace',
                        fontSize: '0.8rem',
                        whiteSpace: 'pre-wrap',
                        overflow: 'auto'
                      }}
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 시스템 정보 */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  시스템 정보
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      세션 ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Courier New, monospace' }}>
                      {log.sessionId || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      요청 ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Courier New, monospace' }}>
                      {log.requestId || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      상관관계 ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'Courier New, monospace' }}>
                      {log.correlationId || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      사용자 에이전트
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.75rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {log.userAgent || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessLogDetailModal;