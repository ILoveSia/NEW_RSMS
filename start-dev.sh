#!/bin/bash

echo "========================================="
echo "RSMS 개발 환경 시작"
echo "========================================="

# PostgreSQL 상태 확인
echo "1. PostgreSQL 상태 확인..."
sudo systemctl status postgresql --no-pager | head -5

# Backend 시작 (백그라운드)
echo ""
echo "2. Backend 서버 시작..."
cd backend
./gradlew bootRun &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Frontend 시작을 위한 대기
echo ""
echo "3. Backend 초기화 대기 (10초)..."
sleep 10

# Frontend 시작 (포그라운드)
echo ""
echo "4. Frontend 서버 시작..."
cd ../frontend
npm run dev

# 종료 시 Backend 프로세스도 종료
trap "kill $BACKEND_PID" EXIT