# RSMS 컴포넌트 예제 코드 (CSS Modules + SCSS)

## 📁 컴포넌트 구조 예제

모든 컴포넌트는 다음 구조를 따릅니다:

```
Button/
├── Button.tsx           # 컴포넌트 로직
├── Button.module.scss   # 스타일 정의
├── Button.types.ts      # 타입 정의
├── Button.test.tsx      # 테스트
├── Button.stories.tsx   # Storybook
└── index.ts            # Export
```

## 🔵 Atoms (기본 컴포넌트)

### Button 컴포넌트

#### Button.types.ts
```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

#### Button.tsx
```typescript
import React from 'react';
import { clsx } from 'clsx';
import { CircularProgress } from '@mui/material';
import { ButtonProps } from './Button.types';
import styles from './Button.module.scss';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  color = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={clsx(
        styles.button,
        styles[`button--${variant}`],
        styles[`button--${size}`],
        styles[`button--${color}`],
        {
          [styles['button--loading']]: loading,
          [styles['button--disabled']]: disabled,
          [styles['button--fullWidth']]: fullWidth,
        },
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <CircularProgress size={16} className={styles.loadingIcon} />}
      {startIcon && !loading && <span className={styles.startIcon}>{startIcon}</span>}
      <span className={styles.content}>{children}</span>
      {endIcon && !loading && <span className={styles.endIcon}>{endIcon}</span>}
    </button>
  );
};
```

#### Button.module.scss
```scss
.button {
  @include transition(all, 0.2s, ease-in-out);
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  
  font-family: $font-family-base;
  font-weight: $font-weight-medium;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  border-radius: $border-radius-md;
  cursor: pointer;
  
  &:focus {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
  
  // Sizes
  &--small {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
    min-height: 32px;
  }
  
  &--medium {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
    min-height: 40px;
  }
  
  &--large {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-lg;
    min-height: 48px;
  }
  
  // Variants
  &--primary {
    background-color: $color-primary;
    color: $color-primary-contrast;
    
    &:hover:not(:disabled) {
      background-color: $color-primary-dark;
      @include hover-lift;
    }
  }
  
  &--secondary {
    background-color: $color-secondary;
    color: $color-secondary-contrast;
    
    &:hover:not(:disabled) {
      background-color: $color-secondary-dark;
      @include hover-lift;
    }
  }
  
  &--outlined {
    background-color: transparent;
    border-color: $color-primary;
    color: $color-primary;
    
    &:hover:not(:disabled) {
      background-color: rgba($color-primary, 0.04);
      border-color: $color-primary-dark;
    }
  }
  
  &--text {
    background-color: transparent;
    color: $color-primary;
    
    &:hover:not(:disabled) {
      background-color: rgba($color-primary, 0.04);
    }
  }
  
  // States
  &--loading {
    cursor: wait;
    pointer-events: none;
  }
  
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &--fullWidth {
    width: 100%;
  }
  
  // Icons
  .loadingIcon {
    color: currentColor;
  }
  
  .startIcon,
  .endIcon {
    display: flex;
    align-items: center;
    font-size: 1.2em;
  }
  
  .content {
    flex: 1;
  }
  
  // Responsive
  @include mobile {
    &:not(.button--fullWidth) {
      min-width: 120px;
    }
  }
}
```

#### Button.test.tsx
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### TextField 컴포넌트

#### TextField.tsx
```typescript
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import styles from './TextField.module.scss';

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      error = false,
      helperText,
      required = false,
      disabled = false,
      fullWidth = false,
      multiline = false,
      rows = 4,
      type = 'text',
      size = 'medium',
      variant = 'outlined',
      startAdornment,
      endAdornment,
      className,
      onChange,
      onBlur,
      onFocus,
      ...props
    },
    ref
  ) => {
    const Component = multiline ? 'textarea' : 'input';

    return (
      <div
        className={clsx(
          styles.textField,
          styles[`textField--${size}`],
          styles[`textField--${variant}`],
          {
            [styles['textField--error']]: error,
            [styles['textField--disabled']]: disabled,
            [styles['textField--fullWidth']]: fullWidth,
          },
          className
        )}
      >
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <div className={styles.inputContainer}>
          {startAdornment && (
            <div className={styles.startAdornment}>{startAdornment}</div>
          )}
          
          <Component
            ref={ref as any}
            className={styles.input}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            required={required}
            type={multiline ? undefined : type}
            rows={multiline ? rows : undefined}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            {...props}
          />
          
          {endAdornment && (
            <div className={styles.endAdornment}>{endAdornment}</div>
          )}
        </div>
        
        {helperText && (
          <div className={clsx(styles.helperText, { [styles.error]: error })}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
```

#### TextField.module.scss
```scss
.textField {
  display: inline-flex;
  flex-direction: column;
  position: relative;
  
  &--fullWidth {
    width: 100%;
  }
  
  .label {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
    margin-bottom: $spacing-xs;
    
    .required {
      color: $color-error;
      margin-left: 2px;
    }
  }
  
  .inputContainer {
    @include flex-start;
    position: relative;
    border: 1px solid $color-border-default;
    border-radius: $border-radius-md;
    background-color: $color-background-paper;
    @include transition(border-color, 0.2s);
    
    &:hover {
      border-color: $color-border-dark;
    }
    
    &:focus-within {
      border-color: $color-primary;
      outline: 2px solid rgba($color-primary, 0.1);
      outline-offset: -1px;
    }
  }
  
  .input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-family-base;
    color: $color-text-primary;
    
    &::placeholder {
      color: $color-text-hint;
    }
    
    &:disabled {
      cursor: not-allowed;
      color: $color-text-disabled;
    }
  }
  
  .startAdornment,
  .endAdornment {
    display: flex;
    align-items: center;
    color: $color-text-secondary;
  }
  
  .startAdornment {
    margin-left: $spacing-sm;
  }
  
  .endAdornment {
    margin-right: $spacing-sm;
  }
  
  .helperText {
    font-size: $font-size-xs;
    color: $color-text-secondary;
    margin-top: $spacing-xs;
    
    &.error {
      color: $color-error;
    }
  }
  
  // Sizes
  &--small {
    .input {
      padding: $spacing-xs $spacing-sm;
      font-size: $font-size-sm;
    }
  }
  
  &--medium {
    .input {
      padding: $spacing-sm $spacing-md;
      font-size: $font-size-base;
    }
  }
  
  // Variants
  &--outlined {
    // Default styles already applied
  }
  
  &--filled {
    .inputContainer {
      background-color: $color-gray-100;
      border: none;
      border-bottom: 2px solid $color-border-default;
      border-radius: $border-radius-md $border-radius-md 0 0;
      
      &:hover {
        background-color: $color-gray-200;
      }
      
      &:focus-within {
        border-bottom-color: $color-primary;
        outline: none;
      }
    }
  }
  
  // States
  &--error {
    .inputContainer {
      border-color: $color-error;
      
      &:focus-within {
        border-color: $color-error;
        outline-color: rgba($color-error, 0.1);
      }
    }
  }
  
  &--disabled {
    .label {
      color: $color-text-disabled;
    }
    
    .inputContainer {
      background-color: $color-gray-100;
      border-color: $color-border-light;
      cursor: not-allowed;
    }
  }
}
```

## 🟢 Molecules (복합 컴포넌트)

### SearchBar 컴포넌트

#### SearchBar.tsx
```typescript
import React, { useState } from 'react';
import { clsx } from 'clsx';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { CircularProgress } from '@mui/material';
import styles from './SearchBar.module.scss';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = '검색...',
  loading = false,
  disabled = false,
  size = 'medium',
  fullWidth = false,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    if (!loading && !disabled) {
      onSearch(value);
    }
  };

  const handleClearClick = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div
      className={clsx(
        styles.searchBar,
        styles[`searchBar--${size}`],
        {
          [styles['searchBar--focused']]: isFocused,
          [styles['searchBar--disabled']]: disabled,
          [styles['searchBar--fullWidth']]: fullWidth,
        },
        className
      )}
    >
      <div className={styles.iconContainer}>
        <SearchIcon className={styles.searchIcon} />
      </div>
      
      <input
        className={styles.input}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled || loading}
      />
      
      {value && !loading && (
        <button
          className={styles.clearButton}
          onClick={handleClearClick}
          type="button"
          disabled={disabled}
        >
          <ClearIcon />
        </button>
      )}
      
      <button
        className={styles.searchButton}
        onClick={handleSearchClick}
        type="button"
        disabled={disabled || loading}
      >
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <SearchIcon />
        )}
      </button>
    </div>
  );
};
```

#### SearchBar.module.scss
```scss
.searchBar {
  @include flex-start;
  position: relative;
  border: 1px solid $color-border-default;
  border-radius: $border-radius-lg;
  background-color: $color-background-paper;
  @include transition(all, 0.2s);
  
  &:hover:not(.searchBar--disabled) {
    border-color: $color-border-dark;
    box-shadow: $shadow-sm;
  }
  
  &--focused {
    border-color: $color-primary;
    outline: 2px solid rgba($color-primary, 0.1);
    outline-offset: -1px;
  }
  
  &--disabled {
    background-color: $color-gray-100;
    cursor: not-allowed;
    
    .input {
      cursor: not-allowed;
    }
  }
  
  &--fullWidth {
    width: 100%;
  }
  
  .iconContainer {
    @include flex-center;
    padding: 0 $spacing-sm;
    color: $color-text-secondary;
    
    .searchIcon {
      font-size: 20px;
    }
  }
  
  .input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-family-base;
    color: $color-text-primary;
    
    &::placeholder {
      color: $color-text-hint;
    }
    
    &:disabled {
      cursor: not-allowed;
      color: $color-text-disabled;
    }
  }
  
  .clearButton,
  .searchButton {
    @include flex-center;
    border: none;
    background: transparent;
    cursor: pointer;
    color: $color-text-secondary;
    @include transition(color, 0.2s);
    
    &:hover:not(:disabled) {
      color: $color-primary;
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
  
  .clearButton {
    padding: $spacing-xs;
    margin-right: $spacing-xs;
    
    svg {
      font-size: 18px;
    }
  }
  
  .searchButton {
    padding: $spacing-sm;
    border-left: 1px solid $color-border-light;
    
    svg {
      font-size: 20px;
    }
  }
  
  // Sizes
  &--small {
    .input {
      padding: $spacing-xs 0;
      font-size: $font-size-sm;
    }
    
    .iconContainer {
      padding: 0 $spacing-xs;
    }
    
    .clearButton,
    .searchButton {
      padding: $spacing-xs;
    }
  }
  
  &--medium {
    .input {
      padding: $spacing-sm 0;
      font-size: $font-size-base;
    }
  }
  
  &--large {
    .input {
      padding: $spacing-md 0;
      font-size: $font-size-lg;
    }
    
    .iconContainer {
      padding: 0 $spacing-md;
    }
    
    .clearButton,
    .searchButton {
      padding: $spacing-md;
    }
  }
}
```

### FormField 컴포넌트

#### FormField.tsx
```typescript
import React from 'react';
import { clsx } from 'clsx';
import styles from './FormField.module.scss';

interface FormFieldProps {
  label?: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  description?: string;
  inline?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  required = false,
  description,
  inline = false,
  fullWidth = false,
  className,
}) => {
  return (
    <div
      className={clsx(
        styles.formField,
        {
          [styles['formField--inline']]: inline,
          [styles['formField--fullWidth']]: fullWidth,
          [styles['formField--error']]: !!error,
        },
        className
      )}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      {description && <div className={styles.description}>{description}</div>}
      
      <div className={styles.inputWrapper}>{children}</div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};
```

#### FormField.module.scss
```scss
.formField {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  
  &--fullWidth {
    width: 100%;
  }
  
  &--inline {
    @include md {
      flex-direction: row;
      align-items: flex-start;
      gap: $spacing-md;
      
      .label {
        min-width: 120px;
        margin-top: $spacing-xs;
      }
      
      .inputWrapper {
        flex: 1;
      }
    }
  }
  
  .label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-text-primary;
    line-height: $line-height-tight;
    
    .required {
      color: $color-error;
      margin-left: 2px;
    }
  }
  
  .description {
    font-size: $font-size-xs;
    color: $color-text-secondary;
    line-height: $line-height-base;
  }
  
  .inputWrapper {
    display: flex;
    flex-direction: column;
  }
  
  .errorMessage {
    font-size: $font-size-xs;
    color: $color-error;
    line-height: $line-height-base;
    
    // Error icon
    &::before {
      content: '⚠️';
      margin-right: $spacing-xs;
    }
  }
  
  &--error {
    .label {
      color: $color-error;
    }
  }
  
  // Responsive
  @include mobile {
    &--inline {
      flex-direction: column;
      
      .label {
        min-width: unset;
        margin-top: 0;
      }
    }
  }
}
```

## 🟣 Organisms (복잡한 컴포넌트)

### BaseDataGrid 컴포넌트 (AG-Grid)

#### BaseDataGrid.types.ts
```typescript
import { AgGridReactProps, AgReactUiProps } from 'ag-grid-react';
import { ColDef, GridOptions, RowSelectedEvent } from 'ag-grid-community';

