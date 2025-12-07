import React, { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, ArrowUp, Home as HomeIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import KnowledgeGraph from './pages/KnowledgeGraph';
import BookingAnalysis from './pages/BookingAnalysis';
import RiskAnalysis from './pages/RiskAnalysis';
import MarketIntel from './pages/MarketIntel';
import Scenarios from './pages/Scenarios';
import AIChatAssistant from './components/AIChatAssistant'; // Import Chatbot
import { Language, Theme } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState<Language>('ko');
  const [theme, setTheme] = useState<Theme>('system');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const [showScrollTop, setShowScrollTop] = useState(false); // Scroll to top state

  // Handle Theme Change
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (targetTheme: 'light' | 'dark') => {
      if (targetTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Handle Scroll to Top Visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home lang={language} />;
      case 'dashboard': return <Dashboard lang={language} />;
      case 'ontology': return <KnowledgeGraph lang={language} />;
      case 'booking': return <BookingAnalysis lang={language} />;
      case 'risk': return <RiskAnalysis lang={language} />;
      case 'inventory': return <Inventory lang={language} />;
      case 'market': return <MarketIntel lang={language} />;
      case 'scenarios': return <Scenarios lang={language} />; // New Route
      default: return <Home lang={language} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-inter">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={language} 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Main Content Area */}
      <main 
        className={`flex-1 p-6 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="max-w-[1600px] mx-auto space-y-6">
           {/* Global Header / Top Bar */}
           <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-4 z-40 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
              
              {/* Left: Breadcrumb / Current Page Title */}
              <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setActiveTab('home')}
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
                    title="Go Home"
                 >
                    <HomeIcon className="w-5 h-5" />
                 </button>
                 <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                 <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg capitalize">
                    {activeTab === 'scenarios' ? (language === 'ko' ? '실무 시나리오' : 'Scenarios') : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                 </h2>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-3">
                  {/* Language Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                     <button 
                       onClick={() => setLanguage('ko')}
                       className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'ko' ? 'bg-white dark:bg-slate-600 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                     >
                       한글
                     </button>
                     <button 
                       onClick={() => setLanguage('en')}
                       className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                     >
                       ENG
                     </button>
                  </div>

                  {/* Theme Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                     <button 
                       onClick={() => setTheme('light')}
                       className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       title="Light Mode"
                     >
                       <Sun className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => setTheme('system')}
                       className={`p-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       title="System Mode"
                     >
                       <Monitor className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => setTheme('dark')}
                       className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-slate-600 text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       title="Dark Mode"
                     >
                       <Moon className="w-4 h-4" />
                     </button>
                  </div>
              </div>
           </div>

           {/* Page Content */}
           <div className="min-h-[calc(100vh-140px)]">
              {renderContent()}
           </div>
        </div>
      </main>

      {/* Global AI Chat Assistant - Render everywhere EXCEPT on Risk Analysis page where it is handled locally */}
      {activeTab !== 'risk' && <AIChatAssistant currentContext={activeTab} lang={language} />}

      {/* Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-24 p-3 bg-slate-800 dark:bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-300 z-40 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default App;