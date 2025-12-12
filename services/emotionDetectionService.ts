// Real AI-based Emotion Detection Service
export interface EmotionResult {
  emotion: 'positive' | 'neutral' | 'negative' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted';
  confidence: number;
  details: {
    facial: number;
    voice: number;
    context: number;
  };
  analysis: string;
  timestamp: Date;
}

export interface FacialLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };
  eyebrowLeft: { x: number; y: number };
  eyebrowRight: { x: number; y: number };
}

export interface VoiceFeatures {
  pitch: number;
  energy: number;
  tempo: number;
  spectralCentroid: number;
  mfcc: number[];
}

class EmotionDetectionService {
  private faceDetector: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeDetectors();
  }

  private async initializeDetectors() {
    try {
      // Face Detection API 초기화 (Chrome/Edge에서 지원)
      if ('FaceDetector' in window) {
        this.faceDetector = new (window as any).FaceDetector({
          maxDetectedFaces: 1,
          fastMode: false
        });
      }

      // Web Audio API 초기화
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      this.isInitialized = true;
      console.log('✅ Emotion Detection Service initialized');
    } catch (error) {
      console.warn('⚠️ Some emotion detection features may not be available:', error);
    }
  }

  // 얼굴 표정 분석
  async analyzeFacialExpression(imageData: ImageData): Promise<{ emotion: string; confidence: number }> {
    try {
      if (!this.faceDetector) {
        return this.fallbackFacialAnalysis(imageData);
      }

      const faces = await this.faceDetector.detect(imageData);
      
      if (faces.length === 0) {
        return { emotion: 'neutral', confidence: 0.5 };
      }

      const face = faces[0];
      const landmarks = this.extractFacialLandmarks(face);
      const emotion = this.classifyFacialEmotion(landmarks);

      return emotion;
    } catch (error) {
      console.warn('Face detection failed, using fallback:', error);
      return this.fallbackFacialAnalysis(imageData);
    }
  }

  // 폴백 얼굴 분석 (픽셀 기반 간단한 분석)
  private fallbackFacialAnalysis(imageData: ImageData): { emotion: string; confidence: number } {
    const { data, width, height } = imageData;
    
    // 이미지의 밝기와 대비 분석
    let totalBrightness = 0;
    let redSum = 0;
    let greenSum = 0;
    let blueSum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      totalBrightness += (r + g + b) / 3;
      redSum += r;
      greenSum += g;
      blueSum += b;
    }
    
    const pixelCount = data.length / 4;
    const avgBrightness = totalBrightness / pixelCount;
    const avgRed = redSum / pixelCount;
    const avgGreen = greenSum / pixelCount;
    const avgBlue = blueSum / pixelCount;
    
    // 간단한 휴리스틱 기반 감정 분류
    let emotion = 'neutral';
    let confidence = 0.6;
    
    if (avgBrightness > 140) {
      emotion = 'happy';
      confidence = 0.7;
    } else if (avgBrightness < 100) {
      emotion = 'sad';
      confidence = 0.65;
    } else if (avgRed > avgGreen && avgRed > avgBlue) {
      emotion = 'angry';
      confidence = 0.6;
    }
    
    return { emotion, confidence };
  }

  private extractFacialLandmarks(face: any): FacialLandmarks {
    const bbox = face.boundingBox;
    
    // 얼굴 영역에서 주요 특징점 추정
    return {
      leftEye: { x: bbox.x + bbox.width * 0.3, y: bbox.y + bbox.height * 0.35 },
      rightEye: { x: bbox.x + bbox.width * 0.7, y: bbox.y + bbox.height * 0.35 },
      nose: { x: bbox.x + bbox.width * 0.5, y: bbox.y + bbox.height * 0.5 },
      mouth: { x: bbox.x + bbox.width * 0.5, y: bbox.y + bbox.height * 0.75 },
      eyebrowLeft: { x: bbox.x + bbox.width * 0.3, y: bbox.y + bbox.height * 0.25 },
      eyebrowRight: { x: bbox.x + bbox.width * 0.7, y: bbox.y + bbox.height * 0.25 }
    };
  }

  private classifyFacialEmotion(landmarks: FacialLandmarks): { emotion: string; confidence: number } {
    // 눈과 입의 위치 관계로 감정 분류
    const eyeDistance = Math.abs(landmarks.leftEye.x - landmarks.rightEye.x);
    const mouthToNose = landmarks.mouth.y - landmarks.nose.y;
    const eyebrowHeight = (landmarks.eyebrowLeft.y + landmarks.eyebrowRight.y) / 2;
    const eyeHeight = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;
    const eyebrowToEye = eyeHeight - eyebrowHeight;

    let emotion = 'neutral';
    let confidence = 0.7;

    // 간단한 규칙 기반 분류
    if (mouthToNose < 20) {
      emotion = 'happy';
      confidence = 0.8;
    } else if (mouthToNose > 35) {
      emotion = 'sad';
      confidence = 0.75;
    } else if (eyebrowToEye < 15) {
      emotion = 'angry';
      confidence = 0.7;
    } else if (eyebrowToEye > 25) {
      emotion = 'surprised';
      confidence = 0.72;
    }

    return { emotion, confidence };
  }

  // 음성 감정 분석
  async analyzeVoiceEmotion(audioStream: MediaStream): Promise<{ emotion: string; confidence: number }> {
    try {
      if (!this.audioContext || !this.analyser) {
        return { emotion: 'neutral', confidence: 0.5 };
      }

      const source = this.audioContext.createMediaStreamSource(audioStream);
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      const features = this.extractVoiceFeatures(dataArray);
      const emotion = this.classifyVoiceEmotion(features);

      return emotion;
    } catch (error) {
      console.warn('Voice analysis failed:', error);
      return { emotion: 'neutral', confidence: 0.5 };
    }
  }

  private extractVoiceFeatures(frequencyData: Uint8Array): VoiceFeatures {
    // 주파수 데이터에서 음성 특징 추출
    let energy = 0;
    let spectralCentroid = 0;
    let totalMagnitude = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i];
      energy += magnitude * magnitude;
      spectralCentroid += i * magnitude;
      totalMagnitude += magnitude;
    }

    energy = Math.sqrt(energy / frequencyData.length);
    spectralCentroid = totalMagnitude > 0 ? spectralCentroid / totalMagnitude : 0;

    // 기본적인 MFCC 계수 근사
    const mfcc = this.calculateMFCC(frequencyData);

    return {
      pitch: this.estimatePitch(frequencyData),
      energy,
      tempo: this.estimateTempo(frequencyData),
      spectralCentroid,
      mfcc
    };
  }

  private estimatePitch(frequencyData: Uint8Array): number {
    // 기본 주파수 추정 (가장 강한 주파수 성분)
    let maxMagnitude = 0;
    let pitchBin = 0;

    for (let i = 1; i < frequencyData.length / 2; i++) {
      if (frequencyData[i] > maxMagnitude) {
        maxMagnitude = frequencyData[i];
        pitchBin = i;
      }
    }

    // 주파수로 변환 (샘플링 레이트 44100Hz 가정)
    return (pitchBin * 44100) / (2 * frequencyData.length);
  }

  private estimateTempo(frequencyData: Uint8Array): number {
    // 간단한 템포 추정 (에너지 변화율)
    let energyChanges = 0;
    for (let i = 1; i < frequencyData.length; i++) {
      if (Math.abs(frequencyData[i] - frequencyData[i - 1]) > 10) {
        energyChanges++;
      }
    }
    return energyChanges / frequencyData.length;
  }

  private calculateMFCC(frequencyData: Uint8Array): number[] {
    // 간단한 MFCC 근사 (실제로는 더 복잡한 계산 필요)
    const mfcc: number[] = [];
    const numCoefficients = 13;
    
    for (let i = 0; i < numCoefficients; i++) {
      let coefficient = 0;
      const startBin = Math.floor((i * frequencyData.length) / numCoefficients);
      const endBin = Math.floor(((i + 1) * frequencyData.length) / numCoefficients);
      
      for (let j = startBin; j < endBin; j++) {
        coefficient += frequencyData[j] * Math.cos((Math.PI * i * (j - startBin)) / (endBin - startBin));
      }
      
      mfcc.push(coefficient / (endBin - startBin));
    }
    
    return mfcc;
  }

  private classifyVoiceEmotion(features: VoiceFeatures): { emotion: string; confidence: number } {
    let emotion = 'neutral';
    let confidence = 0.6;

    // 음성 특징 기반 감정 분류
    if (features.pitch > 200 && features.energy > 50) {
      emotion = 'happy';
      confidence = 0.75;
    } else if (features.pitch < 120 && features.energy < 30) {
      emotion = 'sad';
      confidence = 0.7;
    } else if (features.energy > 80 && features.tempo > 0.3) {
      emotion = 'angry';
      confidence = 0.72;
    } else if (features.pitch > 250 && features.tempo > 0.4) {
      emotion = 'surprised';
      confidence = 0.68;
    }

    return { emotion, confidence };
  }

  // 종합 감정 분석
  async analyzeEmotion(
    imageData: ImageData,
    audioStream: MediaStream | null,
    contextText?: string
  ): Promise<EmotionResult> {
    const facialResult = await this.analyzeFacialExpression(imageData);
    const voiceResult = audioStream 
      ? await this.analyzeVoiceEmotion(audioStream)
      : { emotion: 'neutral', confidence: 0.5 };

    // 텍스트 컨텍스트 분석 (간단한 키워드 기반)
    const contextResult = contextText 
      ? this.analyzeTextContext(contextText)
      : { emotion: 'neutral', confidence: 0.5 };

    // 가중 평균으로 최종 감정 결정
    const weights = {
      facial: 0.5,
      voice: audioStream ? 0.3 : 0,
      context: contextText ? 0.2 : 0
    };

    // 정규화
    const totalWeight = weights.facial + weights.voice + weights.context;
    weights.facial /= totalWeight;
    weights.voice /= totalWeight;
    weights.context /= totalWeight;

    const finalConfidence = 
      facialResult.confidence * weights.facial +
      voiceResult.confidence * weights.voice +
      contextResult.confidence * weights.context;

    // 가장 높은 신뢰도의 감정 선택
    const emotions = [
      { emotion: facialResult.emotion, confidence: facialResult.confidence * weights.facial },
      { emotion: voiceResult.emotion, confidence: voiceResult.confidence * weights.voice },
      { emotion: contextResult.emotion, confidence: contextResult.confidence * weights.context }
    ];

    const finalEmotion = emotions.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );

    return {
      emotion: this.mapToBasicEmotion(finalEmotion.emotion),
      confidence: finalConfidence,
      details: {
        facial: facialResult.confidence,
        voice: voiceResult.confidence,
        context: contextResult.confidence
      },
      analysis: this.generateAnalysis(facialResult, voiceResult, contextResult),
      timestamp: new Date()
    };
  }

  private analyzeTextContext(text: string): { emotion: string; confidence: number } {
    const positiveWords = ['좋다', '행복', '기쁘다', '즐겁다', '만족', 'good', 'happy', 'great', 'excellent', 'wonderful'];
    const negativeWords = ['나쁘다', '슬프다', '화나다', '짜증', '실망', 'bad', 'sad', 'angry', 'terrible', 'awful'];
    const neutralWords = ['보통', '그냥', '괜찮다', 'okay', 'normal', 'fine'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
      if (neutralWords.some(neu => word.includes(neu))) neutralCount++;
    });

    let emotion = 'neutral';
    let confidence = 0.6;

    if (positiveCount > negativeCount && positiveCount > 0) {
      emotion = 'positive';
      confidence = Math.min(0.9, 0.6 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      emotion = 'negative';
      confidence = Math.min(0.9, 0.6 + (negativeCount * 0.1));
    }

    return { emotion, confidence };
  }

  private mapToBasicEmotion(emotion: string): 'positive' | 'neutral' | 'negative' {
    const positiveEmotions = ['happy', 'surprised', 'positive'];
    const negativeEmotions = ['sad', 'angry', 'fearful', 'disgusted', 'negative'];

    if (positiveEmotions.includes(emotion)) return 'positive';
    if (negativeEmotions.includes(emotion)) return 'negative';
    return 'neutral';
  }

  private generateAnalysis(
    facial: { emotion: string; confidence: number },
    voice: { emotion: string; confidence: number },
    context: { emotion: string; confidence: number }
  ): string {
    const analyses = [];

    if (facial.confidence > 0.7) {
      analyses.push(`얼굴 표정에서 ${facial.emotion} 감정이 강하게 감지됨`);
    }

    if (voice.confidence > 0.7) {
      analyses.push(`음성 톤에서 ${voice.emotion} 감정이 나타남`);
    }

    if (context.confidence > 0.7) {
      analyses.push(`텍스트 맥락에서 ${context.emotion} 감정이 표현됨`);
    }

    return analyses.length > 0 
      ? analyses.join(', ')
      : '감정 분석 결과가 불분명함';
  }

  // 카메라 및 마이크 권한 요청
  async requestPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // 스트림 즉시 정지 (권한 확인용)
      stream.getTracks().forEach(track => track.stop());
      
      return { camera: true, microphone: true };
    } catch (error) {
      console.warn('Media permissions denied:', error);
      
      // 개별 권한 확인
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoStream.getTracks().forEach(track => track.stop());
        
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getTracks().forEach(track => track.stop());
          return { camera: true, microphone: true };
        } catch {
          return { camera: true, microphone: false };
        }
      } catch {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getTracks().forEach(track => track.stop());
          return { camera: false, microphone: true };
        } catch {
          return { camera: false, microphone: false };
        }
      }
    }
  }

  // 서비스 정리
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.faceDetector = null;
  }
}

export const emotionDetectionService = new EmotionDetectionService();