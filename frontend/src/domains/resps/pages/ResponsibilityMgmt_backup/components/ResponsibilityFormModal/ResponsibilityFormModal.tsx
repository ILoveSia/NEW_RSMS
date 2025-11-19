/**
 * 책무 등록/수정/상세 모달
 * DeliberativeFormModal 스타일 패턴 준수 (테마 적용, sx prop 사용)
 *
 * 주요 기능:
 * - 책무 기본 정보 입력 (직책 섹션, 책무 섹션, 책무세부내용 섹션, 관리의무 섹션)
 * - Accordion 구조 유지
 * - 등록/수정/상세조회 모드 지원
 */

import { getPositionDepartments, getPositionsByLedgerOrderId, type PositionDto } from '@/domains/resps/api/positionApi';
import {
  createManagementObligation,
  createResponsibilityDetail,
  deleteResponsibilityDetail,
  getManagementObligationsByDetailId,
  getResponsibility,
  getResponsibilityDetailsByResponsibilityId,
  saveAllResponsibilities,
  type CreateManagementObligationRequest,
  type CreateResponsibilityDetailRequest,
  type CreateResponsibilityRequest,
  type ManagementObligationDto as ManagementObligationDtoApi,
  type ResponsibilityDetailDto as ResponsibilityDetailDtoApi,
  type ResponsibilityDto
} from '@/domains/resps/api/responsibilityApi';
import { LedgerOrderComboBox } from '@/domains/resps/components/molecules/LedgerOrderComboBox';
import { getActiveCodeDetailsByGroup } from '@/domains/system/pages/CodeMgmt/api/codeMgmtApi';
import type { CodeDetail } from '@/domains/system/pages/CodeMgmt/types/codeMgmt.types';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import toast from '@/shared/utils/toast';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import type { ColDef } from 'ag-grid-community';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Responsibility } from '../../types/responsibility.types';

interface ResponsibilityFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  responsibility: Responsibility | null;
  onClose: () => void;
  onSave?: () => Promise<void>; // 더 이상 사용하지 않음 (향후 제거 예정)
  onUpdate?: (id: string) => Promise<void>; // 더 이상 사용하지 않음 (향후 제거 예정)
  loading?: boolean;
}

