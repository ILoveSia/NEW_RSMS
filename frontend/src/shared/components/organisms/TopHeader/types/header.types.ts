/**
 * TopHeader 컴포넌트 타입 정의
 */

export interface Tab {
  id: string;
  title: string;
  icon: string;
  isActive: boolean;
  badge?: number;
  path?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar?: string;
}

export interface TopHeaderProps {
  activeTabs?: Tab[];
  userProfile?: UserProfile;
  notificationCount?: number;
  onTabClick?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onUserClick?: () => void;
}