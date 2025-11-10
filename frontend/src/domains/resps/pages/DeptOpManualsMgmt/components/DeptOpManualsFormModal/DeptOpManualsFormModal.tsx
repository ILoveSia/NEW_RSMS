/**
 * 부서장업무메뉴얼 등록/상세 모달
 * - 부서별로 여러 관리의무를 Grid로 등록
 * - 원장차수 선택 → 부서 선택 → 관리의무 Grid 입력
 * - 각 행: 관리의무 + 관리활동 기본정보 + 이행점검 정보
 */

import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { getManagementObligationsByOrgCode } from '@/shared/api/organizationApi';
import { Button } from '@/shared/components/atoms/Button';
import { OrganizationSearchModal, type Organization } from '@/shared/components/organisms/OrganizationSearchModal';
import { useCommonCode } from '@/shared/hooks';
import toast from '@/shared/utils/toast';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// 관리의무 행 데이터 타입
export interface ObligationRowData {
  id: string;                            // 행 고유 ID (UUID)
  obligationCd: string;                  // 관리의무코드
  obligationName: string;                // 관리의무명 (표시용)
  activityTypeCd: string;                // 관리활동구분코드
  activityName: string;                  // 관리활동명
  activityDetail: string;                // 관리활동상세
  riskAssessmentLevelCd: string;         // 위험평가등급
  activityFrequencyCd: string;           // 관리활동수행주기
  evidenceTypeCd: string;                // 관리활동증빙유형코드
  evidenceMaterial: string;              // 관리활동증빙자료
  relatedBasis: string;                  // 관련근거
  implCheckFrequencyCd: string;          // 이행점검주기
  isConditionalCheck: 'Y' | 'N';         // 조건부점검항목여부
  implCheckMethod: string;               // 이행점검방법
  endDate: string;                       // 종료일
  isActive: 'Y' | 'N';                   // 사용여부
  status: string;                        // 상태
  remarks: string;                       // 비고
}

// 부서장업무메뉴얼 폼 데이터 타입
export interface DeptOpManualFormData {
  ledgerOrderId: string;                 // 원장차수ID
  orgCode: string;                       // 조직코드 (부서)
  obligations: ObligationRowData[];      // 관리의무 목록
}

interface DeptOpManualsFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  manual: any | null;
  onClose: () => void;
  onSave: (formData: DeptOpManualFormData) => Promise<void>;
  onUpdate: (id: string, formData: DeptOpManualFormData) => Promise<void>;
  loading?: boolean;
}

/**
 * 부서장업무메뉴얼 등록/상세 모달 컴포넌트
 * - Grid 기반 다중 관리의무 등록
 */
