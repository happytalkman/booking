import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Theme } from '../types';

interface Bookmark {
  id: string;
  type: 'route' | 'kpi' | 'page';
  name: string;
  data: any;
  createdAt: Date;
}

interface AppContextType {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  
  // Refresh trigger
  refreshTrigger: number;
  triggerRefresh: () => void;
  
  // Chat visibility
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('kmtc-theme');
    return (saved as Theme) || 'system';
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kmtc-language');
    return (saved as Language) || 'ko';
  });
  
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('kmtc-bookmarks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('kmtc-theme', theme);
  }, [theme]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('kmtc-language', language);
  }, [language]);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('kmtc-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        bookmarks,
        addBookmark,
        removeBookmark,
        refreshTrigger,
        triggerRefresh,
        isChatOpen,
        setIsChatOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
