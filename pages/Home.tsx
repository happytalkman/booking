import React, { useState } from 'react';
import { 
  Network, TrendingUp, Shield, Database, MessageSquare, Video, 
  BarChart3, Users, Ship, ArrowRight, Sparkles, Brain, Eye, 
  Mic, Download, Share2, LayoutDashboard, Search, AlertTriangle,
  Zap, FileText, Globe, Target, CheckCircle2, Layers, Activity,
  PieChart, LineChart, Smile, Volume2, FileBarChart, GitBranch,
  Code, Lightbulb, Play, Smartphone, Bell
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
  isNew?: boolean;
}

const Home: React.FC<HomeProps> = ({ lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = {
    title: { ko: '🚀 KMTC 온톨로지 기반 부킹 에이전틱AI 플랫폼', en: '🚀 KMTC Ontology-based Booking Agentic AI Platform' },
    subtitle: { ko: '문서관리·모바일·실시간데이터 통합 엔터프라이즈 솔루션', en: 'Document Management·Mobile·Real-time Data Integrated Enterprise Solution' },
    allCategories: { ko: '전체', en: 'All' },
    categoryAI: { ko: 'AI 기능', en: 'AI Features' },
    categoryData: { ko: '데이터 분석', en: 'Data Analytics' },
    categoryViz: { ko: '시각화', en: 'Visualization' },
    categoryOther: { ko: '기타', en: 'Others' },
    totalFeatures: { ko: '총 기능', en: 'Total Features' },
    newFeatures: { ko: '신규 기능', en: 'New Features' },
    architecture: { ko: '아키텍처', en: 'Architecture' },
    ontology: { ko: '온톨로지', en: 'Ontology' },
    viewDetails: { ko: '자세히 보기', en: 'View Details' }
  };

  const categories = [
    { id: 'all', label: t.allCategories[lang], icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'ai', label: t.categoryAI[lang], icon: <Brain className="w-4 h-4" /> },
    { id: 'data', label: t.categoryData[lang], icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'viz', label: t.categoryViz[lang], icon: <Eye className="w-4 h-4" /> },
    { id: 'other', label: t.categoryOther[lang], icon: <Zap className="w-4 h-4" /> }
  ];

  const features: FeatureCard[] = [
    // 🆕 NEW! 비즈니스 핵심 기능 (3개)
    {
      id: 'document-management',
      icon: <FileText className="w-8 h-8" />,
      title: { ko: '📄 문서 관리 시스템', en: '📄 Document Management System' },
      description: { ko: '선하증권, 송장, 계약서 OCR 자동 처리 및 디지털 서명', en: 'B/L, Invoice, Contract OCR processing with digital signature' },
      features: ['OCR 자동 텍스트 추출 (85-99%)', '디지털 서명 (전자서명법 준수)', '문서 버전 관리', '자동 분류 & 검색', '승인 워크플로우'],
      color: 'blue',
      category: 'other',
      isNew: true
    },
    {
      id: 'mobile-features',
      icon: <Smartphone className="w-8 h-8" />,
      title: { ko: '📱 모바일 앱 고도화', en: '📱 Mobile App Enhancement' },
      description: { ko: 'PWA 기반 생체인증, GPS, 카메라 스캔, 오프라인 모드', en: 'PWA-based biometric auth, GPS, camera scan, offline mode' },
      features: ['생체 인증 (지문/얼굴)', 'GPS 위치 기반 서비스', '카메라 문서 스캔', '오프라인 모드 (95% 기능)', '푸시 알림 시스템'],
      color: 'purple',
      category: 'other',
      isNew: true
    },
    {
      id: 'real-time-data',
      icon: <Globe className="w-8 h-8" />,
      title: { ko: '🌐 실시간 데이터 연동', en: '🌐 Real-Time Data Integration' },
      description: { ko: '환율, 유가, 날씨, 항만정보 실시간 모니터링', en: 'Real-time FX, oil, weather, port information monitoring' },
      features: ['환율 정보 (USD/EUR/JPY/CNY)', '유가 모니터링 (Brent/WTI/Bunker)', '날씨 데이터 (주요 항만)', '항만 혼잡도 & 대기시간', '선사 운임 실시간 비교'],
      color: 'teal',
      category: 'data',
      isNew: true
    },

    // 🤖 AI 고급 기능 (4개)
    {
      id: 'multimodal-ai',
      icon: <Brain className="w-8 h-8" />,
      title: { ko: '🤖 멀티모달 AI 어시스턴트', en: '🤖 Multimodal AI Assistant' },
      description: { ko: '음성, 이미지, 텍스트 통합 AI 상담 및 분석', en: 'Voice, image, text integrated AI consultation and analysis' },
      features: ['음성 인식 & 합성', '이미지 분석 (문서/차트)', '텍스트 대화', '감정 인식', '멀티턴 대화'],
      color: 'indigo',
      category: 'ai',
      isNew: true
    },
    {
      id: 'advanced-prediction',
      icon: <Zap className="w-8 h-8" />,
      title: { ko: '🔮 고급 예측 분석 엔진', en: '🔮 Advanced Prediction Engine' },
      description: { ko: 'LSTM/Transformer 딥러닝 모델로 정확도 15% 향상', en: 'LSTM/Transformer deep learning with 15% accuracy improvement' },
      features: ['LSTM 시계열 예측', 'Transformer 어텐션', '앙상블 모델링', '예측 신뢰도 구간', '정확도 94.7%'],
      color: 'green',
      category: 'ai',
      isNew: true
    },
    {
      id: 'smart-recommendation',
      icon: <Lightbulb className="w-8 h-8" />,
      title: { ko: '💡 스마트 추천 시스템', en: '💡 Smart Recommendation System' },
      description: { ko: '8가지 통합 추천 알고리즘으로 최적 의사결정 지원', en: '8 integrated recommendation algorithms for optimal decisions' },
      features: ['협업 필터링', '콘텐츠 기반 필터링', '하이브리드 추천', '딥러닝 추천', '실시간 개인화'],
      color: 'yellow',
      category: 'ai',
      isNew: true
    },
    {
      id: 'security-dashboard',
      icon: <Shield className="w-8 h-8" />,
      title: { ko: '🔒 보안 대시보드', en: '🔒 Security Dashboard' },
      description: { ko: '실시간 위협 탐지 및 보안 모니터링', en: 'Real-time threat detection and security monitoring' },
      features: ['실시간 위협 탐지', '보안 이벤트 모니터링', '취약점 스캔', '침입 탐지', '보안 점수 (98/100)'],
      color: 'red',
      category: 'ai',
      isNew: true
    },

    // 기존 AI 기능 (3개)
    {
      id: 'voice-qna',
      icon: <Mic className="w-8 h-8" />,
      title: { ko: '음성 질의응답 & 감정 인식', en: 'Voice Q&A & Emotion Recognition' },
      description: { ko: '음성으로 질문하고 감정을 인식하여 보고서 생성', en: 'Voice Q&A with emotion recognition and report generation' },
      features: ['음성 인식 (2초 침묵 감지)', '감정 분석 (긍정/중립/부정)', '남자/여자 음성 선택', '대화 기록', 'PDF 보고서 생성'],
      color: 'green',
      category: 'ai'
    },
    {
      id: 'market-report',
      icon: <FileBarChart className="w-8 h-8" />,
      title: { ko: '증권사 수준 시장 분석 보고서', en: 'Professional Market Analysis Report' },
      description: { ko: '애널리스트 수준의 전문 시장 분석 및 PDF 출력', en: 'Analyst-level market analysis with PDF export' },
      features: ['7개 섹션 보고서', '경쟁 분석', '리스크 평가', '전략적 제언', 'PDF 다운로드'],
      color: 'indigo',
      category: 'ai'
    },
    {
      id: 'ai-chat',
      icon: <MessageSquare className="w-8 h-8" />,
      title: { ko: 'AI 챗봇 (멀티 LLM)', en: 'AI Chatbot (Multi-LLM)' },
      description: { ko: 'GPT-4, Claude, Gemini 자동 폴백 시스템', en: 'GPT-4, Claude, Gemini with auto-fallback' },
      features: ['멀티 LLM 통합', '자동 폴백', '컨텍스트 인식', '마크다운 렌더링', '추천 질문'],
      color: 'purple',
      category: 'ai'
    },

    // 📊 데이터 분석 & 모니터링 (9개)
    {
      id: 'ml-prediction',
      icon: <Brain className="w-8 h-8" />,
      title: { ko: 'ML 운임 예측', en: 'ML Freight Prediction' },
      description: { ko: 'TensorFlow.js 기반 30일 운임 예측', en: '30-day freight prediction with TensorFlow.js' },
      features: ['30일 예측', '영향 요인 분석', '신뢰도 구간', '정확도 92.3%', '과거 데이터 비교'],
      color: 'blue',
      category: 'data'
    },
    {
      id: 'kg-panel',
      icon: <Search className="w-8 h-8" />,
      title: { ko: '지식 그래프 인터랙티브 패널', en: 'KG Interactive Panel' },
      description: { ko: '검색, 질의응답, 상세정보, 인사이트 4개 탭', en: 'Search, Q&A, Details, Insights tabs' },
      features: ['자연어 검색', 'AI 질의응답', '노드 상세정보', '자동 인사이트', '멀티턴 대화'],
      color: 'cyan',
      category: 'data'
    },
    {
      id: 'booking-rec',
      icon: <Target className="w-8 h-8" />,
      title: { ko: 'AI 부킹 추천', en: 'AI Booking Recommendation' },
      description: { ko: '3가지 액션 (지금 부킹/대기/모니터링)', en: '3 actions: Book Now/Wait/Monitor' },
      features: ['지금 부킹', '대기 권장', '모니터링', '근거 제시', '신뢰도 점수'],
      color: 'orange',
      category: 'data'
    },
    {
      id: 'ai-insight',
      icon: <Sparkles className="w-8 h-8" />,
      title: { ko: 'AI 인사이트 카드', en: 'AI Insight Cards' },
      description: { ko: '4가지 타입 인사이트 자동 생성', en: 'Auto-generated insights (4 types)' },
      features: ['성공 인사이트', '경고', '정보', '기회', '실시간 업데이트'],
      color: 'yellow',
      category: 'data'
    },
    {
      id: 'simulator',
      icon: <Activity className="w-8 h-8" />,
      title: { ko: '시나리오 시뮬레이터', en: 'Scenario Simulator' },
      description: { ko: '4개 변수 동시 조정 및 실시간 예측', en: '4-variable adjustment with real-time prediction' },
      features: ['유가/홍해/수요/환율', '실시간 예측', '시나리오 저장', '민감도 분석', '리스크 시뮬레이션'],
      color: 'teal',
      category: 'data'
    },
    {
      id: 'competitor',
      icon: <Users className="w-8 h-8" />,
      title: { ko: '경쟁사 벤치마킹', en: 'Competitor Benchmarking' },
      description: { ko: '5개 선사 비교 분석', en: 'Compare 5 major carriers' },
      features: ['MSC/Maersk/COSCO/Evergreen/HMM', '운임 비교', '시장점유율', '정시도착률', '트렌드 분석'],
      color: 'pink',
      category: 'data'
    },
    {
      id: 'historical',
      icon: <LineChart className="w-8 h-8" />,
      title: { ko: '과거 데이터 비교', en: 'Historical Comparison' },
      description: { ko: '6개월/1년 운임 추세 분석', en: '6M/1Y freight trend analysis' },
      features: ['6개월/1년 추세', '계절성 패턴', '항로별 비교', '이상치 탐지', '인터랙티브 차트'],
      color: 'violet',
      category: 'data'
    },
    {
      id: 'data-quality',
      icon: <Shield className="w-8 h-8" />,
      title: { ko: 'SHACL 데이터 검증', en: 'SHACL Data Validation' },
      description: { ko: 'W3C 표준 기반 데이터 품질 보장', en: 'W3C standard-based data quality' },
      features: ['46개 제약조건', '7개 비즈니스 규칙', '실시간 검증', '오류 리포트', '99.5% 품질'],
      color: 'emerald',
      category: 'data'
    },
    {
      id: 'alerts',
      icon: <AlertTriangle className="w-8 h-8" />,
      title: { ko: '실시간 알림', en: 'Real-time Alerts' },
      description: { ko: '4가지 알림 타입 (운임/경쟁사/리스크/기회)', en: '4 alert types: Rate/Competitor/Risk/Opportunity' },
      features: ['운임 하락', '경쟁사 변경', '리스크 경고', '기회 알림', '조치하기 버튼'],
      color: 'red',
      category: 'data'
    },
    {
      id: 'kpi',
      icon: <BarChart3 className="w-8 h-8" />,
      title: { ko: 'KPI 대시보드', en: 'KPI Dashboard' },
      description: { ko: '프로그레스 바 및 드릴다운 모달', en: 'Progress bars with drill-down modals' },
      features: ['8개 핵심 KPI', '프로그레스 바', '드릴다운 모달', '색상 코딩', '이상치 탐지'],
      color: 'sky',
      category: 'data'
    },

    // 🎨 시각화 & 인터페이스 (4개)
    {
      id: 'ontology',
      icon: <Network className="w-8 h-8" />,
      title: { ko: '온톨로지 지식 그래프', en: 'Ontology Knowledge Graph' },
      description: { ko: 'OWL2 기반 해운 도메인 지식 모델링', en: 'OWL2-based shipping domain knowledge' },
      features: ['7개 핵심 엔티티', '8개 주요 관계', 'Force/Radial 뷰', '드래그 가능', '실시간 링크'],
      color: 'blue',
      category: 'viz'
    },
    {
      id: 'video',
      icon: <Video className="w-8 h-8" />,
      title: { ko: '실시간 영상 모니터링', en: 'Live Video Monitoring' },
      description: { ko: '4개 카메라 라이브 피드', en: '4-camera live feed' },
      features: ['부산항 터미널', '컨테이너 야드', '적재 부두', '게이트', '전체화면 모드'],
      color: 'red',
      category: 'viz'
    },
    {
      id: 'charts',
      icon: <PieChart className="w-8 h-8" />,
      title: { ko: '인터랙티브 차트', en: 'Interactive Charts' },
      description: { ko: 'Recharts 기반 데이터 시각화', en: 'Recharts-based data visualization' },
      features: ['라인 차트', '바 차트', '파이 차트', '에어리어 차트', '툴팁/줌'],
      color: 'indigo',
      category: 'viz'
    },
    {
      id: 'advanced-analytics',
      icon: <BarChart3 className="w-8 h-8" />,
      title: { ko: '고급 분석 대시보드', en: 'Advanced Analytics Dashboard' },
      description: { ko: '실시간 KPI 모니터링 및 예측 분석', en: 'Real-time KPI monitoring and predictive analytics' },
      features: ['실시간 KPI 추적', '예측 분석', '이상치 탐지', '트렌드 분석', '드릴다운 기능'],
      color: 'emerald',
      category: 'viz',
      isNew: true
    },

    // 🧠 온톨로지 고급 도구 (7개)
    {
      id: 'ontology-stats',
      icon: <Database className="w-8 h-8" />,
      title: { ko: '온톨로지 통계 대시보드', en: 'Ontology Statistics Dashboard' },
      description: { ko: '53개 노드, 127개 관계 실시간 분석', en: '53 nodes, 127 relations real-time analysis' },
      features: ['전체 노드/엣지 수', '평균 연결도 2.4', '네트워크 밀도 18%', '타입별 분포', '최대 중심성 분석'],
      color: 'blue',
      category: 'data',
      isNew: true
    },
    {
      id: 'path-finder',
      icon: <GitBranch className="w-8 h-8" />,
      title: { ko: '경로 탐색 기능', en: 'Path Finder' },
      description: { ko: '노드 간 최단 경로 및 모든 경로 찾기', en: 'Find shortest and all paths between nodes' },
      features: ['최단 경로 찾기', '모든 경로 나열', '경로 시각화', '홉 수 표시', '관계 타입 표시'],
      color: 'green',
      category: 'data',
      isNew: true
    },
    {
      id: 'node-impact',
      icon: <Target className="w-8 h-8" />,
      title: { ko: '노드 영향도 분석', en: 'Node Impact Analysis' },
      description: { ko: '노드 제거 시 영향 평가 및 권장사항', en: 'Impact assessment and recommendations' },
      features: ['직접/간접 연결 분석', '중요도 점수 (0-10)', '제거 시 영향 평가', '심각도별 분류', '권장 사항 생성'],
      color: 'orange',
      category: 'data',
      isNew: true
    },
    {
      id: 'sparql-builder',
      icon: <Code className="w-8 h-8" />,
      title: { ko: 'SPARQL 쿼리 빌더', en: 'SPARQL Query Builder' },
      description: { ko: '6개 템플릿 및 실시간 쿼리 실행', en: '6 templates with real-time execution' },
      features: ['6개 사전 정의 템플릿', '쿼리 편집기', '실시간 실행', 'CSV 내보내기', '쿼리 복사'],
      color: 'purple',
      category: 'data',
      isNew: true
    },
    {
      id: 'ai-recommendations',
      icon: <Lightbulb className="w-8 h-8" />,
      title: { ko: 'AI 추천 엔진', en: 'AI Recommendation Engine' },
      description: { ko: '7가지 온톨로지 개선 추천 자동 생성', en: '7 ontology improvement recommendations' },
      features: ['누락 관계 탐지', '새 엔티티 제안', '구조 최적화', '데이터 품질 검증', '신뢰도 87-98%'],
      color: 'yellow',
      category: 'ai',
      isNew: true
    },
    {
      id: 'ontology-simulator',
      icon: <Play className="w-8 h-8" />,
      title: { ko: '온톨로지 시뮬레이터', en: 'Ontology Simulator' },
      description: { ko: 'What-if 시나리오 분석 및 ROI 계산', en: 'What-if scenario analysis with ROI' },
      features: ['3개 사전 정의 시나리오', '실시간 영향도 계산', 'ROI 분석', '리스크 & 기회', '투자 회수 기간'],
      color: 'teal',
      category: 'ai',
      isNew: true
    },
    {
      id: 'viz-controller',
      icon: <Layers className="w-8 h-8" />,
      title: { ko: '시각화 컨트롤러', en: 'Visualization Controller' },
      description: { ko: '5가지 레이아웃 및 고급 필터링', en: '5 layouts with advanced filtering' },
      features: ['5가지 레이아웃', '줌 컨트롤 (50-200%)', '노드 타입 필터', '3가지 내보내기', '노드 크기 조절'],
      color: 'indigo',
      category: 'viz',
      isNew: true
    },

    // 🔧 협업 & 시스템 기능 (8개)
    {
      id: 'booking-history',
      icon: <Database className="w-8 h-8" />,
      title: { ko: '부킹 히스토리 & 분석', en: 'Booking History & Analytics' },
      description: { ko: '과거 부킹 패턴 분석 및 성과 추적', en: 'Historical booking pattern analysis and performance tracking' },
      features: ['부킹 패턴 분석', '계절성 트렌드', '비용 절감 리포트', 'ROI 계산기', '데이터 내보내기'],
      color: 'blue',
      category: 'other'
    },
    {
      id: 'auto-booking',
      icon: <Zap className="w-8 h-8" />,
      title: { ko: '자동 부킹 엔진', en: 'Auto Booking Engine' },
      description: { ko: 'AI 기반 자동 부킹 및 최적화', en: 'AI-powered automatic booking and optimization' },
      features: ['자동 부킹 실행', '조건 기반 트리거', '최적 타이밍 예측', '리스크 관리', '성과 모니터링'],
      color: 'green',
      category: 'other'
    },
    {
      id: 'collaboration',
      icon: <Users className="w-8 h-8" />,
      title: { ko: '협업 센터', en: 'Collaboration Center' },
      description: { ko: '팀 협업 및 워크플로우 관리', en: 'Team collaboration and workflow management' },
      features: ['부킹 공유 & 댓글', '승인 워크플로우', '팀 대시보드', '활동 피드', '실시간 협업'],
      color: 'purple',
      category: 'other'
    },
    {
      id: 'smart-notifications',
      icon: <Bell className="w-8 h-8" />,
      title: { ko: '스마트 알림 센터', en: 'Smart Notification Center' },
      description: { ko: '개인화된 알림 및 설정 관리', en: 'Personalized notifications and settings management' },
      features: ['개인화된 알림 설정', 'PWA 푸시 알림', '이메일/SMS 통합', '알림 히스토리', '효과성 분석'],
      color: 'orange',
      category: 'other'
    },
    {
      id: 'reports',
      icon: <Download className="w-8 h-8" />,
      title: { ko: '스마트 리포트 생성기', en: 'Smart Report Generator' },
      description: { ko: '4가지 포맷 자동 리포트 생성', en: 'Automated report generation in 4 formats' },
      features: ['PDF 보고서', 'Markdown', 'JSON 데이터', 'CSV 내보내기', '자동 차트 포함'],
      color: 'gray',
      category: 'other'
    },
    {
      id: 'i18n',
      icon: <Globe className="w-8 h-8" />,
      title: { ko: '다국어 지원', en: 'Internationalization' },
      description: { ko: '한글/영문 완벽 지원', en: 'Full Korean/English support' },
      features: ['한글/영문 전환', 'AI 응답 번역', 'UI 완전 번역', '동적 언어 전환', '로컬 스토리지'],
      color: 'blue',
      category: 'other'
    },
    {
      id: 'i18n',
      icon: <Globe className="w-8 h-8" />,
      title: { ko: '다국어 지원', en: 'Internationalization' },
      description: { ko: '한글/영문 완벽 지원', en: 'Full Korean/English support' },
      features: ['한글/영문 전환', 'AI 응답 번역', 'UI 완전 번역', '동적 언어 전환', '로컬 스토리지'],
      color: 'blue',
      category: 'other'
    },
    {
      id: 'ux',
      icon: <Layers className="w-8 h-8" />,
      title: { ko: '다크모드 & UX', en: 'Dark Mode & UX' },
      description: { ko: '15개 키보드 단축키 및 북마크', en: '15 keyboard shortcuts & bookmarks' },
      features: ['다크/라이트 모드', '15개 단축키', '북마크 시스템', '반응형 디자인', '스크롤 투 탑'],
      color: 'slate',
      category: 'other'
    }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const stats = {
    total: features.length,
    new: features.filter(f => f.isNew).length,
    ai: features.filter(f => f.category === 'ai').length,
    data: features.filter(f => f.category === 'data').length,
    viz: features.filter(f => f.category === 'viz').length,
    other: features.filter(f => f.category === 'other').length
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* 헤더 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t.title[lang]}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          {t.subtitle[lang]}
        </p>
        
        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t.totalFeatures[lang]}</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600">{stats.new}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t.newFeatures[lang]}</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-3xl font-bold text-purple-600">{stats.ai}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t.categoryAI[lang]}</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="text-3xl font-bold text-indigo-600">{stats.data}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">{t.categoryData[lang]}</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <div className="text-3xl font-bold text-cyan-600">{stats.viz}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">시각화</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="text-3xl font-bold text-orange-600">{stats.other}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">협업/시스템</div>
          </div>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.icon}
            {cat.label}
            <span className="text-xs opacity-75">
              ({cat.id === 'all' ? stats.total : features.filter(f => f.category === cat.id).length})
            </span>
          </button>
        ))}
      </div>

      {/* 기능 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map(feature => (
          <FeatureCardComponent key={feature.id} feature={feature} lang={lang} />
        ))}
      </div>

      {/* 아키텍처 섹션 */}
      <ArchitectureSection lang={lang} />

      {/* 온톨로지 섹션 */}
      <OntologySection lang={lang} />
    </div>
  );
};