export interface BaseDataGridProps extends Omit<AgGridReactProps, 'columnDefs' | 'rowData'> {
  columns: ColDef[];
  data: any[];
  loading?: boolean;
  height?: number | string;
  pagination?: boolean;
  pageSize?: number;
  onRowSelected?: (event: RowSelectedEvent) => void;
  onRowDoubleClicked?: (event: any) => void;
  className?: string;
  theme?: 'alpine' | 'balham' | 'material' | 'rsms';
}

export interface GridThemeProps {
  theme: string;
}
```

#### BaseDataGrid.tsx
```typescript
import React, { useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { clsx } from 'clsx';
import { CircularProgress } from '@mui/material';
import { ColDef, GridOptions } from 'ag-grid-community';
import { BaseDataGridProps } from './BaseDataGrid.types';
import styles from './BaseDataGrid.module.scss';

// AG-Grid CSS imports
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const BaseDataGrid: React.FC<BaseDataGridProps> = ({
  columns,
  data,
  loading = false,
  height = 400,
  pagination = true,
  pageSize = 20,
  onRowSelected,
  onRowDoubleClicked,
  className,
  theme = 'rsms',
  ...gridProps
}) => {
  // Grid Options
  const defaultGridOptions: GridOptions = useMemo(() => ({
    animateRows: true,
    enableRangeSelection: true,
    enableCharts: true,
    suppressMenuHide: true,
    suppressRowClickSelection: false,
    rowSelection: 'single',
    pagination,
    paginationPageSize: pageSize,
    suppressPaginationPanel: false,
    suppressScrollOnNewData: true,
    domLayout: 'normal',
  }), [pagination, pageSize]);

  // Column Definitions with default settings
  const columnDefs: ColDef[] = useMemo(() => 
    columns.map(col => ({
      sortable: true,
      filter: true,
      resizable: true,
      ...col,
    })),
    [columns]
  );

  // Event Handlers
  const onGridReady = useCallback((params: any) => {
    if (gridProps.onGridReady) {
      gridProps.onGridReady(params);
    }
    // Auto-size columns
    params.api.sizeColumnsToFit();
  }, [gridProps.onGridReady]);

  const onFirstDataRendered = useCallback((params: any) => {
    if (gridProps.onFirstDataRendered) {
      gridProps.onFirstDataRendered(params);
    }
    // Auto-size columns after data is rendered
    params.api.sizeColumnsToFit();
  }, [gridProps.onFirstDataRendered]);

  return (
    <div className={clsx(styles.dataGridContainer, className)}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <CircularProgress size={40} />
          <span>데이터를 불러오는 중...</span>
        </div>
      )}
      
      <div 
        className={clsx(
          styles.dataGrid,
          styles[`theme-${theme}`],
          `ag-theme-${theme === 'rsms' ? 'alpine' : theme}`
        )}
        style={{ height }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={data}
          gridOptions={defaultGridOptions}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onRowSelected={onRowSelected}
          onRowDoubleClicked={onRowDoubleClicked}
          suppressLoadingOverlay={loading}
          {...gridProps}
        />
      </div>
    </div>
  );
};
```

#### BaseDataGrid.module.scss
```scss
.dataGridContainer {
  position: relative;
  width: 100%;
  
  .loadingOverlay {
    @include flex-center;
    @include flex-column;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba($color-background-paper, 0.8);
    z-index: 1000;
    gap: $spacing-md;
    
    span {
      font-size: $font-size-sm;
      color: $color-text-secondary;
    }
  }
  
  .dataGrid {
    width: 100%;
    
    // RSMS 커스텀 테마
    &.theme-rsms {
      // 헤더 스타일
      :global(.ag-header) {
        background-color: $color-gray-50;
        border-bottom: 2px solid $color-primary;
        font-weight: $font-weight-semibold;
      }
      
      :global(.ag-header-cell) {
        border-right: 1px solid $color-border-light;
        
        &:hover {
          background-color: $color-gray-100;
        }
      }
      
      :global(.ag-header-cell-text) {
        color: $color-text-primary;
        font-weight: $font-weight-semibold;
      }
      
      // 행 스타일
      :global(.ag-row) {
        border-bottom: 1px solid $color-border-light;
        
        &:hover {
          background-color: rgba($color-primary, 0.04);
        }
        
        &.ag-row-selected {
          background-color: rgba($color-primary, 0.08);
          border-left: 3px solid $color-primary;
        }
        
        &:nth-child(even) {
          background-color: $color-gray-25;
        }
      }
      
      // 셀 스타일
      :global(.ag-cell) {
        border-right: 1px solid $color-border-light;
        padding: $spacing-sm;
        
        &:focus {
          outline: 2px solid $color-primary;
          outline-offset: -2px;
        }
      }
      
      // 정렬 아이콘
      :global(.ag-sort-ascending-icon),
      :global(.ag-sort-descending-icon) {
        color: $color-primary;
      }
      
      // 페이지네이션
      :global(.ag-paging-panel) {
        border-top: 1px solid $color-border-default;
        background-color: $color-background-paper;
        padding: $spacing-sm;
      }
      
      :global(.ag-paging-button) {
        @include transition(all, 0.2s);
        
        &:hover:not(.ag-disabled) {
          background-color: $color-primary;
          color: white;
        }
        
        &.ag-selected {
          background-color: $color-primary;
          color: white;
        }
      }
      
      // 필터
      :global(.ag-filter-input) {
        border: 1px solid $color-border-default;
        border-radius: $border-radius-sm;
        padding: $spacing-xs;
        
        &:focus {
          border-color: $color-primary;
          outline: none;
        }
      }
      
      // 스크롤바
      :global(.ag-body-viewport) {
        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        &::-webkit-scrollbar-track {
          background: $color-gray-100;
        }
        
        &::-webkit-scrollbar-thumb {
          background: $color-gray-400;
          border-radius: 4px;
          
          &:hover {
            background: $color-gray-500;
          }
        }
      }
    }
  }
}

