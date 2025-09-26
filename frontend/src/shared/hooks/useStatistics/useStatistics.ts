/**
 * useStatistics - 통계 데이터 계산 및 캐싱 훅
 *
 * @description 다양한 통계 계산을 표준화하고 성능 최적화를 제공하는 훅
 * - 기본 통계 (평균, 합계, 최대, 최소)
 * - 고급 통계 (중앙값, 표준편차, 백분위수)
 * - 증감률 및 추세 분석
 * - 메모이제이션으로 성능 최적화
 * - 실시간 통계 업데이트
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const salesData = [100, 150, 200, 175, 300];
 * const {
 *   basic,
 *   advanced,
 *   trends,
 *   formatters
 * } = useStatistics(salesData, {
 *   precision: 2,
 *   enableTrends: true
 * });
 *
 * console.log(basic.average); // 185
 * console.log(advanced.median); // 175
 * console.log(trends.growthRate); // 200% (300/100 - 1)
 * console.log(formatters.currency(basic.sum)); // ₩925
 * ```
 */

import { useMemo } from 'react';

// 기본 통계 타입
export interface BasicStatistics {
  /** 총합 */
  sum: number;
  /** 평균 */
  average: number;
  /** 최댓값 */
  max: number;
  /** 최솟값 */
  min: number;
  /** 개수 */
  count: number;
  /** 범위 (max - min) */
  range: number;
}

// 고급 통계 타입
export interface AdvancedStatistics {
  /** 중앙값 */
  median: number;
  /** 표준편차 */
  standardDeviation: number;
  /** 분산 */
  variance: number;
  /** 25% 백분위수 */
  percentile25: number;
  /** 75% 백분위수 */
  percentile75: number;
  /** 사분위수 범위 (IQR) */
  interquartileRange: number;
}

// 추세 분석 타입
export interface TrendStatistics {
  /** 성장률 (첫 번째 값 대비 마지막 값, %) */
  growthRate: number;
  /** 평균 증가율 (구간별 평균, %) */
  averageGrowthRate: number;
  /** 추세 방향 */
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  /** 변동성 (표준편차 / 평균 * 100, %) */
  volatility: number;
  /** 연속 증가 횟수 */
  consecutiveIncreases: number;
  /** 연속 감소 횟수 */
  consecutiveDecreases: number;
}

// 포맷터 타입
export interface StatisticsFormatters {
  /** 숫자 포맷 (천단위 콤마) */
  number: (value: number) => string;
  /** 통화 포맷 (원화) */
  currency: (value: number) => string;
  /** 백분율 포맷 */
  percentage: (value: number) => string;
  /** 소수점 포맷 */
  decimal: (value: number, decimals?: number) => string;
  /** 약식 표기 (K, M, B) */
  compact: (value: number) => string;
}

// 통계 설정 타입
export interface StatisticsConfig {
  /** 소수점 정밀도 */
  precision?: number;
  /** 추세 분석 활성화 */
  enableTrends?: boolean;
  /** 고급 통계 활성화 */
  enableAdvanced?: boolean;
  /** 빈 값 처리 방식 */
  emptyValueStrategy?: 'ignore' | 'zero' | 'interpolate';
  /** 이상치 처리 */
  outlierHandling?: 'include' | 'exclude' | 'cap';
  /** 이상치 판정 기준 (IQR의 배수) */
  outlierThreshold?: number;
}

// 훅 반환 타입
export interface UseStatisticsReturn {
  /** 기본 통계 */
  basic: BasicStatistics;
  /** 고급 통계 */
  advanced: AdvancedStatistics | null;
  /** 추세 분석 */
  trends: TrendStatistics | null;
  /** 포맷터 */
  formatters: StatisticsFormatters;
  /** 정리된 데이터 (이상치 처리 후) */
  cleanedData: number[];
  /** 통계 요약 텍스트 */
  summary: string;
}

/**
 * 이상치 탐지 및 처리
 */
