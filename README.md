# 🏀 Streetball Frontend

농구 게임 매칭 플랫폼 프론트엔드

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React Router** - 클라이언트 사이드 라우팅
- **Zustand** - 상태 관리
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Axios** - HTTP 클라이언트
- **Kakao Map API** - 지도 서비스

## 프로젝트 구조

```
src/
├── apis/          # API 통신 관련 (axios, authApi, gameApi)
├── components/    # 재사용 가능한 컴포넌트 (Modal, GameModal 등)
├── hooks/         # 커스텀 훅 (useGeolocation, useKakaoMap)
├── pages/         # 페이지 컴포넌트 (LoginPage, RegisterPage, MapPage)
├── routes/        # 라우팅 설정
├── store/         # Zustand 상태 관리 (authStore, gameStore)
├── styles/        # 전역 스타일
└── types/         # TypeScript 타입 정의
```

## 주요 기능

### 1. 인증
- 로그인 / 회원가입
- JWT 토큰 기반 인증
- 자동 로그인 (localStorage)

### 2. 지도
- Kakao Map API를 사용한 지도 표시
- 사용자 현재 위치 기반 지도 중심 설정
- 근처 게임 마커 표시

### 3. 게임 관리
- **게임 생성**: 제목, 설명, 날짜, 시간, 최대 인원 설정
- **근처 게임 검색**: 반경 5km 내 게임 검색
- **게임 참여/나가기**: 모집 중인 게임에 참여
- **실시간 인원 업데이트**: 현재 참여 인원 표시

### 4. 위치 기반
- Geolocation API를 사용한 사용자 위치 추적
- 서버에 위치 정보 업데이트
- 위치 권한 거부 시 기본 위치(서울 시청) 사용

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_KAKAO_APP_KEY=YOUR_KAKAO_MAP_APP_KEY
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드

```bash
npm run build
```

### 5. 프리뷰

```bash
npm run preview
```

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/logout` - 로그아웃
- `PUT /api/auth/location` - 사용자 위치 업데이트

### 게임
- `GET /api/games/nearby` - 근처 게임 검색
- `POST /api/games` - 게임 생성
- `GET /api/games/:id` - 게임 상세 조회
- `POST /api/games/:id/join` - 게임 참여
- `POST /api/games/:id/leave` - 게임 나가기
- `DELETE /api/games/:id` - 게임 삭제

## 개발 가이드

### Path Alias
`@` 경로는 `src/` 디렉토리를 가리킵니다.

```typescript
import { User } from '@/types';
import api from '@/apis/axios';
```

### 코드 포맷팅
```bash
npm run format
```

### 린팅
```bash
npm run lint
```

## 라이센스

MIT