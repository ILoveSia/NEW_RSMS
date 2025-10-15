/**
 * RSMS LeftMenu 메뉴 구조 데이터
 * 사용자가 제공한 정확한 메뉴 구조를 기반으로 구성
 */

import { MenuItem } from '../types/menu.types';

export const MENU_DATA: MenuItem[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    path: '/app/dashboard',
    icon: 'Dashboard',
    permission: 'auth'
  },
  {
    id: 'resp-ledger',
    title: '책무구조도 원장 관리',
    icon: 'FolderOpen',
    permission: 'auth',
    children: [
      {
        id: 'ledgermgmt',
        title: '원장관리',
        path: '/app/resps/ledgermgmt',
        permission: 'auth'
      },
      {
        id: 'positionmgmt',
        title: '직책관리',
        path: '/app/resps/positionmgmt',
        permission: 'auth'
      },
      {
        id: 'positiondualmgmt',
        title: '직책겸직관리',
        path: '/app/resps/positiondualmgmt',
        permission: 'auth'
      },
      {
        id: 'deliberativemgmt',
        title: '회의체관리',
        path: '/app/resps/deliberativemgmt',
        permission: 'auth'
      },
      {
        id: 'responsibilitymgmt',
        title: '책무관리',
        path: '/app/resps/responsibilitymgmt',
        permission: 'auth'
      },
      {
        id: 'responsibilitydocmgmt',
        title: '책무기술서관리',
        path: '/app/resps/responsibilitydocmgmt',
        permission: 'auth'
      },
      {
        id: 'boardhistorymgmt',
        title: '이사회이력관리',
        path: '/app/resps/boardhistorymgmt',
        permission: 'manager'
      },
      {
        id: 'officerinfomgmt',
        title: '임원정보관리',
        path: '/app/resps/officerinfomgmt',
        permission: 'manager'
      },
      {
        id: 'deptopmanualsmgmt',
        title: '부서장업무메뉴얼관리',
        path: '/app/resps/deptopmanualsmgmt',
        permission: 'manager'
      },
      {
        id: 'ceomgmtdutysearch',
        title: 'CEO총괄관리의무조회',
        path: '/app/resps/ceomgmtdutysearch',
        permission: 'executive'
      },
      {
        id: 'rolehistory',
        title: '직책/책무 이력',
        path: '/app/resps/rolehistory',
        permission: 'manager'
      }
    ]
  },
  {
    id: 'resp-activity',
    title: '책무구조도 관리 활동',
    icon: 'Assignment',
    permission: 'auth',
    children: [
      {
        id: 'performer-assignment',
        title: '수행자지정',
        path: '/app/activity/performer-assignment',
        permission: 'manager'
      },
      {
        id: 'activity-execution',
        title: '관리활동 수행',
        path: '/app/activity/execution',
        permission: 'auth'
      },
      {
        id: 'manual-inquiry',
        title: '업무메뉴얼조회',
        path: '/app/activity/manual-inquiry',
        permission: 'auth'
      },
      {
        id: 'internal-control-register',
        title: '내부통제장치등록',
        path: '/app/activity/internal-control-register',
        permission: 'manager'
      },
      {
        id: 'internal-control-management',
        title: '내부통제장치관리',
        path: '/app/activity/internal-control-management',
        permission: 'manager'
      }
    ]
  },
  {
    id: 'compliance-management',
    title: '이행점검 관리',
    icon: 'Assessment',
    permission: 'manager',
    children: [
      {
        id: 'period-setting',
        title: '기간설정',
        path: '/app/compliance/period-setting',
        permission: 'manager'
      },
      {
        id: 'inspector-assignment',
        title: '점검자지정',
        path: '/app/compliance/inspector-assignment',
        permission: 'manager'
      },
      {
        id: 'execution-approval',
        title: '점검수행 및 결재',
        path: '/app/compliance/execution-approval',
        permission: 'manager'
      },
      {
        id: 'rejection-management',
        title: '반려관리',
        path: '/app/compliance/rejection-management',
        permission: 'manager'
      }
    ]
  },
  {
    id: 'compliance-report',
    title: '이행점검보고서',
    icon: 'Description',
    permission: 'manager',
    children: [
      {
        id: 'executive-report',
        title: '임원이행점검보고서',
        path: '/app/reports/executive-report',
        permission: 'manager'
      },
      {
        id: 'ceo-report',
        title: 'CEO이행점검보고서',
        path: '/app/reports/ceo-report',
        permission: 'executive'
      },
      {
        id: 'report-list',
        title: '보고서목록',
        path: '/app/reports/report-list',
        permission: 'manager'
      }
    ]
  },
  {
    id: 'improvement',
    title: '개선이행',
    icon: 'TrendingUp',
    permission: 'manager',
    children: [
      {
        id: 'activity-compliance-improvement',
        title: '관리활동/이행점검 개선이행',
        path: '/app/improvement/activity-compliance',
        permission: 'manager'
      },
      {
        id: 'report-improvement',
        title: '이행점검 보고서 개선이행',
        path: '/app/improvement/report',
        permission: 'manager'
      }
    ]
  },
  {
    id: 'approval-management',
    title: '결재관리',
    icon: 'Approval',
    permission: 'auth',
    children: [
      {
        id: 'approval-box',
        title: '결재함',
        path: '/app/approval/box',
        permission: 'auth',
        badge: 0 // 실제로는 API에서 가져올 미처리 결재 건수
      },
      {
        id: 'approval-line',
        title: '결재선관리',
        path: '/app/approval/line',
        permission: 'manager'
      }
    ]
  },
  {
    id: 'system-management',
    title: '시스템관리',
    icon: 'Settings',
    permission: 'admin',
    children: [
      {
        id: 'code-management',
        title: '코드관리',
        path: '/app/settings/system/code-mgmt',
        permission: 'admin'
      },
      {
        id: 'menu-management',
        title: '메뉴관리',
        path: '/app/settings/system/menu-mgmt',
        permission: 'admin'
      },
      {
        id: 'role-management',
        title: '역활관리',
        path: '/app/settings/system/role-mgmt',
        permission: 'admin'
      },
      {
        id: 'user-management',
        title: '사용자관리',
        path: '/app/settings/system/user-mgmt',
        permission: 'admin'
      },
      {
        id: 'access-log',
        title: '접근로그',
        path: '/app/settings/system/access-log',
        permission: 'admin'
      }
    ]
  }
];