const handleOutliers = (
  data: number[],
  handling: 'include' | 'exclude' | 'cap',
  threshold: number
): number[] => {
  if (handling === 'include' || data.length < 4) {
    return data;
  }

  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;

  if (handling === 'exclude') {
    return data.filter(value => value >= lowerBound && value <= upperBound);
  } else if (handling === 'cap') {
    return data.map(value => {
      if (value < lowerBound) return lowerBound;
      if (value > upperBound) return upperBound;
      return value;
    });
  }

  return data;
};

/**
 * 백분위수 계산
 */
const calculatePercentile = (sortedData: number[], percentile: number): number => {
  if (sortedData.length === 0) return 0;
  if (sortedData.length === 1) return sortedData[0];

  const index = (percentile / 100) * (sortedData.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedData.length) return sortedData[sortedData.length - 1];

  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
};

/**
 * 추세 방향 결정
 */
const determineTrendDirection = (growthRate: number, volatility: number): 'increasing' | 'decreasing' | 'stable' => {
  const threshold = 5; // 5% 이하는 안정으로 간주

  if (Math.abs(growthRate) < threshold || volatility > 50) {
    return 'stable';
  }

  return growthRate > 0 ? 'increasing' : 'decreasing';
};

/**
 * 통계 계산을 위한 커스텀 훅
 */
