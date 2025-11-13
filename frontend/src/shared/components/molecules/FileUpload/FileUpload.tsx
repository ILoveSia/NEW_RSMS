/**
 * 파일 업로드 공통 컴포넌트
 * - 드래그앤드롭 지원
 * - 파일 목록 표시 및 삭제
 * - 파일 크기 및 타입 검증
 * - 나중에 서버 연동 쉽게 추가 가능
 */

import React, { useCallback, useRef, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import { IconButton, Tooltip } from '@mui/material';
import styles from './FileUpload.module.scss';
import type { FileUploadProps, UploadedFile, FileValidationResult } from './types';

/**
 * 파일 업로드 컴포넌트
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  disabled = false,
  readOnly = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept,
  label,
  placeholder = '파일을 드래그하거나 클릭하여 업로드하세요',
  showFileList = true,
  compact = false,
  error,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 파일 크기를 읽기 쉬운 형식으로 변환
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * 파일 검증
   */
  const validateFile = (file: File): FileValidationResult => {
    // 파일 크기 검증
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}까지 업로드 가능합니다.`
      };
    }

    // 파일 타입 검증
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return {
          valid: false,
          error: `허용되지 않는 파일 형식입니다. (${accept})`
        };
      }
    }

    return { valid: true };
  };

  /**
   * 파일 추가 처리
   */
  const handleFilesAdd = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (disabled || readOnly) return;

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    // 최대 파일 개수 확인
    if (value.length + files.length > maxFiles) {
      const errorMsg = `최대 ${maxFiles}개의 파일만 업로드 가능합니다.`;
      errors.push(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // 각 파일 검증 및 추가
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        newFiles.push({
          file,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 임시 ID
        });
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // 에러 처리
    if (errors.length > 0 && onError) {
      onError(errors.join('\n'));
    }

    // 새 파일 추가
    if (newFiles.length > 0 && onChange) {
      onChange([...value, ...newFiles]);
    }
  }, [value, onChange, disabled, readOnly, maxFiles, maxSize, accept, onError, validateFile]);

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesAdd(event.target.files);
    // input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 파일 삭제 핸들러
   */
  const handleFileRemove = (fileId: string) => {
    if (disabled || readOnly) return;
    if (onChange) {
      onChange(value.filter(f => f.id !== fileId));
    }
  };

  /**
   * 파일 다운로드 핸들러 (나중에 서버 연동 시 URL 사용)
   */
  const handleFileDownload = (uploadedFile: UploadedFile) => {
    if (uploadedFile.url) {
      // 서버 파일: URL로 다운로드
      window.open(uploadedFile.url, '_blank');
    } else {
      // 클라이언트 파일: Blob URL로 다운로드
      const url = URL.createObjectURL(uploadedFile.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedFile.file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  /**
   * 드래그앤드롭 핸들러
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !readOnly) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFilesAdd(e.dataTransfer.files);
  };

  /**
   * 업로드 영역 클릭 핸들러
   */
  const handleUploadAreaClick = () => {
    if (!disabled && !readOnly) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {/* 라벨 */}
      {label && (
        <label className={styles.label}>
          {label}
          {!readOnly && <span className={styles.optional}> (선택)</span>}
        </label>
      )}

      {/* 업로드 영역 */}
      {!readOnly && (
        <div
          className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''} ${error ? styles.error : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadAreaClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon className={styles.uploadIcon} />
          <p className={styles.uploadText}>{placeholder}</p>
          <p className={styles.uploadHint}>
            최대 {maxFiles}개, 파일당 {formatFileSize(maxSize)}
            {accept && ` (${accept})`}
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* 파일 목록 */}
      {showFileList && value.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <span>첨부파일 ({value.length}/{maxFiles})</span>
          </div>
          {value.map((uploadedFile) => (
            <div key={uploadedFile.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <AttachFileIcon className={styles.fileIcon} />
                <div className={styles.fileDetails}>
                  <span className={styles.fileName}>{uploadedFile.file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(uploadedFile.file.size)}</span>
                </div>
              </div>
              <div className={styles.fileActions}>
                <Tooltip title="다운로드">
                  <IconButton
                    size="small"
                    onClick={() => handleFileDownload(uploadedFile)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {!readOnly && !disabled && (
                  <Tooltip title="삭제">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleFileRemove(uploadedFile.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
