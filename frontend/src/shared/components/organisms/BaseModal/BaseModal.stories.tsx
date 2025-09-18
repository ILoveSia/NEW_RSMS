import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { BaseModal, type ModalAction } from './BaseModal';
import { Button } from '@/shared/components/atoms/Button';
import { TextField, Box, Typography } from '@mui/material';

const meta: Meta<typeof BaseModal> = {
  title: 'Components/Organisms/BaseModal',
  component: BaseModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
BaseModal은 다양한 용도로 사용할 수 있는 재사용 가능한 모달 컴포넌트입니다.

## 주요 특징
- **6가지 크기**: xs, sm, md, lg, xl, fullscreen
- **유연한 액션 버튼**: 개수와 스타일 자유롭게 설정
- **접근성 지원**: 키보드 내비게이션, 스크린 리더 호환
- **반응형 디자인**: 모바일에서 자동으로 전체 화면 활용
- **일관된 디자인**: 다른 Base 컴포넌트와 통일된 스타일

## 사용 예시

### 1. 등록/수정 폼 모달 (md)
\`\`\`tsx
<BaseModal
  open={isOpen}
  onClose={handleClose}
  title="직책 등록"
  size="md"
  actions={[
    { key: 'cancel', label: '취소', variant: 'outlined', onClick: handleClose },
    { key: 'save', label: '저장', variant: 'contained', onClick: handleSave }
  ]}
>
  <form>...</form>
</BaseModal>
\`\`\`

### 2. 상세 조회 모달 (lg)
\`\`\`tsx
<BaseModal
  open={isOpen}
  onClose={handleClose}
  title="직책 상세 정보"
  subtitle="등록일: 2023-12-01"
  size="lg"
  actions={[
    { key: 'edit', label: '수정', variant: 'contained', onClick: handleEdit },
    { key: 'close', label: '닫기', variant: 'outlined', onClick: handleClose }
  ]}
>
  <DetailContent />
</BaseModal>
\`\`\`

### 3. 선택 팝업 (sm)
\`\`\`tsx
<BaseModal
  open={isOpen}
  onClose={handleClose}
  title="부서 선택"
  size="sm"
  actions={[
    { key: 'cancel', label: '취소', variant: 'text', onClick: handleClose },
    { key: 'select', label: '선택', variant: 'contained', onClick: handleSelect }
  ]}
>
  <DepartmentSelector />
</BaseModal>
\`\`\`

### 4. 전체화면 모달 (fullscreen)
\`\`\`tsx
<BaseModal
  open={isOpen}
  onClose={handleClose}
  title="데이터 분석"
  size="fullscreen"
  hideActions
>
  <AnalyticsContent />
</BaseModal>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'fullscreen'],
      description: '모달 크기'
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: '배경 클릭으로 닫기'
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'ESC 키로 닫기'
    },
    showCloseButton: {
      control: 'boolean',
      description: '닫기 버튼 표시'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 모달
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    const actions: ModalAction[] = [
      {
        key: 'cancel',
        label: '취소',
        variant: 'outlined',
        onClick: () => setOpen(false)
      },
      {
        key: 'confirm',
        label: '확인',
        variant: 'contained',
        onClick: () => setOpen(false)
      }
    ];

    return (
      <div>
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
        <BaseModal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          actions={actions}
        >
          <Typography>기본 모달 컨텐츠입니다.</Typography>
        </BaseModal>
      </div>
    );
  },
  args: {
    title: '기본 모달',
    subtitle: '부제목이 있는 모달입니다',
    size: 'md'
  }
};

// 폼 모달
export const FormModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);
    };

    const actions: ModalAction[] = [
      {
        key: 'cancel',
        label: '취소',
        variant: 'outlined',
        onClick: () => setOpen(false),
        disabled: loading
      },
      {
        key: 'save',
        label: '저장',
        variant: 'contained',
        onClick: handleSave,
        loading,
        disabled: loading
      }
    ];

    return (
      <div>
        <Button onClick={() => setOpen(true)}>등록 폼 열기</Button>
        <BaseModal
          open={open}
          onClose={() => setOpen(false)}
          title="직책 등록"
          subtitle="새로운 직책 정보를 입력해주세요"
          size="md"
          actions={actions}
          loading={loading}
        >
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="직책명"
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="부서명"
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="설명"
              fullWidth
              multiline
              rows={4}
              disabled={loading}
            />
          </Box>
        </BaseModal>
      </div>
    );
  }
};

// 크기 비교
export const SizeComparison: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    const sizes: Array<{ size: any; label: string }> = [
      { size: 'xs', label: 'Extra Small (400px)' },
      { size: 'sm', label: 'Small (600px)' },
      { size: 'md', label: 'Medium (800px)' },
      { size: 'lg', label: 'Large (1200px)' },
      { size: 'xl', label: 'Extra Large (1600px)' },
      { size: 'fullscreen', label: 'Full Screen' }
    ];

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {sizes.map(({ size, label }) => (
          <div key={size}>
            <Button onClick={() => setOpenModal(size)}>{label}</Button>
            <BaseModal
              open={openModal === size}
              onClose={() => setOpenModal(null)}
              title={`${label} 모달`}
              subtitle={`크기: ${size}`}
              size={size}
              actions={[
                {
                  key: 'close',
                  label: '닫기',
                  variant: 'contained',
                  onClick: () => setOpenModal(null)
                }
              ]}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {label} 모달입니다
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  이 모달의 크기는 {size}입니다.
                  내용에 따라 높이가 자동으로 조절됩니다.
                </Typography>
                <Box sx={{ mt: 2, height: '200px', bgcolor: 'grey.100', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    콘텐츠 영역
                  </Typography>
                </Box>
              </Box>
            </BaseModal>
          </div>
        ))}
      </div>
    );
  }
};

// 다양한 액션 버튼
export const ActionVariations: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const actions: ModalAction[] = [
      {
        key: 'delete',
        label: '삭제',
        variant: 'contained',
        color: 'error',
        onClick: () => setOpen(false)
      },
      {
        key: 'edit',
        label: '수정',
        variant: 'outlined',
        color: 'primary',
        onClick: () => setOpen(false)
      },
      {
        key: 'cancel',
        label: '취소',
        variant: 'text',
        onClick: () => setOpen(false)
      }
    ];

    return (
      <div>
        <Button onClick={() => setOpen(true)}>다양한 버튼 모달</Button>
        <BaseModal
          open={open}
          onClose={() => setOpen(false)}
          title="액션 버튼 예시"
          subtitle="다양한 스타일의 버튼들"
          size="sm"
          actions={actions}
        >
          <Typography>
            이 모달은 삭제, 수정, 취소 버튼을 가지고 있습니다.
            각각 다른 스타일과 색상을 사용합니다.
          </Typography>
        </BaseModal>
      </div>
    );
  }
};

// 액션 버튼 없는 모달
export const NoActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)}>액션 없는 모달</Button>
        <BaseModal
          open={open}
          onClose={() => setOpen(false)}
          title="정보 모달"
          size="sm"
          hideActions
        >
          <Typography>
            이 모달은 액션 버튼이 없습니다.
            오른쪽 상단의 X 버튼이나 ESC 키로 닫을 수 있습니다.
          </Typography>
        </BaseModal>
      </div>
    );
  }
};