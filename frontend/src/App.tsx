import React, { useEffect } from 'react';

import AppRouter from './app/router/AppRouter';
import { initializeTheme } from './app/store/themeStore';
import { initPerformanceMonitoring } from './shared/utils/performance';

import styles from './App.module.scss';

const App: React.FC = () => {
  useEffect(() => {
    // 테마 시스템 초기화
    initializeTheme();

    // 성능 모니터링 초기화
    initPerformanceMonitoring();

    // 개발 환경에서 성능 보고서 생성 단축키 추가
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Ctrl + Shift + P로 성능 보고서 출력
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          import('./shared/utils/performance').then(({ generatePerformanceReport }) => {
            console.log(generatePerformanceReport());
          });
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <div className={styles.app}>
      <AppRouter />
    </div>
  );
};

export default App;