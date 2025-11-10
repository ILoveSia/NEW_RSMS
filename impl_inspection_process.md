# 이행점검 프로세스 정의서

## 문서 정보
- **작성일**: 2025-11-10
- **작성자**: User + Claude AI
- **목적**: Backend 개발 시 이행점검 비즈니스 로직 구현 가이드
- **관련 테이블**: `impl_inspection_items`, `dept_manager_manuals`

---

## 1. 프로세스 개요

### 1.1 프로세스 단계
이행점검은 **3단계**로 구성됩니다:
1. **1단계**: 점검 (Inspector)
2. **2단계**: 개선이행 (Improvement Manager) - 부적정 시에만
3. **3단계**: 최종점검 (Inspector - 동일인)

### 1.2 주요 역할
- **Inspector (점검자)**: 1단계 점검 및 3단계 최종점검 수행 (동일인)
- **Improvement Manager (개선담당자)**: 2단계 개선이행 수행
- **Approval Manager (승인자)**: 개선계획 승인 (선택적, 결재시스템 연동용)

---

## 2. 상세 프로세스 흐름

### 2.1 1단계: 점검 (Inspector)

#### 목적
- 부서장업무메뉴얼(dept_manager_manuals)의 관리활동 이행 여부 점검

#### 상태 코드
```sql
inspection_status_cd:
  - '01': 미점검 (기본값)
  - '02': 적정
  - '03': 부적정
```

#### 프로세스
```
[시작]
  ↓
inspector_id 지정 (점검자 할당)
  ↓
inspection_status_cd = '01' → '02' 또는 '03'
  ↓
inspection_result_content 작성 (점검결과 내용)
  ↓
inspection_date 기록 (점검일자)
  ↓
[판정]
  - '02' (적정) → 종료 ✅
  - '03' (부적정) → 2단계로 진행
```

#### 필수 필드
- `inspector_id`: 점검자ID
- `inspection_status_cd`: '02' 또는 '03'
- `inspection_date`: 점검일자 (점검완료 시 필수)
- `inspection_result_content`: 점검결과 내용

#### Backend 구현 시 주의사항
1. **검증**: `inspection_status_cd IN ('02', '03')` → `inspection_date` 필수
2. **비즈니스 로직**: 적정('02') 판정 시 2단계는 건너뛰고 프로세스 종료
3. **권한**: 점검자만 점검 수행 가능

---

### 2.2 2단계: 개선이행 (Improvement Manager)

#### 목적
- 부적정 항목에 대한 개선계획 수립 및 이행

#### 상태 코드
```sql
improvement_status_cd:
  - '01': 개선미이행 (기본값)
  - '02': 개선계획 수립
  - '03': 승인요청
  - '04': 개선이행 중
  - '05': 개선완료
```

#### 프로세스
```
[1단계에서 부적정('03') 판정 시 시작]
  ↓
improvement_manager_id 지정 (개선담당자 할당)
  ↓
① improvement_status_cd = '01' → '02' (개선계획 수립)
   - improvement_plan_content 작성 (필수)
   - improvement_plan_date 기록
  ↓
② improvement_status_cd = '02' → '03' (승인요청) [선택적]
   - improvement_plan_approved_by 승인자 지정
   - improvement_plan_approved_date 승인일자 기록
   - (결재시스템 연동 시 사용)
  ↓
③ improvement_status_cd = '03' → '04' (개선이행)
   - improvement_detail_content 작성 (이행 세부내용)
  ↓
④ improvement_status_cd = '04' → '05' (개선완료)
   - improvement_completed_date 기록
  ↓
[3단계로 진행]
```

#### 필수 필드
- `improvement_manager_id`: 개선담당자ID
- `improvement_plan_content`: 개선계획 내용 (상태='02' 이상 시 필수)
- `improvement_plan_date`: 개선계획 수립일자 (상태='02' 이상 시 필수)
- `improvement_completed_date`: 개선완료일자 (상태='05' 시 필수)

#### 선택 필드 (결재시스템 연동용)
- `improvement_plan_approved_by`: 개선계획 승인자ID
- `improvement_plan_approved_date`: 개선계획 승인일자

#### Backend 구현 시 주의사항
1. **검증**: `improvement_status_cd = '05'` → `improvement_completed_date` 필수
2. **권한**: 개선담당자만 개선이행 수행 가능
3. **상태 전환**: 순차적 상태 전환 권장 ('01' → '02' → '03' → '04' → '05')
4. **승인 프로세스**: '03' (승인요청) 단계는 선택적 (결재시스템 구축 후 활성화)

---

