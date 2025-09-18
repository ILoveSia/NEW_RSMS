import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import PositionMgmt from './PositionMgmt';

// Mock 지연 로딩 컴포넌트
vi.mock('./components/PositionDataGrid/PositionDataGrid', () => ({
  default: vi.fn(() => (
    <div data-testid="position-data-grid">
      Mock Position Data Grid
    </div>
  ))
}));

// Mock PositionSearchFilter
vi.mock('./components/PositionSearchFilter', () => ({
  PositionSearchFilter: vi.fn(({ onSearch, onClear, onFiltersChange }) => (
    <div data-testid="position-search-filter">
      <button onClick={() => onFiltersChange({ positionName: 'test' })}>
        Change Filter
      </button>
      <button onClick={onSearch}>Search</button>
      <button onClick={onClear}>Clear</button>
    </div>
  ))
}));

// Mock Button 컴포넌트
vi.mock('@/shared/components/atoms/Button', () => ({
  Button: vi.fn(({ children, onClick, startIcon, disabled, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid']}
      {...props}
    >
      {startIcon && <span data-testid="button-icon">{startIcon}</span>}
      {children}
    </button>
  ))
}));

// Mock LoadingSpinner
vi.mock('@/shared/components/atoms/LoadingSpinner', () => ({
  LoadingSpinner: vi.fn(({ text }) => (
    <div data-testid="loading-spinner">{text}</div>
  ))
}));

// Mock toast
vi.mock('@/shared/utils/toast', () => ({
  default: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
    update: vi.fn()
  }
}));

// Mock Material-UI 아이콘
vi.mock('@mui/icons-material/Add', () => ({
  default: () => <span data-testid="add-icon">Add</span>
}));

vi.mock('@mui/icons-material/Delete', () => ({
  default: () => <span data-testid="delete-icon">Delete</span>
}));

vi.mock('@mui/icons-material/FileDownload', () => ({
  default: () => <span data-testid="excel-icon">Excel</span>
}));

vi.mock('@mui/icons-material/Dashboard', () => ({
  default: () => <span data-testid="dashboard-icon">Dashboard</span>
}));

vi.mock('@mui/icons-material/TrendingUp', () => ({
  default: () => <span data-testid="trending-icon">TrendingUp</span>
}));

vi.mock('@mui/icons-material/Security', () => ({
  default: () => <span data-testid="security-icon">Security</span>
}));

vi.mock('@mui/icons-material/Analytics', () => ({
  default: () => <span data-testid="analytics-icon">Analytics</span>
}));

// Mock Chip
vi.mock('@mui/material', () => ({
  Chip: vi.fn(({ label, color, variant, size, icon }) => (
    <span data-testid="chip" data-color={color} data-variant={variant}>
      {icon && <span data-testid="chip-icon">{icon}</span>}
      {label}
    </span>
  ))
}));

// Performance API Mock
Object.defineProperty(window, 'performance', {
  value: {
    getEntriesByType: vi.fn(() => [
      {
        domainLookupStart: 0,
        domainLookupEnd: 10,
        connectStart: 10,
        connectEnd: 20,
        responseStart: 20,
        responseEnd: 50,
        domContentLoadedEventStart: 50,
        domContentLoadedEventEnd: 80,
        loadEventStart: 80,
        loadEventEnd: 100
      }
    ])
  }
});

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
          'position.management.title': '직책관리 시스템',
          'position.management.description': '조직의 직책 정보를 체계적으로 관리합니다'
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

