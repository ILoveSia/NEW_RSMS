/**
 * 직책 등록/수정/상세 모달
 * LedgerFormModal 표준 템플릿 기반
 *
 * 변경사항:
 * 1. LedgerOrderComboBox 추가 (직책명 위에, 진행중 상태만)
 * 2. 원장차수 + 직책명 + 본부명 선택하여 등록
 * 3. 본부 선택 시 해당 본부의 모든 부서를 자동으로 조회하여 저장 (선택 없음)
 * 4. 임원성명 필드 추가 (사원검색 팝업 연동)
 */

import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { EmployeeLookupModal, type Employee } from '@/shared/components/organisms/EmployeeLookupModal';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { DepartmentDto } from '../../../../api/organizationsApi';
import type { Position, PositionFormData } from '../../types/position.types';

// Domain Components
import { HeadquartersComboBox } from '../../../../components/molecules/HeadquartersComboBox';
import { LedgerOrderComboBox } from '../../../../components/molecules/LedgerOrderComboBox';
import { PositionNameComboBox } from '../../../../components/molecules/PositionNameComboBox';

// Hooks
import { useHeadquartersForComboBox } from '../../../../hooks/useHeadquarters';
import { useDepartmentsByHqCode } from '../../../../hooks/useOrganizations';

// API
import { createPosition, getPositionDepartments, type CreatePositionRequest } from '../../../../api/positionApi';

interface PositionFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  position: Position | null;
  onClose: () => void;
  onSave: (formData: PositionFormData) => Promise<void>;
  onUpdate: (id: string, formData: PositionFormData) => Promise<void>;
  onRefresh?: () => Promise<void>; // 목록 새로고침 콜백 추가
  loading?: boolean;
}

