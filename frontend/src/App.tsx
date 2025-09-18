import React, { useEffect } from 'react';

import AppRouter from './app/router/AppRouter';
import { initializeTheme } from './app/store/themeStore';

import styles from './App.module.scss';

const App: React.FC = () => {
  useEffect(() => {
    // 테마 시스템 초기화
    initializeTheme();
  }, []);

  return (
    <div className={styles.app}>
      <AppRouter />
    </div>
  );
};

export default App;