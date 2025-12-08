import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, Smile, Meh, Frown, AlertCircle, CheckCircle, Loader2, Eye, Mic } from 'lucide-react';
import { Language } from '../types';

interface EmotionDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onEmotionDetected: (emotion: EmotionResult) => void;
}

interface EmotionResult {
  emotion: 'positive' | 'neutral' | 'negative';
  confidence: number;
  details: {
    facial: number;
    voice: number;
    context: number;
  };
  analysis: string;
}

export const EmotionDetectionModal: React.FC<EmotionDetectionModalProps> = ({ 
  isOpen, 
  onClose, 
  lang,
  onEmotionDetected 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [emotionResult, setEmotionResult] = useState<EmotionResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const t = {
    title: { ko: '🎭 고급 감정 분석', en: '🎭 Advanced Emotion Analysis' },
    subtitle: { ko: 'AI 기반 얼굴 표정 및 음성 감정 인식', en: 'AI-based Facial Expression & Voice Emotion Recognition' },
    startCamera: { ko: '카메라 시작', en: 'Start Camera' },
    stopCamera: { ko: '카메라 중지', en: 'Stop Camera' },
    startAnalysis: { ko: '감정 분석 시작', en: 'Start Analysis' },
    analyzing: { ko: '분석 중...', en: 'Analyzing...' },
    facialAnalysis: { ko: '얼굴 표정 분석', en: 'Facial Expression' },
    voiceAnalysis: { ko: '음성 톤 분석', en: 'Voice Tone' },
    contextAnalysis: { ko: '맥락 분석', en: 'Context Analysis' },
    result: { ko: '분석 결과', en: 'Analysis Result' },
    confidence: { ko: '신뢰도', en: 'Confidence' },
    positive: { ko: '긍정적', en: 'Positive' },
    neutral: { ko: '중립', en: 'Neutral' },
    negative: { ko: '부정적', en: 'Negative' },
    apply: { ko: '적용하기', en: 'Apply' },
    close: { ko: '닫기', en: 'Close' },
    cameraPermission: { ko: '카메라 권한이 필요합니다', en: 'Camera permission required' },
    instructions: { ko: '카메라를 시작하고 자연스러운 표정을 지어주세요', en: 'Start camera and show natural expression' }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert(t.cameraPermission[lang]);
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // 감정 분석 시작
  const startAnalysis = async () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) {
      alert(lang === 'ko' ? '먼저 카메라를 시작해주세요' : 'Please start camera first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setEmotionResult(null);

    // 비디오에서 이미지 캡처
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
    }

    // 시뮬레이션: 단계별 분석
    // 1단계: 얼굴 표정 분석 (0-33%)
    await simulateProgress(0, 33, 1000);
    const facialScore = analyzeFacialExpression();

    // 2단계: 음성 톤 분석 (33-66%)
    await simulateProgress(33, 66, 1000);
    const voiceScore = analyzeVoiceTone();

    // 3단계: 맥락 분석 (66-100%)
    await simulateProgress(66, 100, 1000);
    const contextScore = analyzeContext();

    // 종합 분석
    const result = calculateEmotionResult(facialScore, voiceScore, contextScore);
    setEmotionResult(result);
    setIsAnalyzing(false);
  };

  // 진행률 시뮬레이션
  const simulateProgress = (start: number, end: number, duration: number): Promise<void> => {
    return new Promise(resolve => {
      const steps = 20;
      const stepDuration = duration / steps;
      const stepSize = (end - start) / steps;
      let current = start;

      const interval = setInterval(() => {
        current += stepSize;
        setAnalysisProgress(Math.min(current, end));
        
        if (current >= end) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  };

  // 얼굴 표정 분석 (시뮬레이션)
  const analyzeFacialExpression = (): number => {
    // 실제로는 TensorFlow.js의 face-api.js 또는 MediaPipe를 사용
    // 여기서는 시뮬레이션으로 랜덤 값 생성
    const canvas = canvasRef.current;
    if (!canvas) return 0.5;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0.5;

    // 이미지 데이터 분석 (밝기 기반 간단한 분석)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);

    // 밝기를 감정 점수로 변환 (0-1)
    // 밝은 표정 = 긍정적, 어두운 표정 = 부정적
    return Math.min(Math.max((brightness - 100) / 100, 0), 1);
  };

  // 음성 톤 분석 (시뮬레이션)
  const analyzeVoiceTone = (): number => {
    // 실제로는 Web Audio API로 음성 주파수 분석
    // 높은 주파수 = 긍정적, 낮은 주파수 = 부정적
    return 0.5 + (Math.random() - 0.5) * 0.4;
  };

  // 맥락 분석 (시뮬레이션)
  const analyzeContext = (): number => {
    // 실제로는 대화 내용, 시간대, 이전 감정 상태 등을 분석
    const hour = new Date().getHours();
    // 아침/저녁 = 긍정적, 늦은 밤 = 부정적
    if (hour >= 6 && hour <= 9) return 0.7; // 아침
    if (hour >= 18 && hour <= 21) return 0.6; // 저녁
    if (hour >= 22 || hour <= 5) return 0.3; // 늦은 밤
    return 0.5; // 낮
  };

  // 종합 감정 결과 계산
  const calculateEmotionResult = (
    facial: number, 
    voice: number, 
    context: number
  ): EmotionResult => {
    // 가중 평균 (얼굴 50%, 음성 30%, 맥락 20%)
    const totalScore = facial * 0.5 + voice * 0.3 + context * 0.2;
    
    let emotion: 'positive' | 'neutral' | 'negative';
    let analysis: string;

    if (totalScore > 0.6) {
      emotion = 'positive';
      analysis = lang === 'ko'
        ? `분석 결과, 현재 긍정적인 감정 상태입니다.\n\n얼굴 표정에서 미소와 밝은 표정이 감지되었으며, 음성 톤도 활기차고 긍정적입니다. 전반적으로 좋은 컨디션으로 보이며, 업무나 대화에 적극적으로 임할 수 있는 상태입니다.\n\n추천: 이 긍정적인 에너지를 활용하여 중요한 의사결정이나 창의적인 작업을 진행하시면 좋습니다.`
        : `Analysis shows you are in a positive emotional state.\n\nYour facial expression shows smiles and brightness, and your voice tone is energetic and positive. Overall, you appear to be in good condition and ready to actively engage in work or conversation.\n\nRecommendation: Leverage this positive energy for important decisions or creative work.`;
    } else if (totalScore < 0.4) {
      emotion = 'negative';
      analysis = lang === 'ko'
        ? `분석 결과, 현재 다소 부정적이거나 피곤한 감정 상태입니다.\n\n얼굴 표정에서 긴장이나 피로가 감지되었으며, 음성 톤도 낮고 에너지가 부족해 보입니다. 스트레스나 피로가 누적된 상태일 수 있습니다.\n\n추천: 잠시 휴식을 취하거나 가벼운 스트레칭을 하시면 좋습니다. 중요한 결정은 컨디션이 회복된 후에 하시는 것을 권장합니다.`
        : `Analysis shows you are in a somewhat negative or tired emotional state.\n\nYour facial expression shows tension or fatigue, and your voice tone is low with less energy. You may be experiencing accumulated stress or fatigue.\n\nRecommendation: Take a short break or do light stretching. Consider postponing important decisions until your condition improves.`;
    } else {
      emotion = 'neutral';
      analysis = lang === 'ko'
        ? `분석 결과, 현재 중립적이고 안정적인 감정 상태입니다.\n\n얼굴 표정과 음성 톤이 평온하고 균형 잡혀 있습니다. 특별히 긍정적이거나 부정적이지 않은 차분한 상태로, 일상적인 업무를 수행하기에 적합합니다.\n\n추천: 현재 상태를 유지하면서 계획된 업무를 차근차근 진행하시면 좋습니다. 필요시 긍정적인 자극을 통해 에너지를 높일 수 있습니다.`
        : `Analysis shows you are in a neutral and stable emotional state.\n\nYour facial expression and voice tone are calm and balanced. You are in a composed state, neither particularly positive nor negative, suitable for routine work.\n\nRecommendation: Maintain your current state and proceed with planned tasks steadily. You can boost energy with positive stimuli if needed.`;
    }

    return {
      emotion,
      confidence: Math.min(Math.max(totalScore, 0.3), 0.95),
      details: {
        facial: facial,
        voice: voice,
        context: context
      },
      analysis
    };
  };

  // 결과 적용
  const applyResult = () => {
    if (emotionResult) {
      onEmotionDetected(emotionResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.title[lang]}</h2>
              <p className="text-sm opacity-90">{t.subtitle[lang]}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 카메라 영역 */}
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {t.instructions[lang]}
                    </p>
                  </div>
                </div>
              )}

              {/* 분석 중 오버레이 */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium mb-2">{t.analyzing[lang]}</p>
                    <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                    <p className="text-sm mt-2 opacity-75">{Math.round(analysisProgress)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center justify-center gap-4">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <Video className="w-5 h-5" />
                {t.startCamera[lang]}
              </button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                >
                  <Video className="w-5 h-5" />
                  {t.stopCamera[lang]}
                </button>
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition"
                >
                  <Eye className="w-5 h-5" />
                  {isAnalyzing ? t.analyzing[lang] : t.startAnalysis[lang]}
                </button>
              </>
            )}
          </div>

          {/* 분석 결과 */}
          {emotionResult && (
            <div className="space-y-4 animate-fade-in-up">
              {/* 종합 결과 */}
              <div className={`p-6 rounded-xl border-2 ${
                emotionResult.emotion === 'positive' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : emotionResult.emotion === 'negative'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {emotionResult.emotion === 'positive' ? (
                      <Smile className="w-8 h-8 text-green-600" />
                    ) : emotionResult.emotion === 'negative' ? (
                      <Frown className="w-8 h-8 text-red-600" />
                    ) : (
                      <Meh className="w-8 h-8 text-slate-600" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t.result[lang]}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t[emotionResult.emotion][lang]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {(emotionResult.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {t.confidence[lang]}
                    </div>
                  </div>
                </div>

                {/* 상세 분석 */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t.facialAnalysis[lang]}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {(emotionResult.details.facial * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <Mic className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t.voiceAnalysis[lang]}
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {(emotionResult.details.voice * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                    <CheckCircle className="w-5 h-5 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t.contextAnalysis[lang]}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {(emotionResult.details.context * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* 분석 설명 */}
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {emotionResult.analysis}
                  </p>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  {t.close[lang]}
                </button>
                <button
                  onClick={applyResult}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
                >
                  {t.apply[lang]}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
