/**
 * 개선이행 상세 모달
 * - ImplMonitoringDetailModal과 동일한 디자인 적용
 * - 좌측: 관리활동 영역 + 수행활동 정보 + 점검정보 (읽기 전용, 카드 섹션)
 * - 우측: 개선이행정보 + 최종점검정보 영역 (편집 가능)
 */

import { useAuthStore } from '@/app/store/authStore';
import {
  requestImprovementCompleteApproval,
  requestImprovementPlanApproval
} from '@/domains/approval/api/approvalApi';
import {
  deleteAttachment,
  getAttachmentsByPhase,
  toUploadedFile,
  uploadAttachment
} from '@/shared/api/attachmentApi';
import { Button } from '@/shared/components/atoms/Button';
import { FileUpload } from '@/shared/components/molecules/FileUpload/FileUpload';
import type { UploadedFile } from '@/shared/components/molecules/FileUpload/types';
import { ApprovalRequestModal } from '@/shared/components/organisms/ApprovalRequestModal';
import { useCommonCode } from '@/shared/hooks/useCommonCode';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { ImprovementData } from '../ImprovementDataGrid/improvementColumns';
import styles from './ImprovementDetailModal.module.scss';

/**
 * 수행결과 코드를 코드명으로 변환
 * - 01: 적정, 02: 부적정
 * - 공통코드가 없거나 매핑되지 않을 경우 fallback
 */
const getExecutionResultDisplayName = (code: string | undefined, commonCodeName?: string): string => {
  if (commonCodeName && commonCodeName !== code) {
    return commonCodeName;
  }
  switch (code) {
    case '01':
      return '적정';
    case '02':
      return '부적정';
    default:
      return code || '-';
  }
};

/**
 * 점검결과 코드를 코드명으로 변환
 * - 01: 미점검, 02: 적정, 03: 부적정
 */
const getInspectionResultDisplayName = (code: string | undefined): string => {
  switch (code) {
    case '01':
      return '미점검';
    case '02':
      return '적정';
    case '03':
      return '부적정';
    default:
      return code || '-';
  }
};

interface ImprovementDetailModalProps {
  open: boolean;
  mode: 'edit' | 'detail';
  improvement?: ImprovementData | null;
  onClose: () => void;
  onSave: (data: ImprovementFormData) => void;
  onUpdate: (id: string, data: ImprovementFormData) => void;
  loading?: boolean;
}

/**
 * 폼 데이터 타입
 */
interface ImprovementFormData {
  // 개선이행정보
  improvementManager: string;
  improvementStatus: string;
  improvementPlanContent: string;
  improvementPlanDate: string | null;
  improvementApprovedDate: string | null;
  improvementDetail: string;
  improvementCompletedDate: string | null;
  // 최종점검정보
  finalInspector: string;
  finalInspectionResult: string;
  finalInspectionOpinion: string;
  finalInspectionDate: string | null;
}

/**
 * 개선이행정보 + 최종점검정보 폼 검증 스키마
 * - 상태에 따라 필수 필드가 달라지므로 모두 optional로 설정
 * - 실제 필수 검증은 비즈니스 로직에서 처리
 */
const schema = yup.object({
  // 개선이행정보
  improvementManager: yup.string(),
  improvementStatus: yup.string(),
  improvementPlanContent: yup.string().max(1000, '개선계획내용은 1000자 이내로 입력해주세요'),
  improvementPlanDate: yup.string().nullable(),
  improvementApprovedDate: yup.string().nullable(),
  improvementDetail: yup.string().max(1000, '개선이행세부내용은 1000자 이내로 입력해주세요'),
  improvementCompletedDate: yup.string().nullable(),
  // 최종점검정보
  finalInspector: yup.string(),
  finalInspectionResult: yup.string(),
  finalInspectionOpinion: yup.string().max(1000, '최종점검결과 내용은 1000자 이내로 입력해주세요'),
  finalInspectionDate: yup.string().nullable()
});

