/**
 * CEO 총괄관리의무 상세 모달 컴포넌트
 * PositionFormModal 표준 패턴을 기반으로 설계
 */

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from '@/shared/utils/toast';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { ceoManagementActivityColumns } from '../CeoMgmtDutyDataGrid/ceoMgmtDutyColumns';
import styles from './CeoMgmtDutyDetailModal.module.scss';

// Types
import type {
  CeoMgmtDuty,
  CeoMgmtDutyFormData,
  CeoManagementActivity,
  CeoManagementActivityFormData
} from '../../types/ceoMgmtDuty.types';

interface CeoMgmtDutyDetailModalProps {
  open: boolean;
  duty: CeoMgmtDuty | null;
  onClose: () => void;
  onUpdate: (id: string, formData: CeoMgmtDutyFormData) => Promise<void>;
  onActivityAdd: (dutyId: string, activity: CeoManagementActivityFormData) => Promise<void>;
  onActivityDelete: (dutyId: string, activityIds: string[]) => Promise<void>;
  loading?: boolean;
}

const CeoMgmtDutyDetailModal: React.FC<CeoMgmtDutyDetailModalProps> = ({
  open,
  duty,
  onClose,
  onUpdate,
  onActivityAdd,
  onActivityDelete,
  loading = false
}) => {
  const { t } = useTranslation('resps');

  // State
  const [activities, setActivities] = useState<CeoManagementActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<CeoManagementActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm<CeoMgmtDutyFormData>();

  // Initialize form data when duty changes
  useEffect(() => {
    if (duty) {
      setValue('dutyCode', duty.dutyCode);
      setValue('dutyName', duty.dutyName);
      setActivities(duty.managementActivityList);
      setSelectedActivities([]);
    }
  }, [duty, setValue]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setActivities([]);
      setSelectedActivities([]);
    }
  }, [open, reset]);

  // Form submit handler
  const onSubmit = useCallback(async (formData: CeoMgmtDutyFormData) => {
    if (!duty) return;

    try {
      await onUpdate(duty.id, formData);
      toast.success('CEO 총괄관리의무가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('수정에 실패했습니다.');
    }
  }, [duty, onUpdate]);

  // Activity handlers
  const handleActivityAdd = useCallback(async () => {
    if (!duty) return;

    // TODO: 실제 관리활동 추가 로직 구현
    const newActivity: CeoManagementActivityFormData = {
      executive: '',
      department: '',
      activityName: '',
      activityDetail: '',
      status: 'pending'
    };

    try {
      await onActivityAdd(duty.id, newActivity);
      toast.success('관리활동이 추가되었습니다.');
    } catch (error) {
      console.error('Activity add failed:', error);
      toast.error('관리활동 추가에 실패했습니다.');
    }
  }, [duty, onActivityAdd]);

  const handleActivityDelete = useCallback(async () => {
    if (!duty || selectedActivities.length === 0) {
      toast.warning('삭제할 관리활동을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택된 ${selectedActivities.length}개의 관리활동을 삭제하시겠습니까?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const activityIds = selectedActivities.map(activity => activity.id);
      await onActivityDelete(duty.id, activityIds);

      // Remove deleted activities from local state
      setActivities(prev => prev.filter(activity => !activityIds.includes(activity.id)));
      setSelectedActivities([]);

      toast.success(`${selectedActivities.length}개 관리활동이 삭제되었습니다.`);
    } catch (error) {
      console.error('Activity delete failed:', error);
      toast.error('관리활동 삭제에 실패했습니다.');
    }
  }, [duty, selectedActivities, onActivityDelete]);

  const handleDepartmentInfo = useCallback(() => {
    toast.info('부서 정보 자료 조회 기능은 개발 중입니다.');
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!duty) return;

    setActivityLoading(true);
    try {
      // TODO: 실제 데이터 새로고침 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      toast.success('데이터가 새로고침되었습니다.');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('새로고침에 실패했습니다.');
    } finally {
      setActivityLoading(false);
    }
  }, [duty]);

  // Grid handlers
  const handleActivitySelectionChange = useCallback((selected: CeoManagementActivity[]) => {
    setSelectedActivities(selected);
  }, []);

  if (!duty) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className={styles.modal}
      aria-labelledby="ceo-duty-detail-modal-title"
    >
      <DialogTitle className={styles.modalTitle}>
        <div className={styles.titleContent}>
          <FolderIcon className={styles.titleIcon} />
          <Typography variant="h6" component="h2">
            CEO 총괄 관리의무 상세
          </Typography>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.modalContent}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* 📋 기본 정보 섹션 */}
          <div className={styles.formSection}>
            <Typography variant="h6" className={styles.sectionTitle}>
              <FolderIcon />
              CEO 총괄 관리의무 상세
            </Typography>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <TextField
                  label="관리의무코드"
                  {...register('dutyCode')}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  size="small"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <TextField
                  label="관리의무명"
                  {...register('dutyName', {
                    required: '관리의무명은 필수 입력 항목입니다.',
                    maxLength: {
                      value: 1000,
                      message: '관리의무명은 1000자를 초과할 수 없습니다.'
                    }
                  })}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  size="small"
                  error={!!errors.dutyName}
                  helperText={errors.dutyName?.message}
                  className={styles.expandedTextArea}
                />
              </div>
            </div>
          </div>

          {/* 📊 관리활동 목록 섹션 */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                <FolderIcon />
                관리활동 목록
              </Typography>

              <div className={styles.actionButtons}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleActivityAdd}
                  size="small"
                  disabled={loading}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FolderIcon />}
                  onClick={handleDepartmentInfo}
                  size="small"
                  disabled={loading}
                >
                  부서 정보 자료
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleActivityDelete}
                  size="small"
                  disabled={selectedActivities.length === 0 || loading}
                  color="error"
                >
                  삭제
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  size="small"
                  disabled={activityLoading}
                >
                  재조회
                </Button>
              </div>
            </div>

            {/* 관리활동 데이터 그리드 */}
            <div className={styles.tableContainer}>
              <BaseDataGrid
                data={activities}
                columns={ceoManagementActivityColumns}
                loading={activityLoading}
                theme="alpine"
                onSelectionChange={handleActivitySelectionChange}
                height="400px"
                pagination={false}
                rowSelection="multiple"
                checkboxSelection={true}
                headerCheckboxSelection={true}
              />
            </div>
          </div>
        </form>
      </DialogContent>

      <DialogActions className={styles.modalActions}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
        >
          닫기
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || !isDirty}
          type="submit"
        >
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CeoMgmtDutyDetailModal;