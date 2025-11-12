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
import PersonIcon from '@mui/icons-material/Person';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import type { Position, PositionSelectModalProps } from '../../types/roleHistory.types';
import type { ColDef } from 'ag-grid-community';

/**
 * 직책 선택 모달 컴포넌트
 * 요구사항에 따른 직책 검색 및 선택 기능
 */
const PositionSelectModal: React.FC<PositionSelectModalProps> = ({
  open,
  onClose,
  onSelect,
  loading = false
}) => {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 검색 핸들러
  const handleSearch = useCallback(async () => {
    setSearchLoading(true);
    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock 데이터
      const mockPositions: Position[] = [
        {
          id: '1',
          seq: 1,
          positionCode: 'P001',
          positionName: '이사회의장',
          headquarters: '사외이사',
          job: '',
          isActive: true
        },
        {
          id: '2',
          seq: 2,
          positionCode: 'P002',
          positionName: '대표이사',
          headquarters: 'CEO',
          job: '',
          isActive: true
        },
        {
          id: '3',
          seq: 3,
          positionCode: 'P003',
          positionName: '감사보부장',
          headquarters: '감사본부',
          job: '',
          isActive: true
        },
        {
          id: '4',
          seq: 4,
          positionCode: 'P004',
          positionName: '준법감시인',
          headquarters: '준법감시인',
          job: '',
          isActive: true
        },
        {
          id: '5',
          seq: 5,
          positionCode: 'P005',
          positionName: '경영전략본부장',
          headquarters: '경영전략본부',
          job: '',
          isActive: true
        },
        {
          id: '6',
          seq: 6,
          positionCode: 'P006',
          positionName: '디지털부본부장',
          headquarters: '디지털부본부',
          job: '',
          isActive: true
        },
        {
          id: '7',
          seq: 7,
          positionCode: 'P007',
          positionName: '리스크관리본부장',
          headquarters: '리스크관리본부',
          job: '',
          isActive: true
        },
        {
          id: '8',
          seq: 8,
          positionCode: 'P008',
          positionName: '경영지원본부장',
          headquarters: '경영지원본부',
          job: '',
          isActive: true
        },
        {
          id: '9',
          seq: 9,
          positionCode: 'P009',
          positionName: '소비자보호본부장',
          headquarters: '소비자보호본부',
          job: '',
          isActive: true
        },
        {
          id: '10',
          seq: 10,
          positionCode: 'P010',
          positionName: '기업금융본부장',
          headquarters: '기업금융본부',
          job: '',
          isActive: true
        },
        {
          id: '11',
          seq: 11,
          positionCode: 'P011',
          positionName: 'IB투자금융본부장',
          headquarters: 'IB투자금융본부',
          job: '',
          isActive: true
        }
      ];

      // 검색어 필터링
      const filteredPositions = searchTerm
        ? mockPositions.filter(position =>
            position.positionName.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockPositions;

      setPositions(filteredPositions);
    } catch (error) {
      console.error('직책 검색 실패:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm]);

  // 선택 핸들러
  const handlePositionSelect = useCallback(() => {
    if (selectedPosition) {
      onSelect(selectedPosition);
    }
  }, [selectedPosition, onSelect]);

  // 행 클릭 핸들러
  const handleRowClick = useCallback((position: Position) => {
    setSelectedPosition(position);
  }, []);

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = useCallback((position: Position) => {
    setSelectedPosition(position);
    onSelect(position);
  }, [onSelect]);

  // 그리드 컬럼 정의
  const columns = useMemo<ColDef<Position>[]>(() => [
    {
      field: 'seq' as keyof Position,
      headerName: '순번',
      width: 80,
      sortable: true
    },
    {
      field: 'positionName' as keyof Position,
      headerName: '직책',
      width: 200,
      sortable: true
    },
    {
      field: 'headquarters' as keyof Position,
      headerName: '본부명',
      width: 180,
      sortable: true
    },
    {
      field: 'job' as keyof Position,
      headerName: '직무',
      width: 150,
      sortable: true
    }
  ], []);

  // 모달 초기화
  React.useEffect(() => {
    if (open) {
      setSearchTerm('');
      setSelectedPosition(null);
      handleSearch(); // 모달 열릴 때 전체 목록 로드
    }
  }, [open, handleSearch]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      
      PaperProps={{
        className: styles.paper
      }}
    >
      {/* 모달 헤더 */}
      <DialogTitle >
        <div >
          <PersonIcon  />
          <Typography variant="h6" component="div">
            직책 선택
          </Typography>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 모달 컨텐츠 */}
      <DialogContent >
        {/* 검색 영역 */}
        <div >
          <TextField
            fullWidth
            label="직책"
            placeholder="직책명을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            size="small"
            
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            
          >
            조회
          </Button>
        </div>

        {/* 직책 목록 그리드 */}
        <div >
          <BaseDataGrid
            data={positions}
            columns={columns}
            loading={searchLoading}
            theme="alpine"
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            height="400px"
            pagination={true}
            pageSize={10}
            rowSelection="single"
          />
        </div>
      </DialogContent>

      {/* 모달 액션 */}
      <DialogActions >
        <Button
          onClick={onClose}
          variant="outlined"
          
        >
          취소
        </Button>
        <Button
          onClick={handlePositionSelect}
          variant="contained"
          disabled={!selectedPosition || loading}
          
        >
          선택
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PositionSelectModal;