const ImprovementDetailModal: React.FC<ImprovementDetailModalProps> = ({
  open,
  mode,
  improvement,
  onClose,
  onSave,
  onUpdate,
  loading = false
}) => {

  // 로그인 사용자 정보 가져오기
  const user = useAuthStore((state) => state.user);
  const loggedInEmpNo = user?.empNo || '';

  // 공통코드 조회 - 점검주기, 수행결과
  const { getCodeName: getFrequencyName } = useCommonCode('FLFL_ISPC_FRCD');  // 점검주기
  const { getCodeName: getExecutionResultCodeName } = useCommonCode('EXEC_RSLT_CD');  // 수행결과

  /**
   * 권한 기반 편집 가능 여부 계산
   * - 기본: 모든 필드 비활성화 (조회만 가능)
   *
   * 상태별 권한:
   * - 01(개선미이행): 개선담당자 → 개선계획 작성 가능
   * - 02(개선계획): 개선담당자 → 개선계획 수정 가능 + 승인요청 버튼
   * - 03(승인요청): 점검자 → 승인/반려 가능 (개선계획승인일자 설정)
   * - 04(개선이행): 개선담당자 → 개선이행 세부내용 작성 가능
   * - 05(개선완료): 점검자 → 최종점검 수행 가능
   */
  /**
   * 버튼 표시 권한 계산
   * - 상태코드별 버튼 표시 로직:
   *   01(개선미이행): 로그인자 == 개선담당자 → "저장"
   *   02(개선계획): 로그인자 == 개선담당자 → "계획승인요청", "저장"
   *   03(승인요청): 모든 버튼 숨김
   *   04(개선이행): 로그인자 == 개선담당자 → "완료승인요청", "저장"
   *   05(완료승인요청): 로그인자 == 점검자 → "저장"
   *   06(개선완료): 모든 버튼 숨김
   */
  const {
    canEditPlan,
    canEditImpl,
    canEditFinal,
    canRequestApproval,
    canRequestCompletion,
    canSave
  } = useMemo(() => {
    // 기본값: 모든 권한 비활성화
    if (!improvement || !loggedInEmpNo) {
      return {
        canEditPlan: false,
        canEditImpl: false,
        canEditFinal: false,
        canRequestApproval: false,
        canRequestCompletion: false,
        canSave: false
      };
    }

    const improvementStatus = improvement.improvementStatus || '';
    const improvementManagerId = improvement.improvementManagerId || '';
    const inspectorId = improvement.inspector || '';

    // 로그인자와 개선담당자 비교
    const isImprovementManager = loggedInEmpNo === improvementManagerId;
    // 로그인자와 점검자 비교
    const isInspector = loggedInEmpNo === inspectorId;

    // 섹션 편집 권한 (UI 표시용)
    const canEditPlan = (improvementStatus === '01' || improvementStatus === '02') && isImprovementManager;
    const canEditImpl = improvementStatus === '04' && isImprovementManager;
    const canEditFinal = improvementStatus === '05' && isInspector;

    // 버튼 표시 권한
    // 01: 저장만 (개선담당자)
    // 02: 계획승인요청 + 저장 (개선담당자)
    // 03: 모든 버튼 숨김
    // 04: 완료승인요청 + 저장 (개선담당자)
    // 05: 저장만 (점검자)
    // 06: 모든 버튼 숨김
    const canRequestApproval = improvementStatus === '02' && isImprovementManager;
    const canRequestCompletion = improvementStatus === '04' && isImprovementManager;

    // 저장 버튼 표시 조건
    let canSave = false;
    if (improvementStatus === '01' && isImprovementManager) {
      canSave = true;  // 01: 개선담당자만
    } else if (improvementStatus === '02' && isImprovementManager) {
      canSave = true;  // 02: 개선담당자만
    } else if (improvementStatus === '04' && isImprovementManager) {
      canSave = true;  // 04: 개선담당자만
    } else if (improvementStatus === '05' && isInspector) {
      canSave = true;  // 05: 점검자만
    }
    // 03, 06: canSave = false (모든 버튼 숨김)

    return {
      canEditPlan,
      canEditImpl,
      canEditFinal,
      canRequestApproval,
      canRequestCompletion,
      canSave
    };
  }, [improvement, loggedInEmpNo]);

  /**
   * 결재요청 모달 상태 관리
   * - approvalModalOpen: 결재요청 모달 열림 여부
   * - approvalType: 결재 유형 (PLAN: 계획승인요청, COMPLETE: 개선완료승인요청)
   */
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalType, setApprovalType] = useState<'PLAN' | 'COMPLETE'>('PLAN');

  /**
   * 계획승인요청 버튼 클릭 핸들러
   * - 결재요청 모달을 열어 결재선 선택 후 결재 요청
   */
  const handleRequestApproval = useCallback(() => {
    if (!improvement?.id) return;
    console.log('[ImprovementDetailModal] 계획승인요청 모달 열기:', improvement.id);
    setApprovalType('PLAN');
    setApprovalModalOpen(true);
  }, [improvement]);

  /**
   * 개선완료승인요청 버튼 클릭 핸들러
   * - 결재요청 모달을 열어 결재선 선택 후 결재 요청
   */
  const handleRequestCompletion = useCallback(() => {
    if (!improvement?.id) return;
    console.log('[ImprovementDetailModal] 개선완료승인요청 모달 열기:', improvement.id);
    setApprovalType('COMPLETE');
    setApprovalModalOpen(true);
  }, [improvement]);

  /**
   * 결재요청 제출 핸들러
   * - 결재선 선택 후 실제 결재 요청 처리
   * - 결재 API 호출 후 상태 변경: PLAN(02→03), COMPLETE(04→05)
   * @param approvalLineId 선택한 결재선 ID
   * @param opinion 결재 의견
   */
  const handleApprovalSubmit = useCallback(async (approvalLineId: string, opinion: string) => {
    if (!improvement?.id) {
      throw new Error('개선이행 정보가 없습니다.');
    }

    console.log('[ImprovementDetailModal] 결재요청 제출:', {
      improvementId: improvement.id,
      approvalLineId,
      approvalType,
      opinion
    });

    try {
      // 결재 요청 API 호출
      if (approvalType === 'PLAN') {
        // 계획승인 요청
        await requestImprovementPlanApproval(improvement.id, approvalLineId, opinion);
      } else {
        // 완료승인 요청
        await requestImprovementCompleteApproval(improvement.id, approvalLineId, opinion);
      }

      // 새 상태 결정: PLAN은 03(승인요청), COMPLETE는 05(완료승인요청)
      const newStatus = approvalType === 'PLAN' ? '03' : '05';

      // 상태 변경하여 저장
      const approvalData: ImprovementFormData = {
        improvementManager: improvement.improvementManagerName || '',
        improvementStatus: newStatus,
        improvementPlanContent: improvement.improvementPlanContent || '',
        improvementPlanDate: improvement.improvementPlanDate || null,
        improvementApprovedDate: improvement.improvementApprovedDate || null,
        improvementDetail: improvement.improvementDetailContent || '',
        improvementCompletedDate: improvement.improvementCompletedDate || null,
        finalInspector: improvement.finalInspectorName || '',
        finalInspectionResult: improvement.finalInspectionResult || '',
        finalInspectionOpinion: improvement.finalInspectionOpinion || '',
        finalInspectionDate: improvement.finalInspectionDate || null
      };

      // 상태 업데이트
      onUpdate(improvement.id, approvalData);

      console.log('[ImprovementDetailModal] 결재요청 완료:', newStatus);
    } catch (error) {
      console.error('[ImprovementDetailModal] 결재요청 실패:', error);
      throw error;
    }
  }, [improvement, approvalType, onUpdate]);

  /**
   * 첨부파일 상태 관리
   * - planAttachments: 개선계획 단계 첨부파일 (attachment_phase = 'PLAN')
   * - implAttachments: 개선이행 단계 첨부파일 (attachment_phase = 'IMPL')
   */
  const [planAttachments, setPlanAttachments] = useState<UploadedFile[]>([]);
  const [implAttachments, setImplAttachments] = useState<UploadedFile[]>([]);

  /**
   * 모달 인스턴스 키 - 모달이 열릴 때마다 새로운 키 생성
   * 이전 첨부파일 데이터가 남아있는 문제 해결
   */
  const [modalInstanceKey, setModalInstanceKey] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ImprovementFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      improvementManager: '',
      improvementStatus: '01',
      improvementPlanContent: '',
      improvementPlanDate: dayjs().format('YYYY-MM-DD'),
      improvementApprovedDate: null,
      improvementDetail: '',
      improvementCompletedDate: null,
      finalInspector: '',
      finalInspectionResult: '',
      finalInspectionOpinion: '',
      finalInspectionDate: dayjs().format('YYYY-MM-DD')
    }
  });

  /**
   * 서버에서 첨부파일 목록 조회
   * - PLAN: 개선계획 단계 첨부파일
   * - IMPL: 개선이행 단계 첨부파일
   * - useEffect 전에 정의되어야 함
   */
  const loadAttachments = useCallback(async (entityId: string) => {
    console.log('[ImprovementDetailModal] 첨부파일 조회 시작:', entityId);
    try {
      // 개선계획 단계 첨부파일 조회
      const planFiles = await getAttachmentsByPhase('impl_inspection_items', entityId, 'PLAN');
      console.log('[ImprovementDetailModal] 개선계획 첨부파일 조회 결과:', planFiles);
      setPlanAttachments(planFiles.map(toUploadedFile));

      // 개선이행 단계 첨부파일 조회
      const implFiles = await getAttachmentsByPhase('impl_inspection_items', entityId, 'IMPL');
      console.log('[ImprovementDetailModal] 개선이행 첨부파일 조회 결과:', implFiles);
      setImplAttachments(implFiles.map(toUploadedFile));
    } catch (error) {
      console.error('첨부파일 조회 실패:', error);
      // 조회 실패 시 빈 배열로 초기화
      setPlanAttachments([]);
      setImplAttachments([]);
    }
  }, []);

  /**
   * 모달 열릴 때 인스턴스 키 업데이트
   * - open이 true로 변경될 때마다 키를 증가시켜 이전 상태 초기화
   */
  useEffect(() => {
    if (open) {
      setModalInstanceKey(prev => prev + 1);
    }
  }, [open]);

  /**
   * 모달 열릴 때 폼 데이터 초기화
   * - 실제 DB 데이터를 폼에 바인딩
   * - 더미 데이터 제거하고 실제 값 사용
   * - 모달 닫힐 때 첨부파일 상태 초기화
   */
  useEffect(() => {
    if (open && improvement) {
      // 먼저 첨부파일 초기화 (이전 데이터 표시 방지)
      setPlanAttachments([]);
      setImplAttachments([]);

      // 실제 DB 데이터로 폼 초기화
      reset({
        // 개선담당자명 (읽기 전용 표시용)
        improvementManager: improvement.improvementManagerName || improvement.improvementManagerId || '',
        // 개선이행상태코드
        improvementStatus: improvement.improvementStatus || '01',
        // 개선계획내용 (실제 DB 값)
        improvementPlanContent: improvement.improvementPlanContent || '',
        // 개선계획수립일자
        improvementPlanDate: improvement.improvementPlanDate || null,
        // 개선계획승인일자
        improvementApprovedDate: improvement.improvementApprovedDate || null,
        // 개선이행세부내용 (실제 DB 값)
        improvementDetail: improvement.improvementDetailContent || '',
        // 개선완료일자
        improvementCompletedDate: improvement.improvementCompletedDate || null,
        // 최종점검자명 (점검자 = 최종점검자)
        finalInspector: improvement.finalInspectorName || improvement.inspectorName || '',
        // 최종점검결과코드
        finalInspectionResult: improvement.finalInspectionResult || '',
        // 최종점검결과내용
        finalInspectionOpinion: improvement.finalInspectionOpinion || '',
        // 최종점검일자
        finalInspectionDate: improvement.finalInspectionDate || null
      });
      // 서버에서 해당 항목의 첨부파일 목록 조회
      loadAttachments(improvement.id);
    } else if (open && !improvement) {
      // 신규 등록 시 빈 폼으로 초기화
      reset({
        improvementManager: '',
        improvementStatus: '01',
        improvementPlanContent: '',
        improvementPlanDate: null,
        improvementApprovedDate: null,
        improvementDetail: '',
        improvementCompletedDate: null,
        finalInspector: '',
        finalInspectionResult: '',
        finalInspectionOpinion: '',
        finalInspectionDate: null
      });
      // 신규 등록 시 첨부파일 초기화
      setPlanAttachments([]);
      setImplAttachments([]);
    } else if (!open) {
      // 모달 닫힐 때 첨부파일 상태 초기화 (다음 열림 시 이전 데이터 방지)
      setPlanAttachments([]);
      setImplAttachments([]);
    }
  }, [open, improvement, mode, reset, loadAttachments]);

  /**
   * 개선계획 첨부파일 변경 핸들러
   * - 로컬 상태만 변경 (서버 업로드는 저장 버튼 클릭 시 수행)
   * - 파일 추가/삭제 시 로컬 상태만 업데이트
   */
  const handlePlanAttachmentsChange = useCallback((files: UploadedFile[]) => {
    // 로컬 상태만 업데이트 (서버 업로드는 저장 시 수행)
    setPlanAttachments(files);
  }, []);

  /**
   * 개선이행 첨부파일 변경 핸들러
   * - 로컬 상태만 변경 (서버 업로드는 저장 버튼 클릭 시 수행)
   * - 파일 추가/삭제 시 로컬 상태만 업데이트
   */
  const handleImplAttachmentsChange = useCallback((files: UploadedFile[]) => {
    // 로컬 상태만 업데이트 (서버 업로드는 저장 시 수행)
    setImplAttachments(files);
  }, []);

  /**
   * 첨부파일 서버 업로드 처리
   * - 저장 버튼 클릭 시 호출됨
   * - 새로 추가된 파일 업로드, 삭제된 파일 삭제
   * @param entityId 엔티티 ID (impl_inspection_items.impl_inspection_item_id)
   * @param currentFiles 현재 로컬 상태의 파일 목록
   * @param originalFiles 서버에서 조회한 원본 파일 목록
   * @param phase 첨부파일 단계 ('PLAN' | 'IMPL')
   */
  const syncAttachmentsToServer = useCallback(async (
    entityId: string,
    currentFiles: UploadedFile[],
    phase: 'PLAN' | 'IMPL'
  ) => {
    // 서버에서 원본 파일 목록 다시 조회 (삭제 비교용)
    const serverFiles = await getAttachmentsByPhase('impl_inspection_items', entityId, phase);
    const serverFileIds = serverFiles.map(f => f.attachmentId);

    // 새로 추가된 파일 찾기 (serverId가 없는 파일)
    const newFiles = currentFiles.filter(f => !f.serverId);
    // 삭제된 파일 찾기 (서버에 있었으나 현재 목록에 없는 파일)
    const deletedFileIds = serverFileIds.filter(
      serverId => !currentFiles.find(f => f.serverId === serverId)
    );

    console.log(`[ImprovementDetailModal] ${phase} 첨부파일 동기화:`, {
      newFiles: newFiles.length,
      deletedFiles: deletedFileIds.length
    });

    // 새 파일 업로드
    for (const newFile of newFiles) {
      try {
        await uploadAttachment({
          file: newFile.file,
          entityType: 'impl_inspection_items',
          entityId: entityId,
          attachmentPhase: phase,
          fileCategory: 'EVIDENCE'
        });
        console.log(`[ImprovementDetailModal] ${phase} 파일 업로드 성공:`, newFile.file.name);
      } catch (error) {
        console.error(`[ImprovementDetailModal] ${phase} 파일 업로드 실패:`, error);
      }
    }

    // 삭제된 파일 처리
    for (const fileId of deletedFileIds) {
      try {
        await deleteAttachment(fileId);
        console.log(`[ImprovementDetailModal] ${phase} 파일 삭제 성공:`, fileId);
      } catch (error) {
        console.error(`[ImprovementDetailModal] ${phase} 파일 삭제 실패:`, error);
      }
    }
  }, []);

  /**
   * 폼 저장 핸들러
   * - 첨부파일 서버 업로드 후 폼 데이터 저장
   * - edit 모드: onUpdate 호출 (기존 데이터 수정)
   * - 그 외: onSave 호출 (신규 등록)
   */
  const handleFormSubmit = useCallback(async (data: ImprovementFormData) => {
    console.log('[ImprovementDetailModal] handleFormSubmit 호출됨', { mode, improvement, data });

    // 첨부파일 서버 동기화 (저장 버튼 클릭 시에만 수행)
    if (improvement?.id) {
      try {
        // 개선계획 첨부파일 동기화
        await syncAttachmentsToServer(improvement.id, planAttachments, 'PLAN');
        // 개선이행 첨부파일 동기화
        await syncAttachmentsToServer(improvement.id, implAttachments, 'IMPL');
      } catch (error) {
        console.error('[ImprovementDetailModal] 첨부파일 동기화 실패:', error);
      }
    }

    if (mode === 'edit' && improvement) {
      console.log('[ImprovementDetailModal] onUpdate 호출', { id: improvement.id, data });
      onUpdate(improvement.id, data);
    } else {
      console.log('[ImprovementDetailModal] onSave 호출', { data });
      onSave(data);
    }
  }, [mode, improvement, onSave, onUpdate, planAttachments, implAttachments, syncAttachmentsToServer]);

  const modalTitle = mode === 'detail' ? '개선이행 상세 조회' : '개선이행 결과 작성';

  /**
   * 폼 검증 에러 핸들러
   * - 검증 실패 시 콘솔에 에러 출력
   */
  const handleFormError = useCallback((errors: any) => {
    console.error('[ImprovementDetailModal] 폼 검증 실패:', errors);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        key={`improvement-modal-${modalInstanceKey}`}
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            maxHeight: '85vh',
            width: '85%'
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'var(--theme-page-header-bg)',
            color: 'var(--theme-page-header-text)',
            fontSize: '1.25rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pr: 1
          }}
        >
          <span>{modalTitle}</span>
          <IconButton
            onClick={onClose}
            disabled={loading}
            sx={{
              color: 'var(--theme-page-header-text)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={3}>
              {/* 왼쪽: 관리활동 영역 (읽기 전용) */}
              <Grid item xs={12} md={6}>
                <Typography className={styles.sectionTitle}>
                  관리활동 영역
                </Typography>

                {/* 카드 섹션 1: 기본 정보 */}
                <div className={`${styles.cardSection} ${styles.cardBasicInfo}`}>
                  <div className={styles.cardTitle}>📋 기본 정보</div>

                  {/* 책무 */}
                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>책무</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={improvement?.responsibilityInfo || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  {/* 책무세부 */}
                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>책무세부</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      variant="outlined"
                      value={improvement?.responsibilityDetailInfo || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  {/* 관리의무 */}
                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>관리의무</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      variant="outlined"
                      value={improvement?.obligationInfo || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  {/* 부서명 */}
                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>부서명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={improvement?.orgCode || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>책무관리항목</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      multiline
                      rows={2}
                      value={improvement?.obligationInfo || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>관리활동명</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={improvement?.managementActivityName || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행점검항목</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      variant="outlined"
                      value={improvement?.inspectionMethod || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>

                {/* 카드 섹션 2: 수행활동 정보 (읽기 전용, dept_manager_manuals 데이터) */}
                <div className={`${styles.cardSection} ${styles.cardPerformanceInput}`}>
                  <div className={styles.cardTitle}>📋 수행활동 정보</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행자</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={improvement?.executorName || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  {/* 수행결과 + 점검주기 한 줄 배치 */}
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroupHalf}>
                      <Typography className={styles.fieldLabel}>수행결과</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={getExecutionResultDisplayName(improvement?.executionResultCd, getExecutionResultCodeName(improvement?.executionResultCd || ''))}
                        InputProps={{ readOnly: true }}
                      />
                    </div>
                    <div className={styles.fieldGroupHalf}>
                      <Typography className={styles.fieldLabel}>점검주기</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={improvement?.activityFrequencyCd ? getFrequencyName(improvement.activityFrequencyCd) : '-'}
                        InputProps={{ readOnly: true }}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>수행결과 내용</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      value={improvement?.executionResultContent || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>

                {/* 카드 섹션 3: 점검정보 (읽기 전용, impl_inspection_items 데이터) */}
                <div className={`${styles.cardSection} ${styles.cardInspectionInfo}`}>
                  <div className={styles.cardTitle}>🔍 점검정보</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검자</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={improvement?.inspectorName || improvement?.inspector || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검결과</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      value={getInspectionResultDisplayName(improvement?.inspectionResult)}
                      InputProps={{ readOnly: true }}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>점검결과 내용</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      value={improvement?.inspectionResultContent || '-'}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>
              </Grid>

              {/* 오른쪽: 개선이행정보 + 최종점검정보 영역 (편집 가능) */}
              <Grid item xs={12} md={6}>
                <Typography className={styles.sectionTitle}>
                  개선이행정보 + 최종점검정보 영역
                </Typography>

                {/* 카드 섹션 3: 개선계획 */}
                <div className={`${styles.cardSection} ${styles.cardImprovementPlan}`}>
                  <div className={styles.cardTitle}>✏️ 개선계획</div>

                  <div className={styles.twoColumnGrid}>
                    <div>
                      <Typography className={styles.fieldLabel}>개선담당자</Typography>
                      <Controller
                        name="improvementManager"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            disabled={!canEditPlan}
                            error={!!errors.improvementManager}
                            helperText={errors.improvementManager?.message}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Typography className={styles.fieldLabel}>개선이행상태</Typography>
                      {/* 개선이행상태는 읽기 전용 - 저장 시 자동으로 '02(개선계획)'으로 변경됨 */}
                      <Controller
                        name="improvementStatus"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            size="small"
                            InputProps={{ readOnly: true }}
                            value={
                              field.value === '01' ? '개선미이행' :
                              field.value === '02' ? '개선계획' :
                              field.value === '03' ? '승인요청' :
                              field.value === '04' ? '개선이행' :
                              field.value === '05' ? '완료승인요청' :
                              field.value === '06' ? '개선완료' : '-'
                            }
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획내용</Typography>
                    <Controller
                      name="improvementPlanContent"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          disabled={!canEditPlan}
                          error={!!errors.improvementPlanContent}
                          helperText={errors.improvementPlanContent?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획수립일자</Typography>
                    <Controller
                      name="improvementPlanDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                          format="YYYY/MM/DD"
                          disabled={!canEditPlan}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: !!errors.improvementPlanDate,
                              helperText: errors.improvementPlanDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* 개선계획 첨부파일 (attachment_phase = 'PLAN') */}
                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획 첨부파일</Typography>
                    <FileUpload
                      key={`plan-attachments-${modalInstanceKey}`}
                      value={planAttachments}
                      onChange={handlePlanAttachmentsChange}
                      disabled={loading || !canEditPlan}
                      readOnly={mode === 'detail' || !canEditPlan}
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.jpg,.jpeg,.png,.gif"
                      placeholder="개선계획 관련 파일을 첨부하세요"
                      compact={true}
                    />
                  </div>
                </div>

                {/* 카드 섹션 4: 개선이행 */}
                <div className={`${styles.cardSection} ${styles.cardImprovementExecution}`}>
                  <div className={styles.cardTitle}>✏️ 개선이행</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선계획승인일자</Typography>
                    <Controller
                      name="improvementApprovedDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                          format="YYYY/MM/DD"
                          disabled={!canEditImpl}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: !!errors.improvementApprovedDate,
                              helperText: errors.improvementApprovedDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선이행세부내용</Typography>
                    <Controller
                      name="improvementDetail"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          disabled={!canEditImpl}
                          error={!!errors.improvementDetail}
                          helperText={errors.improvementDetail?.message}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선완료일자</Typography>
                    <Controller
                      name="improvementCompletedDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                          format="YYYY/MM/DD"
                          disabled={!canEditImpl}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: !!errors.improvementCompletedDate,
                              helperText: errors.improvementCompletedDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  {/* 개선이행 첨부파일 (attachment_phase = 'IMPL') */}
                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>개선이행 첨부파일</Typography>
                    <FileUpload
                      key={`impl-attachments-${modalInstanceKey}`}
                      value={implAttachments}
                      onChange={handleImplAttachmentsChange}
                      disabled={loading || !canEditImpl}
                      readOnly={mode === 'detail' || !canEditImpl}
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.hwp,.jpg,.jpeg,.png,.gif"
                      placeholder="개선이행 관련 파일을 첨부하세요"
                      compact={true}
                    />
                  </div>
                </div>

                {/* 카드 섹션 4: 최종점검정보 입력 */}
                <div className={`${styles.cardSection} ${styles.cardFinalInspectionInput}`}>
                  <div className={styles.cardTitle}>🔍 최종점검정보</div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>최종점검일자</Typography>
                    <Controller
                      name="finalInspectionDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) => field.onChange(date?.format('YYYY-MM-DD') || null)}
                          format="YYYY/MM/DD"
                          disabled={!canEditFinal}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: !!errors.finalInspectionDate,
                              helperText: errors.finalInspectionDate?.message
                            }
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <Typography className={styles.fieldLabel}>최종점검결과 <span style={{ color: 'red' }}>*</span></Typography>
                    <Controller
                      name="finalInspectionResult"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small" error={!!errors.finalInspectionResult} disabled={!canEditFinal}>
                          <Select
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            displayEmpty
                          >
                            <MenuItem value="">미선택</MenuItem>
                            <MenuItem value="01">승인</MenuItem>
                            <MenuItem value="02">반려</MenuItem>
                          </Select>
                          {errors.finalInspectionResult && (
                            <FormHelperText>{errors.finalInspectionResult.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </div>
                </div>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            닫기
          </Button>
          {/* 계획승인요청 버튼: 상태 02(개선계획) && 로그인자 == 개선담당자 */}
          {canRequestApproval && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleRequestApproval}
              disabled={loading}
            >
              {loading ? '처리 중...' : '계획승인요청'}
            </Button>
          )}
          {/* 완료승인요청 버튼: 상태 04(개선이행) && 로그인자 == 개선담당자 */}
          {canRequestCompletion && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleRequestCompletion}
              disabled={loading}
            >
              {loading ? '처리 중...' : '개선완료승인요청'}
            </Button>
          )}
          {/* 저장 버튼: 상태별 권한에 따라 표시
              - 01(개선미이행): 개선담당자
              - 02(개선계획): 개선담당자
              - 03(승인요청): 숨김
              - 04(개선이행): 개선담당자
              - 05(완료승인요청): 점검자
              - 06(개선완료): 숨김 */}
          {canSave && (
            <Button
              variant="contained"
              onClick={handleSubmit(handleFormSubmit, handleFormError)}
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 결재요청 모달 - 공통 컴포넌트 사용 */}
      <ApprovalRequestModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onSubmit={handleApprovalSubmit}
        document={improvement ? {
          id: improvement.id,
          title: approvalType === 'PLAN' ? '개선계획 승인요청' : '개선완료 승인요청',
          displayFields: [
            { label: '관리활동명', value: improvement.managementActivityName || '-' },
            { label: '개선담당자', value: improvement.improvementManagerName || '-' },
            {
              label: approvalType === 'PLAN' ? '개선계획내용' : '개선이행내용',
              value: approvalType === 'PLAN'
                ? (improvement.improvementPlanContent || '-')
                : (improvement.improvementDetailContent || '-')
            }
          ]
        } : null}
        workTypeCd="IMPROVE"
        approvalTypeCd={approvalType === 'PLAN' ? 'PLAN_APPROVAL' : 'COMPLETE_APPROVAL'}
        modalTitle={approvalType === 'PLAN' ? '계획승인요청' : '개선완료승인요청'}
        requestDescription={approvalType === 'PLAN'
          ? '개선계획에 대한 승인을 요청합니다.'
          : '개선완료에 대한 승인을 요청합니다.'
        }
        loading={loading}
      />
    </LocalizationProvider>
  );
};

export default ImprovementDetailModal;
