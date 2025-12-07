import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface Shortcut {
  keys: string[];
  description: { ko: string; en: string };
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'K'], description: { ko: 'AI 챗봇 열기', en: 'Open AI Chat' } },
  { keys: ['Ctrl', 'Shift', 'R'], description: { ko: '데이터 새로고침', en: 'Refresh Data' } },
  { keys: ['Ctrl', 'D'], description: { ko: '다크모드 전환', en: 'Toggle Dark Mode' } },
  { keys: ['Ctrl', 'B'], description: { ko: '즐겨찾기 보기', en: 'Show Bookmarks' } },
  { keys: ['Ctrl', 'H'], description: { ko: '홈으로 이동', en: 'Go to Home' } },
  { keys: ['?'], description: { ko: '단축키 도움말', en: 'Show Shortcuts' } }
];

const KeyboardShortcutsHelp: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { language } = useApp();

  const t = {
    title: { ko: '키보드 단축키', en: 'Keyboard Shortcuts' },
    subtitle: { ko: '빠른 작업을 위한 단축키', en: 'Shortcuts for quick actions' }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.title[language]}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle[language]}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {shortcut.description[language]}
                </span>
                <div className="flex gap-1">
                  {shortcut.keys.map((key, i) => (
                    <React.Fragment key={i}>
                      <kbd className="px-2 py-1 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-xs font-mono text-slate-700 dark:text-slate-200 shadow-sm">
                        {key}
                      </kbd>
                      {i < shortcut.keys.length - 1 && (
                        <span className="text-slate-400 mx-1">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsHelp;
