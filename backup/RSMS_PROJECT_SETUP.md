# RSMS 프로젝트 설정 가이드 (CSS Modules + SCSS)

## 📦 프로젝트 초기 설정

### 1. 프로젝트 생성
```bash
# Vite + React + TypeScript 프로젝트 생성
npm create vite@latest rsms-frontend -- --template react-ts
cd rsms-frontend

# Git 초기화
git init
```

### 2. 필수 패키지 설치
```bash
# UI 라이브러리 (Emotion 제외)
npm install @mui/material @mui/icons-material
npm install @mui/x-date-pickers
npm install @fontsource/pretendard

# 상태 관리 & API
npm install zustand @tanstack/react-query axios

# 폼 & 라우팅
npm install react-hook-form react-router-dom
npm install @hookform/resolvers yup

# AG-Grid (강력한 데이터 그리드)
npm install ag-grid-react ag-grid-community
npm install @types/ag-grid-community
# 유료 버전 사용 시: npm install ag-grid-enterprise

# 유틸리티
npm install clsx dayjs
npm install lodash @types/lodash

# SCSS & CSS Modules 관련
npm install sass
npm install -D @types/node

# 개발 도구
npm install -D eslint prettier
npm install -D @typescript-eslint/eslint-plugin
npm install -D @typescript-eslint/parser
npm install -D eslint-config-prettier
npm install -D eslint-plugin-react
npm install -D eslint-plugin-react-hooks

# 테스팅
npm install -D vitest jsdom
npm install -D @testing-library/react
npm install -D @testing-library/jest-dom
npm install -D @testing-library/user-event
```

### 3. 프로젝트 구조 생성
```bash
# 기본 폴더 구조 생성
mkdir -p src/shared/{components/{atoms,molecules,organisms,templates},hooks,utils,types,constants}
mkdir -p src/shared/styles/{variables,mixins,globals,themes}
mkdir -p src/domains/{user,audit,resp,approval}
mkdir -p src/app/{router,store,config,providers,layouts}

# 각 도메인별 폴더 구조
for domain in user audit resp approval; do
  mkdir -p src/domains/$domain/{api,components,pages,hooks,store,types}
done

# 공통 컴포넌트 폴더 구조
mkdir -p src/shared/components/atoms/{Button,TextField,Select,Checkbox,Radio,DatePicker}
mkdir -p src/shared/components/molecules/{SearchBar,FormField,Card,Dialog,Tabs,Alert}
mkdir -p src/shared/components/organisms/{DataTable,Form,FileUpload,Sidebar,Header}
mkdir -p src/shared/components/templates/{ListPageTemplate,DetailPageTemplate,FormPageTemplate}

# 스타일 세부 폴더
mkdir -p src/shared/styles/variables
mkdir -p src/shared/styles/mixins
mkdir -p src/shared/styles/globals
mkdir -p src/shared/styles/themes
```

## ⚙️ 설정 파일들

### 1. vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@domains': path.resolve(__dirname, './src/domains'),
      '@app': path.resolve(__dirname, './src/app')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // SCSS 글로벌 변수와 믹스인 자동 import
        additionalData: `
          @import "@/shared/styles/variables/index.scss";
          @import "@/shared/styles/mixins/index.scss";
        `
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'dayjs', 'lodash']
        }
      }
    }
  }
})
```

### 2. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@domains/*": ["./src/domains/*"],
      "@app/*": ["./src/app/*"]
    }
  },
  "include": ["src", "**/*.ts", "**/*.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. package.json 스크립트 추가
```json
{
  "name": "rsms-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,scss,css,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,scss,css,json,md}\"",
    "clean": "rm -rf dist node_modules/.cache",
    "analyze": "npm run build && npx vite-bundle-analyzer dist/assets/*.js"
  }
}
```

### 4. .eslintrc.cjs
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // CSS Modules 관련 규칙
    'react/prop-types': 'off', // TypeScript 사용으로 비활성화
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    
    // 스타일 관련 금지 규칙
    'react/forbid-dom-props': ['error', {
      forbid: [
        { propName: 'style', message: '인라인 스타일 대신 CSS Modules를 사용하세요.' },
        { propName: 'sx', message: 'sx prop 대신 CSS Modules를 사용하세요.' }
      ]
    }]
  }
}
```

### 5. .prettierrc.json
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 6. vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, './src/shared'),
      '@domains': resolve(__dirname, './src/domains'),
      '@app': resolve(__dirname, './src/app')
    }
  }
})
```

## 🎨 SCSS 기본 구조 파일들

### 1. src/shared/styles/variables/index.scss
```scss
// 모든 변수들을 통합하는 메인 파일
@import 'colors';
@import 'spacing';
@import 'typography';
@import 'shadows';
@import 'breakpoints';
@import 'borders';
```

### 2. src/shared/styles/variables/_colors.scss
```scss
// Primary Palette
$color-primary: #1976d2;
$color-primary-light: #42a5f5;
$color-primary-dark: #1565c0;
$color-primary-contrast: #ffffff;

