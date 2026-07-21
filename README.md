# nolitour-frontend

놀이투어(Nolitour) 웹 프론트엔드 — React + TypeScript + Vite

추후 앱 전환(React Native 등)을 고려해 상태/데이터 로직은 UI와 분리해 둘 것.

## 로컬 개발

```bash
npm install
cp .env.example .env  # VITE_NAVER_MAP_CLIENT_ID 등 채우기
npm run dev
```

## 구조

```
src/
  api/       # axios 클라이언트, 백엔드 API 호출
  components/# NaverMap 등 재사용 컴포넌트
  pages/     # 라우트 단위 페이지
  hooks/     # 커스텀 훅
  types/     # 백엔드 스키마와 대응하는 타입 (playground.ts)
```

`src/types/playground.ts`의 enum은 백엔드 `app/models/playground.py`와 동일하게 유지해야 합니다.