const PositionFormModal: React.FC<PositionFormModalProps> = ({
  open,
  mode,
  position,
  onClose,
  onRefresh,
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<PositionFormData>({
    positionName: '',
    headquarters: ''
  });

  // 원장차수 상태 (LedgerOrderComboBox용)
  const [ledgerOrderId, setLedgerOrderId] = useState<string | null>(null);

  // 직책코드 상태 (PositionNameComboBox에서 받아온 detailCode)
  const [positionCode, setPositionCode] = useState<string | null>(null);

  // 임원 정보 상태
  const [executiveName, setExecutiveName] = useState<string>('');
  const [executiveEmpNo, setExecutiveEmpNo] = useState<string>('');

  // 사원검색 모달 상태
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    ledgerOrderId: '',
    positionName: '',
    headquarters: ''
  });

  // 본부 목록 조회 (hq_code 추출용)
  const { data: headquarters } = useHeadquartersForComboBox();

  // 선택된 본부명에서 hq_code 추출
  const selectedHqCode = useMemo(() => {
    if (!formData.headquarters || !headquarters) return null;

    const selectedHq = headquarters.find(hq => hq.detailName === formData.headquarters);
    return selectedHq?.detailCode || null;
  }, [formData.headquarters, headquarters]);

  // 본부 선택 시 해당 본부의 모든 부서 조회 (등록 모드 또는 수정 모드에서 본부 변경 시)
  const { data: departments } = useDepartmentsByHqCode(selectedHqCode);

  // 직책상세 모달일 때 해당 직책의 부서 목록
  const [detailDepartments, setDetailDepartments] = useState<DepartmentDto[]>([]);

  // 조회된 모든 부서의 org_code 배열 추출
  const allOrgCodes = useMemo(() => {
    if (!departments || departments.length === 0) return [];
    return departments.map(dept => dept.orgCode);
  }, [departments]);

  // 직책코드는 이제 positionCode 상태에서 직접 관리
  // (PositionNameComboBox의 onChange에서 직접 설정됨)

  // 부서 목록 DataGrid 컬럼 정의 (조회 전용)
  const departmentColumns = useMemo<ColDef<DepartmentDto>[]>(() => [
    {
      field: 'orgCode',
      headerName: '조직코드',
      width: 120,
      sortable: true
    },
    {
      field: 'orgName',
      headerName: '조직명',
      flex: 1,
      sortable: true
    },
    {
      field: 'orgType',
      headerName: '유형',
      width: 100,
      sortable: true,
      valueFormatter: (params) => {
        const typeMap: Record<string, string> = {
          'head': '본부',
          'dept': '부서',
          'branch': '영업점'
        };
        return typeMap[params.value] || params.value;
      }
    }
  ], []);

  // 사원 선택 핸들러
  const handleEmployeeSelect = useCallback((employee: Employee | Employee[]) => {
    if (!Array.isArray(employee)) {
      setExecutiveName(employee.name);
      setExecutiveEmpNo(employee.employeeId);
      setEmployeeModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        positionName: '',
        headquarters: ''
      });
      setLedgerOrderId(null);
      setPositionCode(null); // 직책코드 초기화
      setExecutiveName(''); // 임원성명 초기화
      setExecutiveEmpNo(''); // 임원사번 초기화
      setIsEditing(true);
      setErrors({ ledgerOrderId: '', positionName: '', headquarters: '' });
      setDetailDepartments([]);
    } else if (position) {
      // 상세 모달일 때 원장차수도 로드
      const fetchPositionDetail = async () => {
        try {
          const { getPosition } = await import('../../../../api/positionApi');
          const positionDetail = await getPosition(Number(position.id));

          setFormData({
            positionName: positionDetail.positionsName,
            headquarters: positionDetail.hqName
          });
          setLedgerOrderId(positionDetail.ledgerOrderId);
          setExecutiveName(''); // TODO: API에서 임원성명 로드
          setExecutiveEmpNo(positionDetail.executiveEmpNo || ''); // 임원사번 로드
          setIsEditing(false);
          setErrors({ ledgerOrderId: '', positionName: '', headquarters: '' });

          // 부서 목록 조회
          const depts = await getPositionDepartments(Number(position.id));
          const convertedDepts: DepartmentDto[] = depts.map(dept => ({
            hqCode: '',
            orgCode: dept.org_code,
            orgName: dept.org_name,
            orgType: 'dept',
            isActive: 'Y'
          }));
          setDetailDepartments(convertedDepts);
        } catch (error) {
          console.error('직책 상세 조회 실패:', error);
          // 실패 시 기존 position 데이터 사용
          setFormData({
            positionName: position.positionName,
            headquarters: position.headquarters
          });
          setLedgerOrderId(null);
          setExecutiveName('');
          setExecutiveEmpNo('');
          setIsEditing(false);
          setErrors({ ledgerOrderId: '', positionName: '', headquarters: '' });
          setDetailDepartments([]);
        }
      };

      fetchPositionDetail();
    }
  }, [mode, position]);

  // 수정 모드에서 본부 변경 시 부서 목록 업데이트
  useEffect(() => {
    if (mode === 'detail' && isEditing && departments) {
      setDetailDepartments(departments);
    }
  }, [mode, isEditing, departments]);

  const handleChange = useCallback((field: keyof PositionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // 제출 전 최종 검증
    if (!ledgerOrderId?.trim()) {
      setErrors(prev => ({ ...prev, ledgerOrderId: '원장차수를 선택해주세요.' }));
      return;
    }
    if (!formData.positionName?.trim()) {
      setErrors(prev => ({ ...prev, positionName: '직책명을 선택해주세요.' }));
      return;
    }
    if (!formData.headquarters?.trim()) {
      setErrors(prev => ({ ...prev, headquarters: '본부명을 선택해주세요.' }));
      return;
    }

    if (errors.ledgerOrderId || errors.positionName || errors.headquarters) {
      return;
    }

    try {
      if (mode === 'create') {
        // API 호출용 요청 데이터 생성
        const request: CreatePositionRequest = {
          ledgerOrderId: ledgerOrderId,
          positionsCd: positionCode || '', // PositionNameComboBox에서 받아온 직책코드
          positionsName: formData.positionName,
          hqCode: selectedHqCode || '',
          hqName: formData.headquarters,
          executiveEmpNo: executiveEmpNo || undefined, // 임원사번 추가
          orgCodes: allOrgCodes, // 조회된 모든 부서의 org_code 배열 전송
          isActive: 'Y',
          isConcurrent: 'N'
        };

        await createPosition(request);
        alert('직책이 성공적으로 등록되었습니다.');

        // 목록 새로고침
        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      } else if (position && isEditing) {
        // 수정 모드: updatePosition API 호출
        const { updatePosition } = await import('../../../../api/positionApi');

        const updateRequest: Partial<CreatePositionRequest> = {
          ledgerOrderId: ledgerOrderId,
          positionsCd: positionCode || '', // PositionNameComboBox에서 받아온 직책코드
          positionsName: formData.positionName,
          hqCode: selectedHqCode || '',
          hqName: formData.headquarters,
          executiveEmpNo: executiveEmpNo || undefined, // 임원사번 추가
          orgCodes: allOrgCodes.length > 0 ? allOrgCodes : undefined
        };

        await updatePosition(Number(position.id), updateRequest);
        alert('직책이 성공적으로 수정되었습니다.');

        // 목록 새로고침
        if (onRefresh) {
          await onRefresh();
        }

        onClose();
      }
    } catch (error) {
      console.error('직책 저장 실패:', error);
      alert(error instanceof Error ? error.message : '직책 저장에 실패했습니다.');
    }
  }, [mode, formData, position, isEditing, onClose, errors, ledgerOrderId, selectedHqCode, positionCode, executiveEmpNo, allOrgCodes, onRefresh]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && position) {
      setFormData({
        positionName: position.positionName,
        headquarters: position.headquarters
      });
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, position, onClose]);

  const title = mode === 'create' ? '직책 등록' : '직책 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>{title}</span>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* 원장차수 - 진행중 상태만 조회 */}
          <LedgerOrderComboBox
            value={ledgerOrderId || undefined}
            onChange={setLedgerOrderId}
            label="원장차수"
            required
            disabled={isReadOnly}
            error={!!errors.ledgerOrderId}
            helperText={errors.ledgerOrderId}
            fullWidth
            size="small"
          />

          {/* 직책명 - 공통 컴포넌트 사용 (상세 모드에서는 항상 비활성화) */}
          <PositionNameComboBox
            value={formData.positionName}
            onChange={(positionName, positionCodeValue) => {
              handleChange('positionName', positionName || '');
              setPositionCode(positionCodeValue || null);
            }}
            label="직책명"
            required
            disabled={mode === 'detail'}
            error={!!errors.positionName}
            helperText={errors.positionName}
            fullWidth
            size="small"
          />

          {/* 본부명 - 공통 컴포넌트 사용 */}
          <HeadquartersComboBox
            value={formData.headquarters}
            onChange={(value: string | null) => handleChange('headquarters', value || '')}
            label="본부명"
            required
            disabled={isReadOnly}
            error={!!errors.headquarters}
            helperText={errors.headquarters}
            fullWidth
            size="small"
          />

          {/* 임원성명 - 사원검색 팝업 연동 */}
          <TextField
            label="임원성명"
            value={executiveName}
            size="small"
            fullWidth
            disabled={isReadOnly}
            placeholder="검색 버튼을 클릭하여 선택하세요"
            InputProps={{
              readOnly: true,
              endAdornment: !isReadOnly && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setEmployeeModalOpen(true)}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-input': {
                cursor: isReadOnly ? 'default' : 'pointer'
              }
            }}
            onClick={() => {
              if (!isReadOnly) {
                setEmployeeModalOpen(true);
              }
            }}
          />

          {/* 부서 목록 DataGrid (등록 모드에서만 표시) */}
          {mode === 'create' && departments && departments.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                조회된 부서 목록 ({departments.length}개) - 등록 시 모두 저장됩니다
              </Typography>
              <Box sx={{ width: '100%', height: '200px' }}>
                <BaseDataGrid
                  data={departments}
                  columns={departmentColumns}
                  rowSelection="none"
                  pagination={false}
                  height="200px"
                />
              </Box>
            </Box>
          )}

          {/* 상세 모드에서도 부서 목록 Grid 표시 */}
          {mode === 'detail' && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.875rem' }}>
                부서 목록 ({detailDepartments.length}개)
              </Typography>
              {detailDepartments.length > 0 ? (
                <Box sx={{ width: '100%', height: '200px' }}>
                  <BaseDataGrid
                    data={detailDepartments}
                    columns={departmentColumns}
                    rowSelection="none"
                    pagination={false}
                    height="200px"
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  부서 목록을 불러오는 중...
                </Typography>
              )}
            </Box>
          )}

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
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

      {/* 사원검색 모달 */}
      <EmployeeLookupModal
        open={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSelect={handleEmployeeSelect}
        title="임원 조회"
      />
    </Dialog>
  );
};

export default PositionFormModal;
