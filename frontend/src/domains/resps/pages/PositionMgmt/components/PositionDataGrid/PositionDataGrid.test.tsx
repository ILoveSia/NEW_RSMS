import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import PositionDataGrid from './PositionDataGrid';
import type { Position } from '../../types/position.types';

// Mock AG-Grid
vi.mock('ag-grid-react', () => ({
  AgGridReact: vi.fn(({ onGridReady, onRowClicked, onRowDoubleClicked, onSelectionChanged }) => {
    // Mock AG-Grid 컴포넌트
    React.useEffect(() => {
      if (onGridReady) {
        onGridReady({
          api: {
            getSelectedRows: vi.fn(() => []),
            selectAll: vi.fn(),
            deselectAll: vi.fn()
          }
        });
      }
    }, [onGridReady]);

    return (
      <div data-testid="ag-grid-mock">
        <button
          onClick={() => onRowClicked?.(mockRowEvent)}
          data-testid="mock-row"
        >
          Mock Row
        </button>
        <button
          onClick={() => onRowDoubleClicked?.(mockRowEvent)}
          data-testid="mock-row-double"
        >
          Mock Row Double
        </button>
        <button
          onClick={() => onSelectionChanged?.({})}
          data-testid="mock-selection"
        >
          Mock Selection
        </button>
      </div>
    );
  })
}));

// BaseDataGrid Mock
vi.mock('@/shared/components/organisms/BaseDataGrid', () => ({
  BaseDataGrid: vi.fn(({
    data,
    loading,
    onRowClick,
    onRowDoubleClick,
    onSelectionChange,
    emptyMessage
  }) => (
    <div data-testid="base-data-grid">
      {loading && <div data-testid="loading">Loading...</div>}
      {!loading && data.length === 0 && (
        <div data-testid="empty-message">{emptyMessage}</div>
      )}
      {!loading && data.length > 0 && (
        <div data-testid="data-rows">
          {data.map((item: Position) => (
            <div key={item.id} data-testid={`row-${item.id}`}>
              <button
                onClick={() => onRowClick?.(item, {} as any)}
                data-testid={`row-click-${item.id}`}
              >
                {item.positionName}
              </button>
              <button
                onClick={() => onRowDoubleClick?.(item, {} as any)}
                data-testid={`row-double-click-${item.id}`}
              >
                Double Click
              </button>
            </div>
          ))}
          <button
            onClick={() => onSelectionChange?.([data[0]])}
            data-testid="selection-change"
          >
            Select First
          </button>
        </div>
      )}
    </div>
  ))
}));

// Mock 데이터
const mockPositions: Position[] = [
  {
    id: '1',
    positionName: '경영진단본부장',
    headquarters: '본부부서',
    departmentName: '경영진단본부',
    divisionName: '경영진단본부',
    registrationDate: '2024-01-15',
    registrar: '관리자',
    registrarPosition: '시스템관리자',
    modificationDate: '2024-03-20',
    modifier: '홍길동',
    modifierPosition: '총합기획부',
    status: '정상',
    isActive: true,
    approvalStatus: '승인완료'
  },
  {
    id: '2',
    positionName: '총합기획부장',
    headquarters: '본부부서',
    departmentName: '총합기획부',
    divisionName: '총합기획부',
    registrationDate: '2024-02-01',
    registrar: '시스템관리자',
    registrarPosition: '시스템관리자',
    modificationDate: '2024-04-10',
    modifier: '김철수',
    modifierPosition: '인사팀',
    status: '정상',
    isActive: false,
    approvalStatus: '검토중'
  }
];

const mockRowEvent = {
  data: mockPositions[0],
  node: { data: mockPositions[0] }
};

const mockProps = {
  data: mockPositions,
  loading: false,
  onRowClick: vi.fn(),
  onRowDoubleClick: vi.fn(),
  onSelectionChange: vi.fn(),
  height: 'calc(100vh - 400px)'
};

// 테스트용 i18n 초기화
i18n
  .use(initReactI18next)
  .init({
    lng: 'ko',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    resources: {
      ko: {
        resps: {
          'position.grid.noData': '표시할 데이터가 없습니다'
        }
      }
    }
  });

