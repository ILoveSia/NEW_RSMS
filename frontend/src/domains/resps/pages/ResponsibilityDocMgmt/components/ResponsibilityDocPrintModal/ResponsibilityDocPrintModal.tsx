/**
 * 책무기술서 PDF 출력 모달
 * - 원원별 책무기술서 양식으로 출력
 * - window.print() 사용한 브라우저 인쇄 기능
 */

import { Button } from '@/shared/components/atoms/Button';
import {
  Close as CloseIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton
} from '@mui/material';
import React, { useRef } from 'react';
import styles from './ResponsibilityDocPrintModal.module.scss';

/**
 * 책무기술서 출력 데이터 타입
 */
interface ResponsibilityDocPrintData {
  // 1. 원원 및 직책 정보
  positionName: string;
  employeeName: string;
  positionAssignedDate: string; // 현 직책 부여일
  isConcurrent: string; // 겸직여부 (Y/N)
  concurrentDetails: string; // 겸직사항
  responsibleDepts: string; // 소관부점

  // 2. 책무 정보
  responsibilityOverview: string; // 책무 개요
  responsibilityDistributionDate: string; // 책무 분배일자

  // 3. 주관회의체
  committees: Array<{
    committeeName: string;
    chairperson: string;
    frequency: string;
  }>;

  // 4. 책무 목록
  responsibilities: Array<{
    seq: number;
    responsibility: string;
    responsibilityDetail: string;
    relatedBasis: string;
  }>;

  // 5. 책무 이행을 위한 주요 관리의무
  managementDuties: Array<{
    seq: number;
    duty: string;
  }>;
}

interface ResponsibilityDocPrintModalProps {
  open: boolean;
  onClose: () => void;
  data: ResponsibilityDocPrintData;
}

