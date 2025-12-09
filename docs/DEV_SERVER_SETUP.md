# RSMS 개발 서버 설정 가이드

우분투 서버에 RSMS 프로젝트(Backend + Frontend)를 설정하는 완전 가이드입니다.

---

## 목차

1. [필요한 소프트웨어](#필요한-소프트웨어)
2. [Phase 1: 시스템 업데이트](#phase-1-시스템-업데이트)
3. [Phase 2: Java 21 설치](#phase-2-java-21-설치)
4. [Phase 3: Node.js 20 설치](#phase-3-nodejs-20-설치)
5. [Phase 4: PostgreSQL 15 설치](#phase-4-postgresql-15-설치)
6. [Phase 5: 프로젝트 소스 코드 가져오기](#phase-5-프로젝트-소스-코드-가져오기)
7. [Phase 6: Backend 설정 및 실행](#phase-6-backend-설정-및-실행)
8. [Phase 7: Frontend 설정 및 실행](#phase-7-frontend-설정-및-실행)
9. [Phase 8: 방화벽 설정](#phase-8-방화벽-설정)
10. [Phase 9: 서비스 자동 시작 설정](#phase-9-서비스-자동-시작-설정)
11. [Phase 10: 최종 확인](#phase-10-최종-확인)
12. [문제 해결](#문제-해결)

---

## 필요한 소프트웨어

| 구분 | 소프트웨어 | 버전 | 용도 |
|------|-----------|------|------|
| Backend | Java | 21 (LTS) | Spring Boot 3.3.5 실행 |
| Backend | Gradle | 8.5+ | 빌드 도구 (Wrapper 포함) |
| Frontend | Node.js | 20+ (LTS) | React 개발 서버 |
| Frontend | npm | 10+ | 패키지 관리 |
| Database | PostgreSQL | 15+ | 데이터베이스 |
| 버전관리 | Git | 최신 | 소스 코드 관리 |

---

## Phase 1: 시스템 업데이트

```bash
# 시스템 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# 기본 필수 도구 설치
sudo apt install -y curl wget git build-essential software-properties-common
```

---

## Phase 2: Java 21 설치

### Eclipse Temurin JDK 21 설치 (권장)

```bash
# 1. 필수 패키지 설치
sudo apt install -y wget apt-transport-https

# 2. GPG 키 추가
wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/trusted.gpg.d/adoptium.asc

# 3. 저장소 추가
echo "deb https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list

# 4. 패키지 목록 업데이트 및 Java 21 설치
sudo apt update
sudo apt install -y temurin-21-jdk

# 5. 설치 확인
java -version
# 출력 예시: openjdk version "21.0.x" ...
```

### 환경 변수 설정

```bash
# JAVA_HOME 환경변수 설정
echo 'export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 환경변수 확인
echo $JAVA_HOME
# 출력: /usr/lib/jvm/temurin-21-jdk-amd64
```

---

## Phase 3: Node.js 20 설치

```bash
# 1. NodeSource 저장소 추가 (Node.js 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 2. Node.js 설치
sudo apt install -y nodejs

# 3. 설치 확인
node -v   # v20.x.x
npm -v    # 10.x.x
```

---

## Phase 4: PostgreSQL 15 설치

### PostgreSQL 설치

```bash
# 1. PostgreSQL 공식 저장소 추가
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# 2. GPG 키 추가
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# 3. PostgreSQL 15 설치
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# 4. 서비스 시작 및 자동 시작 설정
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. 상태 확인
sudo systemctl status postgresql
```

### 데이터베이스 설정

```bash
# postgres 사용자로 전환하여 psql 실행
sudo -u postgres psql
```

```sql
-- 비밀번호 설정
ALTER USER postgres WITH PASSWORD '1q2w3e4r!';

-- rsms 스키마 생성
CREATE SCHEMA IF NOT EXISTS rsms;

-- 권한 부여
GRANT ALL PRIVILEGES ON SCHEMA rsms TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

-- 스키마 확인
\dn

-- 종료
\q
```

### PostgreSQL 원격 접속 설정 (필요시)

```bash
# 1. postgresql.conf 수정
sudo nano /etc/postgresql/15/main/postgresql.conf
```

아래 라인을 찾아서 수정:
```
listen_addresses = '*'    # 기존: 'localhost'
```

```bash
# 2. pg_hba.conf 수정 (접근 허용 IP 설정)
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

파일 맨 아래에 추가:
```
# 내부 네트워크만 허용 (권장)
host    all    all    192.168.0.0/24    md5

# 또는 모든 IP 허용 (개발용, 보안 주의)
host    all    all    0.0.0.0/0    md5
```

```bash
# 3. PostgreSQL 재시작
sudo systemctl restart postgresql
```

---

## Phase 5: 프로젝트 소스 코드 가져오기

### 프로젝트 디렉토리 생성

```bash
# 프로젝트 디렉토리 생성 및 권한 설정
sudo mkdir -p /opt/rsms
sudo chown $USER:$USER /opt/rsms
cd /opt/rsms
```

### 소스 코드 가져오기

**방법 1: Git Clone (저장소가 있는 경우)**
```bash
git clone <your-git-repository-url> .
```

**방법 2: SCP로 파일 전송 (로컬에서 실행)**
```bash
# 로컬 PC에서 실행
scp -r /path/to/RSMS/* user@<서버IP>:/opt/rsms/
```

**방법 3: rsync 사용 (대용량 파일에 권장)**
```bash
# 로컬 PC에서 실행
rsync -avz --progress /path/to/RSMS/ user@<서버IP>:/opt/rsms/
```

---

## Phase 6: Backend 설정 및 실행

### 개발 서버용 설정 파일 생성

```bash
cd /opt/rsms/backend/src/main/resources
nano application-dev.yml
```

**application-dev.yml 내용:**

```yaml
# Development Server Configuration
# 개발 서버 환경 전용 설정

spring:
  # Database Configuration (개발 서버 PostgreSQL)
  datasource:
    url: jdbc:postgresql://localhost:5432/postgres
    username: postgres
    password: 1q2w3e4r!
    hikari:
      pool-name: RSMS-HikariPool-Dev
      maximum-pool-size: 20
      minimum-idle: 5
      idle-timeout: 300000
      connection-timeout: 20000
      leak-detection-threshold: 60000
      connection-init-sql: SET search_path TO rsms, public

  # JPA Configuration
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
        show_sql: true

  # Flyway Configuration (데이터베이스 마이그레이션)
  flyway:
    enabled: true
    baseline-on-migrate: true
    baseline-version: 0
    locations: classpath:db/migration

# Logging Configuration
logging:
  level:
    root: INFO
    com.rsms: DEBUG
    org.springframework.web: INFO
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG
  file:
    name: logs/rsms-backend-dev.log
    max-size: 100MB
    max-history: 30

# Management Endpoints (Actuator)
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics

# RSMS Custom Properties
rsms:
  cors:
    allowed-origins:
      - http://localhost:4000
      - http://localhost:5173
      # 개발 서버 IP로 변경 필요
      - http://<개발서버IP>:4000
      - http://<개발서버IP>:5173
  file:
    upload-dir: /opt/rsms/uploads
    max-size: 50MB
```

### Backend 빌드

```bash
# 1. Backend 디렉토리로 이동
cd /opt/rsms/backend

# 2. Gradle Wrapper에 실행 권한 부여
chmod +x gradlew

# 3. 프로젝트 빌드 (테스트 스킵)
./gradlew clean build -x test

# 4. 빌드 결과 확인
ls -la build/libs/
# rsms-backend-0.0.1-SNAPSHOT.jar 파일이 있어야 함
```

### Backend 실행

**방법 1: Gradle로 실행 (개발 중 권장)**
```bash
./gradlew bootRun -Dspring.profiles.active=dev
```

**방법 2: JAR 파일로 실행**
```bash
java -jar -Dspring.profiles.active=dev build/libs/rsms-backend-0.0.1-SNAPSHOT.jar
```

**방법 3: 백그라운드 실행**
```bash
nohup java -jar -Dspring.profiles.active=dev build/libs/rsms-backend-0.0.1-SNAPSHOT.jar > logs/backend.log 2>&1 &
```

### Backend 실행 확인

```bash
# Health Check
curl http://localhost:8090/actuator/health
# 정상 응답: {"status":"UP"}

# Swagger UI 확인
# 브라우저: http://<개발서버IP>:8090/swagger-ui.html
```

---

## Phase 7: Frontend 설정 및 실행

### 의존성 설치

```bash
cd /opt/rsms/frontend
npm install
```

### 환경 변수 설정

```bash
nano .env.development
```

**.env.development 내용:**
```bash
# API Server URL (Backend 주소)
VITE_API_URL=http://localhost:8090

# 외부에서 접속하는 경우 서버 IP 사용:
# VITE_API_URL=http://<개발서버IP>:8090

# 환경
VITE_APP_ENV=development
```

### Frontend 실행

```bash
# 개발 서버 실행 (외부 접속 허용)
npm run dev -- --host 0.0.0.0

# 또는 특정 포트 지정
npm run dev -- --host 0.0.0.0 --port 4000
```

### Frontend 접속 확인

```
브라우저: http://<개발서버IP>:4000
```

---

## Phase 8: 방화벽 설정

```bash
# UFW (Uncomplicated Firewall) 설정
sudo ufw allow 22      # SSH
sudo ufw allow 4000    # Frontend (Vite)
sudo ufw allow 8090    # Backend (Spring Boot)
sudo ufw allow 5432    # PostgreSQL (원격 접속 필요시)

# 방화벽 활성화
sudo ufw enable

# 상태 확인
sudo ufw status verbose
```

---

## Phase 9: 서비스 자동 시작 설정

### Backend: Systemd 서비스

```bash
sudo nano /etc/systemd/system/rsms-backend.service
```

**rsms-backend.service 내용:**
```ini
[Unit]
Description=RSMS Backend Spring Boot Application
After=network.target postgresql.service

[Service]
User=<your-username>
Group=<your-username>
WorkingDirectory=/opt/rsms/backend
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=dev /opt/rsms/backend/build/libs/rsms-backend-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

# 환경 변수
Environment=JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64

# 로그 설정
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 등록 및 시작
sudo systemctl daemon-reload
sudo systemctl enable rsms-backend
sudo systemctl start rsms-backend

# 상태 확인
sudo systemctl status rsms-backend
```

### Frontend: PM2 사용 (권장)

```bash
# 1. PM2 전역 설치
sudo npm install -g pm2

# 2. Frontend 시작
cd /opt/rsms/frontend
pm2 start "npm run dev -- --host 0.0.0.0" --name rsms-frontend

# 3. PM2 상태 확인
pm2 status

# 4. 시스템 시작 시 자동 실행 설정
pm2 startup
# 출력되는 sudo 명령어 실행

pm2 save
```

### 서비스 관리 명령어

**Backend (Systemd):**
```bash
sudo systemctl start rsms-backend      # 시작
sudo systemctl stop rsms-backend       # 중지
sudo systemctl restart rsms-backend    # 재시작
sudo systemctl status rsms-backend     # 상태 확인
sudo journalctl -u rsms-backend -f     # 로그 확인
```

**Frontend (PM2):**
```bash
pm2 start rsms-frontend     # 시작
pm2 stop rsms-frontend      # 중지
pm2 restart rsms-frontend   # 재시작
pm2 status                  # 상태 확인
pm2 logs rsms-frontend      # 로그 확인
pm2 monit                   # 모니터링 대시보드
```

---

## Phase 10: 최종 확인

### 서비스 상태 확인

```bash
# 1. PostgreSQL 확인
sudo systemctl status postgresql
psql -U postgres -h localhost -c "SELECT version();"

# 2. Backend 확인
curl http://localhost:8090/actuator/health
# 정상: {"status":"UP"}

# 3. Frontend 확인
curl -I http://localhost:4000
# 정상: HTTP/1.1 200 OK
```

### 웹 브라우저 접속 확인

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | `http://<개발서버IP>:4000` | React 애플리케이션 |
| Backend API | `http://<개발서버IP>:8090/swagger-ui.html` | Swagger API 문서 |
| Actuator | `http://<개발서버IP>:8090/actuator/health` | 헬스 체크 |

---

## 문제 해결

### Java 버전 문제

```bash
# 여러 Java 버전이 설치된 경우
sudo update-alternatives --config java
# 21 버전 선택

# JAVA_HOME 재설정
export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk-amd64
```

### PostgreSQL 연결 실패

```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 로그 확인
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# 연결 테스트
psql -U postgres -h localhost -d postgres
```

### Backend 시작 실패

```bash
# 로그 확인
sudo journalctl -u rsms-backend -f

# 또는 직접 실행하여 에러 확인
cd /opt/rsms/backend
java -jar -Dspring.profiles.active=dev build/libs/rsms-backend-0.0.1-SNAPSHOT.jar
```

### Frontend 시작 실패

```bash
# node_modules 재설치
cd /opt/rsms/frontend
rm -rf node_modules package-lock.json
npm install

# 포트 충돌 확인
sudo lsof -i :4000
```

### 포트 사용 중

```bash
# 특정 포트 사용 프로세스 확인
sudo lsof -i :<포트번호>

# 프로세스 종료
sudo kill -9 <PID>
```

---

## 요약 체크리스트

| 순서 | 항목 | 확인 명령어 | 예상 결과 |
|------|------|------------|----------|
| 1 | 시스템 업데이트 | `apt list --upgradable` | 업데이트 없음 |
| 2 | Java 21 | `java -version` | openjdk 21.x.x |
| 3 | Node.js 20 | `node -v` | v20.x.x |
| 4 | PostgreSQL 15 | `psql --version` | psql 15.x |
| 5 | DB 스키마 | `\dn` (psql) | rsms 스키마 존재 |
| 6 | Backend 빌드 | `ls build/libs/*.jar` | JAR 파일 존재 |
| 7 | Backend 실행 | `curl localhost:8090/actuator/health` | {"status":"UP"} |
| 8 | Frontend 설치 | `ls node_modules` | 폴더 존재 |
| 9 | Frontend 실행 | `curl -I localhost:4000` | HTTP 200 |
| 10 | 방화벽 | `sudo ufw status` | 포트 허용됨 |

---

## 주의사항

1. **보안**: 개발 서버라도 비밀번호(`1q2w3e4r!`)는 운영 전 반드시 변경
2. **PostgreSQL 원격 접속**: 내부 네트워크만 허용하도록 IP 제한 권장
3. **로그 관리**: `/opt/rsms/backend/logs/` 디렉토리 용량 주기적 확인
4. **백업**: 정기적인 데이터베이스 백업 스케줄 설정 권장
5. **SSL/TLS**: 운영 환경에서는 HTTPS 설정 필수

---

**문서 버전**: 1.0
**최종 수정일**: 2025-12-09
**작성자**: Claude AI



진짜 간단 버전 (복사해서 순서대로 실행)
1단계: 기본 설치 (5분)
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git
2단계: Java 21 설치 (3분)
wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo tee /etc/apt/trusted.gpg.d/adoptium.asc
echo "deb https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/adoptium.list
sudo apt update && sudo apt install -y temurin-21-jdk

# 확인
java -version
3단계: Node.js 20 설치 (2분)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 확인
node -v
4단계: PostgreSQL 15 설치 (5분)
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update && sudo apt install -y postgresql-15

# DB 설정
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '1q2w3e4r!';"
sudo -u postgres psql -c "CREATE SCHEMA IF NOT EXISTS rsms;"
5단계: 프로젝트 실행 (5분)
# 소스 복사 (로컬 PC에서)
scp -r /home/rocosoo/RSMS user@서버IP:/opt/rsms/

# Backend 실행
cd /opt/rsms/backend
chmod +x gradlew
./gradlew bootRun -Dspring.profiles.active=dev

# Frontend 실행 (새 터미널)
cd /opt/rsms/frontend
npm install
npm run dev -- --host 0.0.0.0



경로 상관없이 실행 가능한 명령어
# 이런 것들은 아무 경로에서나 OK
sudo apt update
sudo apt install -y curl wget git
java -version
node -v
특정 경로에서 실행해야 하는 명령어
# Backend 실행 → backend 폴더에서
cd /opt/rsms/backend
./gradlew bootRun

# Frontend 실행 → frontend 폴더에서  
cd /opt/rsms/frontend
npm install
npm run dev
핵심 요약
명령어 종류	경로 상관?	예시
apt install, sudo	아무데서나 OK	시스템 설치
java -version, node -v	아무데서나 OK	버전 확인
./gradlew, npm	해당 폴더에서	프로젝트 실행
터미널 열면 보통 /home/유저명 (홈 디렉토리)에서 시작해요. 거기서 1~4단계 다 실행하고, 5단계에서만 cd 명령어로 폴더 이동하면 됩니다!
