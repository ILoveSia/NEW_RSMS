import { Button } from '@/shared/components/atoms/Button';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import type { Responsibility, ResponsibilityFormData } from '../../types/responsibility.types';
import styles from './ResponsibilityFormModal.module.scss';

interface ResponsibilityFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  responsibility: Responsibility | null;
  onClose: () => void;
  onSave: (data: ResponsibilityFormData) => Promise<void>;
  onUpdate: (id: string, data: ResponsibilityFormData) => Promise<void>;
  loading?: boolean;
}

const ResponsibilityFormModal: React.FC<ResponsibilityFormModalProps> = ({
  open,
  mode,
  responsibility,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<ResponsibilityFormData>({
    직책: responsibility?.직책 || '',
    본부구분: responsibility?.본부구분 || '',
    부서명: responsibility?.부서명 || '',
    부점명: responsibility?.부점명 || '',
    책무테고리: responsibility?.책무테고리 || '',
    책무: responsibility?.책무 || '',
    책무세부내용: responsibility?.책무세부내용 || '',
    관리의무: responsibility?.관리의무 || '',
    사용여부: responsibility?.사용여부 ?? true
  });

  // 모달 제목
  const modalTitle = useMemo(() => {
    if (mode === 'create') return '책무 추가';
    return '책무 상세';
  }, [mode]);

  // 입력 필드 변경 핸들러
  const handleChange = useCallback((field: keyof ResponsibilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (mode === 'create') {
      await onSave(formData);
    } else if (responsibility) {
      await onUpdate(responsibility.id, formData);
    }
  }, [mode, formData, responsibility, onSave, onUpdate]);

  // 닫기 시 폼 리셋
  const handleClose = useCallback(() => {
    setFormData({
      직책: '',
      본부구분: '',
      부서명: '',
      부점명: '',
      책무테고리: '',
      책무: '',
      책무세부내용: '',
      관리의무: '',
      사용여부: true
    });
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      className={styles.dialog}
      aria-labelledby="responsibility-modal-title"
    >
      <DialogTitle id="responsibility-modal-title" className={styles.dialogTitle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="span" fontWeight={600}>
            {modalTitle}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent className={styles.dialogContent}>
        {/* 직책 섹션 */}
        <Accordion defaultExpanded className={styles.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="position-section-content"
            id="position-section-header"
            className={styles.accordionSummary}
          >
            <Typography fontWeight={600}>📋 직책</Typography>
          </AccordionSummary>
          <AccordionDetails className={styles.accordionDetails}>
            <Box className={styles.formGrid}>
              <FormControl fullWidth size="small">
                <InputLabel>직책 *</InputLabel>
                <Select
                  value={formData.직책}
                  onChange={(e) => handleChange('직책', e.target.value)}
                  label="직책 *"
                  disabled={loading}
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  <MenuItem value="리스크관리본부장">리스크관리본부장</MenuItem>
                  <MenuItem value="감사본부장">감사본부장</MenuItem>
                  <MenuItem value="경영진단본부장">경영진단본부장</MenuItem>
                  <MenuItem value="총합기획부장">총합기획부장</MenuItem>
                  <MenuItem value="영업본부장">영업본부장</MenuItem>
                </Select>
              </FormControl>

              <TableContainer component={Paper} variant="outlined" className={styles.miniTable}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" width="25%">직책</TableCell>
                      <TableCell align="center" width="25%">본부 구분</TableCell>
                      <TableCell align="center" width="25%">부서명</TableCell>
                      <TableCell align="center" width="25%">부점명</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">{formData.직책 || '-'}</TableCell>
                      <TableCell align="center">본부부서</TableCell>
                      <TableCell align="center">리스크관리본부</TableCell>
                      <TableCell align="center">리스크관리본부</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 책무 섹션 */}
        <Accordion defaultExpanded className={styles.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="responsibility-section-content"
            id="responsibility-section-header"
            className={styles.accordionSummary}
          >
            <Typography fontWeight={600}>📌 책무</Typography>
          </AccordionSummary>
          <AccordionDetails className={styles.accordionDetails}>
            <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>
                추가
              </Button>
              <Button variant="contained" size="small" color="success" startIcon={<CheckIcon />}>
                저장
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="10%">상태</TableCell>
                    <TableCell align="center" width="20%">책무테고리</TableCell>
                    <TableCell align="center" width="35%">책무</TableCell>
                    <TableCell align="center" width="25%">관련근거</TableCell>
                    <TableCell align="center" width="10%">사용여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={5}>
                      조회 된 정보가 없습니다.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        {/* 책무 세부내용 섹션 */}
        <Accordion defaultExpanded className={styles.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="detail-section-content"
            id="detail-section-header"
            className={styles.accordionSummary}
          >
            <Typography fontWeight={600}>📝 책무 세부내용</Typography>
          </AccordionSummary>
          <AccordionDetails className={styles.accordionDetails}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                책무 세부내용 순서 결정
              </Typography>
              <Box display="flex" gap={1}>
                <Button variant="contained" size="small" startIcon={<AddIcon />}>
                  추가
                </Button>
                <Button variant="contained" size="small" color="success" startIcon={<CheckIcon />}>
                  저장
                </Button>
              </Box>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="10%">상태</TableCell>
                    <TableCell align="center" width="25%">연결 책무</TableCell>
                    <TableCell align="center" width="45%">책무 세부내용</TableCell>
                    <TableCell align="center" width="10%">최종변경일자</TableCell>
                    <TableCell align="center" width="10%">사용여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={5}>
                      조회 된 정보가 없습니다.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        {/* 관리의무 섹션 */}
        <Accordion defaultExpanded className={styles.accordion}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="management-section-content"
            id="management-section-header"
            className={styles.accordionSummary}
          >
            <Typography fontWeight={600}>🔍 관리의무</Typography>
          </AccordionSummary>
          <AccordionDetails className={styles.accordionDetails}>
            <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
              <Button variant="contained" size="small" startIcon={<AddIcon />}>
                추가
              </Button>
              <Button variant="contained" size="small" color="success" startIcon={<CheckIcon />}>
                저장
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" width="10%">상태</TableCell>
                    <TableCell align="center" width="15%">관리의무<br />대본부 구분</TableCell>
                    <TableCell align="center" width="15%">관리의무<br />중본부 구분</TableCell>
                    <TableCell align="center" width="15%">관리의무코드</TableCell>
                    <TableCell align="center" width="20%">관리의무</TableCell>
                    <TableCell align="center" width="15%">부점명</TableCell>
                    <TableCell align="center" width="10%">사용여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={7}>
                      조회 된 정보가 없습니다.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <Divider />

      <DialogActions className={styles.dialogActions}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={loading}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilityFormModal;
