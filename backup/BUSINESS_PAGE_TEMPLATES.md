# RSMS 업무 화면 템플릿 가이드

## 📋 개요
업무 시스템에서 가장 많이 사용되는 화면 패턴들을 템플릿화하여 빠른 개발을 지원합니다.
모든 템플릿은 CSS Modules + SCSS로 구현되었습니다.

## 🏗️ 템플릿 구조

```
templates/
├── ListPageTemplate/     # 목록 화면
├── DetailPageTemplate/   # 상세 화면  
├── FormPageTemplate/     # 입력/수정 화면
├── DashboardTemplate/    # 대시보드 화면
└── ModalTemplate/        # 모달 화면
```

## 📄 ListPageTemplate (목록 화면)

가장 많이 사용되는 CRUD 목록 화면 템플릿입니다.

### ListPageTemplate.tsx
```typescript
import React from 'react';
import { clsx } from 'clsx';
import { Breadcrumbs, Typography } from '@mui/material';
import styles from './ListPageTemplate.module.scss';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface ListPageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  searchBar?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const ListPageTemplate: React.FC<ListPageTemplateProps> = ({
  title,
  subtitle,
  breadcrumbs,
  searchBar,
  filters,
  actions,
  children,
  loading = false,
  error,
  className,
}) => {
  return (
    <div className={clsx(styles.listPage, className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs className={styles.breadcrumbs}>
            {breadcrumbs.map((item, index) => (
              <Typography
                key={index}
                color={item.path ? 'primary' : 'textPrimary'}
                className={item.path ? styles.breadcrumbLink : undefined}
                onClick={item.onClick || (item.path ? () => window.location.href = item.path : undefined)}
              >
                {item.label}
              </Typography>
            ))}
          </Breadcrumbs>
        </div>
      )}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <Typography variant="h4" component="h1" className={styles.title}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" className={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </div>
        
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>

      {/* Search & Filter Section */}
      {(searchBar || filters) && (
        <div className={styles.filterSection}>
          {searchBar && (
            <div className={styles.searchBarWrapper}>
              {searchBar}
            </div>
          )}
          
          {filters && (
            <div className={styles.filtersWrapper}>
              {filters}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={styles.contentSection}>
        {error ? (
          <div className={styles.errorState}>
            <Typography color="error">{error}</Typography>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
```

### ListPageTemplate.module.scss
```scss
.listPage {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: $spacing-lg;
  background-color: $color-background-default;
  
  .breadcrumbsWrapper {
    margin-bottom: $spacing-md;
    
    .breadcrumbs {
      font-size: $font-size-sm;
      
      .breadcrumbLink {
        cursor: pointer;
        @include hover-opacity(0.8);
      }
    }
  }
  
  .pageHeader {
    @include flex-between;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $color-border-light;
    
    .titleSection {
      .title {
        font-weight: $font-weight-bold;
        color: $color-text-primary;
        margin-bottom: $spacing-xs;
      }
      
      .subtitle {
        color: $color-text-secondary;
      }
    }
    
    .actions {
      @include flex-start;
      gap: $spacing-sm;
      
      @include mobile {
        flex-direction: column;
        align-items: stretch;
        gap: $spacing-xs;
      }
    }
  }
  
  .filterSection {
    background-color: $color-background-paper;
    border: 1px solid $color-border-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    margin-bottom: $spacing-lg;
    
    .searchBarWrapper {
      margin-bottom: $spacing-md;
    }
    
    .filtersWrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: $spacing-md;
      
      @include mobile {
        grid-template-columns: 1fr;
        gap: $spacing-sm;
      }
    }
  }
  
  .contentSection {
    flex: 1;
    background-color: $color-background-paper;
    border: 1px solid $color-border-light;
    border-radius: $border-radius-lg;
    padding: $spacing-lg;
    overflow: auto;
    
    .errorState {
      @include flex-center;
      min-height: 200px;
      color: $color-error;
    }
  }
  
  // Responsive
  @include mobile {
    padding: $spacing-md;
    
    .pageHeader {
      flex-direction: column;
      align-items: stretch;
      gap: $spacing-md;
    }
    
    .filterSection,
    .contentSection {
      padding: $spacing-md;
    }
  }
}
```

