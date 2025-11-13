# FileUpload 컴포넌트 사용 가이드

## 📋 개요

모달 및 폼에서 사용할 수 있는 재사용 가능한 첨부파일 업로드 컴포넌트입니다.

**주요 기능:**
- ✅ 드래그 앤 드롭 파일 업로드
- ✅ 파일 크기 및 타입 검증
- ✅ 다중 파일 업로드 지원
- ✅ 파일 목록 표시 및 다운로드/삭제
- ✅ 읽기 전용 모드 지원
- ✅ 서버 연동 준비 완료 (확장 가능한 구조)

---

## 🚀 기본 사용법

### 1. Import

```tsx
import { FileUpload } from '@/shared/components/molecules/FileUpload';
import type { UploadedFile } from '@/shared/components/molecules/FileUpload';
```

### 2. 기본 예시

```tsx
import React, { useState } from 'react';
import { FileUpload, UploadedFile } from '@/shared/components/molecules/FileUpload';

const MyForm: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    console.log('업로드된 파일:', newFiles);
  };

  return (
    <div>
      <FileUpload
        value={files}
        onChange={handleFilesChange}
        label="첨부파일"
        placeholder="파일을 드래그하거나 클릭하여 업로드하세요"
      />
    </div>
  );
};
```

---

## 📖 Props 상세 설명

### FileUploadProps

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `value` | `UploadedFile[]` | `[]` | 현재 업로드된 파일 목록 |
| `onChange` | `(files: UploadedFile[]) => void` | - | 파일 변경 시 호출되는 콜백 |
| `disabled` | `boolean` | `false` | 컴포넌트 비활성화 여부 |
| `readOnly` | `boolean` | `false` | 읽기 전용 모드 (다운로드만 가능) |
| `maxFiles` | `number` | `10` | 최대 파일 개수 |
| `maxSize` | `number` | `10485760` | 최대 파일 크기 (bytes, 기본: 10MB) |
| `accept` | `string` | - | 허용할 파일 타입 (예: '.pdf,.doc,.xlsx') |
| `label` | `string` | - | 라벨 텍스트 |
| `placeholder` | `string` | '파일을 드래그하거나...' | 업로드 영역 텍스트 |
| `showFileList` | `boolean` | `true` | 파일 목록 표시 여부 |
| `compact` | `boolean` | `false` | 컴팩트 모드 (작은 크기) |
| `error` | `string` | - | 에러 메시지 |
| `onError` | `(error: string) => void` | - | 에러 발생 시 호출되는 콜백 |

---

## 💡 사용 시나리오 예시

### 시나리오 1: 제출보고서 등록 모달

```tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { FileUpload, UploadedFile } from '@/shared/components/molecules/FileUpload';

const SubmitReportFormModal: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    // 파일 업로드 로직 (나중에 서버 연동 시)
    console.log('업로드할 파일:', files);
    // API 호출 예정...
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(''), 3000); // 3초 후 에러 메시지 제거
  };

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>제출보고서 등록</DialogTitle>
      <DialogContent>
        {/* ... 다른 폼 필드들 ... */}

        <FileUpload
          value={files}
          onChange={setFiles}
          label="첨부파일"
          placeholder="제출보고서 관련 파일을 업로드하세요"
          maxFiles={5}
          maxSize={20 * 1024 * 1024} // 20MB
          accept=".pdf,.doc,.docx,.xlsx,.xls"
          error={error}
          onError={handleError}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained">
          등록
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 시나리오 2: 읽기 전용 모드 (상세 보기)

```tsx
const SubmitReportDetailModal: React.FC<{ reportData: any }> = ({ reportData }) => {
  // 서버에서 가져온 파일 목록
  const existingFiles: UploadedFile[] = reportData.attachments.map((att: any) => ({
    file: new File([], att.fileName), // 임시 File 객체
    id: att.attachmentId,
    serverId: att.attachmentId,
    url: att.downloadUrl,
    uploadedAt: att.createdAt,
    uploadedBy: att.createdBy
  }));

  return (
    <Dialog open={true} maxWidth="md" fullWidth>
      <DialogTitle>제출보고서 상세</DialogTitle>
      <DialogContent>
        {/* ... 다른 정보 표시 ... */}

        <FileUpload
          value={existingFiles}
          readOnly={true} // 읽기 전용: 다운로드만 가능
          label="첨부파일"
          showFileList={true}
        />
      </DialogContent>
    </Dialog>
  );
};
```

### 시나리오 3: 파일 타입 제한 (이미지만)

```tsx
const ImageUploadForm: React.FC = () => {
  const [images, setImages] = useState<UploadedFile[]>([]);

  return (
    <FileUpload
      value={images}
      onChange={setImages}
      label="이미지 첨부"
      placeholder="이미지 파일을 업로드하세요"
      maxFiles={3}
      maxSize={5 * 1024 * 1024} // 5MB
      accept="image/png,image/jpeg,image/jpg,image/gif"
      onError={(error) => console.error('이미지 업로드 에러:', error)}
    />
  );
};
```

### 시나리오 4: 컴팩트 모드 (작은 공간)

```tsx
const CompactFileUpload: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  return (
    <FileUpload
      value={files}
      onChange={setFiles}
      compact={true} // 작은 크기로 표시
      maxFiles={3}
      showFileList={true}
    />
  );
};
```

---

## 🔧 서버 연동 준비 (나중에)

현재는 클라이언트 사이드에서만 동작하지만, 서버 연동 시 아래와 같이 확장할 수 있습니다:

```tsx
const handleFilesChange = async (newFiles: UploadedFile[]) => {
  // 새로 추가된 파일만 필터링
  const filesToUpload = newFiles.filter(f => !f.serverId);

  if (filesToUpload.length > 0) {
    try {
      // FormData 생성
      const formData = new FormData();
      filesToUpload.forEach(uploadedFile => {
        formData.append('files', uploadedFile.file);
      });

      // API 호출 (예시)
      const response = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData
      });

      const uploadedData = await response.json();

      // 서버 응답으로 파일 정보 업데이트
      const updatedFiles = newFiles.map(f => {
        const serverFile = uploadedData.find((d: any) => d.originalName === f.file.name);
        if (serverFile) {
          return {
            ...f,
            serverId: serverFile.attachmentId,
            url: serverFile.downloadUrl,
            uploadedAt: serverFile.uploadedAt,
            uploadedBy: serverFile.uploadedBy
          };
        }
        return f;
      });

      setFiles(updatedFiles);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
    }
  } else {
    setFiles(newFiles);
  }
};
```

---

## 🎨 스타일 커스터마이징

SCSS 변수를 통해 스타일을 커스터마이징할 수 있습니다:

```scss
// 프로젝트의 _variables.scss에서 오버라이드
$color-primary: #1976d2;
$color-border-default: #e0e0e0;
$spacing-md: 16px;
```

---

## ✅ 검증 규칙

### 파일 크기 검증
- 기본: 10MB (10,485,760 bytes)
- 커스터마이징: `maxSize` prop 사용

### 파일 타입 검증
- `accept` prop으로 제한
- 예시: `accept=".pdf,.doc,.xlsx"` 또는 `accept="image/*"`

### 파일 개수 검증
- 기본: 최대 10개
- 커스터마이징: `maxFiles` prop 사용

---

## 📝 타입 정의

### UploadedFile

```typescript
interface UploadedFile {
  // 필수: 클라이언트 파일 정보
  file: File;                     // File 객체
  id: string;                     // 임시 ID (클라이언트)

  // 선택: 서버 파일 정보 (나중에 추가)
  serverId?: string;              // 서버 파일 ID (attachments 테이블)
  url?: string;                   // 다운로드 URL
  uploadedAt?: string;            // 업로드 일시
  uploadedBy?: string;            // 업로더
}
```

---

## 🐛 문제 해결

### Q1: 파일이 업로드되지 않아요
**A1**: `onChange` prop이 정상적으로 전달되었는지 확인하세요.

### Q2: 드래그 앤 드롭이 동작하지 않아요
**A2**: `disabled` 또는 `readOnly` prop이 `true`로 설정되지 않았는지 확인하세요.

### Q3: 파일 타입 제한이 동작하지 않아요
**A3**: `accept` prop 형식을 확인하세요. (예: `.pdf,.doc` 또는 `image/*`)

---

## 📚 참고 자료

- [HTML5 File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Material-UI Icons](https://mui.com/material-ui/material-icons/)

---

**작성일**: 2025-09-24
**작성자**: RSMS Development Team
**버전**: 1.0.0
