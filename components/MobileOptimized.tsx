import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { Language } from '../types';

// Mobile-optimized wrapper component
export const MobileContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile-optimized padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </div>
    </div>
  );
};

// Responsive grid component
export const ResponsiveGrid: React.FC<{ 
  children: React.ReactNode;
  cols?: { mobile: number; tablet: number; desktop: number };
}> = ({ children, cols = { mobile: 1, tablet: 2, desktop: 4 } }) => {
  return (
    <div className={`grid grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} gap-4`}>
      {children}
    </div>
  );
};

// Mobile-friendly card
export const MobileCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

// Touch-friendly button
export const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}> = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      className={`min-h-[44px] px-4 py-2 rounded-lg font-semibold transition active:scale-95 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Device indicator (for testing)
export const DeviceIndicator: React.FC<{ lang: Language }> = ({ lang }) => {
  const [device, setDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 640) setDevice('mobile');
      else if (width < 1024) setDevice('tablet');
      else setDevice('desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const icons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor
  };

  const Icon = icons[device];

  return (
    <div className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-slate-800 text-white rounded-lg shadow-lg flex items-center gap-2 text-xs">
      <Icon className="w-4 h-4" />
      <span className="capitalize">{device}</span>
    </div>
  );
};

// Swipeable component for mobile gestures
export const useSwipe = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

export default {
  MobileContainer,
  ResponsiveGrid,
  MobileCard,
  TouchButton,
  DeviceIndicator,
  useSwipe
};
