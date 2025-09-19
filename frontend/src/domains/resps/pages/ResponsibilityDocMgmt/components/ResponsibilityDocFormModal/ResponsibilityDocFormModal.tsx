import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  TextField,
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  IconButton,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

import { BaseModal, type ModalAction } from '@/shared/components/organisms/BaseModal';
import type {
  ResponsibilityDoc,
  ResponsibilityDocFormData
} from '../../types/responsibilityDoc.types';
import styles from './ResponsibilityDocFormModal.module.scss';

// 유효성 검사 스키마
const validationSchema = yup.object({
  arbitraryPosition: yup.object({
    positionName: yup.string().required('직책을 입력해주세요'),
    positionTitle: yup.string(),
    isDual: yup.boolean().required(),
    employeeName: yup.string(),
    currentPositionDate: yup.string(),
    dualPositionDetails: yup.string(),
    responsibleDepts: yup.string()
  }).required(),
  mainCommittees: yup.array().of(
    yup.object({
      id: yup.string().required(),
      committeeName: yup.string().required(),
      chairperson: yup.string().required(),
      frequency: yup.string().required(),
      mainAgenda: yup.string().required()
    })
  ).required(),
  responsibilities: yup.array().of(
    yup.object({
      id: yup.string().required(),
      seq: yup.number().required(),
      responsibility: yup.string().required('책무를 입력해주세요'),
      responsibilityDetail: yup.string().required('책무 세부내용을 입력해주세요'),
      relatedBasis: yup.string().required('관련근거를 입력해주세요')
    })
  ).required(),
  managementDuties: yup.array().of(
    yup.string().required()
  ).required(),
  responsibilityOverview: yup.string(),
  responsibilityBackground: yup.string(),
  responsibilityBackgroundDate: yup.string()
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
  loading = false
}) => {

  // 책무 및 관리의무 상태 관리
  const [responsibilities, setResponsibilities] = useState([
    { id: '1', seq: 1, responsibility: '', responsibilityDetail: '', relatedBasis: '' }
  ]);
  const [managementDuties, setManagementDuties] = useState(['']);

  // React Hook Form 초기화
  const { control, handleSubmit, watch } = useForm<ResponsibilityDocFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      arbitraryPosition: {
        positionName: '김사본부장',
        positionTitle: '',
        isDual: true,
        employeeName: '',
        currentPositionDate: '',
        dualPositionDetails: '',
        responsibleDepts: '김사부, CEO, 준법감시본부'
      },
      mainCommittees: [
        {
          id: '1',
          committeeName: '임원후보추진집의회',
          chairperson: '위원',
          frequency: '수시:필요시',
          mainAgenda: '임원후보추진집의회'
        }
      ],
      responsibilities: [],
      managementDuties: [],
      responsibilityOverview: '',
      responsibilityBackground: '',
      responsibilityBackgroundDate: ''
    }
  });

  // 책무 추가/삭제 핸들러
  const addResponsibility = () => {
    const newResponsibility = {
      id: String(responsibilities.length + 1),
      seq: responsibilities.length + 1,
      responsibility: '',
      responsibilityDetail: '',
      relatedBasis: ''
    };
    setResponsibilities([...responsibilities, newResponsibility]);
  };

  const removeResponsibility = (index: number) => {
    if (responsibilities.length > 1) {
      setResponsibilities(responsibilities.filter((_, i) => i !== index));
    }
  };

  // 관리의무 추가/삭제 핸들러
  const addManagementDuty = () => {
    setManagementDuties([...managementDuties, '']);
  };

  const removeManagementDuty = (index: number) => {
    if (managementDuties.length > 1) {
      setManagementDuties(managementDuties.filter((_, i) => i !== index));
    }
  };

  // 모달 액션 버튼들
  const modalActions: ModalAction[] = [
    {
      key: 'save',
      label: '저장',
      variant: 'contained',
      onClick: () => console.log('저장')
    },
    {
      key: 'close',
      label: '닫기',
      variant: 'outlined',
      onClick: onClose
    }
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="책무기술서 초안 추가/변경"
      size="xl"
      maxHeight="90vh"
      actions={modalActions}
      loading={loading}
      className={styles.modal}
    >
      <Box className={styles.container}>

        {/* 임의직 직책 정보 섹션 */}
        <Box className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            임의직 직책 정보
          </Typography>
          <Box className={styles.sectionContent}>
            <Grid container spacing={2}>
              {/* 첫 번째 행 */}
              <Grid item xs={12} md={2}>
                <Controller
                  name="arbitraryPosition.positionName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="직책 *"
                      required
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Controller
                  name="arbitraryPosition.positionTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="직위"
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl component="fieldset" size="small">
                  <FormLabel component="legend">겸직여부 *</FormLabel>
                  <Controller
                    name="arbitraryPosition.isDual"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        value={field.value ? 'Y' : 'N'}
                        onChange={(e) => field.onChange(e.target.value === 'Y')}
                        row
                      >
                        <FormControlLabel value="Y" control={<Radio size="small" />} label="Y" />
                        <FormControlLabel value="N" control={<Radio size="small" />} label="N" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="arbitraryPosition.employeeName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="성명"
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <Controller
                  name="arbitraryPosition.currentPositionDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="현 직책 부여일"
                      type="date"
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              {/* 두 번째 행 */}
              <Grid item xs={12}>
                <Controller
                  name="arbitraryPosition.dualPositionDetails"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="겸직사항"
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                    />
                  )}
                />
              </Grid>

              {/* 세 번째 행 */}
              <Grid item xs={12}>
                <Controller
                  name="arbitraryPosition.responsibleDepts"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="소관부점 *"
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* 주관협의체 섹션 */}
        <Box className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            주관협의체 *
          </Typography>
          <Box className={styles.sectionContent}>
            <TableContainer component={Paper} elevation={0} className={styles.table}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.tableHeader}>회의체명</TableCell>
                    <TableCell className={styles.tableHeader}>위원장</TableCell>
                    <TableCell className={styles.tableHeader}>개최주기</TableCell>
                    <TableCell className={styles.tableHeader}>주요안건의결사항</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>임원후보추진집의회</TableCell>
                    <TableCell>위원</TableCell>
                    <TableCell>수시:필요시</TableCell>
                    <TableCell>임원후보추진집의회</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>감사위원회</TableCell>
                    <TableCell>위원장</TableCell>
                    <TableCell>정기:분기 1회, 수시:필요시</TableCell>
                    <TableCell>감사위원회</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* 책무정보 섹션 */}
        <Box className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>
            책무정보
          </Typography>
          <Box className={styles.sectionContent}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="responsibilityOverview"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="책무개요 *"
                      multiline
                      rows={4}
                      fullWidth
                      disabled={mode === 'detail'}
                      size="small"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="responsibilityBackground"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="책무 배경"
                      multiline
                      rows={4}
                      fullWidth
                      disabled={mode === 'detail'}
                      size="small"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="responsibilityBackgroundDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="책무 배경일자 *"
                      type="date"
                      fullWidth
                      size="small"
                      disabled={mode === 'detail'}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* 책무 테이블 섹션 */}
        <Box className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              책무
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addResponsibility}
              size="small"
            >
              추가
            </Button>
          </Box>
          <Box className={styles.sectionContent}>
            <TableContainer component={Paper} elevation={0} className={styles.table}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.tableHeader} width="80px">순번</TableCell>
                    <TableCell className={styles.tableHeader}>책무</TableCell>
                    <TableCell className={styles.tableHeader}>책무세부내용</TableCell>
                    <TableCell className={styles.tableHeader}>관련근거</TableCell>
                    <TableCell className={styles.tableHeader} width="80px">삭제</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {responsibilities.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.seq}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          disabled={mode === 'detail'}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          disabled={mode === 'detail'}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          disabled={mode === 'detail'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => removeResponsibility(index)}
                          disabled={responsibilities.length <= 1}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* 관리의무 섹션 */}
        <Box className={styles.section}>
          <Box className={styles.sectionHeader}>
            <Typography variant="h6" className={styles.sectionTitle}>
              관리의무 *
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addManagementDuty}
              size="small"
            >
              추가
            </Button>
          </Box>
          <Box className={styles.sectionContent}>
            {managementDuties.map((duty, index) => (
              <Box key={index} className={styles.managementDutyRow}>
                <Typography variant="body2" className={styles.dutyNumber}>
                  {index + 1})
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  disabled={mode === 'detail'}
                  value={duty}
                  onChange={(e) => {
                    const newDuties = [...managementDuties];
                    newDuties[index] = e.target.value;
                    setManagementDuties(newDuties);
                  }}
                />
                <IconButton
                  onClick={() => removeManagementDuty(index)}
                  disabled={managementDuties.length <= 1}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </BaseModal>
  );
};

export default ResponsibilityDocFormModal;