const DeptOpManualsFormModal: React.FC<DeptOpManualsFormModalProps> = ({
  open,
  mode,
  manual,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 공통코드 조회
  const activityTypeCode = useCommonCode('MGMT_OBLG_LCCD');          // 관리활동구분코드
  const riskLevelCode = useCommonCode('ACVT_RSK_EVAL_DVCD');         // 위험평가등급
  const implCheckFrequencyCode = useCommonCode('FLFL_ISPC_FRCD');    // 이행점검주기

  // 관리의무 목록 (조직 선택 시 API로 조회)
  const [obligationOptions, setObligationOptions] = useState<Array<{value: string; label: string}>>([]);

  // 폼 데이터 상태
  const [formData, setFormData] = useState<DeptOpManualFormData>({
    ledgerOrderId: '',
    orgCode: '',
    obligations: []
  });

  // 선택된 조직 정보
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // 부점 조회 팝업 상태
  const [isOrgSearchModalOpen, setIsOrgSearchModalOpen] = useState(false);

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 모달 제목
  const modalTitle = mode === 'create' ? '업무메뉴얼 등록' : '업무메뉴얼 상세';

  // 읽기 전용 모드
  const isReadOnly = mode === 'detail' && !isEditing;

  // 상세 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'detail' && manual && open) {
      console.log('🔍 [DeptOpManualsFormModal] 상세 데이터 로드:', manual);
      setFormData({
        ledgerOrderId: manual.ledgerOrderId || '',
        orgCode: manual.orgCode || '',
        obligations: manual.obligations || []
      });

      // 선택된 조직 정보도 복원 (추후 API에서 조직명 조회 필요)
      if (manual.orgCode) {
        setSelectedOrganization({
          orgCode: manual.orgCode,
          orgName: manual.orgName || manual.orgCode // 조직명이 있으면 사용, 없으면 코드 표시
        });
      }
    }
  }, [mode, manual, open]);

  // 폼 리셋
  const handleReset = useCallback(() => {
    setFormData({
      ledgerOrderId: '',
      orgCode: '',
      obligations: []
    });
    setSelectedOrganization(null);
    setIsEditing(false);
  }, []);

  // 닫기
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // 입력 변경 핸들러
  const handleChange = useCallback((field: keyof DeptOpManualFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 새 행 추가
  const handleAddRow = useCallback(() => {
    const newRow: ObligationRowData = {
      id: crypto.randomUUID(),
      obligationCd: '',
      obligationName: '',
      activityTypeCd: '',
      activityName: '',
      activityDetail: '',
      riskAssessmentLevelCd: '',
      activityFrequencyCd: '',
      evidenceTypeCd: '',
      evidenceMaterial: '',
      relatedBasis: '',
      implCheckFrequencyCd: '',
      isConditionalCheck: 'N',
      implCheckMethod: '',
      endDate: '',
      isActive: 'Y',
      status: 'active',
      remarks: ''
    };

    setFormData(prev => ({
      ...prev,
      obligations: [...prev.obligations, newRow]
    }));
  }, []);

  // 행 삭제
  const handleDeleteRow = useCallback((rowId: string) => {
    setFormData(prev => ({
      ...prev,
      obligations: prev.obligations.filter(row => row.id !== rowId)
    }));
  }, []);

  // 행 데이터 변경
  const handleRowChange = useCallback((rowId: string, field: keyof ObligationRowData, value: any) => {
    setFormData(prev => ({
      ...prev,
      obligations: prev.obligations.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value };

          // 관리의무 선택 시 관리의무명도 함께 업데이트
          if (field === 'obligationCd') {
            const option = obligationOptions.find(opt => opt.value === value);
            updatedRow.obligationName = option?.label || '';
          }

          return updatedRow;
        }
        return row;
      })
    }));
  }, [obligationOptions]);

  // 수정 버튼 클릭
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 취소 버튼 클릭
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (manual) {
      setFormData({
        ledgerOrderId: manual.ledgerOrderId || '',
        orgCode: manual.orgCode || '',
        obligations: manual.obligations || []
      });

      // 선택된 조직 정보도 복원
      if (manual.orgCode) {
        setSelectedOrganization({
          orgCode: manual.orgCode,
          orgName: manual.orgName || manual.orgCode
        });
      }
    }
  }, [manual]);

  // 부점 조회 팝업 열기
  const handleOpenOrgSearch = useCallback(() => {
    if (!isReadOnly && mode !== 'detail') {
      setIsOrgSearchModalOpen(true);
    }
  }, [isReadOnly, mode]);

  // 부점 조회 팝업 닫기
  const handleCloseOrgSearch = useCallback(() => {
    setIsOrgSearchModalOpen(false);
  }, []);

  // 부점 선택
  const handleSelectOrganization = useCallback((organization: Organization) => {
    setSelectedOrganization(organization);
    setFormData(prev => ({
      ...prev,
      orgCode: organization.orgCode
    }));
  }, []);

  // 조직 선택 시 관리의무 목록 조회
  useEffect(() => {
    const fetchObligations = async () => {
      if (formData.orgCode) {
        try {
          const obligations = await getManagementObligationsByOrgCode(formData.orgCode);
          setObligationOptions(
            obligations.map(obl => ({
              value: obl.obligationCd,
              label: obl.obligationInfo
            }))
          );
        } catch (error) {
          console.error('[DeptOpManualsFormModal] 관리의무 조회 실패:', error);
          toast.error('관리의무 목록을 불러오는데 실패했습니다.');
          setObligationOptions([]);
        }
      } else {
        setObligationOptions([]);
      }
    };

    fetchObligations();
  }, [formData.orgCode]);

  // 저장/제출 핸들러
  const handleSubmit = useCallback(async () => {
    // 필수 필드 유효성 검사
    if (!formData.ledgerOrderId) {
      toast.warning('책무이행차수를 선택해주세요.');
      return;
    }
    if (!formData.orgCode) {
      toast.warning('부점을 선택해주세요.');
      return;
    }
    if (formData.obligations.length === 0) {
      toast.warning('최소 1개 이상의 관리의무를 등록해주세요.');
      return;
    }

    // 각 관리의무 행 검증
    for (let i = 0; i < formData.obligations.length; i++) {
      const row = formData.obligations[i];
      const rowNum = i + 1;

      if (!row.obligationCd) {
        toast.warning(`${rowNum}번째 행: 관리의무를 선택해주세요.`);
        return;
      }
      if (!row.activityTypeCd) {
        toast.warning(`${rowNum}번째 행: 관리활동구분을 선택해주세요.`);
        return;
      }
      if (!row.activityName) {
        toast.warning(`${rowNum}번째 행: 관리활동명을 입력해주세요.`);
        return;
      }
      if (!row.riskAssessmentLevelCd) {
        toast.warning(`${rowNum}번째 행: 위험평가등급을 선택해주세요.`);
        return;
      }
    }

    try {
      if (mode === 'create') {
        await onSave(formData);
      } else {
        await onUpdate(manual.id, formData);
        setIsEditing(false);
      }
      handleClose();
    } catch (error) {
      console.error('[DeptOpManualsFormModal] 저장 실패:', error);
    }
  }, [mode, formData, manual, onSave, onUpdate, handleClose]);

  // 원장차수와 부서가 선택되었는지 확인
  const canAddRow = useMemo(() => {
    return formData.ledgerOrderId && formData.orgCode;
  }, [formData.ledgerOrderId, formData.orgCode]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '700px',
          maxHeight: '90vh',
          maxWidth: '900px',  // 명시적으로 900px로 제한
          width: '85vw'        // 뷰포트의 85%
        }
      }}
      aria-labelledby="dept-op-manuals-modal-title"
    >
      <DialogTitle
        id="dept-op-manuals-modal-title"
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
            {modalTitle}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 기본 정보 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              기본 정보
            </Typography>

            {/* 책무이행차수와 부점 한 줄 배치 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 책무이행차수 - 수정 모드일 때도 비활성화 */}
              <LedgerOrderComboBox
                value={formData.ledgerOrderId}
                onChange={(value) => handleChange('ledgerOrderId', value || '')}
                label="책무이행차수"
                required
                disabled={isReadOnly || mode === 'detail'}
                size="small"
              />

              {/* 부점 - 돋보기 버튼으로 조회 */}
              <TextField
                fullWidth
                size="small"
                label="부점"
                required
                disabled={isReadOnly || mode === 'detail'}
                value={selectedOrganization ? `${selectedOrganization.orgName} (${selectedOrganization.orgCode})` : ''}
                placeholder="돋보기 버튼을 클릭하여 부점을 선택하세요"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleOpenOrgSearch}
                        disabled={isReadOnly || mode === 'detail'}
                        size="small"
                        edge="end"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* 관리의무 Grid 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                관리의무 목록
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: '1rem' }} />}
                onClick={handleAddRow}
                disabled={isReadOnly || !canAddRow}
                size="small"
                sx={{
                  fontSize: '0.8125rem',      // 폰트 크기 축소
                  padding: '4px 12px',         // 패딩 축소
                  minWidth: '90px',            // 최소 너비 설정
                  height: '32px'               // 높이 고정
                }}
              >
                행 추가
              </Button>
            </Box>

            {!canAddRow && (
              <Typography variant="body2" color="text.secondary">
                * 책무이행차수와 부점을 먼저 선택해주세요.
              </Typography>
            )}

            {/* Grid Table - 가로 스크롤 허용 */}
            {formData.obligations.length > 0 && (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: '400px',
                  overflowX: 'auto',  // 가로 스크롤 허용
                  overflowY: 'auto'   // 세로 스크롤 허용
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 50, fontWeight: 600 }}>No</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>관리의무 *</TableCell>
                      <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>관리활동구분 *</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>관리활동명 *</TableCell>
                      <TableCell sx={{ minWidth: 200, fontWeight: 600 }}>관리활동상세</TableCell>
                      <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>위험평가등급 *</TableCell>
                      <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>이행점검주기</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 600 }}>이행점검방법</TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>사용여부</TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 600 }}>상태</TableCell>
                      <TableCell sx={{ minWidth: 80, fontWeight: 600, textAlign: 'center' }}>삭제</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.obligations.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>

                        {/* 관리의무 */}
                        <TableCell>
                          <FormControl fullWidth size="small" disabled={isReadOnly}>
                            <Select
                              value={row.obligationCd}
                              onChange={(e) => handleRowChange(row.id, 'obligationCd', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">선택</MenuItem>
                              {obligationOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 관리활동구분 */}
                        <TableCell>
                          <FormControl fullWidth size="small" disabled={isReadOnly}>
                            <Select
                              value={row.activityTypeCd}
                              onChange={(e) => handleRowChange(row.id, 'activityTypeCd', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">선택</MenuItem>
                              {activityTypeCode.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 관리활동명 */}
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={row.activityName}
                            onChange={(e) => handleRowChange(row.id, 'activityName', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="입력"
                          />
                        </TableCell>

                        {/* 관리활동상세 */}
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={row.activityDetail}
                            onChange={(e) => handleRowChange(row.id, 'activityDetail', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="입력"
                            multiline
                            maxRows={2}
                          />
                        </TableCell>

                        {/* 위험평가등급 */}
                        <TableCell>
                          <FormControl fullWidth size="small" disabled={isReadOnly}>
                            <Select
                              value={row.riskAssessmentLevelCd}
                              onChange={(e) => handleRowChange(row.id, 'riskAssessmentLevelCd', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">선택</MenuItem>
                              {riskLevelCode.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 이행점검주기 */}
                        <TableCell>
                          <FormControl fullWidth size="small" disabled={isReadOnly}>
                            <Select
                              value={row.implCheckFrequencyCd}
                              onChange={(e) => handleRowChange(row.id, 'implCheckFrequencyCd', e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">선택</MenuItem>
                              {implCheckFrequencyCode.options.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 이행점검방법 */}
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={row.implCheckMethod}
                            onChange={(e) => handleRowChange(row.id, 'implCheckMethod', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="입력"
                            multiline
                            maxRows={2}
                          />
                        </TableCell>

                        {/* 사용여부 */}
                        <TableCell>
                          <FormControl fullWidth size="small" disabled={isReadOnly}>
                            <Select
                              value={row.isActive}
                              onChange={(e) => handleRowChange(row.id, 'isActive', e.target.value as 'Y' | 'N')}
                            >
                              <MenuItem value="Y">사용</MenuItem>
                              <MenuItem value="N">미사용</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 상태 */}
                        <TableCell>
                          <FormControl fullWidth size="small" disabled={isReadOnly}>
                            <Select
                              value={row.status}
                              onChange={(e) => handleRowChange(row.id, 'status', e.target.value)}
                            >
                              <MenuItem value="active">사용</MenuItem>
                              <MenuItem value="inactive">미사용</MenuItem>
                              <MenuItem value="pending">검토중</MenuItem>
                              <MenuItem value="approved">승인완료</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* 삭제 */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRow(row.id)}
                            disabled={isReadOnly}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
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
                <Button variant="outlined" onClick={handleClose} disabled={loading}>
                  닫기
                </Button>
                <Button variant="contained" onClick={handleEdit} disabled={loading}>
                  수정
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>

      {/* 부점 조회 팝업 */}
      <OrganizationSearchModal
        open={isOrgSearchModalOpen}
        onClose={handleCloseOrgSearch}
        onSelect={handleSelectOrganization}
        title="부점 조회"
        selectedOrgCode={formData.orgCode}
      />
    </Dialog>
  );
};

export default DeptOpManualsFormModal;
