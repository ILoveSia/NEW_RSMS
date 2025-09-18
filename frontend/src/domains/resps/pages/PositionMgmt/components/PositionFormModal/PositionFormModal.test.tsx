import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import PositionFormModal from './PositionFormModal';
import { Position, PositionFormData } from '../../types/position.types';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/components/atoms/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/shared/components/organisms/BaseDataGrid', () => ({
  BaseDataGrid: ({ emptyMessage }: any) => <div data-testid="base-data-grid">{emptyMessage}</div>,
}));

describe('PositionFormModal', () => {
  const mockPosition: Position = {
    id: '1',
    positionName: '테스트직책',
    headquarters: 'headquarters',
    departmentName: '테스트부서',
    divisionName: '테스트부정',
    registrationDate: '2024-01-01',
    registrar: '테스트등록자',
    registrarPosition: '관리자',
    modificationDate: '2024-01-01',
    modifier: '테스트수정자',
    modifierPosition: '관리자',
    status: '정상',
    isActive: true,
    approvalStatus: '승인',
    dual: '단일'
  };

  const defaultProps = {
    open: true,
    mode: 'create' as const,
    onClose: vi.fn(),
    onSave: vi.fn(),
    onUpdate: vi.fn(),
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('등록 모드', () => {
    it('등록 모달이 올바르게 렌더링되어야 함', () => {
      render(<PositionFormModal {...defaultProps} />);

      expect(screen.getByText('직책 추가')).toBeInTheDocument();
      expect(screen.getByLabelText('직책 *')).toBeInTheDocument();
      expect(screen.getByLabelText('본부구분 *')).toBeInTheDocument();
      expect(screen.getByLabelText('부서명 *')).toBeInTheDocument();
      expect(screen.getByLabelText('부정명 *')).toBeInTheDocument();
      expect(screen.getByText('저장')).toBeInTheDocument();
    });

    it('필수 필드가 비어있을 때 저장 버튼이 비활성화되어야 함', () => {
      render(<PositionFormModal {...defaultProps} />);

      const saveButton = screen.getByText('저장');
      expect(saveButton).toBeDisabled();
    });

    it('모든 필수 필드를 입력하면 저장 버튼이 활성화되어야 함', async () => {
      const user = userEvent.setup();
      render(<PositionFormModal {...defaultProps} />);

      // 필수 필드 입력
      await user.type(screen.getByLabelText('직책 *'), '테스트직책');
      await user.type(screen.getByLabelText('부서명 *'), '테스트부서');
      await user.type(screen.getByLabelText('부정명 *'), '테스트부정');

      // 본부구분 선택
      const selectElement = screen.getByLabelText('본부구분 *');
      fireEvent.mouseDown(selectElement);
      await user.click(screen.getByText('본부'));

      await waitFor(() => {
        const saveButton = screen.getByText('저장');
        expect(saveButton).not.toBeDisabled();
      });
    });

    it('저장 버튼 클릭 시 onSave 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<PositionFormModal {...defaultProps} onSave={onSave} />);

      // 필수 필드 입력
      await user.type(screen.getByLabelText('직책 *'), '테스트직책');
      await user.type(screen.getByLabelText('부서명 *'), '테스트부서');
      await user.type(screen.getByLabelText('부정명 *'), '테스트부정');

      // 본부구분 선택
      const selectElement = screen.getByLabelText('본부구분 *');
      fireEvent.mouseDown(selectElement);
      await user.click(screen.getByText('본부'));

      // 저장 버튼 클릭
      await waitFor(async () => {
        const saveButton = screen.getByText('저장');
        expect(saveButton).not.toBeDisabled();
        await user.click(saveButton);
      });

      expect(onSave).toHaveBeenCalledWith({
        positionName: '테스트직책',
        headquarters: 'headquarters',
        departmentName: '테스트부서',
        divisionName: '테스트부정'
      });
    });
  });

  describe('상세 모드', () => {
    const detailProps = {
      ...defaultProps,
      mode: 'detail' as const,
      position: mockPosition
    };

    it('상세 모달이 올바르게 렌더링되어야 함', () => {
      render(<PositionFormModal {...detailProps} />);

      expect(screen.getByText('직책 상세')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트직책')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트부서')).toBeInTheDocument();
      expect(screen.getByDisplayValue('테스트부정')).toBeInTheDocument();
      expect(screen.getByText('수정')).toBeInTheDocument();
    });

    it('직책목록 테이블이 표시되어야 함', () => {
      render(<PositionFormModal {...detailProps} />);

      expect(screen.getByText('📋 직책목록')).toBeInTheDocument();
      expect(screen.getByTestId('base-data-grid')).toBeInTheDocument();
    });

    it('수정 버튼 클릭 시 onUpdate 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(<PositionFormModal {...detailProps} onUpdate={onUpdate} />);

      // 필드 수정
      const positionNameField = screen.getByDisplayValue('테스트직책');
      await user.clear(positionNameField);
      await user.type(positionNameField, '수정된직책');

      // 수정 버튼 클릭
      const updateButton = screen.getByText('수정');
      await user.click(updateButton);

      expect(onUpdate).toHaveBeenCalledWith('1', {
        positionName: '수정된직책',
        headquarters: 'headquarters',
        departmentName: '테스트부서',
        divisionName: '테스트부정'
      });
    });
  });

  describe('공통 기능', () => {
    it('닫기 버튼 클릭 시 onClose 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<PositionFormModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText('close');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('로딩 상태일 때 버튼들이 비활성화되어야 함', () => {
      render(<PositionFormModal {...defaultProps} loading={true} />);

      expect(screen.getByText('닫기')).toBeDisabled();
      expect(screen.getByText('저장')).toBeDisabled();
    });

    it('필드 유효성 검사 에러가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<PositionFormModal {...defaultProps} />);

      // 긴 텍스트 입력으로 에러 유발
      const longText = 'a'.repeat(51);
      await user.type(screen.getByLabelText('직책 *'), longText);

      await waitFor(() => {
        expect(screen.getByText('직책명은 50자 이내로 입력해주세요')).toBeInTheDocument();
      });
    });
  });

  describe('키보드 접근성', () => {
    it('Tab 키로 폼 필드들을 순서대로 탐색할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<PositionFormModal {...defaultProps} />);

      const positionNameField = screen.getByLabelText('직책 *');
      const headquartersField = screen.getByLabelText('본부구분 *');
      const departmentField = screen.getByLabelText('부서명 *');
      const divisionField = screen.getByLabelText('부정명 *');

      positionNameField.focus();
      expect(positionNameField).toHaveFocus();

      await user.tab();
      expect(headquartersField).toHaveFocus();

      await user.tab();
      expect(departmentField).toHaveFocus();

      await user.tab();
      expect(divisionField).toHaveFocus();
    });

    it('Escape 키로 모달을 닫을 수 있어야 함', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<PositionFormModal {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });
  });
});