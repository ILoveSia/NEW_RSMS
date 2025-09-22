import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/app/store/authStore';
import styles from './LoginPage.module.scss';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setLoading, setError, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  // 로그인 전에 접근하려던 페이지가 있으면 그곳으로, 없으면 대시보드로
  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      setError('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 실제 API 호출 대신 임시 로그인 로직
      // TODO: 실제 API 연동 시 이 부분을 수정
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

      // 임시 사용자 데이터 (개발용)
      const mockUser = {
        id: 'user-123',
        username: formData.username,
        name: formData.username === 'admin' ? '관리자' : '사용자',
        email: `${formData.username}@rsms.com`,
        roleCodes: formData.username === 'admin' ? ['ADMIN'] : ['EMPLOYEE'],
        permissions: [
          { permissionId: 'READ', name: '읽기' },
          { permissionId: 'WRITE', name: '쓰기' },
          ...(formData.username === 'admin' ? [{ permissionId: 'ADMIN', name: '관리자' }] : [])
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockSessionId = `session-${Date.now()}`;

      // 로그인 처리
      login(mockUser, mockSessionId);

      // 성공 후 리다이렉트
      navigate(from, { replace: true });

    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <Paper className={styles.loginPaper} elevation={3}>
          {/* 로고 및 헤더 */}
          <Box className={styles.loginHeader}>
            <div className={styles.logo}>🏙️</div>
            <Typography variant="h4" component="h1" className={styles.title}>
              ITCEN ENTEC
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              책무구조도 관리시스템
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Manhattan Financial Center · Wall Street Digital Excellence
            </Typography>
          </Box>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {error && (
              <Alert severity="error" className={styles.errorAlert}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              disabled={isLoading}
              autoFocus
              placeholder="사용자명을 입력하세요"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              disabled={isLoading}
              placeholder="비밀번호를 입력하세요"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>

          {/* 개발 안내 */}
          <Box className={styles.devInfo}>
            <Typography variant="caption" color="textSecondary">
              개발 테스트용 로그인
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • <strong>admin</strong> / 아무 비밀번호 → 관리자 권한<br />
              • <strong>user</strong> / 아무 비밀번호 → 일반 사용자 권한
            </Typography>
          </Box>
        </Paper>
      </div>
    </div>
  );
};