### 2.3 3단계: 최종점검 (Inspector)

#### 목적
- 개선완료 항목에 대한 최종 검증 및 승인/반려 결정

#### 상태 코드
```sql
final_inspection_result_cd:
  - NULL: 최종점검 미실시 (기본값)
  - '01': 승인
  - '02': 반려
```

#### 프로세스
```
[2단계에서 개선완료('05') 시 시작]
  ↓
inspector_id가 최종점검 수행 (1단계와 동일한 점검자)
  ↓
final_inspection_result_cd 설정
  ↓
[판정]
  - '01' (승인) → 완전히 종료 ✅
      - is_final_completed = 'Y' (자동 계산)
  - '02' (반려) → 재개선 프로세스 🔄
      - rejection_count 자동 증가 (트리거)
      - 2단계로 되돌아감
```

#### 필수 필드
- `inspector_id`: 점검자ID (1단계와 동일)
- `final_inspection_result_cd`: '01' 또는 '02'
- `final_inspection_date`: 최종점검일자
- `final_inspection_result_content`: 최종점검 결과 내용

#### Backend 구현 시 주의사항
1. **권한**: 1단계 점검자와 동일한 사람만 최종점검 수행 가능
2. **자동 계산**: `is_final_completed` 컬럼은 GENERATED ALWAYS (자동 계산)
3. **트리거**: `rejection_count` 자동 증가 (final_inspection_result_cd = '02' 시)
4. **유연성**: 적정('02') 판정에도 최종점검 가능 (선택적)

---

## 3. 재개선 프로세스 (반려 시)

### 3.1 반려 처리 절차

#### 최종점검 반려 시 (`final_inspection_result_cd = '02'`)
```
[최종점검 반려]
  ↓
rejection_count 자동 증가 (트리거)
  ↓
개선담당자에게 재개선 요청
  ↓
[필수 수정 필드]
  - improvement_status_cd = '02' 또는 '04' (개선계획 또는 개선이행)
  - improvement_plan_content 재작성 (반려 사유 반영, 필수)
  - improvement_plan_date 갱신 (재수립 일자)
  ↓
[선택적 수정 필드]
  - improvement_manager_id (담당자 변경 가능)
  - improvement_detail_content (초기화 또는 보완)
  - improvement_completed_date = NULL (초기화)
  ↓
[승인 관련 필드 초기화]
  - improvement_plan_approved_by = NULL
  - improvement_plan_approved_date = NULL
  ↓
[최종점검 정보는 유지 - 이력 보존]
  - final_inspection_result_cd = '02' (반려 유지)
  - final_inspection_result_content (반려 사유 유지)
  - final_inspection_date (반려 일자 유지)
  - rejection_count (반려 횟수 누적)
  ↓
2단계부터 다시 진행 🔄
```

### 3.2 재승인 처리 절차

#### 재개선 후 재승인 시
```
[개선완료]
  - improvement_status_cd = '05'
  - improvement_completed_date = CURRENT_DATE
  ↓
[최종점검 재승인]
  - final_inspection_result_cd = '01' (승인)
  - final_inspection_result_content = '재개선 내용 확인 완료. 승인'
  - final_inspection_date = CURRENT_DATE
  ↓
is_final_completed = 'Y' (자동 계산)
  ↓
프로세스 완전 종료 ✅
```

### 3.3 Backend 구현 시 주의사항

1. **반려 이력 보존**
   - `rejection_count`는 누적 관리
   - 기존 반려 정보는 유지 (덮어쓰지 않음)
   - 재승인 시에만 최종점검 정보 업데이트

2. **필수 재작업 필드**
   - `improvement_plan_content`: 반드시 재작성
   - `improvement_plan_date`: 반드시 갱신
   - 승인 관련 필드: 초기화 필요

3. **권한 체크**
   - 재개선: 개선담당자만 가능
   - 재승인: 최초 점검자만 가능

4. **상태 전환 검증**
   - 반려 후 상태는 '02' 또는 '04'만 가능
   - '01'(개선미이행)으로 되돌릴 수 없음

---

## 4. 자동 계산 컬럼 (is_final_completed)

### 4.1 계산 로직
```sql
is_final_completed = 'Y' 조건:
  CASE
    WHEN inspection_status_cd = '02' THEN 'Y'  -- 적정 → 완료
    WHEN inspection_status_cd = '03' AND final_inspection_result_cd = '01' THEN 'Y'  -- 부적정 → 개선 → 승인 → 완료
    ELSE 'N'
  END
```