// 반응형 조정
@include tablet {
  .dataGridContainer {
    .dataGrid {
      // 태블릿에서는 폰트 크기 조정
      font-size: $font-size-sm;
      
      :global(.ag-header-cell-text) {
        font-size: $font-size-sm;
      }
    }
  }
}

@include mobile {
  .dataGridContainer {
    .dataGrid {
      // 모바일에서는 더 작은 폰트와 패딩
      font-size: $font-size-xs;
      
      :global(.ag-cell) {
        padding: $spacing-xs;
      }
      
      :global(.ag-header-cell) {
        padding: $spacing-xs;
      }
    }
  }
}
```

#### 사용 예제
```typescript
// 사용자 목록 화면에서의 BaseDataGrid 사용 예제
import React, { useState, useMemo } from 'react';
import { BaseDataGrid } from '@shared/components/organisms/BaseDataGrid';
import { ColDef } from 'ag-grid-community';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: '홍길동',
      email: 'hong@company.com',
      department: '개발팀',
      status: 'active',
      createdAt: '2024-01-15'
    },
    // ... more data
  ]);
  const [loading, setLoading] = useState(false);

  // 컬럼 정의
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'ID',
      field: 'id',
      width: 80,
      pinned: 'left',
    },
    {
      headerName: '이름',
      field: 'name',
      width: 120,
    },
    {
      headerName: '이메일',
      field: 'email',
      width: 200,
    },
    {
      headerName: '부서',
      field: 'department',
      width: 120,
    },
    {
      headerName: '상태',
      field: 'status',
      width: 100,
      cellRenderer: (params: any) => {
        const status = params.value;
        return (
          <span className={`status-badge status-badge--${status}`}>
            {status === 'active' ? '활성' : '비활성'}
          </span>
        );
      },
    },
    {
      headerName: '생성일',
      field: 'createdAt',
      width: 120,
    },
    {
      headerName: '액션',
      cellRenderer: (params: any) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleEdit(params.data)}>수정</button>
          <button onClick={() => handleDelete(params.data.id)}>삭제</button>
        </div>
      ),
      width: 120,
      pinned: 'right',
    }
  ], []);

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (userId: number) => {
    console.log('Delete user:', userId);
  };

  const handleRowSelected = (event: any) => {
    console.log('Selected row:', event.data);
  };

  const handleRowDoubleClicked = (event: any) => {
    console.log('Double clicked row:', event.data);
    handleEdit(event.data);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>사용자 관리</h1>
      
      <BaseDataGrid
        columns={columnDefs}
        data={users}
        loading={loading}
        height={500}
        pagination={true}
        pageSize={25}
        onRowSelected={handleRowSelected}
        onRowDoubleClicked={handleRowDoubleClicked}
        theme="rsms"
      />
    </div>
  );
};
```

#### BaseDataGrid/index.ts
```typescript
export { BaseDataGrid } from './BaseDataGrid';
export type { BaseDataGridProps, GridThemeProps } from './BaseDataGrid.types';
```

## 📋 사용 예제

### 컴포넌트 조합 사용
```typescript
// 사용자 등록 폼 예제
import React, { useState } from 'react';
import { Button } from '@shared/components/atoms/Button';
import { TextField } from '@shared/components/atoms/TextField';
import { SearchBar } from '@shared/components/molecules/SearchBar';
import { FormField } from '@shared/components/molecules/FormField';

