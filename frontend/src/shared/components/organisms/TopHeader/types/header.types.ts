/**
 * TopHeader 컴포넌트 타입 정의
 */

export interface Tab {
  id: string;
  title: string;
  icon: string;
  isActive: boolean;
  badge?: number;
  path: string;
}

export interface UserProfile {
  name: string;
  role: string;
  employeeId: string;
  avatar?: string;
}

export interface TopHeaderProps {
  activeTabs?: Tab[];
  userProfile?: UserProfile;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onUserClick?: () => void;
  onLogoutClick?: () => void;
}