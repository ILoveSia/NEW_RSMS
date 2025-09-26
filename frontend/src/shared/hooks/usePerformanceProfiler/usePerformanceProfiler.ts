/**
 * usePerformanceProfiler - React 컴포넌트 성능 모니터링 훅
 *
 * @description React.Profiler를 활용한 컴포넌트 성능 추적 및 분석
 * - 렌더링 시간 측정
 * - 성능 지표 수집 및 분석
 * - 성능 병목 자동 감지
 * - 성능 데이터 로깅 및 알림
 *
 * @author Claude AI
 * @version 1.0.0
 * @created 2024-09-26
 *
 * @example
 * ```tsx
 * const { ProfilerWrapper, metrics, isProfilerActive } = usePerformanceProfiler({
 *   id: 'UserList',
 *   threshold: 50, // 50ms 초과시 경고
 *   enableConsoleLog: true
 * });
 *
 * return (
 *   <ProfilerWrapper>
 *     <UserList users={users} />
 *   </ProfilerWrapper>
 * );
 * ```
 */

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { Profiler, ProfilerOnRenderCallback } from 'react';

// 성능 데이터 타입
export interface PerformanceData {
  /** 컴포넌트 ID */
  id: string;
  /** 렌더링 단계 */
  phase: 'mount' | 'update' | 'nested-update';
  /** 실제 렌더링 시간 (ms) */
  actualDuration: number;
  /** 기준 렌더링 시간 (ms) */
  baseDuration: number;
  /** 렌더링 시작 시간 */
  startTime: number;
  /** 커밋 시간 */
  commitTime: number;
  /** 상호작용 추적 ID */
  interactions: Set<any>;
}

// 성능 지표 타입
export interface PerformanceMetrics {
  /** 총 렌더링 횟수 */
  totalRenders: number;
  /** 평균 렌더링 시간 (ms) */
  averageDuration: number;
  /** 최대 렌더링 시간 (ms) */
  maxDuration: number;
  /** 최소 렌더링 시간 (ms) */
  minDuration: number;
  /** 느린 렌더링 횟수 (threshold 초과) */
  slowRenders: number;
  /** 마운트 vs 업데이트 비율 */
  mountUpdateRatio: {
    mount: number;
    update: number;
  };
  /** 최근 성능 데이터 (최대 50개) */
  recentData: PerformanceData[];
  /** 성능 점수 (0-100) */
  performanceScore: number;
}

// 성능 설정 타입
export interface PerformanceConfig {
  /** 컴포넌트 ID */
  id: string;
  /** 성능 경고 임계값 (ms) */
  threshold?: number;
  /** 콘솔 로깅 활성화 */
  enableConsoleLog?: boolean;
  /** 성능 데이터 수집 활성화 */
  enabled?: boolean;
  /** 최대 데이터 보관 개수 */
  maxDataPoints?: number;
  /** 성능 경고 콜백 */
  onPerformanceWarning?: (data: PerformanceData, metrics: PerformanceMetrics) => void;
  /** 성능 데이터 변경 콜백 */
  onMetricsChange?: (metrics: PerformanceMetrics) => void;
}

// 훅 반환 타입
export interface UsePerformanceProfilerReturn {
  /** Profiler로 감쌀 래퍼 컴포넌트 */
  ProfilerWrapper: React.FC<{ children: React.ReactNode }>;
  /** 현재 성능 지표 */
  metrics: PerformanceMetrics;
  /** 프로파일러 활성 상태 */
  isProfilerActive: boolean;
  /** 프로파일러 활성화/비활성화 */
  toggleProfiler: (enabled?: boolean) => void;
  /** 성능 데이터 초기화 */
  resetMetrics: () => void;
  /** 성능 데이터 내보내기 */
  exportMetrics: () => string;
}

/**
 * 성능 점수 계산 (0-100)
 */
const calculatePerformanceScore = (metrics: PerformanceMetrics, threshold: number): number => {
  if (metrics.totalRenders === 0) return 100;

  // 기본 점수는 100에서 시작
  let score = 100;

  // 평균 렌더링 시간이 임계값을 초과하면 감점
  if (metrics.averageDuration > threshold) {
    const penalty = Math.min((metrics.averageDuration / threshold - 1) * 30, 40);
    score -= penalty;
  }

  // 느린 렌더링 비율에 따른 감점
  const slowRenderRatio = metrics.slowRenders / metrics.totalRenders;
  score -= slowRenderRatio * 30;

  // 최대 렌더링 시간이 임계값의 3배를 초과하면 추가 감점
  if (metrics.maxDuration > threshold * 3) {
    score -= 15;
  }

  return Math.max(0, Math.round(score));
};

/**
 * 성능 모니터링을 위한 커스텀 훅
 */
