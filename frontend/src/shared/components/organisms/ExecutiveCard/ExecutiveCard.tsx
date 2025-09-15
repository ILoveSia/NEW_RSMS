import React from 'react';
import { Card, CardContent, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, Visibility, VisibilityOff } from '@mui/icons-material';
import clsx from 'clsx';

import styles from './ExecutiveCard.module.scss';

export interface ExecutiveCardProps {
  /** 카드 제목 */
  title: string;
  /** 메인 값 (숫자 또는 텍스트) */
  value: string | number;
  /** 이전 값 대비 변화량 */
  change?: number;
  /** 트렌드 방향 */
  trend?: 'up' | 'down' | 'neutral';
  /** 우선순위 레벨 */
  priority?: 'critical' | 'high' | 'medium' | 'low';
  /** 기밀 정보 여부 */
  confidential?: boolean;
  /** 단위 표시 */
  unit?: string;
  /** 서브 텍스트 */
  subtitle?: string;
  /** 카드 설명 */
  description?: string;
  /** 권한 레벨 (표시 크기 결정) */
  authorityLevel?: 'ceo' | 'executive' | 'director' | 'manager' | 'staff';
  /** 카드 클릭 핸들러 */
  onClick?: () => void;
  /** 기밀 토글 핸들러 */
  onToggleVisibility?: () => void;
  /** 커스텀 className */
  className?: string;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * ExecutiveCard - 맨하탄 금융센터 스타일 임원급 데이터 카드
 * 
 * C-Suite 전용 VIP 데이터 표시 컴포넌트
 * Wall Street 스타일의 정교한 데이터 시각화와 기밀성 관리 기능 제공
 * 
 * @example
 * // 기본 사용
 * <ExecutiveCard
 *   title="총 책무 수"
 *   value={157}
 *   change={12}
 *   trend="up"
 *   unit="건"
 * />
 * 
 * // CEO 레벨 기밀 정보
 * <ExecutiveCard
 *   title="리스크 점수"
 *   value={94.5}
 *   trend="down"
 *   priority="critical"
 *   confidential
 *   authorityLevel="ceo"
 *   onToggleVisibility={handleToggle}
 * />
 */
const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  priority = 'medium',
  confidential = false,
  unit = '',
  subtitle,
  description,
  authorityLevel = 'manager',
  onClick,
  onToggleVisibility,
  className,
  'data-testid': dataTestId = 'executive-card',
}) => {
  const [isVisible, setIsVisible] = React.useState(!confidential);

  // 기밀 정보 토글
  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
    onToggleVisibility?.();
  };

  // 트렌드 아이콘 렌더링
  const renderTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className={clsx(styles.trendIcon, styles.trendUp)} />;
      case 'down':
        return <TrendingDown className={clsx(styles.trendIcon, styles.trendDown)} />;
      case 'neutral':
      default:
        return <TrendingFlat className={clsx(styles.trendIcon, styles.trendNeutral)} />;
    }
  };

  // 변화량 표시 색상 클래스
  const getChangeClass = () => {
    if (change === undefined || change === 0) return styles.changeNeutral;
    return change > 0 ? styles.changePositive : styles.changeNegative;
  };

  // 우선순위별 스타일 클래스
  const getPriorityClass = () => {
    switch (priority) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  // 권한 레벨별 스타일 클래스
  const getAuthorityClass = () => {
    switch (authorityLevel) {
      case 'ceo': return styles.authorityCeo;
      case 'executive': return styles.authorityExecutive;
      case 'director': return styles.authorityDirector;
      case 'manager': return styles.authorityManager;
      case 'staff': return styles.authorityStaff;
      default: return '';
    }
  };

  // 값 포맷팅 (숫자인 경우 천단위 콤마 추가)
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card
      className={clsx(
        styles.card,
        getPriorityClass(),
        getAuthorityClass(),
        {
          [styles.clickable]: !!onClick,
          [styles.confidential]: confidential && !isVisible,
        },
        className
      )}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <CardContent className={styles.content}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <Typography variant="h6" className={styles.title}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" className={styles.subtitle}>
                {subtitle}
              </Typography>
            )}
          </div>
          
          <div className={styles.controls}>
            {/* 우선순위 칩 */}
            <Chip
              label={priority.toUpperCase()}
              size="small"
              className={clsx(styles.priorityChip, getPriorityClass())}
            />
            
            {/* 기밀 정보 토글 */}
            {confidential && (
              <Tooltip title={isVisible ? '정보 숨기기' : '정보 보기'}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility();
                  }}
                  className={styles.visibilityButton}
                  data-testid={`${dataTestId}-visibility-toggle`}
                >
                  {isVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>

        {/* 메인 값 */}
        <div className={styles.valueSection}>
          {isVisible ? (
            <>
              <div className={styles.mainValue}>
                <Typography variant="h3" className={styles.value}>
                  {formatValue(value)}
                </Typography>
                {unit && (
                  <Typography variant="h5" className={styles.unit}>
                    {unit}
                  </Typography>
                )}
              </div>

              {/* 변화량 및 트렌드 */}
              {change !== undefined && (
                <div className={styles.changeSection}>
                  {renderTrendIcon()}
                  <Typography 
                    variant="body2" 
                    className={clsx(styles.change, getChangeClass())}
                  >
                    {change > 0 ? '+' : ''}{change}%
                  </Typography>
                </div>
              )}
            </>
          ) : (
            <div className={styles.hiddenValue}>
              <Typography variant="h4" className={styles.confidentialText}>
                • • • • •
              </Typography>
              <Typography variant="body2" className={styles.confidentialNotice}>
                기밀 정보
              </Typography>
            </div>
          )}
        </div>

        {/* 설명 */}
        {description && isVisible && (
          <Typography variant="body2" className={styles.description}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutiveCard;