/**
 * 임원정보 등록/수정/상세 모달 컴포넌트
 * @description PositionFormModal 표준 구조를 적용한 임원정보 폼 모달
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Chip,
  Divider,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import GavelIcon from '@mui/icons-material/Gavel';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Shared Components
import { Button } from '@/shared/components/atoms/Button';
import { BaseDataGrid } from '@/shared/components/organisms/BaseDataGrid';

// Types and validation
import type {
  OfficerInfo,
  OfficerInfoFormData,
  MeetingBodyFormData,
  ResponsibilityFormData,
  ManagementObligationFormData
} from '../../types/officerInfo.types';

import {
  OFFICER_INFO_BUSINESS_RULES,
  DUAL_POSITION_OPTIONS,
  MEETING_FREQUENCY_OPTIONS,
  MODAL_MODES
} from '../../types/officerInfo.types';

// Column definitions
import {
  meetingBodyColumns,
  responsibilityColumns,
  managementObligationColumns
} from '../OfficerInfoDataGrid/officerInfoColumns';


// 🎯 Validation Schema
const validationSchema = yup.object({
  positionCode: yup.string().required('직책은 필수입니다'),
  officerName: yup
    .string()
    .required('임원명은 필수입니다')
    .max(OFFICER_INFO_BUSINESS_RULES.MAX_OFFICER_NAME_LENGTH, `임원명은 ${OFFICER_INFO_BUSINESS_RULES.MAX_OFFICER_NAME_LENGTH}자 이하로 입력해주세요`),
  officerPosition: yup
    .string()
    .max(OFFICER_INFO_BUSINESS_RULES.MAX_POSITION_LENGTH, `직위는 ${OFFICER_INFO_BUSINESS_RULES.MAX_POSITION_LENGTH}자 이하로 입력해주세요`),
  isDualPosition: yup.boolean().required('겸직여부는 필수입니다'),
  dualPositionDetails: yup.string().when('isDualPosition', {
    is: true,
    then: (schema) => schema
      .required('겸직여부가 Y인 경우 겸직사항은 필수입니다')
      .max(OFFICER_INFO_BUSINESS_RULES.MAX_DUAL_POSITION_DETAILS_LENGTH, `겸직사항은 ${OFFICER_INFO_BUSINESS_RULES.MAX_DUAL_POSITION_DETAILS_LENGTH}자 이하로 입력해주세요`),
    otherwise: (schema) => schema.max(OFFICER_INFO_BUSINESS_RULES.MAX_DUAL_POSITION_DETAILS_LENGTH, `겸직사항은 ${OFFICER_INFO_BUSINESS_RULES.MAX_DUAL_POSITION_DETAILS_LENGTH}자 이하로 입력해주세요`)
  }),
  responsibilityAssignDate: yup
    .string()
    .required('책무정보 부여일자는 필수입니다'),
  meetingBodies: yup
    .array()
    .min(OFFICER_INFO_BUSINESS_RULES.MIN_MEETING_BODIES, `최소 ${OFFICER_INFO_BUSINESS_RULES.MIN_MEETING_BODIES}개의 회의체가 필요합니다`),
  responsibilities: yup
    .array()
    .min(OFFICER_INFO_BUSINESS_RULES.MIN_RESPONSIBILITIES, `최소 ${OFFICER_INFO_BUSINESS_RULES.MIN_RESPONSIBILITIES}개의 책무가 필요합니다`),
  managementObligations: yup
    .array()
    .min(OFFICER_INFO_BUSINESS_RULES.MIN_MANAGEMENT_OBLIGATIONS, `최소 ${OFFICER_INFO_BUSINESS_RULES.MIN_MANAGEMENT_OBLIGATIONS}개의 관리의무가 필요합니다`)
});

interface OfficerInfoFormModalProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  officerInfo?: OfficerInfo;
  onClose: () => void;
  onSubmit: (data: OfficerInfoFormData) => Promise<void>;
  loading?: boolean;
}

const OfficerInfoFormModal: React.FC<OfficerInfoFormModalProps> = ({
  open,
  mode,
  officerInfo,
  onClose,
  onSubmit,
  loading = false
}) => {
  // 📝 Form Management
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<OfficerInfoFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      positionCode: '',
      officerName: '',
      officerPosition: '',
      isDualPosition: false,
      dualPositionDetails: '',
      responsibilityAssignDate: '',
      meetingBodies: [],
      responsibilityOverview: '',
      responsibilities: [],
      managementObligations: [],
      workNotes: '',
      verifierPosition: '',
      verifierName: ''
    }
  });

  // 📋 Field Arrays
  const { fields: meetingBodyFields, append: appendMeetingBody, remove: removeMeetingBody } = useFieldArray({
    control,
    name: 'meetingBodies'
  });

  const { fields: responsibilityFields, append: appendResponsibility, remove: removeResponsibility } = useFieldArray({
    control,
    name: 'responsibilities'
  });

  const { fields: obligationFields, append: appendObligation, remove: removeObligation } = useFieldArray({
    control,
    name: 'managementObligations'
  });

  // 👀 Watch values
  const isDualPosition = watch('isDualPosition');

  // 🎯 Modal Configuration
  const modalConfig = MODAL_MODES[mode];
  const isReadonly = modalConfig.readonly;

  // 📊 Mock 데이터
  const mockPositions = [
    { code: 'POS001', name: '최고경영진' },
    { code: 'POS002', name: '오토금융본부장' },
    { code: 'POS003', name: '리스크관리본부장' },
    { code: 'POS004', name: '영업본부장' }
  ];

  // 🎯 Form 초기화
  useEffect(() => {
    if (officerInfo && mode !== 'create') {
      setValue('positionCode', officerInfo.positionCode);
      setValue('officerName', officerInfo.officerName || '');
      setValue('officerPosition', officerInfo.officerPosition || '');
      setValue('isDualPosition', officerInfo.isDualPosition);
      setValue('dualPositionDetails', officerInfo.dualPositionDetails || '');
      setValue('responsibilityAssignDate', officerInfo.responsibilityAssignDate || '');

      // Mock 데이터로 초기화
      if (officerInfo.meetingBodies && officerInfo.meetingBodies.length > 0) {
        setValue('meetingBodies', officerInfo.meetingBodies.map(mb => ({
          meetingName: mb.meetingName,
          chairperson: mb.chairperson,
          frequency: mb.frequency,
          mainAgenda: mb.mainAgenda,
          seq: mb.seq
        })));
      } else {
        // Default meeting bodies
        setValue('meetingBodies', [
          {
            meetingName: '내부통제위원회',
            chairperson: '위원',
            frequency: '월 1회',
            mainAgenda: '정기모니터링 체크',
            seq: 1
          },
          {
            meetingName: '내부통제위원회',
            chairperson: '위원',
            frequency: '월 1회',
            mainAgenda: '정기모니터링 체크',
            seq: 2
          }
        ]);
      }

      // Default responsibilities
      setValue('responsibilities', [
        {
          responsibility: '(공통) 소관 업무조직 내 법령위반 및 위험상황에 대한 책무',
          responsibilityDetails: '영업관련 내부통제 대한 책무 세부내용',
          legalBasis: '영업관련 내부통제 강화를 위한 내규 제003',
          seq: 1
        },
        {
          responsibility: '정영관련 손익과 관련된 책무',
          responsibilityDetails: '정영관련 손익 관련 책무 세부내용',
          legalBasis: '정영관련 손익 내규 제003',
          seq: 2
        }
      ]);

      // Default management obligations
      setValue('managementObligations', [
        {
          obligationContent: '1) 영업관련 손익 관리의무 세부내용',
          legalBasis: '1) 영업관련 손익 관리의무 세부내용 2) 영업관련 손익 관리의무 세부내용 3) 영업관련 내부통제 대한 관리의무',
          seq: 1
        },
        {
          obligationContent: '2) 영업관련 손익 관리의무 세부내용 2',
          legalBasis: '2) 영업관련 손익 내규 제003',
          seq: 2
        },
        {
          obligationContent: '3) 영업관련 내부통제 대한 관리의무',
          legalBasis: '3) 영업관련 내부통제 강화를 위한 내규 제003',
          seq: 3
        }
      ]);

      setValue('responsibilityOverview', '오토금융 분야 금융영업 관련 책무');
      setValue('workNotes', '초직대법에서 정한 작업위험성 관련 책무에서');
      setValue('verifierPosition', '2025-08-01');
    }
  }, [officerInfo, mode, setValue]);

  // 🎯 Event Handlers
  const handleFormSubmit = useCallback(async (data: OfficerInfoFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    }
  }, [onSubmit]);

  const handleAddMeetingBody = useCallback(() => {
    appendMeetingBody({
      meetingName: '',
      chairperson: '',
      frequency: '월 1회',
      mainAgenda: '',
      seq: meetingBodyFields.length + 1
    });
  }, [appendMeetingBody, meetingBodyFields.length]);

  const handleAddResponsibility = useCallback(() => {
    appendResponsibility({
      responsibility: '',
      responsibilityDetails: '',
      legalBasis: '',
      seq: responsibilityFields.length + 1
    });
  }, [appendResponsibility, responsibilityFields.length]);

  const handleAddObligation = useCallback(() => {
    appendObligation({
      obligationContent: '',
      legalBasis: '',
      seq: obligationFields.length + 1
    });
  }, [appendObligation, obligationFields.length]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      
    >
      <DialogTitle >
        <div >
          <PersonIcon  />
          <Typography variant="h6" component="div">
            {modalConfig.title}
          </Typography>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent >
        <form onSubmit={handleSubmit(handleFormSubmit)} >
          {/* 📋 Section 1: 임원 및 직책 정보 */}
          <div >
            <div >
              <Typography variant="h6" >
                <PersonIcon />
                임원 및 직책 정보
              </Typography>
            </div>

            <div >
              <div >
                <Controller
                  name="positionCode"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.positionCode} disabled={isReadonly}>
                      <InputLabel>직책 *</InputLabel>
                      <Select {...field} label="직책 *">
                        {mockPositions.map((position) => (
                          <MenuItem key={position.code} value={position.code}>
                            {position.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.positionCode && (
                        <Typography variant="caption" color="error">
                          {errors.positionCode.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </div>
              <div >
                <Controller
                  name="officerName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="성명 *"
                      fullWidth
                      error={!!errors.officerName}
                      helperText={errors.officerName?.message}
                      disabled={isReadonly}
                    />
                  )}
                />
              </div>
            </div>

            <div >
              <div >
                <Controller
                  name="isDualPosition"
                  control={control}
                  render={({ field }) => (
                    <FormControl disabled={isReadonly}>
                      <Typography variant="body2" gutterBottom>
                        겸직여부 *
                      </Typography>
                      <RadioGroup
                        {...field}
                        row
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value === 'true')}
                      >
                        <FormControlLabel value={true} control={<Radio />} label="Y" />
                        <FormControlLabel value={false} control={<Radio />} label="N" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </div>
              <div >
                <Controller
                  name="responsibilityAssignDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="책무정보 부여일자 *"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.responsibilityAssignDate}
                      helperText={errors.responsibilityAssignDate?.message}
                      disabled={isReadonly}
                    />
                  )}
                />
              </div>
            </div>

            {isDualPosition && (
              <div >
                <div >
                  <Controller
                    name="dualPositionDetails"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="겸직사항"
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.dualPositionDetails}
                        helperText={errors.dualPositionDetails?.message}
                        disabled={isReadonly}
                      />
                    )}
                  />
                </div>
              </div>
            )}
          </div>

          <Divider  />

          {/* 📋 Section 2: 소관부점 회의체 정보 */}
          <div >
            <div >
              <Typography variant="h6" >
                <BusinessIcon />
                소관부점 정보
              </Typography>
              {!isReadonly && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddMeetingBody}
                >
                  회의체 추가
                </Button>
              )}
            </div>

            <div >
              <BaseDataGrid
                data={meetingBodyFields}
                columns={meetingBodyColumns}
                height={200}
                pagination={false}
                theme="alpine"
              />
            </div>
          </div>

          <Divider  />

          {/* 📋 Section 3: 작업내역 */}
          <div >
            <Typography variant="h6" >
              <WorkIcon />
              작업내역
            </Typography>

            <div >
              <div >
                <Controller
                  name="verifierPosition"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="직위검증자"
                      fullWidth
                      disabled={isReadonly}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* 📋 Section 4: 책무정보 (상세 모드에서만 표시) */}
          {mode === 'view' && (
            <>
              <Divider  />
              <div >
                <Typography variant="h6" >
                  <AssignmentIcon />
                  책무정보
                </Typography>

                <div >
                  <div >
                    <Controller
                      name="responsibilityOverview"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="책무개요"
                          multiline
                          rows={3}
                          fullWidth
                          disabled={isReadonly}
                        />
                      )}
                    />
                  </div>
                </div>

                <div >
                  <BaseDataGrid
                    data={responsibilityFields}
                    columns={responsibilityColumns}
                    height={200}
                    pagination={false}
                    theme="alpine"
                  />
                </div>
              </div>

              <Divider  />

              {/* 📋 Section 5: 관리의무 */}
              <div >
                <Typography variant="h6" >
                  <GavelIcon />
                  관리의무
                </Typography>

                <div >
                  <BaseDataGrid
                    data={obligationFields}
                    columns={managementObligationColumns}
                    height={200}
                    pagination={false}
                    theme="alpine"
                  />
                </div>
              </div>
            </>
          )}
        </form>
      </DialogContent>

      <DialogActions >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          닫기
        </Button>
        {!isReadonly && (
          <Button
            variant="contained"
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
            disabled={!isValid}
          >
            {modalConfig.submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OfficerInfoFormModal;