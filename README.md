# ProPlan

프로젝트 플래너 애플리케이션

## 사전 요구사항

- Node.js (v18 이상)
- PostgreSQL 데이터베이스

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 데이터베이스 설정

`.env` 파일을 생성하고 PostgreSQL 데이터베이스 연결 정보를 설정하세요:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PORT=5000
NODE_ENV=development
```

### 3. 데이터베이스 마이그레이션

데이터베이스 스키마를 생성합니다:

```bash
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:3000` (또는 `.env` 파일에 설정한 PORT)으로 접속할 수 있습니다.

**참고**: 포트 5000이 이미 사용 중인 경우, `.env` 파일에서 `PORT`를 다른 포트(예: 3000)로 변경하세요.

## 스크립트

- `npm run dev` - 개발 서버 실행 (서버 + 클라이언트)
- `npm run dev:client` - 클라이언트만 실행 (포트 5000)
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 모드 실행
- `npm run db:push` - 데이터베이스 스키마 푸시
- `npm run check` - TypeScript 타입 체크

## 프로젝트 구조

- `client/` - React 클라이언트 애플리케이션
- `server/` - Express 서버
- `shared/` - 공유 스키마 및 타입

# proplan
