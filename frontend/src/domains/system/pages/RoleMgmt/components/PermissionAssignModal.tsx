/**
 * 권한 할당 모달 컴포넌트
 * - 역활에 권한을 할당하는 모달
 * - Real API 연동 (getAllPermissions, updateRolePermissions)
 *
 * @description 역활에 권한을 할당하는 모달
 * @author Claude AI
 * @version 2.0.0
 * @created 2025-09-24
 * @updated 2025-12-04
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Button } from '@/shared/components/atoms/Button';
import type { RoleWithPermissions } from '../../../types';
import {
  getAllPermissions,
  getPermissionsByRoleId,
  updateRolePermissions,
  type PermissionDto
} from '../../../api/roleApi';

interface PermissionAssignModalProps {
  open: boolean;
  role?: RoleWithPermissions | null;
  onClose: () => void;
  onComplete?: () => void;
  loading?: boolean;
}

/**
 * 권한 할당 모달
 * - 전체 권한 목록 조회
 * - 현재 역활에 할당된 권한 체크
 * - 권한 할당/해제 저장
 */
const PermissionAssignModal: React.FC<PermissionAssignModalProps> = ({
  open,
  role,
  onClose,
  onComplete,
  loading: externalLoading = false
}) => {
  // 전체 권한 목록
  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  // 선택된 권한 ID 목록
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());
  // 검색어
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  /**
   * 전체 권한 목록 조회
   */
  const fetchAllPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPermissions();
      setAllPermissions(data);
    } catch (err: any) {
      console.error('권한 목록 조회 실패:', err);
      setError('권한 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 현재 역활에 할당된 권한 조회
   */
  const fetchRolePermissions = useCallback(async (roleId: number) => {
    try {
      const data = await getPermissionsByRoleId(roleId);
      const ids = new Set(data.map(p => p.permissionId));
      setSelectedPermissionIds(ids);
    } catch (err: any) {
      console.error('역활 권한 조회 실패:', err);
      // 권한이 없는 경우 빈 Set 유지
      setSelectedPermissionIds(new Set());
    }
  }, []);

  /**
   * 모달 열릴 때 데이터 로딩
   */
  useEffect(() => {
    if (open) {
      setSearchKeyword('');
      fetchAllPermissions();
      if (role) {
        fetchRolePermissions(Number(role.id));
      }
    }
  }, [open, role, fetchAllPermissions, fetchRolePermissions]);

  /**
   * 권한 체크박스 변경 핸들러
   */
  const handlePermissionToggle = useCallback((permissionId: number) => {
    setSelectedPermissionIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  }, []);

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = useCallback(() => {
    const filteredPermissions = getFilteredPermissions();
    const allSelected = filteredPermissions.every(p => selectedPermissionIds.has(p.permissionId));

    if (allSelected) {
      // 전체 해제
      const newSet = new Set(selectedPermissionIds);
      filteredPermissions.forEach(p => newSet.delete(p.permissionId));
      setSelectedPermissionIds(newSet);
    } else {
      // 전체 선택
      const newSet = new Set(selectedPermissionIds);
      filteredPermissions.forEach(p => newSet.add(p.permissionId));
      setSelectedPermissionIds(newSet);
    }
  }, [selectedPermissionIds, allPermissions, searchKeyword]);

  /**
   * 필터링된 권한 목록
   */
  const getFilteredPermissions = useCallback(() => {
    if (!searchKeyword.trim()) {
      return allPermissions;
    }
    const keyword = searchKeyword.toLowerCase();
    return allPermissions.filter(
      p =>
        p.permissionCode.toLowerCase().includes(keyword) ||
        p.permissionName.toLowerCase().includes(keyword) ||
        (p.description && p.description.toLowerCase().includes(keyword))
    );
  }, [allPermissions, searchKeyword]);

  /**
   * 저장 핸들러
   */
  const handleSave = useCallback(async () => {
    if (!role) return;

    setSaving(true);
    try {
      await updateRolePermissions(Number(role.id), Array.from(selectedPermissionIds));
      onComplete?.();
    } catch (err: any) {
      console.error('권한 할당 실패:', err);
      setError('권한 할당에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [role, selectedPermissionIds, onComplete]);

  const filteredPermissions = getFilteredPermissions();
  const allSelected =
    filteredPermissions.length > 0 &&
    filteredPermissions.every(p => selectedPermissionIds.has(p.permissionId));
  const someSelected =
    filteredPermissions.some(p => selectedPermissionIds.has(p.permissionId)) && !allSelected;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        권한 할당 - {role?.roleName || ''}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* 역활 정보 */}
          {role && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                선택된 역활: [{role.roleCode}] {role.roleName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                현재 선택된 권한 수: {selectedPermissionIds.size}개
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* 검색 */}
          <TextField
            fullWidth
            size="small"
            placeholder="권한 코드, 권한명, 설명으로 검색"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 로딩 */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* 전체 선택 */}
              <Box sx={{ mb: 1, borderBottom: '1px solid #e0e0e0', pb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                    />
                  }
                  label={
                    <Typography variant="subtitle2" fontWeight="bold">
                      전체 선택 ({filteredPermissions.length}개)
                    </Typography>
                  }
                />
              </Box>

              {/* 권한 목록 */}
              <Box
                sx={{
                  maxHeight: 400,
                  overflow: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 1
                }}
              >
                {filteredPermissions.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    {searchKeyword ? '검색 결과가 없습니다.' : '등록된 권한이 없습니다.'}
                  </Typography>
                ) : (
                  filteredPermissions.map(permission => (
                    <Box
                      key={permission.permissionId}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        py: 0.5,
                        borderBottom: '1px solid #f0f0f0',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPermissionIds.has(permission.permissionId)}
                            onChange={() => handlePermissionToggle(permission.permissionId)}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              [{permission.permissionCode}] {permission.permissionName}
                            </Typography>
                            {permission.description && (
                              <Typography variant="caption" color="text.secondary">
                                {permission.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 0.5,
                                  py: 0.25,
                                  bgcolor:
                                    permission.businessPermission === 'Y'
                                      ? 'primary.light'
                                      : 'grey.200',
                                  borderRadius: 0.5,
                                  color:
                                    permission.businessPermission === 'Y'
                                      ? 'primary.contrastText'
                                      : 'text.secondary'
                                }}
                              >
                                {permission.businessPermission === 'Y' ? '업무' : '일반'}
                              </Typography>
                              {permission.mainBusinessPermission === 'Y' && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    px: 0.5,
                                    py: 0.25,
                                    bgcolor: 'success.light',
                                    borderRadius: 0.5,
                                    color: 'success.contrastText'
                                  }}
                                >
                                  본점기본
                                </Typography>
                              )}
                              {permission.executionPermission === 'Y' && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    px: 0.5,
                                    py: 0.25,
                                    bgcolor: 'warning.light',
                                    borderRadius: 0.5,
                                    color: 'warning.contrastText'
                                  }}
                                >
                                  영업점기본
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start', width: '100%', m: 0 }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={saving || externalLoading}>
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          loading={saving || externalLoading}
          disabled={loading}
        >
          적용 ({selectedPermissionIds.size}개)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionAssignModal;