// 메뉴 ID로 메뉴 찾기 헬퍼 함수
export const findMenuById = (menuId: string, menuData: MenuItem[] = MENU_DATA): MenuItem | null => {
  for (const item of menuData) {
    if (item.id === menuId) {
      return item;
    }
    if (item.children) {
      const found = findMenuById(menuId, item.children);
      if (found) return found;
    }
  }
  return null;
};

// 경로로 메뉴 찾기 헬퍼 함수
export const findMenuByPath = (path: string, menuData: MenuItem[] = MENU_DATA): MenuItem | null => {
  for (const item of menuData) {
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const found = findMenuByPath(path, item.children);
      if (found) return found;
    }
  }
  return null;
};

// 권한에 따른 메뉴 필터링
export const filterMenuByPermission = (
  menuData: MenuItem[],
  userRoles: string[]
): MenuItem[] => {
  return menuData.filter(item => {
    // 권한 체크 로직 (실제로는 더 복잡한 권한 체크 필요)
    if (!item.permission || item.permission === 'public') return true;

    // 계층적 권한 체크 (ADMIN은 모든 권한, EXECUTIVE는 manager 포함 등)
    if (item.permission === 'auth' && (userRoles.includes('USER') || userRoles.includes('EMPLOYEE') || userRoles.includes('MANAGER') || userRoles.includes('ADMIN') || userRoles.includes('EXECUTIVE'))) return true;
    if (item.permission === 'manager' && (userRoles.includes('MANAGER') || userRoles.includes('ADMIN') || userRoles.includes('EXECUTIVE'))) return true;
    if (item.permission === 'admin' && userRoles.includes('ADMIN')) return true;
    if (item.permission === 'executive' && (userRoles.includes('EXECUTIVE') || userRoles.includes('ADMIN'))) return true;

    return false;
  }).map(item => ({
    ...item,
    children: item.children ? filterMenuByPermission(item.children, userRoles) : undefined
  }));
};