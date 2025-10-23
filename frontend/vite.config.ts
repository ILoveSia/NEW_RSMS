/// <reference types="vitest" />
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
        // SCSS 경고 메시지 숨기기 (Dart Sass 3.0 호환)
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
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    // 번들 크기 최적화
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 운영 환경에서 console.log 제거
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 청크 분할 최적화 (더 세밀한 분할)
        manualChunks: {
          // React 생태계
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],

          // UI 라이브러리
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'mui-icons': ['@mui/icons-material'],

          // 데이터 그리드
          'ag-grid': ['ag-grid-react', 'ag-grid-community'],

          // 차트 라이브러리
          'charts': ['recharts'],

          // 폼 관리
          'forms': ['react-hook-form', '@hookform/resolvers', 'yup'],

          // 상태 관리
          'state-management': ['zustand', '@tanstack/react-query'],

          // 국제화
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],

          // 유틸리티
          'utils': ['axios', 'date-fns', 'clsx', 'web-vitals'],

          // 아이콘
          'icons': ['lucide-react'],

          // 토스트
          'toast': ['react-toastify']
        },
        // 파일명 최적화
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true
  }
})