/**
 * 성능 모니터링 및 Web Vitals 측정 유틸리티
 *
 * 기능:
 * - Core Web Vitals 측정 (CLS, FCP, FID, LCP, TTFB)
 * - 커스텀 성능 메트릭 측정
 * - 성능 데이터 로깅 및 분석
 * - 메모리 사용량 모니터링
 *
 * @author Claude AI
 * @since 2025-09-18
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * 성능 메트릭 타입 정의
 */
export interface PerformanceMetric extends Metric {
  url: string;
  timestamp: number;
  userAgent: string;
}

/**
 * 커스텀 성능 메트릭
 */
export interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * 성능 임계값 설정
 */
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals 임계값 (Google 권장)
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (ms) - FID 대체
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)

  // 커스텀 임계값
  BUNDLE_SIZE: { good: 500, poor: 1000 }, // KB
  MEMORY_USAGE: { good: 50, poor: 100 },  // MB
  API_RESPONSE: { good: 200, poor: 1000 } // ms
} as const;

/**
 * 성능 등급 계산
 */
export function getPerformanceGrade(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * 성능 메트릭 콜백 함수
 */
type MetricCallback = (metric: PerformanceMetric) => void;

/**
 * 성능 데이터 저장소
 */
class PerformanceStore {
  private metrics: PerformanceMetric[] = [];
  private customMetrics: CustomMetric[] = [];
  private callbacks: MetricCallback[] = [];

  /**
   * 메트릭 추가
   */
  addMetric(metric: Metric): void {
    const enhancedMetric: PerformanceMetric = {
      ...metric,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    this.metrics.push(enhancedMetric);
    this.callbacks.forEach(callback => callback(enhancedMetric));

    // 성능 메트릭 콘솔 로깅 비활성화
    // 필요시 브라우저 DevTools Performance 탭 또는 Ctrl+Shift+P 사용
  }

  /**
   * 커스텀 메트릭 추가
   */
  addCustomMetric(name: string, value: number, unit: string = 'ms', metadata?: Record<string, any>): void {
    const customMetric: CustomMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    };

    this.customMetrics.push(customMetric);

    // 개발 환경에서 콘솔 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Custom Metric: ${name} = ${value}${unit}`, metadata);
    }
  }

  /**
   * 메트릭 등급 계산
   */
  private getMetricGrade(metric: Metric): string {
    switch (metric.name) {
      case 'LCP':
        return getPerformanceGrade(metric.value, PERFORMANCE_THRESHOLDS.LCP);
      case 'INP':
        return getPerformanceGrade(metric.value, PERFORMANCE_THRESHOLDS.INP);
      case 'CLS':
        return getPerformanceGrade(metric.value, PERFORMANCE_THRESHOLDS.CLS);
      case 'FCP':
        return getPerformanceGrade(metric.value, PERFORMANCE_THRESHOLDS.FCP);
      case 'TTFB':
        return getPerformanceGrade(metric.value, PERFORMANCE_THRESHOLDS.TTFB);
      default:
        return 'unknown';
    }
  }

  /**
   * 메트릭 단위 반환
   */
  private getMetricUnit(name: string): string {
    switch (name) {
      case 'CLS':
        return '';
      case 'LCP':
      case 'INP':
      case 'FCP':
      case 'TTFB':
        return 'ms';
      default:
        return '';
    }
  }

  /**
   * 콜백 등록
   */
  onMetric(callback: MetricCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * 모든 메트릭 반환
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 커스텀 메트릭 반환
   */
  getCustomMetrics(): CustomMetric[] {
    return [...this.customMetrics];
  }

  /**
   * 성능 요약 생성
   */
  getPerformanceSummary() {
    const summary: Record<string, any> = {};

    // Core Web Vitals 요약
    ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].forEach(name => {
      const metric = this.metrics.find(m => m.name === name);
      if (metric) {
        summary[name] = {
          value: metric.value,
          grade: this.getMetricGrade(metric),
          unit: this.getMetricUnit(name)
        };
      }
    });

    // 메모리 사용량
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      summary.memory = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
        unit: 'MB'
      };
    }

    return summary;
  }
}

// 전역 성능 저장소 인스턴스
const performanceStore = new PerformanceStore();

/**
 * Web Vitals 모니터링 초기화
 */
