# 🤖 Claude Code 설정 디렉토리

## 📌 개요
이 디렉토리는 Claude Code가 RSMS 프로젝트를 개발할 때 자동으로 참조하는 핵심 설정과 가이드를 포함합니다.

## 📂 파일 구조 및 용도

### 필수 참조 문서 (우선순위 순)
1. **QUICK_REFERENCE.md** - ⚡ 1분 안에 확인 가능한 핵심 사항
2. **PROJECT_CONFIG.md** - 📋 세션별 체크리스트와 자동 실행 가이드
3. **../DEVELOPMENT_GUIDE.md** - 🎯 상세 개발 가이드 (절대 금지사항 포함)
4. **../BEST_PRACTICES.md** - 🏆 구체적인 코드 예시와 패턴
5. **../CODING_STYLE_GUIDE.md** - 📝 코딩 스타일 규칙

## 🚀 Claude Code 세션 시작 프로세스

### 1단계: 빠른 확인 (30초)
```bash
cat .claude/QUICK_REFERENCE.md
```
- 절대 금지 사항 확인
- 핵심 원칙 숙지

### 2단계: 체크리스트 실행 (1분)
```bash
cat .claude/PROJECT_CONFIG.md
```
- 세션 시작 체크리스트 확인
- 개발 전/중/후 체크리스트 준비

### 3단계: 개발 시작
```bash
# 필요시 상세 가이드 참조
cat DEVELOPMENT_GUIDE.md  # 문제 발생 시
cat BEST_PRACTICES.md     # 코드 작성 시
```

## ⚠️ 중요 규칙

### Claude Code가 반드시 지켜야 할 규칙
1. **매 세션 시작 시 QUICK_REFERENCE.md 확인**
2. **코드 작성 전 "절대 금지" 사항 확인**
3. **기존 코드 패턴 분석 후 작업**
4. **체크리스트 기반 검증**

### 자동화된 워크플로
```yaml
session_workflow:
  start:
    - Read QUICK_REFERENCE.md
    - Check PROJECT_CONFIG.md checklist
    - Analyze existing code patterns
  
  during:
    - Follow DEVELOPMENT_GUIDE.md principles
    - Apply BEST_PRACTICES.md patterns
    - Validate with checklists
  
  end:
    - Run style checks
    - Verify no forbidden patterns
    - Update documentation if needed
```

## 📊 품질 보증 메트릭

### 코드 품질 자동 검증
```bash
# Frontend
- 인라인 스타일 0건
- any 타입 0건
- 컴포넌트 < 500줄

# Backend
- Controller < 300줄
- Service 중복 < 5%
- 트랜잭션 명확성 100%
```

## 🔄 업데이트 정책

### 문서 업데이트 시기
- 새로운 문제 패턴 발견 시
- 베스트 프랙티스 개선 시
- 프로젝트 구조 변경 시

### 업데이트 방법
1. 변경사항을 해당 문서에 반영
2. 버전 및 날짜 업데이트
3. QUICK_REFERENCE.md에 핵심 사항 추가

## 💡 활용 팁

### 효율적인 개발을 위한 팁
1. **QUICK_REFERENCE.md를 항상 열어두기**
2. **체크리스트를 TodoWrite 도구와 연동**
3. **문제 발생 시 즉시 가이드 참조**
4. **코드 리뷰 시 체크리스트 활용**

## 📝 문서 버전 정보

| 문서 | 버전 | 최종 업데이트 |
|------|------|--------------|
| QUICK_REFERENCE.md | 1.0.0 | 2025-09-03 |
| PROJECT_CONFIG.md | 1.0.0 | 2025-09-03 |
| DEVELOPMENT_GUIDE.md | 1.0.0 | 2025-09-03 |
| BEST_PRACTICES.md | 1.0.0 | 2025-09-03 |
| CODING_STYLE_GUIDE.md | 1.0.0 | 2025-09-03 |

---

**🔔 이 설정은 Claude Code의 핵심 운영 가이드입니다**  
**모든 개발 세션에서 이 문서들을 참조하여 일관된 품질을 유지하세요**

---
*Claude Code Configuration v1.0.0*  
*RSMS Project Development Standards*