import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const SHORTCUTS = {
  OPEN_CHAT: { key: 'k', ctrl: true, description: 'Open AI Chat' },
  REFRESH: { key: 'r', ctrl: true, shift: true, description: 'Refresh Data' },
  TOGGLE_THEME: { key: 'd', ctrl: true, description: 'Toggle Dark Mode' },
  SEARCH: { key: '/', description: 'Focus Search' },
  HOME: { key: 'h', ctrl: true, description: 'Go to Home' },
  BOOKMARKS: { key: 'b', ctrl: true, description: 'Show Bookmarks' }
};