export function initPerformanceMonitoring(): void {
  // Core Web Vitals 측정
  onLCP(metric => performanceStore.addMetric(metric));
  onINP(metric => performanceStore.addMetric(metric));
  onCLS(metric => performanceStore.addMetric(metric));
  onFCP(metric => performanceStore.addMetric(metric));
  onTTFB(metric => performanceStore.addMetric(metric));

  // 페이지 로드 완료 후 추가 메트릭 수집
  window.addEventListener('load', () => {
    // 페이지 로드 시간
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceStore.addCustomMetric(
        'PAGE_LOAD',
        navigation.loadEventEnd - navigation.fetchStart,
        'ms',
        {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          domComplete: navigation.domComplete - navigation.fetchStart
        }
      );
    }

    // 리소스 로딩 시간 분석
    const resources = performance.getEntriesByType('resource');
    const scripts = resources.filter(r => r.name.includes('.js'));
    const styles = resources.filter(r => r.name.includes('.css'));

    if (scripts.length > 0) {
      const totalScriptTime = scripts.reduce((sum, script) => sum + script.duration, 0);
      performanceStore.addCustomMetric('SCRIPT_LOAD_TIME', totalScriptTime, 'ms', {
        count: scripts.length,
        average: totalScriptTime / scripts.length
      });
    }

    if (styles.length > 0) {
      const totalStyleTime = styles.reduce((sum, style) => sum + style.duration, 0);
      performanceStore.addCustomMetric('STYLE_LOAD_TIME', totalStyleTime, 'ms', {
        count: styles.length,
        average: totalStyleTime / styles.length
      });
    }
  });

  // 메모리 사용량 주기적 모니터링 (개발 환경만)
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      performanceStore.addCustomMetric('MEMORY_USAGE', usedMB, 'MB');
    }, 30000); // 30초마다 측정
  }
}

/**
 * API 응답 시간 측정
 */
export function measureApiPerformance(url: string, startTime: number): void {
  const duration = performance.now() - startTime;
  performanceStore.addCustomMetric(
    'API_RESPONSE_TIME',
    Math.round(duration),
    'ms',
    { url: url.split('/').pop() || 'unknown' }
  );
}

/**
 * 컴포넌트 렌더링 시간 측정
 */
export function measureComponentRender(componentName: string, startTime: number): void {
  const duration = performance.now() - startTime;
  performanceStore.addCustomMetric(
    'COMPONENT_RENDER',
    Math.round(duration),
    'ms',
    { component: componentName }
  );
}

/**
 * 성능 메트릭 콜백 등록
 */
export function onPerformanceMetric(callback: MetricCallback): void {
  performanceStore.onMetric(callback);
}

/**
 * 성능 데이터 내보내기
 */
export function exportPerformanceData() {
  return {
    metrics: performanceStore.getMetrics(),
    customMetrics: performanceStore.getCustomMetrics(),
    summary: performanceStore.getPerformanceSummary(),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
}

/**
 * 성능 보고서 생성
 */
export function generatePerformanceReport(): string {
  const data = exportPerformanceData();
  const summary = data.summary;

  let report = '\n📊 성능 보고서\n';
  report += '='.repeat(50) + '\n\n';

  // Core Web Vitals
  report += '🎯 Core Web Vitals:\n';
  ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'].forEach(metric => {
    if (summary[metric]) {
      const grade = summary[metric].grade;
      const emoji = grade === 'good' ? '✅' : grade === 'needs-improvement' ? '⚠️' : '❌';
      report += `  ${emoji} ${metric}: ${summary[metric].value}${summary[metric].unit} (${grade})\n`;
    }
  });

  // 메모리 사용량
  if (summary.memory) {
    report += `\n💾 메모리 사용량:\n`;
    report += `  📊 사용량: ${summary.memory.used}/${summary.memory.total} MB\n`;
    report += `  📈 한계치: ${summary.memory.limit} MB\n`;
  }

  // 커스텀 메트릭
  const customMetrics = data.customMetrics;
  if (customMetrics.length > 0) {
    report += `\n📈 커스텀 메트릭:\n`;
    customMetrics.slice(-5).forEach(metric => {
      report += `  📍 ${metric.name}: ${metric.value}${metric.unit}\n`;
    });
  }

  report += `\n⏰ 생성 시간: ${data.timestamp}\n`;
  report += `🌐 페이지: ${window.location.pathname}\n`;

  return report;
}

// 기본 내보내기
export default {
  init: initPerformanceMonitoring,
  measureApi: measureApiPerformance,
  measureComponent: measureComponentRender,
  onMetric: onPerformanceMetric,
  export: exportPerformanceData,
  report: generatePerformanceReport,
  thresholds: PERFORMANCE_THRESHOLDS
};