### 4.2 완료 판정 기준
- **적정 판정**: `inspection_status_cd = '02'` → 즉시 완료
- **부적정 후 승인**: `inspection_status_cd = '03'` AND `final_inspection_result_cd = '01'` → 완료
- **그 외**: 미완료 ('N')

### 4.3 Backend 구현 시 주의사항
- PostgreSQL GENERATED ALWAYS 컬럼으로 자동 계산
- Backend에서 직접 설정하지 않음 (읽기 전용)
- 통계 및 조회 시 활용 (완료율 계산 등)

---

## 5. 트리거 로직

### 5.1 rejection_count 자동 증가 트리거
```sql
CREATE OR REPLACE FUNCTION rsms.increment_rejection_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 최종점검결과가 '02'(반려)로 변경되면 반려 횟수 증가
  IF NEW.final_inspection_result_cd = '02' AND
     (OLD.final_inspection_result_cd IS NULL OR OLD.final_inspection_result_cd != '02') THEN
    NEW.rejection_count := COALESCE(OLD.rejection_count, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 트리거 동작 방식
- **조건**: `final_inspection_result_cd`가 NULL 또는 '01'에서 '02'로 변경될 때만
- **동작**: `rejection_count`를 1 증가
- **누적**: 기존 값에 1을 더함 (0부터 시작)

### 5.3 Backend 구현 시 주의사항
- Backend에서 `rejection_count`를 직접 설정하지 않음
- 트리거가 자동으로 처리
- 반려 횟수는 통계 및 모니터링에 활용

---

## 6. 데이터 검증 규칙

### 6.1 필수 필드 검증
```java
// 1단계: 점검완료 시
if (inspectionStatusCd.equals("02") || inspectionStatusCd.equals("03")) {
    Assert.notNull(inspectionDate, "점검일자는 필수입니다.");
}

// 2단계: 개선완료 시
if (improvementStatusCd.equals("05")) {
    Assert.notNull(improvementCompletedDate, "개선완료일자는 필수입니다.");
}
```

### 6.2 상태 전환 검증
```java
// 적정 판정 시 개선이행 불가
if (inspectionStatusCd.equals("02")) {
    Assert.isTrue(improvementStatusCd.equals("01"),
                  "적정 판정 시 개선이행 상태는 '개선미이행'이어야 합니다.");
}

// 부적정 판정 시 개선이행 필수
if (inspectionStatusCd.equals("03")) {
    Assert.notNull(improvementManagerId, "개선담당자 지정이 필요합니다.");
}
```

### 6.3 권한 검증
```java
// 1단계: 점검자 권한
if (inspectionStatusCd != null && !inspectionStatusCd.equals("01")) {
    Assert.isTrue(currentUserId.equals(inspectorId),
                  "점검자만 점검을 수행할 수 있습니다.");
}

// 2단계: 개선담당자 권한
if (!improvementStatusCd.equals("01")) {
    Assert.isTrue(currentUserId.equals(improvementManagerId),
                  "개선담당자만 개선이행을 수행할 수 있습니다.");
}

// 3단계: 점검자 권한 (최초 점검자와 동일)
if (finalInspectionResultCd != null) {
    Assert.isTrue(currentUserId.equals(inspectorId),
                  "최초 점검자만 최종점검을 수행할 수 있습니다.");
}
```

---

## 7. 상태 전환 다이어그램

### 7.1 전체 프로세스 플로우
```
[시작]
  ↓
inspection_status_cd = '01' (미점검)
  ↓
[1단계: 점검]
  ↓
inspection_status_cd = '02' (적정) → [종료] ✅
inspection_status_cd = '03' (부적정)
  ↓
[2단계: 개선이행]
  ↓
improvement_status_cd = '01' (개선미이행)
  ↓
improvement_status_cd = '02' (개선계획)
  ↓
improvement_status_cd = '03' (승인요청) [선택적]
  ↓
improvement_status_cd = '04' (개선이행)
  ↓
improvement_status_cd = '05' (개선완료)
  ↓
[3단계: 최종점검]
  ↓
final_inspection_result_cd = '01' (승인) → [종료] ✅
final_inspection_result_cd = '02' (반려) → [재개선] 🔄
  ↓
rejection_count++
  ↓
improvement_status_cd = '02' or '04'
  ↓
