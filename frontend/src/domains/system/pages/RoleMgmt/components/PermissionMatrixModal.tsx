/**
 * 권한 매트릭스 모달 컴포넌트
 *
 * @description 역활-권한 매트릭스 관리 모달
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import type { RoleWithPermissions } from '../../../types';

interface PermissionMatrixModalProps {
  open: boolean;
  roles: RoleWithPermissions[];
  onClose: () => void;
  loading?: boolean;
}

const PermissionMatrixModal: React.FC<PermissionMatrixModalProps> = ({
  open,
  roles,
  onClose,
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        권한 매트릭스 관리
      </DialogTitle>
      <DialogContent>
        {/* TODO: 권한 매트릭스 UI 구현 */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>권한 매트릭스 기능이 구현될 예정입니다.</p>
          <p>선택된 역활 수: {roles.length}</p>
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
          loading={loading}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionMatrixModal;