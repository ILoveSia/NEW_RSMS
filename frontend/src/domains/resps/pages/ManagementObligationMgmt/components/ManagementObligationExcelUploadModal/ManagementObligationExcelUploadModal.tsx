/**
 * 관리의무 엑셀 업로드 모달
 * - 엑셀 파일 선택 및 미리보기
 * - 드래그 앤 드롭 지원
 * - AG-Grid 미리보기
 * - 업로드 등록 버튼으로 서버 저장
 *
 * @author Claude AI
 * @since 2025-01-06
 */

import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import {
  CheckCircle as CheckIcon,
  CloudUpload as CloudUploadIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  TableRow,
  Typography
} from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';

/**
 * 엑셀 데이터 인터페이스
 * - 관리의무 엑셀 업로드 양식 구조
 */
export interface ManagementObligationExcelData {
  책무세부코드: string;
  관리의무대분류코드: string;
  관리의무내용: string;
  조직코드: string;
  사용여부: string;
}

interface ManagementObligationExcelUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: ManagementObligationExcelData[]) => Promise<void>;
  loading?: boolean;
}

const ManagementObligationExcelUploadModal: React.FC<ManagementObligationExcelUploadModalProps> = ({
  open,
  onClose,
  onUpload,
  loading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ManagementObligationExcelData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [parsing, setParsing] = useState(false); // 파싱 중 상태

  /**
   * 미리보기 Grid 컬럼 정의
   */
  const previewColumns: ColDef<ManagementObligationExcelData>[] = [
    { headerName: '책무세부코드', field: '책무세부코드', width: 200, sortable: true },
    { headerName: '관리의무대분류코드', field: '관리의무대분류코드', width: 150, sortable: true },
    { headerName: '관리의무내용', field: '관리의무내용', flex: 1, sortable: true, minWidth: 300 },
    { headerName: '조직코드', field: '조직코드', width: 120, sortable: true },
    { headerName: '사용여부', field: '사용여부', width: 100, sortable: true, headerClass: 'ag-header-cell-center' }
  ];

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
   * 엑셀 파일 파싱 및 미리보기 데이터 생성
   * - xlsx 라이브러리를 사용하여 실제 엑셀 파일 파싱
   * - 컬럼명 검증 및 데이터 변환
   */
  const parseExcelFile = useCallback(async (file: File): Promise<ManagementObligationExcelData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error('파일을 읽을 수 없습니다.');
          }

          // 엑셀 파일 파싱
          const workbook = XLSX.read(data, { type: 'binary' });

          // 첫 번째 시트 가져오기
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error('엑셀 시트를 찾을 수 없습니다.');
          }

          const worksheet = workbook.Sheets[sheetName];

          // 시트 데이터를 JSON으로 변환 (헤더 포함)
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            header: 1,  // 첫 번째 행을 헤더로 사용
            defval: ''  // 빈 셀은 빈 문자열로 처리
          });

          if (jsonData.length < 2) {
            throw new Error('엑셀 파일에 데이터가 없습니다. (최소 헤더 + 1행 필요)');
          }

          // 헤더 추출 및 검증
          const headers = jsonData[0] as string[];
          const requiredColumns = ['책무세부코드', '관리의무대분류코드', '관리의무내용', '조직코드', '사용여부'];

          // 헤더 검증
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          if (missingColumns.length > 0) {
            throw new Error(`필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
          }

          // 데이터 행 변환 (헤더 제외)
          const dataRows = jsonData.slice(1);
          const parsedData: ManagementObligationExcelData[] = dataRows
            .filter((row: any) => {
              // 빈 행 제외 (모든 셀이 비어있는 경우)
              return row && Object.values(row).some((cell: any) => cell !== '' && cell !== null && cell !== undefined);
            })
            .map((row: any, index: number) => {
              const rowData: any = {};
              requiredColumns.forEach((col, colIndex) => {
                const value = row[colIndex];
                rowData[col] = value !== null && value !== undefined ? String(value).trim() : '';
              });

              // 필수 필드 검증
              if (!rowData['책무세부코드'] || !rowData['관리의무내용']) {
                throw new Error(`${index + 2}행: 책무세부코드, 관리의무내용은 필수입니다.`);
              }

              // 사용여부 검증
              if (rowData['사용여부'] && !['Y', 'N'].includes(rowData['사용여부'])) {
                throw new Error(`${index + 2}행: 사용여부는 Y 또는 N만 가능합니다.`);
              }

              return rowData as ManagementObligationExcelData;
            });

          if (parsedData.length === 0) {
            throw new Error('유효한 데이터가 없습니다.');
          }

          resolve(parsedData);
        } catch (err) {
          console.error('엑셀 파싱 오류:', err);
          reject(err instanceof Error ? err : new Error('엑셀 파일 파싱에 실패했습니다.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('파일 읽기에 실패했습니다.'));
      };

      reader.readAsBinaryString(file);
    });
  }, []);

  /**
   * 파일 선택 핸들러
   * - 파일 검증 후 엑셀 파싱하여 미리보기 표시
   */
  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setError(null);
    setShowPreview(false);
    setPreviewData([]);
    setParsing(true);

    try {
      // 엑셀 파일 파싱
      const parsedData = await parseExcelFile(file);
      setPreviewData(parsedData);
      setShowPreview(true);
    } catch (err) {
      console.error('엑셀 파일 파싱 실패:', err);
      setError(err instanceof Error ? err.message : '엑셀 파일 파싱에 실패했습니다.');
      setSelectedFile(null);
    } finally {
      setParsing(false);
    }
  }, [validateFile, parseExcelFile]);

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
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

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
        handleFileSelect(target.files[0]);
      }
    };
    input.click();
  }, [handleFileSelect]);

  /**
   * 업로드 등록 (서버로 데이터 저장)
   */
  const handleSubmit = useCallback(async () => {
    if (!selectedFile || previewData.length === 0) return;

    try {
      // 파싱된 데이터를 부모 컴포넌트로 전달하여 DB에 저장
      await onUpload(previewData);
      // 성공 시 모달 상태 초기화 및 닫기는 부모에서 처리
    } catch (err) {
      console.error('엑셀 업로드 실패:', err);
      setError(err instanceof Error ? err.message : '업로드에 실패했습니다.');
    }
  }, [selectedFile, previewData, onUpload]);

  /**
   * 모달 닫기
   */
  const handleClose = useCallback(() => {
    if (loading || parsing) return; // 업로드 중이거나 파싱 중에는 닫기 불가
    setSelectedFile(null);
    setError(null);
    setPreviewData([]);
    setShowPreview(false);
    setParsing(false);
    onClose();
  }, [loading, parsing, onClose]);

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
          maxHeight: '90vh',
          height: showPreview ? '85vh' : 'auto'
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
        관리의무 엑셀 업로드
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 엑셀 양식 안내 */}
          <Alert severity="info" icon={false} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              엑셀 양식 구조
            </Typography>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  width: '100%'
                }}
              >
                <Table size="small" sx={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '20%', padding: '8px', border: '1px solid #e0e0e0' }}>책무세부코드</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '15%', padding: '8px', border: '1px solid #e0e0e0' }}>관리의무대분류코드</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '45%', padding: '8px', border: '1px solid #e0e0e0' }}>관리의무내용</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '12%', padding: '8px', border: '1px solid #e0e0e0' }}>조직코드</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', width: '8%', padding: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>사용여부</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', padding: '8px', border: '1px solid #e0e0e0' }}>20250001M0001D0001</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', padding: '8px', border: '1px solid #e0e0e0' }}>00</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', padding: '8px', border: '1px solid #e0e0e0' }}>소관 업무 및 소식의 대분통제기준 수립에 대한 책...</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', padding: '8px', border: '1px solid #e0e0e0' }}>DEPT003</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', padding: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>Y</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Alert>

          {/* 파일 업로드 영역 */}
          {!showPreview && (
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
          {selectedFile && showPreview && (
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  <VisibilityIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
                  선택된 파일
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleFileButtonClick}
                >
                  파일 다시 선택
                </Button>
              </Box>
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

          {/* 미리보기 Grid */}
          {showPreview && previewData.length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  데이터 미리보기 (총 {previewData.length}건)
                </Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <BaseDataGrid
                    data={previewData}
                    columns={previewColumns}
                    loading={false}
                    theme="alpine"
                    height="300px"
                    pagination={false}
                    rowSelection="single"
                  />
                </Box>
                <Alert severity="info" icon={<WarningIcon />} sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    위 데이터는 미리보기입니다. "업로드 등록" 버튼을 클릭하면 실제로 서버에 저장됩니다.
                  </Typography>
                </Alert>
              </Box>
            </>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}

          {/* 로딩 바 */}
          {(loading || parsing) && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                {parsing ? '엑셀 파일 파싱 중...' : '서버에 업로드 중...'}
              </Typography>
            </Box>
          )}

          {/* 주의사항 */}
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1 }}>
            <Typography variant="caption" component="div" sx={{ mb: 0.5 }}>
              <strong>주의사항:</strong>
            </Typography>
            <Typography variant="caption" component="ul" sx={{ m: 0, pl: 2 }}>
              <li>엑셀 양식의 컬럼 순서를 변경하지 마세요.</li>
              <li>책무세부코드는 responsibility_details 테이블에 존재하는 코드여야 합니다.</li>
              <li>사용여부는 Y 또는 N만 입력 가능합니다.</li>
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading || parsing}
        >
          취소
        </Button>
        {showPreview && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedFile || loading || parsing}
            startIcon={loading ? undefined : <CloudUploadIcon />}
          >
            {loading ? '업로드 중...' : '업로드 등록 (서버 저장)'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ManagementObligationExcelUploadModal;
