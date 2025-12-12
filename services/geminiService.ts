import { GoogleGenAI } from "@google/genai";
import { MarketInsight } from "../types";
import { openRouterService } from "./openRouterService";


const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey && apiKey !== 'PLACEHOLDER_API_KEY' ? new GoogleGenAI({ apiKey }) : null;

export const fetchMarketInsights = async (query: string): Promise<MarketInsight> => {
  // 1순위: OpenRouter (멀티 LLM)
  if (openRouterService.isConfigured()) {
    console.log('Using OpenRouter for market insights');
    try {
      return await openRouterService.analyzeMarket(query);
    } catch (error) {
      console.warn("OpenRouter failed, trying Gemini fallback:", error);
    }
  }

  // 2순위: Gemini API
  if (ai) {
    console.log('Using Gemini API for market insights');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: `해운 물류 시장에 대한 간결한 인텔리전스 보고서를 작성해줘. 주제: ${query}. 
        주요 지수(SCFI 등), 최근 이슈(홍해 사태 등), 또는 연료비 추세 등을 포함해. 
        물류 대시보드에 적합한 전문적인 톤으로 작성하고, 반드시 **한국어**로 답변해줘.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "인사이트를 생성할 수 없습니다.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources = chunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({ uri: web.uri, title: web.title }));

      const uniqueSources = Array.from(new Map(sources.map((s: any) => [s.uri, s])).values()) as { uri: string; title: string }[];

      return {
        title: "실시간 시장 분석",
        content: text,
        sources: uniqueSources
      };
    } catch (error) {
      console.error("Gemini API failed:", error);
    }
  }

  // 3순위: 기본 응답 (데모 모드)
  console.log('Using fallback data for market insights');
  return {
    summary: `${query}에 대한 시장 분석 결과입니다.`,
    trends: [
      { metric: '운임 지수', value: 2750, change: 5.2, trend: 'up' as const },
      { metric: '유가 변동', value: 72.5, change: -2.1, trend: 'down' as const },
      { metric: '환율 (USD/KRW)', value: 1470, change: 1.8, trend: 'up' as const }
    ],
    recommendations: [
      '현재 시장 상황을 고려한 운임 조정을 권장합니다.',
      '유가 하락으로 인한 비용 절감 효과를 활용하세요.',
      '환율 상승에 따른 리스크 관리가 필요합니다.'
    ],
    confidence: 0.75,
    lastUpdated: new Date()
  };
};

export const sendMessageToAI = async (message: string, context: string): Promise<string> => {
  // 1순위: OpenRouter (멀티 LLM)
  if (openRouterService.isConfigured()) {
    console.log('Using OpenRouter for chat');
    try {
      return await openRouterService.chat(message, context);
    } catch (error) {
      console.warn("OpenRouter failed, trying Gemini fallback:", error);
    }
  }

  // 2순위: Gemini API
  if (ai) {
    console.log('Using Gemini API for chat');
    try {
      const prompt = `당신은 KMTC(고려해운)의 온톨로지 기반 부킹 에이전틱AI 플랫폼 AI 어시스턴트입니다.
      
[현재 화면 맥락]: ${context}

사용자의 질문: "${message}"

역할:
1. 해운 물류 전문가로서 답변하세요.
2. 현재 화면의 데이터 맥락을 고려하여 구체적인 조언을 제공하세요.
3. 답변은 간결하고 명확하게, 한국어로 제공하세요.
4. 필요하다면 마크다운(Markdown) 형식을 사용하여 가독성을 높이세요.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });

      return response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
    } catch (error) {
      console.error("Gemini API failed:", error);
    }
  }

  // 3순위: 기본 응답 (데모 모드)
  console.log('Using fallback response for chat');
  
  // 간단한 키워드 기반 응답
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('운임') || lowerMessage.includes('요금')) {
    return '현재 운임 시장은 계절적 요인과 유가 변동의 영향을 받고 있습니다. 구체적인 항로와 화물 종류를 알려주시면 더 정확한 분석을 제공할 수 있습니다.';
  } else if (lowerMessage.includes('예측') || lowerMessage.includes('전망')) {
    return 'AI 기반 예측 모델을 통해 향후 2-4주간의 시장 동향을 분석하고 있습니다. 현재 데이터를 바탕으로 안정적인 상승세가 예상됩니다.';
  } else if (lowerMessage.includes('리스크') || lowerMessage.includes('위험')) {
    return '현재 주요 리스크 요인으로는 유가 변동성, 환율 불안정성, 그리고 지정학적 긴장이 있습니다. 리스크 관리 전략을 수립하는 것이 중요합니다.';
  } else {
    return `"${message}"에 대한 질문을 받았습니다. 해운 물류 전문가로서 도움을 드리겠습니다. 더 구체적인 정보를 제공해주시면 정확한 답변을 드릴 수 있습니다.`;
  }
};
