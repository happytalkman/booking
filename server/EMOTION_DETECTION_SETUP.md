# 🎭 얼굴 표정 인식 서버 설치 가이드

## 📋 개요

FER (Facial Expression Recognition) 라이브러리를 사용한 실시간 얼굴 표정 인식 서버입니다.

### 주요 기능
- 7가지 감정 인식 (행복, 슬픔, 화남, 놀람, 두려움, 혐오, 중립)
- MTCNN 기반 얼굴 검출
- CNN 모델 기반 표정 분류
- REST API 제공

---

## 🔧 설치 방법

### 1. Python 설치 확인
```bash
python --version  # Python 3.8 이상 필요
```

### 2. 가상환경 생성 (권장)
```bash
cd server
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. 패키지 설치
```bash
pip install -r requirements.txt
```

**설치되는 패키지:**
- `flask`: 웹 서버
- `flask-cors`: CORS 지원
- `opencv-python`: 이미지 처리
- `fer`: 얼굴 표정 인식
- `tensorflow`: 딥러닝 모델
- `mtcnn`: 얼굴 검출
- `numpy`, `Pillow`: 이미지 처리

---

## 🚀 서버 실행

### 1. 서버 시작
```bash
python emotion_detection.py
```

### 2. 서버 확인
```
🎭 Emotion Detection Server Starting...
📍 Server: http://localhost:5000
🔧 Model: FER (Facial Expression Recognition)
✅ Ready to analyze emotions!
```

### 3. 상태 확인
브라우저에서 접속:
```
http://localhost:5000/api/health
```

응답:
```json
{
  "status": "ok",
  "message": "Emotion detection server is running",
  "model": "FER with MTCNN"
}
```

---

## 📡 API 사용법

### Endpoint: POST /api/analyze-emotion

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response (성공):**
```json
{
  "success": true,
  "emotion": "positive",
  "confidence": 0.85,
  "facial_score": 0.72,
  "details": {
    "dominant_emotion": "happy",
    "dominant_emotion_ko": "행복",
    "dominant_score": 0.85,
    "all_emotions": {
      "happy": 0.85,
      "neutral": 0.10,
      "sad": 0.03,
      "angry": 0.01,
      "surprise": 0.01,
      "fear": 0.00,
      "disgust": 0.00
    },
    "positive_score": 0.86,
    "negative_score": 0.04,
    "neutral_score": 0.10
  },
  "analysis": {
    "ko": "분석 결과, 현재 긍정적인 감정 상태입니다...",
    "en": "Analysis shows you are in a positive emotional state..."
  }
}
```

**Response (얼굴 미검출):**
```json
{
  "error": "No face detected",
  "message": "얼굴이 감지되지 않았습니다. 카메라를 정면으로 향해주세요."
}
```

---

## 🧠 감정 분석 알고리즘

### 1. 얼굴 검출
- **MTCNN** (Multi-task Cascaded Convolutional Networks)
- 얼굴 영역 자동 검출
- 얼굴 랜드마크 추출

### 2. 표정 분류
- **CNN 모델** (FER2013 데이터셋 학습)
- 7가지 감정 분류
- 각 감정별 확률 출력 (0-1)

### 3. 카테고리 분류
```python
긍정 (positive):
  - happy (행복)
  - surprise (놀람)

중립 (neutral):
  - neutral (중립)

부정 (negative):
  - sad (슬픔)
  - angry (화남)
  - fear (두려움)
  - disgust (혐오)
```

### 4. 점수 계산
```python
facial_score = (positive_score - negative_score + 1) / 2
# 범위: 0-1
# 1에 가까울수록 긍정적
```

---

## 🎯 프론트엔드 연동

### 1. 감정 감지 버튼 클릭
```typescript
// VoiceQnAPanel.tsx
<button onClick={() => setShowEmotionModal(true)}>
  감정 감지
</button>
```

### 2. 카메라 활성화
```typescript
// EmotionDetectionModal.tsx
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: true 
});
```

### 3. 이미지 캡처
```typescript
const canvas = canvasRef.current;
const video = videoRef.current;
ctx.drawImage(video, 0, 0);
const imageData = canvas.toDataURL('image/jpeg');
```

### 4. API 호출
```typescript
const response = await fetch('http://localhost:5000/api/analyze-emotion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: imageData })
});
```

### 5. 결과 표시
```typescript
const result = await response.json();
setEmotionResult({
  emotion: result.emotion,
  confidence: result.confidence,
  details: result.details
});
```

---

## 🔍 문제 해결

### 1. 패키지 설치 오류
```bash
# TensorFlow 설치 실패 시
pip install tensorflow==2.15.0 --no-cache-dir

# OpenCV 설치 실패 시
pip install opencv-python-headless
```

### 2. CORS 오류
```python
# emotion_detection.py에서 CORS 설정 확인
CORS(app)  # 모든 도메인 허용
```

### 3. 얼굴 검출 실패
- 조명 확인 (밝은 환경)
- 카메라 정면 응시
- 얼굴 전체가 화면에 나오도록

### 4. 서버 포트 충돌
```python
# 다른 포트 사용
app.run(host='0.0.0.0', port=5001, debug=True)
```

---

## 📊 성능 최적화

### 1. 이미지 크기 조정
```typescript
// 640x480으로 리사이즈
canvas.width = 640;
canvas.height = 480;
```

### 2. JPEG 품질 조정
```typescript
// 품질 80%로 압축
canvas.toDataURL('image/jpeg', 0.8);
```

### 3. 캐싱
```python
# 모델 한 번만 로드
detector = FER(mtcnn=True)  # 전역 변수
```

---

## 🚀 프로덕션 배포

### 1. Gunicorn 사용
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 emotion_detection:app
```

### 2. Docker 컨테이너
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY emotion_detection.py .
CMD ["python", "emotion_detection.py"]
```

### 3. 환경 변수
```bash
export FLASK_ENV=production
export FLASK_DEBUG=0
```

---

## 📚 참고 자료

- **FER 라이브러리**: https://github.com/justinshenk/fer
- **MTCNN**: https://github.com/ipazc/mtcnn
- **FER2013 데이터셋**: https://www.kaggle.com/c/challenges-in-representation-learning-facial-expression-recognition-challenge
- **OpenCV**: https://opencv.org/

---

## 🎓 향후 개선 방향

### 단기
- [ ] 실시간 스트리밍 분석
- [ ] 다중 얼굴 동시 분석
- [ ] 감정 추세 그래프

### 중기
- [ ] 딥러닝 모델 업그레이드
- [ ] 개인화된 감정 프로필
- [ ] 음성 톤 분석 통합

### 장기
- [ ] 멀티모달 감정 인식
- [ ] 감정 예측 모델
- [ ] 클라우드 배포

---

**개발자**: Kiro AI Assistant  
**버전**: 1.0.0  
**최종 업데이트**: 2024-12-09
