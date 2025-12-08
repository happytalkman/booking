import React, { useState } from 'react';
import { 
  Network, TrendingUp, Shield, Database, MessageSquare, Video, 
  BarChart3, Users, Ship, ArrowRight, Sparkles, Brain, Eye, 
  Mic, Download, Share2, LayoutDashboard, Search, AlertTriangle,
  Zap, FileText, Globe, Target, CheckCircle2, Layers, Activity
} from 'lucide-react';
import { Language } from '../types';

interface HomeProps {
  lang: Language;
}

interface FeatureCard {
  id: string;
  icon: React.ReactNode;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  features: string[];
  color: string;
  category: string;
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = {
    title: { ko: '플랫폼 개요', en: 'Platform Overview' },
    subtitle: { ko: '온톨로지 기반 부킹 에이전틱AI 플랫폼의 모든 기능', en: 'All Features of Ontology-based Booking Agentic AI Platform' },
    allCategories: { ko: '전체', en: 'All' },
    categoryAI: { ko: 'AI 기능', en: 'AI Features' },
    categoryData: { ko: '데이터 분석', en: 'Data Analytics' },
    categoryViz: { ko: '시각화', en: 'Visualization' },
    categoryOther: { ko: '기타', en: 'Others' }
  };

  const categories = [
    { id: 'all', label: t.allCategories[lang], icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai', label: t.categoryAI[lang], icon: <Brain className="w-4 h-4" /> },
    { id: 'data', label: t.categoryData[lang], icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'viz', label: t.categoryViz[lang], icon: <Eye className="w-4 h-4" /> },
    { id: 'other', label: t.categoryOther[lang], icon: <Zap className="w-4 h-4" /> }
  ];

  const features: FeatureCard[] = [
    {
      id: 'ontology',
      icon: <Network className="w-8 h-8" />,
      title: { ko: '온톨로지 지식 그래프', en: 'Ontology Knowledge Graph' },
      description: { ko: 'OWL2 기반 해운 도메인 지식 모델링 및 시각화', en: 'OWL2-based shipping domain knowledge modeling' },
      features: ['7개 핵심 엔티티', '8개 주요 관계', 'Force/Radial 뷰', '드래그 가능한 노드', '실시간 링크 추적'],
      color: 'blue',
      category: 'viz'
    },
    {
      id: 'ai-chat',
      icon: <MessageSquare className="w-8 h-8" />,
      title: { ko: 'AI 챗봇 (멀티 LLM)', en: 'AI Chatbot (Multi-LLM)' },
      description: { ko: 'GPT-4, Claude, Gemini 등 여러 AI 모델 통합', en: 'Integrated GPT-4, Claude, Gemini models' },
      features: ['자동 폴백 시스템', '컨텍스트 인식', '마크다운 렌더링', '추천 질문', '대화 히스토리'],
      color: 'purple',
      category: 'ai'
    },
    {
      id: 'voice',
      icon: <Mic className="w-8 h-8" />,
      title: { ko: '음성 AI 어시스턴트', en: 'Voice AI Assistant' },
      description: { ko: 'Web Speech API 기반 음성 입력/출력', en: 'Voice input/output with Web Speech API' },
      features: ['음성 인식', '음성 합성 (1.3배 속도)', '핸즈프리 작업', '다국어 지원'],
      color: 'green',
      category: 'ai'
    },
    {
      id: 'ml-prediction',
      icon: <Brain className="w-8 h-8" />,
      title: { ko: 'ML 운임 예측', en: 'ML Freight Prediction' },
      description: { ko: 'TensorFlow.js 기반 30일 운임 예측', en: '30-day freight prediction with TensorFlow.js' },
      features: ['30일 예측', '영향 요인 분석', '신뢰도 구간', '과거 데이터 비교'],
      color: 'indigo',
      category: 'ai'
    },
    {
      id: 'video',
      icon: <Video className="w-8 h-8" />,
      title: { ko: '실시간 영상 모니터링', en: 'Live Video Monitoring' },
      description: { ko: '4개 카메라 라이브 피드 및 컨트롤', en: '4-camera live feed with controls' },
      features: ['4개 카메라 전환', '전체화면 모드', '스냅샷 캡처', '재생/일시정지', '실시간 상태'],
      color: 'red',
      category: 'other'
    },
    {
      id: 'kg-panel',
      icon: <Search className="w-8 h-8" />,
      title: { ko: '지식 그래프 인터랙티브 패널', en: 'KG Interactive Panel' },
      description: { ko: '검색, 질의응답, 상세정보, 인사이트 4개 탭', en: 'Search, Q&A, Details, Insights tabs' },
      features: ['자연어 검색', 'AI 질의응답', '노드 상세정보', '자동 인사이트', '멀티턴 대화'],
      color: 'cyan',
      category: 'ai'
    },
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: { ko: 'KPI 대시보드', en: 'KPI Dashboard' },
      description: { ko: '실시간 KPI 모니터링 및 드릴다운', en: 'Real-time KPI monitoring with drill-down' },
      features: ['프로그레스 바', '드릴다운 모달', 'AI 인사이트 카드', '목표 대비 분석', '이상치 탐지'],
      color: 'orange',
      category: 'viz'
    },
    {
      id: 'booking-rec',
      icon: <Target className="w-8 h-8" />,
      title: { ko: 'AI 부킹 추천', en: 'AI Booking Recommendation' },
      description: { ko: '3가지 액션 제공 (지금/대기/모니터링)', en: '3 action types (Now/Wait/Monitor)' },
      features: ['지금 부킹', '대기 권장', '모니터링', '근거 제시', '신뢰도 점수'],
      color: 'emerald',
      category: 'ai'
    },
    {
      id: 'alerts',
      icon: <AlertTriangle className="w-8 h-8" />,
      title: { ko: '실시간 알림', en: 'Real-time Alerts' },
      description: { ko: '4가지 알림 타입 및 조치 기능', en: '4 alert types with action features' },
      features: ['운임 하락 알림', '경쟁사 변경', '리스크 경고', '기회 포착', '조치하기 버튼'],
      color: 'amber',
      category: 'other'
    },
    {
      id: 'simulator',
      icon: <Activity className="w-8 h-8" />,
      title: { ko: '시나리오 시뮬레이터', en: 'Scenario Simulator' },
      description: { ko: '4개 변수 동시 조정 예측 시뮬레이터', en: '4-variable prediction simulator' },
      features: ['유가 변동', '홍해 리스크', '수요 변화', '환율 조정', '실시간 예측'],
      color: 'violet',
      category: 'data'
    },
    {
      id: 'competitor',
      icon: <Users className="w-8 h-8" />,
      title: { ko: '경쟁사 벤치마킹', en: 'Competitor Benchmark' },
      description: { ko: '5개 선사 실시간 비교 분석', en: '5-carrier real-time comparison' },
      features: ['운임 비교', '시장점유율', '정시도착률', '서비스 품질', '트렌드 분석'],
      color: 'pink',
      category: 'data'
    },
    {
      id: 'historical',
      icon: <TrendingUp className="w-8 h-8" />,
      title: { ko: '과거 데이터 비교', en: 'Historical Comparison' },
      description: { ko: '6개월/1년 운임 추세 분석', en: '6-month/1-year freight trend analysis' },
      features: ['인터랙티브 차트', '기간 선택', '항로별 비교', '계절성 분석'],
      color: 'teal',
      category: 'data'
    },
    {
      id: 'shacl',
      icon: <Shield className="w-8 h-8" />,
      title: { ko: 'SHACL 데이터 검증', en: 'SHACL Data Validation' },
      description: { ko: 'W3C 표준 기반 데이터 품질 보장', en: 'W3C standard-based data quality' },
      features: ['46개 제약조건', '7개 비즈니스 규칙', '실시간 검증', '오류 리포트'],
      color: 'slate',
      category: 'data'
    },
    {
      id: 'report',
      icon: <Download className="w-8 h-8" />,
      title: { ko: '리포트 다운로드', en: 'Report Download' },
      description: { ko: '4가지 포맷 지원 (PDF/MD/JSON/CSV)', en: '4 formats (PDF/MD/JSON/CSV)' },
      features: ['PDF 리포트', 'Markdown', 'JSON 데이터', 'CSV 내보내기', '자동 생성'],
      color: 'gray',
      category: 'other'
    },
    {
      id: 'multilang',
      icon: <Globe className="w-8 h-8" />,
      title: { ko: '다국어 지원', en: 'Multi-language' },
      description: { ko: '한글/영문 완벽 지원 및 동적 전환', en: 'Korean/English with dynamic switching' },
      features: ['한글/영문', '동적 전환', 'AI 응답 번역', 'UI 완전 번역'],
      color: 'sky',
      category: 'other'
    },
    {
      id: 'darkmode',
      icon: <Sparkles className="w-8 h-8" />,
      title: { ko: '다크모드 & UX', en: 'Dark Mode & UX' },
      description: { ko: '키보드 단축키, 북마크, 다크모드', en: 'Keyboard shortcuts, bookmarks, dark mode' },
      features: ['다크모드', '키보드 단축키', '북마크', '스크롤 투 탑', '반응형 디자인'],
      color: 'fuchsia',
      category: 'other'
    }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-900 dark:text-blue-100', icon: 'text-blue-600 dark:text-blue-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-900 dark:text-purple-100', icon: 'text-purple-600 dark:text-purple-400' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-900 dark:text-green-100', icon: 'text-green-600 dark:text-green-400' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-900 dark:text-indigo-100', icon: 'text-indigo-600 dark:text-indigo-400' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-900 dark:text-red-100', icon: 'text-red-600 dark:text-red-400' },
      cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-900 dark:text-cyan-100', icon: 'text-cyan-600 dark:text-cyan-400' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-900 dark:text-orange-100', icon: 'text-orange-600 dark:text-orange-400' },
      emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-900 dark:text-emerald-100', icon: 'text-emerald-600 dark:text-emerald-400' },
      amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-900 dark:text-amber-100', icon: 'text-amber-600 dark:text-amber-400' },
      violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-900 dark:text-violet-100', icon: 'text-violet-600 dark:text-violet-400' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-900 dark:text-pink-100', icon: 'text-pink-600 dark:text-pink-400' },
      teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-900 dark:text-teal-100', icon: 'text-teal-600 dark:text-teal-400' },
      slate: { bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800', text: 'text-slate-900 dark:text-slate-100', icon: 'text-slate-600 dark:text-slate-400' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800', text: 'text-gray-900 dark:text-gray-100', icon: 'text-gray-600 dark:text-gray-400' },
      sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-900 dark:text-sky-100', icon: 'text-sky-600 dark:text-sky-400' },
      fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20', border: 'border-fuchsia-200 dark:border-fuchsia-800', text: 'text-fuchsia-900 dark:text-fuchsia-100', icon: 'text-fuchsia-600 dark:text-fuchsia-400' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1494412574643-35d324698b93?auto=format&fit=crop&q=80')" }}
        ></div>
        <div className="relative p-10 md:p-16 text-white">
          <div className="flex items-center gap-3 mb-4">
             <Ship className="w-8 h-8 text-blue-400" />
             <span className="text-sm font-bold tracking-widest uppercase bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">KMTC System</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {t.title[lang]}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl font-light">
            {t.subtitle[lang]}
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4 text-sm font-medium">
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-green-300"/> {features.length} {lang === 'ko' ? '개 기능' : 'Features'}
             </div>
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <Brain className="w-4 h-4 text-purple-300"/> {features.filter(f => f.category === 'ai').length} AI {lang === 'ko' ? '기능' : 'Features'}
             </div>
             <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <BarChart3 className="w-4 h-4 text-blue-300"/> {features.filter(f => f.category === 'data').length} {lang === 'ko' ? '분석 도구' : 'Analytics'}
             </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.icon}
            {cat.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCategory === cat.id
                ? 'bg-white/20'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              {cat.id === 'all' ? features.length : features.filter(f => f.category === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const colors = getColorClasses(feature.color);
          return (
            <div
              key={feature.id}
              className={`${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`${colors.icon} mb-4`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                {feature.title[lang]}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {feature.description[lang]}
              </p>
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 border border-blue-200 dark:border-slate-600">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {features.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {lang === 'ko' ? '전체 기능' : 'Total Features'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {features.filter(f => f.category === 'ai').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {lang === 'ko' ? 'AI 기능' : 'AI Features'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {features.filter(f => f.category === 'data').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {lang === 'ko' ? '분석 도구' : 'Analytics'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {features.filter(f => f.category === 'viz').length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {lang === 'ko' ? '시각화' : 'Visualization'}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
