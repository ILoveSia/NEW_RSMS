# PositionMgmt API 문서

## 📋 개요

PositionMgmt 컴포넌트와 연동되는 RESTful API 문서입니다. 직책 관리와 관련된 모든 API 엔드포인트를 정의합니다.

## 🌐 Base URL

```
Development: http://localhost:8081/api
Production: https://api.rsms.company.com/api
```

## 🔐 인증

모든 API 요청은 세션 기반 인증이 필요합니다.

```http
Cookie: JSESSIONID=your-session-id
```

## 📚 API 엔드포인트

### 1. 직책 목록 조회

#### `GET /resps/positions`

직책 목록을 페이지네이션과 함께 조회합니다.

**Query Parameters:**
```typescript
interface PositionListParams {
  page?: number;           // 페이지 번호 (기본값: 1)
  size?: number;           // 페이지 크기 (기본값: 20)
  positionName?: string;   // 직책명 검색
  headquarters?: string;   // 본부구분 필터
  status?: string;         // 상태 필터
  isActive?: string;       // 사용여부 필터 ('Y' | 'N')
  sort?: string;          // 정렬 필드 (기본값: 'registrationDate,desc')
}
```

**Response:**
```typescript
interface PositionListResponse {
  content: Position[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  };
  statistics: {
    total: number;
    activeCount: number;
    inactiveCount: number;
  };
}
```

**Example Request:**
```http
GET /api/resps/positions?page=1&size=20&positionName=관리자&headquarters=본부부서
```

**Example Response:**
```json
{
  "content": [
    {
      "id": "1",
      "positionName": "경영진단본부장",
      "headquarters": "본부부서",
      "departmentName": "경영진단본부",
      "divisionName": "경영진단본부",
      "registrationDate": "2024-01-15",
      "registrar": "관리자",
      "registrarPosition": "시스템관리자",
      "modificationDate": "2024-03-20",
      "modifier": "홍길동",
      "modifierPosition": "총합기획부",
      "status": "정상",
      "isActive": true,
      "approvalStatus": "승인완료"
    }
  ],
  "pagination": {
    "page": 1,
    "size": 20,
    "total": 150,
    "totalPages": 8,
    "first": true,
    "last": false
  },
  "statistics": {
    "total": 150,
    "activeCount": 142,
    "inactiveCount": 8
  }
}
```

### 2. 직책 상세 조회

#### `GET /resps/positions/{id}`

특정 직책의 상세 정보를 조회합니다.

**Path Parameters:**
- `id` (string): 직책 ID

**Response:**
```typescript
interface PositionDetailResponse {
  position: Position;
  history: PositionHistory[];
  relations: PositionRelation[];
}
```

**Example Request:**
```http
GET /api/resps/positions/1
```

**Example Response:**
```json
{
  "position": {
    "id": "1",
    "positionName": "경영진단본부장",
    "headquarters": "본부부서",
    "departmentName": "경영진단본부",
    "divisionName": "경영진단본부",
    "registrationDate": "2024-01-15",
    "registrar": "관리자",
    "registrarPosition": "시스템관리자",
    "modificationDate": "2024-03-20",
    "modifier": "홍길동",
    "modifierPosition": "총합기획부",
    "status": "정상",
    "isActive": true,
    "approvalStatus": "승인완료"
  },
  "history": [
    {
      "id": "h1",
      "changeType": "UPDATE",
      "changedField": "status",
      "oldValue": "검토중",
      "newValue": "정상",
      "changedBy": "홍길동",
      "changedAt": "2024-03-20T10:30:00Z"
    }
  ],
  "relations": [
    {
      "id": "r1",
      "relatedPositionId": "2",
      "relatedPositionName": "총합기획부장",
      "relationType": "SUBORDINATE"
    }
  ]
}
```

### 3. 직책 생성

#### `POST /resps/positions`

새로운 직책을 생성합니다.

**Request Body:**
```typescript
interface CreatePositionRequest {
  positionName: string;        // 직책명 (필수)
  headquarters: string;        // 본부구분 (필수)
  departmentName: string;      // 부서명 (필수)
  divisionName?: string;       // 팀명 (선택)
  description?: string;        // 직책 설명
  isActive: boolean;          // 사용여부 (기본값: true)
}
```

**Response:**
```typescript
interface CreatePositionResponse {
  position: Position;
  message: string;
}
```

**Example Request:**
```http
POST /api/resps/positions
Content-Type: application/json

{
  "positionName": "신규 팀장",
  "headquarters": "본부부서",
  "departmentName": "신규개발부",
  "divisionName": "신규개발팀",
  "description": "신규 사업 개발을 담당하는 팀장",
  "isActive": true
}
```

