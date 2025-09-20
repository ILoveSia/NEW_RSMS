import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { Responsibility, ResponsibilitySelectModalProps } from '../../types/roleHistory.types';
import type { ColDef } from 'ag-grid-community';
import styles from './ResponsibilitySelectModal.module.scss';

/**
 * 책무 선택 모달 컴포넌트
 * 요구사항에 따른 책무 검색 및 선택 기능
 */
const ResponsibilitySelectModal: React.FC<ResponsibilitySelectModalProps> = ({
  open,
  onClose,
  onSelect,
  loading = false
}) => {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [selectedResponsibility, setSelectedResponsibility] = useState<Responsibility | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 검색 핸들러
  const handleSearch = useCallback(async () => {
    setSearchLoading(true);
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock 데이터
      const mockResponsibilities: Responsibility[] = [
        {
          id: '1',
          responsibilityCode: 'CM9002',
          responsibilityName: '(공통) 소관 업무조직의 내부통제기준 및 위험관리기준 수립 책무',
          responsibilityDetailCode: '001',
          responsibilityDetailContent: '내부통제기준 및 위험관리기준 수립 책무',
          isActive: true
        },
        {
          id: '2',
          responsibilityCode: 'CM9002',
          responsibilityName: '(공통) 소관 업무조직의 내부통제기준 및 위험관리기준 수립 책무',
          responsibilityDetailCode: '002',
          responsibilityDetailContent: '내부통제기준 및 위험관리기준 수립 책무',
          isActive: true
        },
        {
          id: '3',
          responsibilityCode: 'CM9002',
          responsibilityName: '(공통) 소관 업무조직의 내부통제기준 및 위험관리기준 수립 책무',
          responsibilityDetailCode: '003',
          responsibilityDetailContent: '영업점 내부통제기준에 대한 책무 세부내용',
          isActive: true
        },
        {
          id: '4',
          responsibilityCode: 'CM9002',
          responsibilityName: '(공통) 소관 업무조직의 내부통제기준 및 위험관리기준 수립 책무',
          responsibilityDetailCode: '004',
          responsibilityDetailContent: '소관 업무 및 소속의 내부통제기준 수립에 대한 책무',
          isActive: true
        },
        {
          id: '5',
          responsibilityCode: 'MV0001',
          responsibilityName: '경영전략 업무의 관련된 책무',
          responsibilityDetailCode: '001',
          responsibilityDetailContent: '경영전략 업무의 관련된 책무에 대한 세부내용',
          isActive: true
        },
        {
          id: '6',
          responsibilityCode: 'MV0001',
          responsibilityName: '경영전략 업무의 관련된 책무',
          responsibilityDetailCode: '002',
          responsibilityDetailContent: '경영전략 수립 관련 책무 세부내용',
          isActive: true
        },
        {
          id: '7',
          responsibilityCode: 'RM0001',
          responsibilityName: '책무구조도의 마련 관리 업무의 관련된...',
          responsibilityDetailCode: '001',
          responsibilityDetailContent: '책무구조도의 마련 관리 관련 책무 세부내용',
          isActive: true
        },
        {
          id: '8',
          responsibilityCode: 'RM0004',
          responsibilityName: '내부감사 업무의 관련된 책무',
          responsibilityDetailCode: '001',
          responsibilityDetailContent: '내부감사 업무의 관련된 책무 세부 내용 1',
          isActive: true
        },
        {
          id: '9',
          responsibilityCode: 'RM0004',
          responsibilityName: '내부감사 업무의 관련된 책무',
          responsibilityDetailCode: '002',
          responsibilityDetailContent: '내부감사 업무의 관련된 책무 세부 내용 2',
          isActive: true
        },
        {
          id: '10',
          responsibilityCode: 'RM0005',
          responsibilityName: '준법감시 업무의 관련된 책무',
          responsibilityDetailCode: '001',
          responsibilityDetailContent: '준법감시 업무의 관련된 책무세부내용',
          isActive: true
        }
      ];

      // 검색어 필터링
      const filteredResponsibilities = searchTerm
        ? mockResponsibilities.filter(responsibility =>
            responsibility.responsibilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            responsibility.responsibilityDetailContent.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockResponsibilities;

      setResponsibilities(filteredResponsibilities);
    } catch (error) {
      console.error('책무 검색 실패:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm]);

  // 선택 핸들러
  const handleResponsibilitySelect = useCallback(() => {
    if (selectedResponsibility) {
      onSelect(selectedResponsibility);
    }
  }, [selectedResponsibility, onSelect]);

  // 행 클릭 핸들러
  const handleRowClick = useCallback((responsibility: Responsibility) => {
    setSelectedResponsibility(responsibility);
  }, []);

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = useCallback((responsibility: Responsibility) => {
    setSelectedResponsibility(responsibility);
    onSelect(responsibility);
  }, [onSelect]);

  // 그리드 컬럼 정의
  const columns = useMemo<ColDef<Responsibility>[]>(() => [
    {
      field: 'responsibilityCode' as keyof Responsibility,
      headerName: '책무코드',
      width: 120,
      sortable: true
    },
    {
      field: 'responsibilityName' as keyof Responsibility,
      headerName: '책무',
      width: 250,
      sortable: true
    },
    {
      field: 'responsibilityDetailCode' as keyof Responsibility,
      headerName: '책무세부내용코드',
      width: 140,
      sortable: true
    },
    {
      field: 'responsibilityDetailContent' as keyof Responsibility,
      headerName: '책무세부내용',
      width: 300,
      sortable: true
    }
  ], []);

  // 모달 초기화
  React.useEffect(() => {
    if (open) {
      setSearchTerm('');
      setSelectedResponsibility(null);
      handleSearch(); // 모달 열릴 때 전체 목록 로드
    }
  }, [open, handleSearch]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className={styles.modal}
      PaperProps={{
        className: styles.paper
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle className={styles.modalTitle}>
        <div className={styles.titleContent}>
          <AssignmentIcon className={styles.titleIcon} />
          <Typography variant="h6" component="div">
            책무 선택
          </Typography>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 모달 컨텐츠 */}
      <DialogContent className={styles.modalContent}>
        {/* 검색 영역 */}
        <div className={styles.searchSection}>
          <TextField
            fullWidth
            label="책무"
            placeholder="책무명을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            size="small"
            className={styles.searchField}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            className={styles.searchButton}
          >
            조회
          </Button>
        </div>

        {/* 책무 목록 그리드 */}
        <div className={styles.gridSection}>
          <BaseDataGrid
            data={responsibilities}
            columns={columns}
            loading={searchLoading}
            theme="alpine"
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            height="450px"
            pagination={true}
            pageSize={10}
            rowSelection="single"
          />
        </div>
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions className={styles.modalActions}>
        <Button
          onClick={onClose}
          variant="outlined"
          className={styles.cancelButton}
        >
          취소
        </Button>
        <Button
          onClick={handleResponsibilitySelect}
          variant="contained"
          disabled={!selectedResponsibility || loading}
          className={styles.selectButton}
        >
          선택
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilitySelectModal;