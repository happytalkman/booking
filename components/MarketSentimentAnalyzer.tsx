import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MessageCircle, Globe, AlertTriangle, Zap, BarChart3, Calendar, Eye, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  publishedAt: Date;
  sentiment: {
    score: number; // -1 to 1
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  impact: 'high' | 'medium' | 'low';
  keywords: string[];
  category: 'shipping' | 'economy' | 'geopolitical' | 'trade' | 'energy';
}

interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'linkedin' | 'reddit';
  content: string;
  author: string;
  publishedAt: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  influence: number; // 0-1 scale
}

interface MarketEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'rate_change' | 'policy_update' | 'trade_dispute' | 'natural_disaster' | 'economic_indicator';
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: Date;
  sources: string[];
  predictedImpact: {
    direction: 'positive' | 'negative' | 'neutral';
    magnitude: number; // 0-1 scale
    timeframe: 'immediate' | 'short_term' | 'long_term';
  };
  affectedRoutes: string[];
}

interface SentimentIndex {
  overall: number; // -1 to 1
  categories: {
    shipping: number;
    economy: number;
    geopolitical: number;
    trade: number;
    energy: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  volatility: number;
  lastUpdated: Date;
}

interface MarketSentimentAnalyzerProps {
  lang: Language;
}

const MarketSentimentAnalyzer: React.FC<MarketSentimentAnalyzerProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'social' | 'events'>('overview');
  const [sentimentIndex, setSentimentIndex] = useState<SentimentIndex | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const t = {
    title: { ko: '시장 감정 분석', en: 'Market Sentiment Analysis' },
    subtitle: { ko: '뉴스 및 소셜 미디어 기반 시장 심리 분석', en: 'News and social media based market psychology analysis' },
    
    // Tabs
    overview: { ko: '개요', en: 'Overview' },
    news: { ko: '뉴스 분석', en: 'News Analysis' },
    social: { ko: '소셜 미디어', en: 'Social Media' },
    events: { ko: '시장 이벤트', en: 'Market Events' },
    
    // Sentiment
    sentimentIndex: { ko: '감정 지수', en: 'Sentiment Index' },
    positive: { ko: '긍정적', en: 'Positive' },
    negative: { ko: '부정적', en: 'Negative' },
    neutral: { ko: '중립적', en: 'Neutral' },
    
    // Categories
    shipping: { ko: '해운', en: 'Shipping' },
    economy: { ko: '경제', en: 'Economy' },
    geopolitical: { ko: '지정학', en: 'Geopolitical' },
    trade: { ko: '무역', en: 'Trade' },
    energy: { ko: '에너지', en: 'Energy' },
    
    // Trends
    improving: { ko: '개선', en: 'Improving' },
    declining: { ko: '악화', en: 'Declining' },
    stable: { ko: '안정', en: 'Stable' },
    
    // Impact
    high: { ko: '높음', en: 'High' },
    medium: { ko: '중간', en: 'Medium' },
    low: { ko: '낮음', en: 'Low' },
    
    // Severity
    critical: { ko: '심각', en: 'Critical' },
    
    // Timeframe
    immediate: { ko: '즉시', en: 'Immediate' },
    short_term: { ko: '단기', en: 'Short Term' },
    long_term: { ko: '장기', en: 'Long Term' },
    
    // Actions
    refresh: { ko: '새로고침', en: 'Refresh' },
    autoRefresh: { ko: '자동 새로고침', en: 'Auto Refresh' },
    viewDetails: { ko: '상세 보기', en: 'View Details' },
    
    // Stats
    totalNews: { ko: '총 뉴스', en: 'Total News' },
    totalPosts: { ko: '총 게시물', en: 'Total Posts' },
    totalEvents: { ko: '총 이벤트', en: 'Total Events' },
    lastUpdated: { ko: '마지막 업데이트', en: 'Last Updated' }
  };

