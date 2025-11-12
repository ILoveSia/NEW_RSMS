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
import CloseIcon from '@mui/icons-material/Close';
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
  Select,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

// 부서장업무메뉴얼 폼 데이터 타입
export interface DeptOpManualFormData {
  ledgerOrderId: string;                 // 원장차수ID
  orgCode: string;                       // 조직코드 (부서)
  obligationCd: string;                  // 관리의무코드
  activityTypeCd: string;                // 관리활동구분코드
  activityName: string;                  // 관리활동명
  activityDetail: string;                // 관리활동상세
  riskAssessmentLevelCd: string;         // 위험평가등급
  implCheckFrequencyCd: string;          // 이행점검주기
  implCheckMethod: string;               // 이행점검방법
  isActive: 'Y' | 'N';                   // 사용여부
  remarks: string;                       // 비고
}

interface DeptOpManualsFormModalProps {
  open: boolean;
  mode: 'create' | 'view' | 'edit';
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
    obligationCd: '',
    activityTypeCd: '',
    activityName: '',
    activityDetail: '',
    riskAssessmentLevelCd: '',
    implCheckFrequencyCd: '',
    implCheckMethod: '',
    isActive: 'Y',
    remarks: ''
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
  const isReadOnly = mode === 'view' && !isEditing;

