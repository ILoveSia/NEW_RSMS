import React from 'react';

import AppRouter from './app/router/AppRouter';

import styles from './App.module.scss';

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <AppRouter />
    </div>
  );
};

export default App;