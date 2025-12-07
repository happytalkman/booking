import { GoogleGenAI } from "@google/genai";
import { MarketInsight } from "../types";

const apiKey = process.env.API_KEY || '';
// Safe initialization
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const fetchMarketInsights = async (query: string): Promise<MarketInsight> => {
  if (!ai) {
    return {
      title: "API 키 누락",
      content: "실시간 시장 데이터를 가져오려면 유효한 Google Gemini API 키를 제공해주세요.",
      sources: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    // Remove duplicates based on URI
    const uniqueSources = Array.from(new Map(sources.map((s: any) => [s.uri, s])).values()) as { uri: string; title: string }[];

    return {
      title: "실시간 시장 분석",
      content: text,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Error fetching market insights:", error);
    return {
      title: "데이터 가져오기 오류",
      content: "지금은 시장 인사이트를 가져올 수 없습니다. 나중에 다시 시도해주세요.",
      sources: []
    };
  }
};

export const sendMessageToAI = async (message: string, context: string): Promise<string> => {
  if (!ai) {
    return "API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.";
  }

  try {
    const prompt = `
      당신은 KMTC(고려해운)의 부킹 최적화 플랫폼 AI 어시스턴트입니다.
      
      [현재 화면 맥락]: ${context}
      
      사용자의 질문: "${message}"
      
      역할:
      1. 해운 물류 전문가로서 답변하세요.
      2. 현재 화면의 데이터 맥락을 고려하여 구체적인 조언을 제공하세요.
      3. 답변은 간결하고 명확하게, 한국어로 제공하세요.
      4. 필요하다면 마크다운(Markdown) 형식을 사용하여 가독성을 높이세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "죄송합니다. 답변을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};