const ResponsibilityDocPrintModal: React.FC<ResponsibilityDocPrintModalProps> = ({
  open,
  onClose,
  data
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  // 브라우저 인쇄 기능 사용
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'var(--theme-page-header-bg)',
          color: 'var(--theme-page-header-text)',
          fontSize: '1.25rem',
          fontWeight: 600
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>책무기술서 출력 미리보기</span>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{ color: 'var(--theme-page-header-text)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ p: 3 }}>
        {/* 인쇄될 영역 */}
        <div ref={componentRef} className={styles.printArea}>
          {/* 제목 */}
          <div className={styles.title}>임원별 책무기술서</div>

          {/* 1. 임원 및 직책 정보 - 섹션 제목 */}
          <div className={styles.sectionTitleStandalone}>1. 임원 및 직책 정보</div>

          {/* 1. 임원 및 직책 정보 테이블 */}
          <table className={styles.table}>
            <colgroup>
              <col width="14.00%" />
              <col width="26.00%" />
              <col width="18.00%" />
              <col width="10.00%" />
              <col width="30.00%" />
            </colgroup>
            <tbody>
              {/* 첫 번째 행: 직책, 성명, 홍길동 */}
              <tr>
                <th rowSpan={2}>직책</th>
                <td rowSpan={2}>{data.positionName || '감사본부장'}</td>
                <th rowSpan={2}>성명</th>
                <td rowSpan={2} colSpan={3}>{data.employeeName || '홍길동'}</td>
              </tr>
              <tr>
              </tr>

              {/* 두 번째 행: 직위, 현 직책 부여일 */}
              <tr>
                <th>직위</th>
                <td>전무</td>
                <th>현 직책 부여일</th>
                <td colSpan={2}>{data.positionAssignedDate || '2022-09-01'}</td>
              </tr>

              {/* 세 번째 행: 겸직여부, 겸직사항 */}
              <tr>
                <th>겸직여부</th>
                <td>{data.isConcurrent === 'Y' ? 'Y' : 'N'}</td>
                <th>겸직사항</th>
                <td colSpan={2}>{data.concurrentDetails || '경영전략본부장'}</td>
              </tr>

              {/* 네 번째 행: 소관부서 */}
              <tr>
                <th>소관부서</th>
                <td colSpan={4}>{data.responsibleDepts || '감사부, 준법지원부'}</td>
              </tr>

              {/* 다섯 번째 행: 주관회의체 헤더 */}
              <tr>
                <th rowSpan={data.committees.length + 1}>주관회의체</th>
                <th>회의체명</th>
                <th colSpan={1}>위원장/위원</th>
                <th>개최주기</th>
                <th>주요 안건·의결사항</th>
              </tr>

              {/* 주관회의체 데이터 행들 */}
              {data.committees.map((committee, index) => (
                <tr key={index}>
                  <td>{committee.committeeName || '보안감사 위원회'}</td>
                  <td colSpan={1}>{committee.chairperson || '감사본부장/경영전략본부장'}</td>
                  <td>{committee.frequency || '분기'}</td>
                  <td>{`보안관리 심의`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 주) 직무에 대한 책임과 권한 안내 */}
          <div className={styles.notes}>
            <p>주 1) 직무에 대한 책임과 권한에 대하여, 회장, 본부장, 부문장, 그룹장 등)</p>
            <p>   2) 직무에 따라 규정되는 사내 직위(예: 회장, 사장, 부사장, 부부장, 그룹장, 상무, 전무 등)</p>
            <p>   3) 다른 회사의 임무 또는 사내 다른 직책을 겸직하는 경우 표함</p>
            <p>   4) 다른 회사에 겸직하고 있는 경우 그 회사명(회장사등 여부) 및 임직, 겸직하고 있는 임무 및 직책, 겸직기간을 기재하고, 사내 다른 직책을 겸직하고 있는 경우 겸직하고 있는 임무 및 직책, 겸직기간을 기재</p>
            <p>   5) 임원이 위원장 또는 위원의 지위에서 심의·의결사항 없이 의견 수립 등 다른 협의 목적의 회의체 또는 심의·의결사항이 내부통제 또는 위험관리와 관련성이 없는 회의체는 제외)</p>
          </div>

          {/* 2. 책무 - 섹션 제목 */}
          <div className={styles.sectionTitleStandalone}>2. 책무</div>

          {/* 2-1. 책무 개요 및 배분일자 테이블 */}
          <table className={`${styles.table} ${styles.tableNoMargin}`}>
            <colgroup>
              <col width="70%" />
              <col width="30%" />
            </colgroup>
            <tbody>
              <tr>
                <th>책무 개요</th>
                <th>책무 배분일자</th>
              </tr>
              <tr>
                <td>{data.responsibilityOverview || '감사본부장 관련 책무'}</td>
                <td>{data.responsibilityDistributionDate || '2022-09-01'}</td>
              </tr>
            </tbody>
          </table>

          {/* 2-2. 책무내용 테이블 */}
          <table className={`${styles.table} ${styles.tableNoBorderTop}`}>
            <colgroup>
              <col width="33%" />
              <col width="33%" />
              <col width="34%" />
            </colgroup>
            <tbody>
              <tr>
                <th colSpan={3}>책무내용</th>
              </tr>
              <tr>
                <th>책무</th>
                <th>책무 세부내용</th>
                <th>관련 법령 및 내규</th>
              </tr>

              {/* 책무 데이터 */}
              {data.responsibilities.map((resp) => (
                <tr key={resp.seq}>
                  <td>{resp.responsibility || `준법감시 업무와 관련된 책무`}</td>
                  <td>{resp.responsibilityDetail || `준법감시 업무와 관련된 책무 세부내용 ${String(resp.seq).padStart(2, '0')}`}</td>
                  <td>{resp.relatedBasis || '금융회사의 준법감시 관련 법 제 00조'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 책무 주) 안내 */}
          <div className={styles.notes}>
            <p>주 1) 명 &lt;별표 1&gt; 제2조의 경우 고객, 금융상품, 판매채널, 담당지역 등의 구분기준에 따른 개요를 기재하고, 명 &lt;별표 1&gt; 제1·3조의 경우 책무의 내용을 요약하여 기재</p>
            <p>2) 임원의 직책 변경, 책무의 추가·변경 등에 따른 책무의 배분일자 기재</p>
            <p>3) 명 &lt;별표 1&gt;에 기재된 각 목의 책무를 참고하여 세부적명 세분화하여 기재(각 금융사별 조직, 업무특성, 업무분장 등을 고려하여 추가·변경, 수정 등 조정 가능)</p>
            <p>4) 소관책무와 관련하여 임원이 수행·운영하거나 관리·감독할 책무의 세부내용을 기재(관 제30조의2 및 제30조의4 등에서 규정하는 관리의무 등 책무을 수행하는 방법을 기재하는 것이 아니라, 동일 임무와 관련된 어 책무이 다른 임원과 분담되어 있는 등 재별 또는 한정된 책임을 부여하는 경우 그 재별 또는 한정된 책임을 기재</p>
            <p>5) 책무의 근거, 내용, 업무수행의 기준 중요 관련된 법령을 기재</p>
          </div>

          {/* 3. 책무 이행을 위한 주요 관리의무 - 섹션 제목 */}
          <div className={styles.sectionTitleStandalone}>3. 책무 이행을 위한 주요 관리의무</div>

          {/* 3. 책무 이행을 위한 주요 관리의무 테이블 */}
          <table className={styles.table}>
            <colgroup>
              <col width="100%" />
            </colgroup>
            <tbody>
              {data.managementDuties.map((duty) => (
                <tr key={duty.seq} className={styles.noBorderRow}>
                  <td>{`${duty.seq}. ${duty.duty}`}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 관리의무 주) 안내 */}
          <div className={styles.notes}>
            <p>주 1) 2. 책무와 관련하여 별 제30조의2 및 제30조의4 등에 따라 부담하는 주요 관리·준법의무를·이행 관리의무를 기재</p>
          </div>
        </div>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>
          닫기
        </Button>
        <Button
          variant="contained"
          onClick={handlePrint}
          startIcon={<PrintIcon />}
        >
          인쇄
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilityDocPrintModal;