// Secondary Palette
$color-secondary: #dc004e;
$color-secondary-light: #f05545;
$color-secondary-dark: #9a0036;
$color-secondary-contrast: #ffffff;

// Semantic Colors
$color-success: #4caf50;
$color-success-light: #81c784;
$color-success-dark: #388e3c;

$color-warning: #ff9800;
$color-warning-light: #ffb74d;
$color-warning-dark: #f57c00;

$color-error: #f44336;
$color-error-light: #ef5350;
$color-error-dark: #d32f2f;

$color-info: #2196f3;
$color-info-light: #64b5f6;
$color-info-dark: #1976d2;

// Neutral Colors
$color-white: #ffffff;
$color-black: #000000;

// Gray Scale
$color-gray-50: #fafafa;
$color-gray-100: #f5f5f5;
$color-gray-200: #eeeeee;
$color-gray-300: #e0e0e0;
$color-gray-400: #bdbdbd;
$color-gray-500: #9e9e9e;
$color-gray-600: #757575;
$color-gray-700: #616161;
$color-gray-800: #424242;
$color-gray-900: #212121;

// Background Colors
$color-background-default: $color-gray-50;
$color-background-paper: $color-white;
$color-background-overlay: rgba(0, 0, 0, 0.5);

// Text Colors
$color-text-primary: rgba(0, 0, 0, 0.87);
$color-text-secondary: rgba(0, 0, 0, 0.6);
$color-text-disabled: rgba(0, 0, 0, 0.38);
$color-text-hint: rgba(0, 0, 0, 0.38);

// Border Colors
$color-border-default: $color-gray-300;
$color-border-light: $color-gray-200;
$color-border-dark: $color-gray-400;
```

### 3. src/shared/styles/variables/_spacing.scss
```scss
// Base unit (8px system)
$spacing-unit: 8px;

// Spacing Scale
$spacing-xxs: $spacing-unit * 0.25;  // 2px
$spacing-xs: $spacing-unit * 0.5;    // 4px
$spacing-sm: $spacing-unit;          // 8px
$spacing-md: $spacing-unit * 2;      // 16px
$spacing-lg: $spacing-unit * 3;      // 24px
$spacing-xl: $spacing-unit * 4;      // 32px
$spacing-xxl: $spacing-unit * 6;     // 48px
$spacing-xxxl: $spacing-unit * 8;    // 64px

// Component Specific Spacing
$button-padding-x: $spacing-md;
$button-padding-y: $spacing-sm;
$input-padding-x: $spacing-md;
$input-padding-y: $spacing-sm;
$card-padding: $spacing-lg;
$modal-padding: $spacing-xl;

// Layout Spacing
$container-padding: $spacing-lg;
$section-margin: $spacing-xxl;
$header-height: 64px;
$sidebar-width: 280px;
```

### 4. src/shared/styles/mixins/index.scss
```scss
// 모든 믹스인들을 통합하는 메인 파일
@import 'layout';
@import 'responsive';
@import 'effects';
@import 'typography';
@import 'forms';
```

### 5. src/shared/styles/mixins/_layout.scss
```scss
// Flexbox 유틸리티
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

@mixin flex-end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

// 절대 위치 중앙 정렬
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 크기 설정
@mixin size($width, $height: $width) {
  width: $width;
  height: $height;
}

// 컨테이너 설정
@mixin container($max-width: 1200px) {
  max-width: $max-width;
  margin: 0 auto;
  padding: 0 $container-padding;
}

// 카드 스타일
@mixin card {
  background-color: $color-background-paper;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $card-padding;
}

// 그리드 시스템
@mixin grid($columns: 12, $gap: $spacing-md) {
  display: grid;
  grid-template-columns: repeat($columns, 1fr);
  gap: $gap;
}
```

### 6. src/shared/styles/globals/index.scss
```scss
// 전역 스타일 통합
@import 'reset';
@import 'base';
@import 'utilities';
@import 'fonts';
```

### 7. src/shared/styles/globals/_reset.scss
```scss
// Modern CSS Reset
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;
  color: $color-text-primary;
  background-color: $color-background-default;
  min-height: 100vh;
}

// Remove default button styles
button {
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

// Remove default input styles
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}

// Remove default list styles
ul,
ol {
  list-style: none;
}

// Remove default anchor styles
a {
  color: inherit;
  text-decoration: none;
}

// Image defaults
img {
  max-width: 100%;
  height: auto;
}

// Table defaults
table {
  border-collapse: collapse;
  width: 100%;
}
```

## 🚀 개발 환경 실행

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 개발 시 체크리스트
```bash
# 타입 체크
npm run type-check

# 린트 검사 및 수정
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format

# 테스트 실행
npm run test

# 빌드
npm run build
```

### 3. VS Code 확장 프로그램 권장
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "syler.sass-indented",
    "ms-vscode.vscode-css-peek"
  ]
}
```

### 4. VS Code 설정
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "css.validate": true,
  "scss.validate": true,
  "files.associations": {
    "*.scss": "scss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

이제 CSS Modules + SCSS 기반의 완벽한 개발 환경이 구축되었습니다! 🎉

다음 단계로 실제 컴포넌트 예제를 만들어보겠습니다.
