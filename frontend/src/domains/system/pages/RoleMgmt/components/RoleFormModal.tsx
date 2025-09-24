/**
 * 역활 등록/수정 모달 컴포넌트
 *
 * @description 역활 생성 및 수정을 위한 폼 모달
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import type {
  RoleWithPermissions,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleId
} from '../../../types';

interface RoleFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  role?: RoleWithPermissions | null;
  onClose: () => void;
  onSave: (formData: CreateRoleRequest) => Promise<void>;
  onUpdate: (id: RoleId, formData: UpdateRoleRequest) => Promise<void>;
  loading?: boolean;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  open,
  mode,
  role,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    roleCode: '',
    roleName: '',
    description: '',
    roleType: 'CUSTOM' as const,
    sortOrder: 0
  });

  // 모달 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && role) {
        setFormData({
          roleCode: role.roleCode || '',
          roleName: role.roleName || '',
          description: role.description || '',
          roleType: role.roleType || 'CUSTOM',
          sortOrder: role.sortOrder || 0
        });
      } else {
        setFormData({
          roleCode: '',
          roleName: '',
          description: '',
          roleType: 'CUSTOM',
          sortOrder: 0
        });
      }
    }
  }, [open, mode, role]);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.roleName.trim()) {
      alert('역활명을 입력해주세요.');
      return;
    }

    if (mode === 'create') {
      await onSave({
        roleCode: formData.roleCode || formData.roleName.toUpperCase(),
        roleName: formData.roleName,
        description: formData.description,
        roleType: formData.roleType,
        sortOrder: formData.sortOrder
      });
    } else if (role) {
      await onUpdate(role.id, {
        roleName: formData.roleName,
        description: formData.description,
        roleType: formData.roleType,
        sortOrder: formData.sortOrder
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? '새 역활 등록' : '역활 수정'}
      </DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
          <TextField
            label="역활 코드"
            value={formData.roleCode}
            onChange={handleChange('roleCode')}
            placeholder="역활 코드를 입력하세요"
            disabled={mode === 'edit'}
            fullWidth
          />
          <TextField
            label="역활명 *"
            value={formData.roleName}
            onChange={handleChange('roleName')}
            placeholder="역활명을 입력하세요"
            required
            fullWidth
          />
          <TextField
            label="설명"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="역활 설명을 입력하세요"
            multiline
            rows={3}
            fullWidth
          />
          <TextField
            label="역활 타입"
            value={formData.roleType}
            onChange={handleChange('roleType')}
            select
            fullWidth
          >
            <MenuItem value="SYSTEM">시스템</MenuItem>
            <MenuItem value="CUSTOM">사용자 정의</MenuItem>
            <MenuItem value="INHERITED">상속</MenuItem>
          </TextField>
          <TextField
            label="정렬 순서"
            value={formData.sortOrder}
            onChange={handleChange('sortOrder')}
            type="number"
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          취소
        </Button>
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

export default RoleFormModal;