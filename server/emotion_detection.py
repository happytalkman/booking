"""
얼굴 표정 인식 서버
FER (Facial Expression Recognition) 라이브러리 사용
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from fer import FER
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)  # CORS 허용

# FER 감정 인식 모델 초기화
detector = FER(mtcnn=True)

# 감정 매핑 (영어 -> 한국어)
EMOTION_MAP_KO = {
    'angry': '화남',
    'disgust': '혐오',
    'fear': '두려움',
    'happy': '행복',
    'sad': '슬픔',
    'surprise': '놀람',
    'neutral': '중립'
}

# 감정 카테고리 (긍정/중립/부정)
EMOTION_CATEGORY = {
    'happy': 'positive',
    'surprise': 'positive',
    'neutral': 'neutral',
    'sad': 'negative',
    'angry': 'negative',
    'fear': 'negative',
    'disgust': 'negative'
}

@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """
    얼굴 표정 분석 API
    
    Request:
        - image: base64 인코딩된 이미지
        
    Response:
        - emotion: 주요 감정 (positive/neutral/negative)
        - confidence: 신뢰도 (0-1)
        - details: 상세 감정 점수
        - facial_score: 얼굴 표정 점수 (0-1)
    """
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Base64 디코딩
        image_data = image_data.split(',')[1] if ',' in image_data else image_data
        image_bytes = base64.b64decode(image_data)
        
        # PIL Image로 변환
        image = Image.open(BytesIO(image_bytes))
        image_np = np.array(image)
        
        # RGB to BGR (OpenCV 형식)
        if len(image_np.shape) == 3 and image_np.shape[2] == 3:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        # 얼굴 표정 분석
        result = detector.detect_emotions(image_np)
        
        if not result or len(result) == 0:
            return jsonify({
                'error': 'No face detected',
                'message': '얼굴이 감지되지 않았습니다. 카메라를 정면으로 향해주세요.'
            }), 400
        
        # 첫 번째 얼굴의 감정 분석
        emotions = result[0]['emotions']
        
        # 주요 감정 찾기
        dominant_emotion = max(emotions, key=emotions.get)
        dominant_score = emotions[dominant_emotion]
        
        # 카테고리 분류 (긍정/중립/부정)
        category = EMOTION_CATEGORY.get(dominant_emotion, 'neutral')
        
        # 긍정/부정 점수 계산
        positive_score = emotions.get('happy', 0) + emotions.get('surprise', 0)
        negative_score = emotions.get('sad', 0) + emotions.get('angry', 0) + \
                        emotions.get('fear', 0) + emotions.get('disgust', 0)
        neutral_score = emotions.get('neutral', 0)
        
        # 정규화된 얼굴 표정 점수 (0-1)
        # 긍정적일수록 1에 가까움
        facial_score = (positive_score - negative_score + 1) / 2
        facial_score = max(0, min(1, facial_score))  # 0-1 범위로 제한
        
        # 신뢰도 계산
        confidence = dominant_score
        
        # 한국어 감정 레이블
        emotions_ko = {EMOTION_MAP_KO[k]: v for k, v in emotions.items()}
        
        return jsonify({
            'success': True,
            'emotion': category,
            'confidence': float(confidence),
            'facial_score': float(facial_score),
            'details': {
                'dominant_emotion': dominant_emotion,
                'dominant_emotion_ko': EMOTION_MAP_KO[dominant_emotion],
                'dominant_score': float(dominant_score),
                'all_emotions': emotions,
                'all_emotions_ko': emotions_ko,
                'positive_score': float(positive_score),
                'negative_score': float(negative_score),
                'neutral_score': float(neutral_score)
            },
            'analysis': generate_analysis(category, facial_score, dominant_emotion)
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'error': 'Analysis failed',
            'message': f'분석 중 오류가 발생했습니다: {str(e)}'
        }), 500

def generate_analysis(category, score, dominant_emotion):
    """감정 분석 리포트 생성"""
    
    if category == 'positive':
        return {
            'ko': f"""분석 결과, 현재 긍정적인 감정 상태입니다.

얼굴 표정에서 {EMOTION_MAP_KO[dominant_emotion]} 감정이 주로 감지되었습니다 (신뢰도: {score*100:.1f}%).
밝고 활기찬 표정으로 좋은 컨디션을 보이고 있습니다.

추천: 이 긍정적인 에너지를 활용하여 중요한 의사결정이나 창의적인 작업을 진행하시면 좋습니다.""",
            'en': f"""Analysis shows you are in a positive emotional state.

Your facial expression primarily shows {dominant_emotion} emotion (confidence: {score*100:.1f}%).
You appear bright and energetic, indicating good condition.

Recommendation: Leverage this positive energy for important decisions or creative work."""
        }
    elif category == 'negative':
        return {
            'ko': f"""분석 결과, 현재 다소 부정적이거나 피곤한 감정 상태입니다.

얼굴 표정에서 {EMOTION_MAP_KO[dominant_emotion]} 감정이 주로 감지되었습니다 (신뢰도: {score*100:.1f}%).
긴장이나 피로가 누적된 상태일 수 있습니다.

추천: 잠시 휴식을 취하거나 가벼운 스트레칭을 하시면 좋습니다. 중요한 결정은 컨디션이 회복된 후에 하시는 것을 권장합니다.""",
            'en': f"""Analysis shows you are in a somewhat negative or tired emotional state.

Your facial expression primarily shows {dominant_emotion} emotion (confidence: {score*100:.1f}%).
You may be experiencing accumulated tension or fatigue.

Recommendation: Take a short break or do light stretching. Consider postponing important decisions until your condition improves."""
        }
    else:
        return {
            'ko': f"""분석 결과, 현재 중립적이고 안정적인 감정 상태입니다.

얼굴 표정에서 {EMOTION_MAP_KO[dominant_emotion]} 감정이 주로 감지되었습니다 (신뢰도: {score*100:.1f}%).
평온하고 균형 잡힌 상태입니다.

추천: 현재 상태를 유지하면서 계획된 업무를 차근차근 진행하시면 좋습니다.""",
            'en': f"""Analysis shows you are in a neutral and stable emotional state.

Your facial expression primarily shows {dominant_emotion} emotion (confidence: {score*100:.1f}%).
You are in a calm and balanced state.

Recommendation: Maintain your current state and proceed with planned tasks steadily."""
        }

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        'status': 'ok',
        'message': 'Emotion detection server is running',
        'model': 'FER with MTCNN'
    })

if __name__ == '__main__':
    print("🎭 Emotion Detection Server Starting...")
    print("📍 Server: http://localhost:5000")
    print("🔧 Model: FER (Facial Expression Recognition)")
    print("✅ Ready to analyze emotions!")
    app.run(host='0.0.0.0', port=5000, debug=True)
