/**
 * 직책겸직 등록/수정/상세 모달
 * LedgerFormModal, PositionFormModal 표준 패턴 준수
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Button } from '@/shared/components/atoms/Button';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import toast from '@/shared/utils/toast';
import {
  getPositionNamesForComboBox,
  getPositionsByLedgerOrderId,
  createPositionConcurrents,
  type CreatePositionConcurrentRequest,
  type PositionDto
} from '@/domains/resps/api/positionApi';
import type { PositionNameDto } from '@/domains/resps/components/molecules/PositionNameComboBox/types';
import type {
  PositionDual,
  PositionDualFormData,
  PositionDualPosition,
  PositionDualFormModalProps
} from '../../types/positionDual.types';

const PositionDualFormModal: React.FC<PositionDualFormModalProps> = ({
  open,
  mode,
  positionDual,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 상태 관리
  const [ledgerOrderId, setLedgerOrderId] = useState<string>('');
  const [positions, setPositions] = useState<PositionDualPosition[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<PositionNameDto[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // 원장차수 변경 시 해당 원장차수의 직책만 조회
  useEffect(() => {
    const fetchPositionsByLedger = async () => {
      if (!ledgerOrderId) {
        setAvailablePositions([]);
        return;
      }

      setIsLoadingPositions(true);
      try {
        // 원장차수별 직책 조회
        const positionDtos = await getPositionsByLedgerOrderId(ledgerOrderId);

        // PositionDto → PositionNameDto 형식으로 변환
        const positionNames: PositionNameDto[] = positionDtos.map(dto => ({
          detailCode: dto.positionsCd,
          detailName: dto.positionsName,
          detailValue: dto.positionsCd,
          sortOrder: 0,
          isActive: dto.isActive
        }));

        setAvailablePositions(positionNames);
      } catch (error) {
        console.error('직책 목록 조회 실패:', error);
        toast.error('직책 목록을 불러오는데 실패했습니다.');
        setAvailablePositions([]);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchPositionsByLedger();
  }, [ledgerOrderId]);

  // 폼 초기화
  useEffect(() => {
    if (mode === 'create') {
      setLedgerOrderId('');
      setPositions([]);
      setIsEditing(true);
    } else if (positionDual) {
      loadPositionsByCode(positionDual.concurrentStatusCode);
      setIsEditing(false);
    }
  }, [mode, positionDual, open]);

  // 겸직현황코드별 직책 목록 로드
  const loadPositionsByCode = useCallback(async (code: string) => {
    try {
      // TODO: API 호출로 해당 겸직현황코드의 직책들 로드
      // const response = await positionDualApi.getPositionsByCode(code);
      // setPositions(response.data);

      // 임시 데이터 (같은 겸직현황코드를 가진 직책들)
      const mockPositions: PositionDualPosition[] = [
        {
          id: '1',
          positionCode: 'R106',
          positionName: '오토금융본부장',
          hpName: '오토금융본부',
          isRepresentative: true,
          isActive: true
        },
        {
          id: '2',
          positionCode: 'R107',
          positionName: '오토채널본부장',
          hpName: '오토채널본부',
          isRepresentative: false,
          isActive: true
        }
      ];
      setPositions(mockPositions);
    } catch (error) {
      console.error('직책 목록 로드 실패:', error);
    }
  }, []);

  // 직책 추가 핸들러
  const handleAddPosition = useCallback(() => {
    const newPosition: PositionDualPosition = {
      id: Date.now().toString(),
      positionCode: '',
      positionName: '',
      hpName: '',
      isRepresentative: false,
      isActive: true
    };

    setPositions(prev => [...prev, newPosition]);
  }, []);

  // 직책 삭제 핸들러
  const handleRemovePosition = useCallback((positionId: string) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  }, []);

  // 폼 제출 처리
  const handleSubmit = useCallback(async () => {
    // 검증
    if (!ledgerOrderId) {
      alert('원장차수를 선택해주세요.');
      return;
    }

    if (positions.length === 0) {
      alert('최소 1개 이상의 직책을 추가해주세요.');
      return;
    }

    // 모든 행이 직책을 선택했는지 확인
    const emptyPosition = positions.find(p => !p.positionCode || !p.positionName);
    if (emptyPosition) {
      alert('모든 행의 직책을 선택해주세요.');
      return;
    }

    const representative = positions.find(p => p.isRepresentative);
    if (!representative) {
      alert('대표직책을 설정해주세요.');
      return;
    }

    if (mode === 'create') {
      // API 직접 호출
      const loadingToastId = toast.loading('겸직 관계를 등록 중입니다...');

      try {
        const request: CreatePositionConcurrentRequest = {
          ledgerOrderId,
          positions: positions.map(p => ({
            positionsCd: p.positionCode,
            positionsName: p.positionName,
            isRepresentative: p.isRepresentative ? 'Y' : 'N',
            hqCode: p.hpName || '',  // hpName을 hqCode로 사용 (임시)
            hqName: p.hpName || ''   // hpName을 hqName으로 사용 (임시)
          }))
        };

        await createPositionConcurrents(request);

        toast.update(loadingToastId, 'success', '겸직 관계가 성공적으로 등록되었습니다.');

        // 부모 컴포넌트에 알림 (목록 새로고침용)
        const formData: PositionDualFormData = {
          concurrentStatusCode: '',
          positions
        };
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('겸직 등록 실패:', error);
        toast.update(loadingToastId, 'error', error instanceof Error ? error.message : '겸직 관계 등록에 실패했습니다.');
      }
    } else if (positionDual && isEditing) {
      const formData: PositionDualFormData = {
        concurrentStatusCode: positionDual.concurrentStatusCode,
        positions
      };
      onUpdate(positionDual.id, formData);
    }
  }, [mode, ledgerOrderId, positions, positionDual, isEditing, onSave, onUpdate, onClose]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail' && positionDual) {
      loadPositionsByCode(positionDual.concurrentStatusCode);
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, positionDual, onClose]);

  const title = mode === 'create' ? '겸직 직책 등록' : '겸직 직책 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

  // 직책 DataGrid 컬럼 정의 (PositionFormModal 스타일 + 편집 기능)
  const positionColumns = useMemo<ColDef<PositionDualPosition>[]>(() => {
    const columns: ColDef<PositionDualPosition>[] = [
      {
        field: 'positionName',
        headerName: '직책',
        flex: 1,
        sortable: true,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: availablePositions.map((p: PositionNameDto) => p.detailName)
        },
        valueSetter: (params) => {
          const selectedPosition = availablePositions.find((p: PositionNameDto) => p.detailName === params.newValue);
          if (selectedPosition && params.data) {
            params.data.positionCode = selectedPosition.detailCode;
            params.data.positionName = selectedPosition.detailName;
            return true;
          }
          return false;
        }
      },
      {
        field: 'isRepresentative',
        headerName: '대표여부',
        width: 120,
        sortable: true,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Y', 'N']
        },
        valueGetter: (params) => params.data?.isRepresentative ? 'Y' : 'N',
        valueSetter: (params) => {
          if (params.data) {
            const newValue = params.newValue === 'Y';
            params.data.isRepresentative = newValue;
            return true;
          }
          return false;
        }
      }
    ];

    // 편집 모드일 때만 삭제 컬럼 추가
    if (!isReadOnly) {
      columns.push({
        headerName: '',
        width: 60,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<PositionDualPosition>) => (
          <IconButton
            size="small"
            onClick={() => handleRemovePosition(params.data!.id!)}
            color="error"
            title="삭제"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )
      } as ColDef<PositionDualPosition>);
    }

    return columns;
  }, [isReadOnly, handleRemovePosition, availablePositions]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '450px',
          maxWidth: '600px'
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
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 원장차수 선택 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              원장차수
            </Typography>
            <LedgerOrderComboBox
              value={ledgerOrderId}
              onChange={(value) => setLedgerOrderId(value || '')}
              label="원장차수"
              required
              disabled={isReadOnly}
            />
          </Box>

          {/* 직책 정보 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                직책 정보
              </Typography>

              {!isReadOnly && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddPosition}
                  startIcon={<AddIcon />}
                  sx={{ minWidth: '80px', height: '32px' }}
                >
                  추가
                </Button>
              )}
            </Box>

            {/* 직책 목록 DataGrid */}
            <Box sx={{ width: '100%', height: '200px' }}>
              <BaseDataGrid
                data={positions}
                columns={positionColumns}
                rowSelection="none"
                pagination={false}
                height="200px"
                emptyMessage="등록된 직책이 없습니다. 추가 버튼을 눌러 직책을 등록하세요."
              />
            </Box>

            {/* 안내 메시지 */}
            {!isReadOnly && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                ※ 대표직책은 반드시 1개 설정해야 합니다
              </Typography>
            )}
          </Box>
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
    </Dialog>
  );
};

export default PositionDualFormModal;
