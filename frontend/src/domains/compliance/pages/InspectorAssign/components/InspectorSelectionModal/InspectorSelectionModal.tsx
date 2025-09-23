import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { BaseModal, ModalAction } from '@/shared/components/organisms/BaseModal';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import {
  Inspector,
  InspectorAssignment,
  InspectorAssignFormData,
  InspectorSelectionState
} from '../../types/inspectorAssign.types';
import { ColDef } from 'ag-grid-community';
import styles from './InspectorSelectionModal.module.scss';

interface InspectorSelectionModalProps {
  open: boolean;
  assignment: InspectorAssignment | null;
  onClose: () => void;
  onSelect: (assignment: InspectorAssignment, inspector: Inspector, formData: InspectorAssignFormData) => void;
  loading?: boolean;
}

const schema = yup.object({
  assignmentReason: yup
    .string()
    .max(200, '지정 사유는 200자 이내로 입력해주세요'),
  estimatedDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
});

// 점검자 목록 컬럼 정의
const inspectorColumns: ColDef<Inspector>[] = [
  {
    headerName: '선택',
    field: 'selected',
    width: 60,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    checkboxSelection: true,
    headerCheckboxSelection: false,
    suppressMenu: true,
    sortable: false,
    filter: false
  },
  {
    headerName: '이름',
    field: 'name',
    width: 100,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { fontWeight: '600', color: '#1976d2' }
  },
  {
    headerName: '부서',
    field: 'department',
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '직급',
    field: 'position',
    width: 100,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  },
  {
    headerName: '전문영역',
    field: 'specialtyArea',
    width: 120,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center',
    cellStyle: { color: '#7b1fa2', fontWeight: '500' }
  }
];

