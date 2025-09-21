import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  Divider,
  Alert
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { ColDef } from 'ag-grid-community';
import {
  ActivityExecution,
  ApprovalTargetActivity,
  ApprovalRequest
} from '../../types/activityExecution.types';
import styles from './ApprovalRequestModal.module.scss';

interface ApprovalRequestModalProps {
  open: boolean;
  selectedActivities: ActivityExecution[];
  onClose: () => void;
  loading?: boolean;
}

const ApprovalRequestModal: React.FC<ApprovalRequestModalProps> = ({
  open,
  selectedActivities,
  onClose,
  loading = false
}) => {
  const { t } = useTranslation('resps');

  // 승인 진행 상태
  const [approvalInProgress, setApprovalInProgress] = useState(false);

  // 결재요청내용 그리드 컬럼 정의 (250px에 맞게 극도로 축소)
  const targetActivityColumns = useMemo<ColDef<ApprovalTargetActivity>[]>(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 25,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: false,
      resizable: false
    },
    {
      field: 'activityName',
      headerName: '활동명',
      width: 50,
      cellStyle: { textAlign: 'left' },
      headerClass: 'ag-header-cell-left',
      sortable: true,
      resizable: true,
      tooltipField: 'activityName'
    },
    {
      field: 'internalControlName',
      headerName: '통제명',
      width: 40,
      cellStyle: { textAlign: 'left' },
      headerClass: 'ag-header-cell-left',
      sortable: true,
      resizable: true
    },
    {
      field: 'internalControlCheckName',
      headerName: '점검명',
      width: 35,
      cellStyle: { textAlign: 'left' },
      headerClass: 'ag-header-cell-left',
      sortable: true,
      resizable: true
    },
    {
      field: 'performer',
      headerName: '수행자',
      width: 30,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true
    },
    {
      field: 'isPerformed',
      headerName: '수행',
      width: 25,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      cellRenderer: (params: any) => {
        const isPerformed = params.value;
        const status = isPerformed ? '적정' : '';
        const color = isPerformed ? '#2e7d32' : '#666666';

        return (
          <span style={{ color, fontWeight: '600' }}>
            {status}
          </span>
        );
      }
    },
    {
      field: 'performanceResult',
      headerName: '결과',
      width: 25,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      cellRenderer: (params: any) => {
        const result = params.value || '';
        let color = '#666666';

        switch (result) {
          case '적정':
            color = '#2e7d32';
            break;
          case '부적정':
            color = '#c62828';
            break;
          case '보완필요':
            color = '#ef6c00';
            break;
        }

        return (
          <span style={{ color, fontWeight: '600' }}>
            {result || '-'}
          </span>
        );
      }
    }
  ], []);

  // 결재선 그리드 컬럼 정의 (250px에 맞게 극도로 축소)
  const approvalLineColumns = useMemo<ColDef<ApprovalRequest>[]>(() => [
    {
      field: 'sequence',
      headerName: '순번',
      width: 20,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: false,
      resizable: false
    },
    {
      field: 'stepName',
      headerName: '단계',
      width: 30,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true
    },
    {
      field: 'regulation',
      headerName: '구분',
      width: 25,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true
    },
    {
      field: 'approvalDate',
      headerName: '일시',
      width: 40,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true,
      cellRenderer: (params: any) => {
        return params.value || '-';
      }
    },
    {
      field: 'department',
      headerName: '부서',
      width: 30,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true
    },
    {
      field: 'positionTitle',
      headerName: '직위',
      width: 30,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true
    },
    {
      field: 'positionName',
      headerName: '직위명',
      width: 30,
      cellStyle: { textAlign: 'center' },
      headerClass: 'ag-header-cell-center',
      sortable: true,
      resizable: true
    },
    {
      field: 'opinion',
      headerName: '의견',
      width: 35,
      cellStyle: { textAlign: 'left' },
      headerClass: 'ag-header-cell-left',
      sortable: true,
      resizable: true,
      tooltipField: 'opinion',
      cellRenderer: (params: any) => {
        return params.value || '-';
      }
    }
  ], []);

  // 결재요청내용 데이터 변환 (이미지 기반)
  const targetActivityData = useMemo<ApprovalTargetActivity[]>(() => {
    return selectedActivities.map((activity, index) => ({
      sequence: index + 1,
      activityName: activity.activityName,
      internalControlName: '관리 실전', // TODO: 실제 데이터로 교체
      internalControlCheckName: '관리 실전', // TODO: 실제 데이터로 교체
      performer: activity.performer,
      isPerformed: activity.isPerformed,
      performanceResult: activity.performanceResult
    }));
  }, [selectedActivities]);

  // 결재선 데이터 (이미지 정확 매칭)
  const approvalLineData = useMemo<ApprovalRequest[]>(() => [
    {
      id: '1',
      activityId: '1',
      sequence: 0,
      stepName: '기안자',
      regulation: '기안',
      approvalDate: '2025-09-08 15:36:06',
      department: '팀가름',
      isRejected: false,
      positionTitle: '0000000',
      positionName: '관리자',
      opinion: '',
      approver: '관리자',
      approverId: '0000000',
      status: 'approved'
    },
    {
      id: '2',
      activityId: '1',
      sequence: 1,
      stepName: '부결',
      regulation: '',
      approvalDate: '',
      department: '감사부',
      isRejected: false,
      positionTitle: '0000003',
      positionName: 'FIT 3',
      opinion: '',
      approver: 'FIT 3',
      approverId: '0000003',
      status: 'pending'
    }
  ], []);

  // 승인 요청 처리
  const handleApprovalSubmit = useCallback(async () => {
    try {
      setApprovalInProgress(true);

      // TODO: 실제 승인 요청 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

      console.log('승인 요청:', {
        activities: selectedActivities,
        approvalLine: approvalLineData
      });

      onClose();

      // 성공 메시지 (부모 컴포넌트에서 처리)
    } catch (error) {
      console.error('승인 요청 실패:', error);
    } finally {
      setApprovalInProgress(false);
    }
  }, [selectedActivities, approvalLineData, onClose]);

  const modalActions: ModalAction[] = [
    {
      label: '취소',
      onClick: onClose,
      variant: 'outlined',
      disabled: loading || approvalInProgress
    },
    {
      label: '확인',
      onClick: handleApprovalSubmit,
      variant: 'contained',
      disabled: loading || approvalInProgress || selectedActivities.length === 0,
      loading: approvalInProgress
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="결재합목 검색"
      size="lg"
      fullWidth
      actions={modalActions}
      loading={loading}
    >
      <div className={styles.modalContent}>
        {/* 📊 결재요청내용 섹션 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              🎯 결재요청내용
            </Typography>
            <Typography variant="body2" color="textSecondary">
              (총 {selectedActivities.length}건)
            </Typography>
          </div>

          <div className={styles.gridContainer}>
            <BaseDataGrid
              data={targetActivityData}
              columns={targetActivityColumns}
              loading={loading}
              theme="alpine"
              height="150px"
              pagination={false}
              rowSelection="none"
              checkboxSelection={false}
              headerCheckboxSelection={false}
            />
          </div>
        </div>

        <Divider className={styles.sectionDivider} />

        {/* 🏛️ 결재선 섹션 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              🏛️ 결재선
            </Typography>
            <Typography variant="body2" color="textSecondary">

            </Typography>
          </div>

          <div className={styles.gridContainer}>
            <BaseDataGrid
              data={approvalLineData}
              columns={approvalLineColumns}
              loading={loading}
              theme="alpine"
              height="150px"
              pagination={false}
              rowSelection="none"
              checkboxSelection={false}
              headerCheckboxSelection={false}
            />
          </div>
        </div>

        {/* 📝 승인 요청 안내 */}
        <div className={styles.noticeSection}>
          <Typography variant="body2" color="primary" className={styles.noticeText}>
            * 결재 요청 시 정시 이후 응찰한 작업 이용에 추가됩니다.
          </Typography>
          <Typography variant="body2" color="textSecondary" className={styles.noticeSubText}>
            예: 순번1 결재 수 수정시 순번 1,2,3,4 순은 2,3,4로 변경<br/>
            예: 순번3 결재 수 수정시 순번 3,4 순은 2,3로 변경
          </Typography>
        </div>

        {/* 진행 상태 표시 */}
        {approvalInProgress && (
          <div className={styles.progressSection}>
            <Typography variant="body2" color="primary" className={styles.progressText}>
              승인 요청을 처리하고 있습니다...
            </Typography>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default ApprovalRequestModal;