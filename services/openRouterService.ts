// OpenRouter Multi-LLM Service
// Supports multiple AI models with fallback mechanism

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Available models with their characteristics
export const AI_MODELS = {
  // Fast and cost-effective for simple queries
  FAST: 'google/gemini-2.0-flash-exp:free',
  // Balanced performance for general use
  BALANCED: 'anthropic/claude-3.5-sonnet',
  // Most capable for complex analysis
  ADVANCED: 'openai/gpt-4-turbo',
  // Free alternative
  FREE: 'meta-llama/llama-3.1-8b-instruct:free'
} as const;

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private fallbackModels = [
    AI_MODELS.FAST,
    AI_MODELS.FREE,
    AI_MODELS.BALANCED
  ];

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  private async callAPI(
    messages: OpenRouterMessage[],
    model: string,
    temperature = 0.7
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API 키가 설정되지 않았습니다.');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'KMTC Booking Optimization Platform'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 오류 (${response.status}): ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
  }

  async chat(
    userMessage: string,
    context: string,
    systemPrompt?: string,
    preferredModel: string = AI_MODELS.FAST
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: systemPrompt || `당신은 KMTC(고려해운)의 온톨로지 기반 부킹 에이전틱AI 플랫폼 AI 어시스턴트입니다.
해운 물류 전문가로서 사용자를 돕습니다.
현재 화면 맥락: ${context}

답변 규칙:
1. 간결하고 명확하게 한국어로 답변
2. 현재 화면의 데이터를 고려한 구체적인 조언 제공
3. 필요시 마크다운 형식 사용
4. 전문적이면서도 친근한 톤 유지`
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Try preferred model first, then fallback models
    const modelsToTry = [preferredModel, ...this.fallbackModels.filter(m => m !== preferredModel)];

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}`);
        return await this.callAPI(messages, model);
      } catch (error) {
        console.warn(`Model ${model} failed:`, error);
        // Continue to next model
      }
    }

    // If all models fail, return error message
    return '죄송합니다. 현재 AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  }

  async analyzeMarket(query: string): Promise<{
    title: string;
    content: string;
    sources: Array<{ uri: string; title: string }>;
  }> {
    const systemPrompt = `당신은 해운 물류 시장 분석 전문가입니다.
주어진 주제에 대해 전문적인 시장 인텔리전스 보고서를 작성합니다.

포함할 내용:
- 주요 해운 지수 (SCFI, BDI 등)
- 최근 시장 이슈 (홍해 사태, 파나마 운하 등)
- 연료비 및 운임 추세
- 실용적인 인사이트

반드시 한국어로 작성하고, 물류 대시보드에 적합한 전문적인 톤을 유지하세요.`;

    try {
      const content = await this.chat(
        `다음 주제에 대한 해운 시장 분석 보고서를 작성해주세요: ${query}`,
        '시장 인텔리전스',
        systemPrompt,
        AI_MODELS.BALANCED
      );

      return {
        title: '실시간 시장 분석',
        content,
        sources: [] // OpenRouter doesn't provide grounding by default
      };
    } catch (error) {
      console.error('Market analysis error:', error);
      return {
        title: '데이터 가져오기 오류',
        content: '지금은 시장 인사이트를 가져올 수 없습니다. 나중에 다시 시도해주세요.',
        sources: []
      };
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_openrouter_api_key_here';
  }
}

export const openRouterService = new OpenRouterService();