const ResponsibilityFormModal: React.FC<ResponsibilityFormModalProps> = ({
  open,
  mode,
  responsibility,
  onClose,
  loading = false
}) => {
  // 상태 관리
  const [ledgerOrderId, setLedgerOrderId] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<PositionDto | null>(null);
  const [availablePositions, setAvailablePositions] = useState<PositionDto[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // 직책별 부서 목록
  const [positionDepartments, setPositionDepartments] = useState<Array<{org_code: string; org_name: string}>>([]);

  // 책무 섹션 - 공통코드 및 행 데이터
  const [categoryOptions, setCategoryOptions] = useState<CodeDetail[]>([]); // 책무카테고리 옵션
  const [responsibilityOptions, setResponsibilityOptions] = useState<CodeDetail[]>([]); // 책무 옵션
  const [responsibilityRows, setResponsibilityRows] = useState<Array<{
    id: string;
    category: string;
    content: string;
    legal: string;
    isActive: string;
  }>>([]);

  // 책무 세부내용 섹션 - 행 데이터
  const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<string | null>(null); // 선택된 책무 ID
  const [detailRows, setDetailRows] = useState<Array<{
    id: string;
    responsibilityId: string;
    detailInfo: string;
    isActive: string;
  }>>([]);

  // 관리의무 섹션 - 공통코드 및 행 데이터
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null); // 선택된 책무세부 ID
  const [obligationMajorOptions, setObligationMajorOptions] = useState<CodeDetail[]>([]); // 관리의무 대분류
  const [obligationRows, setObligationRows] = useState<Array<{
    id: string;
    detailId: string;
    majorCat: string;
    obligationInfo: string;
    orgName: string; // "공통"일 때는 자동 설정, "고유"일 때는 선택한 부서명
    selectedOrgCode: string; // "고유"일 때 선택한 부서 코드 (저장용)
    isActive: string;
  }>>([]);

  // 모달 제목
  const modalTitle = useMemo(() => {
    return mode === 'create' ? '책무 등록' : '책무 상세';
  }, [mode]);

  // 읽기 전용 모드 (현재는 항상 편집 가능)
  const isReadOnly = false;

  /**
   * 공통코드 조회 (책무카테고리, 책무, 관리의무 대분류)
   */
  useEffect(() => {
    const fetchCommonCodes = async () => {
      try {
        // 책무카테고리 조회 (RSBT_OBLG_CLCD)
        const categories = await getActiveCodeDetailsByGroup('RSBT_OBLG_CLCD');
        setCategoryOptions(categories);

        // 책무 조회 (RSBT_OBLG_CD)
        const responsibilities = await getActiveCodeDetailsByGroup('RSBT_OBLG_CD');
        setResponsibilityOptions(responsibilities);

        // 관리의무 대분류 조회 (MGMT_OBLG_LCCD)
        const obligationMajor = await getActiveCodeDetailsByGroup('MGMT_OBLG_LCCD');
        setObligationMajorOptions(obligationMajor);
      } catch (error) {
        console.error('[ResponsibilityFormModal] 공통코드 조회 실패:', error);
        toast.error('공통코드를 불러오는데 실패했습니다.');
      }
    };

    if (open) {
      fetchCommonCodes();
    }
  }, [open]);

  /**
   * 원장차수 변경 시 직책 목록 조회
   */
  useEffect(() => {
    const fetchPositionsByLedger = async () => {
      if (!ledgerOrderId) {
        console.log('[ResponsibilityFormModal] 원장차수가 선택되지 않음. 직책 목록 초기화');
        setAvailablePositions([]);
        setSelectedPosition(null);
        return;
      }

      console.log('[ResponsibilityFormModal] 원장차수:', ledgerOrderId, '로 직책 목록 조회 시작');
      setIsLoadingPositions(true);
      try {
        const positionDtos = await getPositionsByLedgerOrderId(ledgerOrderId);
        console.log('[ResponsibilityFormModal] 직책 목록 조회 성공:', positionDtos.length, '개');
        setAvailablePositions(positionDtos);
      } catch (error) {
        console.error('[ResponsibilityFormModal] 직책 목록 조회 실패:', error);
        toast.error('직책 목록을 불러오는데 실패했습니다.');
        setAvailablePositions([]);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchPositionsByLedger();
  }, [ledgerOrderId]);

  /**
   * 상세 모드일 때 직책 목록이 로드되면 직책 선택
   */
  useEffect(() => {
    const selectPositionForDetail = async () => {
      if (mode !== 'detail' || !responsibility || availablePositions.length === 0) {
        return;
      }

      try {
        // responsibility 객체에서 responsibilityId 추출
        const responsibilityId = Number(responsibility.id);

        // 책무 마스터 데이터 조회하여 positionsId 가져오기
        const respData: ResponsibilityDto = await getResponsibility(responsibilityId);

        // availablePositions에서 해당 직책 찾기
        const position = availablePositions.find(p => p.positionsId === respData.positionsId);
        if (position) {
          console.log('[ResponsibilityFormModal] 직책 자동 선택:', position);
          setSelectedPosition(position);

          // 직책별 부서 목록 조회
          try {
            const departments = await getPositionDepartments(position.positionsId);
            console.log('[ResponsibilityFormModal] 부서 목록 조회 성공:', departments);
            setPositionDepartments(departments);
          } catch (error) {
            console.error('[ResponsibilityFormModal] 부서 목록 조회 실패:', error);
            setPositionDepartments([]);
          }
        }
      } catch (error) {
        console.error('[ResponsibilityFormModal] 직책 선택 실패:', error);
      }
    };

    selectPositionForDetail();
  }, [mode, responsibility, availablePositions]);

  /**
   * 상세 모드일 때 책무 데이터 로드
   */
  useEffect(() => {
    const loadResponsibilityDetail = async () => {
      console.log('[ResponsibilityFormModal] ===== useEffect 실행 =====');
      console.log('[ResponsibilityFormModal] mode:', mode);
      console.log('[ResponsibilityFormModal] responsibility:', responsibility);
      console.log('[ResponsibilityFormModal] open:', open);

      if (mode !== 'detail' || !responsibility || !open) {
        console.log('[ResponsibilityFormModal] 조건 불만족으로 로드 중단');
        return;
      }

      try {
        console.log('[ResponsibilityFormModal] ===== 책무 상세 데이터 로드 시작 =====');
        console.log('[ResponsibilityFormModal] 책무 상세 데이터 로드:', responsibility);

        const responsibilityId = Number(responsibility.id);

        // 1. 책무 마스터 데이터 조회
        const respData: ResponsibilityDto = await getResponsibility(responsibilityId);
        console.log('[ResponsibilityFormModal] 책무 마스터 데이터:', respData);

        // 원장차수와 직책 설정
        setLedgerOrderId(respData.ledgerOrderId);

        // 직책 정보는 원장차수 조회 후 availablePositions에서 찾아서 설정해야 함
        // (원장차수 변경 시 직책 목록이 로드되므로 다음 useEffect에서 처리)

        // 책무 섹션 행 데이터 설정 (중요!)
        const responsibilityRowData = {
          id: String(respData.responsibilityId),
          category: respData.responsibilityCat || '',
          content: respData.responsibilityInfo || '',
          legal: respData.responsibilityLegal || '',
          isActive: respData.isActive || 'Y'
        };
        setResponsibilityRows([responsibilityRowData]);
        setSelectedResponsibilityId(String(respData.responsibilityId));
        console.log('[ResponsibilityFormModal] 책무 행 데이터 설정:', responsibilityRowData);

        // 2. 책무세부내용 조회
        const details: ResponsibilityDetailDtoApi[] = await getResponsibilityDetailsByResponsibilityId(responsibilityId);
        console.log('[ResponsibilityFormModal] 책무세부내용 목록:', details);

        // 책무세부내용 행 데이터 설정
        const detailRowsData = details.map(detail => ({
          id: String(detail.responsibilityDetailId),
          responsibilityId: String(detail.responsibilityId),
          detailInfo: detail.responsibilityDetailInfo,
          isActive: detail.isActive
        }));
        setDetailRows(detailRowsData);

        // 첫 번째 책무세부를 자동 선택 (관리의무 그리드 표시용)
        if (detailRowsData.length > 0) {
          setSelectedDetailId(detailRowsData[0].id);
          console.log('[ResponsibilityFormModal] 첫 번째 책무세부 자동 선택:', detailRowsData[0].id);
        }

        // 3. 각 책무세부내용의 관리의무 조회
        const allObligations: Array<{
          id: string;
          detailId: string;
          majorCat: string;
          obligationInfo: string;
          orgName: string;
          selectedOrgCode: string;
          isActive: string;
        }> = [];

        for (const detail of details) {
          const obligations: ManagementObligationDtoApi[] = await getManagementObligationsByDetailId(detail.responsibilityDetailId);
          console.log(`[ResponsibilityFormModal] 책무세부 ${detail.responsibilityDetailId}의 관리의무:`, obligations);

          obligations.forEach(obl => {
            allObligations.push({
              id: String(obl.managementObligationId),
              detailId: String(obl.responsibilityDetailId),
              majorCat: obl.obligationMajorCatCd,
              obligationInfo: obl.obligationInfo,
              orgName: obl.orgName || '',
              selectedOrgCode: obl.orgCode,
              isActive: obl.isActive
            });
          });
        }
        // console.log('[ResponsibilityFormModal] ===== 관리의무 디버깅 =====');
        // console.log('[ResponsibilityFormModal] 전체 관리의무 개수:', allObligations.length);
        // console.log('[ResponsibilityFormModal] 전체 관리의무 데이터:', allObligations);
        // console.log('[ResponsibilityFormModal] 선택된 책무세부 ID:', detailRowsData.length > 0 ? detailRowsData[0].id : null);
        setObligationRows(allObligations);

        toast.success('책무 상세 정보를 불러왔습니다.');
      } catch (error) {
        console.error('[ResponsibilityFormModal] 책무 상세 데이터 로드 실패:', error);
        toast.error('책무 상세 정보를 불러오는데 실패했습니다.');
      }
    };

    loadResponsibilityDetail();
  }, [mode, responsibility, open]);

  // 닫기 시 폼 리셋
  const handleClose = useCallback(() => {
    setLedgerOrderId('');
    setSelectedPosition(null);
    setPositionDepartments([]);
    setResponsibilityRows([]);
    setDetailRows([]);
    setObligationRows([]);
    setSelectedResponsibilityId(null);
    setSelectedDetailId(null);
    onClose();
  }, [onClose]);

  /**
   * 직책 콤보박스 변경 핸들러
   */
  const handlePositionChange = useCallback(async (positionsId: number) => {
    try {
      const position = availablePositions.find(p => p.positionsId === positionsId);
      if (position) {
        console.log('[ResponsibilityFormModal] 직책 선택:', position);
        setSelectedPosition(position);

        // 직책별 부서 목록 조회
        try {
          const departments = await getPositionDepartments(positionsId);
          console.log('[ResponsibilityFormModal] 부서 목록 조회 성공:', departments);
          setPositionDepartments(departments);
        } catch (error) {
          console.error('[ResponsibilityFormModal] 부서 목록 조회 실패:', error);
          toast.error('부서 목록을 불러오는데 실패했습니다.');
          setPositionDepartments([]);
        }
      }
    } catch (error) {
      console.error('[ResponsibilityFormModal] 직책 선택 실패:', error);
      // 에러가 발생해도 모달이 깨지지 않도록 처리
    }
  }, [availablePositions]);

  /**
   * 책무 섹션 - "추가" 버튼 클릭 핸들러 (빈 행 추가)
   */
  const handleAddResponsibility = useCallback(() => {
    // 원장차수와 직책이 선택되어 있는지 확인
    if (!ledgerOrderId) {
      toast.warning('먼저 책무이행차수를 선택해주세요.');
      return;
    }
    if (!selectedPosition) {
      toast.warning('먼저 직책을 선택해주세요.');
      return;
    }

    // 빈 행 추가
    const newRow = {
      id: `temp-${Date.now()}`,
      category: '',
      content: '',
      legal: '',
      isActive: 'Y'
    };

    setResponsibilityRows(prev => [...prev, newRow]);
    toast.success('책무 행이 추가되었습니다. 셀을 클릭하여 편집하세요.', { autoClose: 2000 });
  }, [ledgerOrderId, selectedPosition]);

  /**
   * 책무 섹션 - 책무 행 삭제
   */
  const handleDeleteResponsibility = useCallback((id: string) => {
    setResponsibilityRows(prev => prev.filter(row => row.id !== id));
    toast.success('책무가 삭제되었습니다.');
  }, []);

  /**
   * 책무 섹션 - "저장" 버튼 클릭 핸들러
   * - 원장차수ID와 직책ID로 기존 책무를 삭제하고 새로운 책무를 저장
   */
  const handleSaveResponsibility = useCallback(async () => {
    // 유효성 검사
    if (!ledgerOrderId) {
      toast.warning('먼저 책무이행차수를 선택해주세요.');
      return;
    }
    if (!selectedPosition) {
      toast.warning('먼저 직책을 선택해주세요.');
      return;
    }
    if (responsibilityRows.length === 0) {
      toast.warning('저장할 책무가 없습니다. 먼저 책무를 추가해주세요.');
      return;
    }

    // 모든 행의 필수 필드 검증
    const invalidRows = responsibilityRows.filter(row =>
      !row.category || !row.content || !row.legal
    );
    if (invalidRows.length > 0) {
      toast.warning('책무카테고리, 책무, 관련근거는 필수 입력 항목입니다.');
      return;
    }

    try {
      // CreateResponsibilityRequest 배열로 변환
      const requests: CreateResponsibilityRequest[] = responsibilityRows.map(row => ({
        ledgerOrderId,
        positionsId: selectedPosition.positionsId,
        responsibilityCat: row.category,
        responsibilityCd: row.content,
        responsibilityInfo: row.content, // 책무코드를 책무정보로도 사용
        responsibilityLegal: row.legal,
        isActive: row.isActive
      }));

      // API 호출 - 저장된 책무 목록을 응답으로 받음
      const savedResponsibilities = await saveAllResponsibilities(ledgerOrderId, selectedPosition.positionsId, requests);

      toast.success('책무가 성공적으로 저장되었습니다.');

      // 저장 후 responsibilityRows의 ID를 실제 DB ID로 업데이트
      const oldToNewIdMap = new Map<string, string>();

      setResponsibilityRows(prev =>
        prev.map((row, index) => {
          const newId = String(savedResponsibilities[index].responsibilityId);
          oldToNewIdMap.set(row.id, newId);
          return {
            ...row,
            id: newId
          };
        })
      );

      // 선택된 책무 ID도 업데이트
      if (selectedResponsibilityId) {
        const newSelectedId = oldToNewIdMap.get(selectedResponsibilityId);
        if (newSelectedId) {
          setSelectedResponsibilityId(newSelectedId);
        }
      }

      // 책무세부 행의 responsibilityId도 업데이트
      setDetailRows(prev =>
        prev.map(detail => {
          const newRespId = oldToNewIdMap.get(detail.responsibilityId);
          return newRespId ? { ...detail, responsibilityId: newRespId } : detail;
        })
      );
    } catch (error) {
      console.error('[ResponsibilityFormModal] 책무 저장 실패:', error);
      toast.error('책무 저장에 실패했습니다.');
    }
  }, [ledgerOrderId, selectedPosition, responsibilityRows, selectedResponsibilityId]);

  /**
   * 책무 세부내용 섹션 - "추가" 버튼 클릭 핸들러
   */
  const handleAddDetail = useCallback(() => {
    if (!selectedResponsibilityId) {
      toast.warning('먼저 책무 섹션에서 책무를 선택해주세요.');
      return;
    }

    const newDetail = {
      id: `detail-temp-${Date.now()}`,
      responsibilityId: selectedResponsibilityId,
      detailInfo: '',
      isActive: 'Y'
    };

    setDetailRows(prev => [...prev, newDetail]);
    toast.success('책무 세부내용 행이 추가되었습니다. 셀을 클릭하여 편집하세요.', { autoClose: 2000 });
  }, [selectedResponsibilityId]);

  /**
   * 책무 세부내용 섹션 - 행 삭제
   * - 임시 ID인 경우: 로컬 상태에서만 삭제
   * - 실제 DB ID인 경우: API로 삭제 후 로컬 상태 업데이트
   */
  const handleDeleteDetail = useCallback(async () => {
    if (!selectedDetailId) {
      toast.warning('삭제할 책무 세부내용을 선택해주세요.');
      return;
    }

    try {
      // 임시 ID인지 확인 (detail-temp-로 시작)
      const isTempId = selectedDetailId.startsWith('detail-temp-');

      if (isTempId) {
        // 임시 데이터는 로컬에서만 삭제
        setDetailRows(prev => prev.filter(row => row.id !== selectedDetailId));
        setSelectedDetailId(null);
        toast.success('책무 세부내용이 삭제되었습니다.');
      } else {
        // 실제 DB 데이터는 API로 삭제
        await deleteResponsibilityDetail(Number(selectedDetailId));
        setDetailRows(prev => prev.filter(row => row.id !== selectedDetailId));
        setSelectedDetailId(null);
        toast.success('책무 세부내용이 삭제되었습니다.');
      }
    } catch (error) {
      console.error('[ResponsibilityFormModal] 책무 세부내용 삭제 실패:', error);
      toast.error('책무 세부내용 삭제에 실패했습니다.');
    }
  }, [selectedDetailId]);

  /**
   * 책무 세부내용 섹션 - "저장" 버튼 클릭 핸들러
   */
  const handleSaveDetail = useCallback(async () => {
    // 유효성 검사
    if (detailRows.length === 0) {
      toast.warning('저장할 책무 세부내용이 없습니다.');
      return;
    }

    // 모든 행의 필수 필드 검증
    const invalidRows = detailRows.filter(row => !row.detailInfo);
    if (invalidRows.length > 0) {
      toast.warning('책무 세부내용은 필수 입력 항목입니다.');
      return;
    }

    try {
      // 모든 행의 responsibilityId 검증
      const rowsWithoutResponsibilityId = detailRows.filter(row => !row.responsibilityId);
      if (rowsWithoutResponsibilityId.length > 0) {
        toast.warning('책무를 먼저 저장한 후 책무 세부내용을 저장해주세요.');
        return;
      }

      // 실제 API 호출로 책무 세부내용 저장
      console.log('[ResponsibilityFormModal] 책무 세부내용 저장:', detailRows);

      // 각 책무세부를 API로 저장 (각 행의 responsibilityId 사용)
      const savePromises = detailRows.map(row => {
        const request: CreateResponsibilityDetailRequest = {
          responsibilityId: Number(row.responsibilityId), // 각 행의 responsibilityId 사용
          responsibilityDetailInfo: row.detailInfo,
          isActive: row.isActive
        };
        console.log('[ResponsibilityFormModal] 책무세부 저장 요청:', request);
        return createResponsibilityDetail(request);
      });

      // 모든 저장이 완료될 때까지 대기
      const savedDetails = await Promise.all(savePromises);

      toast.success(`책무 세부내용이 저장되었습니다. (총 ${savedDetails.length}건)`);

      // 저장 후 detailRows의 ID를 실제 DB ID로 업데이트
      const oldToNewIdMap = new Map<string, string>();

      setDetailRows(prev =>
        prev.map((row, index) => {
          const newId = String(savedDetails[index].responsibilityDetailId);
          oldToNewIdMap.set(row.id, newId);
          return {
            ...row,
            id: newId
          };
        })
      );

      // 관리의무 행의 detailId도 업데이트 (중요!)
      setObligationRows(prev =>
        prev.map(obligation => {
          const newDetailId = oldToNewIdMap.get(obligation.detailId);
          return newDetailId ? { ...obligation, detailId: newDetailId } : obligation;
        })
      );

      // 선택된 detailId도 업데이트
      if (selectedDetailId) {
        const newSelectedId = oldToNewIdMap.get(selectedDetailId);
        if (newSelectedId) {
          setSelectedDetailId(newSelectedId);
        }
      }
    } catch (error) {
      console.error('[ResponsibilityFormModal] 책무 세부내용 저장 실패:', error);
      toast.error('책무 세부내용 저장에 실패했습니다.');
    }
  }, [detailRows, selectedResponsibilityId]);

  /**
   * 관리의무 섹션 - "추가" 버튼 클릭 핸들러
   */
  const handleAddObligation = useCallback(() => {
    if (!selectedDetailId) {
      toast.warning('먼저 책무 세부내용 섹션에서 세부내용을 선택해주세요.');
      return;
    }

    const newObligation = {
      id: `obligation-temp-${Date.now()}`,
      detailId: selectedDetailId,
      majorCat: '',
      obligationInfo: '',
      orgName: '',
      selectedOrgCode: '',
      isActive: 'Y'
    };

    setObligationRows(prev => [...prev, newObligation]);
    toast.success('관리의무 행이 추가되었습니다. 셀을 클릭하여 편집하세요.', { autoClose: 2000 });
  }, [selectedDetailId]);

  /**
   * 관리의무 섹션 - 행 삭제
   */
  const handleDeleteObligation = useCallback((id: string) => {
    setObligationRows(prev => prev.filter(row => row.id !== id));
    toast.success('관리의무가 삭제되었습니다.');
  }, []);

  /**
   * 관리의무 섹션 - "저장" 버튼 클릭 핸들러
   * - "공통": 모든 부서에 저장
   * - "고유": 선택한 부서 하나만 저장
   */
  const handleSaveObligation = useCallback(async () => {
    // 유효성 검사
    if (obligationRows.length === 0) {
      toast.warning('저장할 관리의무가 없습니다.');
      return;
    }

    // 모든 행의 필수 필드 검증
    for (const row of obligationRows) {
      // 책무세부내용 ID 검증 (필수!)
      if (!row.detailId) {
        toast.warning('책무 세부내용을 먼저 저장한 후 관리의무를 저장해주세요.');
        return;
      }

      if (!row.majorCat || !row.obligationInfo) {
        toast.warning('대분류, 관리의무는 필수 입력 항목입니다.');
        return;
      }

      // 대분류 확인
      const majorCat = obligationMajorOptions.find(o => o.detailCode === row.majorCat);

      // "고유"일 경우 부서 선택 필수
      if (majorCat?.detailName === '고유') {
        if (!row.orgName || !row.selectedOrgCode) {
          toast.warning('대분류가 "고유"인 경우 부서을 선택해야 합니다.');
          return;
        }
      }
    }

    try {
      // 저장할 관리의무 데이터 준비
      const obligationsToSave: Array<{
        detailId: string;
        majorCat: string;
        obligationInfo: string;
        orgCode: string;
        orgName: string;
        isActive: string;
      }> = [];

      for (const row of obligationRows) {
        const majorCat = obligationMajorOptions.find(o => o.detailCode === row.majorCat);

        if (majorCat?.detailName === '공통') {
          // "공통"일 경우: 모든 부서에 저장
          if (positionDepartments.length === 0) {
            toast.warning('직책에 연결된 부서이 없습니다.');
            return;
          }

          positionDepartments.forEach(dept => {
            obligationsToSave.push({
              detailId: row.detailId,
              majorCat: row.majorCat,
              obligationInfo: row.obligationInfo,
              orgCode: dept.org_code,
              orgName: dept.org_name,
              isActive: row.isActive
            });
          });
        } else if (majorCat?.detailName === '고유') {
          // "고유"일 경우: 선택한 부서 하나만 저장
          obligationsToSave.push({
            detailId: row.detailId,
            majorCat: row.majorCat,
            obligationInfo: row.obligationInfo,
            orgCode: row.selectedOrgCode,
            orgName: row.orgName,
            isActive: row.isActive
          });
        }
      }

      // 실제 API 호출로 관리의무 저장
      console.log('[ResponsibilityFormModal] 관리의무 저장 데이터:', obligationsToSave);

      // 각 관리의무를 API로 저장
      const savePromises = obligationsToSave.map((obligation, index) => {
        // obligation_cd 생성: "R" + "YYYYMMDD" + "순번(9자리)"
        // 예: R20251027000000001
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        const sequence = String(index + 1).padStart(9, '0');
        const obligationCd = `R${dateStr}${sequence}`;

        const request: CreateManagementObligationRequest = {
          responsibilityDetailCd: obligation.detailId,
          obligationMajorCatCd: obligation.majorCat,
          obligationInfo: obligation.obligationInfo,
          orgCode: obligation.orgCode,
          isActive: obligation.isActive
        };
        console.log('[ResponsibilityFormModal] 관리의무 저장 요청:', request);
        return createManagementObligation(request);
      });

      // 모든 저장이 완료될 때까지 대기
      const savedObligations = await Promise.all(savePromises);
      console.log('[ResponsibilityFormModal] 관리의무 저장 완료:', savedObligations);

      toast.success(`관리의무가 저장되었습니다. (총 ${obligationsToSave.length}건)`);

      // 저장 후 저장된 데이터를 화면에 표시
      const savedRows = savedObligations.map(saved => ({
        id: saved.obligationCd,
        detailId: saved.responsibilityDetailCd,
        majorCat: saved.obligationMajorCatCd,
        obligationInfo: saved.obligationInfo,
        orgName: saved.orgName || '',
        selectedOrgCode: saved.orgCode,
        isActive: saved.isActive
      }));

      // 기존 행들과 병합 (중복 제거)
      setObligationRows(prev => {
        const existingIds = new Set(prev.map(row => row.id));
        const newRows = savedRows.filter(row => !existingIds.has(row.id));
        return [...prev, ...newRows];
      });
    } catch (error) {
      console.error('[ResponsibilityFormModal] 관리의무 저장 실패:', error);
      toast.error('관리의무 저장에 실패했습니다.');
    }
  }, [obligationRows, obligationMajorOptions, positionDepartments]);

  /**
   * 직책 정보 DataGrid에 표시할 데이터 (직책 + 부서명 조합)
   */
  const positionGridData = useMemo(() => {
    console.log('[positionGridData] selectedPosition:', selectedPosition);
    console.log('[positionGridData] positionDepartments:', positionDepartments);

    if (!selectedPosition) {
      console.log('[positionGridData] selectedPosition이 없어서 빈 배열 반환');
      return [];
    }

    try {
      // 부서 목록이 있으면 각 부서마다 행 생성
      if (positionDepartments && positionDepartments.length > 0) {
        const result = positionDepartments.map((dept, index) => ({
          id: `pos-dept-${index}`, // ID 추가 (BaseDataGrid의 getRowId용)
          positionsName: selectedPosition.positionsName || '-',
          hqName: selectedPosition.hqName || '-',
          orgName: dept?.org_name || '-'
        }));
        console.log('[positionGridData] 부서 목록 있음, 결과:', result);
        return result;
      }

      // 부서 목록이 없으면 직책 정보만 표시
      const result = [{
        id: 'pos-single', // ID 추가 (BaseDataGrid의 getRowId용)
        positionsName: selectedPosition.positionsName || '-',
        hqName: selectedPosition.hqName || '-',
        orgName: '-'
      }];
      console.log('[positionGridData] 부서 목록 없음, 결과:', result);
      return result;
    } catch (error) {
      console.error('[ResponsibilityFormModal] positionGridData 생성 실패:', error);
      return [];
    }
  }, [selectedPosition, positionDepartments]);

  /**
   * 직책 정보 DataGrid 컬럼 정의
   */
  const positionColumns = useMemo<ColDef<any>[]>(() => [
    {
      field: 'positionsName',
      headerName: '직책',
      flex: 1,
      sortable: false
    },
    {
      field: 'hqName',
      headerName: '본부명',
      flex: 1,
      sortable: false
    },
    {
      field: 'orgName',
      headerName: '부서명',
      flex: 1,
      sortable: false
    }
  ], []);

  /**
   * 책무 DataGrid 컬럼 정의
   */
  const responsibilityColumns = useMemo<ColDef<any>[]>(() => {
    // 책무카테고리 옵션 (코드명)
    const categoryNames = categoryOptions.map(c => c.detailName);
    // 책무 옵션 (코드명)
    const contentNames = responsibilityOptions.map(r => r.detailName);

    return [
      {
        field: 'category',
        headerName: '책무카테고리',
        width: 180,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: categoryNames
        },
        valueGetter: (params) => {
          if (!params.data?.category) return '';
          return categoryOptions.find(c => c.detailCode === params.data.category)?.detailName || '';
        },
        valueSetter: (params) => {
          const selected = categoryOptions.find(c => c.detailName === params.newValue);
          if (selected && params.data) {
            params.data.category = selected.detailCode;
            return true;
          }
          return false;
        }
      },
      {
        field: 'content',
        headerName: '책무',
        width: 300,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: contentNames
        },
        valueGetter: (params) => {
          if (!params.data?.content) return '';
          return responsibilityOptions.find(r => r.detailCode === params.data.content)?.detailName || '';
        },
        valueSetter: (params) => {
          const selected = responsibilityOptions.find(r => r.detailName === params.newValue);
          if (selected && params.data) {
            params.data.content = selected.detailCode;
            return true;
          }
          return false;
        }
      },
      {
        field: 'legal',
        headerName: '관련근거',
        flex: 1,
        sortable: false,
        editable: !isReadOnly
      },
      {
        field: 'isActive',
        headerName: '사용여부',
        width: 100,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Y', 'N']
        }
      },
      {
        field: 'actions',
        headerName: '작업',
        width: 80,
        sortable: false,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteResponsibility(params.data.id)}
                disabled={isReadOnly}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
      }
    ];
  }, [categoryOptions, responsibilityOptions, isReadOnly, handleDeleteResponsibility]);

  /**
   * 책무 세부내용 DataGrid 컬럼 정의
   */
  const detailColumns = useMemo<ColDef<any>[]>(() => [
    {
      field: 'responsibilityId',
      headerName: '연결된 책무',
      width: 200,
      sortable: false,
      valueGetter: (params) => {
        if (!params.data?.responsibilityId) return '';
        // responsibilityRows에서 해당 ID의 책무명 찾기
        const resp = responsibilityRows.find(r => r.id === params.data.responsibilityId);
        if (!resp?.content) return '';
        return responsibilityOptions.find(r => r.detailCode === resp.content)?.detailName || '';
      }
    },
    {
      field: 'detailInfo',
      headerName: '책무 세부내용',
      flex: 1,
      sortable: false,
      editable: !isReadOnly
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: false,
      editable: !isReadOnly,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Y', 'N']
      }
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 80,
      sortable: false,
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteDetail(params.data.id)}
              disabled={isReadOnly}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    }
  ], [responsibilityRows, responsibilityOptions, isReadOnly, handleDeleteDetail]);

  /**
   * 선택된 책무세부에 해당하는 관리의무만 필터링
   */
  const filteredObligationRows = useMemo(() => {
    console.log('[ResponsibilityFormModal] ===== 필터링 디버깅 =====');
    console.log('[ResponsibilityFormModal] selectedDetailId:', selectedDetailId);
    console.log('[ResponsibilityFormModal] obligationRows 개수:', obligationRows.length);
    console.log('[ResponsibilityFormModal] obligationRows:', obligationRows);

    if (!selectedDetailId) {
      console.log('[ResponsibilityFormModal] selectedDetailId가 없어서 빈 배열 반환');
      return [];
    }

    const filtered = obligationRows.filter(row => {
      console.log(`[ResponsibilityFormModal] 비교: row.detailId(${row.detailId}) === selectedDetailId(${selectedDetailId}) ? ${row.detailId === selectedDetailId}`);
      return row.detailId === selectedDetailId;
    });

    console.log('[ResponsibilityFormModal] 필터링 결과:', filtered.length, '개');
    console.log('[ResponsibilityFormModal] 필터링된 데이터:', filtered);
    return filtered;
  }, [obligationRows, selectedDetailId]);

  /**
   * 관리의무 DataGrid 컬럼 정의
   */
  const obligationColumns = useMemo<ColDef<any>[]>(() => {
    // 대분류 옵션 (코드명)
    const majorNames = obligationMajorOptions.map(o => o.detailName);

    return [
      {
        field: 'detailId',
        headerName: '연결된 세부내용',
        width: 200,
        sortable: false,
        valueGetter: (params) => {
          if (!params.data?.detailId) return '';
          // detailRows에서 해당 ID의 세부내용 찾기
          const detail = detailRows.find(d => d.id === params.data.detailId);
          return detail?.detailInfo || '';
        }
      },
      {
        field: 'majorCat',
        headerName: '대분류',
        width: 150,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: majorNames
        },
        valueGetter: (params) => {
          if (!params.data?.majorCat) return '';
          return obligationMajorOptions.find(o => o.detailCode === params.data.majorCat)?.detailName || '';
        },
        valueSetter: (params) => {
          const selected = obligationMajorOptions.find(o => o.detailName === params.newValue);
          if (selected && params.data) {
            params.data.majorCat = selected.detailCode;
            return true;
          }
          return false;
        }
      },
      {
        field: 'obligationInfo',
        headerName: '관리의무',
        flex: 1,
        sortable: false,
        editable: !isReadOnly
      },
      {
        field: 'orgName',
        headerName: '부서명',
        width: 150,
        sortable: false,
        editable: (params) => {
          if (isReadOnly) return false;
          // 대분류가 "고유"일 때만 편집 가능
          const majorCatCode = params.data?.majorCat;
          const majorCat = obligationMajorOptions.find(o => o.detailCode === majorCatCode);
          return majorCat?.detailName === '고유';
        },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params: any) => {
          try {
            // 직책의 부서 목록을 콤보박스 옵션으로 제공
            const orgNames = (positionDepartments || []).map(d => d?.org_name || '').filter(Boolean);
            return {
              values: orgNames.length > 0 ? orgNames : ['선택 가능한 부서이 없습니다']
            };
          } catch (error) {
            console.error('[obligationColumns] cellEditorParams 에러:', error);
            return { values: [] };
          }
        },
        valueGetter: (params) => {
          if (!params.data) return '';
          const majorCatCode = params.data.majorCat;
          const majorCat = obligationMajorOptions.find(o => o.detailCode === majorCatCode);

          // "공통"일 경우 자동으로 "전체"로 표시
          if (majorCat?.detailName === '공통') {
            return '전체';
          }

          // "고유"일 경우 선택한 부서명 표시
          return params.data.orgName || '';
        },
        valueSetter: (params) => {
          try {
            if (params.data) {
              params.data.orgName = params.newValue;
              // 선택한 부서의 org_code 찾아서 저장
              const selectedDept = (positionDepartments || []).find(d => d?.org_name === params.newValue);
              if (selectedDept) {
                params.data.selectedOrgCode = selectedDept.org_code;
              }
              return true;
            }
            return false;
          } catch (error) {
            console.error('[obligationColumns] valueSetter 에러:', error);
            return false;
          }
        }
      },
      {
        field: 'isActive',
        headerName: '사용여부',
        width: 100,
        sortable: false,
        editable: !isReadOnly,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Y', 'N']
        }
      },
      {
        field: 'actions',
        headerName: '작업',
        width: 80,
        sortable: false,
        cellRenderer: (params: any) => {
          if (!params.data) return null;
          return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteObligation(params.data.id)}
                disabled={isReadOnly}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
      }
    ];
  }, [obligationMajorOptions, detailRows, positionDepartments, isReadOnly, handleDeleteObligation]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '600px'
        }
      }}
      aria-labelledby="responsibility-modal-title"
    >
      <DialogTitle
        id="responsibility-modal-title"
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
            {modalTitle}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            disabled={loading}
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ p: 3 }}>
        {/* 직책 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="position-section-content"
            id="position-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>📋 직책</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* 책무이행차수와 직책을 한 줄에 배치 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {/* 책무이행차수 (왼쪽) */}
                <LedgerOrderComboBox
                  value={ledgerOrderId}
                  onChange={(value) => setLedgerOrderId(value || '')}
                  label="책무이행차수"
                  required
                  disabled={isReadOnly || mode === 'detail'}
                  size="small"
                />

                {/* 직책 (오른쪽) */}
                <FormControl fullWidth size="small">
                  <InputLabel>직책 *</InputLabel>
                  <Select
                    value={selectedPosition?.positionsId || ''}
                    onChange={(e) => handlePositionChange(Number(e.target.value))}
                    label="직책 *"
                    disabled={isReadOnly || loading || isLoadingPositions || availablePositions.length === 0}
                  >
                    <MenuItem value="">선택하세요</MenuItem>
                    {availablePositions.map((position) => (
                      <MenuItem key={position.positionsId} value={position.positionsId}>
                        {position.positionsName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 직책 정보 DataGrid (부서명 포함) */}
              <Box sx={{ width: '100%', height: '180px' }}>
                <BaseDataGrid
                  data={positionGridData}
                  columns={positionColumns}
                  rowSelection="none"
                  pagination={false}
                  height="180px"
                  emptyMessage="직책을 선택하면 상세 정보가 표시됩니다."
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 책무 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="responsibility-section-content"
            id="responsibility-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>📌 책무</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {!isReadOnly && (
              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddResponsibility}
                  startIcon={<AddIcon />}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handleSaveResponsibility}
                  startIcon={<CheckIcon />}
                >
                  저장
                </Button>
              </Box>
            )}

            {/* 책무 목록 DataGrid - 셀 편집 가능, 행 선택 가능 */}
            <Box sx={{ width: '100%', height: '220px' }}>
              <BaseDataGrid
                data={responsibilityRows}
                columns={responsibilityColumns}
                rowSelection="single"
                pagination={false}
                height="220px"
                emptyMessage="등록된 책무가 없습니다. 추가 버튼을 눌러 책무를 등록하세요."
                onRowClick={(data) => {
                  if (data?.id) {
                    setSelectedResponsibilityId(data.id);
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 책무 세부내용 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="detail-section-content"
            id="detail-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>📝 책무 세부내용</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {!isReadOnly && (
              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddDetail}
                  startIcon={<AddIcon />}
                  disabled={!selectedResponsibilityId}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={handleDeleteDetail}
                  startIcon={<DeleteIcon />}
                  disabled={!selectedDetailId}
                >
                  삭제
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handleSaveDetail}
                  startIcon={<CheckIcon />}
                  disabled={detailRows.length === 0}
                >
                  저장
                </Button>
              </Box>
            )}
            {/* 책무 세부내용 목록 DataGrid - 셀 편집 가능, 행 선택 가능 */}
            <Box sx={{ width: '100%', height: '220px' }}>
              <BaseDataGrid
                data={detailRows}
                columns={detailColumns}
                rowSelection="single"
                pagination={false}
                height="220px"
                emptyMessage="등록된 책무 세부내용이 없습니다. 책무를 선택 후 추가 버튼을 눌러 세부내용을 등록하세요."
                onRowClick={(data) => {
                  if (data?.id) {
                    setSelectedDetailId(data.id);
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 관리의무 섹션 */}
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="management-section-content"
            id="management-section-header"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': { backgroundColor: '#eeeeee' },
              minHeight: '40px',
              '&.Mui-expanded': { minHeight: '40px' },
              '& .MuiAccordionSummary-content': { margin: '8px 0' }
            }}
          >
            <Typography fontWeight={600}>🔍 관리의무</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 1.5 }}>
            {!isReadOnly && (
              <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddObligation}
                  startIcon={<AddIcon />}
                  disabled={!selectedDetailId}
                >
                  추가
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handleSaveObligation}
                  startIcon={<CheckIcon />}
                  disabled={obligationRows.length === 0}
                >
                  저장
                </Button>
              </Box>
            )}
            {/* 관리의무 목록 DataGrid - 셀 편집 가능 */}
            <Box sx={{ width: '100%', height: '220px' }}>
              <BaseDataGrid
                data={filteredObligationRows}
                columns={obligationColumns}
                rowSelection="none"
                pagination={false}
                height="220px"
                emptyMessage="등록된 관리의무가 없습니다. 책무 세부내용을 선택 후 추가 버튼을 눌러 관리의무를 등록하세요."
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilityFormModal;
