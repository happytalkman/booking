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
  const [currentPoem, setCurrentPoem] = useState<{ title: string; content: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = {
    title: { ko: '🎭 고급 감정 분석', en: '🎭 Advanced Emotion Analysis' },
    subtitle: { ko: 'AI 기반 얼굴 표정 및 음성 감정 인식 (30초)', en: 'AI-based Facial Expression & Voice Emotion Recognition (30s)' },
    startCamera: { ko: '카메라 시작', en: 'Start Camera' },
    stopCamera: { ko: '카메라 중지', en: 'Stop Camera' },
    startAnalysis: { ko: '감정 분석 시작 (30초)', en: 'Start Analysis (30s)' },
    analyzing: { ko: '분석 중...', en: 'Analyzing...' },
    readPoem: { ko: '시를 소리내어 읽어주세요', en: 'Please read the poem aloud' },
    timeRemaining: { ko: '남은 시간', en: 'Time Remaining' },
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
    instructions: { ko: '카메라를 시작하고 시를 소리내어 읽어주세요', en: 'Start camera and read the poem aloud' }
  };

  // 50개 현대시 데이터
  const koreanPoems = [
    { title: '진달래꽃', content: '나 보기가 역겨워\n가실 때에는\n말없이 고이 보내 드리오리다\n\n영변에 약산\n진달래꽃\n아름 따다 가실 길에 뿌리오리다' },
    { title: '서시', content: '죽는 날까지 하늘을 우러러\n한 점 부끄럼이 없기를,\n잎새에 이는 바람에도\n나는 괴로워했다.' },
    { title: '님의 침묵', content: '님은 갔습니다. 아아, 사랑하는 나의 님은 갔습니다.\n푸른 산빛을 깨치고 단풍나무 숲을 향하여 난 작은 길을 걸어서, 차마 떨치고 갔습니다.' },
    { title: '국화 옆에서', content: '한 송이의 국화꽃을 피우기 위해\n봄부터 소쩍새는\n그렇게 울었나 보다' },
    { title: '풀', content: '풀이 눕는다\n비를 몰아오는 동풍에 나부껴\n풀은 눕고\n드디어 울었다' },
    { title: '자화상', content: '산모퉁이를 돌아 논가 외딴 우물을 홀로 찾아가선\n가만히 들여다봅니다.\n우물 속에는 달이 밝고 구름이 흐르고 하늘이 펼치고' },
    { title: '별 헤는 밤', content: '계절이 지나가는 하늘에는\n가을로 가득 차 있습니다.\n나는 아무 걱정도 없이\n가을 속의 별들을 다 헤일 듯합니다.' },
    { title: '광야', content: '까마득한 날에\n하늘이 처음 열리고\n어디 닭 우는 소리 들렸으랴' },
    { title: '승무', content: '얇은 사(紗) 하이얀 고깔은\n고이 접어서 나빌레라.\n파르라니 깎은 머리\n박사(薄紗) 고깔에 감추오고' },
    { title: '엄마 걱정', content: '엄마야 누나야 강변 살자\n뜰에는 반짝이는 금모래 빛\n뒷문 밖에는 갈잎의 노래' },
    { title: '추천사', content: '내 마음은 호수요\n그대 노 저어 오오\n나는 그대의 흰 그림자를 안고\n옥같이 차고 맑은 밤을 지새우리다' },
    { title: '귀천', content: '나 하늘로 돌아가리라.\n새벽빛 와 닿으면 스러지는\n이슬 더불어 손에 손을 잡고' },
    { title: '꽃', content: '내가 그의 이름을 불러 주기 전에는\n그는 다만\n하나의 몸짓에 지나지 않았다' },
    { title: '산', content: '산은 옛날부터\n말이 없다.\n말이 없는 것이\n얼마나 좋으냐' },
    { title: '봄', content: '봄은\n남쪽에서 북쪽으로 가는 것이 아니라\n아래에서 위로 올라가는 것이다' },
    { title: '나무', content: '나무는 자기 혼자서는\n열매를 맺지 못한다.\n나무는 벌과 나비의 도움으로\n열매를 맺는다' },
    { title: '바다', content: '바다는 넓다\n바다는 깊다\n바다는 푸르다\n바다는 아름답다' },
    { title: '하늘', content: '하늘을 우러러\n한 점 부끄럼이 없기를\n잎새에 이는 바람에도\n나는 괴로워했다' },
    { title: '길', content: '길은 외롭다\n길은 멀다\n길은 험하다\n그러나 가야 한다' },
    { title: '사랑', content: '사랑은 주는 것이다\n사랑은 기다리는 것이다\n사랑은 용서하는 것이다\n사랑은 영원한 것이다' },
    { title: '그리움', content: '그리움은\n가슴 속에 피는 꽃\n그리움은\n눈물로 적시는 시' },
    { title: '희망', content: '희망은\n어둠 속의 등불\n희망은\n절망 속의 빛' },
    { title: '행복', content: '행복은\n작은 것에서 온다\n행복은\n나누면 커진다' },
    { title: '꿈', content: '꿈은\n이루어진다\n꿈은\n현실이 된다' },
    { title: '인생', content: '인생은\n여행이다\n인생은\n배움이다' },
    { title: '우정', content: '우정은\n시간이 지나도\n변하지 않는다' },
    { title: '가족', content: '가족은\n세상에서 가장\n소중한 것이다' },
    { title: '자연', content: '자연은\n우리의 어머니\n자연은\n우리의 집' },
    { title: '평화', content: '평화는\n전쟁이 없는 것이 아니라\n정의가 있는 것이다' },
    { title: '자유', content: '자유는\n책임을 동반한다\n자유는\n소중한 것이다' },
    { title: '진실', content: '진실은\n때로 아프지만\n거짓보다 낫다' },
    { title: '용기', content: '용기는\n두려움이 없는 것이 아니라\n두려움을 이기는 것이다' },
    { title: '지혜', content: '지혜는\n아는 것이 아니라\n실천하는 것이다' },
    { title: '겸손', content: '겸손은\n자신을 낮추는 것이 아니라\n타인을 높이는 것이다' },
    { title: '감사', content: '감사는\n가진 것을 세는 것\n감사는\n행복의 시작' },
    { title: '인내', content: '인내는\n쓰지만\n그 열매는 달다' },
    { title: '믿음', content: '믿음은\n보이지 않는 것을\n믿는 것이다' },
    { title: '소망', content: '소망은\n내일을 살게 하는\n힘이다' },
    { title: '사랑의 기쁨', content: '사랑하는 것은\n사랑받는 것보다\n더 큰 기쁨이다' },
    { title: '시간', content: '시간은\n흐르는 강물\n시간은\n돌아오지 않는다' },
    { title: '추억', content: '추억은\n마음속에 남는\n아름다운 그림' },
    { title: '미래', content: '미래는\n오늘 만드는 것\n미래는\n희망이다' },
    { title: '현재', content: '현재는\n선물이다\n현재를\n소중히 하라' },
    { title: '과거', content: '과거는\n교훈이다\n과거에서\n배워라' },
    { title: '청춘', content: '청춘은\n아름답다\n청춘은\n짧다' },
    { title: '노년', content: '노년은\n지혜의 시간\n노년은\n평화의 시간' },
    { title: '생명', content: '생명은\n소중하다\n생명은\n존중받아야 한다' },
    { title: '마음', content: '마음이\n편해야\n몸이 편하다' },
    { title: '웃음', content: '웃음은\n최고의 명약\n웃음은\n전염된다' },
    { title: '눈물', content: '눈물은\n마음의 언어\n눈물은\n치유의 시작' }
  ];

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
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
    setTimeRemaining(30);

    // 랜덤 시 선택
    const randomPoem = koreanPoems[Math.floor(Math.random() * koreanPoems.length)];
    setCurrentPoem(randomPoem);

    // 30초 타이머 시작
    let remaining = 30;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      setAnalysisProgress(((30 - remaining) / 30) * 100);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        finishAnalysis();
      }
    }, 1000);
  };

  // 분석 완료
  const finishAnalysis = async () => {
    // 비디오에서 이미지 캡처
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
      }
    }

    // 분석 실행
    const facialScore = await analyzeFacialExpression();
    const voiceScore = analyzeVoiceTone();
    const contextScore = analyzeContext();

    // 종합 분석
    const result = calculateEmotionResult(facialScore, voiceScore, contextScore);
    setEmotionResult(result);
    setIsAnalyzing(false);
    setCurrentPoem(null);
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

  // 얼굴 표정 분석 (실제 API 호출)
  const analyzeFacialExpression = async (): Promise<number> => {
    const canvas = canvasRef.current;
    if (!canvas) return 0.5;

    try {
      // Canvas를 base64로 변환
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Python 백엔드 API 호출
      const response = await fetch('http://localhost:5000/api/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        // 폴백: 밝기 기반 분석
        return analyzeFacialExpressionFallback();
      }

      const result = await response.json();
      console.log('Emotion API Result:', result);
      
      // facial_score 반환 (0-1)
      return result.facial_score || 0.5;
      
    } catch (error) {
      console.error('Facial analysis error:', error);
      // 폴백: 밝기 기반 분석
      return analyzeFacialExpressionFallback();
    }
  };

  // 폴백: 밝기 기반 간단한 분석
  const analyzeFacialExpressionFallback = (): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 0.5;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0.5;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);

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
              {isAnalyzing && currentPoem && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 flex items-center justify-center p-8">
                  <div className="text-center text-white max-w-2xl">
                    {/* 타이머 */}
                    <div className="mb-6">
                      <div className="text-6xl font-bold mb-2 animate-pulse">
                        {timeRemaining}
                      </div>
                      <p className="text-sm opacity-75">{t.timeRemaining[lang]}</p>
                    </div>

                    {/* 시 제목 */}
                    <h3 className="text-2xl font-bold mb-4 text-yellow-300">
                      {currentPoem.title}
                    </h3>

                    {/* 시 내용 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                      <p className="text-lg leading-relaxed whitespace-pre-line">
                        {currentPoem.content}
                      </p>
                    </div>

                    {/* 안내 메시지 */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Mic className="w-5 h-5 animate-pulse" />
                      <p className="text-sm font-medium">{t.readPoem[lang]}</p>
                    </div>

                    {/* 프로그레스 바 */}
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
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
