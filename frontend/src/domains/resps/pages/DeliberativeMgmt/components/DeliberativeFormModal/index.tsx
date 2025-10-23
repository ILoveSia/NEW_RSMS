/**
 * 회의체 등록/수정/상세 모달
 * PositionDualFormModal 표준 패턴 준수
 *
 * 주요 기능:
 * - 회의체 기본 정보 입력 (회의체명, 개최주기, 주요심의사항)
 * - 위원 추가/삭제 (위원장 필수 1명, 위원 다수)
 * - 등록/수정/상세조회 모드 지원
 * - BaseDataGrid 편집 기능 활용
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { Button } from '@/shared/components/atoms/Button';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import toast from '@/shared/utils/toast';
import {
  getPositionsByLedgerOrderId,
  type PositionDto
} from '@/domains/resps/api/positionApi';
import {
  createCommittee,
  updateCommittee,
  type CommitteeCreateRequest,
  type CommitteeUpdateRequest
} from '@/domains/resps/api/committeeApi';
import type {
  Deliberative,
  DeliberativeFormData,
  DeliberativeMember,
  DeliberativeFormModalProps
} from '../../types/deliberative.types';

const DeliberativeFormModal: React.FC<DeliberativeFormModalProps> = ({
  open,
  mode,
  deliberative,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {
  // 상태 관리
  const [ledgerOrderId, setLedgerOrderId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [holdingPeriod, setHoldingPeriod] = useState<string>('monthly');
  const [mainAgenda, setMainAgenda] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [members, setMembers] = useState<DeliberativeMember[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [availablePositions, setAvailablePositions] = useState<PositionDto[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  /**
   * 원장차수 변경 시 직책 목록 조회
   */
  useEffect(() => {
    const fetchPositionsByLedger = async () => {
      if (!ledgerOrderId) {
        setAvailablePositions([]);
        return;
      }

      setIsLoadingPositions(true);
      try {
        const positionDtos = await getPositionsByLedgerOrderId(ledgerOrderId);
        setAvailablePositions(positionDtos);
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

  /**
   * 폼 초기화
   * - 등록 모드: 빈 폼
   * - 상세 모드: deliberative 데이터 로드
   */
  useEffect(() => {
    if (mode === 'create') {
      // 등록 모드: 초기화
      setLedgerOrderId('');
      setName('');
      setHoldingPeriod('monthly');
      setMainAgenda('');
      setIsActive(true);
      setMembers([]);
      setIsEditing(true);
    } else if (mode === 'detail' && deliberative) {
      // 상세 모드: 데이터 로드
      setName(deliberative.name);
      setHoldingPeriod(deliberative.holdingPeriod);
      setMainAgenda(deliberative.mainAgenda);
      setIsActive(deliberative.isActive);

      // 위원 데이터 파싱 (실제로는 API로 받아와야 함)
      const parsedMembers: DeliberativeMember[] = [];

      // 위원장 추가
      if (deliberative.chairperson) {
        parsedMembers.push({
          id: `chairman-${Date.now()}`,
          deliberativeId: deliberative.id,
          seq: 1,
          type: 'chairman',
          name: deliberative.chairperson,
          position: '',
          organization: ''
        });
      }

      // 위원 추가 (콤마로 구분된 문자열 파싱)
      if (deliberative.members) {
        const memberNames = deliberative.members.split(', ').filter(m => m.trim());
        memberNames.forEach((memberName, index) => {
          parsedMembers.push({
            id: `member-${Date.now()}-${index}`,
            deliberativeId: deliberative.id,
            seq: index + 2,
            type: 'member',
            name: memberName.trim(),
            position: '',
            organization: ''
          });
        });
      }

      setMembers(parsedMembers);
      setIsEditing(false);
    }
  }, [mode, deliberative, open]);

  /**
   * 위원 추가 핸들러
   */
  const handleAddMember = useCallback(() => {
    const newMember: DeliberativeMember = {
      id: Date.now().toString(),
      deliberativeId: deliberative?.id || '',
      seq: members.length + 1,
      type: 'member',
      name: '',
      position: '',
      organization: ''
    };

    setMembers(prev => [...prev, newMember]);
  }, [members.length, deliberative]);

  /**
   * 위원 삭제 핸들러
   */
  const handleRemoveMember = useCallback((memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  }, []);

  /**
   * 폼 제출 처리 - 실제 API 호출
   */
  const handleSubmit = useCallback(async () => {
    // 검증
    if (!ledgerOrderId && mode === 'create') {
      toast.error('원장차수를 선택해주세요.');
      return;
    }

    if (!name.trim()) {
      toast.error('회의체명을 입력해주세요.');
      return;
    }

    if (!mainAgenda.trim()) {
      toast.error('주요심의사항을 입력해주세요.');
      return;
    }

    if (members.length === 0) {
      toast.error('최소 1명 이상의 위원을 추가해주세요.');
      return;
    }

    // 모든 위원이 직책을 선택했는지 확인
    const emptyMember = members.find(m => !m.position || !m.name.trim());
    if (emptyMember) {
      toast.error('모든 위원의 직책을 선택해주세요.');
      return;
    }

    // 위원장 확인
    const chairman = members.find(m => m.type === 'chairman');
    if (!chairman) {
      toast.error('위원장을 1명 지정해주세요.');
      return;
    }

    try {
      if (mode === 'create') {
        // 등록 모드: 회의체 생성
        const createRequest: CommitteeCreateRequest = {
          ledgerOrderId,
          committeesTitle: name,
          committeeFrequency: holdingPeriod,
          resolutionMatters: mainAgenda,
          isActive: isActive ? 'Y' : 'N',
          members: members.map(m => {
            // positionsId 찾기
            const position = availablePositions.find(p => p.positionsName === m.position);
            return {
              committeesType: m.type,
              positionsId: position?.positionsId || 0,
              positionsName: m.position
            };
          })
        };

        await createCommittee(createRequest);
        toast.success('회의체가 등록되었습니다.');
        onSave({
          name,
          holdingPeriod,
          mainAgenda,
          isActive,
          members
        });
        onClose();
      } else if (deliberative && isEditing) {
        // 수정 모드: 회의체 수정
        const updateRequest: CommitteeUpdateRequest = {
          committeesTitle: name,
          committeeFrequency: holdingPeriod,
          resolutionMatters: mainAgenda,
          isActive: isActive ? 'Y' : 'N',
          members: members.map(m => {
            // positionsId 찾기
            const position = availablePositions.find(p => p.positionsName === m.position);
            return {
              committeesType: m.type,
              positionsId: position?.positionsId || 0,
              positionsName: m.position
            };
          })
        };

        await updateCommittee(Number(deliberative.id), updateRequest);
        toast.success('회의체가 수정되었습니다.');
        onUpdate(deliberative.id, {
          name,
          holdingPeriod,
          mainAgenda,
          isActive,
          members
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('회의체 저장 실패:', error);
      const errorMessage = error.response?.data?.message || '회의체 저장에 실패했습니다.';
      toast.error(errorMessage);
    }
  }, [mode, ledgerOrderId, name, mainAgenda, holdingPeriod, isActive, members, deliberative, isEditing, availablePositions, onSave, onUpdate, onClose]);

  /**
   * 수정 모드 전환
   */
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  /**
   * 취소 처리
   */
  const handleCancel = useCallback(() => {
    if (mode === 'detail' && deliberative) {
      // 원래 데이터로 복원
      setName(deliberative.name);
      setHoldingPeriod(deliberative.holdingPeriod);
      setMainAgenda(deliberative.mainAgenda);
      setIsActive(deliberative.isActive);
      setIsEditing(false);
    } else {
      onClose();
    }
  }, [mode, deliberative, onClose]);

  const title = mode === 'create' ? '회의체 등록' : '회의체 상세';
  const isReadOnly = mode === 'detail' && !isEditing;

  /**
   * 위원 DataGrid 컬럼 정의 - 구분, 직책만 표시
   */
  const memberColumns = useMemo<ColDef<DeliberativeMember>[]>(() => {
    const columns: ColDef<DeliberativeMember>[] = [
      {
        field: 'type',
        headerName: '구분',
        width: 120,
        sortable: true,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['위원장', '위원']
        },
        valueGetter: (params) => params.data?.type === 'chairman' ? '위원장' : '위원',
        valueSetter: (params) => {
          if (params.data) {
            params.data.type = params.newValue === '위원장' ? 'chairman' : 'member';
            return true;
          }
          return false;
        }
      },
      {
        field: 'position',
        headerName: '직책',
        flex: 1,
        sortable: true,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: () => ({
          values: availablePositions.map(p => p.positionsName)
        }),
        valueSetter: (params) => {
          const selectedPosition = availablePositions.find(p => p.positionsName === params.newValue);
          if (selectedPosition && params.data) {
            params.data.position = selectedPosition.positionsName;
            params.data.name = selectedPosition.positionsName; // 직책명을 성명으로도 사용
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
        cellRenderer: (params: ICellRendererParams<DeliberativeMember>) => (
          <IconButton
            size="small"
            onClick={() => handleRemoveMember(params.data!.id!)}
            color="error"
            title="삭제"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )
      } as ColDef<DeliberativeMember>);
    }

    return columns;
  }, [isReadOnly, handleRemoveMember, availablePositions]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '600px',
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
          {/* 1번째 행: 원장차수, 개최주기 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* 원장차수 */}
            <Box>
              <LedgerOrderComboBox
                value={ledgerOrderId}
                onChange={(value) => setLedgerOrderId(value || '')}
                label="원장차수"
                required
                disabled={isReadOnly || mode === 'detail'}
                size="small"
              />
            </Box>

            {/* 개최주기 */}
            <FormControl fullWidth size="small" disabled={isReadOnly}>
              <InputLabel>개최주기</InputLabel>
              <Select
                value={holdingPeriod}
                onChange={(e) => setHoldingPeriod(e.target.value)}
                label="개최주기"
              >
                <MenuItem value="monthly">월</MenuItem>
                <MenuItem value="quarterly">분기</MenuItem>
                <MenuItem value="semiannually">반기</MenuItem>
                <MenuItem value="annually">년</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 2번째 행: 회의체명 */}
          <TextField
            label="회의체명"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isReadOnly}
            fullWidth
            size="small"
            placeholder="예: 리스크관리위원회"
          />

          {/* 3번째 행: 주요심의 의결 사항 */}
          <TextField
            label="주요심의 의결 사항"
            value={mainAgenda}
            onChange={(e) => setMainAgenda(e.target.value)}
            required
            disabled={isReadOnly}
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="회의체에서 다루는 주요 안건을 입력하세요"
          />

          {/* 4번째 행: 등록일자, 등록자, 사용여부 */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            {/* 등록일자 */}
            <TextField
              label="등록일자"
              value={deliberative?.registrationDate || new Date().toISOString().split('T')[0]}
              disabled
              fullWidth
              size="small"
              InputProps={{
                readOnly: true
              }}
            />

            {/* 등록자 */}
            <TextField
              label="등록자"
              value={deliberative?.registrar || '현재사용자'}
              disabled
              fullWidth
              size="small"
              InputProps={{
                readOnly: true
              }}
            />

            {/* 사용여부 */}
            <FormControl fullWidth size="small" disabled={isReadOnly}>
              <InputLabel>사용여부</InputLabel>
              <Select
                value={isActive ? 'Y' : 'N'}
                onChange={(e) => setIsActive(e.target.value === 'Y')}
                label="사용여부"
              >
                <MenuItem value="Y">사용</MenuItem>
                <MenuItem value="N">미사용</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 5번째: 위원 정보 섹션 */}

          {/* 위원 정보 섹션 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                위원 정보
              </Typography>

              {!isReadOnly && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddMember}
                  startIcon={<AddIcon />}
                  sx={{ minWidth: '80px', height: '32px' }}
                >
                  추가
                </Button>
              )}
            </Box>

            {/* 위원 목록 DataGrid */}
            <Box sx={{ width: '100%', height: '250px' }}>
              <BaseDataGrid
                data={members}
                columns={memberColumns}
                rowSelection="none"
                pagination={false}
                height="250px"
                emptyMessage="등록된 위원이 없습니다. 추가 버튼을 눌러 위원을 등록하세요."
              />
            </Box>

            {/* 안내 메시지 */}
            {!isReadOnly && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                ※ 위원장은 반드시 1명 지정해야 합니다
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

export default DeliberativeFormModal;
