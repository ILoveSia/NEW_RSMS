/**
 * 책무기술서 등록/상세 모달
 * PositionFormModal 표준 템플릿 기반
 *
 * 주요 기능:
 * 1. 직책 선택 시 관련 정보 자동 설정 (겸직여부, 현직책부여일, 겸직사항, 소관부서, 주관회의체)
 * 2. 임원 및 직책 정보 입력
 * 3. 책무정보 입력 (책무개요, 책무분배일자)
 * 4. 책무목록 및 관리의무 동적 추가/삭제
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';
import { PositionLookupModal } from '@/shared/components/organisms/PositionLookupModal';
import { EmployeeLookupModal, type Employee } from '@/shared/components/organisms/EmployeeLookupModal';
import { Position } from '@/shared/types/position';
import type { ColDef } from 'ag-grid-community';
import type {
  ResponsibilityDoc,
  ResponsibilityDocFormData
} from '../../types/responsibilityDoc.types';
import {
  getPositionResponsibilityData,
  type PositionResponsibilityData
} from '@/domains/resps/api/responsibilityDocApi';
import { getAllManagementObligations } from '@/domains/resps/api/managementObligationApi';
import type { ManagementObligationDto } from '@/domains/resps/types/managementObligation.types';
import toast from '@/shared/utils/toast';
import LedgerOrderComboBox from '@/domains/resps/components/molecules/LedgerOrderComboBox/LedgerOrderComboBox';
import { useCommonCode } from '@/shared/hooks/useCommonCode';
import { useOrganization } from '@/shared/hooks/useOrganization';
import ResponsibilityDocPrintModal from '../ResponsibilityDocPrintModal/ResponsibilityDocPrintModal';

// 직책 선택 모달용 타입
interface PositionSelectData {
  positionId: number;
  positionName: string;
  hqName: string; // 본부명
  isConcurrent: string; // 겸직여부 (Y/N)
  employeeName: string;
  currentPositionDate: string;
  dualPositionDetails: string;
  responsibleDepts: string;
  mainCommittees: CommitteeData[];
}

// 회의체 데이터 타입
interface CommitteeData {
  id: string;
  committeeName: string;
  chairperson: string;
  frequency: string;
  mainAgenda: string;
}

// 책무 데이터 타입
interface ResponsibilityItemData {
  id: string;
  seq: number;
  responsibility: string;
  responsibilityDetail: string;
  relatedBasis: string;
}

// 관리의무 데이터 타입
interface ManagementDutyData {
  id: string;
  seq: number;
  duty: string;
  responsibilityDetailInfo?: string; // 책무세부내용
  responsibilityDetailCd?: string; // 책무세부코드
  obligationCd?: string; // 관리의무코드
}

// 유효성 검사 스키마
const validationSchema = yup.object({
  positionName: yup.string().required('직책을 선택해주세요'),
  employeeName: yup.string(),
  isDual: yup.boolean().required(),
  currentPositionDate: yup.string(),
  dualPositionDetails: yup.string(),
  responsibleDepts: yup.string(),
  responsibilityOverview: yup.string().required('책무개요를 입력해주세요'),
  responsibilityDistributionDate: yup.string().required('책무 분배일자를 선택해주세요')
});

interface ResponsibilityDocFormModalProps {
  open: boolean;
  mode: 'create' | 'detail';
  doc?: ResponsibilityDoc | null;
  onClose: () => void;
  onSave: (data: ResponsibilityDocFormData) => Promise<void>;
  onUpdate: (id: string, data: ResponsibilityDocFormData) => Promise<void>;
  loading?: boolean;
}

const ResponsibilityDocFormModal: React.FC<ResponsibilityDocFormModalProps> = ({
  open,
  onClose,
  mode,
  doc,
  onSave,
  onUpdate,
  loading = false
}) => {

  // 공통코드 Hook
  const holdingPeriodCode = useCommonCode('CFRN_CYCL_DVCD'); // 개최주기
  const responsibilityCode = useCommonCode('RSBT_OBLG_CD'); // 책무

  // 조직 Hook
  const { getOrgName } = useOrganization();

  // 원장차수 선택 상태
  const [selectedLedgerOrderId, setSelectedLedgerOrderId] = useState<string | null>(null);

  // 선택된 직책 정보 저장 (API 호출용)
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  // 선택된 직원 정보 저장 (API 호출용)
  const [selectedEmployeeNo, setSelectedEmployeeNo] = useState<string | null>(null);

  // 직책 선택 모달 상태
  const [positionSelectOpen, setPositionSelectOpen] = useState(false);

  // 직원 조회 모달 상태
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false);

  // 회의체, 책무, 관리의무 상태 관리
  const [committees, setCommittees] = useState<CommitteeData[]>([]);
  const [responsibilities, setResponsibilities] = useState<ResponsibilityItemData[]>([
    { id: '1', seq: 1, responsibility: '', responsibilityDetail: '', relatedBasis: '' }
  ]);
  const [managementDuties, setManagementDuties] = useState<ManagementDutyData[]>([
    {
      id: '1',
      seq: 1,
      duty: '',
      responsibilityDetailInfo: '',
      responsibilityDetailCd: '',
      obligationCd: ''
    }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // 읽기 전용 모드 계산 (컬럼 정의보다 먼저 선언)
  const isReadOnly = mode === 'detail' && !isEditing;

  // React Hook Form 초기화
  const { control, handleSubmit, reset, setValue, getValues } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      positionName: '',
      employeeName: '',
      isDual: false,
      currentPositionDate: '',
      dualPositionDetails: '',
      responsibleDepts: '',
      responsibilityOverview: '',
      responsibilityDistributionDate: ''
    }
  });

  // 모드 변경 시 초기화
  useEffect(() => {
    if (mode === 'create') {
      setIsEditing(true);
      setCommittees([]);
      setResponsibilities([
        { id: '1', seq: 1, responsibility: '', responsibilityDetail: '', relatedBasis: '' }
      ]);
      setManagementDuties([
        {
          id: '1',
          seq: 1,
          duty: '',
          responsibilityDetailInfo: '',
          responsibilityDetailCd: '',
          obligationCd: ''
        }
      ]);
      reset();
    } else {
      setIsEditing(false);
    }
  }, [mode, open, reset]);

  // 📋 상세조회 모드일 때 doc 데이터를 폼에 로드
  useEffect(() => {
    const loadDetailData = async () => {
      if (open && mode === 'detail' && doc && doc.id) {
        try {
          console.log('📋 상세조회 API 호출 시작 - doc.id:', doc.id);

          // 백엔드 상세조회 API 호출
          const { getResponsibilityDocById, getPositionResponsibilityData } = await import('@/domains/resps/api/responsibilityDocApi');

          // 1. 기본 정보 조회 (책무기술서 ID로)
          const basicData = await getResponsibilityDocById(doc.id);
          console.log('📋 기본 데이터 로드 성공:', basicData);

          // 기본 정보 설정
          setValue('positionName', basicData.positionName || '');

          // 📋 책무개요 설정
          if (basicData.responsibilityOverview) {
            setValue('responsibilityOverview', basicData.responsibilityOverview);
            console.log('📋 책무개요 설정:', basicData.responsibilityOverview);
          }

          // 📋 책무 분배일자 설정
          if (basicData.responsibilityBackgroundDate) {
            setValue('responsibilityDistributionDate', basicData.responsibilityBackgroundDate);
            console.log('📋 책무 분배일자 설정:', basicData.responsibilityBackgroundDate);
          }

          // 📋 주관회의체 목록 설정
          if (basicData.mainCommittees && basicData.mainCommittees.length > 0) {
            const committeeData = basicData.mainCommittees.map((committee) => ({
              id: committee.id,
              committeeName: committee.committeeName,
              chairperson: committee.chairperson === 'chairman' ? '위원장' : '위원',  // 'chairman' → '위원장', 'member' → '위원'
              frequency: committee.frequency,
              mainAgenda: committee.mainAgenda
            }));
            setCommittees(committeeData);
            console.log('📋 주관회의체 데이터 설정:', committeeData);
          }

          // 2. 상세 데이터 조회 (직책 ID로)
          if (basicData.positionId) {
            const detailData = await getPositionResponsibilityData(basicData.positionId);
            console.log('📋 상세 데이터 로드 성공:', detailData);

            // 겸직여부 (Y/N → boolean 변환)
            setValue('isDual', detailData.isConcurrent === 'Y');

            // 현 직책 부여일
            setValue('currentPositionDate', detailData.positionAssignedDate || '');

            // 겸직사항
            setValue('dualPositionDetails', detailData.concurrentPosition || '');

            // 직원명
            setValue('employeeName', detailData.employeeName || '');

            // 소관부서
            setValue('responsibleDepts', detailData.departments || '');

            // 책무 데이터 변환 및 설정
            if (detailData.responsibilities && detailData.responsibilities.length > 0) {
              const responsibilityData = detailData.responsibilities.map((resp, index) => ({
                id: resp.responsibilityCd,
                seq: index + 1,
                responsibility: resp.responsibilityInfo,
                responsibilityDetail: resp.responsibilityDetailInfo || '',
                relatedBasis: resp.responsibilityLegal
              }));
              setResponsibilities(responsibilityData);
              console.log('📋 책무 데이터 설정:', responsibilityData);
            }

            // 관리의무 데이터 변환 및 설정
            if (detailData.managementObligations && detailData.managementObligations.length > 0) {
              const obligationData = detailData.managementObligations.map((obligation, index) => ({
                id: obligation.obligationCd,
                seq: index + 1,
                duty: obligation.obligationInfo
              }));
              setManagementDuties(obligationData);
              console.log('📋 관리의무 데이터 설정:', obligationData);
            }

            toast.success('상세 데이터를 불러왔습니다.');
          }

        } catch (error) {
          console.error('📋 상세 데이터 로드 실패:', error);
          toast.error('상세 데이터를 불러오는데 실패했습니다.');
        }
      }
    };

    loadDetailData();
  }, [open, mode, doc, setValue]);

  // 직책 선택 핸들러 - 직책 검색 모달 열기
  const handlePositionSelect = useCallback(() => {
    // 직책 선택 모달 열기
    setPositionSelectOpen(true);
  }, []);

  // 직책 선택 확인 핸들러 (실제 API 호출하여 7개 필드 자동 설정)
  const handlePositionConfirm = useCallback(async (position: PositionSelectData) => {
    try {
      // 백엔드 API 호출하여 직책 관련 데이터 조회
      const data = await getPositionResponsibilityData(position.positionId);

      // 1. 겸직여부 (Y/N → boolean 변환)
      setValue('isDual', data.isConcurrent === 'Y');

      // 2. 현 직책 부여일
      setValue('currentPositionDate', data.positionAssignedDate || '');

      // 3. 겸직사항
      setValue('dualPositionDetails', data.concurrentPosition || '');

      // 4. 소관부서 (comma-separated string)
      setValue('responsibleDepts', data.departments);

      // 5. 주관회의체 (Grid 데이터 변환 - CommitteeData 타입에 맞게)
      const committeeData = data.committees.map((committee, index) => ({
        id: String(committee.committeesId),
        committeeName: committee.committeesTitle,
        chairperson: committee.committeesType === 'chairman' ? '위원장' : '위원',  // 'chairman' → '위원장', 'member' → '위원'
        frequency: committee.committeeFrequency,
        mainAgenda: committee.resolutionMatters
      }));
      setCommittees(committeeData);

      // 6. 책무목록 (Grid 데이터 변환 - ResponsibilityItemData 타입에 맞게)
      const responsibilityData = data.responsibilities.map((resp, index) => ({
        id: resp.responsibilityCd,
        seq: index + 1,
        responsibility: resp.responsibilityInfo, // 책무내용 표시
        responsibilityDetail: resp.responsibilityDetailInfo || '', // responsibility_details 테이블의 responsibility_detail_info
        relatedBasis: resp.responsibilityLegal
      }));
      setResponsibilities(responsibilityData);

      // 7. 관리의무 (Grid 데이터 변환 - ManagementDutyData 타입에 맞게)
      const managementDutyData = data.managementObligations.map((obligation, index) => ({
        id: obligation.obligationCd,
        seq: index + 1,
        duty: `[${obligation.obligationMajorCatCd}] ${obligation.obligationInfo} (${obligation.orgCode})`
      }));
      setManagementDuties(managementDutyData);

      // 직책명과 성명도 설정
      setValue('positionName', position.positionName);

      // API 응답에서 employeeName과 employeeNo를 사용 (있는 경우)
      if (data.employeeName) {
        setValue('employeeName', data.employeeName);
      } else if (position.employeeName) {
        setValue('employeeName', position.employeeName);
      }

      // employeeNo도 설정 (중요!)
      if (data.employeeNo) {
        setSelectedEmployeeNo(data.employeeNo);
        console.log('직책 선택 시 employeeNo 자동 설정:', data.employeeNo);
      }

      setPositionSelectOpen(false);
    } catch (error) {
      console.error('[ResponsibilityDocFormModal] 직책 데이터 조회 실패:', error);
      toast.error('직책 데이터를 불러오는데 실패했습니다.');
    }
  }, [setValue, setCommittees, setResponsibilities, setManagementDuties]);

  // 공통 직책 선택 다이얼로그에서 직책 선택 시 호출되는 핸들러
  const handlePositionSelectFromDialog = useCallback((position: Position) => {
    // 선택된 직책 정보 저장 (API 호출용)
    setSelectedPositionId(position.positionId);
    if (position.ledgerOrderId) {
      setSelectedLedgerOrderId(position.ledgerOrderId);
    }

    // Position 타입을 PositionSelectData 타입으로 변환하여 기존 로직 재사용
    const positionData: PositionSelectData = {
      positionId: position.positionId,
      positionName: position.positionName,
      hqName: position.hqName || '',
      isConcurrent: position.isConcurrent || 'N',
      employeeName: '',
      currentPositionDate: '',
      dualPositionDetails: '',
      responsibleDepts: '',
      mainCommittees: []
    };
    handlePositionConfirm(positionData);
  }, [handlePositionConfirm]);

  // 직원 조회 모달 열기
  const handleEmployeeSelect = useCallback(() => {
    setEmployeeSelectOpen(true);
  }, []);

  // 직원 선택 시 성명 및 직원번호 설정
  const handleEmployeeSelectFromDialog = useCallback((employee: Employee) => {
    console.log('선택된 직원 정보:', employee);
    console.log('직원번호(employeeId):', employee.employeeId);
    setValue('employeeName', employee.name);
    setSelectedEmployeeNo(employee.employeeId); // employeeId가 사번(emp_no)
    setEmployeeSelectOpen(false);
  }, [setValue]);

  // 회의체 그리드 컬럼
  const committeeColumns = useMemo<ColDef<CommitteeData>[]>(() => [
    { field: 'committeeName', headerName: '회의체명', flex: 1 },
    { field: 'chairperson', headerName: '위원장', width: 120 },
    {
      field: 'frequency',
      headerName: '개최주기',
      width: 150,
      valueFormatter: (params) => {
        // frequency는 공통코드 detailCode이므로 코드명으로 변환
        return params.value ? holdingPeriodCode.getCodeName(params.value) : '';
      }
    },
    { field: 'mainAgenda', headerName: '주요안건의결사항', flex: 1 }
  ], [holdingPeriodCode]);

  // 책무 그리드 컬럼 (삭제 컬럼 제거)
  const responsibilityColumns = useMemo<ColDef<ResponsibilityItemData>[]>(() => [
    {
      field: 'seq',
      headerName: '순번',
      width: 80,
      sort: 'asc', // 초기 오름차순 정렬 설정
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'responsibility',
      headerName: '책무',
      width: 300,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      wrapText: true, // 텍스트 줄바꿈
      cellStyle: { lineHeight: '1.5', whiteSpace: 'normal' }
      // responsibilityInfo는 이미 책무내용 텍스트이므로 valueFormatter 불필요
    },
    {
      field: 'responsibilityDetail',
      headerName: '책무세부내용',
      width: 300,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      wrapText: true, // 텍스트 줄바꿈
      cellStyle: { lineHeight: '1.5', whiteSpace: 'normal' }
      // responsibility_details 테이블의 responsibility_detail_info 표시
    },
    {
      field: 'relatedBasis',
      headerName: '관련근거',
      width: 300,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      wrapText: true, // 텍스트 줄바꿈
      cellStyle: { lineHeight: '1.5', whiteSpace: 'normal' }
    }
  ], [isReadOnly]);

  // 관리의무 그리드 컬럼 (삭제 컬럼 제거)
  const managementDutyColumns = useMemo<ColDef<ManagementDutyData>[]>(() => [
    {
      field: 'seq',
      headerName: '순번',
      width: 60,
      sort: 'asc', // 초기 오름차순 정렬 설정
      cellStyle: { textAlign: 'center' }
    },
    {
      field: 'duty',
      headerName: '관리의무',
      width: 400,
      editable: !isReadOnly,
      cellEditor: 'agLargeTextCellEditor',
      cellEditorPopup: true,
      wrapText: true, // 텍스트 줄바꿈
      cellStyle: { lineHeight: '1.5', whiteSpace: 'normal' },
      valueFormatter: (params) => {
        // 관리의무 데이터에서 조직코드를 부서명으로 변환
        // 형식: "[대분류] 의무내용 (조직코드)" -> 조직코드를 부서명으로 변환
        if (!params.value) return '';
        const match = params.value.match(/^(\[.*?\]\s*.+?)\s*\(([^)]+)\)$/);
        if (match) {
          const [, dutyInfo, orgCode] = match;
          const orgName = getOrgName(orgCode) || orgCode;
          return `${dutyInfo} (${orgName})`;
        }
        return params.value;
      }
    }
  ], [isReadOnly, getOrgName]);

  // 책무 추가/삭제 핸들러
  const addResponsibility = useCallback(() => {
    const newSeq = responsibilities.length + 1;
    const newResponsibility: ResponsibilityItemData = {
      id: String(Date.now()),
      seq: newSeq,
      responsibility: '',
      responsibilityDetail: '',
      relatedBasis: ''
    };
    setResponsibilities([...responsibilities, newResponsibility]);
  }, [responsibilities]);

  const removeResponsibility = useCallback((id: string) => {
    if (responsibilities.length > 1) {
      const filtered = responsibilities.filter((item) => item.id !== id);
      // 순번 재정렬
      const reordered = filtered.map((item, index) => ({
        ...item,
        seq: index + 1
      }));
      setResponsibilities(reordered);
    }
  }, [responsibilities]);

  // 관리의무 추가/삭제 핸들러
  const addManagementDuty = useCallback(() => {
    const newSeq = managementDuties.length + 1;
    const newDuty: ManagementDutyData = {
      id: String(Date.now()),
      seq: newSeq,
      duty: ''
    };
    setManagementDuties([...managementDuties, newDuty]);
  }, [managementDuties]);

  const removeManagementDuty = useCallback((id: string) => {
    if (managementDuties.length > 1) {
      const filtered = managementDuties.filter((item) => item.id !== id);
      // 순번 재정렬
      const reordered = filtered.map((item, index) => ({
        ...item,
        seq: index + 1
      }));
      setManagementDuties(reordered);
    }
  }, [managementDuties]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    if (mode === 'detail') {
      setIsEditing(false);
      reset();
    } else {
      onClose();
    }
  }, [mode, onClose, reset]);

  /**
   * 인쇄 미리보기 실행
   * - 실제 관리의무 데이터를 백엔드에서 조회하여 표시
   */
  const handlePrintPreview = useCallback(async () => {
    try {
      // 백엔드에서 전체 관리의무 조회
      const allObligations: ManagementObligationDto[] = await getAllManagementObligations();

      // ManagementDutyData 형식으로 변환
      const obligationsData: ManagementDutyData[] = allObligations.map((obligation, index) => ({
        id: obligation.obligationCd,
        seq: index + 1,
        duty: obligation.obligationInfo,
        responsibilityDetailInfo: obligation.responsibilityDetailInfo || '',
        responsibilityDetailCd: obligation.responsibilityDetailCd,
        obligationCd: obligation.obligationCd
      }));

      // managementDuties 상태 업데이트
      setManagementDuties(obligationsData);

      // 모달 열기
      setPrintModalOpen(true);
    } catch (error) {
      console.error('관리의무 데이터 조회 실패:', error);
      toast.error('관리의무 데이터를 불러오는데 실패했습니다.');
    }
  }, []);

  // 출력 데이터 생성 - 폼의 현재 값 사용
  const getPrintData = useCallback(() => {
    const formValues = getValues();
    return {
      positionName: formValues.positionName || '',
      employeeName: formValues.employeeName || '',
      positionAssignedDate: formValues.currentPositionDate || '',
      isConcurrent: formValues.isDual ? 'Y' : 'N',
      concurrentDetails: formValues.dualPositionDetails || '',
      responsibleDepts: formValues.responsibleDepts || '',
      responsibilityOverview: formValues.responsibilityOverview || '',
      responsibilityDistributionDate: formValues.responsibilityDistributionDate || '',
      committees: committees.map(c => ({
        committeeName: c.committeeName,
        chairperson: c.chairperson,
        frequency: holdingPeriodCode.getCodeName(c.frequency) || c.frequency,
        resolutionMatters: c.mainAgenda // 주요 안건·의결사항
      })),
      responsibilities: responsibilities.map(r => ({
        seq: r.seq,
        responsibility: r.responsibility,
        responsibilityDetail: r.responsibilityDetail,
        relatedBasis: r.relatedBasis
      })),
      managementDuties: managementDuties.map(m => ({
        seq: m.seq,
        duty: m.duty,
        responsibilityDetailInfo: m.responsibilityDetailInfo,
        responsibilityDetailCd: m.responsibilityDetailCd,
        obligationCd: m.obligationCd
      }))
    };
  }, [getValues, committees, responsibilities, managementDuties, holdingPeriodCode]);

  const onSubmit = useCallback(async (data: any) => {
    try {
      // 필수 값 검증
      if (!selectedLedgerOrderId) {
        toast.error('원장차수를 선택해주세요.');
        return;
      }
      if (!selectedPositionId) {
        toast.error('직책을 선택해주세요.');
        return;
      }

      console.log('=== 폼 제출 시 직원 정보 확인 ===');
      console.log('selectedEmployeeNo:', selectedEmployeeNo);

      // userId 가져오기 (우선순위: sessionStorage > localStorage > 기본값 'admin')
      const userId = sessionStorage.getItem('userId')
                  || sessionStorage.getItem('username')
                  || localStorage.getItem('userId')
                  || localStorage.getItem('username')
                  || 'admin'; // 임시 기본값

      console.log('userId:', userId);

      const formData: ResponsibilityDocFormData = {
        ledgerOrderId: selectedLedgerOrderId,
        positionId: selectedPositionId,
        arbitraryPosition: {
          positionName: data.positionName,
          positionTitle: data.positionName, // 임시
          isDual: data.isDual,
          employeeName: data.employeeName,
          employeeNo: selectedEmployeeNo || undefined,
          userId: userId, // 로그인한 사용자 ID (필수)
          currentPositionDate: data.currentPositionDate,
          dualPositionDetails: data.dualPositionDetails,
          responsibleDepts: data.responsibleDepts
        },
        mainCommittees: committees.map(c => ({
          id: c.id,
          committeeName: c.committeeName,
          chairperson: c.chairperson,
          frequency: c.frequency,
          mainAgenda: c.mainAgenda
        })),
        responsibilityOverview: data.responsibilityOverview,
        responsibilityBackground: data.responsibilityBackground || '',
        responsibilityBackgroundDate: data.responsibilityDistributionDate,
        responsibilities: responsibilities.map(r => ({
          id: r.id,
          seq: r.seq,
          responsibility: r.responsibility,
          responsibilityDetail: r.responsibilityDetail,
          relatedBasis: r.relatedBasis
        })),
        managementDuties: managementDuties.map(m => ({
          id: m.id,
          seq: m.seq,
          managementDuty: m.duty,
          managementDutyDetail: '', // 임시
          relatedBasis: '' // 임시
        }))
      };

      if (mode === 'create') {
        await onSave(formData);
        toast.success('책무기술서가 성공적으로 등록되었습니다.');
      } else if (doc?.id) {
        await onUpdate(doc.id, formData);
        toast.success('책무기술서가 성공적으로 수정되었습니다.');
      }
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error(error instanceof Error ? error.message : '저장에 실패했습니다.');
    }
  }, [mode, doc, onClose, onSave, onUpdate, committees, responsibilities, managementDuties, selectedLedgerOrderId, selectedPositionId]);

  const title = mode === 'create' ? '책무기술서 등록' : '책무기술서 상세';

  return (
    <>
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
        aria-labelledby="responsibility-doc-modal-title"
      >
        <DialogTitle
          id="responsibility-doc-modal-title"
          sx={{
            background: 'var(--theme-page-header-bg)',
            color: 'var(--theme-page-header-text)',
            fontSize: '1.25rem',
            fontWeight: 600
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="span" fontWeight={600} sx={{ fontSize: '1.25rem' }}>
              {title}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={onClose}
              size="small"
              disabled={loading}
              sx={{ color: 'var(--theme-page-header-text)' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* 책무이행차수 선택 섹션 */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  책무이행차수
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <LedgerOrderComboBox
                  value={selectedLedgerOrderId}
                  onChange={setSelectedLedgerOrderId}
                  label="책무이행차수"
                  required
                  disabled={isReadOnly || mode === 'detail'}
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>

            {/* 임원 및 직책 정보 섹션 */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  임원 및 직책 정보
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {/* 첫 번째 행: 직책, 성명 */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="positionName"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="직책 *"
                          required
                          fullWidth
                          size="small"
                          disabled={isReadOnly || mode === 'detail'}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          InputProps={{
                            endAdornment: mode === 'create' && (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handlePositionSelect}
                                  edge="end"
                                  size="small"
                                >
                                  <SearchIcon />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name="employeeName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="성명"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          InputProps={{
                            endAdornment: !isReadOnly && (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleEmployeeSelect}
                                  edge="end"
                                  size="small"
                                >
                                  <SearchIcon />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* 두 번째 행: 현 직책 부여일, 겸직여부 (위치 변경) */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="currentPositionDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="현 직책 부여일"
                          type="date"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '40px' }}>
                      <FormLabel component="legend" sx={{ mr: 2, minWidth: '80px' }}>겸직여부 *</FormLabel>
                      <Controller
                        name="isDual"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            {...field}
                            value={field.value ? 'Y' : 'N'}
                            onChange={(e) => field.onChange(e.target.value === 'Y')}
                            row
                          >
                            <FormControlLabel value="Y" control={<Radio size="small" />} label="Y" disabled={isReadOnly} />
                            <FormControlLabel value="N" control={<Radio size="small" />} label="N" disabled={isReadOnly} />
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* 세 번째 행: 소관부서 */}
                  <Grid item xs={12}>
                    <Controller
                      name="responsibleDepts"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="소관부서"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </Grid>

                  {/* 네 번째 행: 겸직사항 */}
                  <Grid item xs={12}>
                    <Controller
                      name="dualPositionDetails"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="겸직사항"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          multiline
                          rows={2}
                        />
                      )}
                    />
                  </Grid>

                  {/* 다섯 번째 행: 주관회의체 Grid */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      주관회의체
                    </Typography>
                    <Box sx={{ height: '200px' }}>
                      <BaseDataGrid
                        data={committees}
                        columns={committeeColumns}
                        rowSelection="none"
                        pagination={false}
                        height="200px"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* 책무정보 섹션 */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  책무정보
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Controller
                      name="responsibilityOverview"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="책무개요 *"
                          multiline
                          rows={4}
                          fullWidth
                          disabled={isReadOnly}
                          size="small"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="responsibilityDistributionDate"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          label="책무 분배일자 *"
                          type="date"
                          fullWidth
                          size="small"
                          disabled={isReadOnly}
                          InputLabelProps={{ shrink: true }}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* 책무목록 Grid (추가 버튼 제거) */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  책무목록
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ height: '300px' }}>
                  <BaseDataGrid
                    data={responsibilities}
                    columns={responsibilityColumns}
                    rowSelection="none"
                    pagination={false}
                    height="300px"
                    rowHeight={42}
                  />
                </Box>
              </Box>
            </Box>

            {/* 관리의무 Grid (추가 버튼 제거) */}
            <Box sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Box sx={{
                bgcolor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                p: 1.5
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  관리의무
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ height: '250px' }}>
                  <BaseDataGrid
                    data={managementDuties}
                    columns={managementDutyColumns}
                    rowSelection="none"
                    pagination={false}
                    height="250px"
                    rowHeight={42}
                  />
                </Box>
              </Box>
            </Box>

          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 1, gap: 1 }}>
          {mode === 'create' ? (
            <>
              <Button variant="outlined" onClick={onClose} disabled={loading}>
                취소
              </Button>
              <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
                {loading ? '등록 중...' : '등록'}
              </Button>
            </>
          ) : (
            <>
              {isEditing ? (
                <>
                  <Button variant="outlined" onClick={handleCancel} disabled={loading}>
                    취소
                  </Button>
                  <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
                    {loading ? '저장 중...' : '저장'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" onClick={onClose}>
                    닫기
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handlePrintPreview}
                    startIcon={<PrintIcon />}
                  >
                    책무기술서 출력
                  </Button>
                  <Button variant="contained" onClick={handleEdit}>
                    수정
                  </Button>
                </>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 직책 선택 모달 */}
      <PositionLookupModal
        open={positionSelectOpen}
        onClose={() => setPositionSelectOpen(false)}
        onSelect={handlePositionSelectFromDialog}
      />

      {/* 직원 조회 모달 */}
      <EmployeeLookupModal
        open={employeeSelectOpen}
        onClose={() => setEmployeeSelectOpen(false)}
        onSelect={handleEmployeeSelectFromDialog}
      />

      {/* 책무기술서 출력 모달 */}
      {printModalOpen && (
        <ResponsibilityDocPrintModal
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          data={getPrintData()}
        />
      )}
    </>
  );
};

export default ResponsibilityDocFormModal;