const usePerformanceProfiler = (config: PerformanceConfig): UsePerformanceProfilerReturn => {
  const {
    id,
    threshold = 100,
    enableConsoleLog = false,
    enabled = true,
    maxDataPoints = 50,
    onPerformanceWarning,
    onMetricsChange
  } = config;

  const [isActive, setIsActive] = useState(enabled);
  const performanceDataRef = useRef<PerformanceData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => ({
    totalRenders: 0,
    averageDuration: 0,
    maxDuration: 0,
    minDuration: 0,
    slowRenders: 0,
    mountUpdateRatio: { mount: 0, update: 0 },
    recentData: [],
    performanceScore: 100
  }));

  // 성능 데이터 처리
  const handleRender = useCallback<ProfilerOnRenderCallback>((
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    if (!isActive) return;

    const perfData: PerformanceData = {
      id,
      phase: phase as 'mount' | 'update' | 'nested-update',
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions
    };

    // 성능 데이터 저장
    performanceDataRef.current.push(perfData);

    // 최대 데이터 포인트 제한
    if (performanceDataRef.current.length > maxDataPoints) {
      performanceDataRef.current = performanceDataRef.current.slice(-maxDataPoints);
    }

    // 성능 지표 계산
    const data = performanceDataRef.current;
    const totalRenders = data.length;
    const durations = data.map(d => d.actualDuration);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / totalRenders;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    const slowRenders = data.filter(d => d.actualDuration > threshold).length;

    const mountCount = data.filter(d => d.phase === 'mount').length;
    const updateCount = data.filter(d => d.phase === 'update').length;

    const newMetrics: PerformanceMetrics = {
      totalRenders,
      averageDuration,
      maxDuration,
      minDuration,
      slowRenders,
      mountUpdateRatio: {
        mount: mountCount,
        update: updateCount
      },
      recentData: [...data],
      performanceScore: calculatePerformanceScore({
        totalRenders,
        averageDuration,
        maxDuration,
        minDuration,
        slowRenders,
        mountUpdateRatio: { mount: mountCount, update: updateCount },
        recentData: [...data],
        performanceScore: 0
      }, threshold)
    };

    setMetrics(newMetrics);

    // 콘솔 로깅
    if (enableConsoleLog) {
      const isSlowRender = actualDuration > threshold;
      const logMethod = isSlowRender ? console.warn : console.log;

      logMethod(`[Profiler ${id}] ${phase} render:`, {
        duration: `${actualDuration.toFixed(2)}ms`,
        baseline: `${baseDuration.toFixed(2)}ms`,
        score: newMetrics.performanceScore,
        isSlowRender,
        interactions: interactions.size
      });
    }

    // 성능 경고 콜백 실행
    if (actualDuration > threshold && onPerformanceWarning) {
      onPerformanceWarning(perfData, newMetrics);
    }

    // 메트릭스 변경 콜백 실행
    if (onMetricsChange) {
      onMetricsChange(newMetrics);
    }
  }, [
    isActive,
    threshold,
    maxDataPoints,
    enableConsoleLog,
    onPerformanceWarning,
    onMetricsChange,
    id
  ]);

  // 프로파일러 토글
  const toggleProfiler = useCallback((enabledState?: boolean) => {
    setIsActive(prev => enabledState !== undefined ? enabledState : !prev);
  }, []);

  // 성능 데이터 초기화
  const resetMetrics = useCallback(() => {
    performanceDataRef.current = [];
    setMetrics({
      totalRenders: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: 0,
      slowRenders: 0,
      mountUpdateRatio: { mount: 0, update: 0 },
      recentData: [],
      performanceScore: 100
    });
  }, []);

  // 성능 데이터 내보내기
  const exportMetrics = useCallback((): string => {
    const exportData = {
      id,
      timestamp: new Date().toISOString(),
      config: {
        threshold,
        enableConsoleLog,
        maxDataPoints
      },
      metrics,
      rawData: performanceDataRef.current
    };

    return JSON.stringify(exportData, null, 2);
  }, [id, threshold, enableConsoleLog, maxDataPoints, metrics]);

  // ProfilerWrapper 컴포넌트
  const ProfilerWrapper = useMemo(() => {
    const ProfilerWrapperComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      if (!isActive) {
        return <>{children}</>;
      }

      return (
        <Profiler id={id} onRender={handleRender}>
          {children}
        </Profiler>
      );
    };

    ProfilerWrapperComponent.displayName = `ProfilerWrapper(${id})`;
    return ProfilerWrapperComponent;
  }, [id, handleRender, isActive]);

  return {
    ProfilerWrapper,
    metrics,
    isProfilerActive: isActive,
    toggleProfiler,
    resetMetrics,
    exportMetrics
  };
};

export default usePerformanceProfiler;