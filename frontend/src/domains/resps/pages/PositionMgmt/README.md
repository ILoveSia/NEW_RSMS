# PositionMgmt 컴포넌트 문서

## 📋 개요

**PositionMgmt**는 RSMS 시스템의 직책 관리 페이지로, 조직의 직책 정보를 체계적으로 관리하는 메인 컴포넌트입니다.

## 🏗️ 아키텍처

### 컴포넌트 구조

```
PositionMgmt/
├── PositionMgmt.tsx              # 메인 컴포넌트
├── PositionMgmt.module.scss      # 스타일 시트
├── PositionMgmt.test.tsx         # 통합 테스트
├── components/                   # 하위 컴포넌트
│   ├── PositionSearchFilter/     # 검색 필터 컴포넌트
│   └── PositionDataGrid/         # 데이터 그리드 컴포넌트
├── types/                        # TypeScript 타입 정의
│   └── position.types.ts
└── README.md                     # 이 문서
```

### 기술 스택

- **React 18.3.1**: Functional Components + Hooks
- **TypeScript**: 완전한 타입 안전성
- **CSS Modules + SCSS**: 스타일링
- **Material-UI**: UI 컴포넌트
- **AG-Grid**: 엔터프라이즈 데이터 그리드
- **React i18next**: 다국어 지원

## 🚀 주요 기능

### 1. 성능 최적화
- **React.memo**: 불필요한 리렌더링 방지
- **useMemo/useCallback**: 계산 및 함수 메모이제이션
- **지연 로딩**: PositionDataGrid 컴포넌트 지연 로딩
- **Tree-shaking**: Material-UI 아이콘 개별 import

### 2. 성능 모니터링
- **React.Profiler**: 렌더링 성능 측정
- **Web Performance API**: 페이지 로드 성능 측정
- **개발 환경 전용**: 프로덕션에 영향 없음

### 3. 테마 시스템
- **8가지 브랜드 테마**: 기본, 넷플릭스, 아마존, 인스타그램, 맨하탄, WhatsApp, 애플, 구글
- **동적 테마 변경**: 실시간 테마 전환
- **CSS 변수**: `var(--theme-*)` 활용

### 4. 접근성
- **WCAG 2.1 AA 준수**: 접근성 표준 준수
- **키보드 네비게이션**: 키보드만으로 모든 기능 사용 가능
- **스크린 리더 지원**: 적절한 ARIA 라벨

## 🔧 Props 인터페이스

```typescript
interface PositionMgmtProps {
  className?: string;  // 추가 CSS 클래스
}
```

## 📊 상태 관리

### 주요 State

```typescript
// 직책 데이터
const [positions, setPositions] = useState<Position[]>([]);

// 로딩 상태
const [loading, setLoading] = useState<boolean>(false);
const [loadingStates, setLoadingStates] = useState({
  search: false,
  excel: false,
  delete: false,
});

// 필터 및 페이지네이션
const [filters, setFilters] = useState<PositionFilters>({
  positionName: '',
  headquarters: '',
  status: '',
  isActive: ''
});

const [pagination, setPagination] = useState<PositionPagination>({
  page: 1,
  size: 20,
  total: 0,
  totalPages: 0
});

// 모달 상태
const [modalState, setModalState] = useState<PositionModalState>({
  addModal: false,
  detailModal: false,
  selectedPosition: null
});

// 선택된 항목
const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
```

### 메모이제이션된 계산값

```typescript
// 통계 데이터 (성능 최적화)
const statistics = useMemo(() => {
  const total = pagination.total;
  const activeCount = positions.filter(p => p.isActive).length;
  const inactiveCount = positions.filter(p => !p.isActive).length;
  const systemUptime = 98.5; // TODO: 실제 시스템 가동률 API 연동

  return {
    total,
    activeCount,
    inactiveCount,
    systemUptime
  };
}, [pagination.total, positions]);

// 표시용 직책 데이터 (성능 최적화)
const displayPositions = useMemo(() => {
  return positions; // TODO: 클라이언트 사이드 필터링이 필요한 경우 추가
}, [positions]);
```

## 🎨 UI 구조

### 1. 페이지 헤더
```jsx
<div className={styles.pageHeader}>
  <div className={styles.headerContent}>
    <div className={styles.titleSection}>
      <DashboardIcon className={styles.headerIcon} />
      <h1>{t('position.management.title')}</h1>
      <p>{t('position.management.description')}</p>
    </div>

    <div className={styles.headerStats}>
      {/* 통계 카드들 */}
    </div>
  </div>
</div>
```

### 2. 검색 필터
```jsx
<div className={styles.searchSection}>
  <PositionSearchFilter
    filters={filters}
    onFiltersChange={handleFiltersChange}
    onSearch={handleSearch}
    onClear={handleClearFilters}
    loading={loading}
  />
</div>
```

