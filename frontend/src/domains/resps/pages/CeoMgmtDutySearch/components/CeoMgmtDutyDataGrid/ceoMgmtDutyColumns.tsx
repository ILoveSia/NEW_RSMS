/**
 * CEO 총괄관리의무조회 AG-Grid 컬럼 정의
 * PositionMgmt 표준 패턴을 기반으로 설계
 */

import { ColDef } from 'ag-grid-community';
import { CeoMgmtDuty } from '../../types/ceoMgmtDuty.types';

// 🎯 CEO 총괄관리의무 컬럼 정의
export const ceoMgmtDutyColumns: ColDef<CeoMgmtDuty>[] = [
  {
    headerName: '순번',
    field: 'seq',
    width: 80,
    headerCheckboxSelection: false,
    checkboxSelection: false,
    sortable: true,
    filter: false,
    cellStyle: { textAlign: 'center' },
    cellRenderer: (params) => {
      return params.node?.rowIndex !== undefined ? params.node.rowIndex + 1 : '';
    }
  },
  {
    headerName: '대표이사총괄관리의무',
    field: 'executiveManagementDuty',
    flex: 2,
    minWidth: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    filterParams: {
      debounceMs: 0,
      suppressAndOrCondition: true,
    },
    cellRenderer: (params) => {
      const duty = params.data as CeoMgmtDuty;
      if (!duty?.executiveManagementDuty) return '';

      return `
        <div style="padding: 4px 0; line-height: 1.4;">
          <div style="font-weight: 500; color: #1976d2; cursor: pointer;">
            ${duty.executiveManagementDuty}
          </div>
        </div>
      `;
    },
    onCellDoubleClicked: (params) => {
      // 더블클릭 시 상세 조회
      console.log('Double clicked duty:', params.data);
    }
  },
  {
    headerName: '임원',
    field: 'executives',
    flex: 1.5,
    minWidth: 180,
    sortable: false,
    filter: false,
    cellRenderer: (params) => {
      const duty = params.data as CeoMgmtDuty;
      if (!duty?.executives || duty.executives.length === 0) return '';

      return `
        <div style="padding: 4px 0;">
          ${duty.executives.map(executive => `
            <div style="margin: 2px 0; padding: 2px 6px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">
              ${executive}
            </div>
          `).join('')}
        </div>
      `;
    }
  },
  {
    headerName: '부서',
    field: 'departments',
    flex: 1.5,
    minWidth: 150,
    sortable: false,
    filter: false,
    cellRenderer: (params) => {
      const duty = params.data as CeoMgmtDuty;
      if (!duty?.departments || duty.departments.length === 0) return '';

      return `
        <div style="padding: 4px 0;">
          ${duty.departments.map(department => `
            <div style="margin: 2px 0; padding: 2px 6px; background: #e3f2fd; border-radius: 4px; font-size: 12px; color: #1976d2;">
              ${department}
            </div>
          `).join('')}
        </div>
      `;
    }
  },
  {
    headerName: '관리활동명',
    field: 'managementActivities',
    flex: 2,
    minWidth: 200,
    sortable: false,
    filter: false,
    cellRenderer: (params) => {
      const duty = params.data as CeoMgmtDuty;
      if (!duty?.managementActivities || duty.managementActivities.length === 0) return '';

      return `
        <div style="padding: 4px 0;">
          ${duty.managementActivities.map(activity => `
            <div style="margin: 2px 0; padding: 2px 6px; background: #fff3e0; border-radius: 4px; font-size: 12px; color: #ef6c00;">
              ${activity}
            </div>
          `).join('')}
        </div>
      `;
    }
  },
  {
    headerName: '관리의무',
    field: 'managementDuties',
    flex: 2,
    minWidth: 200,
    sortable: false,
    filter: false,
    cellRenderer: (params) => {
      const duty = params.data as CeoMgmtDuty;
      if (!duty?.managementDuties || duty.managementDuties.length === 0) return '';

      return `
        <div style="padding: 4px 0;">
          ${duty.managementDuties.map(mgmtDuty => `
            <div style="margin: 2px 0; padding: 2px 6px; background: #f3e5f5; border-radius: 4px; font-size: 12px; color: #7b1fa2;">
              ${mgmtDuty}
            </div>
          `).join('')}
        </div>
      `;
    }
  }
];