[2단계로 복귀]
```

### 7.2 상태 코드 요약표

| 단계 | 필드명 | 코드 | 의미 | 다음 단계 |
|------|--------|------|------|-----------|
| 1단계 | inspection_status_cd | '01' | 미점검 | 점검 수행 |
| 1단계 | inspection_status_cd | '02' | 적정 | 종료 ✅ |
| 1단계 | inspection_status_cd | '03' | 부적정 | 2단계 진행 |
| 2단계 | improvement_status_cd | '01' | 개선미이행 | 개선계획 수립 |
| 2단계 | improvement_status_cd | '02' | 개선계획 | 승인요청 또는 이행 |
| 2단계 | improvement_status_cd | '03' | 승인요청 | 개선이행 |
| 2단계 | improvement_status_cd | '04' | 개선이행 | 개선완료 |
| 2단계 | improvement_status_cd | '05' | 개선완료 | 3단계 진행 |
| 3단계 | final_inspection_result_cd | NULL | 최종점검 미실시 | 최종점검 수행 |
| 3단계 | final_inspection_result_cd | '01' | 승인 | 종료 ✅ |
| 3단계 | final_inspection_result_cd | '02' | 반려 | 2단계 복귀 🔄 |

---

## 8. Backend Service 구현 가이드

### 8.1 Service 메서드 구조 제안
```java
@Service
public class ImplInspectionItemService {

    // 1단계: 점검 수행
    public void performInspection(String itemId, InspectionDto dto) {
        // 권한 검증
        // 점검 수행
        // 상태 업데이트
    }

    // 2단계: 개선계획 수립
    public void createImprovementPlan(String itemId, ImprovementPlanDto dto) {
        // 권한 검증
        // 개선계획 작성
        // 상태 업데이트 ('01' → '02')
    }

    // 2단계: 개선이행
    public void executeImprovement(String itemId, ImprovementExecutionDto dto) {
        // 권한 검증
        // 개선이행 수행
        // 상태 업데이트 ('04' → '05')
    }

    // 3단계: 최종점검 (승인/반려)
    public void performFinalInspection(String itemId, FinalInspectionDto dto) {
        // 권한 검증 (최초 점검자와 동일)
        // 최종점검 수행
        // 승인 시: 종료
        // 반려 시: 재개선 프로세스 시작
    }

    // 재개선 처리
    public void handleRejection(String itemId, RejectionDto dto) {
        // 반려 이력 보존
        // 필수 필드 초기화
        // 상태 되돌림 ('05' → '02' or '04')
        // 개선계획 재작성
    }
}
```

### 8.2 DTO 구조 제안
```java
// 1단계: 점검 DTO
public class InspectionDto {
    private String inspectorId;
    private String inspectionStatusCd;  // '02' or '03'
    private String inspectionResultContent;
    private LocalDate inspectionDate;
}

// 2단계: 개선계획 DTO
public class ImprovementPlanDto {
    private String improvementManagerId;
    private String improvementPlanContent;  // 필수
    private LocalDate improvementPlanDate;
    private String improvementPlanApprovedBy;  // 선택적
    private LocalDate improvementPlanApprovedDate;  // 선택적
}

// 2단계: 개선이행 DTO
public class ImprovementExecutionDto {
    private String improvementDetailContent;
    private LocalDate improvementCompletedDate;
}

// 3단계: 최종점검 DTO
public class FinalInspectionDto {
    private String finalInspectionResultCd;  // '01' or '02'
    private String finalInspectionResultContent;
    private LocalDate finalInspectionDate;
}

// 재개선 DTO
public class RejectionDto {
    private String improvementPlanContent;  // 재작성 필수
    private LocalDate improvementPlanDate;  // 갱신 필수
    private String improvementManagerId;  // 담당자 변경 가능
}
```

### 8.3 상태 전환 검증 로직
```java
@Component
public class InspectionStatusValidator {

    // 점검 상태 전환 검증
    public void validateInspectionTransition(
        String currentStatus, String newStatus) {

        if ("01".equals(currentStatus)) {
            // 미점검 → 적정/부적정만 가능
            Assert.isTrue("02".equals(newStatus) || "03".equals(newStatus),
                         "미점검 상태에서는 적정 또는 부적정으로만 전환 가능합니다.");
        }
    }

    // 개선이행 상태 전환 검증
    public void validateImprovementTransition(
        String currentStatus, String newStatus) {

        // 순차적 상태 전환 검증
        int currentCode = Integer.parseInt(currentStatus);
        int newCode = Integer.parseInt(newStatus);

        Assert.isTrue(newCode == currentCode + 1 || newCode == currentCode,
                     "개선이행 상태는 순차적으로만 전환 가능합니다.");
    }

    // 권한 검증
    public void validateAuthority(
        String currentUserId, String requiredUserId, String action) {

        Assert.isTrue(currentUserId.equals(requiredUserId),
                     action + "을(를) 수행할 권한이 없습니다.");
    }
}
```

---

## 9. 조회 쿼리 예시

### 9.1 진행 중인 이행점검 항목 조회
```sql
-- 미완료 항목만 조회
SELECT *
FROM rsms.impl_inspection_items
WHERE is_final_completed = 'N'
  AND is_active = 'Y'
