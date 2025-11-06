/**
 * 책무 엑셀 업로드 모달
 * - 엑셀 파일 선택 및 업로드
 * - 드래그 앤 드롭 지원
 * - 파일 검증 및 업로드 결과 표시
 *
 * @author Claude AI
 * @since 2025-11-05
 */

import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Button } from '@/shared/components/atoms/Button';

interface ResponsibilityExcelUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<{ successCount: number; failCount: number; totalCount: number; errors?: string[] }>;
  loading?: boolean;
}

const ResponsibilityExcelUploadModal: React.FC<ResponsibilityExcelUploadModalProps> = ({
  open,
  onClose,
  onUpload,
  loading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    successCount: number;
    failCount: number;
    totalCount: number;
    errors?: string[];
  } | null>(null);

  /**
   * 파일 검증
   * - 파일 형식 체크 (.xlsx, .xls)
   * - 파일 크기 체크 (최대 10MB)
   */
  const validateFile = useCallback((file: File): boolean => {
    // 파일 확장자 체크
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return false;
    }

    // 파일 크기 체크 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return false;
    }

    setError(null);
    return true;
  }, []);

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadResult(null); // 이전 결과 초기화
      }
    }
  }, [validateFile]);

  /**
   * 드래그 앤 드롭 핸들러
   */
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadResult(null); // 이전 결과 초기화
      }
    }
  }, [validateFile]);

  /**
   * 파일 선택 버튼 클릭
   */
  const handleFileButtonClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (validateFile(file)) {
          setSelectedFile(file);
          setUploadResult(null); // 이전 결과 초기화
        }
      }
    };
    input.click();
  }, [validateFile]);

  /**
   * 업로드 제출
   */
  const handleSubmit = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const result = await onUpload(selectedFile);
      setUploadResult(result);

      // 완전 성공 시에만 파일 초기화 및 모달 닫기
      if (result.failCount === 0) {
        setSelectedFile(null);
        setError(null);
        // 모달은 자동으로 닫히지 않음 (사용자가 결과 확인 후 닫기)
      }
    } catch (err) {
      console.error('엑셀 업로드 실패:', err);
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    }
  }, [selectedFile, onUpload]);

  /**
   * 모달 닫기
   */
  const handleClose = useCallback(() => {
    if (loading) return; // 업로드 중에는 닫기 불가
    setSelectedFile(null);
    setError(null);
    setUploadResult(null);
    onClose();
  }, [loading, onClose]);

  /**
   * 파일 크기 포맷팅
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        📤 책무 엑셀 업로드
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 엑셀 양식 안내 */}
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              📋 엑셀 양식 구조
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>원장차수</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>직책코드</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>책무카테고리코드</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>책무내용</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>책무관련근거</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>사용여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>2025001</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>R005</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>M</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>경영전략 업무와 관련된 책무</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>책무관련근거는 은행법 1조 1항</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Y</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Alert>

          {/* 파일 업로드 영역 */}
          {!uploadResult && (
            <Paper
              elevation={0}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: dragActive ? '2px dashed var(--theme-button-primary)' : '2px dashed #ddd',
                borderRadius: 2,
                backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : '#fafafa',
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'var(--theme-button-primary)',
                  backgroundColor: 'rgba(25, 118, 210, 0.02)'
                }
              }}
              onClick={handleFileButtonClick}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48,
                  color: dragActive ? 'var(--theme-button-primary)' : '#999',
                  mb: 1
                }}
              />
              <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>
                파일을 드래그하거나 클릭하여 선택
              </Typography>
              <Typography variant="caption" color="text.secondary">
                지원 형식: .xlsx, .xls (최대 10MB)
              </Typography>
            </Paper>
          )}

          {/* 선택된 파일 정보 */}
          {selectedFile && !uploadResult && (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                선택된 파일
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ gap: 1 }}>
                  <ListItemIcon sx={{ minWidth: 'auto' }}>
                    <FileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={selectedFile.name}
                    secondary={formatFileSize(selectedFile.size)}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem'
                    }}
                  />
                  <CheckIcon color="success" fontSize="small" />
                </ListItem>
              </List>
            </Paper>
          )}

          {/* 업로드 결과 */}
          {uploadResult && (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                업로드 결과
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Alert
                  severity="success"
                  icon={<CheckIcon />}
                  sx={{ flex: 1 }}
                >
                  <Typography variant="caption" display="block">총 건수</Typography>
                  <Typography variant="h6">{uploadResult.totalCount}건</Typography>
                </Alert>
                <Alert
                  severity="success"
                  icon={<CheckIcon />}
                  sx={{ flex: 1 }}
                >
                  <Typography variant="caption" display="block">성공</Typography>
                  <Typography variant="h6">{uploadResult.successCount}건</Typography>
                </Alert>
                {uploadResult.failCount > 0 && (
                  <Alert
                    severity="error"
                    icon={<ErrorIcon />}
                    sx={{ flex: 1 }}
                  >
                    <Typography variant="caption" display="block">실패</Typography>
                    <Typography variant="h6">{uploadResult.failCount}건</Typography>
                  </Alert>
                )}
              </Box>

              {/* 에러 메시지 목록 */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    오류 내역:
                  </Typography>
                  <List dense disablePadding>
                    {uploadResult.errors.map((err, idx) => (
                      <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                        <Typography variant="caption" component="li">
                          {err}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Paper>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}

          {/* 로딩 바 */}
          {loading && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                업로드 중...
              </Typography>
            </Box>
          )}

          {/* 주의사항 */}
          {!uploadResult && (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1 }}>
              <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
                <strong>주의사항:</strong>
              </Typography>
              <Typography variant="caption" component="ul" sx={{ m: 0, pl: 2 }}>
                <li>엑셀 양식의 컬럼 순서를 변경하지 마세요.</li>
                <li>직책코드는 positions 테이블에 존재하는 코드여야 합니다.</li>
                <li>책무카테고리코드는 M(관리), I(내부통제), C(준법감시)만 가능합니다.</li>
                <li>사용여부는 Y 또는 N만 입력 가능합니다.</li>
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
        >
          {uploadResult ? '닫기' : '취소'}
        </Button>
        {!uploadResult && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
          >
            {loading ? '업로드 중...' : '업로드 등록'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilityExcelUploadModal;