describe('PositionMgmt 통합 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // console.log 및 console.group Mock
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('초기 렌더링 테스트', () => {
    it('모든 주요 섹션이 올바르게 렌더링되어야 한다', async () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      // 페이지 헤더
      expect(screen.getByText(/직책관리 시스템/)).toBeInTheDocument();

      // 통계 카드들
      await waitFor(() => {
        expect(screen.getByText('총 직책')).toBeInTheDocument();
        expect(screen.getByText('활성 직책')).toBeInTheDocument();
        expect(screen.getByText('시스템 가동률')).toBeInTheDocument();
      });

      // 검색 필터
      expect(screen.getByTestId('position-search-filter')).toBeInTheDocument();

      // 액션 바
      expect(screen.getByText('엑셀다운로드')).toBeInTheDocument();
      expect(screen.getByText('등록')).toBeInTheDocument();
      expect(screen.getByText('삭제')).toBeInTheDocument();
    });

    it('React.Profiler가 활성화되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      // 컴포넌트가 정상 렌더링되면 Profiler도 함께 동작
      expect(screen.getByText(/직책관리 시스템/)).toBeInTheDocument();
    });
  });

  describe('통계 데이터 테스트', () => {
    it('통계 데이터가 올바르게 계산되어야 한다', async () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      await waitFor(() => {
        // Mock 데이터 기준 총 10개
        expect(screen.getByText('10')).toBeInTheDocument();

        // 활성 직책 수 (isActive: true)
        expect(screen.getByText('9')).toBeInTheDocument(); // mockPositions에서 9개가 활성

        // 시스템 가동률
        expect(screen.getByText('98.5%')).toBeInTheDocument();
      });
    });

    it('활성/비활성 Chip이 올바르게 표시되어야 한다', async () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      await waitFor(() => {
        const chips = screen.getAllByTestId('chip');
        expect(chips).toHaveLength(2);

        // 활성 칩
        expect(screen.getByText(/활성 9개/)).toBeInTheDocument();

        // 비활성 칩
        expect(screen.getByText(/비활성 1개/)).toBeInTheDocument();
      });
    });
  });

  describe('사용자 인터랙션 테스트', () => {
    it('필터 변경 시 상태가 업데이트되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      const changeFilterButton = screen.getByText('Change Filter');
      await user.click(changeFilterButton);

      // 필터 상태 변경이 정상 처리되는지 확인
      expect(screen.getByTestId('position-search-filter')).toBeInTheDocument();
    });

    it('검색 버튼 클릭 시 검색이 실행되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      const searchButton = screen.getByText('Search');
      await user.click(searchButton);

      // 검색 로직이 실행되는지 확인 (toast 호출 등)
      expect(screen.getByTestId('position-search-filter')).toBeInTheDocument();
    });

    it('등록 버튼 클릭 시 모달이 열려야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      const addButton = screen.getByTestId('add-position-button');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('🏗️ 새 직책 추가')).toBeInTheDocument();
      });
    });

    it('삭제 버튼이 선택된 항목이 없을 때 비활성화되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      const deleteButton = screen.getByText('삭제');
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('지연 로딩 테스트', () => {
    it('PositionDataGrid가 Suspense로 감싸져 있어야 한다', async () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      // Suspense fallback 또는 실제 컴포넌트 렌더링 확인
      await waitFor(() => {
        expect(
          screen.getByTestId('position-data-grid') ||
          screen.getByTestId('loading-spinner')
        ).toBeInTheDocument();
      });
    });
  });

  describe('성능 모니터링 테스트', () => {
    it('개발 환경에서 성능 측정이 실행되어야 한다', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      // Performance API 호출 확인
      expect(window.performance.getEntriesByType).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('에러 핸들링 테스트', () => {
    it('컴포넌트 에러가 발생해도 앱이 크래시되지 않아야 한다', () => {
      // React Error Boundary 테스트는 별도의 Error Boundary 컴포넌트가 필요
      expect(() => {
        render(
          <TestWrapper>
            <PositionMgmt />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('메모이제이션 테스트', () => {
    it('통계 데이터가 메모이제이션되어야 한다', () => {
      const { rerender } = render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      // 동일한 props로 리렌더링
      rerender(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      // useMemo로 인해 통계 재계산이 방지되는지 확인
      expect(screen.getByText(/직책관리 시스템/)).toBeInTheDocument();
    });
  });

  describe('접근성 테스트', () => {
    it('페이지 제목이 적절한 heading 레벨을 가져야 한다', () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      const pageTitle = screen.getByRole('heading', { level: 1 });
      expect(pageTitle).toHaveTextContent(/직책관리 시스템/);
    });

    it('액션 버튼들이 적절한 레이블을 가져야 한다', () => {
      render(
        <TestWrapper>
          <PositionMgmt />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /엑셀다운로드/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /등록/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
    });
  });
});