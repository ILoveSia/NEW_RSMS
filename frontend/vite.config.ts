import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      // 기본 경로
      '@': resolve(__dirname, './src'),
      
      // 도메인별 경로 (DDD 구조)
      '@/domains': resolve(__dirname, './src/domains'),
      '@/domains/auth': resolve(__dirname, './src/domains/auth'),
      '@/domains/users': resolve(__dirname, './src/domains/users'),
      '@/domains/risks': resolve(__dirname, './src/domains/risks'),
      '@/domains/reports': resolve(__dirname, './src/domains/reports'),
      '@/domains/dashboard': resolve(__dirname, './src/domains/dashboard'),
      '@/domains/settings': resolve(__dirname, './src/domains/settings'),
      
      // 공통 리소스
      '@/shared': resolve(__dirname, './src/shared'),
      '@/components': resolve(__dirname, './src/shared/components'),
      '@/hooks': resolve(__dirname, './src/shared/hooks'),
      '@/utils': resolve(__dirname, './src/shared/utils'),
      '@/types': resolve(__dirname, './src/shared/types'),
      
      // 앱 설정
      '@/app': resolve(__dirname, './src/app'),
      '@/router': resolve(__dirname, './src/app/router'),
      '@/store': resolve(__dirname, './src/app/store'),
      '@/config': resolve(__dirname, './src/app/config'),
      
      // 정적 자원
      '@/styles': resolve(__dirname, './src/styles'),
      '@/assets': resolve(__dirname, './src/assets')
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // SCSS 글로벌 변수와 믹신을 모든 .scss 파일에 자동 import
        additionalData: `
          @import "@/styles/variables";
          @import "@/styles/mixins";
        `,
        // SCSS 경고 메시지 숨기기
        silenceDeprecations: ['legacy-js-api', 'import']
      }
    },
    modules: {
      // CSS Modules 설정
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },

  server: {
    port: 4000,
    open: true,
    cors: true,
    proxy: {
      // API 프록시 설정 (백엔드 서버 연결 시 사용)
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // 청크 분할 최적화
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          grid: ['ag-grid-react', 'ag-grid-community'],
          forms: ['react-hook-form', '@hookform/resolvers', 'yup'],
          state: ['zustand', '@tanstack/react-query'],
          utils: ['axios', 'date-fns', 'clsx']
        }
      }
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true
  }
})