import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, BookOpen, TrendingUp, Brain, Zap } from 'lucide-react';
import { sendMessageToAI } from '../services/geminiService';
import { ragService } from '../services/ragService';
import { ChatMessage, Language } from '../types';
import { useApp } from '../contexts/AppContext';


interface AIChatAssistantProps {
  currentContext: string; // The active page or data context
  lang: Language;
}

interface EnhancedChatMessage extends ChatMessage {
  sources?: string[];
  confidence?: number;
  isRAGResponse?: boolean;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ currentContext, lang }) => {
  const { isChatOpen, setIsChatOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  
  // Sync with global state
  useEffect(() => {
    setIsOpen(isChatOpen);
  }, [isChatOpen]);
  
  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setIsChatOpen(newState);
  };
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isRAGMode, setIsRAGMode] = useState(true);
  const [userPatterns, setUserPatterns] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Initialize chat and load user patterns
  useEffect(() => {
    const initializeChat = async () => {
      // Load user patterns
      const patterns = ragService.analyzeUserPatterns('user_001');
      setUserPatterns(patterns);
      
      // Get personalized recommendations
      const recommendations = ragService.generatePersonalizedRecommendations('user_001');
      
      const welcomeMessage: EnhancedChatMessage = {
        id: 'welcome',
        role: 'ai',
        text: lang === 'ko' 
          ? `안녕하세요! 저는 고급 KMTC AI 어시스턴트입니다. 🚀\n\n현재 ${currentContext} 화면을 보고 계시네요.\n\n📊 개인화된 분석:\n• 선호 항로: ${patterns.preferredRoutes.join(', ') || '분석 중...'}\n• 평균 부킹 규모: ${patterns.averageBookingSize || 0} TEU\n• 총 절약액: $${patterns.costSavings.toLocaleString()}\n\n무엇을 도와드릴까요?` 
          : `Hello! I'm your advanced KMTC AI Assistant! 🚀\n\nYou are viewing ${currentContext}.\n\n📊 Personalized Analysis:\n• Preferred Routes: ${patterns.preferredRoutes.join(', ') || 'Analyzing...'}\n• Average Booking Size: ${patterns.averageBookingSize || 0} TEU\n• Total Savings: $${patterns.costSavings.toLocaleString()}\n\nHow can I help you?`,
        timestamp: new Date(),
        suggestions: recommendations.length > 0 ? recommendations : (lang === 'ko' ? [
          '내 부킹 패턴 분석해줘',
          '최적 부킹 전략 추천해줘',
          '비용 절약 방법은?'
        ] : [
          'Analyze my booking patterns',
          'Recommend optimal booking strategy',
          'How to save costs?'
        ]),
        isRAGResponse: true,
        confidence: 0.9
      };
      
      setMessages([welcomeMessage]);
    };
    
    if (messages.length === 0) {
      initializeChat();
    }
  }, [currentContext, lang, messages.length]);

  // Format AI response - remove markdown and improve readability
  const formatResponse = (text: string): string => {
    return text
      // Remove markdown headers (##, ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold (**text**)
      .replace(/\*\*(.+?)\*\*/g, '$1')
      // Remove markdown italic (*text*)
      .replace(/\*(.+?)\*/g, '$1')
      // Remove markdown lists (-, *)
      .replace(/^[\-\*]\s+/gm, '• ')
      // Clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Generate contextual suggestions based on response
  const generateSuggestions = (responseText: string, userQuestion: string): string[] => {
    const lowerResponse = responseText.toLowerCase();
    const lowerQuestion = userQuestion.toLowerCase();

    if (lang === 'ko') {
      // Context-based suggestions in Korean
      if (lowerResponse.includes('운임') || lowerQuestion.includes('운임')) {
        return ['운임 추세는 어떻게 되나요?', '경쟁사 운임과 비교해줘', '운임 절감 방법은?'];
      }
      if (lowerResponse.includes('리스크') || lowerQuestion.includes('리스크')) {
        return ['리스크 완화 방법은?', '가장 큰 리스크는 뭐야?', '리스크 모니터링 방법은?'];
      }
      if (lowerResponse.includes('부킹') || lowerQuestion.includes('부킹')) {
        return ['최적 부킹 시점은?', '부킹 취소율 개선 방법은?', '부킹 예측 정확도는?'];
      }
      if (lowerResponse.includes('경쟁사') || lowerQuestion.includes('경쟁사')) {
        return ['우리의 경쟁 우위는?', '시장 점유율 높이는 방법은?', '경쟁사 전략 분석해줘'];
      }
      if (lowerResponse.includes('kpi') || lowerQuestion.includes('지표')) {
        return ['KPI 개선 방법은?', '목표 달성 가능성은?', '핵심 지표 추천해줘'];
      }
      // Default suggestions
      return ['더 자세히 설명해줘', '실행 가능한 조치는?', '다른 관점에서 분석해줘'];
    } else {
      // Context-based suggestions in English
      if (lowerResponse.includes('rate') || lowerQuestion.includes('rate')) {
        return ['What is the rate trend?', 'Compare with competitors', 'How to reduce costs?'];
      }
      if (lowerResponse.includes('risk') || lowerQuestion.includes('risk')) {
        return ['How to mitigate risks?', 'What is the biggest risk?', 'Risk monitoring methods?'];
      }
      if (lowerResponse.includes('booking') || lowerQuestion.includes('booking')) {
        return ['Optimal booking timing?', 'Improve cancellation rate?', 'Booking prediction accuracy?'];
      }
      if (lowerResponse.includes('competitor') || lowerQuestion.includes('competitor')) {
        return ['Our competitive advantage?', 'Increase market share?', 'Analyze competitor strategy'];
      }
      if (lowerResponse.includes('kpi') || lowerQuestion.includes('metric')) {
        return ['How to improve KPIs?', 'Goal achievement likelihood?', 'Recommend key metrics'];
      }
      // Default suggestions
      return ['Explain in more detail', 'Actionable steps?', 'Analyze from different angle'];
    }
  };

  const handleSend = async (customInput?: string) => {
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    const userMsg: EnhancedChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let aiMsg: EnhancedChatMessage;
      
      if (isRAGMode) {
        // Use RAG-enhanced response
        const ragResponse = await ragService.generateRAGResponse(
          messageText, 
          currentContext, 
          'user_001'
        );
        
        const formattedText = formatResponse(ragResponse.response);
        
        aiMsg = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: formattedText,
          timestamp: new Date(),
          suggestions: ragResponse.recommendations,
          sources: ragResponse.sources,
          confidence: ragResponse.confidence,
          isRAGResponse: true
        };
      } else {
        // Use standard AI response
        const responseText = await sendMessageToAI(messageText, currentContext);
        const formattedText = formatResponse(responseText);
        const suggestions = generateSuggestions(formattedText, messageText);
        
        aiMsg = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: formattedText,
          timestamp: new Date(),
          suggestions,
          isRAGResponse: false
        };
      }
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error", error);
      
      // Fallback error message
      const errorMsg: EnhancedChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: lang === 'ko' 
          ? '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.' 
          : 'Sorry, there was a temporary error. Please try again.',
        timestamp: new Date(),
        confidence: 0.1
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-800 w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col mb-4 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  {isRAGMode ? <Brain className="w-4 h-4 text-yellow-300" /> : <Sparkles className="w-4 h-4 text-yellow-300" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    KMTC AI Assistant {isRAGMode && <span className="text-yellow-300">Pro</span>}
                  </h3>
                  <p className="text-[10px] text-blue-100 opacity-90">{currentContext}</p>
                </div>
              </div>
              <button onClick={handleToggle} className="hover:bg-white/20 p-1 rounded transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* RAG Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="w-3 h-3" />
                <span>Knowledge Base</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRAGMode}
                  onChange={(e) => setIsRAGMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.map((msg, index) => (
              <div key={msg.id}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-blue-100 dark:bg-blue-900'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600 dark:text-slate-300" /> : <Bot className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                    </div>
                    <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}>
                      {/* RAG Mode Indicator */}
                      {msg.role === 'ai' && msg.isRAGResponse && (
                        <div className="flex items-center gap-1 mb-2 text-xs text-blue-600 dark:text-blue-400">
                          <Brain className="w-3 h-3" />
                          <span>Knowledge Enhanced</span>
                          {msg.confidence && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-[10px]">
                              {Math.round(msg.confidence * 100)}% confident
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Format message with proper styling */}
                      {msg.text.split('\n').map((line, i) => {
                        // Check if line is a title (starts with number or is all caps)
                        const isTitle = /^[0-9]+\./.test(line) || (line.length > 0 && line === line.toUpperCase() && line.length < 50);
                        const isBullet = line.trim().startsWith('•');
                        
                        if (line.trim() === '') return <div key={i} className="h-2"></div>;
                        
                        return (
                          <div key={i} className={`${i > 0 ? 'mt-1' : ''}`}>
                            {isTitle ? (
                              <div className="font-bold text-base mb-1">{line}</div>
                            ) : isBullet ? (
                              <div className="ml-2">{line}</div>
                            ) : (
                              <div>{line}</div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Sources */}
                      {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Sources:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {msg.sources.map((source, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-[10px] rounded-full">
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Suggested Questions */}
                {msg.role === 'ai' && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && !isLoading && (
                  <div className="mt-3 ml-10 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {lang === 'ko' ? '💡 추천 질문:' : '💡 Suggested:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                   <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                   </div>
                   <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-xs text-slate-500">Thinking...</span>
                   </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-2">
            {/* Voice Assistant - Removed */}
            
            {/* Text Input */}
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={lang === 'ko' ? "무엇이든 물어보세요..." : "Ask anything..."}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={handleToggle}
        className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Chat (Ctrl+K)
          </span>
        )}
      </button>
    </div>
  );
};

export default AIChatAssistant;