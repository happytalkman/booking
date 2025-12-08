import React from 'react';
import { LayoutDashboard, Network, LineChart, AlertTriangle, Ship, Home, Package, Settings, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { Language } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lang, isOpen, toggleSidebar }) => {
  
  const translations = {
    home: { ko: '플랫폼 개요', en: 'Platform Overview' },
    dashboard: { ko: 'KPI 대시보드', en: 'KPI Dashboard' },
    ontology: { ko: '지식 그래프', en: 'Knowledge Graph' },
    booking: { ko: '부킹 분석', en: 'Booking Analysis' },
    risk: { ko: '취소/리스크', en: 'Risk & Cancel' },
    inventory: { ko: '재고/물류', en: 'Inventory' },
    market: { ko: '마켓 인텔리전스', en: 'Market Intel' },
    scenarios: { ko: '실무 시나리오', en: 'Scenarios' },
    role: { ko: '플랫폼 관리자', en: 'Platform Admin' },
    subtitle: { ko: '온톨로지 기반 부킹 에이전틱AI 플랫폼', en: 'Ontology-based Booking Agentic AI Platform' },
    toggle: { ko: '메뉴 접기/펼치기', en: 'Toggle Sidebar' }
  };

  const menuItems = [
    { id: 'home', label: translations.home[lang], icon: Home },
    { id: 'dashboard', label: translations.dashboard[lang], icon: LayoutDashboard },
    { id: 'ontology', label: translations.ontology[lang], icon: Network },
    { id: 'booking', label: translations.booking[lang], icon: LineChart },
    { id: 'scenarios', label: translations.scenarios[lang], icon: Briefcase }, // New Item
    { id: 'risk', label: translations.risk[lang], icon: AlertTriangle },
    { id: 'inventory', label: translations.inventory[lang], icon: Package },
    { id: 'market', label: translations.market[lang], icon: Ship },
  ];

  return (
    <div 
      className={`bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50 transition-all duration-300 ease-in-out border-r border-slate-800 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Header */}
      <div className={`p-6 flex items-center ${isOpen ? 'justify-start gap-3' : 'justify-center'} border-b border-slate-800 h-20`}>
        <div 
          className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          K
        </div>
        {isOpen && (
          <div className="animate-fade-in overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">KMTC</h1>
            <p className="text-[10px] text-blue-200/70 uppercase tracking-wider mt-1">{translations.subtitle[lang]}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!isOpen ? item.label : ''}
              className={`w-full flex items-center ${isOpen ? 'px-4' : 'justify-center px-0'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              
              {isOpen && (
                <span className="ml-3 animate-fade-in whitespace-nowrap overflow-hidden">{item.label}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl border border-slate-700">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="px-3 pb-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
          title={translations.toggle[lang]}
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-slate-800 cursor-pointer flex-shrink-0">
            US
          </div>
          {isOpen && (
            <div className="overflow-hidden animate-fade-in">
              <p className="text-sm font-medium truncate text-white">user@kmtc.co.kr</p>
              <p className="text-[10px] text-slate-500 truncate">{translations.role[lang]}</p>
            </div>
          )}
          {isOpen && (
            <Settings className="w-4 h-4 text-slate-600 ml-auto cursor-pointer hover:text-white transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;