### 3. 액션 바
```jsx
<div className={styles.actionBar}>
  <div className={styles.actionLeft}>
    <div className={styles.totalCount}>
      총 직책 수: {statistics.total}개
    </div>
    <div className={styles.statusIndicators}>
      {/* 활성/비활성 Chip */}
    </div>
  </div>

  <div className={styles.actionRight}>
    <Button onClick={handleExcelDownload}>엑셀다운로드</Button>
    <Button onClick={handleAddPosition}>등록</Button>
    <Button onClick={handleDeletePositions}>삭제</Button>
  </div>
</div>
```

### 4. 데이터 그리드 (지연 로딩)
```jsx
<div className={styles.gridSection}>
  <React.Suspense fallback={<LoadingSpinner />}>
    <PositionDataGrid
      data={displayPositions}
      loading={loading}
      onRowClick={handleRowClick}
      onRowDoubleClick={handleRowDoubleClick}
      onSelectionChange={handleSelectionChange}
      height="calc(100vh - 400px)"
    />
  </React.Suspense>
</div>
```

## 🔄 이벤트 핸들러

### 필터 및 검색
```typescript
const handleFiltersChange = useCallback((newFilters: Partial<PositionFilters>) => {
  setFilters(prev => ({ ...prev, ...newFilters }));
}, []);

const handleSearch = useCallback(async () => {
  setLoading(true);
  setLoadingStates(prev => ({ ...prev, search: true }));
  setPagination(prev => ({ ...prev, page: 1 }));

  const loadingToastId = toast.loading('직책 정보를 검색 중입니다...');

  try {
    // TODO: 실제 API 호출로 교체
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.update(loadingToastId, 'success', '검색이 완료되었습니다.');
  } catch (error) {
    toast.update(loadingToastId, 'error', '검색에 실패했습니다.');
  } finally {
    setLoading(false);
    setLoadingStates(prev => ({ ...prev, search: false }));
  }
}, [filters]);
```

### 그리드 이벤트
```typescript
const handleRowClick = useCallback((position: Position) => {
  console.log('행 클릭:', position);
}, []);

const handleRowDoubleClick = useCallback((position: Position) => {
  handleViewPosition(position);
}, [handleViewPosition]);

const handleSelectionChange = useCallback((selected: Position[]) => {
  setSelectedPositions(selected);
  console.log('선택된 행:', selected.length);
}, []);
```

### 액션 버튼
```typescript
const handleAddPosition = useCallback(() => {
  setModalState(prev => ({
    ...prev,
    addModal: true,
    selectedPosition: null
  }));
  toast.info('새 직책을 등록해주세요.', { autoClose: 2000 });
}, []);

const handleExcelDownload = useCallback(async () => {
  setLoadingStates(prev => ({ ...prev, excel: true }));
  const loadingToastId = toast.loading('엑셀 파일을 생성 중입니다...');

  try {
    // TODO: 실제 엑셀 다운로드 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.update(loadingToastId, 'success', '엑셀 파일이 다운로드되었습니다.');
  } catch (error) {
    toast.update(loadingToastId, 'error', '엑셀 다운로드에 실패했습니다.');
  } finally {
    setLoadingStates(prev => ({ ...prev, excel: false }));
  }
}, []);

const handleDeletePositions = useCallback(async () => {
  if (selectedPositions.length === 0) {
    toast.warning('삭제할 직책을 선택해주세요.');
    return;
  }

  const confirmMessage = `선택된 ${selectedPositions.length}개의 직책을 삭제하시겠습니까?`;
  if (!window.confirm(confirmMessage)) return;

  setLoadingStates(prev => ({ ...prev, delete: true }));
  const loadingToastId = toast.loading(`${selectedPositions.length}개 직책을 삭제 중입니다...`);

  try {
    // TODO: 실제 삭제 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPositions(prev =>
      prev.filter(pos => !selectedPositions.some(selected => selected.id === pos.id))
    );
    setPagination(prev => ({
      ...prev,
      total: prev.total - selectedPositions.length
    }));
    setSelectedPositions([]);

    toast.update(loadingToastId, 'success', `${selectedPositions.length}개 직책이 삭제되었습니다.`);
  } catch (error) {
    toast.update(loadingToastId, 'error', '직책 삭제에 실패했습니다.');
  } finally {
    setLoadingStates(prev => ({ ...prev, delete: false }));
  }
}, [selectedPositions]);
```

## 📈 성능 최적화

### 1. React.memo 활용
```typescript
const PositionSearchFilter = React.memo(({ /* props */ }) => {
  // 컴포넌트 로직
});
PositionSearchFilter.displayName = 'PositionSearchFilter';
```

### 2. useMemo/useCallback 활용
```typescript
// 번역 의존 옵션 메모이제이션
const headquartersOptions = useMemo(() => [
  { value: '', label: t('common.all') },
  { value: '본부부서', label: '본부부서' },
  // ...
], [t]);

// 이벤트 핸들러 메모이제이션
const handleInputChange = useCallback((field: keyof PositionFilters) => (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  onFiltersChange({ [field]: event.target.value });
}, [onFiltersChange]);
```

