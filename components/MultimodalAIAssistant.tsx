import React, { useState, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Camera, Upload, Send, Volume2, VolumeX, 
  Brain, Zap, FileText, Image as ImageIcon, MessageSquare,
  Loader, CheckCircle2 as CheckCircle, AlertCircle, X
} from 'lucide-react';
import { multimodalAIService } from '../services/multimodalAIService';
import { Language } from '../types';

interface MultimodalAIAssistantProps {
  lang: Language;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
}

const MultimodalAIAssistant: React.FC<MultimodalAIAssistantProps> = ({ 
  lang, 
  isOpen = false, 
  onToggle 
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: '',
    progress: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = {
    title: { ko: '멀티모달 AI 어시스턴트', en: 'Multimodal AI Assistant' },
    placeholder: { ko: '텍스트, 음성, 이미지로 질문하세요...', en: 'Ask using text, voice, or image...' },
    listening: { ko: '음성 인식 중...', en: 'Listening...' },
    processing: { ko: '분석 중...', en: 'Processing...' },
    speak: { ko: '음성으로 듣기', en: 'Listen to response' },
    upload: { ko: '이미지 업로드', en: 'Upload Image' },
    record: { ko: '음성 녹음', en: 'Record Audio' },
    send: { ko: '전송', en: 'Send' },
    clear: { ko: '지우기', en: 'Clear' },
    insights: { ko: '분석 결과', en: 'Analysis Results' },
    actions: { ko: '추천 액션', en: 'Suggested Actions' },
    confidence: { ko: '신뢰도', en: 'Confidence' },
    modalities: { ko: '사용된 모달리티', en: 'Used Modalities' },
    voiceCommand: { ko: '음성 명령', en: 'Voice Command' },
    imageRecognition: { ko: '이미지 인식', en: 'Image Recognition' },
    contextUnderstanding: { ko: '컨텍스트 이해', en: 'Context Understanding' },
    documentAnalysis: { ko: '문서 분석', en: 'Document Analysis' }
  };

  // 음성 인식 시작/중지
  const toggleListening = useCallback(() => {
    if (isListening) {
      multimodalAIService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      multimodalAIService.startListening((transcript, isFinal) => {
        if (isFinal) {
          setInput(prev => prev + ' ' + transcript);
          setIsListening(false);
        }
      });
    }
  }, [isListening]);

  // 음성 녹음 시작/중지
  const toggleRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
    } catch (error) {
      console.error('Recording failed:', error);
    }
  }, []);

  // 이미지 선택
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  // 멀티모달 처리
  const handleSubmit = async () => {
    if (!input.trim() && !selectedImage && !audioBlob) return;

    setProcessingState({
      isProcessing: true,
      currentStep: '입력 분석 중...',
      progress: 20
    });

    try {
      const multimodalInput = {
        text: input.trim() || undefined,
        image: selectedImage || undefined,
        audio: audioBlob || undefined,
        language: lang,
        context: 'shipping_logistics'
      };

      setProcessingState({
        isProcessing: true,
        currentStep: '멀티모달 분석 중...',
        progress: 50
      });

      const result = await multimodalAIService.processMultimodalInput(multimodalInput);

      setProcessingState({
        isProcessing: true,
        currentStep: '결과 생성 중...',
        progress: 80
      });

      setResponse(result);

      setProcessingState({
        isProcessing: true,
        currentStep: '완료',
        progress: 100
      });

      // 음성 응답 (옵션)
      if (result.text && !isSpeaking) {
        await multimodalAIService.synthesizeSpeech(result.text, lang);
      }

    } catch (error) {
      console.error('Multimodal processing failed:', error);
      setResponse({
        text: lang === 'ko' ? '처리 중 오류가 발생했습니다.' : 'An error occurred during processing.',
        confidence: 0.1,
        modalities: [],
        insights: [],
        actions: []
      });
    } finally {
      setTimeout(() => {
        setProcessingState({
          isProcessing: false,
          currentStep: '',
          progress: 0
        });
      }, 1000);
    }
  };

  // 음성 재생
  const handleSpeak = async () => {
    if (!response?.text) return;
    
    setIsSpeaking(true);
    try {
      await multimodalAIService.synthesizeSpeech(response.text, lang);
    } catch (error) {
      console.error('Speech synthesis failed:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // 초기화
  const handleClear = () => {
    setInput('');
    setSelectedImage(null);
    setAudioBlob(null);
    setResponse(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 컴팩트 버튼 모드
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="relative p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
        title={t.title[lang]}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <span className="text-sm font-medium">AI</span>
        </div>
        
        {/* 활성 상태 표시 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t.title[lang]}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ko' ? '음성, 이미지, 텍스트 통합 AI' : 'Voice, Image, Text Integrated AI'}
            </p>
          </div>
        </div>
        
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="p-4 space-y-4">
        {/* 텍스트 입력 */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder[lang]}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
          />
          
          {/* 음성 인식 상태 */}
          {isListening && (
            <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {t.listening[lang]}
            </div>
          )}
        </div>

        {/* 멀티모달 입력 버튼들 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isListening
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? t.listening[lang] : t.record[lang]}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Camera size={16} />
            {t.upload[lang]}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mediaRecorderRef.current?.state === 'recording'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
            }`}
          >
            <Upload size={16} />
            {lang === 'ko' ? '음성 녹음' : 'Record Audio'}
          </button>
        </div>

        {/* 선택된 파일들 표시 */}
        <div className="space-y-2">
          {selectedImage && (
            <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded">
              <ImageIcon size={16} className="text-green-600" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{selectedImage.name}</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="ml-auto text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {audioBlob && (
            <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700 rounded">
              <Mic size={16} className="text-blue-600" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {lang === 'ko' ? '녹음된 음성' : 'Recorded Audio'} ({(audioBlob.size / 1024).toFixed(1)}KB)
              </span>
              <button
                onClick={() => setAudioBlob(null)}
                className="ml-auto text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {t.clear[lang]}
          </button>

          <button
            onClick={handleSubmit}
            disabled={processingState.isProcessing || (!input.trim() && !selectedImage && !audioBlob)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {processingState.isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {t.processing[lang]}
              </>
            ) : (
              <>
                <Send size={16} />
                {t.send[lang]}
              </>
            )}
          </button>
        </div>

        {/* 처리 진행 상태 */}
        {processingState.isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">{processingState.currentStep}</span>
              <span className="text-slate-500">{processingState.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingState.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 응답 영역 */}
      {response && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-4">
          {/* 메인 응답 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-slate-900 dark:text-white">AI 응답</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {t.confidence[lang]}: {(response.confidence * 100).toFixed(1)}%
                </span>
                
                {response.text && (
                  <button
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {response.text}
            </p>
          </div>

          {/* 사용된 모달리티 */}
          {response.modalities.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t.modalities[lang]}:
              </span>
              {response.modalities.map((modality: string) => (
                <span
                  key={modality}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs"
                >
                  {modality}
                </span>
              ))}
            </div>
          )}

          {/* 인사이트 */}
          {response.insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {t.insights[lang]}
              </h4>
              
              <div className="space-y-2">
                {response.insights.map((insight: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {insight.type === 'voice_command' && <Mic className="w-4 h-4 text-blue-500" />}
                      {insight.type === 'image_recognition' && <ImageIcon className="w-4 h-4 text-green-500" />}
                      {insight.type === 'document_analysis' && <FileText className="w-4 h-4 text-orange-500" />}
                      {insight.type === 'context_understanding' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {t[insight.type as keyof typeof t]?.[lang] || insight.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {(insight.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추천 액션 */}
          {response.actions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                {t.actions[lang]}
              </h4>
              
              <div className="space-y-2">
                {response.actions.map((action: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {action.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          action.priority === 'high' ? 'bg-red-100 text-red-600' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultimodalAIAssistant;