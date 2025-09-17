/**
 * 활성 메뉴 감지 Hook
 * 현재 경로를 기반으로 활성 메뉴를 자동으로 감지하고 설정
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuState } from './useMenuState';
import { findMenuByPath } from '../data/menuData';

export const useActiveMenu = () => {
  const location = useLocation();
  const { setActiveMenu, toggleGroup } = useMenuState();

  useEffect(() => {
    // 현재 경로에 해당하는 메뉴 찾기
    const currentMenu = findMenuByPath(location.pathname);

    if (currentMenu) {
      // 활성 메뉴 설정
      setActiveMenu(currentMenu.id);

      // 해당 메뉴가 속한 그룹을 자동으로 확장
      const pathSegments = location.pathname.split('/');

      if (pathSegments.includes('dashboard')) {
        // 대시보드는 단일 메뉴이므로 별도 처리 불필요
      } else if (pathSegments.includes('resps')) {
        // 책무구조도 관련 메뉴들은 해당 그룹을 확장
        if (pathSegments.includes('positions') ||
            pathSegments.includes('responsibilities') ||
            pathSegments.includes('specifications') ||
            pathSegments.includes('meetings') ||
            pathSegments.includes('board-history') ||
            pathSegments.includes('executive-info') ||
            pathSegments.includes('department-manuals') ||
            pathSegments.includes('ceo-management')) {
          toggleGroup('resp-ledger');
        }
      } else if (pathSegments.includes('activity')) {
        toggleGroup('resp-activity');
      } else if (pathSegments.includes('compliance')) {
        toggleGroup('compliance-management');
      } else if (pathSegments.includes('reports')) {
        toggleGroup('compliance-report');
      } else if (pathSegments.includes('improvement')) {
        toggleGroup('improvement');
      } else if (pathSegments.includes('approval')) {
        toggleGroup('approval-management');
      } else if (pathSegments.includes('system')) {
        toggleGroup('system-management');
      }
    } else {
      // 정확한 매치가 없는 경우 경로 기반으로 추론
      if (location.pathname.startsWith('/app/dashboard')) {
        setActiveMenu('dashboard');
      }
    }
  }, [location.pathname, setActiveMenu, toggleGroup]);

  return {
    currentPath: location.pathname,
    isActiveMenu: (menuId: string) => {
      const { activeMenuItem } = useMenuState.getState();
      return activeMenuItem === menuId;
    }
  };
};