  // 상세 모드일 때 기존 데이터 로드
  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && manual && open) {
      console.log('🔍 [DeptOpManualsFormModal] 상세 데이터 로드:', manual);

      // DeptOpManual 타입의 데이터를 폼 데이터로 변환
      setFormData({
        ledgerOrderId: manual.id || '',
        orgCode: manual.irregularityName || '',
        obligationCd: 'OBL001',
        activityTypeCd: manual.managementActivityType === 'compliance' ? 'COMP' : 'RISK',
        activityName: manual.managementActivity || manual.managementActivityName || '',
        activityDetail: manual.managementActivityDetail || '',
        riskAssessmentLevelCd: manual.riskAssessmentLevel === 'high' ? 'HIGH' : manual.riskAssessmentLevel === 'medium' ? 'MED' : 'LOW',
        implCheckFrequencyCd: 'MONTHLY',
        implCheckMethod: manual.implementationManager || '',
        isActive: manual.isActive ? 'Y' : 'N',
        remarks: manual.remarks || ''
      });

      // 선택된 조직 정보도 복원
      if (manual.irregularityName) {
        setSelectedOrganization({
          orgCode: manual.irregularityName,
          orgName: manual.irregularityName
        });
      }
    }
  }, [mode, manual, open]);

  // 폼 리셋
  const handleReset = useCallback(() => {
    setFormData({
      ledgerOrderId: '',
      orgCode: '',
      obligationCd: '',
      activityTypeCd: '',
      activityName: '',
      activityDetail: '',
      riskAssessmentLevelCd: '',
      implCheckFrequencyCd: '',
      implCheckMethod: '',
      isActive: 'Y',
      remarks: ''
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

  // 수정 버튼 클릭
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 취소 버튼 클릭
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    if (manual) {
      setFormData({
        ledgerOrderId: manual.id || '',
        orgCode: manual.irregularityName || '',
        obligationCd: 'OBL001',
        activityTypeCd: manual.managementActivityType === 'compliance' ? 'COMP' : 'RISK',
        activityName: manual.managementActivity || manual.managementActivityName || '',
        activityDetail: manual.managementActivityDetail || '',
        riskAssessmentLevelCd: manual.riskAssessmentLevel === 'high' ? 'HIGH' : manual.riskAssessmentLevel === 'medium' ? 'MED' : 'LOW',
        implCheckFrequencyCd: 'MONTHLY',
        implCheckMethod: manual.implementationManager || '',
        isActive: manual.isActive ? 'Y' : 'N',
        remarks: manual.remarks || ''
      });

      // 선택된 조직 정보도 복원
      if (manual.irregularityName) {
        setSelectedOrganization({
          orgCode: manual.irregularityName,
          orgName: manual.irregularityName
        });
      }
    }
  }, [manual]);

  // 부점 조회 팝업 열기
  const handleOpenOrgSearch = useCallback(() => {
    if (!isReadOnly && mode !== 'view') {
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
    if (!formData.obligationCd) {
      toast.warning('관리의무를 선택해주세요.');
      return;
    }
    if (!formData.activityTypeCd) {
      toast.warning('관리활동구분을 선택해주세요.');
      return;
    }
    if (!formData.activityName) {
      toast.warning('관리활동명을 입력해주세요.');
      return;
    }
    if (!formData.riskAssessmentLevelCd) {
      toast.warning('위험평가등급을 선택해주세요.');
      return;
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

            {/* 책무이행차수, 부점, 관리의무 한 줄 배치 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 책무이행차수 */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <LedgerOrderComboBox
                  value={formData.ledgerOrderId}
                  onChange={(value) => handleChange('ledgerOrderId', value || '')}
                  label="책무이행차수"
                  required
                  disabled={isReadOnly || mode === 'view'}
                  size="small"
                />
              </Box>

              {/* 부점 */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="부점"
                  required
                  disabled={isReadOnly || mode === 'view'}
                  value={selectedOrganization ? `${selectedOrganization.orgName} (${selectedOrganization.orgCode})` : ''}
                  placeholder="돋보기 버튼을 클릭하여 부점을 선택하세요"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleOpenOrgSearch}
                          disabled={isReadOnly || mode === 'view'}
                          size="small"
                          edge="end"
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              </Box>

              {/* 관리의무 */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="관리의무"
                  required
                  disabled={isReadOnly || !formData.orgCode}
                  value={formData.obligationCd}
                  onChange={(e) => handleChange('obligationCd', e.target.value)}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { maxHeight: 300 }
                      }
                    }
                  }}
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  {obligationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* 관리의무 정보 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              관리활동 정보
            </Typography>

            {/* 관리활동구분, 관리활동명 한 줄 배치 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 관리활동구분 */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" required disabled={isReadOnly}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    관리활동구분 *
                  </Typography>
                  <Select
                    value={formData.activityTypeCd}
                    onChange={(e) => handleChange('activityTypeCd', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {activityTypeCode.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 관리활동명 */}
              <Box sx={{ flex: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  관리활동명 *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  value={formData.activityName}
                  onChange={(e) => handleChange('activityName', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="관리활동명을 입력하세요"
                />
              </Box>
            </Box>

            {/* 관리활동상세 */}
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                관리활동상세
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={formData.activityDetail}
                onChange={(e) => handleChange('activityDetail', e.target.value)}
                disabled={isReadOnly}
                placeholder="관리활동 상세 내용을 입력하세요"
              />
            </Box>

            {/* 위험평가등급, 이행점검주기, 사용여부 한 줄 배치 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 위험평가등급 */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" required disabled={isReadOnly}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    위험평가등급 *
                  </Typography>
                  <Select
                    value={formData.riskAssessmentLevelCd}
                    onChange={(e) => handleChange('riskAssessmentLevelCd', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {riskLevelCode.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 이행점검주기 */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" disabled={isReadOnly}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    이행점검주기
                  </Typography>
                  <Select
                    value={formData.implCheckFrequencyCd}
                    onChange={(e) => handleChange('implCheckFrequencyCd', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {implCheckFrequencyCode.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 사용여부 */}
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth size="small" disabled={isReadOnly}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    사용여부
                  </Typography>
                  <Select
                    value={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.value as 'Y' | 'N')}
                  >
                    <MenuItem value="Y">사용</MenuItem>
                    <MenuItem value="N">미사용</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* 이행점검방법 */}
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                이행점검방법
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={formData.implCheckMethod}
                onChange={(e) => handleChange('implCheckMethod', e.target.value)}
                disabled={isReadOnly}
                placeholder="이행점검방법을 입력하세요"
              />
            </Box>

            {/* 비고 */}
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                비고
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                disabled={isReadOnly}
                placeholder="비고를 입력하세요"
              />
            </Box>
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
        ) : mode === 'view' ? (
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
        ) : (
          // mode === 'edit'
          <>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
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
