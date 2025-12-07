import React from 'react';
import { Star, X, Route, BarChart3, FileText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const BookmarksPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { bookmarks, removeBookmark, language } = useApp();

  const t = {
    title: { ko: '즐겨찾기', en: 'Bookmarks' },
    empty: { ko: '저장된 즐겨찾기가 없습니다', en: 'No bookmarks saved' },
    emptyDesc: { ko: '자주 보는 항로나 지표를 즐겨찾기에 추가하세요', en: 'Add frequently viewed routes or metrics to bookmarks' },
    route: { ko: '항로', en: 'Route' },
    kpi: { ko: '지표', en: 'KPI' },
    page: { ko: '페이지', en: 'Page' }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'route': return Route;
      case 'kpi': return BarChart3;
      case 'page': return FileText;
      default: return Star;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.title[language]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">{t.empty[language]}</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{t.emptyDesc[language]}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => {
                const Icon = getIcon(bookmark.type);
                return (
                  <div
                    key={bookmark.id}
                    className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {bookmark.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t[bookmark.type as keyof typeof t]?.[language] || bookmark.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookmarksPanel;