export const UserRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // API 호출
      console.log('Form submitted:', formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1>사용자 등록</h1>
      
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={(term) => console.log('Searching:', term)}
        placeholder="기존 사용자 검색..."
        fullWidth
      />
      
      <form style={{ marginTop: '24px' }}>
        <FormField
          label="이름"
          required
          error={errors.name}
          fullWidth
        >
          <TextField
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="홍길동"
            error={!!errors.name}
            fullWidth
          />
        </FormField>
        
        <FormField
          label="이메일"
          required
          error={errors.email}
          description="회사 이메일 주소를 입력해주세요"
          fullWidth
        >
          <TextField
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="hong@company.com"
            error={!!errors.email}
            fullWidth
          />
        </FormField>
        
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <Button variant="outlined" fullWidth>
            취소
          </Button>
          <Button
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
            fullWidth
          >
            등록
          </Button>
        </div>
      </form>
    </div>
  );
};
```

## 📁 Index 파일들

### atoms/Button/index.ts
```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

### atoms/TextField/index.ts
```typescript
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';
```

### molecules/SearchBar/index.ts
```typescript
export { SearchBar } from './SearchBar';
export type { SearchBarProps } from './SearchBar';
```

### shared/components/index.ts
```typescript
// Atoms
export { Button } from './atoms/Button';
export { TextField } from './atoms/TextField';
export type { ButtonProps } from './atoms/Button';

// Molecules
export { SearchBar } from './molecules/SearchBar';
export { FormField } from './molecules/FormField';

// Organisms
export { BaseDataGrid } from './organisms/BaseDataGrid';

// Templates  
export { ListPageTemplate } from './templates/ListPageTemplate';
```

이제 CSS Modules + SCSS 기반의 완전한 컴포넌트 예제가 준비되었습니다! 🎉

모든 스타일이 독립적으로 관리되고, TypeScript 타입 안전성을 보장하며, 재사용 가능한 구조로 구성되어 있습니다.