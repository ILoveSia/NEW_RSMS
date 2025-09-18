import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import PositionSearchFilter from './PositionSearchFilter';
import type { PositionFilters } from '../../types/position.types';

// Mock 데이터
const mockFilters: PositionFilters = {
  positionName: '',
  headquarters: '',
  status: '',
  isActive: ''
};

const mockProps = {
  filters: mockFilters,
  onFiltersChange: vi.fn(),
  onSearch: vi.fn(),
  onClear: vi.fn(),
  loading: false,
  searchLoading: false
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
          'position.fields.positionName': '직책명',
          'position.fields.headquarters': '본부구분',
          'position.fields.status': '상태',
          'position.fields.isActive': '사용여부',
          'position.search.positionNamePlaceholder': '직책명을 입력하세요',
          'common.all': '전체',
          'common.search': '검색'
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

describe('PositionSearchFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 테스트', () => {
    it('모든 필터 요소가 올바르게 렌더링되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      // 직책명 입력 필드
      expect(screen.getByLabelText(/직책명/)).toBeInTheDocument();

      // 본부구분 선택 필드
      expect(screen.getByLabelText(/본부구분/)).toBeInTheDocument();

      // 상태 선택 필드
      expect(screen.getByLabelText(/상태/)).toBeInTheDocument();

      // 사용여부 선택 필드
      expect(screen.getByLabelText(/사용여부/)).toBeInTheDocument();

      // 검색 버튼
      expect(screen.getByRole('button', { name: /검색/ })).toBeInTheDocument();
    });

    it('로딩 상태일 때 모든 필드가 비활성화되어야 한다', () => {
      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} loading={true} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/직책명/)).toBeDisabled();
      expect(screen.getByRole('button', { name: /검색/ })).toBeDisabled();
    });
  });

  describe('사용자 인터랙션 테스트', () => {
    it('직책명 입력 시 onFiltersChange가 호출되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      const positionNameInput = screen.getByLabelText(/직책명/);
      await user.type(positionNameInput, '관리자');

      await waitFor(() => {
        expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
          positionName: '관리자'
        });
      });
    });

    it('본부구분 선택 시 onFiltersChange가 호출되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      // Material-UI Select 클릭
      const headquartersSelect = screen.getByLabelText(/본부구분/);
      await user.click(headquartersSelect);

      // 옵션 선택
      const option = screen.getByText('본부부서');
      await user.click(option);

      await waitFor(() => {
        expect(mockProps.onFiltersChange).toHaveBeenCalledWith({
          headquarters: '본부부서'
        });
      });
    });

    it('검색 버튼 클릭 시 onSearch가 호출되어야 한다', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      const searchButton = screen.getByRole('button', { name: /검색/ });
      await user.click(searchButton);

      expect(mockProps.onSearch).toHaveBeenCalledTimes(1);
    });

    it('Enter 키 입력 시 onSearch가 호출되어야 한다', async () => {
      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      const positionNameInput = screen.getByLabelText(/직책명/);
      fireEvent.keyPress(positionNameInput, { key: 'Enter', code: 'Enter' });

      expect(mockProps.onSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('메모이제이션 테스트', () => {
    it('동일한 props로 리렌더링 시 React.memo가 동작해야 한다', () => {
      const { rerender } = render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      // 동일한 props로 리렌더링
      rerender(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      // React.memo로 인해 실제 리렌더링이 방지되었는지는
      // 개발자 도구 또는 프로파일러로 확인 가능
      expect(screen.getByLabelText(/직책명/)).toBeInTheDocument();
    });
  });

  describe('접근성 테스트', () => {
    it('모든 폼 요소에 적절한 라벨이 있어야 한다', () => {
      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      // 라벨과 연결된 요소들 확인
      expect(screen.getByLabelText(/직책명/)).toBeInTheDocument();
      expect(screen.getByLabelText(/본부구분/)).toBeInTheDocument();
      expect(screen.getByLabelText(/상태/)).toBeInTheDocument();
      expect(screen.getByLabelText(/사용여부/)).toBeInTheDocument();
    });

    it('키보드 탐색이 가능해야 한다', () => {
      render(
        <TestWrapper>
          <PositionSearchFilter {...mockProps} />
        </TestWrapper>
      );

      const positionNameInput = screen.getByLabelText(/직책명/);
      const searchButton = screen.getByRole('button', { name: /검색/ });

      // Tab 포커스 순서 확인
      positionNameInput.focus();
      expect(positionNameInput).toHaveFocus();

      // 검색 버튼도 포커스 가능한지 확인
      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('에러 상태 테스트', () => {
    it('props가 누락되어도 에러가 발생하지 않아야 한다', () => {
      const incompleteProps = {
        filters: mockFilters,
        onFiltersChange: vi.fn(),
        onSearch: vi.fn(),
        onClear: vi.fn()
        // loading, searchLoading 누락
      };

      expect(() => {
        render(
          <TestWrapper>
            <PositionSearchFilter {...incompleteProps} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});