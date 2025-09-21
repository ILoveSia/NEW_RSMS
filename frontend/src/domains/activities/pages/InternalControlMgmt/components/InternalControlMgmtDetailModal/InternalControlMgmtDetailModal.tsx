import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  Divider,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { InternalControlMgmt, InternalControlMgmtDetail } from '../../types/internalControlMgmt.types';
import styles from './InternalControlMgmtDetailModal.module.scss';

interface InternalControlMgmtDetailModalProps {
  open: boolean;
  item: InternalControlMgmt | null;
  onClose: () => void;
  loading?: boolean;
}

const InternalControlMgmtDetailModal: React.FC<InternalControlMgmtDetailModalProps> = ({
  open,
  item,
  onClose,
  loading = false
}) => {
  const { t } = useTranslation('activities');
  const [detail, setDetail] = useState<InternalControlMgmtDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 상세 정보 로드
  useEffect(() => {
    if (open && item) {
      loadDetailInfo(item.id);
    }
  }, [open, item]);

  const loadDetailInfo = useCallback(async (itemId: string) => {
    setDetailLoading(true);

    try {
      // TODO: 실제 API 호출로 상세 정보 로드
      // const response = await internalControlMgmtApi.getDetail(itemId);
      // setDetail(response.data);

      // 임시 데이터
      const detailData: InternalControlMgmtDetail = {
        ceoInfo: '김대표',
        managementActivityName: '내부통제 점검 활동',
        managementActivityDetail: '월별 내부통제 현황 점검 및 보고서 작성\n- 위험 요소 식별 및 평가\n- 통제 절차 준수 여부 확인\n- 개선 방안 도출 및 실행',
        internalControl: '내부통제시스템 A',
        internalControlDeviceDescription: '자동화된 내부통제 점검 도구\n- 실시간 모니터링 기능\n- 자동 알림 및 보고 기능\n- 위험 지표 대시보드 제공',
        unifiedNumber: 'IC2024001',
        url: 'https://internal-control.example.com',
        applicationDate: '2024.01.01'
      };

      setDetail(detailData);
    } catch (error) {
      console.error('상세 정보 로드 실패:', error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // 만료 상태 계산
  const getExpirationStatus = useCallback(() => {
    if (!item?.expirationDate) return { status: 'none', label: '만료일 없음', color: 'default' };

    const today = new Date();
    const expirationDate = new Date(item.expirationDate.replace(/\./g, '-'));
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { status: 'expired', label: '만료됨', color: 'error' };
    } else if (daysUntilExpiration <= 7) {
      return { status: 'expiring-soon', label: '만료 임박', color: 'warning' };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring-month', label: '만료 예정', color: 'info' };
    } else {
      return { status: 'active', label: '정상', color: 'success' };
    }
  }, [item]);

  const expirationStatus = getExpirationStatus();

  // BaseModal 액션 버튼 정의
  const modalActions: ModalAction[] = [
    {
      key: 'close',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose,
      disabled: loading || detailLoading
    }
  ];

  if (!item) return null;

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="내부통제장치 상세 정보"
      size="lg"
      actions={modalActions}
      loading={loading || detailLoading}
      className={styles.modal}
      contentClassName={styles.modalContent}
    >
      <div className={styles.container}>
        {/* 기본 정보 섹션 */}
        <Paper className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              📋 기본 정보
            </Typography>
            <Chip
              label={expirationStatus.label}
              color={expirationStatus.color as any}
              size="small"
              className={styles.statusChip}
            />
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoItem}>
                <span className={styles.label}>순번</span>
                <span className={styles.value}>{item.sequence}</span>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoItem}>
                <span className={styles.label}>부정명</span>
                <span className={styles.value}>{item.departmentName}</span>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={styles.infoItem}>
                <span className={styles.label}>관리활동명</span>
                <span className={styles.value}>{item.managementActivityName}</span>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={styles.infoItem}>
                <span className={styles.label}>내부통제장치명</span>
                <span className={styles.value}>{item.internalControlDeviceName}</span>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={styles.infoItem}>
                <span className={styles.label}>내부통제장치설명</span>
                <span className={styles.value}>{item.internalControlDeviceDescription}</span>
              </div>
            </Grid>
          </Grid>
        </Paper>

        {/* 날짜 정보 섹션 */}
        <Paper className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              📅 날짜 정보
            </Typography>
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <div className={styles.infoItem}>
                <span className={styles.label}>등록일자</span>
                <span className={styles.value}>{item.registrationDate}</span>
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div className={styles.infoItem}>
                <span className={styles.label}>적용일자</span>
                <span className={styles.value}>{item.applicationDate}</span>
              </div>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div className={styles.infoItem}>
                <span className={styles.label}>만료일자</span>
                <span className={`${styles.value} ${styles[expirationStatus.status]}`}>
                  {item.expirationDate}
                </span>
              </div>
            </Grid>
          </Grid>
        </Paper>

        {/* 상세 정보 섹션 */}
        {detail && (
          <Paper className={styles.section}>
            <div className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                🔍 상세 정보
              </Typography>
            </div>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>CEO 정보</span>
                  <span className={styles.value}>{detail.ceoInfo}</span>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>통일번호</span>
                  <span className={styles.value}>{detail.unifiedNumber}</span>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>관리활동상세</span>
                  <div className={styles.multilineValue}>
                    {detail.managementActivityDetail.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>내부통제</span>
                  <span className={styles.value}>{detail.internalControl}</span>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>내부통제장치설명 (상세)</span>
                  <div className={styles.multilineValue}>
                    {detail.internalControlDeviceDescription.split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>URL</span>
                  <span className={styles.value}>
                    {detail.url ? (
                      <a
                        href={detail.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        {detail.url}
                      </a>
                    ) : (
                      'URL 없음'
                    )}
                  </span>
                </div>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* 메타데이터 섹션 */}
        <Paper className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              ℹ️ 시스템 정보
            </Typography>
          </div>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoItem}>
                <span className={styles.label}>생성일시</span>
                <span className={styles.value}>{item.createdAt}</span>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoItem}>
                <span className={styles.label}>수정일시</span>
                <span className={styles.value}>{item.updatedAt}</span>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoItem}>
                <span className={styles.label}>생성자</span>
                <span className={styles.value}>{item.createdBy}</span>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoItem}>
                <span className={styles.label}>수정자</span>
                <span className={styles.value}>{item.updatedBy}</span>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className={styles.infoItem}>
                <span className={styles.label}>사용여부</span>
                <Chip
                  label={item.isActive ? '사용' : '미사용'}
                  color={item.isActive ? 'success' : 'default'}
                  size="small"
                />
              </div>
            </Grid>
          </Grid>
        </Paper>
      </div>
    </BaseModal>
  );
};

InternalControlMgmtDetailModal.displayName = 'InternalControlMgmtDetailModal';

export default InternalControlMgmtDetailModal;