# GitHub Pages 배포 가이드

## 🚀 자동 배포 (GitHub Actions)

### 1단계: GitHub 저장소 설정

1. **GitHub 저장소로 이동**
   - https://github.com/happytalkman/booking

2. **Settings → Pages 설정**
   - 저장소 상단의 `Settings` 클릭
   - 왼쪽 메뉴에서 `Pages` 클릭
   - **Source** 섹션에서:
     - `Deploy from a branch` → `GitHub Actions`로 변경

3. **Secrets 설정 (API 키)**
   - `Settings` → `Secrets and variables` → `Actions` 클릭
   - `New repository secret` 버튼 클릭
   - 다음 2개의 Secret 추가:
     
     **Secret 1:**
     - Name: `VITE_GEMINI_API_KEY`
     - Value: `your_gemini_api_key_here`
     
     **Secret 2:**
     - Name: `VITE_OPENROUTER_API_KEY`
     - Value: `your_openrouter_api_key_here`

### 2단계: 자동 배포 실행

코드를 `main` 브랜치에 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "feat: GitHub Pages 배포 설정"
git push origin main
```

### 3단계: 배포 확인

1. **Actions 탭에서 진행 상황 확인**
   - https://github.com/happytalkman/booking/actions
   - `Deploy to GitHub Pages` 워크플로우 확인
   - 빌드 및 배포 로그 확인

2. **배포된 사이트 접속**
   - 배포 완료 후 약 1-2분 대기
   - https://happytalkman.github.io/booking/

---

## 🔧 수동 배포 (로컬에서)

### 방법 1: npm 스크립트 사용

```bash
# 빌드 및 배포
npm run deploy
```

### 방법 2: 단계별 수동 배포

```bash
# 1. 빌드
npm run build

# 2. gh-pages 브랜치에 배포
npx gh-pages -d dist
```

---

## 📋 배포 체크리스트

### 배포 전 확인사항

- [ ] `vite.config.ts`에 `base: '/booking/'` 설정 확인
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] GitHub Secrets에 API 키 등록 완료
- [ ] `package.json`에 `deploy` 스크립트 추가 확인

### 배포 후 확인사항

- [ ] https://happytalkman.github.io/booking/ 접속 확인
- [ ] 모든 페이지 정상 작동 확인
- [ ] AI 챗봇 기능 테스트
- [ ] 데이터 품질 검증 패널 테스트
- [ ] 모바일 반응형 확인

---

## 🔍 트러블슈팅

### 문제 1: 404 에러 발생

**원인**: `base` 경로 설정 오류

**해결**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/booking/', // 저장소 이름과 일치해야 함
  // ...
});
```

### 문제 2: API 키 오류

**원인**: GitHub Secrets 미설정

**해결**:
1. Settings → Secrets and variables → Actions
2. `VITE_GEMINI_API_KEY` 추가
3. `VITE_OPENROUTER_API_KEY` 추가

### 문제 3: 빌드 실패

**원인**: 의존성 설치 오류

**해결**:
```bash
# 로컬에서 빌드 테스트
npm ci
npm run build

# 문제 없으면 푸시
git push origin main
```

### 문제 4: 페이지가 업데이트되지 않음

**원인**: 브라우저 캐시

**해결**:
- `Ctrl + Shift + R` (Windows/Linux)
- `Cmd + Shift + R` (Mac)
- 또는 시크릿 모드로 접속

---

## 🌐 커스텀 도메인 설정 (선택사항)

### 1. 도메인 구매
- Namecheap, GoDaddy 등에서 도메인 구매

### 2. DNS 설정
도메인 제공업체에서 다음 레코드 추가:

```
Type: A
Host: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153

Type: CNAME
Host: www
Value: happytalkman.github.io
```

### 3. GitHub 설정
1. Settings → Pages
2. Custom domain에 도메인 입력 (예: `kmtc-booking.com`)
3. `Enforce HTTPS` 체크

### 4. CNAME 파일 생성
```bash
echo "kmtc-booking.com" > public/CNAME
git add public/CNAME
git commit -m "feat: 커스텀 도메인 추가"
git push origin main
```

---

## 📊 배포 상태 모니터링

### GitHub Actions 대시보드
- https://github.com/happytalkman/booking/actions

### 배포 로그 확인
1. Actions 탭 클릭
2. 최신 워크플로우 실행 클릭
3. `build` 및 `deploy` 단계 로그 확인

### 배포 히스토리
- Settings → Pages → "Your site is live at..." 확인

---

## 🔄 배포 롤백

### 이전 버전으로 되돌리기

```bash
# 1. 이전 커밋으로 되돌리기
git log --oneline  # 커밋 해시 확인
git revert <commit-hash>

# 2. 푸시하여 재배포
git push origin main
```

### 특정 브랜치로 배포

```bash
# develop 브랜치를 gh-pages로 배포
git checkout develop
npm run deploy
```

---

## 📈 성능 최적화

### 빌드 최적화
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts', 'd3'],
        },
      },
    },
  },
});
```

### 이미지 최적화
- WebP 형식 사용
- 이미지 압축 (TinyPNG, ImageOptim)
- Lazy loading 적용

---

## 🎯 배포 자동화 팁

### 1. 브랜치별 배포
```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches:
      - develop
```

### 2. PR 미리보기
```yaml
# .github/workflows/preview.yml
on:
  pull_request:
    types: [opened, synchronize]
```

### 3. 배포 알림
- Slack 웹훅 연동
- Discord 웹훅 연동
- 이메일 알림 설정

---

## 📞 지원

문제가 발생하면:
1. [GitHub Issues](https://github.com/happytalkman/booking/issues) 생성
2. Actions 로그 첨부
3. 에러 메시지 포함

---

**배포 완료 후 접속 주소:**
🌐 https://happytalkman.github.io/booking/

**예상 배포 시간:** 2-5분
