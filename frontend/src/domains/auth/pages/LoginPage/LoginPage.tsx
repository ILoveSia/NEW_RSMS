import {
  Lock,
  Person,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
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
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/app/store/authStore';
import { initializeAppData } from '@/app/utils/initializeApp';
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
    username: 'admin', // 개발용 기본값
    password: 'admin123!'
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
      // 실제 API 호출
      const { loginApi } = await import('@/domains/auth/api/authApi');

      const response = await loginApi({
        username: formData.username,
        password: formData.password,
        rememberMe: false
      });

      if (response.success && response.userInfo) {
        // Backend 사용자 정보를 Frontend User 타입으로 변환
        const user = {
          userId: String(response.userInfo.userId),
          email: `${response.userInfo.username}@rsms.com`, // 임시 (Backend에서 직원 정보 조인 필요)
          empNo: response.userInfo.empNo,
          password: undefined, // 클라이언트에서는 제외
          role: response.userInfo.isAdmin ? 'ADMIN' : 'EMPLOYEE', // 기본 역할
          active: true,

          // Employee 조인 정보 (임시)
          empName: response.userInfo.username,

          // 역할 및 권한
          roles: undefined, // 필요시 추가 API 호출
          permissions: response.userInfo.roles.map(role => ({
            permissionId: role,
            permissionName: role,
            category: 'SYSTEM' as const,
            displayOrder: 0,
            active: true,
            id: role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1
          })),

          // 세션 정보
          lastLoginAt: new Date().toISOString(),

          // computed fields
          fullName: response.userInfo.username,
          roleCodes: response.userInfo.roles,

          // BaseEntity 필드
          id: String(response.userInfo.userId),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          updatedBy: 'system',
          version: 1
        };

        const sessionId = response.sessionId || `session-${Date.now()}`;

        // 로그인 처리
        login(user, sessionId);

        // 비밀번호 변경 필요 시 알림 (TODO: 비밀번호 변경 페이지로 이동)
        if (response.userInfo.needsPasswordChange) {
          console.warn('비밀번호 변경이 필요합니다');
        }

        // 로그인 후 필요한 데이터 로드 (공통코드, 메뉴 등)
        console.log('[LoginPage] 애플리케이션 데이터 로드 시작...');
        await initializeAppData();
        console.log('[LoginPage] 애플리케이션 데이터 로드 완료');

        // 성공 후 리다이렉트
        navigate(from, { replace: true });

      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }

    } catch (err: any) {
      console.error('로그인 에러:', err);

      if (err.response?.status === 401) {
        setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
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
            <img src="/src/assets/images/gjtec.jpg" alt="GJTEC Logo" className={styles.logoImage} />
            <Typography variant="h4" component="h1" className={styles.title}>
              THE HI (GJTEC)
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              책무구조도 관리시스템
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Manhattan Financial Center · Wall Street Digital Excellence
              Financial Investment Service
              Business Consulting
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

          {/* 시스템 안내 */}
          <Box className={styles.devInfo}>
            <Typography variant="body2" className={styles.systemInfoTitle}>
              📋 책무구조 관리시스템 (RSMS)
            </Typography>
            <Typography variant="body2" className={styles.systemInfoDesc}>
              조직의 책무와 관리활동을 체계적으로 관리하고,<br />
              내부통제 및 이행점검을 효율적으로 수행하는 통합 관리 시스템입니다.
            </Typography>
          </Box>
        </Paper>
      </div>
    </div>
  );
};