**Example Response:**
```json
{
  "position": {
    "id": "101",
    "positionName": "신규 팀장",
    "headquarters": "본부부서",
    "departmentName": "신규개발부",
    "divisionName": "신규개발팀",
    "registrationDate": "2024-09-18",
    "registrar": "current-user",
    "registrarPosition": "시스템관리자",
    "modificationDate": "2024-09-18",
    "modifier": "current-user",
    "modifierPosition": "시스템관리자",
    "status": "검토중",
    "isActive": true,
    "approvalStatus": "검토중"
  },
  "message": "직책이 성공적으로 생성되었습니다."
}
```

### 4. 직책 수정

#### `PUT /resps/positions/{id}`

기존 직책 정보를 수정합니다.

**Path Parameters:**
- `id` (string): 직책 ID

**Request Body:**
```typescript
interface UpdatePositionRequest {
  positionName?: string;
  headquarters?: string;
  departmentName?: string;
  divisionName?: string;
  description?: string;
  isActive?: boolean;
  status?: string;
}
```

**Response:**
```typescript
interface UpdatePositionResponse {
  position: Position;
  message: string;
}
```

**Example Request:**
```http
PUT /api/resps/positions/1
Content-Type: application/json

{
  "positionName": "경영진단본부장 (수정)",
  "description": "경영진단 업무를 총괄하는 본부장",
  "isActive": true
}
```

### 5. 직책 삭제

#### `DELETE /resps/positions`

선택된 직책들을 일괄 삭제합니다.

**Request Body:**
```typescript
interface DeletePositionsRequest {
  positionIds: string[];     // 삭제할 직책 ID 배열
  reason?: string;           // 삭제 사유
}
```

**Response:**
```typescript
interface DeletePositionsResponse {
  deletedCount: number;
  failedCount: number;
  failedItems: {
    id: string;
    reason: string;
  }[];
  message: string;
}
```

**Example Request:**
```http
DELETE /api/resps/positions
Content-Type: application/json

{
  "positionIds": ["1", "2", "3"],
  "reason": "조직 개편으로 인한 직책 폐지"
}
```

**Example Response:**
```json
{
  "deletedCount": 2,
  "failedCount": 1,
  "failedItems": [
    {
      "id": "2",
      "reason": "해당 직책에 할당된 사용자가 존재하여 삭제할 수 없습니다."
    }
  ],
  "message": "2개의 직책이 삭제되었습니다. 1개 직책은 삭제에 실패했습니다."
}
```

### 6. 엑셀 다운로드

#### `GET /resps/positions/export`

직책 목록을 엑셀 파일로 다운로드합니다.

**Query Parameters:**
- 직책 목록 조회와 동일한 필터 파라미터 지원

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="positions_20240918.xlsx"`

**Example Request:**
```http
GET /api/resps/positions/export?headquarters=본부부서&isActive=Y
```

### 7. 옵션 데이터 조회

#### `GET /resps/positions/options`

직책 관리에 필요한 옵션 데이터를 조회합니다.

**Response:**
```typescript
interface PositionOptionsResponse {
  headquarters: OptionItem[];
  statuses: OptionItem[];
  departments: OptionItem[];
  divisions: OptionItem[];
}

