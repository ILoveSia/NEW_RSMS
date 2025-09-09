#!/bin/bash

echo "========================================"
echo "RSMS 개발 환경 자동 설정"
echo "========================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수: 성공 메시지
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 함수: 오류 메시지
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 함수: 정보 메시지
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Node.js 버전 확인
print_info "Node.js 버전 확인 중..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION 설치됨"
else
    print_error "Node.js가 설치되지 않았습니다. Node.js 18+ 버전을 설치해주세요."
    exit 1
fi

# 2. Java 버전 확인
print_info "Java 버전 확인 중..."
if command -v java >/dev/null 2>&1; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    print_success "Java 설치됨: $JAVA_VERSION"
else
    print_error "Java가 설치되지 않았습니다. OpenJDK 21 버전을 설치해주세요."
    exit 1
fi

# 3. 루트 의존성 설치
print_info "루트 프로젝트 의존성 설치 중..."
if npm install; then
    print_success "루트 의존성 설치 완료"
else
    print_error "루트 의존성 설치 실패"
    exit 1
fi

# 4. Frontend 설정
print_info "Frontend 환경 설정 중..."
if [ -d "frontend" ]; then
    cd frontend
    if npm install; then
        print_success "Frontend 의존성 설치 완료"
        
        # ESLint 설정 확인
        if [ -f ".eslintrc.json" ]; then
            print_success "ESLint 설정 확인됨"
        else
            print_warning "ESLint 설정 파일이 없습니다"
        fi
        
        # Prettier 설정 확인
        if [ -f ".prettierrc.json" ]; then
            print_success "Prettier 설정 확인됨"
        else
            print_warning "Prettier 설정 파일이 없습니다"
        fi
    else
        print_error "Frontend 의존성 설치 실패"
        exit 1
    fi
    cd ..
else
    print_warning "frontend 디렉토리가 없습니다"
fi

# 5. Backend 설정
print_info "Backend 환경 설정 중..."
if [ -d "backend" ]; then
    cd backend
    if [ -f "gradlew" ]; then
        chmod +x gradlew
        print_success "Gradle wrapper 실행 권한 부여"
        
        # Gradle 빌드 테스트
        if ./gradlew build -x test; then
            print_success "Backend 빌드 테스트 완료"
        else
            print_warning "Backend 빌드에 문제가 있을 수 있습니다"
        fi
        
        # Checkstyle 설정 확인
        if [ -f "config/checkstyle/checkstyle.xml" ]; then
            print_success "Checkstyle 설정 확인됨"
        else
            print_warning "Checkstyle 설정 파일이 없습니다"
        fi
    else
        print_error "gradlew 파일이 없습니다"
    fi
    cd ..
else
    print_warning "backend 디렉토리가 없습니다"
fi

# 6. Git hooks 설정
print_info "Git hooks 설정 중..."
if [ -d ".git" ]; then
    if npm run prepare; then
        print_success "Git hooks 설정 완료"
    else
        print_error "Git hooks 설정 실패"
    fi
    
    # Pre-commit hook 실행 권한 확인
    if [ -f ".husky/pre-commit" ]; then
        chmod +x .husky/pre-commit
        print_success "Pre-commit hook 실행 권한 설정"
    fi
    
    # Pre-push hook 실행 권한 확인
    if [ -f ".husky/pre-push" ]; then
        chmod +x .husky/pre-push
        print_success "Pre-push hook 실행 권한 설정"
    fi
else
    print_warning "Git 저장소가 초기화되지 않았습니다"
fi

# 7. EditorConfig 확인
if [ -f ".editorconfig" ]; then
    print_success "EditorConfig 설정 확인됨"
else
    print_warning "EditorConfig 파일이 없습니다"
fi

# 8. VS Code 설정 확인
if [ -d ".vscode" ]; then
    print_success "VS Code 설정 디렉토리 확인됨"
    if [ -f ".vscode/settings.json" ]; then
        print_success "VS Code 설정 파일 확인됨"
    fi
    if [ -f ".vscode/extensions.json" ]; then
        print_success "VS Code 확장 권장사항 확인됨"
    fi
else
    print_warning "VS Code 설정 디렉토리가 없습니다"
fi

# 9. 코드 스타일 검사 테스트
print_info "코드 스타일 검사 시스템 테스트 중..."

# Frontend 린팅 테스트
if [ -d "frontend" ]; then
    cd frontend
    if npm run lint:check >/dev/null 2>&1; then
        print_success "Frontend 린팅 시스템 정상 작동"
    else
        print_warning "Frontend 린팅 시스템에 문제가 있을 수 있습니다"
    fi
    cd ..
fi

# Backend 린팅 테스트
if [ -d "backend" ]; then
    cd backend
    if ./gradlew checkstyleMain checkstyleTest >/dev/null 2>&1; then
        print_success "Backend Checkstyle 시스템 정상 작동"
    else
        print_warning "Backend Checkstyle 시스템에 문제가 있을 수 있습니다"
    fi
    cd ..
fi

echo ""
echo "========================================"
echo "🎉 개발 환경 설정 완료!"
echo "========================================"
print_info "다음 명령어로 개발을 시작할 수 있습니다:"
echo ""
echo "  💻 전체 개발 환경 실행:"
echo "     npm run dev"
echo ""
echo "  🔷 Frontend만 실행:"
echo "     npm run dev:frontend"
echo ""
echo "  ☕ Backend만 실행:"
echo "     npm run dev:backend"
echo ""
echo "  🔍 코드 스타일 검사:"
echo "     npm run style:check"
echo ""
echo "  ✨ 코드 스타일 자동 수정:"
echo "     npm run style:fix"
echo ""
print_info "자세한 사용법은 CODING_STYLE_GUIDE.md를 참고하세요!"
echo ""