// 🎯 CEO 관리활동 상세 테이블 컬럼 정의 (상세 모달용)
export const ceoManagementActivityColumns: ColDef[] = [
  {
    headerName: '선택',
    field: 'selected',
    width: 60,
    headerCheckboxSelection: true,
    checkboxSelection: true,
    cellStyle: { textAlign: 'center' },
    sortable: false,
    filter: false,
    suppressMovable: true
  },
  {
    headerName: '상태',
    field: 'status',
    width: 80,
    sortable: true,
    filter: false,
    cellStyle: { textAlign: 'center' },
    cellRenderer: (params) => {
      const status = params.value;
      const statusIcon = params.data?.statusIcon || '📄';

      let statusClass = '';
      let statusText = '';

      switch (status) {
        case 'active':
          statusClass = 'status-active';
          statusText = '활성';
          break;
        case 'inactive':
          statusClass = 'status-inactive';
          statusText = '비활성';
          break;
        case 'pending':
          statusClass = 'status-pending';
          statusText = '대기';
          break;
        default:
          statusClass = 'status-unknown';
          statusText = '알 수 없음';
      }

      return `
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span style="font-size: 16px;">${statusIcon}</span>
          <span class="${statusClass}" style="font-size: 11px; color: #666;">${statusText}</span>
        </div>
      `;
    }
  },
  {
    headerName: '임원',
    field: 'executive',
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) => {
      const executive = params.value;
      if (!executive) return '';

      return `
        <div style="padding: 4px 0;">
          <div style="font-weight: 500; color: #333;">
            ${executive}
          </div>
        </div>
      `;
    }
  },
  {
    headerName: '부서',
    field: 'department',
    flex: 1,
    minWidth: 120,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) => {
      const department = params.value;
      if (!department) return '';

      return `
        <div style="padding: 4px 0;">
          <div style="padding: 2px 8px; background: #e3f2fd; border-radius: 4px; color: #1976d2; font-size: 12px; display: inline-block;">
            ${department}
          </div>
        </div>
      `;
    }
  },
  {
    headerName: '관리활동명',
    field: 'activityName',
    flex: 2,
    minWidth: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) => {
      const activityName = params.value;
      if (!activityName) return '';

      return `
        <div style="padding: 4px 0; line-height: 1.4;">
          <div style="font-weight: 500; color: #1976d2;">
            ${activityName}
          </div>
        </div>
      `;
    }
  },
  {
    headerName: '관리활동 상세내용',
    field: 'activityDetail',
    flex: 2.5,
    minWidth: 250,
    sortable: false,
    filter: 'agTextColumnFilter',
    cellRenderer: (params) => {
      const activityDetail = params.value;
      if (!activityDetail) return '';

      // 긴 텍스트는 말줄임표 처리
      const maxLength = 100;
      const displayText = activityDetail.length > maxLength
        ? activityDetail.substring(0, maxLength) + '...'
        : activityDetail;

      return `
        <div style="padding: 4px 0; line-height: 1.4;">
          <div style="color: #666; font-size: 13px;" title="${activityDetail}">
            ${displayText}
          </div>
        </div>
      `;
    }
  }
];

// 🎯 AG-Grid 기본 설정
export const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  cellStyle: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1.4'
  },
  headerComponentParams: {
    menuIcon: 'fa-bars'
  }
};

// 🎯 그리드 옵션
export const gridOptions = {
  defaultColDef,
  rowHeight: 80, // 여러 줄 데이터를 위한 높은 행 높이
  headerHeight: 50,
  rowSelection: 'multiple' as const,
  suppressRowClickSelection: false,
  suppressCellSelection: true,
  enableRangeSelection: false,
  animateRows: true,
  enableCellTextSelection: false,
  ensureDomOrder: true,
  suppressHorizontalScroll: false,
  suppressColumnVirtualisation: false,
  suppressRowVirtualisation: false,
  pagination: true,
  paginationPageSize: 25,
  cacheBlockSize: 50,
  // 성능 최적화 설정
  suppressPropertyNamesCheck: true,
  suppressChangeDetection: false,
  enableCellChangeFlash: false,
  suppressAnimationFrame: false,
  debounceVerticalScrollbar: true,
  suppressScrollOnNewData: true,
  // 다국어 지원
  localeText: {
    // 페이지네이션
    page: '페이지',
    to: '~',
    of: '/',
    nextPage: '다음 페이지',
    lastPage: '마지막 페이지',
    firstPage: '첫 페이지',
    previousPage: '이전 페이지',
    // 필터
    filterOoo: '필터...',
    equals: '같음',
    notEqual: '같지 않음',
    contains: '포함',
    notContains: '포함하지 않음',
    startsWith: '시작',
    endsWith: '끝',
    // 기타
    noRowsToShow: '표시할 데이터가 없습니다',
    loadingOoo: '로딩 중...'
  }
};