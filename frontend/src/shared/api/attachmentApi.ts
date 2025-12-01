/**
 * 첨부파일 API 클라이언트
 * - 파일 업로드, 다운로드, 조회, 삭제 API 호출
 * - Backend AttachmentController와 통신
 *
 * @author Claude AI
 * @since 2025-12-01
 */

import apiClient from './apiClient';

const BASE_URL = '/attachments';

/**
 * 첨부파일 응답 타입
 */
export interface AttachmentDto {
  attachmentId: string;
  entityType: string;
  entityId: string;
  attachmentPhase: string | null;
  fileName: string;
  storedFileName: string;
  fileExtension: string;
  fileSize: number;
  contentType: string;
  fileCategory: string;
  description: string | null;
  sortOrder: number;
  downloadCount: number;
  createdAt: string;
  createdBy: string;
  downloadUrl: string;
}

/**
 * 파일 업로드 요청 파라미터
 */
export interface AttachmentUploadParams {
  file: File;
  entityType: string;
  entityId: string;
  attachmentPhase?: string;  // PLAN, IMPL, FINAL
  fileCategory?: string;     // EVIDENCE, REPORT, REFERENCE, ETC
  description?: string;
  sortOrder?: number;
}

/**
 * 단일 파일 업로드
 * POST /api/attachments/upload
 *
 * @param params 업로드 파라미터
 * @returns 저장된 첨부파일 정보
 */
export const uploadAttachment = async (params: AttachmentUploadParams): Promise<AttachmentDto> => {
  const formData = new FormData();
  formData.append('file', params.file);
  formData.append('entityType', params.entityType);
  formData.append('entityId', params.entityId);

  if (params.attachmentPhase) {
    formData.append('attachmentPhase', params.attachmentPhase);
  }
  if (params.fileCategory) {
    formData.append('fileCategory', params.fileCategory);
  }
  if (params.description) {
    formData.append('description', params.description);
  }
  if (params.sortOrder !== undefined) {
    formData.append('sortOrder', params.sortOrder.toString());
  }

  const response = await apiClient.post<AttachmentDto>(`${BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 여러 파일 업로드
 * POST /api/attachments/upload-multiple
 *
 * @param files 업로드할 파일 목록
 * @param entityType 엔티티 타입
 * @param entityId 엔티티 ID
 * @param attachmentPhase 업무 단계 (선택)
 * @param fileCategory 파일 분류 (선택)
 * @returns 저장된 첨부파일 정보 목록
 */
export const uploadMultipleAttachments = async (
  files: File[],
  entityType: string,
  entityId: string,
  attachmentPhase?: string,
  fileCategory?: string
): Promise<AttachmentDto[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('entityType', entityType);
  formData.append('entityId', entityId);

  if (attachmentPhase) {
    formData.append('attachmentPhase', attachmentPhase);
  }
  if (fileCategory) {
    formData.append('fileCategory', fileCategory);
  }

  const response = await apiClient.post<AttachmentDto[]>(`${BASE_URL}/upload-multiple`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 특정 엔티티의 모든 첨부파일 조회
 * GET /api/attachments?entityType=xxx&entityId=xxx
 *
 * @param entityType 엔티티 타입 (테이블명)
 * @param entityId 엔티티 ID
 * @returns 첨부파일 목록
 */
export const getAttachmentsByEntity = async (
  entityType: string,
  entityId: string
): Promise<AttachmentDto[]> => {
  const response = await apiClient.get<AttachmentDto[]>(BASE_URL, {
    params: { entityType, entityId },
  });

  return response.data;
};

/**
 * 특정 엔티티의 특정 단계 첨부파일 조회
 * GET /api/attachments/by-phase?entityType=xxx&entityId=xxx&attachmentPhase=xxx
 *
 * @param entityType 엔티티 타입
 * @param entityId 엔티티 ID
 * @param attachmentPhase 업무 단계 (PLAN, IMPL, FINAL)
 * @returns 첨부파일 목록
 */
export const getAttachmentsByPhase = async (
  entityType: string,
  entityId: string,
  attachmentPhase: string
): Promise<AttachmentDto[]> => {
  const response = await apiClient.get<AttachmentDto[]>(`${BASE_URL}/by-phase`, {
    params: { entityType, entityId, attachmentPhase },
  });

  return response.data;
};

/**
 * 첨부파일 상세 조회
 * GET /api/attachments/{attachmentId}
 *
 * @param attachmentId 첨부파일 ID
 * @returns 첨부파일 정보
 */
export const getAttachment = async (attachmentId: string): Promise<AttachmentDto> => {
  const response = await apiClient.get<AttachmentDto>(`${BASE_URL}/${attachmentId}`);
  return response.data;
};

/**
 * 파일 다운로드 URL 생성
 * GET /api/attachments/{attachmentId}/download
 *
 * @param attachmentId 첨부파일 ID
 * @returns 다운로드 URL
 */
export const getDownloadUrl = (attachmentId: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';
  return `${baseUrl}${BASE_URL}/${attachmentId}/download`;
};

/**
 * 파일 다운로드 (Blob으로 받아서 클라이언트에서 저장)
 *
 * @param attachmentId 첨부파일 ID
 * @param fileName 저장할 파일명
 */
export const downloadAttachment = async (attachmentId: string, fileName: string): Promise<void> => {
  const response = await apiClient.get(`${BASE_URL}/${attachmentId}/download`, {
    responseType: 'blob',
  });

  // Blob을 다운로드 링크로 변환
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 첨부파일 삭제
 * DELETE /api/attachments/{attachmentId}
 *
 * @param attachmentId 첨부파일 ID
 */
export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${attachmentId}`);
};

/**
 * 여러 첨부파일 일괄 삭제
 * DELETE /api/attachments
 *
 * @param attachmentIds 첨부파일 ID 목록
 */
export const deleteAttachments = async (attachmentIds: string[]): Promise<void> => {
  await apiClient.delete(BASE_URL, { data: attachmentIds });
};

/**
 * AttachmentDto를 FileUpload 컴포넌트의 UploadedFile 형식으로 변환
 *
 * @param dto 서버 응답 첨부파일 DTO
 * @returns FileUpload 컴포넌트용 파일 객체
 */
export const toUploadedFile = (dto: AttachmentDto) => ({
  file: new File([], dto.fileName, { type: dto.contentType }),
  id: dto.attachmentId,
  serverId: dto.attachmentId,
  url: getDownloadUrl(dto.attachmentId),
  uploadedAt: new Date(dto.createdAt),
  uploadedBy: dto.createdBy,
});