ORDER BY created_at DESC;
```

### 9.2 부적정 항목 중 개선 필요 항목 조회
```sql
-- 부적정 판정 후 개선 미완료 항목
SELECT *
FROM rsms.impl_inspection_items
WHERE inspection_status_cd = '03'
  AND improvement_status_cd IN ('01', '02', '04')  -- 개선 미완료
  AND is_active = 'Y'
ORDER BY inspection_date DESC;
```

### 9.3 반려 횟수별 통계
```sql
-- 반려 횟수별 항목 수 집계
SELECT rejection_count, COUNT(*) as count
FROM rsms.impl_inspection_items
WHERE is_active = 'Y'
GROUP BY rejection_count
ORDER BY rejection_count;
```

### 9.4 담당자별 처리 현황
```sql
-- 개선담당자별 처리 현황
SELECT
    improvement_manager_id,
    COUNT(*) as total,
    SUM(CASE WHEN improvement_status_cd = '05' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN improvement_status_cd IN ('02', '04') THEN 1 ELSE 0 END) as in_progress
FROM rsms.impl_inspection_items
WHERE inspection_status_cd = '03'
  AND is_active = 'Y'
GROUP BY improvement_manager_id;
```

---

## 10. 주요 비즈니스 규칙 요약

### 10.1 필수 준수 규칙
1. **점검자 동일성**: 1단계 점검자와 3단계 최종점검자는 동일인
2. **순차적 상태 전환**: 각 단계의 상태는 순차적으로만 전환 (역행 불가)
3. **필수 필드 검증**: 상태 전환 시 관련 필드 입력 필수
4. **권한 검증**: 각 단계별 담당자만 해당 작업 수행 가능
5. **반려 이력 보존**: 반려 정보는 덮어쓰지 않고 보존

### 10.2 선택적 규칙
1. **승인 프로세스**: '03'(승인요청) 단계는 선택적 (결재시스템 연동 시 활성화)
2. **최종점검 범위**: 적정 판정에도 최종점검 가능 (필수 아님)
3. **담당자 변경**: 반려 후 재개선 시 개선담당자 변경 가능

### 10.3 자동 처리 규칙
1. **is_final_completed**: PostgreSQL GENERATED ALWAYS로 자동 계산
2. **rejection_count**: 트리거로 자동 증가
3. **updated_at**: 트리거로 자동 갱신

---

## 11. API 엔드포인트 설계 제안

### 11.1 RESTful API 구조
```
# 1단계: 점검
PUT /api/impl-inspections/{itemId}/inspect
  Request Body: InspectionDto
  Response: ImplInspectionItemDto

# 2단계: 개선계획 수립
PUT /api/impl-inspections/{itemId}/improvement-plan
  Request Body: ImprovementPlanDto
  Response: ImplInspectionItemDto

# 2단계: 개선이행
PUT /api/impl-inspections/{itemId}/improvement-execution
  Request Body: ImprovementExecutionDto
  Response: ImplInspectionItemDto

# 3단계: 최종점검 (승인/반려)
PUT /api/impl-inspections/{itemId}/final-inspection
  Request Body: FinalInspectionDto
  Response: ImplInspectionItemDto

# 재개선 처리
PUT /api/impl-inspections/{itemId}/re-improvement
  Request Body: RejectionDto
  Response: ImplInspectionItemDto

# 조회
GET /api/impl-inspections/{itemId}
  Response: ImplInspectionItemDto

GET /api/impl-inspections
  Query Params: status, inspectorId, improvementManagerId, etc.
  Response: Page<ImplInspectionItemDto>
```

---

## 12. 참고 자료

### 12.1 관련 테이블
- `impl_inspection_items`: 이행점검항목 (메인 테이블)
- `impl_inspection_plans`: 이행점검계획
- `dept_manager_manuals`: 부서장업무메뉴얼
- `common_code_details`: 공통코드 (상태 코드 등)

### 12.2 관련 SQL 스크립트
- `/database/scripts/27.create_table_impl_inspection_items.sql`
- `/database/scripts/25.create_table_dept_manager_manuals.sql`

### 12.3 참고 문서
- RSMS 프로젝트 CLAUDE.md
- BACKEND_ARCHITECTURE.md
- BACKEND_DEVELOPMENT_GUIDE.md

---

## 변경 이력
- 2025-11-10: 최초 작성 (User + Claude AI)
