/**
 * 사용자 등록/수정/상세 모달
 * PositionFormModal 표준 템플릿 기반
 *
 * 주요 기능:
 * 1. 사용자 등록 (create 모드)
 * 2. 사용자 상세 조회 (detail 모드)
 * 3. 사용자 수정 (detail 모드에서 수정 버튼 클릭)
 * 4. 실제 API 연동 (createUser, updateUser, getUser)
 *
 * @author RSMS Development Team
 * @since 2025-12-04
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { Button } from '@/shared/components/atoms/Button';
import { OrganizationSelect } from '@/shared/components/molecules/OrganizationSelect';

// API
import {
  getUser,
  createUser,
  updateUser,
  getActiveRoles,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserDto,
  type UserRoleDto
} from '../../../../api/userMgmtApi';

// Types
import type { User } from '../../types/user.types';

// ===============================
// Props 타입 정의
// ===============================

interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  user: User | null;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
}

// ===============================
// 폼 데이터 타입
// ===============================

interface UserFormData {
  username: string;
  password: string;
  empNo: string;
  orgCode: string;
  accountStatus: string;
  isAdmin: boolean;
  isExecutive: boolean;
  authLevel: number;
  isLoginBlocked: boolean;
  timezone: string;
  language: string;
  isActive: boolean;
  passwordChangeRequired: boolean;
}

// 역할 옵션 타입
interface RoleItem {
  roleId: number;
  roleCode: string;
  roleName: string;
}

// ===============================
// 컴포넌트
// ===============================

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  mode,
  user,
  onClose,
  onRefresh,
  loading = false
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    empNo: '',
    orgCode: '',
    accountStatus: 'ACTIVE',
    isAdmin: false,
    isExecutive: false,
    authLevel: 5,
    isLoginBlocked: false,
    timezone: 'Asia/Seoul',
    language: 'ko',
    isActive: true,
    passwordChangeRequired: true
  });

  // 역할 관련 상태
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 에러 상태
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    empNo: ''
  });

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // ===============================
  // 역할 목록 조회
  // ===============================

  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const roles = await getActiveRoles();
      const converted: RoleItem[] = roles.map((role: UserRoleDto) => ({
        roleId: role.roleId,
        roleCode: role.roleCode,
        roleName: role.roleName
      }));
      setAvailableRoles(converted);
    } catch (error) {
      console.error('역할 목록 조회 실패:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  // ===============================
  // 사용자 상세 조회
  // ===============================

  const fetchUserDetail = useCallback(async (userId: number) => {
    try {
      const userDetail: UserDto = await getUser(userId);

      setFormData({
        username: userDetail.username || '',
        password: '',
        empNo: userDetail.empNo || '',
        orgCode: userDetail.orgCode || '',
        accountStatus: userDetail.accountStatus || 'ACTIVE',
        isAdmin: userDetail.isAdmin || false,
        isExecutive: userDetail.isExecutive || false,
        authLevel: userDetail.authLevel || 5,
        isLoginBlocked: userDetail.isLoginBlocked || false,
        timezone: userDetail.timezone || 'Asia/Seoul',
        language: userDetail.language || 'ko',
        isActive: userDetail.isActive || true,
        passwordChangeRequired: userDetail.passwordChangeRequired || false
      });

      // 역할 선택 상태 설정
      if (userDetail.roles && userDetail.roles.length > 0) {
        const roleIds = userDetail.roles.map(role => role.roleId);
        setSelectedRoleIds(roleIds);
      } else {
        setSelectedRoleIds([]);
      }
    } catch (error) {
      console.error('사용자 상세 조회 실패:', error);
    }
  }, []);

  // ===============================
  // 모달 열릴 때 초기화
  // ===============================

  useEffect(() => {
    if (open) {
      fetchRoles();

      if (mode === 'create') {
        // 등록 모드: 폼 초기화
        setFormData({
          username: '',
          password: '',
          empNo: '',
          orgCode: '',
          accountStatus: 'ACTIVE',
          isAdmin: false,
          isExecutive: false,
          authLevel: 5,
          isLoginBlocked: false,
          timezone: 'Asia/Seoul',
          language: 'ko',
          isActive: true,
          passwordChangeRequired: true
        });
        setSelectedRoleIds([]);
        setIsEditing(true);
        setErrors({ username: '', password: '', empNo: '' });
      } else if (user) {
        // 상세 모드: 사용자 정보 로드
        fetchUserDetail(parseInt(user.id));
        setIsEditing(false);
        setErrors({ username: '', password: '', empNo: '' });
      }
    }
  }, [open, mode, user, fetchRoles, fetchUserDetail]);

  // ===============================
  // 입력 핸들러
  // ===============================

  const handleChange = useCallback((field: keyof UserFormData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 부서 선택 핸들러
  const handleOrgChange = useCallback((orgCode: string | null) => {
    setFormData(prev => ({
      ...prev,
      orgCode: orgCode || ''
    }));
  }, []);

  // 역할 체크박스 토글 핸들러
  const handleRoleToggle = useCallback((roleId: number) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  }, []);

  // ===============================
  // 폼 검증
  // ===============================

  const validateForm = useCallback((): boolean => {
    const newErrors = { username: '', password: '', empNo: '' };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요.';
      isValid = false;
    }

    if (mode === 'create' && !formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, mode]);

  // ===============================
  // 등록/수정 핸들러
  // ===============================

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        // 사용자 등록
        const request: CreateUserRequest = {
          username: formData.username,
          password: formData.password,
          empNo: formData.empNo || undefined,
          accountStatus: formData.accountStatus,
          isAdmin: formData.isAdmin ? 'Y' : 'N',
          isExecutive: formData.isExecutive ? 'Y' : 'N',
          authLevel: formData.authLevel,
          isLoginBlocked: formData.isLoginBlocked ? 'Y' : 'N',
          timezone: formData.timezone,
          language: formData.language,
          isActive: formData.isActive ? 'Y' : 'N',
          roleIds: selectedRoleIds
        };

        await createUser(request);
        alert('사용자가 성공적으로 등록되었습니다.');

        if (onRefresh) {
          await onRefresh();
        }
        onClose();

      } else if (user && isEditing) {
        // 사용자 수정
        const request: UpdateUserRequest = {
          empNo: formData.empNo || undefined,
          accountStatus: formData.accountStatus,
          passwordChangeRequired: formData.passwordChangeRequired ? 'Y' : 'N',
          isAdmin: formData.isAdmin ? 'Y' : 'N',
          isExecutive: formData.isExecutive ? 'Y' : 'N',
          authLevel: formData.authLevel,
          isLoginBlocked: formData.isLoginBlocked ? 'Y' : 'N',
          timezone: formData.timezone,
          language: formData.language,
          isActive: formData.isActive ? 'Y' : 'N',
          roleIds: selectedRoleIds
        };

        // 비밀번호 변경이 있는 경우
        if (formData.password.trim()) {
          request.newPassword = formData.password;
        }

        await updateUser(parseInt(user.id), request);
        alert('사용자 정보가 성공적으로 수정되었습니다.');

        if (onRefresh) {
          await onRefresh();
        }
        onClose();
      }
    } catch (error) {
      console.error('사용자 저장 실패:', error);
      alert(error instanceof Error ? error.message : '사용자 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, formData, user, isEditing, selectedRoleIds, validateForm, onRefresh, onClose]);

  // ===============================
  // 수정/취소 핸들러
  // ===============================

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && user) {
      // 상세 모드: 원래 데이터로 복원
      fetchUserDetail(parseInt(user.id));
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, user, fetchUserDetail, onClose]);

  // ===============================
  // 렌더링
  // ===============================

  const title = mode === 'create' ? '사용자 등록' : '사용자 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

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
      {/* 모달 헤더 - 테마 적용 */}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 기본 정보 섹션 */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            기본 정보
          </Typography>

          <Grid container spacing={2}>
            {/* 사용자명 */}
            <Grid item xs={6}>
              <TextField
                label="사용자명 *"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="로그인 ID"
                disabled={mode === 'detail'}
                required
                fullWidth
                size="small"
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>

            {/* 비밀번호 */}
            <Grid item xs={6}>
              <TextField
                label={mode === 'create' ? '비밀번호 *' : '새 비밀번호'}
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={mode === 'create' ? '비밀번호 입력' : '변경 시에만 입력'}
                disabled={isReadOnly}
                required={mode === 'create'}
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>

            {/* 직원번호 */}
            <Grid item xs={6}>
              <TextField
                label="직원번호"
                value={formData.empNo}
                onChange={(e) => handleChange('empNo', e.target.value)}
                placeholder="employees 테이블 연결용"
                disabled={isReadOnly}
                fullWidth
                size="small"
              />
            </Grid>

            {/* 부서 - OrganizationSelect 사용 */}
            <Grid item xs={6}>
              <OrganizationSelect
                value={formData.orgCode || null}
                onChange={handleOrgChange}
                label="부서"
                placeholder="부서를 선택하세요"
                disabled={isReadOnly}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          {/* 계정 설정 섹션 */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            계정 설정
          </Typography>

          <Grid container spacing={2}>
            {/* 계정 상태 */}
            <Grid item xs={6}>
              <TextField
                label="계정 상태"
                value={formData.accountStatus}
                onChange={(e) => handleChange('accountStatus', e.target.value)}
                select
                disabled={isReadOnly}
                fullWidth
                size="small"
              >
                <MenuItem value="ACTIVE">활성</MenuItem>
                <MenuItem value="LOCKED">잠금</MenuItem>
                <MenuItem value="SUSPENDED">정지</MenuItem>
                <MenuItem value="RESIGNED">퇴직</MenuItem>
              </TextField>
            </Grid>

            {/* 권한 레벨 */}
            <Grid item xs={6}>
              <TextField
                label="권한 레벨"
                type="number"
                value={formData.authLevel}
                onChange={(e) => handleChange('authLevel', parseInt(e.target.value) || 5)}
                disabled={isReadOnly}
                fullWidth
                size="small"
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>

            {/* 타임존 */}
            <Grid item xs={6}>
              <TextField
                label="타임존"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                select
                disabled={isReadOnly}
                fullWidth
                size="small"
              >
                <MenuItem value="Asia/Seoul">Asia/Seoul (GMT+09:00)</MenuItem>
                <MenuItem value="UTC">UTC (GMT+00:00)</MenuItem>
                <MenuItem value="America/New_York">America/New_York (GMT-05:00)</MenuItem>
              </TextField>
            </Grid>

            {/* 언어 */}
            <Grid item xs={6}>
              <TextField
                label="언어"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                select
                disabled={isReadOnly}
                fullWidth
                size="small"
              >
                <MenuItem value="ko">한국어</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* 체크박스 옵션들 */}
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isAdmin}
                    onChange={(e) => handleChange('isAdmin', e.target.checked)}
                    disabled={isReadOnly}
                    size="small"
                  />
                }
                label="관리자"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isExecutive}
                    onChange={(e) => handleChange('isExecutive', e.target.checked)}
                    disabled={isReadOnly}
                    size="small"
                  />
                }
                label="임원"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isLoginBlocked}
                    onChange={(e) => handleChange('isLoginBlocked', e.target.checked)}
                    disabled={isReadOnly}
                    size="small"
                  />
                }
                label="로그인 차단"
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    disabled={isReadOnly}
                    size="small"
                  />
                }
                label="활성화"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.passwordChangeRequired}
                    onChange={(e) => handleChange('passwordChangeRequired', e.target.checked)}
                    disabled={isReadOnly}
                    size="small"
                  />
                }
                label="비밀번호 변경 필요"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          {/* 역할 할당 섹션 */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            역할 할당 ({selectedRoleIds.length}개 선택)
          </Typography>

          <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
            {isLoadingRoles ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  역할 목록을 불러오는 중...
                </Typography>
              </Box>
            ) : availableRoles.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  등록된 역할이 없습니다.
                </Typography>
              </Box>
            ) : (
              <List dense>
                {availableRoles.map((role) => (
                  <ListItem
                    key={role.roleId}
                    sx={{
                      py: 0.5,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedRoleIds.includes(role.roleId)}
                        onChange={() => handleRoleToggle(role.roleId)}
                        disabled={isReadOnly}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={role.roleName}
                      secondary={role.roleCode}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </DialogContent>

      {/* 모달 푸터 - 버튼 */}
      <DialogActions sx={{ p: 1, gap: 1 }}>
        {mode === 'create' ? (
          <>
            <Button variant="outlined" onClick={onClose} disabled={loading || isSubmitting}>
              취소
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || isSubmitting}>
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </>
        ) : (
          <>
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={loading || isSubmitting}>
                  취소
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading || isSubmitting}>
                  {isSubmitting ? '저장 중...' : '저장'}
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
    </Dialog>
  );
};

export default UserFormModal;