  useEffect(() => {
    loadSentimentData();
    
    if (autoRefresh) {
      const interval = setInterval(loadSentimentData, 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadSentimentData = async () => {
    setLoading(true);
    try {
      // Simulate loading sentiment data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock sentiment index
      setSentimentIndex({
        overall: 0.15, // Slightly positive
        categories: {
          shipping: 0.25,
          economy: 0.10,
          geopolitical: -0.20,
          trade: 0.30,
          energy: -0.05
        },
        trend: 'improving',
        volatility: 0.15,
        lastUpdated: new Date()
      });

      // Mock news items
      setNewsItems(generateMockNews());
      
      // Mock social media posts
      setSocialPosts(generateMockSocialPosts());
      
      // Mock market events
      setMarketEvents(generateMockEvents());
      
    } catch (error) {
      console.error('Error loading sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockNews = (): NewsItem[] => {
    const mockNews = [
      {
        id: '1',
        title: lang === 'ko' ? '글로벌 해운업계, 2024년 4분기 실적 개선 전망' : 'Global Shipping Industry Shows Q4 2024 Performance Improvement',
        content: lang === 'ko' ? '주요 선사들의 실적이 개선되고 있으며...' : 'Major shipping companies are showing improved performance...',
        source: 'Maritime Executive',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sentiment: { score: 0.7, label: 'positive' as const, confidence: 0.85 },
        impact: 'high' as const,
        keywords: ['shipping', 'performance', 'Q4', 'improvement'],
        category: 'shipping' as const
      },
      {
        id: '2',
        title: lang === 'ko' ? '홍해 위기 지속, 운임 상승 압력 증가' : 'Red Sea Crisis Continues, Freight Rate Pressure Increases',
        content: lang === 'ko' ? '홍해 지역의 불안정으로 인해...' : 'Instability in the Red Sea region causes...',
        source: 'Lloyd\'s List',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        sentiment: { score: -0.6, label: 'negative' as const, confidence: 0.90 },
        impact: 'high' as const,
        keywords: ['Red Sea', 'crisis', 'freight rates', 'geopolitical'],
        category: 'geopolitical' as const
      },
      {
        id: '3',
        title: lang === 'ko' ? '중국 경제 회복 신호, 컨테이너 물동량 증가' : 'China Economic Recovery Signals, Container Volume Increases',
        content: lang === 'ko' ? '중국의 경제 회복 신호와 함께...' : 'With signs of China\'s economic recovery...',
        source: 'TradeWinds',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        sentiment: { score: 0.5, label: 'positive' as const, confidence: 0.75 },
        impact: 'medium' as const,
        keywords: ['China', 'economy', 'recovery', 'container volume'],
        category: 'economy' as const
      }
    ];
    
    return mockNews;
  };

  const generateMockSocialPosts = (): SocialMediaPost[] => {
    return [
      {
        id: '1',
        platform: 'twitter',
        content: 'Shipping rates are finally stabilizing after months of volatility. Good news for importers! #shipping #logistics',
        author: '@ShippingExpert',
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        engagement: { likes: 45, shares: 12, comments: 8 },
        sentiment: { score: 0.6, label: 'positive', confidence: 0.80 },
        influence: 0.7
      },
      {
        id: '2',
        platform: 'linkedin',
        content: 'The ongoing supply chain disruptions are creating new challenges for global trade...',
        author: 'Maritime Analyst',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        engagement: { likes: 123, shares: 34, comments: 21 },
        sentiment: { score: -0.3, label: 'negative', confidence: 0.70 },
        influence: 0.8
      }
    ];
  };

  const generateMockEvents = (): MarketEvent[] => {
    return [
      {
        id: '1',
        title: lang === 'ko' ? '유가 급등 감지' : 'Oil Price Surge Detected',
        description: lang === 'ko' ? '브렌트유 가격이 지난 24시간 동안 5% 상승' : 'Brent oil price increased 5% in the last 24 hours',
        eventType: 'economic_indicator',
        severity: 'high',
        detectedAt: new Date(Date.now() - 30 * 60 * 1000),
        sources: ['Reuters', 'Bloomberg', 'MarketWatch'],
        predictedImpact: {
          direction: 'negative',
          magnitude: 0.7,
          timeframe: 'short_term'
        },
        affectedRoutes: ['kr-la', 'kr-eu', 'kr-ny']
      },
      {
        id: '2',
        title: lang === 'ko' ? '새로운 무역 협정 발표' : 'New Trade Agreement Announced',
        description: lang === 'ko' ? '아시아-태평양 지역 새로운 무역 협정 체결' : 'New Asia-Pacific trade agreement signed',
        eventType: 'policy_update',
        severity: 'medium',
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sources: ['Trade.gov', 'WTO', 'Financial Times'],
        predictedImpact: {
          direction: 'positive',
          magnitude: 0.5,
          timeframe: 'long_term'
        },
        affectedRoutes: ['kr-la', 'kr-jp']
      }
    ];
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'text-green-600 dark:text-green-400';
    if (score < -0.2) return 'text-red-600 dark:text-red-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getSentimentBg = (score: number) => {
    if (score > 0.2) return 'bg-green-50 dark:bg-green-900/20';
    if (score < -0.2) return 'bg-red-50 dark:bg-red-900/20';
    return 'bg-slate-50 dark:bg-slate-700';
  };

  const formatSentimentScore = (score: number) => {
    return (score * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600 dark:text-slate-400">Loading sentiment analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold">{t.title[lang]}</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle[lang]}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              {t.autoRefresh[lang]}
            </label>
            <button
              onClick={loadSentimentData}
              className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex space-x-8">
            {(['overview', 'news', 'social', 'events'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {t[tab][lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && sentimentIndex && (
        <div className="space-y-6">
          {/* Overall Sentiment Index */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              {t.sentimentIndex[lang]}
            </h4>
            
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getSentimentBg(sentimentIndex.overall)}`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getSentimentColor(sentimentIndex.overall)}`}>
                    {formatSentimentScore(sentimentIndex.overall)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {sentimentIndex.overall > 0.2 ? t.positive[lang] : 
                     sentimentIndex.overall < -0.2 ? t.negative[lang] : t.neutral[lang]}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(sentimentIndex.categories).map(([category, score]) => (
                <div key={category} className={`p-3 rounded-lg ${getSentimentBg(score)}`}>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t[category as keyof typeof t][lang]}</p>
                  <p className={`text-lg font-bold ${getSentimentColor(score)}`}>
                    {formatSentimentScore(score)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Trend: {t[sentimentIndex.trend][lang]}</span>
              <span>Volatility: {(sentimentIndex.volatility * 100).toFixed(1)}%</span>
              <span>{t.lastUpdated[lang]}: {sentimentIndex.lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalNews[lang]}</p>
                  <p className="text-2xl font-bold text-blue-600">{newsItems.length}</p>
                </div>
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalPosts[lang]}</p>
                  <p className="text-2xl font-bold text-green-600">{socialPosts.length}</p>
                </div>
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalEvents[lang]}</p>
                  <p className="text-2xl font-bold text-purple-600">{marketEvents.length}</p>
                </div>
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Trend</p>
                  <p className={`text-2xl font-bold ${getSentimentColor(sentimentIndex.overall)}`}>
                    {sentimentIndex.overall > 0 ? '↗' : sentimentIndex.overall < 0 ? '↘' : '→'}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            {newsItems.map(news => (
              <div key={news.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-sm flex-1 mr-4">{news.title}</h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      news.sentiment.label === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      news.sentiment.label === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {t[news.sentiment.label][lang]}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      news.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      news.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {t[news.impact][lang]}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{news.content}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>{news.source}</span>
                    <span>{news.publishedAt.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-1">
                    {news.keywords.map(keyword => (
                      <span key={keyword} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            {socialPosts.map(post => (
              <div key={post.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">@{post.author}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                      {post.platform}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    post.sentiment.label === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    post.sentiment.label === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {formatSentimentScore(post.sentiment.score)}
                  </span>
                </div>
                
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{post.content}</p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>❤️ {post.engagement.likes}</span>
                    <span>🔄 {post.engagement.shares}</span>
                    <span>💬 {post.engagement.comments}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Influence: {(post.influence * 100).toFixed(0)}%</span>
                    <span>{post.publishedAt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            {marketEvents.map(event => (
              <div key={event.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-sm mb-1">{event.title}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      event.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      event.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                      event.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {t[event.severity][lang]}
                    </span>
                  </div>
                </div>

                {/* Impact Prediction */}
                <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Predicted Impact</span>
                    <span className={`text-sm font-semibold ${
                      event.predictedImpact.direction === 'positive' ? 'text-green-600' :
                      event.predictedImpact.direction === 'negative' ? 'text-red-600' :
                      'text-slate-600'
                    }`}>
                      {event.predictedImpact.direction === 'positive' ? '↗' : 
                       event.predictedImpact.direction === 'negative' ? '↘' : '→'}
                      {(event.predictedImpact.magnitude * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Timeframe: {t[event.predictedImpact.timeframe][lang]} • 
                    Routes: {event.affectedRoutes.join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{event.detectedAt.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-1">
                    {event.sources.map(source => (
                      <span key={source} className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-[10px]">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSentimentAnalyzer;