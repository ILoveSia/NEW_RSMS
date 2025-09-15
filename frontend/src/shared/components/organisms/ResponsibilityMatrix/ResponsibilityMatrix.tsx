import React from 'react';
import { Paper, Typography, Chip, Tooltip } from '@mui/material';
import clsx from 'clsx';

import styles from './ResponsibilityMatrix.module.scss';

export interface Role {
  id: string;
  name: string;
  level: 'ceo' | 'executive' | 'director' | 'manager' | 'staff';
  department: string;
}

export interface Responsibility {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface ResponsibilityMapping {
  roleId: string;
  responsibilityId: string;
  status: 'assigned' | 'progress' | 'completed' | 'overdue' | 'delegated';
  assignedDate: Date;
  dueDate?: Date;
  completedDate?: Date;
}

export interface ResponsibilityMatrixProps {
  /** 역할 목록 */
  roles: Role[];
  /** 책무 목록 */
  responsibilities: Responsibility[];
  /** 책무-역할 매핑 */
  matrix: ResponsibilityMapping[];
  /** 계층 레벨 (표시 밀도 조정) */
  hierarchyLevel?: 'executive' | 'director' | 'manager' | 'staff';
  /** 인터랙티브 모드 */
  interactive?: boolean;
  /** 매트릭스 셀 클릭 핸들러 */
  onCellClick?: (roleId: string, responsibilityId: string) => void;
  /** 역할 클릭 핸들러 */
  onRoleClick?: (role: Role) => void;
  /** 책무 클릭 핸들러 */
  onResponsibilityClick?: (responsibility: Responsibility) => void;
  /** 테스트 id */
  'data-testid'?: string;
}

/**
 * ResponsibilityMatrix - 맨하탄 금융센터 스타일 책무구조도 매트릭스
 * 
 * 조직 내 역할과 책무의 관계를 시각적으로 표현하는 컴포넌트
 * Wall Street 스타일의 정교한 데이터 표현과 즉시 반응 인터랙션 제공
 * 
 * @example
 * // 기본 사용
 * <ResponsibilityMatrix
 *   roles={roles}
 *   responsibilities={responsibilities}
 *   matrix={matrix}
 * />
 * 
 * // Executive 레벨 (큰 크기)
 * <ResponsibilityMatrix
 *   roles={roles}
 *   responsibilities={responsibilities}
 *   matrix={matrix}
 *   hierarchyLevel="executive"
 *   interactive
 *   onCellClick={handleCellClick}
 * />
 */
const ResponsibilityMatrix: React.FC<ResponsibilityMatrixProps> = ({
  roles,
  responsibilities,
  matrix,
  hierarchyLevel = 'manager',
  interactive = false,
  onCellClick,
  onRoleClick,
  onResponsibilityClick,
  'data-testid': dataTestId = 'responsibility-matrix',
}) => {
  // 매트릭스 매핑을 빠른 조회를 위한 Map으로 변환
  const matrixMap = React.useMemo(() => {
    const map = new Map<string, ResponsibilityMapping>();
    matrix.forEach(mapping => {
      const key = `${mapping.roleId}-${mapping.responsibilityId}`;
      map.set(key, mapping);
    });
    return map;
  }, [matrix]);

  // 특정 역할-책무 조합의 매핑 정보 조회
  const getMapping = (roleId: string, responsibilityId: string): ResponsibilityMapping | undefined => {
    return matrixMap.get(`${roleId}-${responsibilityId}`);
  };

  // 상태별 스타일 클래스 생성
  const getStatusClass = (status: ResponsibilityMapping['status']) => {
    switch (status) {
      case 'assigned': return styles.statusAssigned;
      case 'progress': return styles.statusProgress;
      case 'completed': return styles.statusCompleted;
      case 'overdue': return styles.statusOverdue;
      case 'delegated': return styles.statusDelegated;
      default: return '';
    }
  };

  // 권한 레벨별 스타일 클래스 생성
  const getAuthorityClass = (level: Role['level']) => {
    switch (level) {
      case 'ceo': return styles.authorityCeo;
      case 'executive': return styles.authorityExecutive;
      case 'director': return styles.authorityDirector;
      case 'manager': return styles.authorityManager;
      case 'staff': return styles.authorityStaff;
      default: return '';
    }
  };

  // 우선순위별 스타일 클래스 생성
  const getPriorityClass = (priority: Responsibility['priority']) => {
    switch (priority) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  return (
    <Paper 
      className={clsx(
        styles.matrix,
        styles[`hierarchy-${hierarchyLevel}`],
        { [styles.interactive]: interactive }
      )}
      data-testid={dataTestId}
    >
      {/* 헤더 */}
      <div className={styles.header}>
        <Typography variant="h5" className={styles.title}>
          책무구조도 매트릭스
        </Typography>
        <div className={styles.legend}>
          <Chip 
            label="배정됨" 
            size="small" 
            className={clsx(styles.legendChip, styles.statusAssigned)} 
          />
          <Chip 
            label="진행중" 
            size="small" 
            className={clsx(styles.legendChip, styles.statusProgress)} 
          />
          <Chip 
            label="완료됨" 
            size="small" 
            className={clsx(styles.legendChip, styles.statusCompleted)} 
          />
          <Chip 
            label="지연됨" 
            size="small" 
            className={clsx(styles.legendChip, styles.statusOverdue)} 
          />
          <Chip 
            label="위임됨" 
            size="small" 
            className={clsx(styles.legendChip, styles.statusDelegated)} 
          />
        </div>
      </div>

      {/* 매트릭스 테이블 */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.cornerCell}>역할 / 책무</th>
              {responsibilities.map((responsibility) => (
                <th 
                  key={responsibility.id} 
                  className={clsx(
                    styles.responsibilityHeader,
                    getPriorityClass(responsibility.priority)
                  )}
                  onClick={() => interactive && onResponsibilityClick?.(responsibility)}
                >
                  <Tooltip title={responsibility.description} placement="top">
                    <div>
                      <div className={styles.responsibilityTitle}>
                        {responsibility.title}
                      </div>
                      <div className={styles.responsibilityCategory}>
                        {responsibility.category}
                      </div>
                    </div>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td 
                  className={clsx(
                    styles.roleHeader,
                    getAuthorityClass(role.level)
                  )}
                  onClick={() => interactive && onRoleClick?.(role)}
                >
                  <div className={styles.roleName}>{role.name}</div>
                  <div className={styles.roleDepartment}>{role.department}</div>
                </td>
                {responsibilities.map((responsibility) => {
                  const mapping = getMapping(role.id, responsibility.id);
                  return (
                    <td
                      key={`${role.id}-${responsibility.id}`}
                      className={clsx(
                        styles.matrixCell,
                        mapping && getStatusClass(mapping.status),
                        { [styles.assigned]: !!mapping }
                      )}
                      onClick={() => interactive && onCellClick?.(role.id, responsibility.id)}
                      data-testid={`${dataTestId}-cell-${role.id}-${responsibility.id}`}
                    >
                      {mapping && (
                        <Tooltip 
                          title={
                            <div>
                              <div>상태: {mapping.status}</div>
                              <div>배정일: {mapping.assignedDate.toLocaleDateString()}</div>
                              {mapping.dueDate && (
                                <div>마감일: {mapping.dueDate.toLocaleDateString()}</div>
                              )}
                              {mapping.completedDate && (
                                <div>완료일: {mapping.completedDate.toLocaleDateString()}</div>
                              )}
                            </div>
                          }
                        >
                          <div className={styles.cellContent}>
                            <div className={styles.statusIndicator} />
                          </div>
                        </Tooltip>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Paper>
  );
};

export default ResponsibilityMatrix;