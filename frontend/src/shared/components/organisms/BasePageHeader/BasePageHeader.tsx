/**
 * BasePageHeader - 페이지 헤더 공통 컴포넌트
 *
 * @description 모든 업무 페이지에서 사용하는 표준 페이지 헤더
 * - 아이콘, 제목, 설명 표시
 * - 통계 카드 그룹 표시
 * - 테마 시스템 완전 지원
 * - 반응형 디자인 적용
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * <BasePageHeader
 *   icon={<SecurityIcon />}
 *   title="사용자관리"
 *   description="시스템 사용자 계정을 통합 관리합니다"
 *   statistics={[
 *     { icon: <PeopleIcon />, value: 150, label: "전체 사용자" },
 *     { icon: <ActiveIcon />, value: 120, label: "활성 사용자" }
 *   ]}
 * />
 * ```
 */

import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BasePageHeader.module.scss';

// StatCard 컴포넌트 (내장)
interface StatCardProps {
  icon: ReactElement;
  value: number | string;
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color = 'default'
}) => {
  return (
    <div className={`${styles.statCard} ${styles[`statCard--${color}`]}`}>
      <div className={styles.statIcon}>
        {React.cloneElement(icon, {
          className: styles.statIconSvg,
          'aria-hidden': true
        })}
      </div>
      <div className={styles.statContent}>
        <div className={styles.statNumber} aria-label={`${label} ${value}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
};

// BasePageHeader Props
export interface BasePageHeaderProps {
  /** 헤더 아이콘 (Material-UI 아이콘) */
  icon: ReactElement;

  /** 페이지 제목 */
  title: string;

  /** 페이지 설명 */
  description: string;

  /** 통계 카드 데이터 */
  statistics: Array<{
    icon: ReactElement;
    value: number | string;
    label: string;
    color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  }>;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 다국어 네임스페이스 (기본: common) */
  i18nNamespace?: string;

  /** 제목 다국어 키 (설정 시 title 대신 번역값 사용) */
  titleKey?: string;

  /** 설명 다국어 키 (설정 시 description 대신 번역값 사용) */
  descriptionKey?: string;
}

const BasePageHeader: React.FC<BasePageHeaderProps> = ({
  icon,
  title,
  description,
  statistics,
  className = '',
  i18nNamespace = 'common',
  titleKey,
  descriptionKey
}) => {
  const { t } = useTranslation(i18nNamespace);

  // 다국어 처리
  const displayTitle = titleKey ? t(titleKey, title) : title;
  const displayDescription = descriptionKey ? t(descriptionKey, description) : description;

  return (
    <header className={`${styles.pageHeader} ${className}`} role="banner">
      <div className={styles.headerContent}>
        {/* 제목 섹션 */}
        <div className={styles.titleSection}>
          <div className={styles.headerIcon} aria-hidden="true">
            {React.cloneElement(icon, {
              className: styles.headerIconSvg,
              'aria-hidden': true
            })}
          </div>
          <div className={styles.titleContent}>
            <h1 className={styles.pageTitle}>
              {displayTitle}
            </h1>
            <p className={styles.pageDescription}>
              {displayDescription}
            </p>
          </div>
        </div>

        {/* 통계 섹션 */}
        {statistics.length > 0 && (
          <div
            className={styles.headerStats}
            role="region"
            aria-label="페이지 통계 정보"
          >
            {statistics.map((stat, index) => (
              <StatCard
                key={`stat-${index}-${stat.label}`}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                color={stat.color}
              />
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default BasePageHeader;
export { StatCard };
export type { StatCardProps };