## 📝 FormPageTemplate (입력/수정 화면)

폼 기반 화면을 위한 템플릿입니다.

### FormPageTemplate.tsx
```typescript
import React from 'react';
import { clsx } from 'clsx';
import { Typography, Divider } from '@mui/material';
import { Button } from '@shared/components/atoms/Button';
import styles from './FormPageTemplate.module.scss';

interface FormPageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
  loading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  className?: string;
}

export const FormPageTemplate: React.FC<FormPageTemplateProps> = ({
  title,
  subtitle,
  children,
  onSubmit,
  onCancel,
  submitText = '저장',
  cancelText = '취소',
  submitDisabled = false,
  loading = false,
  maxWidth = 'md',
  showFooter = true,
  footerContent,
  className,
}) => {
  return (
    <div className={clsx(styles.formPage, className)}>
      <div className={clsx(styles.container, styles[`container--${maxWidth}`])}>
        {/* Header */}
        <div className={styles.header}>
          <Typography variant="h4" component="h1" className={styles.title}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" className={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </div>

        <Divider className={styles.divider} />

        {/* Form Content */}
        <div className={styles.content}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <>
            <Divider className={styles.divider} />
            <div className={styles.footer}>
              {footerContent || (
                <div className={styles.defaultFooter}>
                  {onCancel && (
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      disabled={loading}
                    >
                      {cancelText}
                    </Button>
                  )}
                  {onSubmit && (
                    <Button
                      variant="primary"
                      onClick={onSubmit}
                      disabled={submitDisabled}
                      loading={loading}
                    >
                      {submitText}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

### FormPageTemplate.module.scss
```scss
.formPage {
  min-height: 100vh;
  background-color: $color-background-default;
  padding: $spacing-lg;
  
  .container {
    @include card;
    margin: 0 auto;
    
    &--sm {
      max-width: 480px;
    }
    
    &--md {
      max-width: 720px;
    }
    
    &--lg {
      max-width: 960px;
    }
    
    &--xl {
      max-width: 1200px;
    }
  }
  
  .header {
    .title {
      font-weight: $font-weight-bold;
      color: $color-text-primary;
      margin-bottom: $spacing-xs;
    }
    
    .subtitle {
      color: $color-text-secondary;
    }
  }
  
  .divider {
    margin: $spacing-lg 0;
  }
  
  .content {
    padding: $spacing-md 0;
  }
  
  .footer {
    .defaultFooter {
      @include flex-end;
      gap: $spacing-md;
      
      @include mobile {
        flex-direction: column-reverse;
        gap: $spacing-sm;
      }
    }
  }
  
  // Responsive
  @include mobile {
    padding: $spacing-md;
    
    .container {
      padding: $spacing-md;
    }
    
    .divider {
      margin: $spacing-md 0;
    }
  }
}
```

## 📊 DashboardTemplate (대시보드 화면)

대시보드 형태의 화면을 위한 템플릿입니다.

### DashboardTemplate.tsx
```typescript
import React from 'react';
import { clsx } from 'clsx';
import { Typography, Grid } from '@mui/material';
import styles from './DashboardTemplate.module.scss';

