/**
 * 코드관리 메인 페이지
 *
 * @description 공통코드 그룹 및 상세코드 관리를 위한 좌우 분할 레이아웃 페이지
 * @author Claude AI
 * @version 1.0.0
 * @created 2025-09-24
 *
 * @features
 * - 좌측: 코드 그룹 관리 (필터링, 목록, CRUD)
 * - 우측: 선택된 그룹의 상세코드 관리 (목록, CRUD, 순서변경)
 * - PositionMgmt.tsx 표준 템플릿 pageHeader 스타일 적용
 * - ApprovalLine 좌우 분할 레이아웃 패턴 적용
 */

import {
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Code as CodeIcon,
  Delete as DeleteIcon,
  GetApp as ExcelIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

// 공통 컴포넌트
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { ColDef } from 'ag-grid-community';

// 타입 및 상수 import
import type {
  CodeDetail,
  CodeFilters,
  CodeGroup,
  CodeModalState,
  SplitLayoutState
} from './types/codeMgmt.types';

import {
  CATEGORY_COLOR_MAP,
  CATEGORY_OPTIONS,
  MOCK_CODE_DETAILS,
  MOCK_CODE_GROUPS
} from './types/codeMgmt.types';

// API import
import * as codeMgmtApi from './api/codeMgmtApi';

// 스타일 import
import styles from './CodeMgmt.module.scss';

/**
 * 코드관리 메인 컴포넌트
 */
const CodeMgmt: React.FC = () => {
  // ===============================
  // State Management
  // ===============================

  // 필터 상태
  const [filters, setFilters] = useState<CodeFilters>({
    groupCode: '',
    category: '',
    searchKeyword: '',
    isActive: ''
  });

  // 분할 레이아웃 상태
  const [layoutState, setLayoutState] = useState<SplitLayoutState>({
    selectedCodeGroup: null,
    leftLoading: false,
    rightLoading: false
  });

  // 모달 상태
  const [modalState, setModalState] = useState<CodeModalState>({
    groupModal: false,
    detailModal: false,
    mode: 'create',
    groupData: null,
    detailData: null
  });

  // 데이터 상태
  const [codeGroups, setCodeGroups] = useState<CodeGroup[]>([]);
  const [codeDetails, setCodeDetails] = useState<CodeDetail[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 선택된 행 상태
  const [selectedGroups, setSelectedGroups] = useState<CodeGroup[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<CodeDetail[]>([]);

  // ===============================
  // Computed Values
  // ===============================

  // 필터링된 코드 그룹
  const filteredGroups = useMemo(() => {
    return codeGroups.filter(group => {
      if (filters.category && group.category !== filters.category) return false;
      if (filters.isActive && group.isActive !== filters.isActive) return false;
      if (filters.searchKeyword) {
        const keyword = filters.searchKeyword.toLowerCase();
        return (
          group.groupName.toLowerCase().includes(keyword) ||
          group.groupCode.toLowerCase().includes(keyword) ||
          (group.description && group.description.toLowerCase().includes(keyword))
        );
      }
      return true;
    });
  }, [codeGroups, filters]);

  // 선택된 그룹의 상세코드
  const selectedGroupDetails = useMemo(() => {
    if (!layoutState.selectedCodeGroup) return [];
    return codeDetails.filter(detail =>
      detail.groupCode === layoutState.selectedCodeGroup?.groupCode
    );
  }, [codeDetails, layoutState.selectedCodeGroup]);

  // 통계 정보
  const statistics = useMemo(() => {
    const totalGroups = codeGroups.length;
    const activeGroups = codeGroups.filter(g => g.isActive === 'Y').length;
    const selectedGroupDetailCount = selectedGroupDetails.length;
    const activeDetails = selectedGroupDetails.filter(d => d.isActive === 'Y').length;

    return {
      totalGroups,
      activeGroups,
      selectedGroupDetailCount,
      activeDetails
    };
  }, [codeGroups, selectedGroupDetails]);


  // ===============================
  // Column Definitions
  // ===============================

  // 코드 그룹 컬럼 (인라인 편집 가능)
  const groupColumns = useMemo<ColDef<CodeGroup>[]>(() => [
    {
      field: 'sortOrder',
      headerName: '순서',
      width: 80,
      sortable: true,
      type: 'number',
      editable: false, // 자동 증가이므로 편집 불가
    },
    {
      field: 'category',
      headerName: '구분',
      width: 120,
      sortable: true,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: CATEGORY_OPTIONS.map(opt => opt.value)
      },
      cellRenderer: (params: any) => (
        <Chip
          label={params.value}
          size="small"
          style={{
            backgroundColor: CATEGORY_COLOR_MAP[params.value as keyof typeof CATEGORY_COLOR_MAP],
            color: 'white'
          }}
        />
      )
    },
    {
      field: 'groupCode',
      headerName: '그룹코드',
      width: 120,
      sortable: true,
      editable: true,
    },
    {
      field: 'groupName',
      headerName: '그룹코드명',
      width: 180,
      sortable: true,
      editable: true,
    },
    {
      field: 'description',
      headerName: '설명',
      width: 200,
      sortable: false,
      editable: true,
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 100,
      sortable: true,
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
      valueGetter: (params: any) => params.data?.isActive === 'Y',
      valueSetter: (params: any) => {
        const newValue = params.newValue ? 'Y' : 'N';
        params.data.isActive = newValue;
        return true;
      }
    }
  ], []);

  // 상세코드 컬럼 (인라인 편집 가능)
  const detailColumns = useMemo<ColDef<CodeDetail>[]>(() => [
    {
      field: 'sortOrder',
      headerName: '순서',
      width: 60,
      sortable: true,
      type: 'number',
      editable: false, // 자동 증가이므로 편집 불가
    },
    {
      field: 'detailCode',
      headerName: '코드',
      width: 100,
      sortable: true,
      editable: true,
    },
    {
      field: 'detailName',
      headerName: '코드명',
      width: 150,
      sortable: true,
      editable: true,
    },
    {
      field: 'description',
      headerName: '설명',
      width: 130,
      sortable: false,
      editable: true,
    },
    {
      field: 'isActive',
      headerName: '사용여부',
      width: 90,
      sortable: true,
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
      valueGetter: (params: any) => params.data?.isActive === 'Y',
      valueSetter: (params: any) => {
        const newValue = params.newValue ? 'Y' : 'N';
        params.data.isActive = newValue;
        return true;
      }
    }
  ], []);

  // ===============================
  // Event Handlers
  // ===============================

  // 검색 필터 변경 (자동 필터링)
  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // 코드 그룹 목록 로드
  const loadCodeGroups = useCallback(async () => {
    setLayoutState(prev => ({ ...prev, leftLoading: true }));
    try {
      const groups = await codeMgmtApi.getAllCodeGroups();
      setCodeGroups(groups);
      setError(null);
    } catch (err) {
      console.error('코드 그룹 조회 실패:', err);
      setError('코드 그룹 조회에 실패했습니다.');
    } finally {
      setLayoutState(prev => ({ ...prev, leftLoading: false }));
    }
  }, []);

  // 그룹 선택
  const handleGroupSelect = useCallback(async (group: CodeGroup) => {
    setLayoutState(prev => ({
      ...prev,
      selectedCodeGroup: group,
      rightLoading: true
    }));

    try {
      const details = await codeMgmtApi.getCodeDetailsByGroup(group.groupCode);
      setCodeDetails(details);
      setError(null);
    } catch (err) {
      console.error('상세코드 조회 실패:', err);
      setError('상세코드 조회에 실패했습니다.');
      setCodeDetails([]);
    } finally {
      setLayoutState(prev => ({ ...prev, rightLoading: false }));
    }
  }, []);

  // 새로고침 (IconButton 클릭 시 검색조건으로 조회)
  const handleRefresh = useCallback(async () => {
    setLayoutState(prev => ({ ...prev, leftLoading: true }));
    try {
      // 검색조건이 있으면 searchCodeGroups API 호출, 없으면 getAllCodeGroups
      if (filters.searchKeyword || filters.category || filters.isActive) {
        const result = await codeMgmtApi.searchCodeGroups(
          filters.searchKeyword || undefined,
          filters.category || undefined,
          filters.isActive || undefined
        );
        setCodeGroups(result.content);
      } else {
        const groups = await codeMgmtApi.getAllCodeGroups();
        setCodeGroups(groups);
      }
      setError(null);
    } catch (err) {
      console.error('코드 그룹 조회 실패:', err);
      setError('코드 그룹 조회에 실패했습니다.');
    } finally {
      setLayoutState(prev => ({ ...prev, leftLoading: false }));
    }
  }, [filters]);

  // 그룹 추가
  const handleAddGroup = useCallback(() => {
    // 현재 최대 순서 찾기
    const maxOrder = codeGroups.length > 0
      ? Math.max(...codeGroups.map(g => g.sortOrder))
      : 0;

    // 임시 고유 ID 생성 (편집 중에도 변경되지 않음)
    const tempId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newGroup: CodeGroup = {
      status: 'NEW', // 새로 추가된 행은 'NEW' 상태
      groupCode: `NEW_${Date.now()}`,
      groupName: '',
      description: '',
      category: '시스템 공통',
      categoryCode: 'SYSTEM',
      systemCode: false,
      editable: true,
      sortOrder: maxOrder + 1, // 자동 증가
      isActive: 'Y',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
      // @ts-ignore - 임시 ID (타입에는 없지만 런타임에서 사용)
      _tempId: tempId
    };
    setCodeGroups(prev => [newGroup, ...prev]);
  }, [codeGroups]);

  // 상세 추가
  const handleAddDetail = useCallback(() => {
    if (!layoutState.selectedCodeGroup) return;

    // 현재 최대 순서 찾기
    const maxOrder = codeDetails.length > 0
      ? Math.max(...codeDetails.map(d => d.sortOrder))
      : 0;

    // 임시 고유 ID 생성 (편집 중에도 변경되지 않음)
    const tempId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newDetail: CodeDetail = {
      status: 'NEW', // 새로 추가된 행은 'NEW' 상태
      groupCode: layoutState.selectedCodeGroup.groupCode,
      detailCode: `NEW_${Date.now()}`,
      detailName: '',
      description: '',
      parentCode: undefined,
      levelDepth: 1,
      sortOrder: maxOrder + 1, // 자동 증가
      extAttr1: undefined,
      extAttr2: undefined,
      extAttr3: undefined,
      extraData: undefined,
      validFrom: undefined,
      validUntil: undefined,
      isActive: 'Y',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin',
      // @ts-ignore - 임시 ID (타입에는 없지만 런타임에서 사용)
      _tempId: tempId
    };
    setCodeDetails(prev => [newDetail, ...prev]);
  }, [layoutState.selectedCodeGroup, codeDetails]);

  // 그룹 셀 값 변경
  const handleGroupCellValueChanged = useCallback((event: any) => {
    const updatedGroup = event.data as CodeGroup;
    const rowNode = event.node;

    setCodeGroups(prev =>
      prev.map((group, index) => {
        // AG-Grid의 rowIndex를 사용하여 정확한 행 매칭
        if (rowNode && rowNode.rowIndex !== index) {
          return group;
        }

        // rowNode가 없는 경우 기존 방식 사용
        if (!rowNode && group.groupCode !== updatedGroup.groupCode) {
          return group;
        }

        // 기존 상태가 'NEW'면 'NEW' 유지, 그 외(undefined 포함)는 'UPDATE'로 변경
        const newStatus: 'NEW' | 'UPDATE' = group.status === 'NEW' ? 'NEW' : 'UPDATE';

        const updated: CodeGroup = {
          ...updatedGroup,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          // @ts-ignore - 임시 ID 보존
          _tempId: (group as any)._tempId
        };

        console.log('그룹 수정됨:', {
          groupCode: updated.groupCode,
          field: event.colDef?.field,
          oldValue: event.oldValue,
          newValue: event.newValue,
          status: newStatus,
          rowIndex: rowNode?.rowIndex,
          _tempId: (updated as any)._tempId
        });

        return updated;
      })
    );
  }, []);

  // 상세 셀 값 변경
  const handleDetailCellValueChanged = useCallback((event: any) => {
    const updatedDetail = event.data as CodeDetail;
    const rowNode = event.node;
    const field = event.colDef?.field;

    setCodeDetails(prev =>
      prev.map((detail, index) => {
        // AG-Grid의 rowIndex를 사용하여 정확한 행 매칭
        if (rowNode && rowNode.rowIndex !== index) {
          return detail;
        }

        // rowNode가 없는 경우 기존 방식 사용
        if (!rowNode && (detail.detailCode !== updatedDetail.detailCode || detail.groupCode !== updatedDetail.groupCode)) {
          return detail;
        }

        // 기존 상태가 'NEW'면 'NEW' 유지, 그 외(undefined 포함)는 'UPDATE'로 변경
        const newStatus: 'NEW' | 'UPDATE' = detail.status === 'NEW' ? 'NEW' : 'UPDATE';

        const updated: CodeDetail = {
          ...updatedDetail,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          // @ts-ignore - 임시 ID 보존
          _tempId: (detail as any)._tempId,
          // @ts-ignore - 원본 detailCode 보존 (detailCode 변경 시 UPDATE API에서 사용)
          _originalDetailCode: (detail as any)._originalDetailCode || (field === 'detailCode' ? event.oldValue : detail.detailCode)
        };

        console.log('상세 수정됨:', {
          groupCode: updated.groupCode,
          detailCode: updated.detailCode,
          originalDetailCode: (updated as any)._originalDetailCode,
          field: field,
          oldValue: event.oldValue,
          newValue: event.newValue,
          status: newStatus,
          rowIndex: rowNode?.rowIndex,
          _tempId: (updated as any)._tempId
        });

        return updated;
      })
    );
  }, []);

  // 그룹 저장 (신규=INSERT, 수정=UPDATE)
  const handleSaveGroups = useCallback(async () => {
    console.log('=== 저장 버튼 클릭 ===');
    console.log('전체 그룹 개수:', codeGroups.length);
    console.log('전체 그룹 데이터:', codeGroups.map(g => ({
      groupCode: g.groupCode,
      groupName: g.groupName,
      status: g.status,
      description: g.description
    })));

    // 상태가 'NEW' 또는 'UPDATE'인 행만 필터링
    const groupsToSave = codeGroups.filter(g => g.status === 'NEW' || g.status === 'UPDATE');

    console.log('저장할 그룹 개수:', groupsToSave.length);
    console.log('저장할 그룹:', groupsToSave);

    if (groupsToSave.length === 0) {
      alert('저장할 데이터가 없습니다.');
      return;
    }

    try {
      for (const group of groupsToSave) {
        if (group.status === 'NEW') {
          // INSERT
          await codeMgmtApi.createCodeGroup({
            groupCode: group.groupCode,
            groupName: group.groupName,
            description: group.description,
            category: group.category,
            categoryCode: group.categoryCode,
            systemCode: group.systemCode,
            editable: group.editable,
            sortOrder: group.sortOrder,
            isActive: group.isActive
          });
          console.log('그룹 생성 완료:', group.groupCode);
        } else if (group.status === 'UPDATE') {
          // UPDATE
          await codeMgmtApi.updateCodeGroup(group.groupCode, {
            groupName: group.groupName,
            description: group.description,
            category: group.category,
            sortOrder: group.sortOrder,
            isActive: group.isActive
          });
          console.log('그룹 수정 완료:', group.groupCode);
        }
      }

      // 저장 완료 후 데이터 다시 로드
      await loadCodeGroups();
      alert('저장되었습니다.');
    } catch (err) {
      console.error('그룹 저장 실패:', err);
      alert('저장에 실패했습니다.');
    }
  }, [codeGroups, loadCodeGroups]);

  // 그룹 선택 변경
  const handleGroupSelectionChange = useCallback((selectedRows: CodeGroup[]) => {
    setSelectedGroups(selectedRows);
    console.log('선택된 그룹:', selectedRows);
  }, []);

  // 그룹 삭제
  const handleDeleteGroups = useCallback(async () => {
    if (selectedGroups.length === 0) {
      alert('삭제할 데이터를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedGroups.length}개의 그룹을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      for (const group of selectedGroups) {
        // NEW 상태면 로컬에서만 삭제 (서버 전송 안함)
        if (group.status === 'NEW') {
          setCodeGroups(prev => prev.filter(g => g.groupCode !== group.groupCode));
          console.log('신규 그룹 삭제 (로컬):', group.groupCode);
        } else {
          // 기존 데이터는 서버 API 호출
          await codeMgmtApi.deleteCodeGroup(group.groupCode);
          console.log('그룹 삭제 완료:', group.groupCode);
        }
      }

      // 삭제 완료 후 데이터 다시 로드
      await loadCodeGroups();
      setSelectedGroups([]);
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('그룹 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  }, [selectedGroups, loadCodeGroups]);

  // 상세코드 저장 (신규=INSERT, 수정=UPDATE)
  const handleSaveDetails = useCallback(async () => {
    // 상태가 'NEW' 또는 'UPDATE'인 행만 필터링
    const detailsToSave = codeDetails.filter(d => d.status === 'NEW' || d.status === 'UPDATE');

    if (detailsToSave.length === 0) {
      alert('저장할 데이터가 없습니다.');
      return;
    }

    try {
      for (const detail of detailsToSave) {
        if (detail.status === 'NEW') {
          // INSERT
          await codeMgmtApi.createCodeDetail({
            groupCode: detail.groupCode,
            detailCode: detail.detailCode,
            detailName: detail.detailName,
            description: detail.description,
            parentCode: detail.parentCode,
            levelDepth: detail.levelDepth,
            sortOrder: detail.sortOrder,
            extAttr1: detail.extAttr1,
            extAttr2: detail.extAttr2,
            extAttr3: detail.extAttr3,
            extraData: detail.extraData,
            validFrom: detail.validFrom,
            validUntil: detail.validUntil,
            isActive: detail.isActive
          });
          console.log('상세코드 생성 완료:', detail.detailCode);
        } else if (detail.status === 'UPDATE') {
          // UPDATE - 원본 detailCode 사용 (detailCode가 변경되었을 수 있음)
          const originalDetailCode = (detail as any)._originalDetailCode || detail.detailCode;
          await codeMgmtApi.updateCodeDetail(detail.groupCode, originalDetailCode, {
            detailCode: detail.detailCode, // 변경된 detailCode 전달
            detailName: detail.detailName,
            description: detail.description,
            sortOrder: detail.sortOrder,
            extAttr1: detail.extAttr1,
            extAttr2: detail.extAttr2,
            extAttr3: detail.extAttr3,
            extraData: detail.extraData,
            validFrom: detail.validFrom,
            validUntil: detail.validUntil,
            isActive: detail.isActive
          });
          console.log('상세코드 수정 완료:', originalDetailCode, '->', detail.detailCode);
        }
      }

      // 저장 완료 후 데이터 다시 로드
      if (layoutState.selectedCodeGroup) {
        await handleGroupSelect(layoutState.selectedCodeGroup);
      }
      alert('저장되었습니다.');
    } catch (err) {
      console.error('상세코드 저장 실패:', err);
      alert('저장에 실패했습니다.');
    }
  }, [codeDetails, layoutState.selectedCodeGroup, handleGroupSelect]);

  // 상세 선택 변경
  const handleDetailSelectionChange = useCallback((selectedRows: CodeDetail[]) => {
    setSelectedDetails(selectedRows);
    console.log('선택된 상세코드:', selectedRows);
  }, []);

  // 상세 삭제
  const handleDeleteDetails = useCallback(async () => {
    if (selectedDetails.length === 0) {
      alert('삭제할 데이터를 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedDetails.length}개의 상세코드를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      for (const detail of selectedDetails) {
        // NEW 상태면 로컬에서만 삭제 (서버 전송 안함)
        if (detail.status === 'NEW') {
          setCodeDetails(prev => prev.filter(d =>
            d.groupCode !== detail.groupCode || d.detailCode !== detail.detailCode
          ));
          console.log('신규 상세코드 삭제 (로컬):', detail.detailCode);
        } else {
          // 기존 데이터는 서버 API 호출
          await codeMgmtApi.deleteCodeDetail(detail.groupCode, detail.detailCode);
          console.log('상세코드 삭제 완료:', detail.detailCode);
        }
      }

      // 삭제 완료 후 데이터 다시 로드
      if (layoutState.selectedCodeGroup) {
        await handleGroupSelect(layoutState.selectedCodeGroup);
      }
      setSelectedDetails([]);
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('상세코드 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  }, [selectedDetails, layoutState.selectedCodeGroup, handleGroupSelect]);

  // ===============================
  // Effects
  // ===============================

  // 초기 데이터 로드
  useEffect(() => {
    loadCodeGroups();
  }, [loadCodeGroups]);

  // 첫 번째 그룹 자동 선택
  useEffect(() => {
    if (filteredGroups.length > 0 && !layoutState.selectedCodeGroup) {
      handleGroupSelect(filteredGroups[0]);
    }
  }, [filteredGroups, layoutState.selectedCodeGroup, handleGroupSelect]);

  // ===============================
  // Render
  // ===============================

  return (
    <div className={styles.container}>
      {/* Page Header (PositionMgmt 표준 템플릿) */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <CodeIcon className={styles.headerIcon} />
            <div>
              <h1 className={styles.pageTitle}>코드관리</h1>
              <p className={styles.pageDescription}>
                시스템 공통코드 및 업무코드를 통합 관리합니다
              </p>
            </div>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <SettingsIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.totalGroups}</div>
                <div className={styles.statLabel}>전체 그룹</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CodeIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.activeGroups}</div>
                <div className={styles.statLabel}>사용중</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <AddIcon />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics.selectedGroupDetailCount}</div>
                <div className={styles.statLabel}>상세코드</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* 좌측 패널 - 코드 그룹 관리 */}
          <Grid item xs={12} md={7}>
            <Paper className={styles.leftPanel}>
              {/* 좌측 헤더 + 검색 필터 한줄 통합 */}
              <div className={styles.leftHeader}>
                <div className={styles.leftHeaderLeft}>
                  <Typography variant="h6" className={styles.sectionTitle}>
                    코드 그룹 목록
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="그룹코드, 그룹명 또는 설명을 입력하세요"
                    value={filters.searchKeyword}
                    onChange={(e) => handleFiltersChange({ searchKeyword: e.target.value })}
                    disabled={layoutState.leftLoading}
                    className={styles.searchField}
                  />
                  <FormControl size="small" className={styles.selectField}>
                    <Select
                      value={filters.category}
                      onChange={(e) => handleFiltersChange({ category: e.target.value })}
                      disabled={layoutState.leftLoading}
                      displayEmpty
                    >
                      <MenuItem value="">전체</MenuItem>
                      {CATEGORY_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    disabled={layoutState.leftLoading}
                    className={styles.refreshButton}
                  >
                    <RefreshIcon />
                  </IconButton>
                </div>
                <div className={styles.leftHeaderRight}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    className={styles.actionButton}
                    onClick={handleAddGroup}
                  >
                    추가
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    className={styles.actionButton}
                    onClick={handleSaveGroups}
                  >
                    저장
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    className={styles.actionButton}
                    onClick={handleDeleteGroups}
                  >
                    삭제
                  </Button>
                </div>
              </div>

              {/* 그룹 목록 그리드 */}
              <div className={styles.leftGrid}>
                {layoutState.leftLoading ? (
                  <Box p={2}>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} height={40} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  <BaseDataGrid
                    data={filteredGroups}
                    columns={groupColumns}
                    onRowClick={handleGroupSelect}
                    onCellValueChanged={handleGroupCellValueChanged}
                    onSelectionChange={handleGroupSelectionChange}
                    getRowId={(params) => {
                      // 임시 ID가 있으면 사용 (새로 추가된 행, 편집 중에도 변경되지 않음)
                      if ((params.data as any)._tempId) {
                        return (params.data as any)._tempId;
                      }
                      // 기존 행은 groupCode 사용
                      return params.data.groupCode;
                    }}
                    getRowStyle={(params: any) => {
                      if (params.data?.status === 'NEW') {
                        return { background: '#e3f2fd' }; // 신규: 연한 파란색
                      }
                      if (params.data?.status === 'UPDATE') {
                        return { background: '#fff3e0' }; // 수정: 연한 오렌지색
                      }
                      return undefined;
                    }}
                    height="calc(100vh - 290px)"
                    pagination={false}
                    rowSelection="multiple"
                    checkboxSelection={true}
                    headerCheckboxSelection={true}
                  suppressHorizontalScroll={false}
                  suppressColumnVirtualisation={false}
                  />
                )}
              </div>
            </Paper>
          </Grid>

          {/* 우측 패널 - 상세코드 관리 */}
          <Grid item xs={12} md={5}>
            <Paper className={styles.rightPanel}>
              {/* 우측 헤더 */}
              <div className={styles.rightHeader}>
                <div className={styles.selectedGroupInfo}>
                  {layoutState.selectedCodeGroup ? (
                    <>
                      <Typography variant="h6" className={styles.sectionTitle}>
                        [{layoutState.selectedCodeGroup.groupCode}] 상세코드 목록
                      </Typography>
                      <Chip
                        label={layoutState.selectedCodeGroup.category}
                        size="small"
                        style={{
                          backgroundColor: CATEGORY_COLOR_MAP[layoutState.selectedCodeGroup.category],
                          color: 'white',
                          marginLeft: '8px'
                        }}
                      />
                    </>
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      코드 그룹을 선택하세요
                    </Typography>
                  )}
                </div>
                <div className={styles.rightActions}>
                  <div className={styles.orderButtons}>
                    <IconButton size="small" className={styles.orderButton}>
                      <ArrowUpIcon />
                    </IconButton>
                    <IconButton size="small" className={styles.orderButton}>
                      <ArrowDownIcon />
                    </IconButton>
                  </div>
                  <div className={styles.actionButtons}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddIcon />}
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
                      onClick={handleAddDetail}
                    >
                      추가
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
                      onClick={handleSaveDetails}
                    >
                      저장
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      className={styles.actionButton}
                      disabled={!layoutState.selectedCodeGroup}
                      onClick={handleDeleteDetails}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>

              {/* 상세코드 목록 그리드 */}
              <div className={styles.rightGrid}>
                {!layoutState.selectedCodeGroup ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="info">
                      좌측에서 코드 그룹을 선택하면 상세코드 목록을 확인할 수 있습니다.
                    </Alert>
                  </Box>
                ) : layoutState.rightLoading ? (
                  <Box p={2}>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} height={40} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : selectedGroupDetails.length === 0 ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Alert severity="warning">
                      선택된 그룹에 등록된 상세코드가 없습니다.
                    </Alert>
                  </Box>
                ) : (
                  <BaseDataGrid
                    data={selectedGroupDetails}
                    columns={detailColumns}
                    onCellValueChanged={handleDetailCellValueChanged}
                    onSelectionChange={handleDetailSelectionChange}
                    getRowId={(params) => {
                      // 임시 ID가 있으면 사용 (새로 추가된 행, 편집 중에도 변경되지 않음)
                      if ((params.data as any)._tempId) {
                        return (params.data as any)._tempId;
                      }
                      // 기존 행은 groupCode + detailCode 조합 사용
                      return `${params.data.groupCode}_${params.data.detailCode}`;
                    }}
                    getRowStyle={(params: any) => {
                      if (params.data?.status === 'NEW') {
                        return { background: '#e3f2fd' }; // 신규: 연한 파란색
                      }
                      if (params.data?.status === 'UPDATE') {
                        return { background: '#fff3e0' }; // 수정: 연한 오렌지색
                      }
                      return undefined;
                    }}
                    height="calc(100vh - 290px)"
                    pagination={false}
                    rowSelection="multiple"
                    checkboxSelection={true}
                    headerCheckboxSelection={true}
                  suppressHorizontalScroll={false}
                  suppressColumnVirtualisation={false}
                  />
                )}
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default CodeMgmt;