// 기능 카드 컴포넌트
const FeatureCardComponent: React.FC<{ feature: FeatureCard; lang: Language }> = ({ feature, lang }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    indigo: 'from-indigo-500 to-indigo-600',
    cyan: 'from-cyan-500 to-cyan-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    teal: 'from-teal-500 to-teal-600',
    pink: 'from-pink-500 to-pink-600',
    violet: 'from-violet-500 to-violet-600',
    emerald: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    sky: 'from-sky-500 to-sky-600',
    gray: 'from-gray-500 to-gray-600',
    slate: 'from-slate-500 to-slate-600'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all hover:scale-105 group">
      {/* 헤더 */}
      <div className={`bg-gradient-to-r ${colorClasses[feature.color as keyof typeof colorClasses]} p-6 text-white relative`}>
        <div className="flex items-start justify-between">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            {feature.icon}
          </div>
          {feature.isNew && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
              NEW
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mt-4">{feature.title[lang]}</h3>
        <p className="text-sm opacity-90 mt-2">{feature.description[lang]}</p>
      </div>

      {/* 기능 목록 */}
      <div className="p-6">
        <ul className="space-y-2">
          {feature.features.map((f, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// 아키텍처 섹션
const ArchitectureSection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    title: { ko: '🏗️ 시스템 아키텍처', en: '🏗️ System Architecture' },
    subtitle: { ko: '엔터프라이즈급 기술 스택', en: 'Enterprise-grade Technology Stack' },
    frontend: { ko: 'Frontend', en: 'Frontend' },
    backend: { ko: 'Backend', en: 'Backend' },
    ai: { ko: 'AI/ML', en: 'AI/ML' },
    semantic: { ko: 'Semantic Web', en: 'Semantic Web' }
  };

  const architecture = {
    frontend: [
      { name: 'React 18', desc: lang === 'ko' ? '최신 React 프레임워크' : 'Latest React framework' },
      { name: 'TypeScript', desc: lang === 'ko' ? '타입 안전성 보장' : 'Type safety' },
      { name: 'Enhanced PWA', desc: lang === 'ko' ? '고도화된 PWA 서비스워커' : 'Enhanced PWA Service Worker' },
      { name: 'Vite', desc: lang === 'ko' ? '빠른 빌드 시스템' : 'Fast build system' },
      { name: 'Tailwind CSS', desc: lang === 'ko' ? '유틸리티 퍼스트 CSS' : 'Utility-first CSS' },
      { name: 'Recharts', desc: lang === 'ko' ? '데이터 시각화' : 'Data visualization' },
      { name: 'D3.js', desc: lang === 'ko' ? '지식 그래프 렌더링' : 'Knowledge graph rendering' },
      { name: 'WebAuthn', desc: lang === 'ko' ? '생체 인증 API' : 'Biometric Authentication API' }
    ],
    backend: [
      { name: 'Node.js', desc: lang === 'ko' ? '서버 런타임' : 'Server runtime' },
      { name: 'Express', desc: lang === 'ko' ? 'REST API 서버' : 'REST API server' },
      { name: 'WebSocket', desc: lang === 'ko' ? '실시간 데이터 연동' : 'Real-time data integration' },
      { name: 'JWT', desc: lang === 'ko' ? '토큰 인증' : 'Token authentication' },
      { name: 'Nodemailer', desc: lang === 'ko' ? '이메일 전송' : 'Email delivery' },
      { name: 'Digital Signature', desc: lang === 'ko' ? '전자서명 (전자서명법)' : 'Digital Signature (Legal)' }
    ],
    ai: [
      { name: 'OpenRouter API', desc: lang === 'ko' ? '멀티 LLM 통합' : 'Multi-LLM integration' },
      { name: 'Google Gemini', desc: lang === 'ko' ? 'AI 폴백 시스템' : 'AI fallback system' },
      { name: 'TensorFlow.js', desc: lang === 'ko' ? 'ML 운임 예측' : 'ML freight prediction' },
      { name: 'LSTM/Transformer', desc: lang === 'ko' ? '딥러닝 예측 엔진' : 'Deep Learning Prediction' },
      { name: 'Web Speech API', desc: lang === 'ko' ? '음성 인식/합성' : 'Voice recognition/synthesis' },
      { name: 'OCR Engine', desc: lang === 'ko' ? '문서 텍스트 추출' : 'Document Text Extraction' },
      { name: 'Multimodal AI', desc: lang === 'ko' ? '음성/이미지/텍스트 통합' : 'Voice/Image/Text Integration' }
    ],
    semantic: [
      { name: 'OWL2', desc: lang === 'ko' ? '온톨로지 모델링' : 'Ontology modeling' },
      { name: 'SHACL', desc: lang === 'ko' ? '데이터 검증' : 'Data validation' },
      { name: 'RDF/Turtle', desc: lang === 'ko' ? '지식 표현' : 'Knowledge representation' },
      { name: 'SPARQL', desc: lang === 'ko' ? '시맨틱 쿼리' : 'Semantic queries' }
    ]
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t.title[lang]}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {t.subtitle[lang]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Frontend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.frontend[lang]}</h3>
          </div>
          <ul className="space-y-3">
            {architecture.frontend.map((tech, idx) => (
              <li key={idx} className="text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{tech.desc}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Backend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.backend[lang]}</h3>
          </div>
          <ul className="space-y-3">
            {architecture.backend.map((tech, idx) => (
              <li key={idx} className="text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{tech.desc}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* AI/ML */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.ai[lang]}</h3>
          </div>
          <ul className="space-y-3">
            {architecture.ai.map((tech, idx) => (
              <li key={idx} className="text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{tech.desc}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Semantic Web */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-6 h-6 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.semantic[lang]}</h3>
          </div>
          <ul className="space-y-3">
            {architecture.semantic.map((tech, idx) => (
              <li key={idx} className="text-sm">
                <div className="font-medium text-slate-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{tech.desc}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// 온톨로지 섹션
const OntologySection: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = {
    title: { ko: '🧠 온톨로지 구성', en: '🧠 Ontology Structure' },
    subtitle: { ko: 'OWL2 기반 해운 도메인 지식 모델링', en: 'OWL2-based Shipping Domain Knowledge Modeling' },
    entities: { ko: '핵심 엔티티', en: 'Core Entities' },
    relations: { ko: '주요 관계', en: 'Key Relations' },
    rules: { ko: '비즈니스 규칙', en: 'Business Rules' },
    validation: { ko: 'SHACL 검증', en: 'SHACL Validation' }
  };

  const ontology = {
    entities: [
      { name: 'Shipper', ko: '화주', desc: lang === 'ko' ? '화물을 의뢰하는 고객' : 'Customer requesting cargo shipment', count: 8 },
      { name: 'Booking', ko: '부킹', desc: lang === 'ko' ? '운송 예약 정보' : 'Shipment booking information', count: 15 },
      { name: 'Route', ko: '항로', desc: lang === 'ko' ? '출발지-목적지 경로' : 'Origin-destination path', count: 12 },
      { name: 'Vessel', ko: '선박', desc: lang === 'ko' ? '컨테이너 운반선' : 'Container carrier vessel', count: 4 },
      { name: 'Contract', ko: '계약', desc: lang === 'ko' ? '운송 계약 조건' : 'Shipping contract terms', count: 6 },
      { name: 'MarketIndex', ko: '시장지표', desc: lang === 'ko' ? '운임/유가/환율 등' : 'Freight/Oil/FX rates', count: 3 },
      { name: 'Competitor', ko: '경쟁사', desc: lang === 'ko' ? '타 선사 정보' : 'Other carrier information', count: 5 }
    ],
    relations: [
      { name: 'USES', desc: lang === 'ko' ? '화주가 항로를 사용' : 'Shipper uses Route' },
      { name: 'HAS', desc: lang === 'ko' ? '화주가 부킹을 보유' : 'Shipper has Booking' },
      { name: 'ON', desc: lang === 'ko' ? '부킹이 항로에 속함' : 'Booking on Route' },
      { name: 'OPERATES', desc: lang === 'ko' ? '선박이 항로를 운항' : 'Vessel operates Route' },
      { name: 'GOVERNED_BY', desc: lang === 'ko' ? '부킹이 계약에 따름' : 'Booking governed by Contract' },
      { name: 'AFFECTS', desc: lang === 'ko' ? '시장지표가 항로에 영향' : 'MarketIndex affects Route' },
      { name: 'COMPETES_WITH', desc: lang === 'ko' ? '경쟁사와 경쟁' : 'Competes with Competitor' },
      { name: 'PREDICTS', desc: lang === 'ko' ? 'ML 모델이 운임 예측' : 'ML model predicts freight' }
    ],
    rules: [
      { id: 1, rule: lang === 'ko' ? '부킹은 반드시 하나의 항로에 속해야 함' : 'Booking must belong to exactly one Route' },
      { id: 2, rule: lang === 'ko' ? '화주는 최소 하나 이상의 부킹을 가져야 함' : 'Shipper must have at least one Booking' },
      { id: 3, rule: lang === 'ko' ? '항로는 출발지와 목적지가 달라야 함' : 'Route origin and destination must differ' },
      { id: 4, rule: lang === 'ko' ? '운임은 0보다 커야 함' : 'Freight rate must be greater than 0' },
      { id: 5, rule: lang === 'ko' ? '적재율은 0-100% 범위여야 함' : 'Load factor must be 0-100%' },
      { id: 6, rule: lang === 'ko' ? '계약 종료일은 시작일 이후여야 함' : 'Contract end date must be after start date' },
      { id: 7, rule: lang === 'ko' ? '선박 용량은 부킹 총량보다 커야 함' : 'Vessel capacity must exceed total bookings' }
    ],
    validation: {
      constraints: 46,
      businessRules: 7,
      accuracy: '99.5%',
      realtime: lang === 'ko' ? '실시간 검증' : 'Real-time validation'
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-900">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t.title[lang]}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {t.subtitle[lang]}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 핵심 엔티티 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.entities[lang]}</h3>
            <span className="ml-auto text-sm font-bold text-indigo-600">7개</span>
          </div>
          <div className="space-y-3">
            {ontology.entities.map((entity, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {entity.name} <span className="text-sm text-slate-500">({entity.ko})</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{entity.desc}</div>
                </div>
                <span className="text-xs font-bold text-indigo-600 ml-2">{entity.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 주요 관계 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.relations[lang]}</h3>
            <span className="ml-auto text-sm font-bold text-purple-600">8개</span>
          </div>
          <div className="space-y-2">
            {ontology.relations.map((rel, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <ArrowRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white text-sm">{rel.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{rel.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 비즈니스 규칙 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.rules[lang]}</h3>
            <span className="ml-auto text-sm font-bold text-green-600">7개</span>
          </div>
          <div className="space-y-2">
            {ontology.rules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700 dark:text-slate-300">{rule.rule}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SHACL 검증 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.validation[lang]}</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">{ontology.validation.constraints}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {lang === 'ko' ? '제약조건' : 'Constraints'}
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">{ontology.validation.businessRules}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {lang === 'ko' ? '비즈니스 규칙' : 'Business Rules'}
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">{ontology.validation.accuracy}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {lang === 'ko' ? '데이터 품질' : 'Data Quality'}
              </div>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
                <div className="text-sm font-medium text-indigo-600">{ontology.validation.realtime}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