interface DashboardItem {
  id: string;
  component: React.ReactNode;
  gridProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  dateRange?: React.ReactNode;
  actions?: React.ReactNode;
  items: DashboardItem[];
  loading?: boolean;
  className?: string;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title,
  subtitle,
  dateRange,
  actions,
  items,
  loading = false,
  className,
}) => {
  return (
    <div className={clsx(styles.dashboard, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Typography variant="h4" component="h1" className={styles.title}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" className={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </div>

        <div className={styles.controls}>
          {dateRange && (
            <div className={styles.dateRange}>
              {dateRange}
            </div>
          )}
          
          {actions && (
            <div className={styles.actions}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className={styles.content}>
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid
              key={item.id}
              item
              xs={item.gridProps?.xs || 12}
              sm={item.gridProps?.sm || 6}
              md={item.gridProps?.md || 4}
              lg={item.gridProps?.lg || 3}
              xl={item.gridProps?.xl || 3}
            >
              <div className={styles.dashboardItem}>
                {item.component}
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};
```

### DashboardTemplate.module.scss
```scss
.dashboard {
  padding: $spacing-lg;
  background-color: $color-background-default;
  min-height: 100vh;
  
  .header {
    @include flex-between;
    margin-bottom: $spacing-xl;
    padding: $spacing-lg;
    background-color: $color-background-paper;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    
    .titleSection {
      .title {
        font-weight: $font-weight-bold;
        color: $color-text-primary;
        margin-bottom: $spacing-xs;
      }
      
      .subtitle {
        color: $color-text-secondary;
      }
    }
    
    .controls {
      @include flex-start;
      gap: $spacing-lg;
      
      .dateRange {
        @include flex-center;
      }
      
      .actions {
        @include flex-start;
        gap: $spacing-sm;
      }
    }
  }
  
  .content {
    .dashboardItem {
      height: 100%;
      
      // Ensure child components fill the container
      > * {
        height: 100%;
      }
    }
  }
  
  // Responsive
  @include tablet {
    .header {
      flex-direction: column;
      gap: $spacing-lg;
      
      .controls {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
  
  @include mobile {
    padding: $spacing-md;
    
    .header {
      padding: $spacing-md;
      
      .controls {
        flex-direction: column;
        gap: $spacing-md;
        width: 100%;
        
        .actions {
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    }
  }
}
```

## 🔍 DetailPageTemplate (상세 화면)

상세 정보를 표시하는 화면 템플릿입니다.

### DetailPageTemplate.tsx
```typescript
import React from 'react';
import { clsx } from 'clsx';
import { Typography, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@shared/components/atoms/Button';
import styles from './DetailPageTemplate.module.scss';

interface DetailPageTemplateProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  };
  onBack?: () => void;
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const DetailPageTemplate: React.FC<DetailPageTemplateProps> = ({
  title,
  subtitle,
  status,
  onBack,
  tabs,
  actions,
  sidebar,
  children,
  loading = false,
  className,
}) => {
  return (
    <div className={clsx(styles.detailPage, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          {onBack && (
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              className={styles.backButton}
            >
              뒤로
            </Button>
          )}
          
          <div className={styles.titleWrapper}>
            <div className={styles.titleRow}>
              <Typography variant="h4" component="h1" className={styles.title}>
                {title}
              </Typography>
              {status && (
                <Chip
                  label={status.label}
                  color={status.color}
                  size="small"
                  className={styles.statusChip}
                />
              )}
            </div>
            
            {subtitle && (
              <Typography variant="body2" className={styles.subtitle}>
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
        
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs && (
        <div className={styles.tabsWrapper}>
          {tabs}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {children}
        </div>
        
        {sidebar && (
          <div className={styles.sidebar}>
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
};
```

### DetailPageTemplate.module.scss
```scss
.detailPage {
  padding: $spacing-lg;
  background-color: $color-background-default;
  min-height: 100vh;
  
  .header {
    @include flex-between;
    margin-bottom: $spacing-lg;
    padding: $spacing-lg;
    background-color: $color-background-paper;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
    
    .titleSection {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      
      .backButton {
        align-self: flex-start;
      }
      
      .titleWrapper {
        .titleRow {
          @include flex-start;
          gap: $spacing-md;
          margin-bottom: $spacing-xs;
          
          .title {
            font-weight: $font-weight-bold;
            color: $color-text-primary;
          }
          
          .statusChip {
            font-size: $font-size-xs;
          }
        }
        
        .subtitle {
          color: $color-text-secondary;
        }
      }
    }
    
    .actions {
      @include flex-start;
      gap: $spacing-sm;
    }
  }
  
  .tabsWrapper {
    margin-bottom: $spacing-lg;
    background-color: $color-background-paper;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-sm;
  }
  
  .content {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: $spacing-lg;
    align-items: start;
    
    .mainContent {
      background-color: $color-background-paper;
      border-radius: $border-radius-lg;
      box-shadow: $shadow-sm;
      padding: $spacing-lg;
    }
    
    .sidebar {
      width: 300px;
      background-color: $color-background-paper;
      border-radius: $border-radius-lg;
      box-shadow: $shadow-sm;
      padding: $spacing-lg;
      position: sticky;
      top: $spacing-lg;
    }
  }
  
  // Responsive
  @include tablet {
    .header {
      flex-direction: column;
      gap: $spacing-lg;
      
      .titleSection {
        width: 100%;
        
        .titleRow {
          flex-wrap: wrap;
        }
      }
      
      .actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
    
    .content {
      grid-template-columns: 1fr;
      
      .sidebar {
        width: 100%;
        position: static;
      }
    }
  }
  
  @include mobile {
    padding: $spacing-md;
    
    .header,
    .mainContent,
    .sidebar {
      padding: $spacing-md;
    }
    
    .content {
      gap: $spacing-md;
    }
  }
}
```

## 💡 사용 예제

### 사용자 관리 목록 화면
```typescript
import React, { useState } from 'react';
import { ListPageTemplate } from '@shared/components/templates/ListPageTemplate';
import { SearchBar } from '@shared/components/molecules/SearchBar';
import { Button } from '@shared/components/atoms/Button';
import { DataTable } from '@shared/components/organisms/DataTable';
import AddIcon from '@mui/icons-material/Add';

export const UserListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  
  return (
    <ListPageTemplate
      title="사용자 관리"
      subtitle="시스템 사용자를 관리합니다"
      breadcrumbs={[
        { label: '홈', path: '/' },
        { label: '시스템 관리' },
        { label: '사용자 관리' }
      ]}
      searchBar={
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={(term) => console.log('Search:', term)}
          placeholder="사용자 검색..."
          fullWidth
        />
      }
      filters={
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* 필터 컴포넌트들 */}
        </div>
      }
      actions={
        <>
          <Button variant="outlined">Excel 다운로드</Button>
          <Button variant="primary" startIcon={<AddIcon />}>
            사용자 추가
          </Button>
        </>
      }
    >
      <DataTable
        data={users}
        columns={[
          { key: 'name', label: '이름' },
          { key: 'email', label: '이메일' },
          { key: 'department', label: '부서' },
          { key: 'role', label: '권한' },
        ]}
        loading={false}
      />
    </ListPageTemplate>
  );
};
```

### 사용자 등록 화면
```typescript
import React, { useState } from 'react';
import { FormPageTemplate } from '@shared/components/templates/FormPageTemplate';
import { FormField } from '@shared/components/molecules/FormField';
import { TextField } from '@shared/components/atoms/TextField';

export const UserFormPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    // API 호출
    setLoading(false);
  };
  
  return (
    <FormPageTemplate
      title="사용자 등록"
      subtitle="새로운 사용자를 등록합니다"
      onSubmit={handleSubmit}
      onCancel={() => window.history.back()}
      loading={loading}
      maxWidth="md"
    >
      <div style={{ display: 'grid', gap: '24px' }}>
        <FormField label="이름" required>
          <TextField placeholder="홍길동" fullWidth />
        </FormField>
        
        <FormField label="이메일" required>
          <TextField type="email" placeholder="hong@company.com" fullWidth />
        </FormField>
        
        <FormField label="부서" required>
          <TextField placeholder="IT팀" fullWidth />
        </FormField>
      </div>
    </FormPageTemplate>
  );
};
```

이제 업무 시스템에서 필요한 모든 화면 패턴을 템플릿으로 사용할 수 있습니다! 🎉

각 템플릿은 CSS Modules + SCSS로 완전히 스타일이 분리되어 있어 독립적으로 관리가 가능합니다.