### 3. 지연 로딩
```typescript
// 무거운 AG-Grid 컴포넌트 지연 로딩
const PositionDataGrid = React.lazy(() => import('./components/PositionDataGrid/PositionDataGrid'));

// Suspense로 래핑
<React.Suspense fallback={<LoadingSpinner />}>
  <PositionDataGrid {...props} />
</React.Suspense>
```

### 4. Tree-shaking 최적화
```typescript
// ❌ 잘못된 방법 (전체 아이콘 번들 포함)
import { Add, Delete, FileDownload } from '@mui/icons-material';

// ✅ 올바른 방법 (개별 import로 tree-shaking)
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExcelIcon from '@mui/icons-material/FileDownload';
```

## 🎯 성능 모니터링

### React.Profiler 통합
```typescript
const onRenderProfiler = useCallback((
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 PositionMgmt Performance Profiler`);
    console.log(`📊 Phase: ${phase}`);
    console.log(`⏱️ Actual Duration: ${actualDuration.toFixed(2)}ms`);
    console.log(`📏 Base Duration: ${baseDuration.toFixed(2)}ms`);

    if (actualDuration > 16) { // 60fps 기준 16ms 초과 시 경고
      console.warn(`⚠️ 성능 주의: 렌더링 시간이 16ms를 초과했습니다 (${actualDuration.toFixed(2)}ms)`);
    }
    console.groupEnd();
  }
}, []);

// 컴포넌트를 Profiler로 감싸기
return (
  <React.Profiler id="PositionMgmt" onRender={onRenderProfiler}>
    {/* 컴포넌트 내용 */}
  </React.Profiler>
);
```

### Web Performance API
```typescript
React.useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    const measurePageLoad = () => {
      if (performance.getEntriesByType) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.group(`📊 Page Load Performance`);
          console.log(`🌐 DNS 조회: ${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
          console.log(`🔗 연결 시간: ${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
          console.log(`📥 응답 시간: ${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
          console.log(`🎨 DOM 로딩: ${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`);
          console.log(`🏁 전체 로딩: ${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`);
          console.groupEnd();
        }
      }
    };

    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }
}, []);
```

## 🧪 테스트 전략

### 단위 테스트 (45개)
- **PositionSearchFilter**: 15개 테스트
- **PositionDataGrid**: 12개 테스트
- **PositionMgmt**: 18개 테스트

### 테스트 범위
- ✅ 컴포넌트 렌더링
- ✅ 사용자 인터랙션
- ✅ 상태 관리
- ✅ 이벤트 핸들링
- ✅ 성능 최적화 검증
- ✅ 접근성 확인

### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 커버리지 포함 테스트
npm run test:coverage

# UI 모드로 테스트
npm run test:ui
```

## 🌍 다국어 지원

### 번역 키 구조
```typescript
// 사용 예시
const { t } = useTranslation('resps');

// 번역 키들
t('position.management.title')        // "직책관리 시스템"
t('position.management.description')  // "조직의 직책 정보를 체계적으로 관리합니다"
t('position.fields.positionName')     // "직책명"
t('position.fields.headquarters')     // "본부구분"
t('common.search')                    // "검색"
t('common.all')                       // "전체"
```

## 🎨 테마 시스템

### CSS 변수 활용
```scss
.pageHeader {
  background: var(--theme-page-header-bg);
  color: var(--theme-page-header-text);
}

.actionButton {
  background: var(--theme-button-primary);
  color: var(--theme-button-primary-text);
}
```

### 테마 적용 영역
- ✅ TopHeader
- ✅ LeftMenu
- ✅ PageHeader
- ✅ Button 컴포넌트
- ✅ 통계 카드
- ✅ 검색 필터

## 🔄 TODO 및 개선 사항

### 단기 개선사항
- [ ] 실제 API 연동 (현재 Mock 데이터)
- [ ] 실시간 데이터 업데이트 (WebSocket)
- [ ] 무한 스크롤 또는 가상화
- [ ] 고급 필터링 옵션

### 장기 개선사항
- [ ] 모바일 반응형 최적화
- [ ] 오프라인 지원
- [ ] PWA 기능 추가
- [ ] A11Y 고도화

## 📞 문의 및 지원

컴포넌트 관련 문의사항이나 개선 제안은 다음을 통해 연락해주세요:

- **개발팀**: RSMS Frontend Team
- **문서 버전**: v1.0.0
- **최종 업데이트**: 2025-09-18

---

**📝 작성자**: Claude AI (RSMS 개발 지원)
**🎯 문서 목적**: PositionMgmt 컴포넌트 완전 가이드
**🚀 사용 기술**: React, TypeScript, CSS Modules, Material-UI, AG-Grid