const InspectorSelectionModal: React.FC<InspectorSelectionModalProps> = ({
  open,
  assignment,
  onClose,
  onSelect,
  loading = false
}) => {
  const { t } = useTranslation('compliance');

  // State for inspector selection
  const [selectionState, setSelectionState] = useState<InspectorSelectionState>({
    selectedType: 'INTERNAL',
    searchKeyword: '',
    inspectors: [],
    selectedInspector: null,
    loading: false
  });

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<InspectorAssignFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      assignmentReason: '',
      estimatedDate: ''
    }
  });

  // Mock data for inspectors
  const mockInspectors: Inspector[] = useMemo(() => [
    {
      id: 'INSPECTOR_001',
      name: '이신혁',
      department: '기획팀',
      position: '대리',
      specialtyArea: '시스템',
      type: 'INTERNAL',
      isActive: true
    },
    {
      id: 'INSPECTOR_002',
      name: '김철수',
      department: '개발팀',
      position: '과장',
      specialtyArea: '보안',
      type: 'INTERNAL',
      isActive: true
    },
    {
      id: 'INSPECTOR_003',
      name: '박영희',
      department: '운영팀',
      position: '차장',
      specialtyArea: '운영',
      type: 'INTERNAL',
      isActive: true
    },
    {
      id: 'INSPECTOR_004',
      name: '최외부',
      department: '외부감사법인',
      position: '수석감사원',
      specialtyArea: '감사',
      type: 'EXTERNAL',
      isActive: true
    },
    {
      id: 'INSPECTOR_005',
      name: '정외부',
      department: '컨설팅회사',
      position: '시니어컨설턴트',
      specialtyArea: '컨설팅',
      type: 'EXTERNAL',
      isActive: true
    }
  ], []);

  // Filter inspectors based on type and search
  const filteredInspectors = useMemo(() => {
    let filtered = mockInspectors.filter(inspector =>
      inspector.type === selectionState.selectedType && inspector.isActive
    );

    if (selectionState.searchKeyword.trim()) {
      const keyword = selectionState.searchKeyword.toLowerCase();
      filtered = filtered.filter(inspector =>
        inspector.name.toLowerCase().includes(keyword) ||
        inspector.department.toLowerCase().includes(keyword) ||
        inspector.position.toLowerCase().includes(keyword) ||
        inspector.specialtyArea.toLowerCase().includes(keyword)
      );
    }

    return filtered;
  }, [mockInspectors, selectionState.selectedType, selectionState.searchKeyword]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset();
      setSelectionState(prev => ({
        ...prev,
        selectedInspector: null,
        searchKeyword: '',
        selectedType: assignment?.internalExternal || 'INTERNAL'
      }));
    }
  }, [open, assignment, reset]);

  // Handle inspector type change
  const handleTypeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value as 'INTERNAL' | 'EXTERNAL';
    setSelectionState(prev => ({
      ...prev,
      selectedType: newType,
      selectedInspector: null,
      searchKeyword: ''
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    // 실제로는 API 호출
    setSelectionState(prev => ({ ...prev, loading: true }));
    setTimeout(() => {
      setSelectionState(prev => ({ ...prev, loading: false }));
    }, 300);
  }, []);

  // Handle inspector selection
  const handleInspectorSelect = useCallback((selectedNodes: any[]) => {
    const selectedInspector = selectedNodes.length > 0 ? selectedNodes[0].data : null;
    setSelectionState(prev => ({
      ...prev,
      selectedInspector
    }));
  }, []);

  // Handle form submission
  const onSubmit = useCallback((formData: InspectorAssignFormData) => {
    if (!assignment || !selectionState.selectedInspector) return;

    const submitData: InspectorAssignFormData = {
      inspectorId: selectionState.selectedInspector.id,
      assignmentReason: formData.assignmentReason,
      estimatedDate: formData.estimatedDate
    };

    onSelect(assignment, selectionState.selectedInspector, submitData);
  }, [assignment, selectionState.selectedInspector, onSelect]);

  // Modal actions
  const actions: ModalAction[] = [
    {
      label: '취소',
      variant: 'outlined',
      onClick: onClose
    },
    {
      label: '확인',
      variant: 'contained',
      onClick: handleSubmit(onSubmit),
      disabled: !selectionState.selectedInspector || !isValid,
      loading: loading
    }
  ];

  const modalTitle = assignment?.inspector ? '점검자 변경' : '점검자 선택';

  return (
    <BaseModal
      open={open}
      title={modalTitle}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      actions={actions}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        {/* 현재 선택된 점검 항목 정보 */}
        {assignment && (
          <Box className={styles.assignmentInfo}>
            <Typography variant="h6" className={styles.sectionTitle}>
              <PersonIcon className={styles.sectionIcon} />
              점검 항목 정보
            </Typography>
            <Box className={styles.infoGrid}>
              <Typography variant="body2">
                <strong>관리명칭:</strong> {assignment.managementName}
              </Typography>
              <Typography variant="body2">
                <strong>차시:</strong> {assignment.round}
              </Typography>
              <Typography variant="body2">
                <strong>구분:</strong> {assignment.internalExternal === 'INTERNAL' ? '내부' : '외부'}
              </Typography>
              {assignment.inspector && (
                <Typography variant="body2">
                  <strong>현재 점검자:</strong> {assignment.inspector.name} ({assignment.inspector.department})
                </Typography>
              )}
            </Box>
          </Box>
        )}

        <Divider className={styles.divider} />

        {/* 점검자 구분 선택 */}
        <Box className={styles.typeSelection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            점검자 구분
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={selectionState.selectedType}
              onChange={handleTypeChange}
            >
              <FormControlLabel
                value="INTERNAL"
                control={<Radio />}
                label="내부점검자"
                disabled={assignment?.internalExternal === 'EXTERNAL'}
              />
              <FormControlLabel
                value="EXTERNAL"
                control={<Radio />}
                label="외부점검자"
                disabled={assignment?.internalExternal === 'INTERNAL'}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* 점검자 검색 */}
        <Box className={styles.searchSection}>
          <TextField
            fullWidth
            size="small"
            placeholder="점검자 이름, 부서, 직급, 전문영역으로 검색"
            value={selectionState.searchKeyword}
            onChange={(e) => setSelectionState(prev => ({ ...prev, searchKeyword: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* 점검자 목록 그리드 */}
        <Box className={styles.gridSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            점검자 목록
          </Typography>
          <div className={styles.gridContainer}>
            <BaseDataGrid
              data={filteredInspectors}
              columns={inspectorColumns}
              loading={selectionState.loading}
              rowSelection="single"
              onSelectionChanged={handleInspectorSelect}
              height="250px"
              suppressPagination={true}
              theme="rsms"
            />
          </div>
        </Box>

        <Divider className={styles.divider} />

        {/* 지정 정보 입력 */}
        <Box className={styles.formSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            지정 정보
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formRow}>
              <Controller
                name="assignmentReason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="지정 사유"
                    placeholder="점검자 지정 사유를 입력하세요 (선택사항)"
                    multiline
                    rows={2}
                    fullWidth
                    error={!!errors.assignmentReason}
                    helperText={errors.assignmentReason?.message}
                    className={styles.formField}
                  />
                )}
              />
            </div>
            <div className={styles.formRow}>
              <Controller
                name="estimatedDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="예상 점검일"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.estimatedDate}
                    helperText={errors.estimatedDate?.message}
                    className={styles.formField}
                  />
                )}
              />
            </div>
          </form>
        </Box>

        {/* 선택된 점검자 정보 표시 */}
        {selectionState.selectedInspector && (
          <Box className={styles.selectedInspectorInfo}>
            <Typography variant="h6" className={styles.sectionTitle}>
              선택된 점검자
            </Typography>
            <Box className={styles.inspectorCard}>
              <Typography variant="body1">
                <strong>{selectionState.selectedInspector.name}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectionState.selectedInspector.department} · {selectionState.selectedInspector.position}
              </Typography>
              <Typography variant="body2" color="primary">
                전문영역: {selectionState.selectedInspector.specialtyArea}
              </Typography>
            </Box>
          </Box>
        )}
      </div>
    </BaseModal>
  );
};

InspectorSelectionModal.displayName = 'InspectorSelectionModal';

export default InspectorSelectionModal;