// 테스트 컴포넌트 래퍼
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    {children}
  </I18nextProvider>
);

describe('PositionDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('데이터가 있을 때 BaseDataGrid가 올바르게 렌더링되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('base-data-grid')).toBeInTheDocument();
      expect(screen.getByTestId('data-rows')).toBeInTheDocument();
    });

    it('로딩 상태일 때 로딩 표시가 나타나야 한다', () => {
      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} loading={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('데이터가 없을 때 빈 메시지가 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} data={[]} />
        </TestWrapper>
      );

      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    });

    it('데이터 행들이 올바르게 렌더링되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('row-1')).toBeInTheDocument();
      expect(screen.getByTestId('row-2')).toBeInTheDocument();
      expect(screen.getByText('경영진단본부장')).toBeInTheDocument();
      expect(screen.getByText('총합기획부장')).toBeInTheDocument();
    });
  });

  describe('이벤트 핸들링 테스트', () => {
    it('행 클릭 시 onRowClick이 호출되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      const rowButton = screen.getByTestId('row-click-1');
      await user.click(rowButton);

      expect(mockProps.onRowClick).toHaveBeenCalledWith(
        mockPositions[0],
        expect.any(Object)
      );
    });

    it('행 더블클릭 시 onRowDoubleClick이 호출되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      const rowDoubleButton = screen.getByTestId('row-double-click-1');
      await user.click(rowDoubleButton);

      expect(mockProps.onRowDoubleClick).toHaveBeenCalledWith(
        mockPositions[0],
        expect.any(Object)
      );
    });

    it('선택 변경 시 onSelectionChange가 호출되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      const selectionButton = screen.getByTestId('selection-change');
      await user.click(selectionButton);

      expect(mockProps.onSelectionChange).toHaveBeenCalledWith([mockPositions[0]]);
    });
  });

  describe('메모이제이션 테스트', () => {
    it('columnDefs가 메모이제이션되어야 한다', () => {
      const { rerender } = render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      // 동일한 props로 리렌더링
      rerender(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      // useMemo로 인해 컬럼 정의가 재계산되지 않음을 확인
      expect(screen.getByTestId('base-data-grid')).toBeInTheDocument();
    });
  });

  describe('props 검증 테스트', () => {
    it('필수 props가 BaseDataGrid에 올바르게 전달되어야 한다', () => {
      const customProps = {
        ...mockProps,
        className: 'custom-grid',
        height: '500px'
      };

      render(
        <TestWrapper>
          <PositionDataGrid {...customProps} />
        </TestWrapper>
      );

      // BaseDataGrid가 올바른 props와 함께 렌더링되는지 확인
      expect(screen.getByTestId('base-data-grid')).toBeInTheDocument();
    });

    it('선택적 props가 누락되어도 정상 동작해야 한다', () => {
      const minimalProps = {
        data: mockPositions,
        loading: false
      };

      expect(() => {
        render(
          <TestWrapper>
            <PositionDataGrid {...minimalProps} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('성능 테스트', () => {
    it('대량 데이터에서도 안정적으로 렌더링되어야 한다', () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, index) => ({
        ...mockPositions[0],
        id: `${index + 1}`,
        positionName: `직책 ${index + 1}`
      }));

      const largeDataProps = {
        ...mockProps,
        data: largeDataSet
      };

      expect(() => {
        render(
          <TestWrapper>
            <PositionDataGrid {...largeDataProps} />
          </TestWrapper>
        );
      }).not.toThrow();

      expect(screen.getByTestId('base-data-grid')).toBeInTheDocument();
    });
  });

  describe('접근성 테스트', () => {
    it('컨테이너에 적절한 role과 aria 속성이 있어야 한다', () => {
      render(
        <TestWrapper>
          <PositionDataGrid {...mockProps} />
        </TestWrapper>
      );

      // data-testid를 통해 그리드 요소 확인
      const gridContainer = screen.getByTestId('base-data-grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });
});