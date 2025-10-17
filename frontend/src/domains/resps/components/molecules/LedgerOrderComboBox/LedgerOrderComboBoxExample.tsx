/**
 * LedgerOrderComboBox 사용 예시 컴포넌트
 *
 * @description LedgerOrderComboBox의 다양한 사용 방법을 보여주는 예시 컴포넌트
 * @author Claude AI
 * @since 2025-10-16
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, Divider, Button } from '@mui/material';
import { LedgerOrderComboBox } from './index';

/**
 * LedgerOrderComboBox 사용 예시 컴포넌트
 */
const LedgerOrderComboBoxExample: React.FC = () => {
  const [basicValue, setBasicValue] = useState<string | null>(null);
  const [requiredValue, setRequiredValue] = useState<string | null>(null);
  const [smallValue, setSmallValue] = useState<string | null>(null);
  const [errorValue, setErrorValue] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  /**
   * 제출 핸들러 (검증 예시)
   */
  const handleSubmit = () => {
    if (!requiredValue) {
      setShowError(true);
      alert('원장차수를 선택하세요!');
      return;
    }

    alert(`선택된 원장차수: ${requiredValue}`);
    setShowError(false);
  };

  /**
   * 초기화 핸들러
   */
  const handleReset = () => {
    setBasicValue(null);
    setRequiredValue(null);
    setSmallValue(null);
    setErrorValue(null);
    setShowError(false);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        LedgerOrderComboBox 사용 예시
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        원장차수 콤보박스의 다양한 사용 방법을 확인할 수 있습니다.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* 기본 사용 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. 기본 사용
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          가장 기본적인 형태의 콤보박스입니다.
        </Typography>
        <LedgerOrderComboBox
          value={basicValue}
          onChange={setBasicValue}
          label="원장차수"
        />
        {basicValue && (
          <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
            선택된 값: {basicValue}
          </Typography>
        )}
      </Paper>

      {/* 필수 입력 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          2. 필수 입력 (Required)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          필수 입력 필드로 설정된 콤보박스입니다.
        </Typography>
        <LedgerOrderComboBox
          value={requiredValue}
          onChange={setRequiredValue}
          label="원장차수"
          required
          error={showError && !requiredValue}
          helperText={
            showError && !requiredValue
              ? '원장차수를 선택하세요'
              : '필수 입력 항목입니다'
          }
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={handleSubmit}>
            제출
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            초기화
          </Button>
        </Box>
      </Paper>

      {/* 작은 크기 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          3. 작은 크기 (Small)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          size="small" 속성으로 작게 표시된 콤보박스입니다.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LedgerOrderComboBox
            value={smallValue}
            onChange={setSmallValue}
            label="원장차수"
            size="small"
            fullWidth={false}
            placeholder="선택하세요"
          />
          {smallValue && (
            <Typography variant="body2" color="primary">
              선택: {smallValue}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* 에러 상태 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          4. 에러 상태
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          검증 실패 시 에러 상태를 표시합니다.
        </Typography>
        <LedgerOrderComboBox
          value={errorValue}
          onChange={setErrorValue}
          label="원장차수"
          required
          error={!errorValue}
          helperText={
            !errorValue
              ? '이 필드는 필수입니다'
              : '올바르게 선택되었습니다'
          }
        />
      </Paper>

      {/* 비활성화 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          5. 비활성화 (Disabled)
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          disabled 속성으로 비활성화된 콤보박스입니다.
        </Typography>
        <LedgerOrderComboBox
          value="20250001"
          onChange={() => {}}
          label="원장차수"
          disabled
          helperText="이 필드는 수정할 수 없습니다"
        />
      </Paper>

      {/* 선택된 값 요약 */}
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          선택된 값 요약
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2">
          • 기본: {basicValue || '(선택 안 됨)'}
        </Typography>
        <Typography variant="body2">
          • 필수: {requiredValue || '(선택 안 됨)'}
        </Typography>
        <Typography variant="body2">
          • 작은 크기: {smallValue || '(선택 안 됨)'}
        </Typography>
        <Typography variant="body2">
          • 에러 상태: {errorValue || '(선택 안 됨)'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LedgerOrderComboBoxExample;
