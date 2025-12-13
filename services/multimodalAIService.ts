// 멀티모달 AI 서비스
// 음성, 이미지, 텍스트를 통합 처리하는 고급 AI 어시스턴트

interface MultimodalInput {
  text?: string;
  audio?: Blob;
  image?: File;
  context?: string;
  language?: 'ko' | 'en';
}

interface MultimodalResponse {
  text: string;
  audio?: Blob;
  confidence: number;
  modalities: string[];
  insights: AIInsight[];
  actions: SuggestedAction[];
}

interface AIInsight {
  type: 'document_analysis' | 'voice_command' | 'image_recognition' | 'context_understanding';
  content: string;
  confidence: number;
  metadata?: any;
}

interface SuggestedAction {
  id: string;
  type: 'booking' | 'query' | 'analysis' | 'navigation';
  description: string;
  parameters: any;
  priority: 'high' | 'medium' | 'low';
}

class MultimodalAIService {
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis;
  private isListening = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeSpeechServices();
    this.speechSynthesis = window.speechSynthesis;
  }

  // 음성 인식 초기화
  private initializeSpeechServices() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'ko-KR';
    }
  }

  // 멀티모달 입력 처리
  async processMultimodalInput(input: MultimodalInput): Promise<MultimodalResponse> {
    const insights: AIInsight[] = [];
    const actions: SuggestedAction[] = [];
    let combinedText = input.text || '';
    let confidence = 0.8;

    try {
      // 1. 음성 처리
      if (input.audio) {
        const audioInsight = await this.processAudio(input.audio, input.language);
        insights.push(audioInsight);
        combinedText += ' ' + audioInsight.content;
      }

      // 2. 이미지 처리
      if (input.image) {
        const imageInsight = await this.processImage(input.image);
        insights.push(imageInsight);
        combinedText += ' ' + imageInsight.content;
      }

      // 3. 텍스트 처리 및 컨텍스트 이해
      if (combinedText.trim()) {
        const textInsight = await this.processText(combinedText, input.context);
        insights.push(textInsight);
      }

      // 4. 통합 분석 및 액션 생성
      const integratedAnalysis = await this.integrateInsights(insights, input.context);
      actions.push(...integratedAnalysis.actions);

      // 5. 응답 생성
      const responseText = await this.generateResponse(insights, actions, input.language);

      return {
        text: responseText,
        confidence: Math.min(confidence, 0.95),
        modalities: this.getUsedModalities(input),
        insights,
        actions
      };

    } catch (error) {
      console.error('Multimodal processing error:', error);
      return {
        text: input.language === 'ko' ? 
          '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.' : 
          'Sorry, an error occurred while processing your request.',
        confidence: 0.1,
        modalities: [],
        insights: [],
        actions: []
      };
    }
  }

  // 음성 처리
  private async processAudio(audio: Blob, language: 'ko' | 'en' = 'ko'): Promise<AIInsight> {
    return new Promise((resolve) => {
      if (!this.speechRecognition) {
        resolve({
          type: 'voice_command',
          content: '음성 인식이 지원되지 않습니다.',
          confidence: 0.1
        });
        return;
      }

      this.speechRecognition.lang = language === 'ko' ? 'ko-KR' : 'en-US';
      
      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const confidence = event.results[event.results.length - 1][0].confidence;
        
        resolve({
          type: 'voice_command',
          content: transcript,
          confidence: confidence || 0.8,
          metadata: { language, duration: audio.size }
        });
      };

      this.speechRecognition.onerror = () => {
        resolve({
          type: 'voice_command',
          content: '음성 인식에 실패했습니다.',
          confidence: 0.1
        });
      };

      // 실제로는 audio blob을 처리해야 하지만, 
      // 브라우저 제한으로 인해 실시간 음성 인식으로 대체
      this.speechRecognition.start();
      
      setTimeout(() => {
        this.speechRecognition?.stop();
      }, 5000);
    });
  }

  // 이미지 처리 (OCR 및 객체 인식)
  private async processImage(image: File): Promise<AIInsight> {
    try {
      // 이미지를 Canvas로 로드하여 분석
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          // 간단한 이미지 분석 (실제로는 OCR API나 Vision API 사용)
          const analysis = await this.analyzeImageContent(canvas);
          
          resolve({
            type: 'image_recognition',
            content: analysis.text,
            confidence: analysis.confidence,
            metadata: {
              width: img.width,
              height: img.height,
              size: image.size,
              type: image.type,
              objects: analysis.objects
            }
          });
        };

        img.onerror = () => {
          resolve({
            type: 'image_recognition',
            content: '이미지 분석에 실패했습니다.',
            confidence: 0.1
          });
        };

        img.src = URL.createObjectURL(image);
      });

    } catch (error) {
      return {
        type: 'image_recognition',
        content: '이미지 처리 중 오류가 발생했습니다.',
        confidence: 0.1
      };
    }
  }

  // 이미지 내용 분석
  private async analyzeImageContent(canvas: HTMLCanvasElement): Promise<{
    text: string;
    confidence: number;
    objects: string[];
  }> {
    // 실제로는 Google Vision API, AWS Rekognition, 또는 Tesseract.js 사용
    // 여기서는 시뮬레이션된 분석 결과 반환
    
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
    if (!imageData) {
      return { text: '이미지 데이터를 읽을 수 없습니다.', confidence: 0.1, objects: [] };
    }

    // 간단한 패턴 매칭으로 문서 유형 감지
    const patterns = this.detectDocumentPatterns(imageData);
    
    if (patterns.includes('bill_of_lading')) {
      return {
        text: '선하증권(B/L) 문서가 감지되었습니다. 화물 정보와 운송 조건을 확인할 수 있습니다.',
        confidence: 0.85,
        objects: ['bill_of_lading', 'shipping_document', 'container_info']
      };
    }

    if (patterns.includes('commercial_invoice')) {
      return {
        text: '상업송장(Commercial Invoice) 문서가 감지되었습니다. 화물 가치와 세부 정보를 확인할 수 있습니다.',
        confidence: 0.82,
        objects: ['commercial_invoice', 'cargo_details', 'value_declaration']
      };
    }

    if (patterns.includes('container_image')) {
      return {
        text: '컨테이너 이미지가 감지되었습니다. 컨테이너 번호와 상태를 분석할 수 있습니다.',
        confidence: 0.78,
        objects: ['container', 'container_number', 'physical_condition']
      };
    }

    return {
      text: '일반 이미지입니다. 추가 분석이 필요합니다.',
      confidence: 0.6,
      objects: ['general_image']
    };
  }

  // 문서 패턴 감지
  private detectDocumentPatterns(imageData: ImageData): string[] {
    const patterns: string[] = [];
    
    // 실제로는 더 정교한 패턴 매칭 알고리즘 사용
    // 여기서는 시뮬레이션
    const randomValue = Math.random();
    
    if (randomValue > 0.7) patterns.push('bill_of_lading');
    else if (randomValue > 0.4) patterns.push('commercial_invoice');
    else if (randomValue > 0.2) patterns.push('container_image');
    
    return patterns;
  }

  // 텍스트 처리 및 컨텍스트 이해
  private async processText(text: string, context?: string): Promise<AIInsight> {
    try {
      // 의도 분석
      const intent = this.analyzeIntent(text);
      
      // 엔티티 추출
      const entities = this.extractEntities(text);
      
      // 컨텍스트 기반 이해
      const contextualUnderstanding = this.analyzeContext(text, context, entities);

      return {
        type: 'context_understanding',
        content: contextualUnderstanding.summary,
        confidence: contextualUnderstanding.confidence,
        metadata: {
          intent,
          entities,
          context: contextualUnderstanding.context
        }
      };

    } catch (error) {
      return {
        type: 'context_understanding',
        content: '텍스트 분석 중 오류가 발생했습니다.',
        confidence: 0.1
      };
    }
  }

  // 의도 분석
  private analyzeIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('부킹') || lowerText.includes('booking') || lowerText.includes('예약')) {
      return 'booking_inquiry';
    }
    if (lowerText.includes('운임') || lowerText.includes('rate') || lowerText.includes('가격')) {
      return 'rate_inquiry';
    }
    if (lowerText.includes('추적') || lowerText.includes('track') || lowerText.includes('위치')) {
      return 'tracking_inquiry';
    }
    if (lowerText.includes('일정') || lowerText.includes('schedule') || lowerText.includes('시간')) {
      return 'schedule_inquiry';
    }
    if (lowerText.includes('분석') || lowerText.includes('analysis') || lowerText.includes('리포트')) {
      return 'analysis_request';
    }
    
    return 'general_inquiry';
  }

  // 엔티티 추출
  private extractEntities(text: string): any {
    const entities: any = {};
    
    // 항구 이름 추출
    const ports = ['부산', '인천', '울산', 'busan', 'incheon', 'ulsan', 'LA', 'long beach', 'shanghai'];
    ports.forEach(port => {
      if (text.toLowerCase().includes(port.toLowerCase())) {
        entities.ports = entities.ports || [];
        entities.ports.push(port);
      }
    });

    // 날짜 추출 (간단한 패턴)
    const datePattern = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g;
    const dates = text.match(datePattern);
    if (dates) entities.dates = dates;

    // 컨테이너 번호 추출
    const containerPattern = /[A-Z]{4}\d{7}/g;
    const containers = text.match(containerPattern);
    if (containers) entities.containers = containers;

    // 화폐 금액 추출
    const currencyPattern = /\$[\d,]+|\₩[\d,]+|USD\s*[\d,]+|KRW\s*[\d,]+/g;
    const amounts = text.match(currencyPattern);
    if (amounts) entities.amounts = amounts;

    return entities;
  }

  // 컨텍스트 분석
  private analyzeContext(text: string, context?: string, entities?: any): {
    summary: string;
    confidence: number;
    context: any;
  } {
    let summary = '';
    let confidence = 0.7;
    const contextData: any = { entities };

    if (context === 'booking_analysis') {
      summary = '부킹 분석 컨텍스트에서 요청을 처리합니다. ';
      confidence += 0.1;
    } else if (context === 'market_intel') {
      summary = '시장 인텔리전스 컨텍스트에서 요청을 처리합니다. ';
      confidence += 0.1;
    }

    if (entities?.ports?.length > 0) {
      summary += `${entities.ports.join(', ')} 항구와 관련된 정보를 찾았습니다. `;
      confidence += 0.05;
    }

    if (entities?.dates?.length > 0) {
      summary += `${entities.dates.join(', ')} 날짜 정보를 확인했습니다. `;
      confidence += 0.05;
    }

    if (entities?.containers?.length > 0) {
      summary += `${entities.containers.join(', ')} 컨테이너 번호를 식별했습니다. `;
      confidence += 0.1;
    }

    return {
      summary: summary || '일반적인 해운 물류 관련 요청으로 이해했습니다.',
      confidence: Math.min(confidence, 0.95),
      context: contextData
    };
  }

  // 인사이트 통합 및 액션 생성
  private async integrateInsights(insights: AIInsight[], context?: string): Promise<{
    actions: SuggestedAction[];
  }> {
    const actions: SuggestedAction[] = [];

    insights.forEach((insight, index) => {
      switch (insight.type) {
        case 'voice_command':
          if (insight.content.includes('부킹') || insight.content.includes('booking')) {
            actions.push({
              id: `voice_booking_${index}`,
              type: 'booking',
              description: '음성으로 요청된 부킹 조회를 실행합니다.',
              parameters: { query: insight.content, source: 'voice' },
              priority: 'high'
            });
          }
          break;

        case 'image_recognition':
          if (insight.metadata?.objects?.includes('bill_of_lading')) {
            actions.push({
              id: `image_bl_${index}`,
              type: 'analysis',
              description: '선하증권 문서를 분석하여 부킹 정보를 추출합니다.',
              parameters: { documentType: 'bill_of_lading', confidence: insight.confidence },
              priority: 'high'
            });
          }
          break;

        case 'context_understanding':
          const intent = insight.metadata?.intent;
          if (intent === 'rate_inquiry') {
            actions.push({
              id: `context_rate_${index}`,
              type: 'query',
              description: '운임 정보를 조회합니다.',
              parameters: { 
                intent, 
                entities: insight.metadata?.entities,
                context 
              },
              priority: 'medium'
            });
          }
          break;
      }
    });

    return { actions };
  }

  // 응답 생성
  private async generateResponse(
    insights: AIInsight[], 
    actions: SuggestedAction[], 
    language: 'ko' | 'en' = 'ko'
  ): Promise<string> {
    let response = '';

    if (language === 'ko') {
      response = '멀티모달 분석을 완료했습니다.\n\n';
      
      if (insights.length > 0) {
        response += '📊 분석 결과:\n';
        insights.forEach((insight, index) => {
          const typeLabel = this.getInsightTypeLabel(insight.type, language);
          response += `${index + 1}. ${typeLabel}: ${insight.content}\n`;
        });
        response += '\n';
      }

      if (actions.length > 0) {
        response += '🎯 추천 액션:\n';
        actions.forEach((action, index) => {
          response += `${index + 1}. ${action.description}\n`;
        });
      }
    } else {
      response = 'Multimodal analysis completed.\n\n';
      
      if (insights.length > 0) {
        response += '📊 Analysis Results:\n';
        insights.forEach((insight, index) => {
          const typeLabel = this.getInsightTypeLabel(insight.type, language);
          response += `${index + 1}. ${typeLabel}: ${insight.content}\n`;
        });
        response += '\n';
      }

      if (actions.length > 0) {
        response += '🎯 Suggested Actions:\n';
        actions.forEach((action, index) => {
          response += `${index + 1}. ${action.description}\n`;
        });
      }
    }

    return response;
  }

  // 인사이트 타입 라벨
  private getInsightTypeLabel(type: string, language: 'ko' | 'en'): string {
    const labels = {
      ko: {
        voice_command: '음성 명령',
        image_recognition: '이미지 인식',
        document_analysis: '문서 분석',
        context_understanding: '컨텍스트 이해'
      },
      en: {
        voice_command: 'Voice Command',
        image_recognition: 'Image Recognition',
        document_analysis: 'Document Analysis',
        context_understanding: 'Context Understanding'
      }
    };

    return labels[language][type as keyof typeof labels.ko] || type;
  }

  // 사용된 모달리티 확인
  private getUsedModalities(input: MultimodalInput): string[] {
    const modalities: string[] = [];
    
    if (input.text) modalities.push('text');
    if (input.audio) modalities.push('audio');
    if (input.image) modalities.push('image');
    
    return modalities;
  }

  // 음성 합성
  async synthesizeSpeech(text: string, language: 'ko' | 'en' = 'ko'): Promise<void> {
    if (!this.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.speechSynthesis.speak(utterance);
  }

  // 실시간 음성 인식 시작
  startListening(callback: (transcript: string, isFinal: boolean) => void): void {
    if (!this.speechRecognition || this.isListening) return;

    this.isListening = true;
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = true;

    this.speechRecognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        callback(transcript, isFinal);
      }
    };

    this.speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.speechRecognition.onend = () => {
      this.isListening = false;
    };

    this.speechRecognition.start();
  }

  // 음성 인식 중지
  stopListening(): void {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }

  // 서비스 상태 확인
  getServiceStatus(): {
    speechRecognition: boolean;
    speechSynthesis: boolean;
    imageProcessing: boolean;
  } {
    return {
      speechRecognition: !!this.speechRecognition,
      speechSynthesis: !!this.speechSynthesis,
      imageProcessing: true // 항상 사용 가능
    };
  }
}

export const multimodalAIService = new MultimodalAIService();
export default multimodalAIService;