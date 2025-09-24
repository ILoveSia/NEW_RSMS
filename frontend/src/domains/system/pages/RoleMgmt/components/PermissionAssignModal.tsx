/**
 * 권한 할당 모달 컴포넌트
 *
 * @description 역활에 권한을 할당하는 모달
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 */

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button } from '@/shared/components/atoms/Button';
import type { RoleWithPermissions } from '../../../types';

interface PermissionAssignModalProps {
  open: boolean;
  role?: RoleWithPermissions | null;
  onClose: () => void;
  loading?: boolean;
}

const PermissionAssignModal: React.FC<PermissionAssignModalProps> = ({
  open,
  role,
  onClose,
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        권한 할당 - {role?.roleName || ''}
      </DialogTitle>
      <DialogContent>
        <div style={{ padding: '20px 0' }}>
          {role && (
            <div style={{ marginBottom: '20px' }}>
              <h4>선택된 역활: {role.roleName}</h4>
              <p>현재 권한 수: {role.permissions?.length || 0}개</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4>사용 가능한 권한 목록:</h4>
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '16px',
              minHeight: '200px'
            }}>
              {/* 권한 체크박스 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  사용자 조회 권한 (USER_READ)
                </label>
                <label>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  사용자 수정 권한 (USER_WRITE)
                </label>
                <label>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  역활 관리 권한 (ROLE_MANAGE)
                </label>
                <label>
                  <input type="checkbox" style={{ marginRight: '8px' }} />
                  시스템 설정 권한 (SYSTEM_CONFIG)
                </label>
              </div>
            </div>
          </div>
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
          적용
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionAssignModal;