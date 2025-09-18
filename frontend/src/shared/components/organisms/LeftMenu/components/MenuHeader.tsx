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

  const getTextColor = (themeId: ThemeType) => {
    const themeColors = THEME_COLORS[themeId];
    return themeColors.menuText;
  };

  const currentTextColor = getTextColor(currentTheme);
  const selectedTheme = THEME_OPTIONS.find(theme => theme.id === currentTheme);

  const handleThemeSelect = (themeId: ThemeType) => {
    setTheme(themeId);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
              className={styles.dropdownButton}
              onClick={toggleDropdown}
              style={{
                color: currentTextColor,
                borderColor: currentTextColor
              }}
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
                  backgroundColor: THEME_COLORS[currentTheme].menuBackground,
                  borderColor: currentTextColor
                }}
              >
                {THEME_OPTIONS.map((theme) => (
                  <div
                    key={theme.id}
                    className={`${styles.dropdownOption} ${theme.id === currentTheme ? styles.selected : ''}`}
                    onClick={() => handleThemeSelect(theme.id as ThemeType)}
                    style={{
                      color: getTextColor(currentTheme),
                      backgroundColor: theme.id === currentTheme ? THEME_COLORS[currentTheme].menuActive : 'transparent'
                    }}
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
          >
            {isCollapsed ? <Menu /> : <MenuOpen />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};