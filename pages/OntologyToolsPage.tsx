import React, { useState } from 'react';
import { Database, GitBranch, Target, Code, Lightbulb, Play, Layers } from 'lucide-react';
import { Language } from '../types';
import OntologyStatsDashboard from '../components/OntologyStatsDashboard';
import PathFinder from '../components/PathFinder';
import NodeImpactAnalysis from '../components/NodeImpactAnalysis';
import SPARQLQueryBuilder from '../components/SPARQLQueryBuilder';
import OntologyRecommendationEngine from '../components/OntologyRecommendationEngine';
import OntologySimulator from '../components/OntologySimulator';
import OntologyVisualizationController from '../components/OntologyVisualizationController';

interface OntologyToolsPageProps {
  lang: Language;
}

type ToolTab = 'stats' | 'pathfinder' | 'impact' | 'sparql' | 'recommendations' | 'simulator' | 'visualization';

const OntologyToolsPage: React.FC<OntologyToolsPageProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('stats');

  const t = {
    title: { ko: '온톨로지 고급 도구', en: 'Ontology Advanced Tools' },
    subtitle: { ko: '지식 그래프 분석 및 쿼리 도구', en: 'Knowledge Graph Analysis & Query Tools' },
    stats: { ko: '통계', en: 'Statistics' },
    pathfinder: { ko: '경로 탐색', en: 'Path Finder' },
    impact: { ko: '영향도', en: 'Impact' },
    sparql: { ko: 'SPARQL', en: 'SPARQL' },
    recommendations: { ko: 'AI 추천', en: 'AI Recommendations' },
    simulator: { ko: '시뮬레이터', en: 'Simulator' },
    visualization: { ko: '시각화', en: 'Visualization' }
  };

  const tabs = [
    { id: 'stats' as ToolTab, icon: Database, label: t.stats[lang] },
    { id: 'pathfinder' as ToolTab, icon: GitBranch, label: t.pathfinder[lang] },
    { id: 'impact' as ToolTab, icon: Target, label: t.impact[lang] },
    { id: 'sparql' as ToolTab, icon: Code, label: t.sparql[lang] },
    { id: 'recommendations' as ToolTab, icon: Lightbulb, label: t.recommendations[lang] },
    { id: 'simulator' as ToolTab, icon: Play, label: t.simulator[lang] },
    { id: 'visualization' as ToolTab, icon: Layers, label: t.visualization[lang] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {t.title[lang]}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t.subtitle[lang]}
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-6 p-2">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="animate-fadeIn">
          {activeTab === 'stats' && <OntologyStatsDashboard lang={lang} />}
          {activeTab === 'pathfinder' && <PathFinder lang={lang} />}
          {activeTab === 'impact' && <NodeImpactAnalysis lang={lang} />}
          {activeTab === 'sparql' && <SPARQLQueryBuilder lang={lang} />}
          {activeTab === 'recommendations' && <OntologyRecommendationEngine lang={lang} />}
          {activeTab === 'simulator' && <OntologySimulator lang={lang} />}
          {activeTab === 'visualization' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {lang === 'ko' ? '시각화 컨트롤러' : 'Visualization Controller'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {lang === 'ko' 
                  ? '이 컨트롤러는 지식 그래프 페이지에서 사용됩니다. 지식 그래프 페이지로 이동하여 시각화 옵션을 확인하세요.'
                  : 'This controller is used on the Knowledge Graph page. Navigate to the Knowledge Graph page to see visualization options.'}
              </p>
              <div className="relative">
                <OntologyVisualizationController 
                  lang={lang}
                  onLayoutChange={(layout) => console.log('Layout changed:', layout)}
                  onFilterChange={(filters) => console.log('Filters changed:', filters)}
                  onZoomChange={(zoom) => console.log('Zoom changed:', zoom)}
                  onExport={(format) => console.log('Export:', format)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OntologyToolsPage;