interface OptionItem {
  value: string;
  label: string;
  description?: string;
}
```

**Example Response:**
```json
{
  "headquarters": [
    { "value": "본부부서", "label": "본부부서" },
    { "value": "지역본부", "label": "지역본부" },
    { "value": "영업점", "label": "영업점" },
    { "value": "센터", "label": "센터" }
  ],
  "statuses": [
    { "value": "정상", "label": "정상" },
    { "value": "임시정지", "label": "임시정지" },
    { "value": "폐지", "label": "폐지" }
  ],
  "departments": [
    { "value": "경영진단본부", "label": "경영진단본부" },
    { "value": "총합기획부", "label": "총합기획부" },
    { "value": "영업본부", "label": "영업본부" }
  ],
  "divisions": [
    { "value": "경영진단팀", "label": "경영진단팀" },
    { "value": "기획팀", "label": "기획팀" },
    { "value": "영업기획팀", "label": "영업기획팀" }
  ]
}
```

## 🔄 상태 코드

| 상태 코드 | 설명 | 예시 상황 |
|-----------|------|-----------|
| 200 | 성공 | 목록 조회, 상세 조회 성공 |
| 201 | 생성 성공 | 직책 생성 성공 |
| 204 | 성공 (응답 본문 없음) | 삭제 성공 |
| 400 | 잘못된 요청 | 필수 필드 누락, 유효성 검사 실패 |
| 401 | 인증 실패 | 세션 만료, 로그인 필요 |
| 403 | 권한 없음 | 접근 권한 부족 |
| 404 | 리소스 없음 | 존재하지 않는 직책 ID |
| 409 | 충돌 | 중복된 직책명 |
| 500 | 서버 오류 | 내부 서버 오류 |

## ⚠️ 에러 응답 형식

```typescript
interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: {
    field: string;
    message: string;
  }[];
}
```

**Example Error Response:**
```json
{
  "timestamp": "2024-09-18T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "유효성 검사에 실패했습니다.",
  "path": "/api/resps/positions",
  "details": [
    {
      "field": "positionName",
      "message": "직책명은 필수 입력 항목입니다."
    },
    {
      "field": "headquarters",
      "message": "본부구분은 필수 선택 항목입니다."
    }
  ]
}
```

## 🔧 TypeScript 타입 정의

### Position 엔티티
```typescript
interface Position {
  id: string;
  positionName: string;
  headquarters: string;
  departmentName: string;
  divisionName?: string;
  description?: string;
  registrationDate: string;
  registrar: string;
  registrarPosition: string;
  modificationDate: string;
  modifier: string;
  modifierPosition: string;
  status: string;
  isActive: boolean;
  approvalStatus: string;
}
```

### 필터 타입
```typescript
interface PositionFilters {
  positionName: string;
  headquarters: string;
  status: string;
  isActive: string;
}
```

### 페이지네이션 타입
```typescript
interface PositionPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
```

### 모달 상태 타입
```typescript
interface PositionModalState {
  addModal: boolean;
  detailModal: boolean;
  selectedPosition: Position | null;
}
```

## 🔗 API 클라이언트 예시

### Axios 기반 서비스
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';

class PositionService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 세션 쿠키 포함
  });

  // 직책 목록 조회
  async getPositions(params: PositionListParams): Promise<PositionListResponse> {
    const response = await this.api.get('/resps/positions', { params });
    return response.data;
  }

  // 직책 상세 조회
  async getPosition(id: string): Promise<PositionDetailResponse> {
    const response = await this.api.get(`/resps/positions/${id}`);
    return response.data;
  }

  // 직책 생성
  async createPosition(data: CreatePositionRequest): Promise<CreatePositionResponse> {
    const response = await this.api.post('/resps/positions', data);
    return response.data;
  }

  // 직책 수정
  async updatePosition(id: string, data: UpdatePositionRequest): Promise<UpdatePositionResponse> {
    const response = await this.api.put(`/resps/positions/${id}`, data);
    return response.data;
  }

  // 직책 삭제
  async deletePositions(data: DeletePositionsRequest): Promise<DeletePositionsResponse> {
    const response = await this.api.delete('/resps/positions', { data });
    return response.data;
  }

  // 엑셀 다운로드
  async exportPositions(params: PositionListParams): Promise<Blob> {
    const response = await this.api.get('/resps/positions/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // 옵션 데이터 조회
  async getPositionOptions(): Promise<PositionOptionsResponse> {
    const response = await this.api.get('/resps/positions/options');
    return response.data;
  }
}

export const positionService = new PositionService();
```

### React Query 통합
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 직책 목록 조회
export const usePositions = (params: PositionListParams) => {
  return useQuery({
    queryKey: ['positions', params],
    queryFn: () => positionService.getPositions(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 직책 생성
export const useCreatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: positionService.createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};

// 직책 삭제
export const useDeletePositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: positionService.deletePositions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};
```

## 📊 API 성능 최적화

### 캐싱 전략
- **브라우저 캐시**: 정적 옵션 데이터 (1시간)
- **React Query 캐시**: 목록 데이터 (5분)
- **서버 캐시**: 통계 데이터 (1분)

### 페이지네이션 최적화
- 기본 페이지 크기: 20개
- 최대 페이지 크기: 100개
- 무한 스크롤 지원 예정

### 검색 최적화
- 디바운싱: 500ms
- 최소 검색 길이: 2자
- 인덱스 기반 검색

## 🔐 보안 고려사항

### 권한 체크
- 조회: `POSITION_READ` 권한
- 생성: `POSITION_CREATE` 권한
- 수정: `POSITION_UPDATE` 권한
- 삭제: `POSITION_DELETE` 권한

### 데이터 검증
- 서버 사이드 유효성 검사
- SQL 인젝션 방지
- XSS 방지

## 📞 지원 및 문의

API 관련 문의사항이나 이슈는 다음을 통해 연락해주세요:

- **백엔드 팀**: RSMS Backend Team
- **API 버전**: v1.0.0
- **최종 업데이트**: 2025-09-18

---

**📝 작성자**: Claude AI (RSMS 개발 지원)
**🎯 문서 목적**: PositionMgmt API 완전 가이드
**🔗 관련 문서**: [PositionMgmt 컴포넌트 문서](./README.md)