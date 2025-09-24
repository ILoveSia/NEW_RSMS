/**
 * 사용자 등록/수정 모달 컴포넌트
 *
 * @description PositionFormModal 표준 템플릿 기반 사용자 폼 모달
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Divider,
  Box,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type {
  UserFormModalProps,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AccountStatus,
  EmploymentType,
  RoleOption,
  DetailRoleOption
} from '../../types/user.types';

import styles from './UserFormModal.module.scss';

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  mode,
  user,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  loading = false,
  roles = [],
  detailRoles = [],
  departments = [],
  positions = []
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    employeeNo: '',
    fullName: '',
    englishName: '',
    jobRankCode: '',
    deptId: 0,
    deptCode: '',
    deptName: '',
    employmentType: 'REGULAR' as EmploymentType,
    accountStatus: 'ACTIVE' as AccountStatus,
    loginBlocked: false,
    isActive: true,
    timezone: '(GMT+09:00) Seoul/Asia',
    passwordChangeRequired: true,
    resetPassword: false
  });

  // 역할 선택 상태
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDetailRoles, setSelectedDetailRoles] = useState<string[]>([]);

  // Mock 역할 데이터
  const mockRoles: RoleOption[] = useMemo(() => [
    {
      id: '1',
      code: 'Administrator',
      name: '최고관리자',
      detailRoleCount: 2,
      isSystemRole: true
    },
    {
      id: '2',
      code: 'Manager',
      name: '관리자',
      detailRoleCount: 5,
      isSystemRole: true
    },
    {
      id: '3',
      code: 'User',
      name: '사용자',
      detailRoleCount: 5,
      isSystemRole: true
    },
    {
      id: '4',
      code: 'Any',
      name: '비로그인',
      detailRoleCount: 0,
      isSystemRole: true
    }
  ], []);

  // Mock 상세 역할 데이터
  const mockDetailRoles: DetailRoleOption[] = useMemo(() => [
    {
      id: '1',
      roleId: '1',
      code: 'A01',
      name: '준법감시인',
      description: '준법감시인 권한',
      roleDescriptionCode: '002-준법감시',
      isSystemRole: true
    },
    {
      id: '2',
      roleId: '1',
      code: 'A99',
      name: '시스템관리자',
      description: '시스템관리자 권한',
      roleDescriptionCode: '002-준법감시',
      isSystemRole: true
    }
  ], []);

  // 역할 컬럼 정의
  const roleColumns = useMemo(() => [
    {
      headerName: '선택',
      field: 'selected',
      width: 60,
      cellRenderer: (params: any) => {
        const isSelected = selectedRoles.includes(params.data.id);
        return `<input type="checkbox" ${isSelected ? 'checked' : ''} />`;
      },
      onCellClicked: (params: any) => {
        const roleId = params.data.id;
        setSelectedRoles(prev =>
          prev.includes(roleId)
            ? prev.filter(id => id !== roleId)
            : [...prev, roleId]
        );
      }
    },
    {
      headerName: '순서',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      width: 60
    },
    {
      headerName: '역할코드',
      field: 'code',
      width: 120
    },
    {
      headerName: '역할명',
      field: 'name',
      width: 120
    },
    {
      headerName: '상세역할수',
      field: 'detailRoleCount',
      width: 100,
      cellRenderer: (params: any) => `${params.value}개`
    }
  ], [selectedRoles]);

  // 상세 역할 컬럼 정의
  const detailRoleColumns = useMemo(() => [
    {
      headerName: '선택',
      field: 'selected',
      width: 60,
      cellRenderer: (params: any) => {
        const isSelected = selectedDetailRoles.includes(params.data.id);
        return `<input type="checkbox" ${isSelected ? 'checked' : ''} />`;
      },
      onCellClicked: (params: any) => {
        const roleId = params.data.id;
        setSelectedDetailRoles(prev =>
          prev.includes(roleId)
            ? prev.filter(id => id !== roleId)
            : [...prev, roleId]
        );
      }
    },
    {
      headerName: '순서',
      valueGetter: (params: any) => params.node.rowIndex + 1,
      width: 60
    },
    {
      headerName: '역할코드',
      field: 'code',
      width: 100
    },
    {
      headerName: '역할명',
      field: 'name',
      width: 120
    },
    {
      headerName: '역할설명코드',
      field: 'roleDescriptionCode',
      width: 130
    }
  ], [selectedDetailRoles]);

  // 모달 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && user) {
        setFormData({
          employeeNo: user.employeeNo || '',
          fullName: user.fullName || '',
          englishName: user.englishName || '',
          jobRankCode: user.jobRankCode || '',
          deptId: user.deptId || 0,
          deptCode: user.deptCode || '',
          deptName: user.deptName || '',
          employmentType: (user.employmentType as EmploymentType) || 'REGULAR',
          accountStatus: user.accountStatus || 'ACTIVE',
          loginBlocked: false,
          isActive: user.isActive || true,
          timezone: user.timezone || '(GMT+09:00) Seoul/Asia',
          passwordChangeRequired: user.passwordChangeRequired || false,
          resetPassword: false
        });

        // 기존 역할 선택 상태 설정
        if (user.roles) {
          setSelectedRoles(user.roles.map(role => role.roleId));
        }
      } else {
        // 등록 모드 초기화
        setFormData({
          employeeNo: '',
          fullName: '',
          englishName: '',
          jobRankCode: '',
          deptId: 0,
          deptCode: '',
          deptName: '',
          employmentType: 'REGULAR',
          accountStatus: 'ACTIVE',
          loginBlocked: false,
          isActive: true,
          timezone: '(GMT+09:00) Seoul/Asia',
          passwordChangeRequired: true,
          resetPassword: false
        });
        setSelectedRoles([]);
        setSelectedDetailRoles([]);
      }
    }
  }, [open, mode, user]);

  // 입력 핸들러
  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 부서 검색 핸들러
  const handleDeptSearch = () => {
    // TODO: 부서 검색 모달 열기
    console.log('부서 검색');
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      alert('성명을 입력해주세요.');
      return;
    }

    if (mode === 'create') {
      const createData: CreateUserRequest = {
        employeeNo: formData.employeeNo || formData.fullName.toUpperCase(),
        fullName: formData.fullName,
        englishName: formData.englishName,
        deptId: formData.deptId || undefined,
        jobRankCode: formData.jobRankCode,
        employmentType: formData.employmentType,
        accountStatus: formData.accountStatus,
        isActive: formData.isActive,
        timezone: formData.timezone,
        passwordChangeRequired: formData.passwordChangeRequired,
        roleIds: selectedRoles,
        detailRoleIds: selectedDetailRoles
      };
      await onSave(createData);
    } else if (user) {
      const updateData: UpdateUserRequest = {
        fullName: formData.fullName,
        englishName: formData.englishName,
        deptId: formData.deptId || undefined,
        jobRankCode: formData.jobRankCode,
        employmentType: formData.employmentType,
        accountStatus: formData.accountStatus,
        isActive: formData.isActive,
        timezone: formData.timezone,
        passwordChangeRequired: formData.passwordChangeRequired,
        resetPassword: formData.resetPassword,
        roleIds: selectedRoles,
        detailRoleIds: selectedDetailRoles
      };
      await onUpdate(user.id, updateData);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!user) return;

    const confirmMessage = `사용자 "${user.fullName}"을(를) 삭제하시겠습니까?`;
    if (window.confirm(confirmMessage) && onDelete) {
      await onDelete(user.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: styles.modalPaper
      }}
    >
      <DialogTitle className={styles.modalTitle}>
        <Typography variant="h6">
          {mode === 'create' ? '사용자 정보 등록 팝업' : '사용자 정보 수정 팝업'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.modalContent}>
        {/* 기본 정보 섹션 */}
        <Box className={styles.formSection}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="직번 *"
                value={formData.employeeNo}
                onChange={handleChange('employeeNo')}
                placeholder="사용자 식별번호"
                disabled={mode === 'edit'}
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="성명 *"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                placeholder="사용자 실명"
                required
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="직위"
                value={formData.jobRankCode}
                onChange={handleChange('jobRankCode')}
                placeholder="직위"
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" gap={1}>
                <TextField
                  label="부정 *"
                  value={formData.deptName}
                  placeholder="부서명"
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: true
                  }}
                />
                <IconButton size="small" onClick={handleDeptSearch}>
                  <SearchIcon />
                </IconButton>
                <IconButton size="small">
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="근무상태"
                value={formData.accountStatus}
                onChange={handleChange('accountStatus')}
                select
                fullWidth
                size="small"
              >
                <MenuItem value="ACTIVE">재직</MenuItem>
                <MenuItem value="SUSPENDED">정지</MenuItem>
                <MenuItem value="RESIGNED">퇴직</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.loginBlocked}
                    onChange={handleChange('loginBlocked')}
                  />
                }
                label="로그인 차단"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    onChange={handleChange('isActive')}
                  />
                }
                label={mode === 'create' ? '활성화' : '재설 활성화'}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="타임존"
                value={formData.timezone}
                onChange={handleChange('timezone')}
                select
                fullWidth
                size="small"
              >
                <MenuItem value="(GMT+09:00) Seoul/Asia">(GMT+09:00) Seoul/Asia</MenuItem>
                <MenuItem value="(GMT+00:00) UTC">(GMT+00:00) UTC</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider className={styles.divider} />

        {/* 비밀번호 설정 섹션 */}
        <Box className={styles.formSection}>
          <Typography variant="subtitle2" gutterBottom>
            비밀번호 설정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.passwordChangeRequired}
                    onChange={handleChange('passwordChangeRequired')}
                  />
                }
                label="비밀번호 변경 여부: 예"
              />
            </Grid>
            {mode === 'edit' && (
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.resetPassword}
                      onChange={handleChange('resetPassword')}
                    />
                  }
                  label="비밀번호 초기화"
                />
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider className={styles.divider} />

        {/* 역할 할당 섹션 */}
        <Box className={styles.roleSection}>
          <Grid container spacing={2}>
            {/* 역할(MenuID) */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                🔐 역할(MenuID)
              </Typography>
              <Box className={styles.roleGrid}>
                <BaseDataGrid
                  data={mockRoles}
                  columns={roleColumns}
                  height="200px"
                  pagination={false}
                  rowSelection="multiple"
                />
              </Box>
            </Grid>

            {/* 상세 역할 */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                🔍 상세 역할
              </Typography>
              <Box className={styles.roleGrid}>
                <BaseDataGrid
                  data={mockDetailRoles}
                  columns={detailRoleColumns}
                  height="200px"
                  pagination={false}
                  rowSelection="multiple"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions className={styles.modalActions}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          단순
        </Button>
        {mode === 'edit' && onDelete && (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={loading}
          >
            삭제
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          loading={loading}
        >
          {mode === 'create' ? '등록' : '수정'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;