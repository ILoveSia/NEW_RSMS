import React, { useCallback, useMemo } from 'react';
import {
  Dashboard as DashboardIcon,
  AccountTree as AccountTreeIcon,
  FactCheck as FactCheckIcon,
  Summarize as SummarizeIcon,
  TrendingUp as TrendingUpIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Approval as ApprovalIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import styles from './MenuTreeComponent.module.scss';

// Types
import type { MenuNode, TreeState } from '../../types/menuMgmt.types';

interface MenuTreeComponentProps {
  menuTree: MenuNode[];
  treeState: TreeState;
  onMenuSelect: (menuId: string) => void;
  onMenuExpand: (menuId: string) => void;
  searchTerm?: string;
}

// 아이콘 매핑
const MENU_ICON_MAP: Record<string, React.ReactElement> = {
  DashboardIcon: <DashboardIcon />,
  AccountTreeIcon: <AccountTreeIcon />,
  FactCheckIcon: <FactCheckIcon />,
  SummarizeIcon: <SummarizeIcon />,
  TrendingUpIcon: <TrendingUpIcon />,
  AdminPanelSettingsIcon: <AdminPanelSettingsIcon />,
  ApprovalIcon: <ApprovalIcon />
};

const MenuTreeComponent: React.FC<MenuTreeComponentProps> = ({
  menuTree,
  treeState,
  onMenuSelect,
  onMenuExpand,
  searchTerm = ''
}) => {
  // 검색어가 있을 때 메뉴 필터링
  const filteredTree = useMemo(() => {
    if (!searchTerm) return menuTree;

    const filterNodes = (nodes: MenuNode[]): MenuNode[] => {
      return nodes.reduce((acc: MenuNode[], node) => {
        const matchesSearch = node.menuName.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = filterNodes(node.children);

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren
          });
        }

        return acc;
      }, []);
    };

    return filterNodes(menuTree);
  }, [menuTree, searchTerm]);

  // 메뉴 노드 렌더링 함수
  const renderMenuNode = useCallback((node: MenuNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = treeState.expandedNodes.has(node.id);
    const isSelected = treeState.selectedNode === node.id;
    const isMatched = searchTerm && node.menuName.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      <div key={node.id} className={styles.treeNodeWrapper}>
        <div
          className={`
            ${styles.treeNode}
            ${isSelected ? styles.selected : ''}
            ${isMatched ? styles.matched : ''}
            ${!node.isActive ? styles.inactive : ''}
          `}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          onClick={() => onMenuSelect(node.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onMenuSelect(node.id);
            }
          }}
        >
          {/* 확장/축소 아이콘 */}
          {hasChildren && (
            <div
              className={styles.expandIcon}
              onClick={(e) => {
                e.stopPropagation();
                onMenuExpand(node.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onMenuExpand(node.id);
                }
              }}
            >
              {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </div>
          )}

          {/* 메뉴 아이콘 */}
          <div className={styles.menuIcon}>
            {MENU_ICON_MAP[node.icon || ''] || (
              <div className={styles.defaultIcon}>
                {node.menuType === 'folder' ? '📁' : '📄'}
              </div>
            )}
          </div>

          {/* 메뉴명 */}
          <span className={styles.menuName}>
            {searchTerm ? (
              <HighlightText text={node.menuName} highlight={searchTerm} />
            ) : (
              node.menuName
            )}
          </span>

          {/* 상태 표시 */}
          <div className={styles.statusIndicators}>
            {!node.isActive && (
              <span className={styles.inactiveLabel}>비활성</span>
            )}
            {node.isTestPage && (
              <span className={styles.testLabel}>테스트</span>
            )}
            {hasChildren && (
              <span className={styles.childrenCount}>
                ({node.children.length})
              </span>
            )}
          </div>
        </div>

        {/* 자식 노드들 */}
        {hasChildren && isExpanded && (
          <div className={styles.childNodes}>
            {node.children.map((child) => renderMenuNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [treeState, onMenuSelect, onMenuExpand, searchTerm]);

  // 검색어 하이라이트 컴포넌트
  const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight) return <span>{text}</span>;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => (
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} className={styles.highlight}>{part}</mark>
          ) : (
            <span key={index}>{part}</span>
          )
        ))}
      </span>
    );
  };

  // 트리 통계 정보
  const treeStats = useMemo(() => {
    const stats = filteredTree.reduce(
      (acc, node) => {
        const countNodes = (n: MenuNode): { total: number; active: number; pages: number } => {
          let total = 1;
          let active = n.isActive ? 1 : 0;
          let pages = n.menuType === 'page' ? 1 : 0;

          n.children.forEach(child => {
            const childStats = countNodes(child);
            total += childStats.total;
            active += childStats.active;
            pages += childStats.pages;
          });

          return { total, active, pages };
        };

        const nodeStats = countNodes(node);
        acc.total += nodeStats.total;
        acc.active += nodeStats.active;
        acc.pages += nodeStats.pages;

        return acc;
      },
      { total: 0, active: 0, pages: 0 }
    );

    return stats;
  }, [filteredTree]);

  return (
    <div className={styles.menuTreeContainer}>
      {/* 트리 헤더 */}
      <div className={styles.treeHeader}>
        <div className={styles.treeStats}>
          <span className={styles.statItem}>
            전체: <strong>{treeStats.total}</strong>
          </span>
          <span className={styles.statItem}>
            활성: <strong>{treeStats.active}</strong>
          </span>
          <span className={styles.statItem}>
            페이지: <strong>{treeStats.pages}</strong>
          </span>
        </div>
      </div>

      {/* 트리 컨텐츠 */}
      <div className={styles.treeContent}>
        {filteredTree.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm ? (
              <div className={styles.noSearchResults}>
                <span>'{searchTerm}'에 대한 검색 결과가 없습니다.</span>
              </div>
            ) : (
              <div className={styles.noData}>
                <span>메뉴 데이터가 없습니다.</span>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.treeNodes}>
            {filteredTree.map((node) => renderMenuNode(node, 0))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuTreeComponent;