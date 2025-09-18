/**
 * LeftMenu 헤더 컴포넌트 (테마 선택 및 토글 버튼)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { MenuOpen, Menu, ExpandMore } from '@mui/icons-material';
import { useMenuState } from '../hooks/useMenuState';
import { useThemeStore, THEME_OPTIONS, ThemeType, THEME_COLORS } from '@/app/store/themeStore';
import styles from './MenuHeader.module.scss';

interface MenuHeaderProps {
  isCollapsed?: boolean;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  isCollapsed = false
}) => {
  const { toggleSidebar } = useMenuState();
  const { currentTheme, setTheme } = useThemeStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);

  const getTextColor = (themeId: ThemeType) => {
    const themeColors = THEME_COLORS[themeId];
    // 방어 로직: 테마 색상이 없으면 기본값 반환
    return themeColors?.menuText || '#1f2937';
  };

  const currentTextColor = getTextColor(currentTheme);
  const selectedTheme = THEME_OPTIONS.find(theme => theme.id === currentTheme);

  const handleThemeSelect = (themeId: ThemeType) => {
    setTheme(themeId);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    const newIsOpen = !isDropdownOpen;
    setIsDropdownOpen(newIsOpen);

    // 드롭다운이 열릴 때 첫 번째 옵션에 포커스
    if (newIsOpen) {
      setTimeout(() => {
        const firstOption = document.querySelector(`[data-theme-option="${THEME_OPTIONS[0].id}"]`) as HTMLElement;
        firstOption?.focus();
      }, 0);
    }
  };

  // 키보드 이벤트 핸들러
  const handleDropdownKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    } else if (event.key === 'Escape') {
      setIsDropdownOpen(false);
    } else if (event.key === 'ArrowDown' && !isDropdownOpen) {
      event.preventDefault();
      toggleDropdown();
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, themeId: ThemeType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeSelect(themeId);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsDropdownOpen(false);
      // 포커스를 드롭다운 버튼으로 되돌리기
      dropdownButtonRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      // 다음 옵션으로 포커스 이동
      const currentIndex = THEME_OPTIONS.findIndex(theme => theme.id === themeId);
      const nextIndex = currentIndex < THEME_OPTIONS.length - 1 ? currentIndex + 1 : 0;
      const nextOption = document.querySelector(`[data-theme-option="${THEME_OPTIONS[nextIndex].id}"]`) as HTMLElement;
      nextOption?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      // 이전 옵션으로 포커스 이동
      const currentIndex = THEME_OPTIONS.findIndex(theme => theme.id === themeId);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : THEME_OPTIONS.length - 1;
      const prevOption = document.querySelector(`[data-theme-option="${THEME_OPTIONS[prevIndex].id}"]`) as HTMLElement;
      prevOption?.focus();
    }
  };

  // 바깥쪽 클릭으로 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <Box className={styles.menuHeader}>
      {/* 테마 선택 영역 */}
      <Box className={styles.themeSection}>
        {!isCollapsed && (
          <div className={styles.customDropdown} ref={dropdownRef}>
            {/* 드롭다운 버튼 */}
            <div
              ref={dropdownButtonRef}
              className={styles.dropdownButton}
              onClick={toggleDropdown}
              onKeyDown={handleDropdownKeyDown}
              style={{
                color: currentTextColor,
                borderColor: currentTextColor
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
              aria-label="테마 선택"
            >
              <div className={styles.selectedTheme}>
                {selectedTheme && (
                  <>
                    <span className={styles.themeIcon}>{selectedTheme.icon}</span>
                    <span className={styles.themeName}>{selectedTheme.name}</span>
                  </>
                )}
              </div>
              <ExpandMore
                className={`${styles.expandIcon} ${isDropdownOpen ? styles.expanded : ''}`}
                style={{ color: currentTextColor }}
              />
            </div>

            {/* 드롭다운 옵션 */}
            {isDropdownOpen && (
              <div
                className={styles.dropdownOptions}
                style={{
                  backgroundColor: THEME_COLORS[currentTheme]?.menuBackground || '#f8fafc',
                  borderColor: currentTextColor
                }}
                role="listbox"
                aria-label="테마 옵션"
              >
                {THEME_OPTIONS.map((theme) => (
                  <div
                    key={theme.id}
                    className={`${styles.dropdownOption} ${theme.id === currentTheme ? styles.selected : ''}`}
                    onClick={() => handleThemeSelect(theme.id as ThemeType)}
                    onKeyDown={(e) => handleOptionKeyDown(e, theme.id as ThemeType)}
                    style={{
                      color: getTextColor(currentTheme),
                      backgroundColor: theme.id === currentTheme ? (THEME_COLORS[currentTheme]?.menuActive || '#3b82f6') : 'transparent'
                    }}
                    role="option"
                    tabIndex={0}
                    aria-selected={theme.id === currentTheme}
                    data-theme-option={theme.id}
                    aria-label={`${theme.name} 테마 선택`}
                  >
                    <span className={styles.themeIcon}>{theme.icon}</span>
                    <span className={styles.themeName}>{theme.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 사이드바 토글 버튼 */}
        <Tooltip title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'} placement="right">
          <IconButton
            onClick={toggleSidebar}
            className={styles.toggleButton}
            size="small"
            sx={{
              color: 'var(--theme-menu-text)',
              '&:hover': {
                backgroundColor: 'var(--theme-menu-hover)'
              }
            }}
            aria-label={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
            tabIndex={0}
          >
            {isCollapsed ? <Menu /> : <MenuOpen />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};