const useStatistics = (
  data: (number | null | undefined)[],
  config: StatisticsConfig = {}
): UseStatisticsReturn => {
  const {
    precision = 2,
    enableTrends = false,
    enableAdvanced = false,
    emptyValueStrategy = 'ignore',
    outlierHandling = 'include',
    outlierThreshold = 1.5
  } = config;

  // 데이터 전처리 및 통계 계산
  const statistics = useMemo(() => {
    // 빈 값 처리
    let processedData: number[];

    switch (emptyValueStrategy) {
      case 'zero':
        processedData = data.map(v => v ?? 0);
        break;
      case 'interpolate':
        // 선형 보간 (간단한 구현)
        processedData = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i] != null) {
            processedData.push(data[i]!);
          } else if (i > 0 && i < data.length - 1) {
            const prev = processedData[processedData.length - 1];
            const nextIndex = data.slice(i + 1).findIndex(v => v != null) + i + 1;
            if (nextIndex < data.length && nextIndex > i) {
              const next = data[nextIndex]!;
              const interpolated = prev + (next - prev) * 0.5;
              processedData.push(interpolated);
            }
          }
        }
        break;
      case 'ignore':
      default:
        processedData = data.filter((v): v is number => v != null);
        break;
    }

    // 이상치 처리
    const cleanedData = handleOutliers(processedData, outlierHandling, outlierThreshold);

    if (cleanedData.length === 0) {
      const emptyBasic: BasicStatistics = {
        sum: 0, average: 0, max: 0, min: 0, count: 0, range: 0
      };
      return {
        basic: emptyBasic,
        advanced: null,
        trends: null,
        cleanedData: [],
        sortedData: []
      };
    }

    // 기본 통계 계산
    const sum = cleanedData.reduce((acc, val) => acc + val, 0);
    const count = cleanedData.length;
    const average = sum / count;
    const max = Math.max(...cleanedData);
    const min = Math.min(...cleanedData);
    const range = max - min;

    const basic: BasicStatistics = {
      sum: Number(sum.toFixed(precision)),
      average: Number(average.toFixed(precision)),
      max: Number(max.toFixed(precision)),
      min: Number(min.toFixed(precision)),
      count,
      range: Number(range.toFixed(precision))
    };

    // 정렬된 데이터
    const sortedData = [...cleanedData].sort((a, b) => a - b);

    // 고급 통계 계산
    let advanced: AdvancedStatistics | null = null;
    if (enableAdvanced && count > 1) {
      const median = calculatePercentile(sortedData, 50);
      const percentile25 = calculatePercentile(sortedData, 25);
      const percentile75 = calculatePercentile(sortedData, 75);

      const variance = cleanedData.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / count;
      const standardDeviation = Math.sqrt(variance);

      advanced = {
        median: Number(median.toFixed(precision)),
        standardDeviation: Number(standardDeviation.toFixed(precision)),
        variance: Number(variance.toFixed(precision)),
        percentile25: Number(percentile25.toFixed(precision)),
        percentile75: Number(percentile75.toFixed(precision)),
        interquartileRange: Number((percentile75 - percentile25).toFixed(precision))
      };
    }

    // 추세 분석
    let trends: TrendStatistics | null = null;
    if (enableTrends && count > 1) {
      const growthRate = ((cleanedData[count - 1] - cleanedData[0]) / Math.abs(cleanedData[0])) * 100;

      // 구간별 증가율 계산
      const growthRates = [];
      for (let i = 1; i < count; i++) {
        const rate = ((cleanedData[i] - cleanedData[i - 1]) / Math.abs(cleanedData[i - 1])) * 100;
        if (isFinite(rate)) growthRates.push(rate);
      }

      const averageGrowthRate = growthRates.length > 0
        ? growthRates.reduce((acc, rate) => acc + rate, 0) / growthRates.length
        : 0;

      const volatility = basic.average > 0 ? (Math.sqrt(variance) / basic.average) * 100 : 0;

      // 연속 증가/감소 계산
      let consecutiveIncreases = 0;
      let consecutiveDecreases = 0;
      let currentIncreases = 0;
      let currentDecreases = 0;

      for (let i = 1; i < count; i++) {
        if (cleanedData[i] > cleanedData[i - 1]) {
          currentIncreases++;
          currentDecreases = 0;
        } else if (cleanedData[i] < cleanedData[i - 1]) {
          currentDecreases++;
          currentIncreases = 0;
        } else {
          currentIncreases = 0;
          currentDecreases = 0;
        }

        consecutiveIncreases = Math.max(consecutiveIncreases, currentIncreases);
        consecutiveDecreases = Math.max(consecutiveDecreases, currentDecreases);
      }

      trends = {
        growthRate: Number(growthRate.toFixed(precision)),
        averageGrowthRate: Number(averageGrowthRate.toFixed(precision)),
        trendDirection: determineTrendDirection(growthRate, volatility),
        volatility: Number(volatility.toFixed(precision)),
        consecutiveIncreases,
        consecutiveDecreases
      };
    }

    return {
      basic,
      advanced,
      trends,
      cleanedData,
      sortedData
    };
  }, [data, precision, enableTrends, enableAdvanced, emptyValueStrategy, outlierHandling, outlierThreshold]);

  // 포맷터 생성
  const formatters = useMemo<StatisticsFormatters>(() => ({
    number: (value: number) => new Intl.NumberFormat('ko-KR').format(value),
    currency: (value: number) => new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(value),
    percentage: (value: number) => `${value.toFixed(precision)}%`,
    decimal: (value: number, decimals = precision) => value.toFixed(decimals),
    compact: (value: number) => {
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
      return value.toString();
    }
  }), [precision]);

  // 통계 요약 생성
  const summary = useMemo(() => {
    const { basic, trends } = statistics;

    if (basic.count === 0) {
      return '데이터가 없습니다.';
    }

    let summaryText = `총 ${formatters.number(basic.count)}개 항목, `;
    summaryText += `평균 ${formatters.number(basic.average)}, `;
    summaryText += `합계 ${formatters.number(basic.sum)}`;

    if (trends) {
      const trendText = trends.trendDirection === 'increasing' ? '상승'
        : trends.trendDirection === 'decreasing' ? '하락' : '안정';
      summaryText += `, 추세: ${trendText} (${formatters.percentage(trends.growthRate)})`;
    }

    return summaryText;
  }, [statistics, formatters]);

  return {
    basic: statistics.basic,
    advanced: statistics.advanced,
    trends: statistics.trends,
    formatters,
    cleanedData: statistics.cleanedData,
    summary
  };
};

export default useStatistics;