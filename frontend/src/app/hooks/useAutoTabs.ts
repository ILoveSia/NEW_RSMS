/**
 * 자동 탭 관리 훅
 * 현재 경로에 따라 자동으로 탭을 추가/활성화
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTabStore } from '@/app/store/tabStore';

// 경로별 탭 정의
const PATH_TO_TAB_MAP: Record<string, { id: string; title: string; icon: string }> = {
  '/app/dashboard': {
    id: 'dashboard',
    title: '대시보드',
    icon: '📊'
  },
  '/app/resps/positions': {
    id: 'position-management',
    title: '직책관리',
    icon: '👥'
  },
  '/app/resps/position-duals': {
    id: 'position-concurrent',
    title: '직책겸직관리',
    icon: '🔄'
  },
  '/app/resps/responsibilities': {
    id: 'responsibility-management',
    title: '책무관리',
    icon: '📋'
  },
  '/app/resps/specifications': {
    id: 'specification-management',
    title: '책무기술서관리',
    icon: '📄'
  },
  '/app/resps/meetings': {
    id: 'meeting-management',
    title: '회의체관리',
    icon: '🏛️'
  },
  '/app/resps/board-history': {
    id: 'board-history',
    title: '이사회이력관리',
    icon: '📚'
  },
  '/app/resps/executive-info': {
    id: 'executive-info',
    title: '임원정보관리',
    icon: '🏆'
  },
  '/app/resps/department-manuals': {
    id: 'department-manual',
    title: '부서장업무메뉴얼관리',
    icon: '📖'
  },
  '/app/resps/ceo-management': {
    id: 'ceo-management',
    title: 'CEO총괄관리의무조회',
    icon: '👑'
  }
};

export const useAutoTabs = () => {
  const location = useLocation();
  const { addTab, setActiveTab } = useTabStore();

  useEffect(() => {
    const currentPath = location.pathname;
    const tabInfo = PATH_TO_TAB_MAP[currentPath];

    if (tabInfo) {
      // 해당 경로에 대한 탭 정보가 있으면 탭 추가/활성화
      addTab({
        id: tabInfo.id,
        title: tabInfo.title,
        icon: tabInfo.icon,
        path: currentPath
      });
    } else {
      // 정확한 매치가 없는 경우 기본 경로들을 확인
      if (currentPath.startsWith('/app/dashboard')) {
        setActiveTab('dashboard');
      }
      // 다른 동적 경로들에 대한 처리는 필요시 추가
    }
  }, [location.pathname, addTab, setActiveTab]);

  return {
    currentPath: location.pathname
  };
};